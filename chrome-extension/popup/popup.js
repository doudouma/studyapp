const API_BASE = 'https://100mini.com';

function getApiBase() {
  return Promise.resolve(API_BASE);
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function $(sel) { return document.querySelector(sel); }
function $$(sel) { return document.querySelectorAll(sel); }

// --- State ---
let file = null;
let loggedIn = false;
let currentUser = null;
let expiryPreset = 'permanent';   // permanent | 1h | 1d | 7d | 30d | custom
let maxViews = null;              // null = unlimited (∞); 1 = one-time

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
const MAX_EXPIRY_MS = 30 * DAY_MS;

function computeCustomMs() {
  const amount = Math.max(1, Math.floor(Number($('#expiryAmount').value) || 1));
  const unit = $('#expiryUnit').value;
  const ms = amount * (unit === 'h' ? HOUR_MS : DAY_MS);
  return Math.min(Math.max(ms, 60 * 1000), MAX_EXPIRY_MS);
}

// Truly permanent = no expiry and no view limit. Limited links burn and
// therefore cannot be shared to the Square (matches the web UI).
function isTrulyPermanent() {
  return expiryPreset === 'permanent' && maxViews == null;
}

function renderExpiryState() {
  $$('#expirySeg .seg-btn').forEach((b) => b.classList.toggle('active', b.dataset.expiry === expiryPreset));
  $$('#viewsSeg .seg-btn').forEach((b) => {
    const v = b.dataset.views;
    const active = v === 'inf' ? maxViews == null : maxViews === Number(v);
    b.classList.toggle('active', active);
  });
  $('#expiryCustom').classList.toggle('hidden', expiryPreset !== 'custom');
  $('#oneTimeCheck').checked = maxViews === 1;
  $('#shareLabel').classList.toggle('hidden', !isTrulyPermanent());
}

// --- Init ---
document.addEventListener('DOMContentLoaded', async () => {
  await checkAuth();

  // Tab switching. "My Pages" leaves the popup: the real dashboard (page list,
  // stats, per-page actions, API keys) is /links, and mirroring it in a 396px
  // popup only ever duplicated it badly.
  $$('.tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      if (tab.dataset.tab === 'pages') {
        openMyPages();
        return;
      }

      $$('.tab').forEach((t) => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      $$('.tab-content').forEach((tc) => tc.classList.remove('active'));
      const target = document.getElementById(`tab-${tab.dataset.tab}`);
      if (target) target.classList.add('active');
    });
  });

  // Mode switching
  $$('.mode-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      $$('.mode-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const mode = btn.dataset.mode;
      $$('.upload-panel').forEach((p) => p.classList.remove('active'));
      $(`#upload-${mode}`).classList.add('active');

      if (mode === 'file') {
        $('#htmlInput').value = '';
        updateSize();
      } else {
        file = null;
        $('#fileInfo').classList.add('hidden');
        $('#dropzone').classList.remove('hidden');
      }
      updateUploadState();
    });
  });

  // Textarea
  $('#htmlInput').addEventListener('input', () => {
    if ($('#htmlInput').value.trim()) {
      file = null;
      $('#fileInfo').classList.add('hidden');
      $('#dropzone').classList.remove('hidden');
    }
    updateSize();
    updateUploadState();
  });

  // Dropzone - drag events only; click is handled by the visible file input
  const dz = $('#dropzone');
  dz.addEventListener('dragover', (e) => {
    e.preventDefault();
    dz.classList.add('dragover');
  });
  dz.addEventListener('dragleave', () => dz.classList.remove('dragover'));
  dz.addEventListener('drop', (e) => {
    e.preventDefault();
    dz.classList.remove('dragover');
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  });

  $('#fileInput').addEventListener('change', (e) => {
    const f = e.target.files[0];
    if (f) handleFile(f);
  });

  $('#removeFileBtn').addEventListener('click', () => {
    file = null;
    $('#fileInput').value = '';
    $('#fileInfo').classList.add('hidden');
    $('#dropzone').classList.remove('hidden');
    updateUploadState();
  });

  // Login button
  $('#loginBtn').addEventListener('click', openLoginPage);

  // Upload button
  $('#uploadBtn').addEventListener('click', handleUpload);

  // Result actions
  $('#copyUrlBtn').addEventListener('click', copyUrl);
  $('#openUrlBtn').addEventListener('click', openUrl);
  $('#resetBtn').addEventListener('click', resetUpload);

  // Title input
  $('#titleInput').addEventListener('input', updateUploadState);

  // Expiry & burn options
  $$('#expirySeg .seg-btn').forEach((b) => {
    b.addEventListener('click', () => {
      expiryPreset = b.dataset.expiry;
      renderExpiryState();
    });
  });
  $$('#viewsSeg .seg-btn').forEach((b) => {
    b.addEventListener('click', () => {
      const v = b.dataset.views;
      maxViews = v === 'inf' ? null : Number(v);
      renderExpiryState();
    });
  });
  $('#oneTimeCheck').addEventListener('change', (e) => {
    maxViews = e.target.checked ? 1 : null;
    renderExpiryState();
  });
  renderExpiryState();
});

async function checkAuth() {
  const apiBase = await getApiBase();
  try {
    const res = await fetch(`${apiBase}/api/me`, {
      credentials: 'include',
    });
    if (res.ok) {
      const data = await res.json();
      loggedIn = !!data.user;
      currentUser = data.user || null;
    } else {
      loggedIn = false;
      currentUser = null;
    }
  } catch {
    loggedIn = false;
    currentUser = null;
  }
  renderAuthState();
}

function renderAuthState() {
  if (loggedIn && currentUser) {
    $('#authOptions').classList.remove('hidden');
    $('#anonymousInfo').classList.add('hidden');
    // Show user name
    const nameEl = document.createElement('div');
    nameEl.className = 'user-badge';
    nameEl.innerHTML = `
      <span style="font-size:11px;color:var(--green);font-weight:600;margin-bottom:8px;display:block;">
        ${escapeHtml(currentUser.name || currentUser.email)}
      </span>`;
    const authSection = $('#authOptions');
    const existing = authSection.querySelector('.user-badge');
    if (existing) existing.remove();
    authSection.insertBefore(nameEl, authSection.firstChild);
  } else {
    $('#authOptions').classList.add('hidden');
    $('#anonymousInfo').classList.remove('hidden');
  }
  // "My Pages" only exists for signed-in users: anonymous uploads disappear
  // after 7 days and are not listed anywhere.
  const myPagesTab = $('.tab[data-tab="pages"]');
  if (myPagesTab) myPagesTab.classList.toggle('hidden', !(loggedIn && currentUser));
  updateUploadState();
}

function updateSize() {
  const text = $('#htmlInput').value;
  const bytes = new Blob([text]).size;
  const display = file ? file.size : bytes;
  const el = $('#sizeDisplay');
  el.textContent = formatSize(display);
  el.style.color = display > 5 * 1024 * 1024 ? 'var(--danger)' : '';
}

function updateUploadState() {
  const hasContent = $('#htmlInput').value.trim().length > 0;
  const hasFile = file !== null;
  const canSubmit = hasContent || hasFile;
  const btn = $('#uploadBtn');
  btn.disabled = !canSubmit;
}

function handleFile(f) {
  const name = f.name.toLowerCase();
  const valid = name.endsWith('.html') || name.endsWith('.htm') || name.endsWith('.zip');
  if (!valid) {
    showError('Only .html, .htm, or .zip files are supported');
    return;
  }
  if (f.size > 5 * 1024 * 1024) {
    showError('File size must not exceed 5MB');
    return;
  }
  file = f;
  $('#fileName').textContent = f.name;
  $('#fileSize').textContent = formatSize(f.size);
  $('#dropzone').classList.add('hidden');
  $('#fileInfo').classList.remove('hidden');
  updateSize();
  updateUploadState();
}

function showError(msg) {
  const el = $('#errorMsg');
  el.textContent = msg;
  el.classList.remove('hidden');
  setTimeout(() => el.classList.add('hidden'), 5000);
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

async function handleUpload() {
  const apiBase = await getApiBase();
  const isPaste = document.querySelector('[data-mode="paste"]').classList.contains('active');
  const content = $('#htmlInput').value.trim();
  const title = $('#titleInput').value.trim();
  const category = $('#categorySelect').value;
  const tags = $('#tagsInput').value;
  const shareToSquare = $('#shareCheck').checked;

  if (isPaste && !content) { showError('Please paste HTML code'); return; }
  if (!isPaste && !file) { showError('Please select a file'); return; }
  if (loggedIn && !title) { showError('Title is required for logged-in users'); return; }

  // Check size
  const size = isPaste ? new Blob([content]).size : file.size;
  if (size > 5 * 1024 * 1024) { showError('Content size must not exceed 5MB'); return; }

  // Show uploading state
  $('#uploadBtn').classList.add('hidden');
  $('#uploadingOverlay').classList.remove('hidden');
  $('#errorMsg').classList.add('hidden');

  try {
    const formData = new FormData();
    if (isPaste) {
      formData.append('content', content);
    } else {
      formData.append('file', file);
    }
    formData.append('title', title);
    formData.append('category', category);
    formData.append('tags', tags);
    // Limited (expiring / view-capped / one-time) links cannot be shared
    formData.append('shareToSquare', String(shareToSquare && isTrulyPermanent()));
    if (loggedIn) {
      formData.append('expiryPreset', expiryPreset);
      if (expiryPreset === 'custom') {
        formData.append('expiryCustomMs', String(computeCustomMs()));
      }
      formData.append('maxViews', maxViews == null ? 'inf' : String(maxViews));
    }

    const res = await fetch(`${apiBase}/api/upload`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || 'Upload failed');
    }

    showResult(json, apiBase);
  } catch (err) {
    $('#uploadingOverlay').classList.add('hidden');
    $('#uploadBtn').classList.remove('hidden');
    showError(err.message);
  }
}

function showResult(data, apiBase) {
  $('#uploadBtn').classList.add('hidden');
  $('#uploadingOverlay').classList.add('hidden');
  $('#tab-upload').querySelector('.upload-modes').classList.add('hidden');
  $('#upload-paste').classList.add('hidden');
  $('#upload-file').classList.add('hidden');
  $('#authOptions').classList.add('hidden');
  $('#anonymousInfo').classList.add('hidden');
  $('#errorMsg').classList.add('hidden');

  const fullUrl = `${apiBase}${data.url}`;
  $('#resultUrl').value = fullUrl;
  currentResultUrl = fullUrl;
  $('#resultCard').classList.remove('hidden');
}

let currentResultUrl = '';

async function copyUrl() {
  try {
    await navigator.clipboard.writeText(currentResultUrl);
    const btn = $('#copyUrlBtn');
    const orig = btn.textContent;
    btn.textContent = 'Copied';
    setTimeout(() => { btn.textContent = orig; }, 2000);
  } catch {
    // fallback
    const input = $('#resultUrl');
    input.select();
    document.execCommand('copy');
  }
}

function openUrl() {
  if (currentResultUrl) {
    chrome.tabs.create({ url: currentResultUrl });
  }
}

function resetUpload() {
  $('#resultCard').classList.add('hidden');
  $('#uploadBtn').classList.remove('hidden');
  $('#tab-upload').querySelector('.upload-modes').classList.remove('hidden');
  $('#upload-paste').classList.add('active');
  $('#upload-file').classList.remove('active');
  document.querySelector('[data-mode="paste"]').classList.add('active');
  document.querySelector('[data-mode="file"]').classList.remove('active');
  $('#htmlInput').value = '';
  file = null;
  $('#fileInput').value = '';
  $('#fileInfo').classList.add('hidden');
  $('#dropzone').classList.remove('hidden');
  $('#titleInput').value = '';
  $('#tagsInput').value = '';
  $('#shareCheck').checked = false;
  expiryPreset = 'permanent';
  maxViews = null;
  renderExpiryState();
  renderAuthState();
  updateSize();
}

function openLoginPage() {
  getApiBase().then((base) => {
    chrome.tabs.create({ url: base });
  });
}

// --- My Pages ---
// The popup used to render the page list itself but never un-hid the list
// container, so a signed-in user only ever saw the "log in" prompt. /links is
// the real dashboard (list, stats, per-page actions, API keys), so hand off.
const MY_PAGES_PATH = '/links';

function openMyPages() {
  chrome.tabs.create({ url: `${API_BASE}${MY_PAGES_PATH}` }, () => {
    // Close the popup so the new tab is not left behind it.
    window.close();
  });
}
