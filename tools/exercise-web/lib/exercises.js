'use strict';

const fs = require('node:fs');
const path = require('node:path');
const {
  AppError, assertInside, assertRegularFile, lstat, writeAtomic, moveFile,
} = require('./store-files');
const { assertExerciseId, assertScriptName, assertFileName } = require('./exercise-names');
const { locateExercise, planRelocation, ensureParent, listExerciseIds, assertStatus } = require('./exercise-locations');
const { stageOf, compareExercises, parseStatementSource } = require('./exercise-metadata');

function isScriptFile(name) {
  return /\.(js|ts)$/.test(name) && !name.endsWith('.d.ts');
}

function assertScriptFile(name) {
  if (!isScriptFile(name)) throw new AppError(400, '脚本文件必须使用小写 .js 或 .ts 扩展名，且不能是 .d.ts 声明文件');
  return name;
}

function assertPayload(payload, fields) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) throw new AppError(400, '请求必须是对象');
  for (const key of Object.keys(payload)) {
    if (!fields.includes(key)) throw new AppError(400, `不支持的字段：${key}`);
    if (typeof payload[key] !== 'string') throw new AppError(400, `字段 ${key} 必须是字符串`);
  }
  if (Object.hasOwn(payload, 'scriptName')) assertScriptName(payload.scriptName);
  if (Object.hasOwn(payload, 'scriptLanguage') && !['ts', 'js'].includes(payload.scriptLanguage)) {
    throw new AppError(400, '脚本语言必须为 ts 或 js');
  }
  if (Object.hasOwn(payload, 'status')) assertStatus(payload.status);
}

function exerciseDirectory(root, id) {
  return locateExercise(root, id).directory;
}

function assertFileTarget(dir, name, previousName) {
  assertFileName(name);
  const existing = fs.readdirSync(dir).filter((entry) => entry.toLowerCase() === name.toLowerCase());
  if (existing.some((entry) => entry !== previousName && entry !== name)) {
    throw new AppError(409, `文件 ${name} 与已有文件重名`);
  }
  if (previousName && existing.some((entry) => entry !== previousName)) {
    throw new AppError(409, `文件 ${name} 已存在`);
  }
  const target = assertInside(dir, path.join(dir, name));
  assertRegularFile(dir, target, { allowMissing: true });
  return target;
}

function withNewline(text) {
  return text.endsWith('\n') ? text : `${text}\n`;
}

function readTitle(text, fallback) {
  const named = /^##\s+(?:题目|题名)(?:[：:]\s*([^\n]+)|\s*\n\s*\n([^\n]+))/m.exec(String(text || ''));
  if (named) return (named[1] || named[2]).trim();
  const match = /^#\s+(.+)$/m.exec(String(text || ''));
  return match ? match[1].trim() : fallback;
}

function describeDirectory(root, id) {
  const location = locateExercise(root, id);
  const dir = location.directory;
  const files = fs.readdirSync(dir, { withFileTypes: true })
    .filter((entry) => {
      if (entry.isSymbolicLink()) throw new AppError(400, `文件 ${entry.name} 不能是链接`);
      return entry.isFile() && !entry.name.startsWith('.');
    })
    .map((entry) => {
      const stat = assertRegularFile(dir, path.join(dir, entry.name));
      return { name: entry.name, size: stat.size, modified: stat.mtime.toISOString() };
    })
    .sort((a, b) => (a.name < b.name ? -1 : 1));

  const statementFile = files.find((file) => file.name === `${id}.md`) ||
    files.find((file) => file.name.toLowerCase().endsWith('.md'));
  const scriptFile = files.find((file) => isScriptFile(file.name));
  const attachments = files.filter((file) => file !== statementFile && file !== scriptFile);
  const statementText = statementFile
    ? fs.readFileSync(path.join(dir, statementFile.name), 'utf8')
    : '';

  return {
    id,
    status: location.status,
    relativePath: location.relativePath,
    stage: stageOf(id),
    scriptName: scriptFile ? path.basename(scriptFile.name, path.extname(scriptFile.name)) : null,
    scriptLanguage: scriptFile ? path.extname(scriptFile.name).slice(1).toLowerCase() : null,
    title: readTitle(statementText, id),
    source: parseStatementSource(statementText, id),
    hasStatement: Boolean(statementFile),
    hasScript: Boolean(scriptFile),
    statementFile: statementFile ? statementFile.name : null,
    scriptFile: scriptFile ? scriptFile.name : null,
    attachments,
    files,
    size: files.reduce((sum, file) => sum + file.size, 0),
    modified: files.reduce((latest, file) => (file.modified > latest ? file.modified : latest), ''),
  };
}

function listExercises(root) {
  return listExerciseIds(root)
    .map((id) => describeDirectory(root, id))
    .sort(compareExercises);
}

function readExercise(root, id) {
  const dir = exerciseDirectory(root, id);
  const meta = describeDirectory(root, id);
  const statement = meta.statementFile
    ? fs.readFileSync(path.join(dir, meta.statementFile), 'utf8')
    : '';
  const script = meta.scriptFile
    ? fs.readFileSync(path.join(dir, meta.scriptFile), 'utf8')
    : '';
  return { ...meta, statement, script };
}

function defaultStatement(id, scriptFile) {
  return [
    `# ${id}`,
    '',
    `> 项目：${stageOf(id)} ｜ 题目 ID：— ｜ 来源 PieId：— ｜ 类型：待补充`,
    '',
    '## 题目描述',
    '',
    '（在此填写题面）',
    '',
    '## 编码',
    '',
    '```text',
    '（在此填写指令编码）',
    '```',
    '',
    '## 说明',
    '',
    scriptFile ? `- 脚本文件：\`${scriptFile}\`` : '',
    '',
  ].join('\n');
}

function createExercise(root, payload) {
  assertPayload(payload, ['id', 'scriptName', 'scriptLanguage', 'statement', 'script', 'status']);
  const id = assertExerciseId(payload.id);
  const hasScript = Object.hasOwn(payload, 'scriptName');
  if (hasScript && !['ts', 'js'].includes(payload.scriptLanguage)) throw new AppError(400, '新建题目必须指定脚本语言 ts 或 js');
  if (!hasScript && (Object.hasOwn(payload, 'scriptLanguage') || Object.hasOwn(payload, 'script'))) throw new AppError(400, '新建脚本需要指定脚本文件名');
  const location = locateExercise(root, id, { allowMissing: true, status: payload.status || 'complete' });
  const dir = location.directory;
  if (lstat(dir)) throw new AppError(409, `目录 ${id} 已存在`);
  const scriptFile = hasScript ? assertScriptFile(`${payload.scriptName}.${payload.scriptLanguage}`) : null;
  assertFileName(`${id}.md`);
  if (scriptFile) assertFileName(scriptFile);

  const statement = payload.statement && payload.statement.trim()
    ? payload.statement
    : defaultStatement(id, scriptFile);
  const script = payload.script || '';

  ensureParent(location);
  fs.mkdirSync(dir, { recursive: false });
  writeAtomic(path.join(dir, `${id}.md`), statement.endsWith('\n') ? statement : `${statement}\n`);
  if (scriptFile) writeAtomic(path.join(dir, scriptFile), script.endsWith('\n') ? script : `${script}\n`);
  return describeDirectory(root, id);
}

function updateExercise(root, id, payload) {
  assertPayload(payload, ['scriptName', 'scriptLanguage', 'statement', 'script', 'status']);
  const dir = exerciseDirectory(root, id);
  const meta = describeDirectory(root, id);
  const relocation = payload.status && payload.status !== meta.status ? planRelocation(root, id, payload.status) : null;
  if (meta.scriptFile && payload.scriptLanguage && payload.scriptLanguage !== meta.scriptLanguage) {
    throw new AppError(400, '已有脚本不能修改语言或扩展名');
  }
  const hasScriptContent = Object.hasOwn(payload, 'script');
  if (!meta.scriptFile && hasScriptContent && !payload.scriptName) throw new AppError(400, '新建脚本需要指定脚本文件名');
  if (!meta.scriptFile && !hasScriptContent && (payload.scriptName || payload.scriptLanguage)) {
    throw new AppError(400, '新建脚本需要提供脚本内容');
  }
  // Validate the entire mutation plan, including collisions and file kinds,
  // before writing either statement or script.
  const statementTarget = Object.hasOwn(payload, 'statement')
    ? assertFileTarget(dir, meta.statementFile || `${id}.md`) : null;
  let scriptTarget = null;
  if (hasScriptContent || (payload.scriptName && meta.scriptFile)) {
    const scriptName = payload.scriptName || meta.scriptName || 'instruction';
    const extension = meta.scriptFile ? path.extname(meta.scriptFile) : `.${payload.scriptLanguage || 'ts'}`;
    scriptTarget = assertFileTarget(dir, assertScriptFile(`${scriptName}${extension}`), meta.scriptFile);
  }
  if (relocation) ensureParent(relocation);
  if (statementTarget) writeAtomic(statementTarget, withNewline(payload.statement));
  if (scriptTarget) {
    const content = hasScriptContent ? withNewline(payload.script) : undefined;
    if (meta.scriptFile) moveFile(path.join(dir, meta.scriptFile), scriptTarget, content);
    else writeAtomic(scriptTarget, content);
  }

  if (relocation) fs.renameSync(dir, relocation.directory);
  return describeDirectory(root, id);
}

function deleteExercise(root, id) {
  const dir = exerciseDirectory(root, id);
  const meta = describeDirectory(root, id);
  fs.rmSync(dir, { recursive: true, force: true });
  return meta;
}

function saveAttachment(root, id, name, buffer) {
  const dir = exerciseDirectory(root, id);
  assertFileName(name);
  if (!Buffer.isBuffer(buffer)) throw new AppError(400, '附件内容必须是二进制数据');
  describeDirectory(root, id);
  const target = assertFileTarget(dir, name);
  writeAtomic(target, buffer);
  return describeDirectory(root, id);
}

function deleteAttachment(root, id, name) {
  const dir = exerciseDirectory(root, id);
  assertFileName(name);
  describeDirectory(root, id);
  const target = path.join(dir, name);
  assertInside(dir, target);
  assertRegularFile(dir, target);
  fs.unlinkSync(target);
  return describeDirectory(root, id);
}

function readAttachment(root, id, name) {
  const dir = exerciseDirectory(root, id);
  assertFileName(name);
  const target = path.join(dir, name);
  assertInside(dir, target);
  assertRegularFile(dir, target);
  return target;
}

module.exports = {
  AppError,
  assertExerciseId,
  assertScriptName,
  describeDirectory,
  listExercises,
  readExercise,
  createExercise,
  updateExercise,
  deleteExercise,
  saveAttachment,
  deleteAttachment,
  readAttachment,
  compareExercises,
};
