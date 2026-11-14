#!/usr/bin/env node
'use strict';

// Local management server for the exercise collection.
// Runs on Node.js built-ins only: no dependencies, no build step.

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { pipeline } = require('node:stream/promises');

const exerciseStore = require('./lib/exercises');
const readme = require('./lib/readme');
const { renderMarkdown } = require('./lib/markdown');
const { SECURITY_HEADERS, createRequestGuard, isLoopback } = require('./lib/http-security');

const DEFAULT_REPO_ROOT = path.resolve(__dirname, '..', '..');
const PUBLIC_DIR = path.join(__dirname, 'public');
const MAX_JSON_BYTES = 2 * 1024 * 1024;
const MAX_UPLOAD_BYTES = 16 * 1024 * 1024;

const CONTENT_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};

function sendJson(res, status, payload) {
  const body = Buffer.from(`${JSON.stringify(payload)}\n`, 'utf8');
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': body.length,
    'Cache-Control': 'no-store',
  });
  res.end(body);
}

async function sendFile(res, filePath, { download = false, head = false } = {}) {
  let file;
  try {
    file = await fs.promises.open(filePath, 'r');
  } catch (error) {
    if (['ENOENT', 'ENOTDIR', 'EISDIR'].includes(error.code)) throw new exerciseStore.AppError(404, '文件不存在');
    if (['EACCES', 'EPERM'].includes(error.code)) throw new exerciseStore.AppError(403, '无法读取文件');
    throw error;
  }
  try {
    const stat = await file.stat();
    if (!stat.isFile()) throw new exerciseStore.AppError(404, '文件不存在');
    const ext = path.extname(filePath).toLowerCase();
    const headers = {
      'Content-Type': CONTENT_TYPES[ext] || 'application/octet-stream',
      'Content-Length': stat.size,
      'Cache-Control': 'no-cache',
    };
    if (download) {
      headers['Content-Disposition'] = `attachment; filename="${encodeURIComponent(path.basename(filePath))}"`;
    }
    res.writeHead(200, headers);
    if (head) res.end();
    else await pipeline(file.createReadStream({ autoClose: false }), res);
  } finally {
    await file.close();
  }
}

function readBody(req, limit) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let total = 0;
    req.on('data', (chunk) => {
      total += chunk.length;
      if (total > limit) {
        reject(new exerciseStore.AppError(413, '请求体过大'));
        chunks.length = 0;
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

async function readJsonBody(req) {
  if (!/^application\/json(?:\s*;|\s*$)/i.test(req.headers['content-type'] || '')) {
    throw new exerciseStore.AppError(415, '请求体必须使用 application/json');
  }
  const raw = await readBody(req, MAX_JSON_BYTES);
  let payload;
  try {
    payload = JSON.parse(raw.toString('utf8'));
  } catch {
    throw new exerciseStore.AppError(400, '请求体不是合法的 JSON');
  }
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new exerciseStore.AppError(400, 'JSON 请求体必须是对象');
  }
  return payload;
}

function createServer(options = {}) {
  const repoRoot = path.resolve(options.repoRoot || process.env.CO_REPO_ROOT || DEFAULT_REPO_ROOT);
  const adminToken = options.adminToken != null ? options.adminToken : (process.env.CO_ADMIN_TOKEN || '');
  const quiet = Boolean(options.quiet);
  const parseRequestUrl = createRequestGuard(options.host || process.env.HOST || '127.0.0.1');

  function assertWritable(req) {
    if (adminToken) {
      if (req.headers['x-admin-token'] !== adminToken) {
        throw new exerciseStore.AppError(401, '管理令牌无效');
      }
      return;
    }
    if (!isLoopback(req.socket.remoteAddress)) {
      throw new exerciseStore.AppError(403, '写操作仅允许本机访问；如需远程管理请设置 CO_ADMIN_TOKEN');
    }
  }

  function serialize(exercise) {
    return { ...exercise, html: renderMarkdown(exercise.statement || '', { exerciseId: exercise.id, files: exercise.files }) };
  }

  function listPayload() {
    const exercises = exerciseStore.listExercises(repoRoot);
    return {
      root: repoRoot,
      readme: readme.previewReadme(repoRoot, exercises).changed,
      exercises,
    };
  }

  async function handleApi(req, res, url) {
    const segments = url.pathname.split('/').filter(Boolean); // ['api', ...]
    const rest = segments.slice(1);
    const method = req.method;

    if (rest.length === 0 && method === 'GET') {
      sendJson(res, 200, {
        name: 'exercise-web',
        version: 1,
        root: repoRoot,
        adminTokenRequired: Boolean(adminToken),
        exercises: exerciseStore.listExercises(repoRoot).length,
      });
      return;
    }

    if (rest[0] === 'exercises' && rest.length === 1 && method === 'GET') {
      sendJson(res, 200, listPayload());
      return;
    }

    if (rest[0] === 'exercises' && rest.length === 1 && method === 'POST') {
      assertWritable(req);
      const payload = await readJsonBody(req);
      const created = exerciseStore.createExercise(repoRoot, payload);
      sendJson(res, 201, { exercise: created });
      return;
    }

    if (rest[0] === 'exercises' && rest.length >= 2) {
      const id = decodeURIComponent(rest[1]);
      const sub = rest[2];
      const name = rest[3] ? decodeURIComponent(rest[3]) : null;

      if (!sub && method === 'GET') {
        sendJson(res, 200, { exercise: serialize(exerciseStore.readExercise(repoRoot, id)) });
        return;
      }
      if (!sub && method === 'PUT') {
        assertWritable(req);
        const payload = await readJsonBody(req);
        sendJson(res, 200, { exercise: exerciseStore.updateExercise(repoRoot, id, payload) });
        return;
      }
      if (!sub && method === 'DELETE') {
        assertWritable(req);
        sendJson(res, 200, { deleted: exerciseStore.deleteExercise(repoRoot, id) });
        return;
      }
      if (sub === 'attachments' && name && method === 'GET') {
        await sendFile(res, exerciseStore.readAttachment(repoRoot, id, name), { download: true });
        return;
      }
      if (sub === 'attachments' && name && method === 'PUT') {
        assertWritable(req);
        const body = await readBody(req, MAX_UPLOAD_BYTES);
        sendJson(res, 200, { exercise: exerciseStore.saveAttachment(repoRoot, id, name, body) });
        return;
      }
      if (sub === 'attachments' && name && method === 'DELETE') {
        assertWritable(req);
        sendJson(res, 200, { exercise: exerciseStore.deleteAttachment(repoRoot, id, name) });
        return;
      }
    }

    if (rest[0] === 'readme' && rest.length === 1) {
      const exercises = exerciseStore.listExercises(repoRoot);
      if (method === 'GET') {
        const preview = readme.previewReadme(repoRoot, exercises);
        sendJson(res, 200, {
          changed: preview.changed,
          added: preview.added,
          removed: preview.removed,
          content: preview.content,
        });
        return;
      }
      if (method === 'POST') {
        assertWritable(req);
        const result = readme.syncReadme(repoRoot, exercises);
        sendJson(res, 200, { changed: result.changed, added: result.added, removed: result.removed });
        return;
      }
    }

    throw new exerciseStore.AppError(404, `未找到接口 ${url.pathname}`);
  }

  async function handleStatic(req, res, url) {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405, { Allow: 'GET, HEAD' }).end();
      return;
    }
    let relative = decodeURIComponent(url.pathname);
    if (relative === '/' || relative === '') relative = '/index.html';
    const target = path.resolve(PUBLIC_DIR, `.${relative}`);
    function assertStaticInside(root, file) {
      const rel = path.relative(root, file);
      if (rel === '..' || rel.startsWith(`..${path.sep}`) || path.isAbsolute(rel)) {
        throw new exerciseStore.AppError(403, '静态文件路径越界');
      }
    }
    assertStaticInside(PUBLIC_DIR, target);
    let realTarget;
    try {
      const realRoot = await fs.promises.realpath(PUBLIC_DIR);
      realTarget = await fs.promises.realpath(target);
      assertStaticInside(realRoot, realTarget);
    } catch (error) {
      if (['ENOENT', 'ENOTDIR'].includes(error.code)) throw new exerciseStore.AppError(404, '文件不存在');
      throw error;
    }
    await sendFile(res, realTarget, { head: req.method === 'HEAD' });
  }

  return http.createServer((req, res) => {
    const started = Date.now();
    for (const [name, value] of Object.entries(SECURITY_HEADERS)) res.setHeader(name, value);
    if (!quiet) {
      res.on('finish', () => {
        console.log(`${req.method} ${req.url} ${res.statusCode} ${Date.now() - started}ms`);
      });
    }

    const run = Promise.resolve().then(() => {
      const url = parseRequestUrl(req);
      return url.pathname === '/api' || url.pathname.startsWith('/api/')
        ? handleApi(req, res, url)
        : handleStatic(req, res, url);
    });

    run.catch((error) => {
      const status = error instanceof exerciseStore.AppError ? error.status : 500;
      if (status >= 500) console.error(error);
      if (!res.headersSent && !res.destroyed) sendJson(res, status, { error: error.message || '服务器内部错误' });
      else if (!res.destroyed) res.destroy();
    });
  });
}

if (require.main === module) {
  const HOST = process.env.HOST || '127.0.0.1';
  const PORT = Number(process.env.PORT || 8787);
  const repoRoot = path.resolve(process.env.CO_REPO_ROOT || DEFAULT_REPO_ROOT);
  const server = createServer({ repoRoot, host: HOST });
  server.listen(PORT, HOST, () => {
    const shownHost = HOST === '0.0.0.0' || HOST === '::' ? '127.0.0.1' : HOST;
    const shown = shownHost.includes(':') ? `[${shownHost}]` : shownHost;
    const port = server.address().port;
    console.log('');
    console.log('  加指令练习 · 本地题库');
    console.log(`  仓库目录  ${repoRoot}`);
    console.log(`  浏览页面  http://${shown}:${port}/`);
    console.log(`  管理模式  http://${shown}:${port}/#admin`);
    if (HOST !== '127.0.0.1' && HOST !== '::1' && !process.env.CO_ADMIN_TOKEN) {
      console.log('  ⚠ 已监听非本机地址但未设置 CO_ADMIN_TOKEN：写操作会默认拒绝。');
    }
    if (process.env.CO_ADMIN_TOKEN) console.log('  管理令牌  已启用（CO_ADMIN_TOKEN）');
    console.log('');
  });
  process.on('SIGINT', () => server.close(() => process.exit(0)));
}

module.exports = { createServer };
