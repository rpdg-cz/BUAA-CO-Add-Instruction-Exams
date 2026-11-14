'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { Readable } = require('node:stream');
const { createServer } = require('../server');

const PUBLIC_DIR = path.resolve(__dirname, '../public');
const WRITE_HEADERS = { 'X-Requested-With': 'exercise-web' };
const JSON_HEADERS = { ...WRITE_HEADERS, 'Content-Type': 'application/json; charset=utf-8' };

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'exercise-http 中文 '));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.writeFileSync(path.join(root, 'README.md'), '# fixture\n');
  fs.mkdirSync(path.join(root, 'P5_fixture'));
  fs.writeFileSync(path.join(root, 'P5_fixture/P5_fixture.md'), '# fixture\n\n[原附件](demo.class)\n');
  fs.writeFileSync(path.join(root, 'P5_fixture/demo.js'), 'export default {};\n');
  fs.writeFileSync(path.join(root, 'P5_fixture/demo.class'), Buffer.from([0xca, 0xfe]));
  fs.mkdirSync(path.join(root, 'P5_fixture/directory'));
  return root;
}

async function withServer(t, fn, options = {}) {
  const server = createServer({ repoRoot: fixture(t), quiet: true, adminToken: '', ...options });
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  try {
    await fn(`http://127.0.0.1:${server.address().port}`);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

function request(base, pathname, { method = 'GET', headers = {}, body } = {}) {
  return new Promise((resolve, reject) => {
    const requestHeaders = { Connection: 'close', ...headers };
    if (body !== undefined) requestHeaders['Content-Length'] = Buffer.byteLength(body);
    const req = http.request(`${base}${pathname}`, { method, headers: requestHeaders }, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('error', reject);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(chunks).toString('utf8') }));
    });
    req.on('error', reject);
    req.end(body);
  });
}

test('Host guard accepts loopback names and rejects DNS rebinding and malformed URLs', async (t) => {
  await withServer(t, async (base) => {
    const port = new URL(base).port;
    for (const host of [`localhost:${port}`, `LOCALHOST:${port}`, `127.0.0.2:${port}`, `[::1]:${port}`, `[0:0:0:0:0:0:0:1]:${port}`]) {
      assert.equal((await request(base, '/api', { headers: { Host: host } })).status, 200, host);
    }
    for (const host of ['attacker.example', 'localhost.attacker.example', '192.0.2.100']) {
      assert.equal((await request(base, '/api', { headers: { Host: host } })).status, 403, host);
    }
    assert.equal((await request(base, '/api', { headers: { Host: 'localhost@attacker.example' } })).status, 400);
    for (const pathname of ['/%ZZ', '/api/exercises/%ZZ', '/%00', '//attacker.example/api']) {
      assert.equal((await request(base, pathname)).status, 400, pathname);
    }
    assert.equal((await request(base, '/api')).status, 200);
  });
});

test('explicit HOST supports remote hostnames with token and keeps Host guard', async (t) => {
  await withServer(t, async (base) => {
    const headers = { ...JSON_HEADERS, Host: 'course.example:8787', 'X-Admin-Token': 'secret', Origin: 'http://course.example:8787' };
    const created = await request(base, '/api/exercises', {
      method: 'POST', headers,
      body: JSON.stringify({ id: 'P6_remote', scriptName: 'demo', scriptLanguage: 'js', script: 'export default {};' }),
    });
    assert.equal(created.status, 201, created.body);
    assert.equal((await request(base, '/api', { headers: { Host: 'attacker.example' } })).status, 403);
    assert.equal((await request(base, '/api/exercises/P6_remote', { method: 'DELETE', headers: { ...WRITE_HEADERS, Host: 'course.example', 'X-Admin-Token': 'wrong' } })).status, 401);
  }, { host: 'course.example', adminToken: 'secret' });
});

test('wildcard HOST permits local interface addresses for remote token management', async (t) => {
  const address = Object.values(os.networkInterfaces()).flat().find((item) => item && !item.internal && item.family === 'IPv4');
  if (!address) return t.skip('No external IPv4 interface');
  await withServer(t, async (base) => {
    const result = await request(base, '/api/readme', { method: 'POST', headers: { ...WRITE_HEADERS, Host: address.address, 'X-Admin-Token': 'secret' } });
    assert.equal(result.status, 200, result.body);
  }, { host: '0.0.0.0', adminToken: 'secret' });
});

test('every mutation rejects cross-origin and simple requests, including token mode', async (t) => {
  await withServer(t, async (base) => {
    const routes = [
      ['POST', '/api/exercises'], ['PUT', '/api/exercises/P5_fixture'],
      ['DELETE', '/api/exercises/P5_fixture'],
      ['PUT', '/api/exercises/P5_fixture/attachments/new.class'],
      ['DELETE', '/api/exercises/P5_fixture/attachments/demo.class'],
      ['POST', '/api/readme'],
    ];
    for (const [method, pathname] of routes) {
      const token = { 'X-Admin-Token': 'secret' };
      for (const headers of [
        token,
        { ...JSON_HEADERS, ...token, Origin: 'https://attacker.example' },
        { ...JSON_HEADERS, ...token, Origin: 'null' },
        { ...JSON_HEADERS, ...token, Origin: base, 'Sec-Fetch-Site': 'cross-site' },
        { ...JSON_HEADERS, ...token, Origin: base, 'Sec-Fetch-Site': 'same-site' },
      ]) {
        const result = await request(base, pathname, { method, headers, body: '{}' });
        assert.equal(result.status, 403, `${method} ${pathname}: ${result.body}`);
      }
    }
    assert.equal((await request(base, '/api/readme', { method: 'POST', headers: { ...WRITE_HEADERS, 'X-Admin-Token': 'secret', Origin: base, 'Sec-Fetch-Site': 'same-origin' } })).status, 200);
  }, { adminToken: 'secret' });
});

test('JSON write routes require JSON objects and report body limits', async (t) => {
  await withServer(t, async (base) => {
    for (const [method, pathname] of [['POST', '/api/exercises'], ['PUT', '/api/exercises/P5_fixture']]) {
      for (const contentType of ['', 'text/plain', 'application/x-www-form-urlencoded', 'application/jsonp']) {
        const result = await request(base, pathname, { method, headers: { ...WRITE_HEADERS, 'Content-Type': contentType }, body: '{}' });
        assert.equal(result.status, 415, result.body);
      }
      for (const body of ['', 'null', '[]', '"text"', '1', 'true', '{']) {
        const result = await request(base, pathname, { method, headers: JSON_HEADERS, body });
        assert.equal(result.status, 400, body);
      }
    }
    const tooLarge = await request(base, '/api/exercises/P5_fixture', { method: 'PUT', headers: JSON_HEADERS, body: JSON.stringify({ statement: 'x'.repeat(2 * 1024 * 1024) }) });
    assert.equal(tooLarge.status, 413);
    assert.equal((await request(base, '/api')).status, 200);
  });
});

test('same-origin UI workflow and header-authenticated CLI workflow remain usable', async (t) => {
  await withServer(t, async (base) => {
    const uiHeaders = { ...JSON_HEADERS, Origin: base, 'Sec-Fetch-Site': 'same-origin' };
    const created = await request(base, '/api/exercises', { method: 'POST', headers: uiHeaders,
      body: JSON.stringify({ id: 'P6_created', scriptName: 'custom', scriptLanguage: 'js', statement: '# new\n', script: 'export default {};\n' }) });
    assert.equal(created.status, 201, created.body);
    assert.equal(JSON.parse(created.body).exercise.scriptFile, 'custom.js');
    const updated = await request(base, '/api/exercises/P6_created', { method: 'PUT', headers: uiHeaders, body: JSON.stringify({ statement: '# Updated\n' }) });
    assert.equal(updated.status, 200, updated.body);
    assert.equal((await request(base, '/api/exercises/P6_created/attachments/demo.class', { method: 'PUT', headers: WRITE_HEADERS, body: 'binary' })).status, 200);
    const download = await request(base, '/api/exercises/P6_created/attachments/demo.class');
    assert.equal(download.body, 'binary');
    assert.match(download.headers['content-disposition'], /attachment/);
    assert.equal((await request(base, '/api/exercises/P6_created/attachments/demo.class', { method: 'DELETE', headers: WRITE_HEADERS })).status, 200);
    assert.equal((await request(base, '/api/readme', { method: 'POST', headers: WRITE_HEADERS })).status, 200);
    assert.equal((await request(base, '/api/exercises/P6_created', { method: 'DELETE', headers: WRITE_HEADERS })).status, 200);
  });
});

test('directory downloads and static traversal fail without taking the server down', async (t) => {
  await withServer(t, async (base) => {
    assert.ok([400, 404].includes((await request(base, '/api/exercises/P5_fixture/attachments/directory')).status));
    assert.equal((await request(base, '/vendor/')).status, 404);
    assert.equal((await request(base, '/..%5c..%5cREADME.md')).status, 403);
    assert.equal((await request(base, '/api')).status, 200);
    const detail = JSON.parse((await request(base, '/api/exercises/P5_fixture')).body);
    assert.match(detail.exercise.html, /\/api\/exercises\/P5_fixture\/attachments\/demo.class/);
  });
});

test('static junctions cannot escape the public realpath boundary', async (t) => {
  const outside = fixture(t);
  const name = `http-test-${process.pid}-${Date.now()}`;
  const link = path.join(PUBLIC_DIR, name);
  try {
    fs.symlinkSync(outside, link, process.platform === 'win32' ? 'junction' : 'dir');
  } catch (error) {
    if (['EPERM', 'EACCES', 'ENOTSUP'].includes(error.code)) return t.skip(error.message);
    throw error;
  }
  t.after(() => fs.unlinkSync(link));
  await withServer(t, async (base) => {
    assert.equal((await request(base, `/${name}/README.md`)).status, 403);
    assert.equal((await request(base, '/')).status, 200);
  });
});

test('security headers protect UI and error responses while allowing course media', async (t) => {
  await withServer(t, async (base) => {
    for (const pathname of ['/', '/api', '/%ZZ']) {
      const result = await request(base, pathname);
      assert.equal(result.headers['x-content-type-options'], 'nosniff');
      const policy = result.headers['content-security-policy'];
      for (const directive of ["script-src 'self'", "style-src 'self' 'unsafe-inline'", "img-src 'self' data: http: https:", "object-src 'none'", "base-uri 'none'", "frame-ancestors 'none'", "form-action 'self'"]) assert.ok(policy.includes(directive), directive);
      assert.ok(!policy.includes("script-src 'self' 'unsafe-inline'"));
    }
    assert.equal((await request(base, '/vendor/purify.min.js')).status, 200);
    const head = await request(base, '/', { method: 'HEAD' });
    assert.equal(head.status, 200);
    assert.equal(head.body, '');
  });
});

test('a file stream read error is contained and the server continues serving requests', async (t) => {
  const originalOpen = fs.promises.open;
  let injectFailure = true;
  t.mock.method(console, 'error', () => {});
  t.mock.method(fs.promises, 'open', async (...args) => {
    const file = await originalOpen(...args);
    if (injectFailure && args[0] === path.join(PUBLIC_DIR, 'index.html')) {
      injectFailure = false;
      file.createReadStream = () => new Readable({
        read() { this.destroy(new Error('simulated file read failure')); },
      });
    }
    return file;
  });
  await withServer(t, async (base) => {
    await assert.rejects(request(base, '/'), /socket hang up|aborted|reset/i);
    assert.equal(injectFailure, false);
    assert.equal((await request(base, '/api')).status, 200);
    assert.equal((await request(base, '/')).status, 200);
  });
});

test('real CLI honors CO_REPO_ROOT and logs the actual root and allocated port', { timeout: 15000 }, async (t) => {
  const root = fixture(t);
  const child = spawn(process.execPath, [path.resolve(__dirname, '../server.js')], {
    cwd: os.tmpdir(), windowsHide: true,
    env: { ...process.env, CO_REPO_ROOT: root, PORT: '0', HOST: '127.0.0.1', CO_ADMIN_TOKEN: '' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const exited = new Promise((resolve) => child.once('exit', resolve));
  t.after(async () => { child.kill(); await exited; });
  let output = '';
  let errors = '';
  child.stderr.on('data', (chunk) => { errors += chunk; });
  const base = await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`CLI startup timed out: ${output} ${errors}`)), 8000);
    child.once('error', (error) => { clearTimeout(timer); reject(error); });
    child.once('exit', (code) => { clearTimeout(timer); reject(new Error(`CLI exited ${code}: ${errors}`)); });
    child.stdout.on('data', (chunk) => {
      output += chunk;
      const match = /http:\/\/127\.0\.0\.1:(\d+)\//.exec(output);
      if (match) { clearTimeout(timer); resolve(`http://127.0.0.1:${match[1]}`); }
    });
  });
  assert.ok(output.includes(root), output);
  assert.notEqual(new URL(base).port, '0');
  const info = JSON.parse((await request(base, '/api')).body);
  assert.equal(info.root, root);
  assert.equal(info.exercises, 1);
  const list = JSON.parse((await request(base, '/api/exercises')).body);
  assert.deepEqual(list.exercises.map((item) => item.id), ['P5_fixture']);
  assert.ok([400, 404].includes((await request(base, '/api/exercises/P5_fixture/attachments/directory')).status));
  assert.equal((await request(base, '/api')).status, 200);
});
