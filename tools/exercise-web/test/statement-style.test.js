'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const store = require('../lib/exercises');

const root = path.resolve(__dirname, '../../..');
const blogs = () => store.listExercises(root).filter(row => row.source.kind === 'blog');

test('真实题面与题解保持纯题意，维护记录独立于可见文件', () => {
  for (const row of blogs()) {
    const directory = path.join(root, row.relativePath);
    const meta = JSON.parse(fs.readFileSync(path.join(directory, '.exercise.json'), 'utf8'));
    assert.equal(meta.version, 1, row.id);
    assert.equal(meta.source.kind, 'blog', row.id);
    assert.ok(!row.metadataDiagnostic, `${row.id}: ${row.metadataDiagnostic}`);
    assert.ok(!row.files.some(file => file.name === '.exercise.json'));
    for (const file of fs.readdirSync(directory).filter(name => name.endsWith('.md'))) {
      const text = fs.readFileSync(path.join(directory, file), 'utf8');
      assert.doesNotMatch(text, /^>\s*(?:项目|年份|来源|类型)[：:]/m, file);
      assert.doesNotMatch(text, /^##\s.*(?:出处|资料缺项|来源与未决|课程阶段注意|课程语义)/m, file);
      assert.doesNotMatch(text, /(?:本页据|本文将博客|本题由博客|博客未记录|博客未给出|非官方题面|不代表课程组|整理状态[：:]|收录状态[：:])/, file);
    }
  }
});

test('指令编码保留32位，操作使用手册记号和成对的Pascal控制结构', () => {
  for (const row of blogs().filter(item => /^P[3-7]/.test(item.stage))) {
    const file = path.join(root, row.relativePath, row.statementFile);
    const text = fs.readFileSync(file, 'utf8');
    const encoding = /## 编码\s*\n+([^]*?)(?=\n## |$)/.exec(text)?.[1];
    if (encoding) {
      const lines = encoding.split('\n').filter(line => line.trim().startsWith('|'));
      assert.equal(lines.length, 3, `${row.id}: 编码表应有位号、分隔行、字段值`);
      const cells = line => line.trim().split('|').slice(1, -1).map(cell => cell.trim().replace(/`/g, ''));
      const fields = cells(lines[0]);
      const values = cells(lines[2]);
      assert.equal(fields.length, values.length, row.id);
      let next = 31;
      fields.forEach((field, index) => {
        const match = /^(\d+)\.\.(\d+)$/.exec(field);
        assert.ok(match, `${row.id}: 非标准位号 ${field}`);
        const high = Number(match[1]), low = Number(match[2]);
        assert.equal(high, next, `${row.id}: 编码位号不连续`);
        assert.ok(high >= low && low >= 0, row.id);
        if (/^[01x]+$/.test(values[index])) assert.equal(values[index].length, high - low + 1, `${row.id}: 固定位/x宽度错误`);
        assert.doesNotMatch(values[index], /(?:未|未知|记录|来源)/, row.id);
        next = low - 1;
      });
      assert.equal(next, -1, `${row.id}: 编码未覆盖32位`);
    }
    const operation = /## 操作[^\n]*\n([^]*?)(?=\n## |$)/.exec(text)?.[1] || '';
    for (const match of operation.matchAll(/<pre>([^]*?)<\/pre>/g)) {
      const code = match[1].replace(/<\/?(?:sub|sup)>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
      assert.doesNotMatch(code, /\b(?:S32|U32|SEXT32|low32|low64|ROR32|ROTL32|SUM32|Mem32|P0|next_PC)\b|\bSignExtend\s*\(|CP0\.|\+=|<<|>>|\[[^\]\n]*:[^\]\n]*\]|：/, row.id);
      const stack = [];
      for (let line of code.split('\n')) {
        line = line.trim().replace(/^I(?:[+-]\d+)?:\s*/, '');
        if (!line) continue;
        if (/^if\b/.test(line)) { assert.match(line, /\bthen$/, row.id); stack.push('if'); }
        else if (/^for\b/.test(line)) { assert.match(line, /^for\s+\w+\s+in\s+.+\.\..+$/, row.id); stack.push('for'); }
        else if (line === 'else') assert.equal(stack.at(-1), 'if', row.id);
        else if (line === 'endif') assert.equal(stack.pop(), 'if', row.id);
        else if (line === 'endfor') assert.equal(stack.pop(), 'for', row.id);
      }
      assert.equal(stack.length, 0, `${row.id}: 控制块未闭合`);
    }
  }
});
