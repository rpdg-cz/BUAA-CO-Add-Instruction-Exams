'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');
const { spawnSync, execFile } = require('node:child_process');
const { promisify } = require('node:util');
const { pathToFileURL } = require('node:url');
const { renderMarkdown } = require('../lib/markdown');
const { createServer } = require('../server');

const webRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(webRoot, '..', '..');
const appSource = fs.readFileSync(path.join(webRoot, 'public', 'app.js'), 'utf8');

function browserHarness(fetch) {
  const elements = new Map();
  function element(id) {
    if (!elements.has(id)) elements.set(id, {
      value: '', innerHTML: '', textContent: '', disabled: false, files: [],
      classList: { add() {}, remove() {}, toggle() {}, contains() { return true; } },
      addEventListener() {}, focus() {},
    });
    return elements.get(id);
  }
  const context = vm.createContext({
    document: { getElementById: element, addEventListener() {} },
    localStorage: { getItem() { return ''; }, setItem() {} },
    window: {}, location: {}, navigator: {}, fetch,
    setTimeout() {}, clearTimeout() {},
  });
  vm.runInContext(`${appSource}\nglobalThis.ui = { state, el, api, selectExercise, openEditor, saveEditor, uploadFiles, visibleExercises, sourceBlock };`, context);
  return { ...context.ui, elements };
}

const jsonResponse = (data) => ({ ok: true, headers: { get: () => 'application/json' }, json: async () => data });
const settle = () => new Promise((resolve) => setImmediate(resolve));

test('blog and incomplete filters preserve source identity, and document-only edits omit script fields', async () => {
  const requests = [];
  const item = { id: 'P0_中文题_2024_blog', stage: 'P0', status: 'complete', statement: '# 中文题\n', files: [],
    source: { kind: 'blog', author: '作者', year: '2024', url: 'https://example.invalid/blog' } };
  const ui = browserHarness(async (url, options) => {
    requests.push({ url, options });
    return jsonResponse(url === '/api/exercises' ? { exercises: [] } : { exercise: item });
  });
  await settle();
  ui.state.exercises = [item,
    { id: 'P5_course', stage: 'P5', status: 'complete', source: { kind: 'course' } },
    { id: 'P7_残题_blog', stage: 'P7', status: 'incomplete', source: { kind: 'blog' } }];
  ui.state.filters.category = 'blog';
  assert.deepEqual(Array.from(ui.visibleExercises(), row => row.id), [item.id]);
  ui.state.filters.category = 'incomplete';
  assert.deepEqual(Array.from(ui.visibleExercises(), row => row.id), ['P7_残题_blog']);
  assert.match(ui.sourceBlock(item.source), /查看来源博客/);
  assert.doesNotMatch(ui.sourceBlock(item.source), /ProblemId/);
  ui.openEditor('edit', item);
  ui.el.fieldStatus.value = 'incomplete';
  await ui.saveEditor();
  const payload = JSON.parse(requests.find(row => row.options?.method === 'PUT').options.body);
  assert.deepEqual(payload, { statement: item.statement, status: 'incomplete' });
});

test('real course Markdown preserves tables and maps its existing class attachment', () => {
  const id = 'P3_L10_addm_2023';
  const directory = path.join(repoRoot, id);
  const statement = fs.readFileSync(path.join(directory, `${id}.md`), 'utf8');
  const html = renderMarkdown(statement, { exerciseId: id, files: fs.readdirSync(directory) });
  assert.match(html, /<table\b/);
  assert.match(html, /rowspan="3"/);
  assert.match(html, /href="\/api\/exercises\/P3_L10_addm_2023\/attachments\/addm.class"/);
  assert.match(html, /<td[^>]*>\s*SPECIAL<br\s*\/>/);
});

test('Markdown and HTML links only map known direct files, including quoted image paths', () => {
  const html = renderMarkdown([
    '[class](./addm.class)',
    '',
    '<p><a href=addm.class>raw</a><img src="./图%20片.png"><a href="https://example.com">external</a></p>',
    '',
    '[unknown](missing.class) [outside](../addm.class) [encoded outside](%2e%2e%2faddm.class)',
    '[query](https://example.com/?a=1&b=2)',
    '',
    '`[code](addm.class)`',
  ].join('\n'), { exerciseId: 'P3_Test', files: [{ name: 'addm.class' }, { name: '图 片.png' }] });
  assert.equal((html.match(/attachments\/addm.class/g) || []).length, 2);
  assert.match(html, /src="\/api\/exercises\/P3_Test\/attachments\/%E5%9B%BE%20%E7%89%87.png"/);
  assert.match(html, /href="https:\/\/example.com"/);
  assert.match(html, /href="missing.class"/);
  assert.match(html, /href="\.\.\/addm.class"/);
  assert.match(html, /href="%2e%2e%2faddm.class"/);
  assert.match(html, /href="https:\/\/example.com\/\?a=1&amp;b=2"/);
  assert.match(html, /<code>\[code\]\(addm.class\)<\/code>/);
});

test('a slower exercise response cannot replace the current selection', async () => {
  const pending = new Map();
  const ui = browserHarness((url) => url === '/api/exercises'
    ? Promise.resolve(jsonResponse({ exercises: [] }))
    : new Promise((resolve) => pending.set(url, resolve)));
  await settle();
  const first = ui.selectExercise('A');
  const second = ui.selectExercise('B');
  pending.get('/api/exercises/B')(jsonResponse({ exercise: { id: 'B', title: 'Latest', files: [] } }));
  await second;
  pending.get('/api/exercises/A')(jsonResponse({ exercise: { id: 'A', title: 'Stale', files: [] } }));
  await first;
  assert.equal(ui.state.selectedId, 'B');
  assert.equal(ui.state.detail.id, 'B');
  assert.match(ui.el.detail.innerHTML, /Latest/);
  assert.doesNotMatch(ui.el.detail.innerHTML, /Stale/);
});

test('editor sends real TS source unchanged and names the script without claiming to rename mnemonics', async () => {
  const requests = [];
  const script = fs.readFileSync(path.join(repoRoot, 'P3_L10_addm_2023', 'addm.ts'), 'utf8');
  const item = { id: 'P3_L10_addm_2023', scriptName: 'addm', scriptFile: 'addm.ts', scriptLanguage: 'ts', script, files: [] };
  const ui = browserHarness(async (url, options) => {
    requests.push({ url, options });
    return jsonResponse(url === '/api/exercises' ? { exercises: [] } : { exercise: item });
  });
  await settle();
  ui.openEditor('edit', item);
  assert.equal(ui.el.fieldScriptLanguage.disabled, true);
  ui.el.fieldScriptName.value = 'different_filename';
  await ui.saveEditor();
  const request = requests.find(({ options }) => options && options.method === 'PUT');
  const payload = JSON.parse(request.options.body);
  assert.equal(payload.scriptName, 'different_filename');
  assert.equal(payload.scriptLanguage, 'ts');
  assert.equal(payload.script, script);
  assert.equal(payload.instruction, undefined);
  assert.equal(request.options.headers['X-Requested-With'], 'exercise-web');
  await ui.uploadFiles(item.id, [{ name: 'sample.class' }]);
  assert.equal(requests.at(-1).options.headers['X-Requested-With'], 'exercise-web');
  ui.openEditor('create');
  assert.equal(ui.el.fieldScriptLanguage.disabled, false);
});

const browserPath = process.env.EXERCISE_WEB_BROWSER || 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
test('the served page loads its local sanitizer and real course detail under CSP', {
  skip: !fs.existsSync(browserPath) && 'Set EXERCISE_WEB_BROWSER to a Chromium browser to run DOM integration coverage',
}, async t => {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'exercise-web-served-'));
  const collection = path.join(temporary, 'repo');
  fs.mkdirSync(collection);
  fs.cpSync(path.join(repoRoot, 'P3_L10_addm_2023'), path.join(collection, 'P3_L10_addm_2023'), { recursive: true });
  const server = createServer({ repoRoot: collection, quiet: true });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(async () => {
    await new Promise(resolve => server.close(resolve));
    fs.rmSync(temporary, { recursive: true, force: true });
  });
  const result = await promisify(execFile)(browserPath, [
    '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
    `--user-data-dir=${path.join(temporary, 'profile')}`, '--virtual-time-budget=3000',
    '--dump-dom', `http://127.0.0.1:${server.address().port}/`,
  ], { encoding: 'utf8', timeout: 30000, maxBuffer: 4 * 1024 * 1024, windowsHide: true });
  assert.match(result.stdout, /id="countLabel">1 \/ 1 道题/);
  assert.match(result.stdout, /class="detail-title">P3_L10_addm_2023/);
  assert.match(result.stdout, /rowspan="3"/);
  assert.match(result.stdout, /href="\/api\/exercises\/P3_L10_addm_2023\/attachments\/addm.class"/);
  assert.doesNotMatch(result.stdout, /&lt;table/);
});

test('real browser DOMPurify removes active markup and unsafe URLs while preserving course tables', {
  skip: !fs.existsSync(browserPath) && 'Set EXERCISE_WEB_BROWSER to a Chromium browser to run DOM integration coverage',
}, () => {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'exercise-web-render-'));
  try {
    const statement = fs.readFileSync(path.join(repoRoot, 'P3_L10_addm_2023', 'P3_L10_addm_2023.md'), 'utf8');
    const courseHtml = renderMarkdown(statement, { exerciseId: 'P3_L10_addm_2023', files: ['addm.class'] });
    const fixtureHtml = [
      '<table><tr><td rowspan="2" onclick="void 0">safe table</td></tr></table>',
      '<img src="javascript:void(0)" onerror="void 0">',
      '<img src="data:image/png;base64,AAAA"><img src="file:///C:/private.png">',
      '<a href="jav&#x61;script:void(0)">bad</a><a href="../outside">outside</a>',
      '<a href="https://example.com">https</a><a href="mailto:co@example.com">mail</a><a href="#encoding">anchor</a>',
      '<iframe src="https://example.com"></iframe><form><input name="detail"></form>',
      '<script>void 0</script><object data="https://example.com"></object><embed src="https://example.com">',
      '<svg onload="void 0"></svg><math></math>',
      courseHtml,
    ].join('');
    const run = `
      const clean = sanitizeStatement(${JSON.stringify(fixtureHtml).replace(/</g, '\\u003c')});
      const output = document.createElement('div'); output.innerHTML = clean;
      const result = {
        unsafe: output.querySelectorAll('script,iframe,form,input,svg,math,object,embed,[onclick],[onerror],[onload],[id],[style]').length,
        badUrls: [...output.querySelectorAll('[href],[src]')].map(n => n.getAttribute('href') || n.getAttribute('src')).filter(u => !statementUrlPattern.test(u)),
        tables: output.querySelectorAll('table').length,
        spanning: output.querySelectorAll('td[rowspan="3"]').length,
        attachment: !!output.querySelector('a[href="/api/exercises/P3_L10_addm_2023/attachments/addm.class"]'),
        allowed: ['https://example.com','mailto:co@example.com','#encoding'].every(u => [...output.querySelectorAll('a')].some(a => a.getAttribute('href') === u)),
      };
      const report = document.createElement('pre'); report.id = 'test-result'; report.textContent = JSON.stringify(result); document.body.append(report);
    `;
    let page = fs.readFileSync(path.join(webRoot, 'public', 'index.html'), 'utf8');
    page = page.replace('<script src="/vendor/purify.min.js"></script>', `<script src="${pathToFileURL(path.join(webRoot, 'public', 'vendor', 'purify.min.js')).href}"></script>`)
      .replace('<script src="/app.js"></script>', `<script>window.fetch = async () => ({ok:true,headers:{get:()=> 'application/json'},json:async()=>({exercises:[]})});</script><script src="${pathToFileURL(path.join(webRoot, 'public', 'app.js')).href}"></script><script>${run}</script>`);
    const fixture = path.join(temporary, 'fixture.html');
    fs.writeFileSync(fixture, page);
    const result = spawnSync(browserPath, ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', `--user-data-dir=${path.join(temporary, 'profile')}`, '--dump-dom', pathToFileURL(fixture).href], { encoding: 'utf8', timeout: 30000, maxBuffer: 4 * 1024 * 1024, windowsHide: true });
    assert.equal(result.error, undefined, String(result.error));
    assert.equal(result.status, 0, result.stderr);
    const report = /<pre id="test-result">([^<]+)<\/pre>/.exec(result.stdout);
    assert.ok(report, result.stdout.slice(-2500));
    const observed = JSON.parse(report[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&'));
    assert.deepEqual(observed, { unsafe: 0, badUrls: [], tables: 2, spanning: 1, attachment: true, allowed: true });
  } finally {
    fs.rmSync(temporary, { recursive: true, force: true });
  }
});
