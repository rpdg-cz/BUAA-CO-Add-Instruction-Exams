'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const store = require('../lib/exercises');
const { SIDECAR_NAME, readExerciseSidecar } = require('../lib/exercise-sidecar');
const { createServer } = require('../server');

const ID = 'P5_来源回归_2024_blog';
const STATEMENT = '# 来源回归\n\n## 题目描述\n\n令目标寄存器加一。\n';
const SCRIPT = 'export default { mnemonic: "fixture" };\n';
const EDITORIAL = '仅维护者可见的改写依据，不应进入题面或 HTTP 响应';
const SOURCE = {
  kind: 'blog', provenance: 'proposal', project: 'P5-P6', year: '2021',
  type: '博主自拟', author: '中文 作者', url: 'https://example.org/blog/source?year=2021#instruction',
  problemId: null, pieId: null,
};

function fixture(t, { sidecar = true, statement = STATEMENT } = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), '题库 sidecar 回归 '));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const dir = path.join(root, ID);
  fs.mkdirSync(dir);
  fs.writeFileSync(path.join(dir, `${ID}.md`), statement);
  fs.writeFileSync(path.join(dir, 'fixture.js'), SCRIPT);
  fs.writeFileSync(path.join(dir, '题解.md'), '# 题解\n');
  if (sidecar) writeMetadata(dir);
  return { root, dir, file: path.join(dir, SIDECAR_NAME) };
}

function metadata(source = SOURCE) {
  return { version: 1, source, editorial: { notes: EDITORIAL, previousStatement: '# 旧题面' } };
}

function writeMetadata(dir, source = SOURCE) {
  fs.writeFileSync(path.join(dir, SIDECAR_NAME), `${JSON.stringify(metadata(source), null, 2)}\n`);
}

function assertPrivate(detail) {
  assert.equal(Object.hasOwn(detail, 'editorial'), false);
  assert.equal(Object.hasOwn(detail.source, 'editorial'), false);
  assert.doesNotMatch(JSON.stringify(detail), new RegExp(EDITORIAL));
  assert.equal(detail.files.some(file => file.name === SIDECAR_NAME), false);
  assert.equal(detail.attachments.some(file => file.name === SIDECAR_NAME), false);
  assert.notEqual(detail.statementFile, SIDECAR_NAME);
  assert.notEqual(detail.scriptFile, SIDECAR_NAME);
}

function request(base, pathname) {
  return new Promise((resolve, reject) => {
    const req = http.get(`${base}${pathname}`, { headers: { Connection: 'close' } }, (res) => {
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('error', reject);
      res.on('end', () => resolve({ status: res.statusCode, body: Buffer.concat(chunks).toString('utf8') }));
    });
    req.on('error', reject);
  });
}

test('干净题面从隐藏 sidecar 读取作者、链接、年份及类型，维护记录不参与题目文件', (t) => {
  const { root, dir } = fixture(t);
  const detail = store.readExercise(root, ID);
  assert.deepEqual(detail.source, SOURCE);
  assert.equal(detail.statement, STATEMENT);
  assert.equal(detail.script, SCRIPT);
  assert.equal(detail.metadataDiagnostic, undefined);
  assert.deepEqual(detail.files.map(file => file.name).sort(), [`${ID}.md`, 'fixture.js', '题解.md'].sort());
  assert.deepEqual(detail.attachments.map(file => file.name), ['题解.md']);
  assert.equal(detail.size, detail.files.reduce((sum, file) => sum + fs.statSync(path.join(dir, file.name)).size, 0));
  assertPrivate(detail);
  const listed = store.listExercises(root);
  assert.equal(listed.length, 1);
  assert.deepEqual(listed[0].source, SOURCE);
  assertPrivate(listed[0]);
  for (const action of [
    () => store.readAttachment(root, ID, SIDECAR_NAME),
    () => store.saveAttachment(root, ID, SIDECAR_NAME, Buffer.from('replacement')),
    () => store.deleteAttachment(root, ID, SIDECAR_NAME),
  ]) assert.throws(action, store.AppError);
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(dir, SIDECAR_NAME), 'utf8')), metadata());
});

test('真实 HTTP 列表与详情 DTO 不泄露 editorial，隐藏元数据无法作为附件下载', async (t) => {
  const { root } = fixture(t);
  const server = createServer({ repoRoot: root, quiet: true, adminToken: '' });
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  try {
    const base = `http://127.0.0.1:${server.address().port}`;
    for (const pathname of ['/api/exercises', `/api/exercises/${encodeURIComponent(ID)}`]) {
      const response = await request(base, pathname);
      assert.equal(response.status, 200, response.body);
      assert.doesNotMatch(response.body, /editorial|仅维护者可见|previousStatement/);
      const body = JSON.parse(response.body);
      const detail = body.exercise || body.exercises[0];
      assert.deepEqual(detail.source, SOURCE);
      assertPrivate(detail);
    }
    const response = await request(base, `/api/exercises/${encodeURIComponent(ID)}/attachments/${SIDECAR_NAME}`);
    assert.equal(response.status, 400, response.body);
    assert.doesNotMatch(response.body, /仅维护者可见/);
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
});

test('题面和脚本编辑、状态迁移保留同目录 sidecar，删除重建不会恢复旧来源', (t) => {
  const { root, dir, file } = fixture(t);
  const originalMetadata = fs.readFileSync(file, 'utf8');
  store.readExercise(root, ID); // Prime the old location cache before moving.
  const edited = '# 编辑后的题面\n';
  let detail = store.updateExercise(root, ID, {
    statement: edited, scriptName: 'renamed', script: '// 已编辑\n', status: 'incomplete',
  });
  const archived = path.join(root, 'incomplete', ID);
  assert.equal(fs.existsSync(dir), false);
  assert.equal(detail.status, 'incomplete');
  assert.equal(detail.relativePath, `incomplete/${ID}`);
  assert.equal(fs.readFileSync(path.join(archived, SIDECAR_NAME), 'utf8'), originalMetadata);
  assert.deepEqual(detail.source, SOURCE);
  assert.equal(store.readExercise(root, ID).statement, edited);
  assert.equal(store.readExercise(root, ID).script, '// 已编辑\n');
  const movedSource = { ...SOURCE, author: '迁移后作者', year: '2022' };
  writeMetadata(archived, movedSource);
  detail = store.updateExercise(root, ID, { status: 'complete' });
  assert.equal(fs.existsSync(archived), false);
  assert.deepEqual(detail.source, movedSource);
  assert.equal(fs.existsSync(file), true);
  store.deleteExercise(root, ID);
  assert.equal(fs.existsSync(dir), false);
  assert.deepEqual(store.listExercises(root), []);
  detail = store.createExercise(root, { id: ID, statement: STATEMENT });
  assert.equal(fs.existsSync(file), false);
  assert.equal(detail.source.author, null);
  assert.equal(detail.source.url, null);
  assert.equal(detail.source.year, '2024');
  assert.equal(detail.metadataDiagnostic, undefined);
});

test('没有 sidecar 的旧题面仍解析博客及课程来源，移除 sidecar 同时清理缓存', (t) => {
  const inline = '# 旧题\n\n> 项目：P5 ｜ 年份：2023 ｜ 类型：往届回忆\n\n来源：[旧作者](https://example.org/legacy)\n';
  const { root, dir, file } = fixture(t, { statement: inline });
  assert.deepEqual(store.readExercise(root, ID).source, SOURCE);
  fs.unlinkSync(file);
  const legacy = store.readExercise(root, ID);
  assert.equal(legacy.source.author, '旧作者');
  assert.equal(legacy.source.url, 'https://example.org/legacy');
  assert.equal(legacy.source.year, '2023');
  assert.equal(legacy.source.type, '往届回忆');
  assert.equal(legacy.source.provenance, 'recollection');
  fs.writeFileSync(file, '{');
  assert.equal(store.readExercise(root, ID).source.author, '旧作者');
  assert.match(store.readExercise(root, ID).metadataDiagnostic, /JSON/);
  fs.unlinkSync(file);
  assert.deepEqual(readExerciseSidecar(dir, 'blog'), {});
  const course = store.createExercise(root, {
    id: 'P4_L1_legacy', statement: '# 课程题\n\n> 项目：P4 ｜ 题目 ID：123 ｜ 来源 PieId：456 ｜ 类型：课上测试\n',
  });
  assert.equal(course.source.kind, 'course');
  assert.equal(course.source.problemId, 123);
  assert.equal(course.source.pieId, 456);
  assert.match(course.source.url, /[?]ProblemId=123&PieId=456$/);
});

test('合法修改使缓存失效，损坏 JSON 和错误结构保留最近有效来源且修复后清除诊断', (t) => {
  const { root, dir, file } = fixture(t);
  assert.deepEqual(store.readExercise(root, ID).source, SOURCE);
  const changed = { ...SOURCE, author: '更新后的来源作者', url: 'https://example.org/new-longer-url' };
  writeMetadata(dir, changed);
  assert.deepEqual(store.readExercise(root, ID).source, changed);
  for (const invalid of ['{"version":1,"source":', JSON.stringify({ version: 2, source: SOURCE }), JSON.stringify({ version: 1, source: [] })]) {
    fs.writeFileSync(file, invalid);
    const list = store.listExercises(root);
    assert.equal(list.length, 1);
    assert.deepEqual(list[0].source, changed);
    assert.match(list[0].metadataDiagnostic, /[.]exercise[.]json：/);
    assertPrivate(list[0]);
    assert.deepEqual(store.readExercise(root, ID).source, changed);
  }
  const repaired = { ...SOURCE, author: '修复后的作者' };
  writeMetadata(dir, repaired);
  assert.deepEqual(store.listExercises(root)[0].source, repaired);
  assert.equal(store.readExercise(root, ID).metadataDiagnostic, undefined);
});

test('首次读取损坏 sidecar 仍保留列表并使用 inline 来源，错误 kind 与危险 URL 不覆盖有效来源', (t) => {
  const { root, dir, file } = fixture(t, { sidecar: false });
  fs.writeFileSync(file, '{');
  let detail = store.listExercises(root)[0];
  assert.equal(detail.id, ID);
  assert.equal(detail.source.author, null);
  assert.equal(detail.source.year, '2024');
  assert.match(detail.metadataDiagnostic, /JSON/);
  writeMetadata(dir);
  assert.deepEqual(store.readExercise(root, ID).source, SOURCE);
  for (const source of [
    { ...SOURCE, kind: 'course' },
    ...['javascript:alert(1)', 'data:text/plain,secret', 'file:///C:/private.txt', '//example.org/no-scheme'].map(url => ({ ...SOURCE, url })),
  ]) {
    writeMetadata(dir, source);
    detail = store.readExercise(root, ID);
    assert.deepEqual(detail.source, SOURCE);
    assert.match(detail.metadataDiagnostic, /source[.](?:kind|url)/);
  }
  writeMetadata(dir);
  assert.equal(store.readExercise(root, ID).metadataDiagnostic, undefined);
});

function assertRejectedWithoutReadOrWrite(t, root, dir, file) {
  const statementFile = path.join(dir, `${ID}.md`);
  const before = fs.readFileSync(statementFile, 'utf8');
  const readFile = fs.readFileSync;
  let metadataReads = 0;
  const mocked = t.mock.method(fs, 'readFileSync', function (target, ...args) {
    if (path.resolve(String(target)) === path.resolve(file)) metadataReads++;
    return readFile.call(this, target, ...args);
  });
  try {
    for (const action of [
      () => readExerciseSidecar(dir, 'blog'), () => store.readExercise(root, ID),
      () => store.listExercises(root), () => store.updateExercise(root, ID, { statement: '# 不可写入\n' }),
      () => store.deleteExercise(root, ID),
    ]) assert.throws(action, error => error instanceof store.AppError && [400, 413].includes(error.status));
    assert.equal(metadataReads, 0, '不应打开被拒绝的 metadata 文件');
  } finally {
    mocked.mock.restore();
  }
  assert.equal(fs.readFileSync(statementFile, 'utf8'), before);
  assert.equal(fs.existsSync(dir), true);
}

test('sidecar 硬链接在读取前拒绝，编辑和删除不触碰外部文件', (t) => {
  const { root, dir, file } = fixture(t, { sidecar: false });
  const outside = path.join(root, 'outside.json');
  const contents = JSON.stringify(metadata());
  fs.writeFileSync(outside, contents);
  fs.linkSync(outside, file);
  assertRejectedWithoutReadOrWrite(t, root, dir, file);
  assert.equal(fs.readFileSync(outside, 'utf8'), contents);
  assert.equal(fs.lstatSync(outside).nlink, 2);
});

test('sidecar 普通及悬空 symlink 均在读取前拒绝，不创建或修改外部目标', (t) => {
  const { root, dir, file } = fixture(t, { sidecar: false });
  const outside = path.join(root, 'outside.json');
  const contents = JSON.stringify(metadata());
  fs.writeFileSync(outside, contents);
  try {
    fs.symlinkSync(outside, file, 'file');
  } catch (error) {
    if (['EPERM', 'EACCES'].includes(error.code)) return t.skip('当前 Windows 权限不允许创建文件 symlink；硬链接用例仍执行');
    throw error;
  }
  assertRejectedWithoutReadOrWrite(t, root, dir, file);
  assert.equal(fs.readFileSync(outside, 'utf8'), contents);
  fs.unlinkSync(file);
  const missing = path.join(root, 'missing.json');
  fs.symlinkSync(missing, file, 'file');
  assertRejectedWithoutReadOrWrite(t, root, dir, file);
  assert.equal(fs.existsSync(missing), false);
});

test('超过 1 MiB 的 sidecar 在打开前拒绝，原题和元数据不变', (t) => {
  const { root, dir, file } = fixture(t);
  store.readExercise(root, ID); // A cached valid source must not bypass the size guard.
  const contents = JSON.stringify({ ...metadata(), editorial: 'x'.repeat(1024 * 1024) });
  fs.writeFileSync(file, contents);
  assertRejectedWithoutReadOrWrite(t, root, dir, file);
  assert.equal(fs.readFileSync(file, 'utf8'), contents);
  writeMetadata(dir);
  assert.deepEqual(store.readExercise(root, ID).source, SOURCE);
  assert.equal(store.readExercise(root, ID).metadataDiagnostic, undefined);
});
