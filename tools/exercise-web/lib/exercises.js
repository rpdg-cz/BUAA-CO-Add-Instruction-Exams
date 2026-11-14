'use strict';

const fs = require('node:fs');
const path = require('node:path');
const {
  AppError, assertInside, assertDirectory, assertRegularFile, lstat, writeAtomic, moveFile,
} = require('./store-files');

const ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_.-]{0,79}$/;
const SCRIPT_NAME_PATTERN = /^[A-Za-z][A-Za-z0-9_.-]{0,39}$/;
const FILE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_.-]{0,79}$/;
const RESERVED_DIRS = new Set(['tools', 'node_modules']);
const DEVICE_NAME = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i;

function isPortableName(name) {
  return !name.endsWith('.') && !DEVICE_NAME.test(name);
}

function isScriptFile(name) {
  return /\.(js|ts)$/.test(name) && !name.endsWith('.d.ts');
}

function assertScriptFile(name) {
  if (!isScriptFile(name)) throw new AppError(400, '脚本文件必须使用小写 .js 或 .ts 扩展名，且不能是 .d.ts 声明文件');
  return name;
}

function assertExerciseId(id) {
  if (typeof id !== 'string' || !ID_PATTERN.test(id) || !isPortableName(id) || RESERVED_DIRS.has(id.toLowerCase())) {
    throw new AppError(400, '题目 ID 只能包含字母、数字、下划线、点和短横线');
  }
  return id;
}

function assertScriptName(name) {
  if (typeof name !== 'string' || !SCRIPT_NAME_PATTERN.test(name) || !isPortableName(name) || /\.(?:ts|js|mjs|cjs)$/i.test(name)) {
    throw new AppError(400, '脚本文件名只能包含字母、数字、下划线、点和短横线，且以字母开头，不含扩展名');
  }
  return name;
}

function assertFileName(name) {
  if (typeof name !== 'string' || !FILE_PATTERN.test(name) || !isPortableName(name)) {
    throw new AppError(400, '文件名不合法');
  }
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
}

function exerciseDirectory(root, id, { allowMissing = false } = {}) {
  assertExerciseId(id);
  assertDirectory(root);
  const dir = assertInside(root, path.join(root, id));
  const existing = fs.readdirSync(root).find((name) => name.toLowerCase() === id.toLowerCase());
  if (existing && existing !== id) throw new AppError(409, `目录名称大小写不匹配：${existing}`);
  assertDirectory(dir, { allowMissing });
  return dir;
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

function stageOf(id) {
  const match = /^P(\d+)/.exec(id);
  return match ? `P${match[1]}` : 'P?';
}

function orderKey(id) {
  const stage = /^P(\d+)/.exec(id);
  const level = /_L(\d+)/.exec(id);
  return {
    stage: stage ? Number(stage[1]) : Number.MAX_SAFE_INTEGER,
    level: level ? Number(level[1]) : Number.MAX_SAFE_INTEGER,
    id,
  };
}

function compareExercises(a, b) {
  const left = orderKey(a.id);
  const right = orderKey(b.id);
  if (left.stage !== right.stage) return left.stage - right.stage;
  if (left.level !== right.level) return left.level - right.level;
  if (left.id < right.id) return -1;
  if (left.id > right.id) return 1;
  return 0;
}

const DEFAULT_PROBLEM_BASE_URL = 'http://cscore.buaa.edu.cn/#/problem';

// Statement files start with a metadata line such as
//   > 项目：P5 ｜ 题目 ID：1050 ｜ 来源 PieId：1338 ｜ 类型：文件上传
// which is enough to rebuild a link to the original course platform page.
function parseStatementSource(statement) {
  const text = String(statement || '');
  const projectMatch = /项目\s*[：:]\s*([^\s｜|]+)/.exec(text);
  const problemMatch = /题目\s*ID\s*[：:]\s*(\d+)/i.exec(text);
  const pieMatch = /来源\s*PieId\s*[：:]\s*(\d+)/i.exec(text);
  const typeMatch = /类型\s*[：:]\s*([^\s｜|]+)/.exec(text);
  const base = process.env.CO_PROBLEM_BASE_URL || DEFAULT_PROBLEM_BASE_URL;
  const problemId = problemMatch ? Number(problemMatch[1]) : null;
  const pieId = pieMatch ? Number(pieMatch[1]) : null;
  let url = null;
  if (problemId) {
    url = `${base}?ProblemId=${problemId}`;
    if (pieId) url += `&PieId=${pieId}`;
  }
  return {
    project: projectMatch ? projectMatch[1] : null,
    problemId,
    pieId,
    type: typeMatch ? typeMatch[1] : null,
    url,
  };
}

function readTitle(text, fallback) {
  const match = /^#\s+(.+)$/m.exec(String(text || ''));
  return match ? match[1].trim() : fallback;
}

function describeDirectory(root, id) {
  const dir = exerciseDirectory(root, id);
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
    stage: stageOf(id),
    scriptName: scriptFile ? path.basename(scriptFile.name, path.extname(scriptFile.name)) : null,
    scriptLanguage: scriptFile ? path.extname(scriptFile.name).slice(1).toLowerCase() : null,
    title: readTitle(statementText, id),
    source: parseStatementSource(statementText),
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

function listExerciseIds(root) {
  assertDirectory(root);
  return fs.readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.isSymbolicLink())
    .map((entry) => entry.name)
    .filter((name) => !name.startsWith('.') && !RESERVED_DIRS.has(name.toLowerCase()) && ID_PATTERN.test(name) && isPortableName(name))
    .filter((name) => {
      const dir = path.join(root, name);
      return fs.readdirSync(dir).some((file) => !file.startsWith('.'));
    });
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
  assertPayload(payload, ['id', 'scriptName', 'scriptLanguage', 'statement', 'script']);
  const id = assertExerciseId(payload.id);
  const scriptName = assertScriptName(payload.scriptName);
  if (!['ts', 'js'].includes(payload.scriptLanguage)) throw new AppError(400, '新建题目必须指定脚本语言 ts 或 js');
  const dir = exerciseDirectory(root, id, { allowMissing: true });
  if (lstat(dir)) throw new AppError(409, `目录 ${id} 已存在`);
  const scriptFile = assertScriptFile(`${scriptName}.${payload.scriptLanguage}`);
  assertFileName(`${id}.md`);
  assertFileName(scriptFile);

  const statement = payload.statement && payload.statement.trim()
    ? payload.statement
    : defaultStatement(id, scriptFile);
  const script = payload.script || '';

  fs.mkdirSync(dir, { recursive: false });
  writeAtomic(path.join(dir, `${id}.md`), statement.endsWith('\n') ? statement : `${statement}\n`);
  writeAtomic(path.join(dir, scriptFile), script.endsWith('\n') ? script : `${script}\n`);
  return describeDirectory(root, id);
}

function updateExercise(root, id, payload) {
  assertPayload(payload, ['scriptName', 'scriptLanguage', 'statement', 'script']);
  const dir = exerciseDirectory(root, id);
  const meta = describeDirectory(root, id);
  if (meta.scriptFile && payload.scriptLanguage && payload.scriptLanguage !== meta.scriptLanguage) {
    throw new AppError(400, '已有脚本不能修改语言或扩展名');
  }
  const hasScriptContent = Object.hasOwn(payload, 'script');
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
  if (statementTarget) writeAtomic(statementTarget, withNewline(payload.statement));
  if (scriptTarget) {
    const content = hasScriptContent ? withNewline(payload.script) : undefined;
    if (meta.scriptFile) moveFile(path.join(dir, meta.scriptFile), scriptTarget, content);
    else writeAtomic(scriptTarget, content);
  }

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
