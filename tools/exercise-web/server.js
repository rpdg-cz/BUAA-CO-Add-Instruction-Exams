#!/usr/bin/env node
'use strict';

// Local management server for the exercise collection.
// Runs on Node.js built-ins only: no dependencies, no build step.

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const exerciseStore = require('./lib/exercises');
const readme = require('./lib/readme');
const { renderMarkdown } = require('./lib/markdown');

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

function sendFile(res, filePath, { download = false } = {}) {
  const stat = fs.statSync(filePath);
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
  fs.createReadStream(filePath).pipe(res);
}

function readBody(req, limit) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let total = 0;
    req.on('data', (chunk) => {
      total += chunk.length;
      if (total > limit) {
        reject(new exerciseStore.AppError(413, '请求体过大'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

async function readJsonBody(req) {
  const raw = await readBody(req, MAX_JSON_BYTES);
  if (!raw.length) return {};
  try {
    return JSON.parse(raw.toString('utf8'));
  } catch {
    throw new exerciseStore.AppError(400, '请求体不是合法的 JSON');
  }
}

function isLoopback(address) {
  if (!address) return false;
  return address === '::1' || address === '127.0.0.1' || address.startsWith('127.') || address === '::ffff:127.0.0.1';
}

function createServer(options = {}) {
  const repoRoot = options.repoRoot ? path.resolve(options.repoRoot) : DEFAULT_REPO_ROOT;
  const adminToken = options.adminToken != null ? options.adminToken : (process.env.CO_ADMIN_TOKEN || '');
  const quiet = Boolean(options.quiet);

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
    return { ...exercise, html: renderMarkdown(exercise.statement || '') };
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
        sendFile(res, exerciseStore.readAttachment(repoRoot, id, name), { download: true });
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

  function handleStatic(req, res, url) {
    let relative = decodeURIComponent(url.pathname);
    if (relative === '/' || relative === '') relative = '/index.html';
    const target = path.normalize(path.join(PUBLIC_DIR, relative));
    if (!target.startsWith(PUBLIC_DIR)) {
      res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Forbidden');
      return;
    }
    if (!fs.existsSync(target) || !fs.statSync(target).isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Not found');
      return;
    }
    sendFile(res, target);
  }

  return http.createServer((req, res) => {
    const started = Date.now();
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    if (!quiet) {
      res.on('finish', () => {
        console.log(`${req.method} ${url.pathname} ${res.statusCode} ${Date.now() - started}ms`);
      });
    }

    const run = url.pathname === '/api' || url.pathname.startsWith('/api/')
      ? handleApi(req, res, url)
      : Promise.resolve().then(() => handleStatic(req, res, url));

    run.catch((error) => {
      const status = error instanceof exerciseStore.AppError ? error.status : 500;
      if (status >= 500) console.error(error);
      if (!res.headersSent) sendJson(res, status, { error: error.message || '服务器内部错误' });
    });
  });
}

if (require.main === module) {
  const HOST = process.env.HOST || '127.0.0.1';
  const PORT = Number(process.env.PORT || 8787);
  const server = createServer();
  server.listen(PORT, HOST, () => {
    const shown = HOST === '0.0.0.0' || HOST === '::' ? '127.0.0.1' : HOST;
    console.log('');
    console.log('  加指令练习 · 本地题库');
    console.log(`  仓库目录  ${DEFAULT_REPO_ROOT}`);
    console.log(`  浏览页面  http://${shown}:${PORT}/`);
    console.log(`  管理模式  http://${shown}:${PORT}/#admin`);
    if (HOST !== '127.0.0.1' && HOST !== '::1' && !process.env.CO_ADMIN_TOKEN) {
      console.log('  ⚠ 已监听非本机地址但未设置 CO_ADMIN_TOKEN：写操作会默认拒绝。');
    }
    if (process.env.CO_ADMIN_TOKEN) console.log('  管理令牌  已启用（CO_ADMIN_TOKEN）');
    console.log('');
  });
  process.on('SIGINT', () => server.close(() => process.exit(0)));
}

module.exports = { createServer };
