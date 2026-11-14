'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { AppError, assertDirectory, assertRegularFile, writeAtomic } = require('./store-files');

const TABLE_HEADER = '| 练习 | 阶段 | JS/TS 脚本 | 原始附件 |';
const LEGACY_TABLE_HEADER = '| 练习 | 阶段 | TS 脚本 | 原始附件 |';
const TABLE_SEPARATOR = '| --- | --- | --- | --- |';
const SECTION_TITLE = '## 题目索引';

function attachmentCell(exercise) {
  const files = (exercise.attachments || []).map((file) => file.name).filter(Boolean);
  if (!files.length) return '无';
  return files
    .map((name) => `[${name}](${exercise.id}/${name})`)
    .join('<br>');
}

function tableRow(exercise) {
  const statementFile = exercise.statementFile || `${exercise.id}.md`;
  const statement = `[${exercise.id}](${exercise.id}/${statementFile})`;
  const script = exercise.scriptFile
    ? `[${exercise.scriptFile}](${exercise.id}/${exercise.scriptFile})`
    : '无';
  return `| ${statement} | ${exercise.stage} | ${script} | ${attachmentCell(exercise)} |`;
}

function buildTable(exercises) {
  return [TABLE_HEADER, TABLE_SEPARATOR, ...exercises.map(tableRow)].join('\n');
}

function readTableIds(text) {
  const ids = [];
  for (const line of String(text).split('\n')) {
    const match = /^\|\s*\[([^\]]+)\]\([^)]*\)\s*\|\s*P\d+/.exec(line);
    if (match) ids.push(match[1]);
  }
  return ids;
}

function splitReadme(original) {
  const text = String(original).replace(/\r\n/g, '\n');
  const lines = text.split('\n');
  const candidates = [];
  let fence;
  for (let index = 0; index < lines.length; index += 1) {
    const marker = /^\s{0,3}(`{3,}|~{3,})/.exec(lines[index]);
    if (marker) {
      if (!fence) fence = marker[1];
      else if (marker[1][0] === fence[0] && marker[1].length >= fence.length) fence = undefined;
      continue;
    }
    if (!fence && [TABLE_HEADER, LEGACY_TABLE_HEADER].includes(lines[index].trim()) &&
      /^\s*\|\s*:?-{3,}:?\s*\|\s*:?-{3,}:?\s*\|\s*:?-{3,}:?\s*\|\s*:?-{3,}:?\s*\|\s*$/.test(lines[index + 1] || '')) candidates.push(index);
  }
  if (candidates.length > 1) throw new AppError(409, 'README 中有多个题目索引表格，请先保留唯一索引');
  if (!candidates.length) {
    const gap = !text || text.endsWith('\n\n') ? '' : text.endsWith('\n') ? '\n' : '\n\n';
    return { prefix: `${text}${gap}${SECTION_TITLE}\n\n`, body: '', suffix: '\n' };
  }
  const index = candidates[0];
  let end = index + 2;
  while (end < lines.length && /^\s*\|.*\|\s*$/.test(lines[end])) end += 1;
  return {
    prefix: index ? `${lines.slice(0, index).join('\n')}\n` : '',
    body: lines.slice(index, end).join('\n'),
    suffix: end < lines.length ? `\n${lines.slice(end).join('\n')}` : '\n',
  };
}

function composeReadme(original, exercises) {
  const { prefix, body, suffix } = splitReadme(original);
  const beforeIds = readTableIds(body);
  const nextIds = exercises.map((exercise) => exercise.id);
  const table = buildTable(exercises);
  const content = `${prefix}${table}${suffix}`;
  return {
    content,
    added: nextIds.filter((id) => !beforeIds.includes(id)),
    removed: beforeIds.filter((id) => !nextIds.includes(id)),
    changed: content !== String(original).replace(/\r\n/g, '\n'),
  };
}

function previewReadme(root, exercises) {
  assertDirectory(root);
  const readmePath = path.join(root, 'README.md');
  const stat = assertRegularFile(root, readmePath, { allowMissing: true });
  const original = stat ? fs.readFileSync(readmePath, 'utf8') : '';
  return composeReadme(original, exercises);
}

function syncReadme(root, exercises) {
  const readmePath = path.join(root, 'README.md');
  const result = previewReadme(root, exercises);
  if (result.changed) writeAtomic(readmePath, result.content);
  return result;
}

module.exports = { TABLE_HEADER, TABLE_SEPARATOR, buildTable, previewReadme, syncReadme, composeReadme };
