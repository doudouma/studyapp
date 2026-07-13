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

// --- Init ---
document.addEventListener('DOMContentLoaded', async () => {
  await checkAuth();

  // Tab switching
  $$('.tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      $$('.tab').forEach((t) => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      $$('.tab-content').forEach((tc) => tc.classList.remove('active'));
      const target = document.getElementById(`tab-${tab.dataset.tab}`);
      if (target) target.classList.add('active');

      if (tab.dataset.tab === 'pages') {
        loadPages();
      }
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
  $('#pagesLoginBtn').addEventListener('click', openLoginPage);

  // Upload button
  $('#uploadBtn').addEventListener('click', handleUpload);

  // Result actions
  $('#copyUrlBtn').addEventListener('click', copyUrl);
  $('#openUrlBtn').addEventListener('click', openUrl);
  $('#resetBtn').addEventListener('click', resetUpload);

  // Refresh pages
  $('#refreshPagesBtn').addEventListener('click', loadPages);

  // Title input
  $('#titleInput').addEventListener('input', updateUploadState);

  // Check for pending HTML from context menu (retry a few times since background
  // may still be fetching it from the content script)
  tryGetPendingHtml(0);

  // Listen for messages from content script
  chrome.runtime.onMessage.addListener((message) => {
    if (message.action === 'fillHtml') {
      fillHtmlContent(message.html);
    }
  });
});

function tryGetPendingHtml(retry) {
  chrome.runtime.sendMessage({ action: 'getPendingHtml' }, (response) => {
    if (response?.html) {
      fillHtmlContent(response.html);
    } else if (retry < 10) {
      setTimeout(() => tryGetPendingHtml(retry + 1), 200);
    }
  });
}

function fillHtmlContent(html) {
  // Switch to paste mode
  $$('.mode-btn').forEach((b) => b.classList.remove('active'));
  document.querySelector('[data-mode="paste"]').classList.add('active');
  $$('.upload-panel').forEach((p) => p.classList.remove('active'));
  $('#upload-paste').classList.add('active');
  $('#htmlInput').value = html;
  updateSize();
  updateUploadState();
}

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
    formData.append('shareToSquare', String(shareToSquare));

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
  renderAuthState();
  updateSize();
}

function openLoginPage() {
  getApiBase().then((base) => {
    chrome.tabs.create({ url: base });
  });
}

// --- My Pages ---
async function loadPages() {
  if (!loggedIn) return;

  const container = $('#pagesContainer');
  const loading = $('#pagesLoading');
  const errorEl = $('#pagesError');
  const emptyEl = $('#pagesEmpty');

  container.innerHTML = '';
  errorEl.classList.add('hidden');
  emptyEl.classList.add('hidden');
  loading.classList.remove('hidden');

  const apiBase = await getApiBase();
  try {
    const res = await fetch(`${apiBase}/api/pages`, {
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to load pages');
    const data = await res.json();

    loading.classList.add('hidden');

    if (!data.pages || data.pages.length === 0) {
      emptyEl.classList.remove('hidden');
      $('#pagesCount').textContent = '0 pages';
      return;
    }

    $('#pagesCount').textContent = `${data.total} pages`;

    data.pages.forEach((pg) => {
      const item = document.createElement('div');
      item.className = 'page-item';
      item.dataset.id = pg.id;

      const created = new Date(pg.createdAt);
      const dateStr = `${created.getFullYear()}/${String(created.getMonth() + 1).padStart(2, '0')}/${String(created.getDate()).padStart(2, '0')}`;

      item.innerHTML = `
        <div class="page-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
        </div>
        <div class="page-info">
          <div class="page-title">${escapeHtml(pg.title || 'Untitled')}</div>
          <div class="page-meta">${dateStr} · ${pg.viewCount} views</div>
        </div>
        <div class="page-actions">
          <button class="btn-icon-small page-copy" title="Copy link">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
          </button>
          <button class="btn-icon-small page-open" title="Open in new tab">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15 3 21 3 21 9"/>
              <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
          </button>
          <button class="btn-icon-small page-delete" title="Delete">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
        </div>
      `;

      // Copy
      item.querySelector('.page-copy').addEventListener('click', async (e) => {
        e.stopPropagation();
        const url = `${apiBase}/p/${pg.id}`;
        try {
          await navigator.clipboard.writeText(url);
          const btn = e.currentTarget;
          btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#006c49" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>';
          setTimeout(() => {
            btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;
          }, 1500);
        } catch {
          const input = document.createElement('input');
          input.value = url;
          document.body.appendChild(input);
          input.select();
          document.execCommand('copy');
          document.body.removeChild(input);
        }
      });

      // Open
      item.querySelector('.page-open').addEventListener('click', (e) => {
        e.stopPropagation();
        chrome.tabs.create({ url: `${apiBase}/p/${pg.id}` });
      });

      // Delete
      item.querySelector('.page-delete').addEventListener('click', async (e) => {
        e.stopPropagation();
        if (!confirm(`Delete "${pg.title || 'Untitled'}"?`)) return;

        const btn = e.currentTarget;
        item.classList.add('page-deleting');
        try {
          const res = await fetch(`${apiBase}/api/pages/${pg.id}`, {
            method: 'DELETE',
            credentials: 'include',
          });
          if (!res.ok) throw new Error('Delete failed');
          item.remove();
          const count = container.querySelectorAll('.page-item').length;
          $('#pagesCount').textContent = `${count} pages`;
          if (count === 0) {
            $('#pagesEmpty').classList.remove('hidden');
          }
        } catch (err) {
          item.classList.remove('page-deleting');
          showError(err.message);
        }
      });

      container.appendChild(item);
    });
  } catch (err) {
    loading.classList.add('hidden');
    errorEl.textContent = err.message;
    errorEl.classList.remove('hidden');
  }
}
