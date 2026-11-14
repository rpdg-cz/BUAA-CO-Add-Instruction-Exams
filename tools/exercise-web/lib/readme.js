'use strict';

const fs = require('node:fs');
const path = require('node:path');

const TABLE_HEADER = '| 练习 | 阶段 | TS 脚本 | 原始附件 |';
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
  const index = lines.findIndex((line) => line.trim() === TABLE_HEADER);
  if (index === -1) {
    return { prefix: `${text.replace(/\s+$/, '')}\n\n${SECTION_TITLE}\n\n`, body: '' };
  }
  return { prefix: lines.slice(0, index).join('\n'), body: lines.slice(index).join('\n') };
}

function composeReadme(original, exercises) {
  const { prefix, body } = splitReadme(original);
  const beforeIds = readTableIds(body);
  const nextIds = exercises.map((exercise) => exercise.id);
  const table = buildTable(exercises);
  const head = prefix.endsWith('\n\n') ? prefix : `${prefix.replace(/\s+$/, '')}\n\n`;
  return {
    content: `${head}${table}\n`,
    added: nextIds.filter((id) => !beforeIds.includes(id)),
    removed: beforeIds.filter((id) => !nextIds.includes(id)),
    changed: beforeIds.join('\n') !== nextIds.join('\n') || `${head}${table}\n` !== String(original).replace(/\r\n/g, '\n'),
  };
}

function previewReadme(root, exercises) {
  const readmePath = path.join(root, 'README.md');
  const original = fs.existsSync(readmePath) ? fs.readFileSync(readmePath, 'utf8') : '';
  return composeReadme(original, exercises);
}

function syncReadme(root, exercises) {
  const readmePath = path.join(root, 'README.md');
  const result = previewReadme(root, exercises);
  if (result.changed) fs.writeFileSync(readmePath, result.content);
  return result;
}

module.exports = { TABLE_HEADER, TABLE_SEPARATOR, buildTable, previewReadme, syncReadme, composeReadme };
