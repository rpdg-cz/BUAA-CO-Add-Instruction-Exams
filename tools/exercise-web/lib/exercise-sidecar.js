'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { AppError, assertRegularFile } = require('./store-files');
const { parseStoredSource } = require('./exercise-metadata');

const SIDECAR_NAME = '.exercise.json';
const MAX_BYTES = 1024 * 1024;
const cache = new Map();

// Metadata is separate from the exam statement. Keep only the parsed source in
// this lazy cache; editorial and completion records never enter API DTOs.
function readExerciseSidecar(directory, expectedKind) {
  const file = path.join(directory, SIDECAR_NAME);
  const stat = assertRegularFile(directory, file, { allowMissing: true });
  if (!stat) { cache.delete(file); return {}; }
  if (stat.size > MAX_BYTES) throw new AppError(413, `${SIDECAR_NAME} 超过 1 MiB 上限`);
  const signature = `${expectedKind}:${stat.ino}:${stat.size}:${stat.mtimeMs}:${stat.ctimeMs}`;
  const previous = cache.get(file);
  if (previous?.signature === signature) return previous.result;
  let result;
  try {
    const value = JSON.parse(fs.readFileSync(file, 'utf8'));
    result = { source: parseStoredSource(value, expectedKind) };
  } catch (error) {
    // Partially saved JSON should not make the rest of the collection disappear.
    // Retain the last valid source if available and expose a repair diagnostic.
    const message = error instanceof SyntaxError ? 'JSON 不完整或语法有误' : error.message;
    result = { source: previous?.result.source, diagnostic: `${SIDECAR_NAME}：${message}` };
  }
  cache.set(file, { signature, result });
  if (cache.size > 128) cache.delete(cache.keys().next().value);
  return result;
}

module.exports = { SIDECAR_NAME, readExerciseSidecar };
