'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { TABLE_HEADER, TABLE_SEPARATOR, composeReadme, syncReadme } = require('../lib/readme');

const exercise = { id: 'P7_L1_demo', stage: 'P7', scriptFile: 'demo.js', attachments: [] };

test('README 同步仅替换索引表格，保留前后说明及空行', () => {
  const prefix = '# 题库\n\n## 题目索引\n\n<!-- 人工说明 -->\n\n';
  const suffix = '\n\n## 人工补充\n\nBOMEZ 原始附件有已知错误。\n\n| A | B |\n| --- | --- |\n| a | b |\n';
  const original = `${prefix}| 练习 | 阶段 | TS 脚本 | 原始附件 |\n${TABLE_SEPARATOR}\n${suffix}`;
  const result = composeReadme(original, [exercise]);
  assert.ok(result.content.startsWith(prefix));
  assert.ok(result.content.endsWith(suffix));
  assert.ok(result.content.includes('[demo.js](P7_L1_demo/demo.js)'));
  assert.deepEqual(result.added, [exercise.id]);
  assert.equal(composeReadme(result.content, [exercise]).changed, false);
});

test('README 保留代码块中的索引示例和表格后的人工段落', () => {
  const example = `\n~~~md\n${TABLE_HEADER}\n${TABLE_SEPARATOR}\n~~~\n`;
  const original = `# 题库\n${example}\n${TABLE_HEADER}\n${TABLE_SEPARATOR}\n\n保留结尾。`;
  const content = composeReadme(original, [exercise]).content;
  assert.ok(content.includes(example));
  assert.ok(content.endsWith('\n\n保留结尾。'));
});

test('README 索引不唯一时拒绝猜测并覆盖', () => {
  const table = `${TABLE_HEADER}\n${TABLE_SEPARATOR}\n`;
  assert.throws(() => composeReadme(`${table}\n人工段落\n\n${table}`, []), /多个/);
});

test('缺少索引时追加表格，保留原文', () => {
  const original = '# 题库\n\n人工段落\n\n';
  const result = composeReadme(original, [exercise]);
  assert.ok(result.content.startsWith(original));
  assert.equal(composeReadme(result.content, [exercise]).changed, false);
});

test('README 为符号链接时拒绝同步，不修改外部文件', t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'exercise-readme-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const repo = path.join(root, 'repo');
  fs.mkdirSync(repo);
  const outside = path.join(root, 'outside.md');
  fs.writeFileSync(outside, '# 外部文档\n');
  try { fs.symlinkSync(outside, path.join(repo, 'README.md'), 'file'); }
  catch (error) {
    if (['EPERM', 'EACCES'].includes(error.code)) { t.skip('当前系统不允许创建文件符号链接'); return; }
    throw error;
  }
  assert.throws(() => syncReadme(repo, [exercise]));
  assert.equal(fs.readFileSync(outside, 'utf8'), '# 外部文档\n');
});


test('README 状态区分原完整博客题和残题补全，补全不覆盖自拟资料来源身份', () => {
  const original = { id: 'P5_原完整_blog', stage: 'P5', status: 'complete', source: { kind: 'blog' }, attachments: [] };
  const supplemented = { ...original, id: 'P5_补全_blog', status: 'supplemented', relativePath: 'supplemented/P5_补全_blog' };
  const proposal = { ...supplemented, id: 'P5_lww_blog', relativePath: 'supplemented/P5_lww_blog', source: { kind: 'blog', provenance: 'proposal' } };
  const result = composeReadme('# 题库\n', [original, supplemented, proposal]);
  const rows = result.content.split('\n').filter(line => line.startsWith('| [P5_'));
  assert.match(rows[0], /\| 行为完整 \| 博客整理 \|/);
  assert.match(rows[1], /supplemented\/P5_补全_blog\/P5_补全_blog.md/);
  assert.match(rows[1], /\| 残题补全 \| 博客整理 \|/);
  assert.match(rows[2], /\| 残题补全 \| 博主自拟资料（非考题） \|/);
  assert.doesNotMatch(result.content, /资料残缺|关键行为未还原/);
});
