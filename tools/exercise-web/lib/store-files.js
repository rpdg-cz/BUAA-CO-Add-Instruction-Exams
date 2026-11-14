'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { randomUUID } = require('node:crypto');

class AppError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function assertInside(root, target) {
  const relative = path.relative(path.resolve(root), path.resolve(target));
  if (!relative || relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
    throw new AppError(400, '路径越界');
  }
  return target;
}

function lstat(file) {
  try {
    return fs.lstatSync(file);
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
}

function assertDirectory(dir, { allowMissing = false } = {}) {
  const stat = lstat(dir);
  if (!stat && allowMissing) return null;
  if (!stat) throw new AppError(404, '目录不存在');
  if (stat.isSymbolicLink() || !stat.isDirectory()) throw new AppError(400, '目录必须是普通目录，不能是链接');
  return stat;
}

// The store only accesses immediate children of a verified root/directory.
// lstat (rather than stat/exists) also detects dangling links and Windows junctions.
function assertRegularFile(root, file, { allowMissing = false } = {}) {
  assertInside(root, file);
  assertDirectory(root);
  if (path.dirname(path.resolve(file)) !== path.resolve(root)) throw new AppError(400, '文件必须位于目标目录内');
  const stat = lstat(file);
  if (!stat && allowMissing) return null;
  if (!stat) throw new AppError(404, '文件不存在');
  if (stat.isSymbolicLink() || !stat.isFile() || stat.nlink > 1) {
    throw new AppError(400, '文件必须是普通文件，不能是链接');
  }
  return stat;
}

function temporaryPath(file) {
  return path.join(path.dirname(file), `.exercise-web-${randomUUID()}.tmp`);
}

function writeAtomic(file, content) {
  const dir = path.dirname(file);
  assertRegularFile(dir, file, { allowMissing: true });
  const temp = temporaryPath(file);
  try {
    fs.writeFileSync(temp, content, { flag: 'wx' });
    fs.renameSync(temp, file);
  } finally {
    if (lstat(temp)) fs.unlinkSync(temp);
  }
}

// A temporary hop handles case-only renames on Windows without ever unlinking
// the new file through its old, case-insensitive path. Restore on a failed move.
function moveFile(current, target, content) {
  const dir = path.dirname(current);
  assertRegularFile(dir, current);
  assertRegularFile(dir, target, { allowMissing: true });
  if (current === target) {
    if (content !== undefined) writeAtomic(target, content);
    return;
  }
  const backup = temporaryPath(current);
  fs.renameSync(current, backup);
  try {
    if (content === undefined) fs.renameSync(backup, target);
    else writeAtomic(target, content);
  } catch (error) {
    fs.renameSync(backup, current);
    throw error;
  }
  if (content !== undefined) fs.unlinkSync(backup);
}

module.exports = { AppError, assertInside, assertDirectory, assertRegularFile, lstat, writeAtomic, moveFile };
