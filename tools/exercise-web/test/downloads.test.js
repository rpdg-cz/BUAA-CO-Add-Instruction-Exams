'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const { createDownloadTracker } = require('../lib/downloads');
const store = require('../lib/exercises');
const { createServer } = require('../server');

function deferred() {
  let resolve;
  const promise = new Promise(done => { resolve = done; });
  return { promise, resolve };
}

const checkpoint = () => new Promise(resolve => setImmediate(resolve));

test('同题并发读完成后才写，后来的读不能越过等待中的写', async () => {
  const tracker = createDownloadTracker();
  const events = [];
  const first = deferred();
  const second = deferred();
  const writing = deferred();
  const writingStarted = deferred();
  const lateRead = deferred();
  const lateReadStarted = deferred();
  const read1 = tracker.track('P5_中文_blog', async () => { events.push('read1'); await first.promise; events.push('read1 done'); });
  const read2 = tracker.track('P5_中文_blog', async () => { events.push('read2'); await second.promise; events.push('read2 done'); });
  await checkpoint();
  assert.deepEqual(events, ['read1', 'read2']);
  const write1 = tracker.mutate('P5_中文_blog', async () => { events.push('write1'); writingStarted.resolve(); await writing.promise; events.push('write1 done'); });
  const read3 = tracker.track('P5_中文_blog', async () => { events.push('read3'); lateReadStarted.resolve(); await lateRead.promise; events.push('read3 done'); });
  const write2 = tracker.mutate('P5_中文_blog', () => { events.push('write2'); });
  first.resolve();
  await read1;
  await checkpoint();
  assert.deepEqual(events, ['read1', 'read2', 'read1 done']);
  second.resolve();
  await writingStarted.promise;
  assert.deepEqual(events, ['read1', 'read2', 'read1 done', 'read2 done', 'write1']);
  writing.resolve();
  await lateReadStarted.promise;
  assert.deepEqual(events.slice(-3), ['write1', 'write1 done', 'read3']);
  await checkpoint();
  assert.ok(!events.includes('write2'));
  lateRead.resolve();
  await Promise.all([read2, write1, read3, write2]);
  assert.deepEqual(events.slice(-2), ['read3 done', 'write2']);
});

test('不同题的读写无需等待另一题的未关闭下载', async () => {
  const tracker = createDownloadTracker();
  const blocked = deferred();
  const events = [];
  const read = tracker.track('P0_阻塞_blog', async () => { events.push('blocked read'); await blocked.promise; });
  const write = tracker.mutate('P0_阻塞_blog', () => { events.push('blocked write'); });
  await tracker.track('P1_独立_blog', () => { events.push('independent read'); });
  await tracker.mutate('P1_独立_blog', () => { events.push('independent write'); });
  assert.deepEqual(events, ['blocked read', 'independent read', 'independent write']);
  blocked.resolve();
  await Promise.all([read, write]);
  assert.equal(events.at(-1), 'blocked write');
});

test('下载或变更失败不会毒化同题队列，失败后的写和读继续执行', async () => {
  const tracker = createDownloadTracker();
  const events = [];
  const failure = new Error('模拟失败');
  const failedRead = tracker.track('Pre_失败_blog', () => { events.push('failed read'); throw failure; });
  const readRejected = assert.rejects(failedRead, error => error === failure);
  const write = tracker.mutate('Pre_失败_blog', () => { events.push('write after failed read'); return 42; });
  await readRejected;
  assert.equal(await write, 42);
  const failedWrite = tracker.mutate('Pre_失败_blog', () => { events.push('failed write'); throw failure; });
  const writeRejected = assert.rejects(failedWrite, error => error === failure);
  const read = tracker.track('Pre_失败_blog', () => { events.push('read after failed write'); return 'read result'; });
  const nextWrite = tracker.mutate('Pre_失败_blog', () => { events.push('next write'); return 'write result'; });
  await writeRejected;
  assert.equal(await read, 'read result');
  assert.equal(await nextWrite, 'write result');
  assert.deepEqual(events, ['failed read', 'write after failed read', 'failed write', 'read after failed write', 'next write']);
});

function request(base, pathname, { method = 'GET', headers = {}, body } = {}) {
  return new Promise((resolve, reject) => {
    const requestHeaders = { Connection: 'close', ...headers };
    if (body !== undefined) requestHeaders['Content-Length'] = Buffer.byteLength(body);
    const req = http.request(`${base}${pathname}`, { method, headers: requestHeaders }, res => {
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('error', reject);
      res.on('end', () => resolve({ status: res.statusCode, body: Buffer.concat(chunks).toString('utf8') }));
    });
    req.on('error', reject);
    req.end(body);
  });
}

test('真实 HTTP：客户端已收完中文题解后，DELETE 仍等到文件句柄 close 完成', { timeout: 10000 }, async t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), '下载关闭 中文 '));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const id = 'P5-P6_中文下载_2023_blog';
  store.createExercise(root, { id, statement: '# 中文题面\n' });
  store.saveAttachment(root, id, '中文题解.md', Buffer.from('# 题解\n客户端下载完成仍需等待句柄关闭。\n'));
  const target = store.readAttachment(root, id, '中文题解.md');
  const closeEntered = deferred();
  const allowClose = deferred();
  const deleteSeen = deferred();
  let closed = false;
  let deleted = false;
  const originalOpen = fs.promises.open;
  t.mock.method(fs.promises, 'open', async (...args) => {
    const handle = await originalOpen(...args);
    if (args[0] === target) {
      const originalClose = handle.close.bind(handle);
      handle.close = async () => {
        closeEntered.resolve();
        await allowClose.promise;
        await originalClose();
        closed = true;
      };
    }
    return handle;
  });
  const originalDelete = store.deleteAttachment;
  t.mock.method(store, 'deleteAttachment', (...args) => {
    assert.equal(closed, true, 'Windows 删除必须等文件句柄真正关闭');
    deleted = true;
    return originalDelete(...args);
  });
  const server = createServer({ repoRoot: root, quiet: true, adminToken: '' });
  server.on('request', req => { if (req.method === 'DELETE') deleteSeen.resolve(); });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const route = `/api/exercises/${encodeURIComponent(id)}/attachments/${encodeURIComponent('中文题解.md')}`;
  try {
    const download = await request(base, route);
    await closeEntered.promise;
    assert.equal(download.status, 200);
    assert.equal(download.body, '# 题解\n客户端下载完成仍需等待句柄关闭。\n');
    assert.equal(closed, false);
    const remove = request(base, route, { method: 'DELETE', headers: { 'X-Requested-With': 'exercise-web', Origin: base, 'Sec-Fetch-Site': 'same-origin' } });
    await deleteSeen.promise;
    await checkpoint();
    assert.equal(deleted, false);
    assert.equal(fs.existsSync(target), true);
    allowClose.resolve();
    const response = await remove;
    assert.equal(response.status, 200, response.body);
    assert.equal(closed, true);
    assert.equal(deleted, true);
    assert.equal(fs.existsSync(target), false);
  } finally {
    allowClose.resolve();
    await new Promise(resolve => server.close(resolve));
  }
});

test('真实 HTTP：等待下载关闭的移档先完成，后到下载按新位置读取中文题解', { timeout: 10000 }, async t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), '移档下载 中文 '));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const id = 'P6_移档队列_2023_blog';
  const solution = '# 中文题解\n移档不能使排队下载使用旧路径。\n';
  store.createExercise(root, { id, statement: '# 题面\n' });
  store.saveAttachment(root, id, '中文题解.md', Buffer.from(solution));
  const oldTarget = store.readAttachment(root, id, '中文题解.md');
  const closeEntered = deferred();
  const allowClose = deferred();
  const moveSeen = deferred();
  const lateReadSeen = deferred();
  const opened = [];
  let moved = false;
  let downloadsSeen = 0;
  const originalOpen = fs.promises.open;
  t.mock.method(fs.promises, 'open', async (...args) => {
    const handle = await originalOpen(...args);
    opened.push(args[0]);
    if (args[0] === oldTarget && opened.length === 1) {
      const originalClose = handle.close.bind(handle);
      handle.close = async () => {
        closeEntered.resolve();
        await allowClose.promise;
        await originalClose();
      };
    }
    return handle;
  });
  const originalUpdate = store.updateExercise;
  t.mock.method(store, 'updateExercise', (...args) => {
    const result = originalUpdate(...args);
    moved = true;
    return result;
  });
  const server = createServer({ repoRoot: root, quiet: true, adminToken: '' });
  server.on('request', req => {
    if (req.method === 'PUT') moveSeen.resolve();
    if (req.method === 'GET' && ++downloadsSeen === 2) lateReadSeen.resolve();
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const route = `/api/exercises/${encodeURIComponent(id)}`;
  const attachment = `${route}/attachments/${encodeURIComponent('中文题解.md')}`;
  try {
    const initial = await request(base, attachment);
    assert.equal(initial.body, solution);
    await closeEntered.promise;
    const move = request(base, route, { method: 'PUT', headers: {
      'X-Requested-With': 'exercise-web', Origin: base, 'Sec-Fetch-Site': 'same-origin',
      'Content-Type': 'application/json',
    }, body: JSON.stringify({ status: 'incomplete' }) });
    await moveSeen.promise;
    await checkpoint();
    assert.equal(moved, false);
    const lateRead = request(base, attachment);
    await lateReadSeen.promise;
    await checkpoint();
    assert.deepEqual(opened, [oldTarget]);
    allowClose.resolve();
    const [moveResponse, lateResponse] = await Promise.all([move, lateRead]);
    assert.equal(moveResponse.status, 200, moveResponse.body);
    assert.equal(JSON.parse(moveResponse.body).exercise.relativePath, `incomplete/${id}`);
    assert.equal(lateResponse.status, 200, lateResponse.body);
    assert.equal(lateResponse.body, solution);
    assert.equal(moved, true);
    assert.deepEqual(opened, [oldTarget, path.join(root, 'incomplete', id, '中文题解.md')]);
  } finally {
    allowClose.resolve();
    await new Promise(resolve => server.close(resolve));
  }
});
