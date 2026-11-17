'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const store = require('../lib/exercises');

const root = path.resolve(__dirname, '../../..');

test('真实残题补全均有明确补充条件、可独立阅读的题面及同步题解', () => {
  const exercises = store.listExercises(root).filter(row => row.status === 'supplemented');
  assert.ok(exercises.length > 0, '补全集合不能因容器改名而消失');
  for (const row of exercises) {
    const directory = path.join(root, row.relativePath);
    const metadata = JSON.parse(fs.readFileSync(path.join(directory, '.exercise.json'), 'utf8'));
    const completion = metadata.completion;
    assert.ok(completion && typeof completion === 'object', `${row.id}: 缺少补全记录`);
    assert.match(completion.date, /^\d{4}-\d{2}-\d{2}$/, row.id);
    assert.ok(Array.isArray(completion.conditions) && completion.conditions.length > 0, row.id);
    assert.ok(completion.conditions.every(value => typeof value === 'string' && value.trim().length > 0), row.id);
    assert.equal(row.statementFile, `${row.id}.md`);
    const statement = fs.readFileSync(path.join(directory, row.statementFile), 'utf8');
    const solutionName = `${row.id}_题解.md`;
    assert.ok(row.attachments.some(file => file.name === solutionName), `${row.id}: 缺少同步题解`);
    const solution = fs.readFileSync(path.join(directory, solutionName), 'utf8');
    assert.match(statement, /^## 补充条件\s*$/m, row.id);
    assert.match(solution, /^# /m, row.id);
    assert.doesNotMatch(`${statement}\n${solution}`, /关键行为未还原|仍需确定|尚不能唯一还原|TODO|待补全/, row.id);
    assert.equal(row.source.kind, 'blog', row.id);
    assert.ok(!row.metadataDiagnostic, `${row.id}: ${row.metadataDiagnostic}`);
    assert.ok(!row.files.some(file => file.name === '.exercise.json'), row.id);
  }
});

test('具有指令编码的博客题使用助记符命名，电路和系统设计题保留题名', () => {
  for (const row of store.listExercises(root).filter(item => item.source.kind === 'blog' && /^P[3-7]/.test(item.stage))) {
    const text = fs.readFileSync(path.join(root, row.relativePath, row.statementFile), 'utf8');
    if (!/^## 编码\s*$/m.test(text)) continue;
    assert.match(row.id, /^P\d+(?:-P\d+)?_[A-Za-z][A-Za-z0-9]*(?:_\d{4})?_blog$/, `${row.id}: 指令应以助记符命名`);
  }
});
