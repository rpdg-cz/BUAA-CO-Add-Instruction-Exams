'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const store = require('../lib/exercises');
const readme = require('../lib/readme');
const { createServer } = require('../server');

const ID = 'P5-P6_中文加指令_2023_blog';
const STATEMENT = '# 中文加指令：分支与延迟槽\n\n> 项目：P5-P6 ｜ 年份：2023 ｜ 类型：加指令\n> 来源：[中文作者](https://example.invalid/作者/指令?year=2023)\n> 题目 ID：12345 ｜ 来源 PieId：67890\n\n完整题面，保留标点与换行。\n\n[中文题解](中文题解.md)\n';

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), '博客纳管 中文 '));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  return root;
}

function snapshot(directory) {
  return Object.fromEntries(fs.readdirSync(directory).sort().map(name => {
    const file = path.join(directory, name);
    const stat = fs.lstatSync(file);
    return [name, stat.isSymbolicLink() ? { link: fs.readlinkSync(file) } : stat.isDirectory() ? snapshot(file) : fs.readFileSync(file).toString('hex')];
  }));
}

function unchanged(root, action, status = 400) {
  const before = snapshot(root);
  assert.throws(action, error => error instanceof store.AppError && error.status === status);
  assert.deepEqual(snapshot(root), before);
}

test('Pre、P0–P7 与 P5-P6 阶段可排序，博客来源不会伪造课程题号', t => {
  const root = fixture(t);
  const stages = ['Pre', 'P0', 'P1', 'P2', 'P3', 'P4', 'P5', 'P5-P6', 'P6', 'P7'];
  for (const stage of [...stages].reverse()) {
    const id = `${stage}_阶段_2023_blog`;
    const result = store.createExercise(root, { id, statement: '# 阶段\n' });
    assert.equal(result.stage, stage);
    assert.equal(result.source.year, '2023');
    assert.equal(result.source.kind, 'blog');
  }
  assert.deepEqual(store.listExercises(root).map(item => item.stage), ['Pre', 'P0', 'P1', 'P2', 'P3', 'P4', 'P5-P6', 'P5', 'P6', 'P7']);
  const result = store.createExercise(root, { id: ID, statement: STATEMENT });
  assert.deepEqual(result.source, {
    kind: 'blog', provenance: 'recollection', project: 'P5-P6', year: '2023', type: '加指令', author: '中文作者',
    url: 'https://example.invalid/作者/指令?year=2023', problemId: null, pieId: null,
  });
  const originalLink = store.createExercise(root, { id: 'Pre_来源_2022_blog', statement: '# 来源\n原始链接：https://example.invalid/original\n题目 ID：99\n来源 PieId：88\n' });
  assert.equal(originalLink.source.url, 'https://example.invalid/original');
  const proposal = store.createExercise(root, {
    id: 'P7_自拟资料_2024_blog', status: 'supplemented',
    statement: '# 资料\n\n> 类型：博主自拟设想（非考题记录） ｜ 来源：[作者](https://example.invalid/proposal)\n',
  });
  assert.equal(proposal.source.provenance, 'proposal');
  assert.equal(proposal.source.problemId, null);
  assert.equal(originalLink.source.author, null);
  assert.equal(originalLink.source.problemId, null);
  const course = store.createExercise(root, { id: 'P4_course', statement: '# 课程\n题目 ID：12345\n来源 PieId：67890\n' });
  assert.equal(course.source.kind, 'course');
  assert.equal(course.source.problemId, 12345);
  assert.equal(course.source.pieId, 67890);
  assert.match(course.source.url, /\?ProblemId=12345&PieId=67890$/);
});

test('中文博客及题解完整 CRUD，纯题面编辑和双向移档不会产生空脚本', t => {
  const root = fixture(t);
  const created = store.createExercise(root, { id: ID, statement: STATEMENT });
  assert.equal(created.hasScript, false);
  assert.equal(created.scriptFile, null);
  assert.equal(created.relativePath, ID);
  assert.deepEqual(fs.readdirSync(path.join(root, ID)), [`${ID}.md`]);
  assert.equal(store.readExercise(root, ID).statement, STATEMENT);
  store.saveAttachment(root, ID, '中文题解.md', Buffer.from('# 题解\n\n完整中文推导。\n'));
  assert.equal(fs.readFileSync(store.readAttachment(root, ID, '中文题解.md'), 'utf8'), '# 题解\n\n完整中文推导。\n');
  store.saveAttachment(root, ID, '中文题解.md', Buffer.from('# 修订题解\n'));
  assert.equal(fs.readFileSync(store.readAttachment(root, ID, '中文题解.md'), 'utf8'), '# 修订题解\n');
  for (const status of ['supplemented', 'complete', 'supplemented']) {
    const statement = `${STATEMENT}\n状态：${status}\n`;
    const result = store.updateExercise(root, ID, { statement, status });
    const relativePath = status === 'supplemented' ? `supplemented/${ID}` : ID;
    assert.equal(result.status, status);
    assert.equal(result.relativePath, relativePath);
    assert.equal(result.hasScript, false);
    assert.equal(result.scriptFile, null);
    assert.deepEqual(fs.readdirSync(path.join(root, relativePath)).sort(), [`${ID}.md`, '中文题解.md'].sort());
    assert.equal(store.readExercise(root, ID).statement, statement);
    assert.equal(fs.existsSync(path.join(root, status === 'supplemented' ? ID : `supplemented/${ID}`)), false);
    assert.equal(fs.readFileSync(store.readAttachment(root, ID, '中文题解.md'), 'utf8'), '# 修订题解\n');
  }
  store.deleteAttachment(root, ID, '中文题解.md');
  assert.deepEqual(store.readExercise(root, ID).attachments, []);
  const deleted = store.deleteExercise(root, ID);
  assert.equal(deleted.relativePath, `supplemented/${ID}`);
  assert.equal(fs.existsSync(path.join(root, 'supplemented', ID)), false);
  assert.deepEqual(store.listExercises(root), []);
});

test('纯题面默认创建、补全分类创建及无脚本更新均不造 instruction.ts', t => {
  const root = fixture(t);
  for (const status of ['complete', 'supplemented']) {
    const id = `P0_无脚本_${status}_blog`;
    const created = store.createExercise(root, { id, status });
    assert.equal(created.hasScript, false);
    assert.equal(created.scriptName, null);
    assert.equal(created.scriptLanguage, null);
    assert.equal(created.relativePath, status === 'supplemented' ? `supplemented/${id}` : id);
    assert.doesNotMatch(store.readExercise(root, id).statement, /instruction\.ts|脚本文件/);
    store.updateExercise(root, id, { statement: '# 仅题面修订\n' });
    assert.deepEqual(fs.readdirSync(path.join(root, created.relativePath)), [`${id}.md`]);
    for (const payload of [{ script: '' }, { scriptLanguage: 'ts' }, { scriptName: 'instruction' }]) {
      unchanged(root, () => store.updateExercise(root, id, { statement: '# 不应落盘\n', status: status === 'complete' ? 'supplemented' : 'complete', ...payload }));
    }
  }
});

test('非法状态、越界路径和重复 ID 在任何文件落盘前拒绝', t => {
  const root = fixture(t);
  store.createExercise(root, { id: ID, statement: STATEMENT });
  for (const status of ['', 'archived', 'incomplete', 'SUPPLEMENTED', '../supplemented', null]) {
    unchanged(root, () => store.createExercise(root, { id: 'P0_不应创建_blog', status, statement: '# 不应落盘\n' }));
    unchanged(root, () => store.updateExercise(root, ID, { status, statement: '# 不应落盘\n' }));
  }
  for (const id of ['../外部', 'supplemented/题目', 'supplemented\\题目', '..', 'incomplete', 'supplemented', 'COM¹', 'COM².txt', 'com³', 'LPT¹', 'LPT².md', 'lpt³']) {
    unchanged(root, () => store.createExercise(root, { id, status: 'supplemented', statement: '# 不应落盘\n' }));
    unchanged(root, () => store.updateExercise(root, id, { statement: '# 不应落盘\n' }));
  }
  for (const name of ['../题解.md', '目录/题解.md', '目录\\题解.md', 'COM¹', 'COM².txt', 'com³', 'LPT¹', 'LPT².md', 'lpt³']) {
    unchanged(root, () => store.saveAttachment(root, ID, name, Buffer.from('不应落盘')));
  }
  unchanged(root, () => store.createExercise(root, { id: ID, status: 'supplemented', statement: '# 重复\n' }), 409);
  fs.mkdirSync(path.join(root, 'supplemented', ID), { recursive: true });
  fs.writeFileSync(path.join(root, 'supplemented', ID, `${ID}.md`), '# 重复补全\n');
  for (const action of [
    () => store.listExercises(root), () => store.readExercise(root, ID),
    () => store.createExercise(root, { id: ID, statement: '# 不应落盘\n' }),
    () => store.updateExercise(root, ID, { status: 'supplemented', statement: '# 不应落盘\n' }),
    () => store.deleteExercise(root, ID),
    () => store.saveAttachment(root, ID, '中文题解.md', Buffer.from('不应落盘')),
  ]) unchanged(root, action, 409);
});

test('旧 incomplete 容器保持保留名，不被当作题目或扫描其子目录', t => {
  const root = fixture(t);
  const legacy = path.join(root, 'incomplete');
  fs.mkdirSync(path.join(legacy, 'P5_旧记录_blog'), { recursive: true });
  fs.writeFileSync(path.join(legacy, 'incomplete.md'), '# 旧容器不能成为题目\n');
  fs.writeFileSync(path.join(legacy, 'P5_旧记录_blog', 'P5_旧记录_blog.md'), '# 旧记录\n');
  store.createExercise(root, { id: ID, status: 'supplemented', statement: STATEMENT });
  assert.deepEqual(store.listExercises(root).map(row => row.id), [ID]);
  const before = snapshot(root);
  for (const id of ['incomplete', 'supplemented']) {
    for (const action of [
      () => store.readExercise(root, id),
      () => store.createExercise(root, { id, statement: '# 不能创建\n' }),
      () => store.updateExercise(root, id, { statement: '# 不能覆盖\n' }),
      () => store.deleteExercise(root, id),
      () => store.readAttachment(root, id, 'incomplete.md'),
    ]) assert.throws(action, error => error instanceof store.AppError && error.status === 400);
  }
  assert.deepEqual(snapshot(root), before);
});

test('补全目录 junction 拒绝所有浏览和写操作，外部目录保持原样', t => {
  const root = fixture(t);
  const outside = fixture(t);
  store.createExercise(root, { id: ID, statement: STATEMENT });
  fs.writeFileSync(path.join(outside, '人工文件.md'), '# 外部文件\n');
  fs.symlinkSync(outside, path.join(root, 'supplemented'), process.platform === 'win32' ? 'junction' : 'dir');
  const before = snapshot(outside);
  for (const action of [
    () => store.listExercises(root), () => store.readExercise(root, ID),
    () => store.createExercise(root, { id: 'Pre_不应创建_blog', status: 'supplemented' }),
    () => store.updateExercise(root, ID, { status: 'supplemented', statement: '# 不应落盘\n' }),
    () => store.deleteExercise(root, ID),
    () => store.saveAttachment(root, ID, '中文题解.md', Buffer.from('不应落盘')),
  ]) unchanged(root, action);
  assert.deepEqual(snapshot(outside), before);
});

test('README 新表格纳入全部补全题的真实路径和状态，并完整保留人工尾段', t => {
  const root = fixture(t);
  const suffix = '\n\n## 人工补充\n\n保留中文说明与空行。\n\n| 人工 | 表格 |\n| --- | --- |\n| 保留 | 内容 |\n';
  fs.writeFileSync(path.join(root, 'README.md'), `# 题库\n\n## 题目索引\n\n| 练习 | 阶段 | TS 脚本 | 原始附件 |\n| --- | --- | --- | --- |${suffix}`);
  const supplemented = ['Pre_练习_2021_blog', 'P0_电路_2022_blog', ID];
  for (const id of supplemented) {
    store.createExercise(root, { id, status: 'supplemented', statement: '# 补全题\n' });
    store.saveAttachment(root, id, '中文题解.md', Buffer.from('# 题解\n'));
  }
  store.createExercise(root, { id: 'P7_完整', scriptName: 'demo', scriptLanguage: 'js', statement: '# 完整课程题\n' });
  const result = readme.syncReadme(root, store.listExercises(root));
  assert.ok(result.content.includes(readme.TABLE_HEADER));
  assert.ok(result.content.endsWith(suffix));
  assert.deepEqual(new Set(result.added), new Set([...supplemented, 'P7_完整']));
  for (const id of supplemented) {
    const row = result.content.split('\n').find(line => line.startsWith(`| [${id}]`));
    assert.ok(row, id);
    assert.ok(row.includes(`(${`supplemented/${id}/${id}.md`})`), row);
    assert.ok(row.includes(`(supplemented/${id}/中文题解.md)`), row);
    assert.ok(row.includes('| 残题补全 | 博客整理 | 无 |'), row);
  }
  assert.ok(result.content.includes('[demo.js](P7_完整/demo.js)'));
  assert.ok(result.content.includes('| P7 | 行为完整 | 课程题库 |'));
  assert.equal(readme.syncReadme(root, store.listExercises(root)).changed, false);
});

function request(base, pathname, { method = 'GET', body, headers = {} } = {}) {
  return new Promise((resolve, reject) => {
    const requestHeaders = { Connection: 'close', ...headers };
    if (body !== undefined) requestHeaders['Content-Length'] = Buffer.byteLength(body);
    const req = http.request(`${base}${pathname}`, { method, headers: requestHeaders }, res => {
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('error', reject);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(chunks).toString('utf8') }));
    });
    req.on('error', reject);
    req.end(body);
  });
}

test('真实博客题库的每份题面及题解均可通过管理 HTTP 读取，包含补全分类与中文路径', async () => {
  const root = path.resolve(__dirname, '../../..');
  const expected = [];
  for (const parent of [root, path.join(root, 'supplemented')]) {
    if (!fs.existsSync(parent)) continue;
    for (const entry of fs.readdirSync(parent, { withFileTypes: true })) {
      if (entry.isDirectory() && entry.name.endsWith('_blog')) expected.push({
        id: entry.name, directory: path.join(parent, entry.name),
        status: parent === root ? 'complete' : 'supplemented',
      });
    }
  }
  assert.ok(expected.length > 0);
  const server = createServer({ repoRoot: root, quiet: true });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    const list = await request(base, '/api/exercises');
    assert.equal(list.status, 200, list.body);
    const blogs = JSON.parse(list.body).exercises.filter(row => row.source.kind === 'blog');
    assert.deepEqual(new Set(blogs.map(row => row.id)), new Set(expected.map(row => row.id)));
    for (let index = 0; index < expected.length; index += 6) {
      await Promise.all(expected.slice(index, index + 6).map(async item => {
        const route = `/api/exercises/${encodeURIComponent(item.id)}`;
        const response = await request(base, route);
        assert.equal(response.status, 200, item.id);
        const detail = JSON.parse(response.body).exercise;
        assert.equal(detail.status, item.status, item.id);
        assert.equal(detail.statement, fs.readFileSync(path.join(item.directory, `${item.id}.md`), 'utf8'));
        for (const file of fs.readdirSync(item.directory).filter(name => name.endsWith('_题解.md'))) {
          const solution = await request(base, `${route}/attachments/${encodeURIComponent(file)}`);
          assert.equal(solution.status, 200, `${item.id}/${file}`);
          assert.equal(solution.body, fs.readFileSync(path.join(item.directory, file), 'utf8'));
        }
      }));
    }
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
});

test('同源 HTTP 保留完整中文题面与题解，支持创建、上传、下载、移档和删除', async t => {
  const root = fixture(t);
  const server = createServer({ repoRoot: root, quiet: true, adminToken: '' });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const headers = { 'X-Requested-With': 'exercise-web', Origin: base, 'Sec-Fetch-Site': 'same-origin' };
  const json = { ...headers, 'Content-Type': 'application/json; charset=utf-8' };
  const route = `/api/exercises/${encodeURIComponent(ID)}`;
  const attachment = `${route}/attachments/${encodeURIComponent('中文题解.md')}`;
  try {
    const create = await request(base, '/api/exercises', { method: 'POST', headers: json, body: JSON.stringify({ id: ID, statement: STATEMENT }) });
    assert.equal(create.status, 201, create.body);
    assert.equal(JSON.parse(create.body).exercise.hasScript, false);
    const detail = JSON.parse((await request(base, route)).body).exercise;
    assert.equal(detail.statement, STATEMENT);
    assert.equal(detail.source.author, '中文作者');
    const solution = '# 中文题解\n\n第一步：分析流水线。\n第二步：处理冒险。\n';
    const upload = await request(base, attachment, { method: 'PUT', headers, body: solution });
    assert.equal(upload.status, 200, upload.body);
    let download = await request(base, attachment);
    assert.equal(download.status, 200);
    assert.equal(download.body, solution);
    assert.ok(download.headers['content-disposition'].includes(encodeURIComponent('中文题解.md')));
    assert.ok(download.headers['content-disposition'].includes(`filename*=UTF-8''${encodeURIComponent('中文题解.md')}`));
    const html = JSON.parse((await request(base, route)).body).exercise.html;
    assert.ok(html.includes(attachment), html);
    for (const status of ['supplemented', 'complete', 'supplemented']) {
      const statement = `${STATEMENT}\nHTTP 修订：${status}\n`;
      const update = await request(base, route, { method: 'PUT', headers: json, body: JSON.stringify({ status, statement }) });
      assert.equal(update.status, 200, update.body);
      const meta = JSON.parse(update.body).exercise;
      assert.equal(meta.relativePath, status === 'supplemented' ? `supplemented/${ID}` : ID);
      assert.equal(meta.hasScript, false);
      assert.equal(JSON.parse((await request(base, route)).body).exercise.statement, statement);
      download = await request(base, attachment);
      assert.equal(download.status, 200, download.body);
      assert.equal(download.body, solution);
    }
    const replace = await request(base, attachment, { method: 'PUT', headers, body: '# 中文题解修订\n' });
    assert.equal(replace.status, 200, replace.body);
    assert.equal((await request(base, attachment)).body, '# 中文题解修订\n');
    assert.equal((await request(base, '/api/readme', { method: 'POST', headers })).status, 200);
    assert.ok(fs.readFileSync(path.join(root, 'README.md'), 'utf8').includes(`(supplemented/${ID}/中文题解.md)`));
    const remove = await request(base, attachment, { method: 'DELETE', headers });
    assert.equal(remove.status, 200, remove.body);
    assert.equal((await request(base, attachment)).status, 404);
    assert.equal((await request(base, route, { method: 'DELETE', headers })).status, 200);
    assert.equal((await request(base, route)).status, 404);
    assert.deepEqual(JSON.parse((await request(base, '/api/exercises')).body).exercises, []);
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
});
