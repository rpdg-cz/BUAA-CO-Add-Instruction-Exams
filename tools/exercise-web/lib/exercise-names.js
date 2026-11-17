'use strict';

const { AppError } = require('./store-files');
const NAME_PATTERN = /^[\p{L}\p{N}][\p{L}\p{N}\p{M}_.-]*$/u;
const RESERVED_DIRS = new Set(['tools', 'node_modules', 'incomplete', 'supplemented']);
const DEVICE_NAME = /^(con|prn|aux|nul|com[1-9¹²³]|lpt[1-9¹²³])(?:\.|$)/i;

function portableName(name, limit) {
  return typeof name === 'string' && name.length <= limit && Buffer.byteLength(name) <= 250 &&
    NAME_PATTERN.test(name) && !name.endsWith('.') && !DEVICE_NAME.test(name);
}

function assertExerciseId(id) {
  if (!portableName(id, 80) || RESERVED_DIRS.has(id.toLowerCase())) {
    throw new AppError(400, '题目 ID 只能包含中英文字母、数字、下划线、点和短横线，且不能使用保留目录名');
  }
  return id;
}

function assertScriptName(name) {
  if (typeof name !== 'string' || !/^[A-Za-z][A-Za-z0-9_.-]{0,39}$/.test(name) ||
    !portableName(name, 40) || /\.(?:ts|js|mjs|cjs)$/i.test(name) || /\.d$/i.test(name)) {
    throw new AppError(400, '脚本文件名只能包含字母、数字、下划线、点和短横线，且以字母开头，不含扩展名');
  }
  return name;
}

function assertFileName(name) {
  if (!portableName(name, 120)) throw new AppError(400, '文件名不合法');
  return name;
}

function isExerciseId(id) {
  try { assertExerciseId(id); return true; } catch (_) { return false; }
}

module.exports = { assertExerciseId, assertScriptName, assertFileName, isExerciseId };
