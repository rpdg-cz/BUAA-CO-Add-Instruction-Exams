'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const store = require('../lib/exercises');

const REPO_ROOT = path.resolve(__dirname, '../../..');
const RLB_SOURCE = fs.readFileSync(path.join(REPO_ROOT, 'P4_L1_RLB_2022/rlb.ts'), 'utf8');
// The JS variant retains the actual instruction object and execute function.
const RLB_JS_SOURCE = RLB_SOURCE
  .replace(/^import type .*;\r?\n/m, '')
  .replace('function sx(value: number, width = 16): number', 'function sx(value, width = 16)')
  .replace('function ones(value: number): number', 'function ones(value)')
  .replace('const instruction: CustomInstructionDefinition', 'const instruction');
const ID = 'P4_L1_RLB_2022';

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), '题库 回归-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const dir = path.join(root, ID);
  fs.mkdirSync(dir);
  fs.copyFileSync(path.join(REPO_ROOT, ID, `${ID}.md`), path.join(dir, `${ID}.md`));
  fs.copyFileSync(path.join(REPO_ROOT, ID, 'rlb.ts'), path.join(dir, 'rlb.ts'));
  fs.writeFileSync(path.join(dir, 'rlb.class'), Buffer.from([0xca, 0xfe, 0xba, 0xbe]));
  return { root, dir };
}

function snapshot(dir) {
  return Object.fromEntries(fs.readdirSync(dir).sort().map((name) => {
    const file = path.join(dir, name);
    const stat = fs.lstatSync(file);
    return [name, stat.isFile() ? fs.readFileSync(file).toString('hex') : stat.isSymbolicLink() ? fs.readlinkSync(file) : '<directory>'];
  }));
}

function rejectedWithoutChange(dir, action) {
  const before = snapshot(dir);
  assert.throws(action, (error) => error instanceof store.AppError && error.status >= 400 && error.status < 500);
  assert.deepEqual(snapshot(dir), before);
}

test('真实 rlb 源码按文件名改名：大小写变化及编辑均保留源码语义', (t) => {
  const { root, dir } = fixture(t);
  assert.match(RLB_SOURCE, /"mnemonic": "rlb"/);
  for (const name of ['RLB', 'rlb', 'independent-name']) {
    const result = store.updateExercise(root, ID, { scriptName: name });
    assert.equal(result.scriptFile, `${name}.ts`);
    assert.equal(result.scriptName, name);
    assert.equal(result.scriptLanguage, 'ts');
    assert.equal(store.readExercise(root, ID).script, RLB_SOURCE);
    assert.deepEqual(fs.readdirSync(dir).filter((file) => file.endsWith('.ts')), [`${name}.ts`]);
  }
  const updated = `${RLB_SOURCE}\n// 编辑回归\n`;
  store.updateExercise(root, ID, { scriptName: 'INDEPENDENT-name', script: updated, statement: '# 已编辑\n' });
  assert.equal(store.readExercise(root, ID).script, updated);
  assert.equal(fs.readFileSync(path.join(dir, `${ID}.md`), 'utf8'), '# 已编辑\n');
});

test('P3–P7 新建明确语言；中文和空格根路径可浏览、上传、下载、删除', (t) => {
  const { root } = fixture(t);
  for (const stage of [7, 3, 6, 5]) {
    const id = `P${stage}_L2_demo_2026`;
    const result = store.createExercise(root, { id, scriptName: 'demo', scriptLanguage: stage % 2 ? 'js' : 'ts', script: stage % 2 ? RLB_JS_SOURCE : RLB_SOURCE });
    assert.equal(result.scriptLanguage, stage % 2 ? 'js' : 'ts');
    assert.match(store.readExercise(root, id).statement, new RegExp(`脚本文件：.*demo\\.${result.scriptLanguage}`));
    assert.doesNotMatch(store.readExercise(root, id).statement, /指令名/);
    store.saveAttachment(root, id, 'original.class', Buffer.from([0xca, 0xfe]));
    assert.deepEqual(fs.readFileSync(store.readAttachment(root, id, 'original.class')), Buffer.from([0xca, 0xfe]));
    store.deleteAttachment(root, id, 'original.class');
    assert.equal(store.readExercise(root, id).attachments.length, 0);
  }
  assert.deepEqual(store.listExercises(root).map((item) => item.stage), ['P3', 'P4', 'P5', 'P6', 'P7']);
  store.deleteExercise(root, 'P7_L2_demo_2026');
  assert.equal(fs.existsSync(path.join(root, 'P7_L2_demo_2026')), false);
});

test('JS 和原有扩展名保留，mjs/cjs 仅为附件', (t) => {
  const { root, dir } = fixture(t);
  fs.renameSync(path.join(dir, 'rlb.ts'), path.join(dir, 'rlb.js'));
  fs.writeFileSync(path.join(dir, 'rlb.js'), RLB_JS_SOURCE);
  fs.writeFileSync(path.join(dir, 'a.mjs'), 'export default {};\n');
  fs.writeFileSync(path.join(dir, 'b.cjs'), 'module.exports = {};\n');
  const result = store.updateExercise(root, ID, { scriptName: 'script-file', scriptLanguage: 'js', script: RLB_JS_SOURCE });
  assert.equal(result.scriptFile, 'script-file.js');
  const instruction = new Function(store.readExercise(root, ID).script.replace('export default instruction;', 'return instruction;'))();
  assert.equal(instruction.mnemonic, 'rlb');
  assert.deepEqual(instruction.execute({ readGpr: () => 255 }, { immediate: 3, rs: 1, rt: 2 }), { gprWrites: [{ register: 2, value: 248 }] });
  assert.deepEqual(result.attachments.map((file) => file.name), ['a.mjs', 'b.cjs', 'rlb.class']);
  fs.unlinkSync(path.join(dir, 'script-file.js'));
  assert.equal(store.readExercise(root, ID).hasScript, false);
  store.updateExercise(root, ID, { scriptName: 'new-file', script: RLB_SOURCE });
  assert.equal(store.readExercise(root, ID).scriptFile, 'new-file.ts');
});

test('类型声明文件不是脚本入口，与真实 rlb.ts 同在时仍选择实际脚本', (t) => {
  const { root, dir } = fixture(t);
  fs.writeFileSync(path.join(dir, 'co-instructions.d.ts'), 'declare module "@buaa-co/instructions" {}\n');
  fs.writeFileSync(path.join(dir, 'Z-extra.D.TS'), 'export {};\n');
  fs.writeFileSync(path.join(dir, 'A-upper.TS'), RLB_SOURCE);
  fs.writeFileSync(path.join(dir, 'B-upper.JS'), RLB_JS_SOURCE);
  const detail = store.readExercise(root, ID);
  assert.equal(detail.scriptFile, 'rlb.ts');
  assert.equal(detail.script, RLB_SOURCE);
  assert.deepEqual(detail.attachments.map((file) => file.name), ['A-upper.TS', 'B-upper.JS', 'Z-extra.D.TS', 'co-instructions.d.ts', 'rlb.class']);
  fs.unlinkSync(path.join(dir, 'rlb.ts'));
  assert.equal(store.readExercise(root, ID).hasScript, false);
});

test('请求字段在更新题面前全部校验，非法请求不改变任何原文件', (t) => {
  const { root, dir } = fixture(t);
  for (const invalid of [
    { scriptName: '../escape' }, { scriptName: '' }, { scriptName: 'name.ts' },
    { scriptName: 'CON' }, { scriptName: 'file.' }, { scriptName: 'helper.d' }, { scriptLanguage: 'python' },
    { scriptLanguage: 'js' }, { script: null }, { script: {} }, { statement: 12 },
    { instruction: 'renamed' }, { extra: true },
  ]) {
    rejectedWithoutChange(dir, () => store.updateExercise(root, ID, { statement: '# 不应落盘', ...invalid }));
  }
  for (const payload of [null, [], 'bad']) rejectedWithoutChange(dir, () => store.updateExercise(root, ID, payload));
  for (const invalid of [
    { scriptLanguage: undefined }, { scriptLanguage: 'mjs' }, { scriptName: '../escape' }, { scriptName: 'helper.d' },
    { script: 3 }, { statement: {} }, { instruction: 'rlb' }, { extra: 'field' },
  ]) {
    rejectedWithoutChange(root, () => store.createExercise(root, { id: 'P7_new', scriptName: 'rlb', scriptLanguage: 'ts', ...invalid }));
    assert.equal(fs.existsSync(path.join(root, 'P7_new')), false);
  }
});

test('改名不能覆盖已有文件或目录，失败不改题面', (t) => {
  const { root, dir } = fixture(t);
  fs.writeFileSync(path.join(dir, 'zz.ts'), '// 另一份已有脚本\n');
  fs.mkdirSync(path.join(dir, 'folder.ts'));
  for (const name of ['zz', 'ZZ', 'folder']) {
    rejectedWithoutChange(dir, () => store.updateExercise(root, ID, { scriptName: name, script: RLB_SOURCE, statement: '# 不应落盘' }));
    rejectedWithoutChange(dir, () => store.updateExercise(root, ID, { scriptName: name, statement: '# 不应落盘' }));
  }
});

test('大小写改名时暂存写入或安装失败会恢复原脚本，不丢失内容', (t) => {
  const { root, dir } = fixture(t);
  const before = snapshot(dir);
  const writeFile = fs.writeFileSync;
  const writeMock = t.mock.method(fs, 'writeFileSync', function (file, ...args) {
    if (path.basename(file).startsWith('.exercise-web-')) throw new Error('模拟暂存写入失败');
    return writeFile.call(this, file, ...args);
  });
  assert.throws(() => store.updateExercise(root, ID, { scriptName: 'RLB', script: `${RLB_SOURCE}\n// changed\n` }), /模拟暂存写入失败/);
  writeMock.mock.restore();
  assert.deepEqual(snapshot(dir), before);

  const renameFile = fs.renameSync;
  const renameMock = t.mock.method(fs, 'renameSync', function (source, target) {
    if (path.basename(target) === 'RLB.ts') throw new Error('模拟安装失败');
    return renameFile.call(this, source, target);
  });
  for (const payload of [{ scriptName: 'RLB' }, { scriptName: 'RLB', script: `${RLB_SOURCE}\n// changed\n` }]) {
    assert.throws(() => store.updateExercise(root, ID, payload), /模拟安装失败/);
    assert.deepEqual(snapshot(dir), before);
  }
  renameMock.mock.restore();
});

test('隐藏、保留目录和 Windows 非法名称不进入任何题目读写接口', (t) => {
  const { root } = fixture(t);
  const names = ['tools', 'TOOLS', 'node_modules', 'NODE_MODULES', '.private'];
  for (const name of names) {
    const dir = path.join(root, name);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    fs.writeFileSync(path.join(dir, 'secret.txt'), 'secret');
    for (const action of [
      () => store.readExercise(root, name), () => store.describeDirectory(root, name),
      () => store.createExercise(root, { id: name, scriptName: 'demo', scriptLanguage: 'ts' }),
      () => store.updateExercise(root, name, { statement: '# bad' }), () => store.deleteExercise(root, name),
      () => store.saveAttachment(root, name, 'secret.txt', Buffer.from('changed')),
      () => store.readAttachment(root, name, 'secret.txt'), () => store.deleteAttachment(root, name, 'secret.txt'),
    ]) rejectedWithoutChange(dir, action);
  }
  for (const name of ['../escape', '..', 'CON', 'nul.txt', 'file.']) {
    assert.throws(() => store.readExercise(root, name), store.AppError);
  }
  assert.deepEqual(store.listExercises(root).map((item) => item.id), [ID]);
});

test('附件目标必须是普通文件，路径穿越和大小写冲突均拒绝', (t) => {
  const { root, dir } = fixture(t);
  fs.mkdirSync(path.join(dir, 'folder'));
  for (const name of ['folder', '../escape', 'CON', 'file.', '.hidden']) {
    for (const action of [
      () => store.saveAttachment(root, ID, name, Buffer.from('x')),
      () => store.readAttachment(root, ID, name), () => store.deleteAttachment(root, ID, name),
    ]) rejectedWithoutChange(dir, action);
  }
  rejectedWithoutChange(dir, () => store.saveAttachment(root, ID, 'RLB.CLASS', Buffer.from('changed')));
  rejectedWithoutChange(dir, () => store.saveAttachment(root, ID, 'new.class', 'not a buffer'));
  store.saveAttachment(root, ID, 'rlb.class', Buffer.from('safe replacement'));
  assert.equal(fs.readFileSync(store.readAttachment(root, ID, 'rlb.class'), 'utf8'), 'safe replacement');
});

test('题目 junction 不能用于浏览、编辑、删除或附件接口', (t) => {
  const { root, dir } = fixture(t);
  const linked = 'P7_link';
  fs.symlinkSync(dir, path.join(root, linked), process.platform === 'win32' ? 'junction' : 'dir');
  const before = snapshot(dir);
  for (const action of [
    () => store.readExercise(root, linked), () => store.describeDirectory(root, linked),
    () => store.updateExercise(root, linked, { statement: '# bad' }), () => store.deleteExercise(root, linked),
    () => store.createExercise(root, { id: linked, scriptName: 'demo', scriptLanguage: 'ts' }),
    () => store.saveAttachment(root, linked, 'rlb.class', Buffer.from('bad')),
    () => store.readAttachment(root, linked, 'rlb.class'), () => store.deleteAttachment(root, linked, 'rlb.class'),
  ]) assert.throws(action, store.AppError);
  assert.deepEqual(snapshot(dir), before);
  assert.deepEqual(store.listExercises(root).map((item) => item.id), [ID]);
  assert.throws(() => store.listExercises(path.join(root, linked)), store.AppError);
});

test('附件 junction 与硬链接不能读取、替换或删除', (t) => {
  const { root, dir } = fixture(t);
  fs.symlinkSync(root, path.join(dir, 'outside'), process.platform === 'win32' ? 'junction' : 'dir');
  for (const action of [
    () => store.saveAttachment(root, ID, 'outside', Buffer.from('bad')),
    () => store.readAttachment(root, ID, 'outside'), () => store.deleteAttachment(root, ID, 'outside'),
    () => store.updateExercise(root, ID, { statement: '# bad' }), () => store.deleteExercise(root, ID),
  ]) assert.throws(action, store.AppError);
  fs.unlinkSync(path.join(dir, 'outside'));
  fs.writeFileSync(path.join(root, 'outside.bin'), 'outside');
  fs.linkSync(path.join(root, 'outside.bin'), path.join(dir, 'linked.bin'));
  for (const action of [
    () => store.saveAttachment(root, ID, 'linked.bin', Buffer.from('bad')),
    () => store.readAttachment(root, ID, 'linked.bin'), () => store.deleteAttachment(root, ID, 'linked.bin'),
    () => store.updateExercise(root, ID, { statement: '# bad' }),
  ]) rejectedWithoutChange(dir, action);
  assert.equal(fs.readFileSync(path.join(root, 'outside.bin'), 'utf8'), 'outside');
});

test('普通和悬空文件 symlink 不能读写或作为题面/脚本', (t) => {
  const { root, dir } = fixture(t);
  const outside = path.join(root, 'outside.txt');
  fs.writeFileSync(outside, 'outside');
  try {
    fs.symlinkSync(outside, path.join(dir, 'linked.txt'), 'file');
  } catch (error) {
    if (['EPERM', 'EACCES'].includes(error.code)) return t.skip('当前 Windows 权限不允许创建文件 symlink；junction 和硬链接用例仍执行');
    throw error;
  }
  fs.symlinkSync(path.join(root, 'missing.txt'), path.join(dir, 'dangling.txt'), 'file');
  for (const name of ['linked.txt', 'dangling.txt']) {
    for (const action of [
      () => store.readAttachment(root, ID, name), () => store.saveAttachment(root, ID, name, Buffer.from('bad')),
      () => store.deleteAttachment(root, ID, name), () => store.readExercise(root, ID),
      () => store.updateExercise(root, ID, { statement: '# bad' }), () => store.deleteExercise(root, ID),
    ]) rejectedWithoutChange(dir, action);
  }
  assert.equal(fs.readFileSync(outside, 'utf8'), 'outside');
});
