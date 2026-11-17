'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { AppError, assertInside, assertDirectory, lstat } = require('./store-files');
const { assertExerciseId, isExerciseId } = require('./exercise-names');
const SUPPLEMENTED_DIR = 'supplemented';

function assertStatus(status) {
  if (!['complete', 'supplemented'].includes(status)) throw new AppError(400, '题目状态必须为 complete 或 supplemented');
  return status;
}

function parentFor(root, status) {
  assertDirectory(root);
  if (assertStatus(status) === 'complete') return root;
  const parent = assertInside(root, path.join(root, SUPPLEMENTED_DIR));
  assertDirectory(parent, { allowMissing: true });
  return parent;
}

function location(root, id, status) {
  assertExerciseId(id);
  const parent = parentFor(root, status);
  if (lstat(parent)) {
    const sameName = fs.readdirSync(parent).find(name => name.toLowerCase() === id.toLowerCase());
    if (sameName && sameName !== id) throw new AppError(409, `目录名称大小写不匹配：${sameName}`);
  }
  return {
    directory: assertInside(parent, path.join(parent, id)), parent, status,
    relativePath: status === 'supplemented' ? `${SUPPLEMENTED_DIR}/${id}` : id,
  };
}

function locateExercise(root, id, { allowMissing = false, status = 'complete' } = {}) {
  const candidates = ['complete', 'supplemented'].map(kind => location(root, id, kind));
  const existing = candidates.filter(item => lstat(item.directory));
  if (existing.length > 1) throw new AppError(409, `题目 ${id} 在原完整题目录和残题补全目录中重复`);
  if (existing.length) {
    assertDirectory(existing[0].directory);
    return existing[0];
  }
  if (!allowMissing) throw new AppError(404, `题目 ${id} 不存在`);
  return candidates.find(item => item.status === assertStatus(status));
}

function planRelocation(root, id, status) {
  const target = location(root, id, status);
  if (lstat(target.directory)) throw new AppError(409, `目标目录 ${target.relativePath} 已存在`);
  return target;
}

function ensureParent(item) {
  if (!lstat(item.parent)) fs.mkdirSync(item.parent);
  assertDirectory(item.parent);
}

function listExerciseIds(root) {
  const ids = [];
  for (const status of ['complete', 'supplemented']) {
    const parent = parentFor(root, status);
    if (!lstat(parent)) continue;
    for (const entry of fs.readdirSync(parent, { withFileTypes: true })) {
      if (entry.isDirectory() && !entry.isSymbolicLink() && isExerciseId(entry.name) &&
        fs.readdirSync(path.join(parent, entry.name)).some(name => !name.startsWith('.'))) ids.push(entry.name);
    }
  }
  if (new Set(ids.map(id => id.toLowerCase())).size !== ids.length) throw new AppError(409, '题目目录 ID 重复或大小写冲突');
  return ids;
}

module.exports = { SUPPLEMENTED_DIR, assertStatus, locateExercise, planRelocation, ensureParent, listExerciseIds };
