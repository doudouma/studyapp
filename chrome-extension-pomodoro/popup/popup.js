const API_BASE = 'https://100mini.com';

const SPRITE_BASE = 'https://100mini.com/spritesheet2';
const STAGES = [
  { pct: 1.00, frame: 0 },
  { pct: 0.82, frame: 5 },
  { pct: 0.61, frame: 10 },
  { pct: 0.43, frame: 17 },
  { pct: 0.22, frame: 28 },
  { pct: 0.00, frame: 38 },
];

const MODE_LABELS = { focus: '专注时间', shortBreak: '短休息', longBreak: '长休息' };

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const spriteImg = $('#spriteImg');
const timeDisplay = $('#timeDisplay');
const modeLabel = $('#modeLabel');
const progressFill = $('#progressFill');
const startBtn = $('#startBtn');
const startBtnText = $('#startBtnText');
const resetBtn = $('#resetBtn');
const skipBtn = $('#skipBtn');
const authSection = $('#authSection');
const settingsBtn = $('#settingsBtn');
const settingsDrawer = $('#settingsDrawer');
const closeSettingsBtn = $('#closeSettingsBtn');

function getFrame(pct) {
  for (const s of STAGES) {
    if (pct >= s.pct) return String(s.frame).padStart(2, '0');
  }
  return '38';
}

async function render(state) {
  const { mode, status, timeLeft, totalTime } = state;

  const pct = totalTime > 0 ? timeLeft / totalTime : 0;
  const frame = getFrame(pct);
  spriteImg.src = `${SPRITE_BASE}/frame_${frame}.webp`;

  const m = Math.floor(timeLeft / 60);
  const s = timeLeft % 60;
  timeDisplay.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  modeLabel.textContent = MODE_LABELS[mode] || '';

  progressFill.style.width = `${(1 - pct) * 100}%`;

  if (status === 'running') {
    startBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg> <span>暂停</span>`;
  } else if (status === 'paused') {
    startBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 4 20 12 6 20"/></svg> <span>继续</span>`;
  } else {
    startBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 4 20 12 6 20"/></svg> <span>开始</span>`;
  }

  progressFill.style.background = mode === 'focus' ? 'var(--green)' : '#c49f00';
}

async function checkAuth() {
  try {
    const res = await fetch(`${API_BASE}/api/me`, { credentials: 'include' });
    if (res.ok) {
      const data = await res.json();
      if (data.user) return data.user;
    }
  } catch {}
  return null;
}

async function fetchTodayCount() {
  try {
    const res = await fetch(`${API_BASE}/api/pomodoro/today-count`, { credentials: 'include' });
    if (res.ok) return await res.json();
  } catch {}
  return { today: 0, total: 0 };
}

async function renderAuth(user) {
  if (user) {
    const stats = await fetchTodayCount();
    authSection.innerHTML = `
      <div class="user-info">
        <div class="user-info-left">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--green)" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          <span class="user-info-name">${escapeHtml(user.name || user.email || '')}</span>
        </div>
        <button id="openAppBtn" class="btn-link">📊 查看详情</button>
      </div>
      <div class="today-stat">
        🍅 今日番茄: <strong>${stats.today}</strong> &nbsp;·&nbsp; 累计: <strong>${stats.total}</strong>
      </div>
    `;
    $('#openAppBtn')?.addEventListener('click', () => {
      chrome.tabs.create({ url: `${API_BASE}/pomodoro` });
    });
  } else {
    authSection.innerHTML = `
      <div class="login-prompt">
        <span>⏳ 本地模式，不保存记录</span>
        <button id="loginBtn" class="btn-link">🔓 登录 100mini</button>
      </div>
    `;
    $('#loginBtn')?.addEventListener('click', () => {
      chrome.tabs.create({ url: API_BASE });
    });
  }
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

const SETTING_IDS = {
  focusDuration: 'settingFocus',
  shortBreakDuration: 'settingShortBreak',
  longBreakDuration: 'settingLongBreak',
  soundEnabled: 'settingSound',
};

function readSettingsFromUI() {
  return {
    focusDuration: parseInt($('#settingFocus').value) * 60,
    shortBreakDuration: parseInt($('#settingShortBreak').value) * 60,
    longBreakDuration: parseInt($('#settingLongBreak').value) * 60,
    soundEnabled: $('#settingSound').checked,
  };
}

function applySettingsToUI(settings) {
  $('#settingFocus').value = String(settings.focusDuration / 60);
  $('#settingShortBreak').value = String(settings.shortBreakDuration / 60);
  $('#settingLongBreak').value = String(settings.longBreakDuration / 60);
  $('#settingSound').checked = settings.soundEnabled;
}

settingsBtn.addEventListener('click', () => {
  settingsDrawer.classList.remove('hidden');
});

function closeSettings() {
  settingsDrawer.classList.add('hidden');
}

closeSettingsBtn.addEventListener('click', closeSettings);
settingsDrawer.querySelector('.drawer-backdrop')?.addEventListener('click', closeSettings);

$$('.drawer-body select, .drawer-body input').forEach(el => {
  el.addEventListener('change', () => {
    const settings = readSettingsFromUI();
    chrome.runtime.sendMessage({ action: 'updateSettings', settings });
  });
});

let currentState = null;

async function refreshState() {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ action: 'getState' }, (state) => {
      currentState = state;
      render(state);
      resolve(state);
    });
  });
}

startBtn.addEventListener('click', async () => {
  const state = currentState || await refreshState();
  if (state.status === 'running') {
    chrome.runtime.sendMessage({ action: 'pause' });
    await refreshState();
  } else if (state.status === 'paused') {
    chrome.runtime.sendMessage({ action: 'resume' });
    await refreshState();
  } else {
    chrome.runtime.sendMessage({ action: 'start', mode: 'focus' });
    await refreshState();
  }
});

resetBtn.addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: 'reset' });
  refreshState();
});

skipBtn.addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: 'skip' });
  refreshState();
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.pomodoro) {
    const newState = changes.pomodoro.newValue;
    currentState = newState;
    render(newState);
  }
});

document.addEventListener('DOMContentLoaded', async () => {
  const state = await refreshState();
  applySettingsToUI(state.settings);
  const user = await checkAuth();
  await renderAuth(user);
});
