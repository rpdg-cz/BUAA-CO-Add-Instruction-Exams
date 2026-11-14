'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { Worker } = require('node:worker_threads');
const { stripTypeScriptTypes } = require('node:module');
const store = require('../lib/exercises');

// Optional integration with the actual Toolkit Worker, never a replacement SDK.
const toolkitRoot = process.env.CO_TOOLKIT_ROOT;
const repoRoot = path.resolve(__dirname, '../../..');

test('23 份真实指令经网页存储/改名后仍由 Toolkit 按源码加载，JS/TS 均可用', {
  skip: toolkitRoot ? false : '设置 CO_TOOLKIT_ROOT 运行真实 Toolkit 集成测试', timeout: 60000,
}, async t => {
  assert.equal(typeof stripTypeScriptTypes, 'function', 'SDK 集成测试需使用支持原生 TS 擦除的 Node（建议与当前 VS Code 相同版本）');
  const workerPath = path.join(path.resolve(toolkitRoot), 'out/scriptInstructionWorker.js');
  assert.ok(fs.existsSync(workerPath), '请先构建 CO_TOOLKIT_ROOT 指向的 Toolkit');
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'exercise-sdk-'));
  const worker = new Worker(workerPath, { execArgv: ['--experimental-vm-modules'] });
  t.after(async () => { await worker.terminate(); fs.rmSync(temp, { recursive: true, force: true }); });
  let sequence = 0;
  async function job(kind, payload) {
    const requestId = String(++sequence);
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => finish(new Error('Toolkit Worker 超时，请检查协议版本/构建产物')), 10000);
      function finish(error, value) {
        clearTimeout(timeout);
        worker.off('message', onMessage);
        worker.off('error', onError);
        worker.off('exit', onExit);
        error ? reject(error) : resolve(value);
      }
      function onMessage(message) {
        if (message.requestId === requestId && message.kind === 'result') {
          finish(message.ok ? null : new Error(message.error), message.payload);
        }
      }
      function onError(error) { finish(error); }
      function onExit(code) { finish(new Error(`Toolkit Worker exited: ${code}`)); }
      worker.on('message', onMessage);
      worker.once('error', onError);
      worker.once('exit', onExit);
      worker.postMessage({ protocolVersion: 2, kind: 'request', requestId, jobId: 'exercise-web-test', job: { kind, payload } });
    });
  }
  const exercises = store.listExercises(repoRoot);
  assert.equal(exercises.length, 23);
  for (const language of ['ts', 'js']) {
    const collection = path.join(temp, language);
    const workspaceRoot = path.join(temp, `cpu-${language}`);
    const entry = path.join(workspaceRoot, '.co/custom-instructions', `renamed.${language}`);
    fs.mkdirSync(collection);
    fs.mkdirSync(path.dirname(entry), { recursive: true });
    for (const exercise of exercises) {
      const original = store.readExercise(repoRoot, exercise.id);
      const script = language === 'ts' ? original.script : stripTypeScriptTypes(original.script);
      store.createExercise(collection, { id: exercise.id, scriptName: 'sample', scriptLanguage: language, script });
      const saved = store.updateExercise(collection, exercise.id, { scriptName: 'renamed', script });
      assert.equal(saved.scriptFile, `renamed.${language}`);
      const actual = fs.readFileSync(path.join(collection, exercise.id, saved.scriptFile), 'utf8');
      assert.equal(actual.trimEnd(), script.trimEnd());
      fs.writeFileSync(entry, actual);
      const bundle = await job('script-capture', { workspaceRoot });
      const inspection = await job('script-job', { bundle, job: { kind: 'script-inspect', payload: null } });
      assert.deepEqual(inspection.instructions.map(item => item.mnemonic), [original.scriptName]);
      for (const mode of ['mars', 'P3', 'P4', 'P5', 'P6', 'P7']) assert.ok(inspection.instructions[0].modes.includes(mode), `${exercise.id} missing ${mode}`);
    }
  }
});
