'use strict';

// Run with: node tools/exercise-web/run-tests.js
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const store = require('../lib/exercises');
const readme = require('../lib/readme');
const { renderMarkdown } = require('../lib/markdown');
const { createServer } = require('../server');

const REPO_ROOT = path.resolve(__dirname, '..', '..', '..');
const fixtures = [];
const scriptSource = (id, name) => fs.readFileSync(path.join(REPO_ROOT, id, `${name}.ts`), 'utf8');
test.after(() => fixtures.forEach(root => fs.rmSync(root, { recursive: true, force: true })));

function makeFixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'exercise-web-'));
  fixtures.push(root);
  fs.writeFileSync(path.join(root, 'README.md'), '# 测试题库\n\n## 题目索引\n\n');

  const rlb = path.join(root, 'P4_L1_RLB_2022');
  fs.mkdirSync(rlb);
  fs.writeFileSync(path.join(rlb, 'P4_L1_RLB_2022.md'), [
    '# P4_L1_RLB_2022',
    '',
    '> 项目：P4 ｜ 题目 ID：1001 ｜ 来源 PieId：1200 ｜ 类型：文件上传',
    '',
    '## 描述',
    '',
    '测试题面。',
    '',
  ].join('\n'));
  fs.writeFileSync(path.join(rlb, 'rlb.ts'), scriptSource('P4_L1_RLB_2022', 'rlb'));
  fs.writeFileSync(path.join(rlb, 'rlb.class'), Buffer.from([0xca, 0xfe, 0xba, 0xbe]));

  const lbget = path.join(root, 'P5_L6_lbget_2022');
  fs.mkdirSync(lbget);
  fs.writeFileSync(path.join(lbget, 'P5_L6_lbget_2022.md'), [
    '# P5_L6_lbget_2022',
    '',
    '> 项目：P5 ｜ 题目 ID：1050 ｜ 来源 PieId：1338 ｜ 类型：文件上传',
    '',
  ].join('\n'));
  fs.writeFileSync(path.join(lbget, 'lbget.ts'), scriptSource('P5_L6_lbget_2022', 'lbget'));

  return root;
}

async function withServer(fn, options = {}) {
  const server = createServer({ quiet: true, ...options });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  const base = `http://127.0.0.1:${port}`;
  try {
    await fn(base);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

test('题目列表按阶段和题号排序，并解析原题链接', () => {
  const root = makeFixture();
  const exercises = store.listExercises(root);
  assert.deepEqual(exercises.map((item) => item.id), ['P4_L1_RLB_2022', 'P5_L6_lbget_2022']);

  const rlb = exercises[0];
  assert.equal(rlb.stage, 'P4');
  assert.equal(rlb.scriptName, 'rlb');
  assert.equal(rlb.source.problemId, 1001);
  assert.equal(rlb.source.pieId, 1200);
  assert.equal(rlb.source.url, 'http://cscore.buaa.edu.cn/#/problem?ProblemId=1001&PieId=1200');
  assert.deepEqual(rlb.attachments.map((file) => file.name), ['rlb.class']);
  assert.equal(exercises[1].source.url, 'http://cscore.buaa.edu.cn/#/problem?ProblemId=1050&PieId=1338');
});

test('新增、修改、删除题目', () => {
  const root = makeFixture();

  const created = store.createExercise(root, {
    id: 'P3_L10_addm_2023',
    scriptName: 'addm',
    scriptLanguage: 'ts',
    statement: '# P3_L10_addm_2023\n\n> 题目 ID：900 ｜ 来源 PieId：910\n',
    script: scriptSource('P3_L10_addm_2023', 'addm'),
  });
  assert.equal(created.id, 'P3_L10_addm_2023');
  assert.equal(created.scriptName, 'addm');
  assert.equal(created.source.problemId, 900);

  const updated = store.updateExercise(root, 'P3_L10_addm_2023', {
    scriptName: 'addm2',
    statement: '# P3_L10_addm_2023\n\n改过的题面\n',
    script: scriptSource('P3_L10_addm_2023', 'addm'),
  });
  assert.equal(updated.scriptName, 'addm2');
  assert.ok(fs.existsSync(path.join(root, 'P3_L10_addm_2023', 'addm2.ts')));
  assert.ok(!fs.existsSync(path.join(root, 'P3_L10_addm_2023', 'addm.ts')));

  store.deleteExercise(root, 'P3_L10_addm_2023');
  assert.ok(!fs.existsSync(path.join(root, 'P3_L10_addm_2023')));
});

test('非法 ID 与路径穿越被拒绝', () => {
  const root = makeFixture();
  assert.throws(() => store.createExercise(root, { id: '../escape', scriptName: 'x', scriptLanguage: 'ts' }), /题目 ID/);
  assert.throws(() => store.readExercise(root, '..'), /题目 ID/);
  assert.throws(() => store.saveAttachment(root, 'P4_L1_RLB_2022', '../x.class', Buffer.from('x')), /文件名/);
});

test('README 索引同步是幂等的', () => {
  const root = makeFixture();
  const first = readme.syncReadme(root, store.listExercises(root));
  assert.equal(first.changed, true);
  assert.match(fs.readFileSync(path.join(root, 'README.md'), 'utf8'), /P4_L1_RLB_2022/);

  const second = readme.syncReadme(root, store.listExercises(root));
  assert.equal(second.changed, false);
});

test('仓库内 README 索引与当前目录一致', () => {
  const preview = readme.previewReadme(REPO_ROOT, store.listExercises(REPO_ROOT));
  assert.equal(preview.changed, false, 'README 索引与目录不一致，请运行 管理模式 → 同步 README 索引');
});

test('Markdown 渲染保留 HTML 表格并处理管道表格', () => {
  const html = renderMarkdown('# 标题\n\n| A | B |\n| --- | --- |\n| 1 | 2 |\n\n<table><tr><td>x</td></tr></table>\n');
  assert.match(html, /<h1>标题<\/h1>/);
  assert.match(html, /<table><thead><tr><th>A<\/th><th>B<\/th><\/tr><\/thead>/);
  assert.match(html, /<table><tr><td>x<\/td><\/tr><\/table>/);
});

test('HTTP 接口覆盖浏览与增删改查', async () => {
  const root = makeFixture();
  await withServer(async (base) => {
    const list = await (await fetch(`${base}/api/exercises`)).json();
    assert.equal(list.exercises.length, 2);

    const detail = await (await fetch(`${base}/api/exercises/P4_L1_RLB_2022`)).json();
    assert.equal(detail.exercise.source.problemId, 1001);
    assert.match(detail.exercise.html, /测试题面/);

    const created = await fetch(`${base}/api/exercises`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'exercise-web' },
      body: JSON.stringify({ id: 'P6_L1_demo_2026', scriptName: 'demo', scriptLanguage: 'ts', statement: '# demo\n', script: scriptSource('P4_L1_RLB_2022', 'rlb') }),
    });
    assert.equal(created.status, 201);

    const upload = await fetch(`${base}/api/exercises/P6_L1_demo_2026/attachments/demo.class`, {
      method: 'PUT',
      headers: { 'X-Requested-With': 'exercise-web' },
      body: Buffer.from([0xca, 0xfe]),
    });
    assert.equal(upload.status, 200);

    const download = await fetch(`${base}/api/exercises/P6_L1_demo_2026/attachments/demo.class`);
    assert.equal(download.status, 200);
    assert.equal(Buffer.from(await download.arrayBuffer()).length, 2);

    const synced = await (await fetch(`${base}/api/readme`, { method: 'POST', headers: { 'X-Requested-With': 'exercise-web' } })).json();
    assert.equal(synced.changed, true);

    const removed = await fetch(`${base}/api/exercises/P6_L1_demo_2026`, { method: 'DELETE', headers: { 'X-Requested-With': 'exercise-web' } });
    assert.equal(removed.status, 200);

    const missing = await fetch(`${base}/api/exercises/P6_L1_demo_2026`);
    assert.equal(missing.status, 404);

    const home = await fetch(`${base}/`);
    assert.equal(home.status, 200);
    assert.match(await home.text(), /加指令练习/);
  }, { repoRoot: root });
});

test('设置管理令牌后写操作需要令牌', async () => {
  const root = makeFixture();
  await withServer(async (base) => {
    const denied = await fetch(`${base}/api/exercises`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'exercise-web' },
      body: JSON.stringify({ id: 'P6_L2_demo_2026', scriptName: 'demo', scriptLanguage: 'ts' }),
    });
    assert.equal(denied.status, 401);

    const allowed = await fetch(`${base}/api/exercises`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Admin-Token': 'secret', 'X-Requested-With': 'exercise-web' },
      body: JSON.stringify({ id: 'P6_L2_demo_2026', scriptName: 'demo', scriptLanguage: 'ts' }),
    });
    assert.equal(allowed.status, 201);
  }, { repoRoot: root, adminToken: 'secret' });
});
