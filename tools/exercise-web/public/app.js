'use strict';

/* ------------------------------------------------------------------ *
 * 本地题库前端：浏览 + 管理模式
 * ------------------------------------------------------------------ */

const state = {
  exercises: [],
  readmeDirty: false,
  selectedId: null,
  detail: null,
  admin: false,
  token: localStorage.getItem('co-admin-token') || '',
  editing: null,
  activeTab: 'statement',
  selectionVersion: 0,
  filters: { search: '', stage: '', category: '' },
};

const el = {
  subtitle: document.getElementById('subtitle'),
  search: document.getElementById('search'),
  stageFilter: document.getElementById('stageFilter'),
  categoryFilter: document.getElementById('categoryFilter'),
  adminToggle: document.getElementById('adminToggle'),
  adminbar: document.getElementById('adminbar'),
  createBtn: document.getElementById('createBtn'),
  syncReadmeBtn: document.getElementById('syncReadmeBtn'),
  readmeBadge: document.getElementById('readmeBadge'),
  tokenInput: document.getElementById('tokenInput'),
  countLabel: document.getElementById('countLabel'),
  list: document.getElementById('list'),
  detail: document.getElementById('detail'),
  modal: document.getElementById('modal'),
  modalTitle: document.getElementById('modalTitle'),
  modalClose: document.getElementById('modalClose'),
  modalCancel: document.getElementById('modalCancel'),
  modalSave: document.getElementById('modalSave'),
  modalError: document.getElementById('modalError'),
  fieldId: document.getElementById('fieldId'),
  fieldStatus: document.getElementById('fieldStatus'),
  fieldScriptName: document.getElementById('fieldScriptName'),
  fieldScriptLanguage: document.getElementById('fieldScriptLanguage'),
  fieldStatement: document.getElementById('fieldStatement'),
  fieldScript: document.getElementById('fieldScript'),
  fieldFiles: document.getElementById('fieldFiles'),
  existingAttachments: document.getElementById('existingAttachments'),
  toast: document.getElementById('toast'),
};

el.tokenInput.value = state.token;

/* ----------------------------- helpers ----------------------------- */

function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatSize(bytes) {
  if (!bytes) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

let toastTimer = null;
function toast(message, isError = false) {
  el.toast.textContent = message;
  el.toast.className = `toast${isError ? ' error' : ''}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.toast.classList.add('hidden'), 2600);
}

async function api(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (options.method && options.method !== 'GET') {
    headers['X-Admin-Token'] = state.token;
    headers['X-Requested-With'] = 'exercise-web';
  }
  if (options.json !== undefined) {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(options.json);
  }
  const response = await fetch(path, { ...options, headers });
  if (!response.ok) {
    let message = `HTTP ${response.status}`;
    try {
      const data = await response.json();
      if (data && data.error) message = data.error;
    } catch (_) { /* ignore */ }
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }
  const type = response.headers.get('content-type') || '';
  return type.includes('application/json') ? response.json() : response;
}

/* ------------------------------ list ------------------------------- */

function visibleExercises() {
  const keyword = state.filters.search.trim().toLowerCase();
  return state.exercises.filter((item) => {
    if (state.filters.stage && item.stage !== state.filters.stage) return false;
    const category = item.status === 'supplemented' ? 'supplemented' : item.source?.kind || 'course';
    if (state.filters.category && category !== state.filters.category) return false;
    if (!keyword) return true;
    const haystack = [
      item.id, item.title, item.scriptName, item.scriptFile, item.source?.author, item.source?.year,
      item.status === 'supplemented' ? '残题补全' : '',
      item.source && item.source.problemId,
      item.source && item.source.pieId,
    ].filter(Boolean).join(' ').toLowerCase();
    return haystack.includes(keyword);
  });
}

function renderStages() {
  const stages = [...new Set(state.exercises.map((item) => item.stage))].sort((a, b) => {
    const rank = value => value === 'Pre' ? -1 : Number(/^P(\d+)/.exec(value)?.[1] ?? Infinity);
    return rank(a) - rank(b) || (a < b ? -1 : a > b ? 1 : 0);
  });
  const current = state.filters.stage;
  el.stageFilter.innerHTML = ['<option value="">全部阶段</option>']
    .concat(stages.map((stage) => `<option value="${escapeHtml(stage)}">${escapeHtml(stage)}</option>`))
    .join('');
  el.stageFilter.value = current;
}

function renderList() {
  const items = visibleExercises();
  el.countLabel.textContent = `${items.length} / ${state.exercises.length} 道题`;
  if (!items.length) {
    el.list.innerHTML = '<li class="empty-item" style="color:#6b7280;cursor:default">没有匹配的题目</li>';
    return;
  }
  el.list.innerHTML = items.map((item) => {
    const active = item.id === state.selectedId ? ' active' : '';
    const script = item.scriptFile ? `<code>${escapeHtml(item.scriptFile)}</code>` : '无脚本';
    const source = item.source?.kind === 'blog' ? `${item.source.provenance === 'proposal' ? '博主自拟资料（非考题）' : '博客'} · ${item.source.author || '往届记录'}` : item.source && item.source.problemId
      ? `#${item.source.problemId}${item.source.pieId ? ` · Pie ${item.source.pieId}` : ''}`
      : '无原题编号';
    return `<li data-id="${escapeHtml(item.id)}" class="${active.trim()}">
      <div class="item-title"><span class="stage ${escapeHtml(item.stage)}">${escapeHtml(item.stage)}</span>${escapeHtml(item.id)}</div>
      <div class="item-meta"><span>${script}</span><span>${escapeHtml(source)}${item.status === 'supplemented' ? ' · 残题补全' : ''}</span></div>
    </li>`;
  }).join('');
}

/* ----------------------------- detail ------------------------------ */

function sourceBlock(source) {
  const isBlog = source?.kind === 'blog';
  if (!source || !/^https?:\/\//i.test(source.url || '')) {
    return `<span class="source-link disabled">
      <strong>${isBlog ? '来源博客' : '原题链接'}</strong>
      <small>${isBlog ? '题面未记录有效来源链接' : '题面未记录「题目 ID」'}</small>
    </span>`;
  }
  const parts = isBlog ? [source.author || '博客整理', source.year || '年份未载'] : [`ProblemId ${source.problemId}`];
  if (source.pieId) parts.push(`PieId ${source.pieId}`);
  return `<a class="source-link" href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer">
      <strong>${isBlog ? '查看来源博客' : '查看原题'} ↗</strong>
      <small>${escapeHtml(parts.join(' · '))}</small>
    </a>
    <button class="ghost copy-btn" type="button" data-action="copy-source">复制链接</button>`;
}

function attachmentsBlock(item) {
  if (!item.attachments || !item.attachments.length) {
    return '<p style="color:#6b7280">该题没有附件。</p>';
  }
  return `<div class="attachment-list">${item.attachments.map((file) => `
    <div class="attachment">
      <a href="/api/exercises/${encodeURIComponent(item.id)}/attachments/${encodeURIComponent(file.name)}" download>${escapeHtml(file.name)}</a>
      <span class="size">${formatSize(file.size)}</span>
    </div>`).join('')}</div>`;
}

const statementUrlPattern = /^(?:https?:\/\/|mailto:|#|\/api\/exercises\/[^/]+\/attachments\/[^/?#]+(?:[?#]|$))/i;
let sanitizerHookInstalled = false;

function sanitizeStatement(html) {
  // Fail closed if the local sanitizer could not load. Do not insert untrusted
  // statement markup anywhere else in this application.
  if (!window.DOMPurify || !window.DOMPurify.isSupported) return escapeHtml(html);
  if (!sanitizerHookInstalled) {
    window.DOMPurify.addHook('uponSanitizeAttribute', (_node, data) => {
      if ((data.attrName === 'href' || data.attrName === 'src') && !statementUrlPattern.test(data.attrValue)) {
        data.keepAttr = false;
      }
    });
    sanitizerHookInstalled = true;
  }
  return window.DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['a', 'p', 'br', 'hr', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'strong', 'b', 'em', 'i',
      'del', 's', 'u', 'sub', 'sup', 'span', 'div', 'img', 'table', 'caption',
      'colgroup', 'col', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'details', 'summary'],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'colspan', 'rowspan', 'align',
      'width', 'height', 'loading', 'start', 'reversed', 'scope'],
    ADD_URI_SAFE_ATTR: ['colspan', 'rowspan', 'align', 'width', 'height', 'loading', 'start', 'reversed', 'scope'],
    ALLOW_DATA_ATTR: false,
    ALLOW_ARIA_ATTR: false,
    // Relative URLs are only allowed after the server has mapped an existing
    // exercise file to its constrained attachment endpoint.
    ALLOWED_URI_REGEXP: statementUrlPattern,
  });
}

function renderDetail() {
  const item = state.detail;
  if (!item) {
    el.detail.innerHTML = '<div class="empty">从左侧选择一道题</div>';
    return;
  }
  const source = item.source || {};
  const chips = [
    `<span class="chip"><b>${escapeHtml(item.stage)}</b></span>`,
    `<span class="chip">${item.status === 'supplemented' ? '残题补全' : '行为完整'}${source.kind === 'blog' ? ' · 博客整理' : ''}</span>`,
    item.scriptFile ? `<span class="chip">脚本 <b>${escapeHtml(item.scriptFile)}</b></span>` : '<span class="chip">无脚本</span>',
    `<span class="chip">文件 <b>${item.files ? item.files.length : 0}</b></span>`,
    `<span class="chip">更新 <b>${escapeHtml((item.modified || '').slice(0, 10))}</b></span>`,
  ];
  if (source.provenance === 'proposal') chips.push('<span class="chip">博主自拟资料 · 非考题</span>');
  if (source.project) chips.push(`<span class="chip">项目 <b>${escapeHtml(source.project)}</b></span>`);
  if (source.type) chips.push(`<span class="chip">类型 <b>${escapeHtml(source.type)}</b></span>`);
  if (item.metadataDiagnostic) chips.push(`<span class="chip" title="${escapeHtml(item.metadataDiagnostic)}">元数据待修复</span>`);

  const tabs = [
    ['statement', '题面'],
    ['script', item.scriptLanguage ? `${item.scriptLanguage.toUpperCase()} 脚本` : '脚本'],
    ['attachments', `附件 (${(item.attachments || []).length})`],
  ];

  let body = '';
  if (state.activeTab === 'script') {
    body = item.script
      ? `<pre class="code">${escapeHtml(item.script)}</pre>`
      : '<p style="color:#6b7280">该题没有脚本。</p>';
  } else if (state.activeTab === 'attachments') {
    body = attachmentsBlock(item);
  } else {
    body = `<div class="statement">${sanitizeStatement(item.html || '<p>该题没有题面。</p>')}</div>`;
  }

  const adminActions = state.admin
    ? `<button class="ghost" type="button" data-action="edit">编辑</button>
       <button class="danger" type="button" data-action="delete">删除</button>`
    : '';

  el.detail.innerHTML = `
    <div class="detail-head">
      <h2 class="detail-title">${escapeHtml(item.title || item.id)}</h2>
      <div class="chips">${chips.join('')}</div>
      <div class="actions">
        ${sourceBlock(source)}
        ${adminActions}
      </div>
    </div>
    <div class="tabs">
      ${tabs.map(([key, label]) => `<button class="tab${state.activeTab === key ? ' active' : ''}" type="button" data-tab="${key}">${label}</button>`).join('')}
    </div>
    <div id="tabBody">${body}</div>
  `;
}

async function selectExercise(id) {
  const version = ++state.selectionVersion;
  state.selectedId = id;
  state.detail = null;
  state.activeTab = 'statement';
  renderList();
  el.detail.innerHTML = '<div class="empty">加载中…</div>';
  try {
    const data = await api(`/api/exercises/${encodeURIComponent(id)}`);
    if (version !== state.selectionVersion) return;
    state.detail = data.exercise;
    renderDetail();
  } catch (error) {
    if (version !== state.selectionVersion) return;
    el.detail.innerHTML = '<div class="empty">题目加载失败，请重新选择。</div>';
    toast(`加载失败：${error.message}`, true);
  }
}

/* ------------------------------ admin ------------------------------ */

function setAdmin(enabled) {
  state.admin = enabled;
  el.adminbar.classList.toggle('hidden', !enabled);
  el.adminToggle.classList.toggle('active', enabled);
  el.adminToggle.textContent = enabled ? '退出管理' : '管理模式';
  el.readmeBadge.classList.toggle('hidden', !(enabled && state.readmeDirty));
  if (state.detail) renderDetail();
}

function openEditor(mode, item) {
  state.editing = { mode, id: item ? item.id : null, hasScript: Boolean(item?.scriptFile) };
  el.modalTitle.textContent = mode === 'create' ? '新增题目' : `编辑 ${item.id}`;
  el.modalError.classList.add('hidden');
  el.fieldId.value = item ? item.id : '';
  el.fieldId.disabled = mode === 'edit';
  el.fieldStatus.value = item?.status || 'complete';
  el.fieldScriptName.value = item ? (item.scriptName || '') : '';
  el.fieldScriptLanguage.value = item ? (item.scriptLanguage || 'ts') : 'ts';
  el.fieldScriptLanguage.disabled = Boolean(item && item.scriptFile);
  el.fieldStatement.value = item ? (item.statement || '') : '';
  el.fieldScript.value = item ? (item.script || '') : '';
  el.fieldFiles.value = '';

  if (mode === 'edit' && item.attachments && item.attachments.length) {
    el.existingAttachments.innerHTML = item.attachments.map((file) => `
      <button class="ghost" type="button" data-remove-attachment="${escapeHtml(file.name)}">删除附件 ${escapeHtml(file.name)}</button>
    `).join('');
  } else {
    el.existingAttachments.innerHTML = '';
  }

  el.modal.classList.remove('hidden');
  el.fieldId.focus();
}

function closeEditor() {
  state.editing = null;
  el.modal.classList.add('hidden');
}

async function uploadFiles(id, files) {
  for (const file of files) {
    const response = await fetch(
      `/api/exercises/${encodeURIComponent(id)}/attachments/${encodeURIComponent(file.name)}`,
      { method: 'PUT', headers: { 'X-Admin-Token': state.token, 'X-Requested-With': 'exercise-web' }, body: file },
    );
    if (!response.ok) {
      let message = `HTTP ${response.status}`;
      try { const data = await response.json(); if (data.error) message = data.error; } catch (_) { /* ignore */ }
      throw new Error(`附件 ${file.name} 上传失败：${message}`);
    }
  }
}

async function saveEditor() {
  const mode = state.editing ? state.editing.mode : 'create';
  const id = mode === 'create' ? el.fieldId.value.trim() : state.editing.id;
  const payload = {
    statement: el.fieldStatement.value,
    status: el.fieldStatus.value,
  };
  if (state.editing?.hasScript || el.fieldScriptName.value.trim() || el.fieldScript.value) {
    payload.scriptName = el.fieldScriptName.value.trim();
    payload.scriptLanguage = el.fieldScriptLanguage.value;
    payload.script = el.fieldScript.value;
  }

  el.modalSave.disabled = true;
  el.modalError.classList.add('hidden');
  try {
    let savedId = id;
    if (mode === 'create') {
      const created = await api('/api/exercises', { method: 'POST', json: { id, ...payload } });
      savedId = created.exercise.id;
    } else {
      await api(`/api/exercises/${encodeURIComponent(id)}`, { method: 'PUT', json: payload });
    }
    if (el.fieldFiles.files.length) await uploadFiles(savedId, [...el.fieldFiles.files]);
    closeEditor();
    toast(mode === 'create' ? '已新增题目' : '已保存修改');
    await load();
    await selectExercise(savedId);
    if (state.readmeDirty) toast('题目已变化，记得同步 README 索引');
  } catch (error) {
    el.modalError.textContent = error.message;
    el.modalError.classList.remove('hidden');
    if (error.status === 401) toast('管理令牌无效或缺失', true);
  } finally {
    el.modalSave.disabled = false;
  }
}

async function removeExercise() {
  const item = state.detail;
  if (!item) return;
  const ok = window.confirm(`确定删除「${item.id}」？\n目录会被直接删除，可用 git 恢复。`);
  if (!ok) return;
  try {
    await api(`/api/exercises/${encodeURIComponent(item.id)}`, { method: 'DELETE' });
    ++state.selectionVersion;
    state.detail = null;
    state.selectedId = null;
    toast('已删除');
    await load();
    renderDetail();
  } catch (error) {
    toast(`删除失败：${error.message}`, true);
  }
}

async function deleteAttachment(name) {
  const item = state.detail;
  if (!item) return;
  if (!window.confirm(`删除附件 ${name}？`)) return;
  try {
    await api(`/api/exercises/${encodeURIComponent(item.id)}/attachments/${encodeURIComponent(name)}`, { method: 'DELETE' });
    toast('附件已删除');
    await selectExercise(item.id);
  } catch (error) {
    toast(`删除附件失败：${error.message}`, true);
  }
}

async function syncReadme() {
  try {
    const result = await api('/api/readme', { method: 'POST' });
    toast(result.changed ? 'README 索引已更新' : 'README 索引已是最新');
    await load();
  } catch (error) {
    toast(`同步失败：${error.message}`, true);
  }
}

/* ------------------------------ events ----------------------------- */

el.search.addEventListener('input', () => {
  state.filters.search = el.search.value;
  renderList();
});

el.stageFilter.addEventListener('change', () => {
  state.filters.stage = el.stageFilter.value;
  renderList();
});

el.categoryFilter.addEventListener('change', () => {
  state.filters.category = el.categoryFilter.value;
  renderList();
});

el.adminToggle.addEventListener('click', () => setAdmin(!state.admin));

el.createBtn.addEventListener('click', () => openEditor('create'));

el.syncReadmeBtn.addEventListener('click', syncReadme);

el.tokenInput.addEventListener('change', () => {
  state.token = el.tokenInput.value.trim();
  localStorage.setItem('co-admin-token', state.token);
});

el.list.addEventListener('click', (event) => {
  const li = event.target.closest('li[data-id]');
  if (li) selectExercise(li.dataset.id);
});

el.detail.addEventListener('click', (event) => {
  const tab = event.target.closest('[data-tab]');
  if (tab) {
    state.activeTab = tab.dataset.tab;
    renderDetail();
    return;
  }
  const action = event.target.closest('[data-action]');
  if (!action) return;
  if (action.dataset.action === 'edit') openEditor('edit', state.detail);
  if (action.dataset.action === 'delete') removeExercise();
  if (action.dataset.action === 'copy-source') {
    const url = state.detail && state.detail.source && state.detail.source.url;
    if (url) navigator.clipboard.writeText(url).then(() => toast('来源链接已复制'), () => toast('复制失败', true));
  }
});

el.existingAttachments.addEventListener('click', (event) => {
  const target = event.target.closest('[data-remove-attachment]');
  if (target) deleteAttachment(target.dataset.removeAttachment);
});

el.modalClose.addEventListener('click', closeEditor);
el.modalCancel.addEventListener('click', closeEditor);
el.modalSave.addEventListener('click', saveEditor);

el.modal.addEventListener('click', (event) => {
  if (event.target === el.modal) closeEditor();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !el.modal.classList.contains('hidden')) closeEditor();
});

/* ------------------------------- boot ------------------------------ */

async function load() {
  try {
    const data = await api('/api/exercises');
    state.exercises = data.exercises || [];
    state.readmeDirty = Boolean(data.readme);
    el.subtitle.textContent = `${state.exercises.length} 道题 · ${data.root || ''}`;
    el.readmeBadge.classList.toggle('hidden', !(state.admin && state.readmeDirty));
    renderStages();
    renderList();
  } catch (error) {
    el.list.innerHTML = `<li style="color:#cf222e;cursor:default">无法连接服务：${escapeHtml(error.message)}</li>`;
  }
}

load().then(() => {
  if (location.hash === '#admin') setAdmin(true);
  if (state.exercises.length) selectExercise(state.exercises[0].id);
});
