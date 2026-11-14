'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_.-]{0,79}$/;
const INSTRUCTION_PATTERN = /^[A-Za-z][A-Za-z0-9_.]{0,39}$/;
const FILE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_.-]{0,79}$/;
const SCRIPT_EXTENSIONS = new Set(['.ts', '.js', '.mjs', '.cjs']);
const RESERVED_DIRS = new Set(['tools', 'node_modules']);

class AppError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function assertExerciseId(id) {
  if (typeof id !== 'string' || !ID_PATTERN.test(id)) {
    throw new AppError(400, '题目 ID 只能包含字母、数字、下划线、点和短横线');
  }
  return id;
}

function assertInstruction(instruction) {
  if (typeof instruction !== 'string' || !INSTRUCTION_PATTERN.test(instruction)) {
    throw new AppError(400, '指令名只能包含字母、数字、下划线和点，且以字母开头');
  }
  return instruction;
}

function assertFileName(name) {
  if (typeof name !== 'string' || !FILE_PATTERN.test(name)) {
    throw new AppError(400, '文件名不合法');
  }
  return name;
}

function assertInside(root, target) {
  const relative = path.relative(root, target);
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new AppError(400, '路径越界');
  }
  return target;
}

function writeAtomic(file, content) {
  const temp = `${file}.tmp-${process.pid}-${Date.now()}`;
  fs.writeFileSync(temp, content);
  fs.renameSync(temp, file);
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
  const dir = path.join(root, id);
  const files = fs.readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => {
      const stat = fs.statSync(path.join(dir, entry.name));
      return { name: entry.name, size: stat.size, modified: stat.mtime.toISOString() };
    })
    .sort((a, b) => (a.name < b.name ? -1 : 1));

  const statementFile = files.find((file) => file.name === `${id}.md`) ||
    files.find((file) => file.name.toLowerCase().endsWith('.md'));
  const scriptFile = files.find((file) => SCRIPT_EXTENSIONS.has(path.extname(file.name).toLowerCase()));
  const attachments = files.filter((file) => file !== statementFile && file !== scriptFile);
  const statementText = statementFile
    ? fs.readFileSync(path.join(dir, statementFile.name), 'utf8')
    : '';

  return {
    id,
    stage: stageOf(id),
    instruction: scriptFile ? path.basename(scriptFile.name, path.extname(scriptFile.name)) : null,
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
  return fs.readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => !name.startsWith('.') && !RESERVED_DIRS.has(name) && ID_PATTERN.test(name))
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
  assertExerciseId(id);
  const dir = path.join(root, id);
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
    throw new AppError(404, `题目 ${id} 不存在`);
  }
  const meta = describeDirectory(root, id);
  const statement = meta.statementFile
    ? fs.readFileSync(path.join(dir, meta.statementFile), 'utf8')
    : '';
  const script = meta.scriptFile
    ? fs.readFileSync(path.join(dir, meta.scriptFile), 'utf8')
    : '';
  return { ...meta, statement, script };
}

function defaultStatement(id, instruction) {
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
    instruction ? `- 指令名：\`${instruction}\`` : '',
    '',
  ].join('\n');
}

function createExercise(root, payload) {
  const id = assertExerciseId(payload.id);
  const instruction = assertInstruction(payload.instruction);
  const dir = path.join(root, id);
  assertInside(root, dir);
  if (fs.existsSync(dir)) throw new AppError(409, `目录 ${id} 已存在`);

  const statement = typeof payload.statement === 'string' && payload.statement.trim()
    ? payload.statement
    : defaultStatement(id, instruction);
  const script = typeof payload.script === 'string' ? payload.script : '';

  fs.mkdirSync(dir, { recursive: false });
  writeAtomic(path.join(dir, `${id}.md`), statement.endsWith('\n') ? statement : `${statement}\n`);
  if (script) writeAtomic(path.join(dir, `${instruction}.ts`), script.endsWith('\n') ? script : `${script}\n`);
  return describeDirectory(root, id);
}

function updateExercise(root, id, payload) {
  assertExerciseId(id);
  const dir = path.join(root, id);
  assertInside(root, dir);
  if (!fs.existsSync(dir)) throw new AppError(404, `题目 ${id} 不存在`);

  const meta = describeDirectory(root, id);

  if (typeof payload.statement === 'string') {
    const file = path.join(dir, meta.statementFile || `${id}.md`);
    writeAtomic(file, payload.statement.endsWith('\n') ? payload.statement : `${payload.statement}\n`);
  }

  if (typeof payload.script === 'string') {
    const instruction = payload.instruction ? assertInstruction(payload.instruction) : (meta.instruction || 'instruction');
    const target = path.join(dir, `${instruction}.ts`);
    if (meta.scriptFile && meta.scriptFile !== `${instruction}.ts`) {
      const previous = path.join(dir, meta.scriptFile);
      fs.writeFileSync(target, payload.script.endsWith('\n') ? payload.script : `${payload.script}\n`);
      fs.unlinkSync(previous);
    } else {
      writeAtomic(target, payload.script.endsWith('\n') ? payload.script : `${payload.script}\n`);
    }
  } else if (payload.instruction && meta.scriptFile) {
    const instruction = assertInstruction(payload.instruction);
    const current = path.join(dir, meta.scriptFile);
    const renamed = path.join(dir, `${instruction}.ts`);
    if (current !== renamed) fs.renameSync(current, renamed);
  }

  return describeDirectory(root, id);
}

function deleteExercise(root, id) {
  assertExerciseId(id);
  const dir = path.join(root, id);
  assertInside(root, dir);
  if (!fs.existsSync(dir)) throw new AppError(404, `题目 ${id} 不存在`);
  const meta = describeDirectory(root, id);
  fs.rmSync(dir, { recursive: true, force: true });
  return meta;
}

function saveAttachment(root, id, name, buffer) {
  assertExerciseId(id);
  assertFileName(name);
  const dir = path.join(root, id);
  assertInside(root, dir);
  if (!fs.existsSync(dir)) throw new AppError(404, `题目 ${id} 不存在`);
  writeAtomic(path.join(dir, name), buffer);
  return describeDirectory(root, id);
}

function deleteAttachment(root, id, name) {
  assertExerciseId(id);
  assertFileName(name);
  const dir = path.join(root, id);
  assertInside(root, dir);
  const target = path.join(dir, name);
  assertInside(dir, target);
  if (!fs.existsSync(target)) throw new AppError(404, `附件 ${name} 不存在`);
  fs.unlinkSync(target);
  return describeDirectory(root, id);
}

function readAttachment(root, id, name) {
  assertExerciseId(id);
  assertFileName(name);
  const dir = path.join(root, id);
  const target = path.join(dir, name);
  assertInside(dir, target);
  if (!fs.existsSync(target)) throw new AppError(404, `附件 ${name} 不存在`);
  return target;
}

module.exports = {
  AppError,
  assertExerciseId,
  assertInstruction,
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
