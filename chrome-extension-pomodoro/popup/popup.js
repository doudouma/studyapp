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

const MODE_LABELS = { focus: 'Focus', shortBreak: 'Short Break', longBreak: 'Long Break' };

const STAGE_TEXTS = [
  { pct: 1.00, title: "Plant the seed of focus", desc: "Stay focused, the tomato will grow" },
  { pct: 0.82, title: "It's sprouting!",       desc: "Keep going, it needs your focus" },
  { pct: 0.61, title: "New leaves growing",       desc: "Focus makes it thrive" },
  { pct: 0.43, title: "About to bloom",         desc: "A little more and you'll see the flower" },
  { pct: 0.22, title: "A tiny tomato appears",     desc: "Almost there, the tomato is waiting!" },
  { pct: 0.00, title: "Tomato is ripe!",     desc: "Harvest your focus 🍅" },
];

const BREAK_TEXTS = {
  shortBreak: [
    { title: "Take a Breather", desc: "Drink some water, stretch your legs 🌿" },
    { title: "Relax a Bit", desc: "Stand up, look out the window 🪟" },
    { title: "Pause for a Moment", desc: "Take a deep breath, let your brain rest 🧘" },
    { title: "Slacking Time 🐟", desc: "Scroll your phone, don't let the boss see 🤫" },
    { title: "Recharging ⚡", desc: "Power up for the next round" },
    { title: "Empty Your Mind", desc: "Stare at the ceiling, it's legitimate rest 😌" },
    { title: "Stretch It Out 🙆", desc: "Arms up, big yawn, aaah —" },
    { title: "Look Outside", desc: "Watch the clouds, pretend you're thinking about life 🌤️" },
  ],
  longBreak: [
    { title: "Well Done 🌻", desc: "You've completed a cycle — treat yourself ☕" },
    { title: "Amazing 🎉", desc: "Four tomatoes in a row, that's impressive!" },
    { title: "Give Yourself a Hand 👏", desc: "Go grab a coffee and enjoy the sun ☀️" },
    { title: "Class Dismissed! 🎈", desc: "One cycle done. You deserve a five-minute freedom" },
    { title: "You're in the Top 10%", desc: "Seriously, staying focused this long is a big deal 🏆" },
    { title: "Tomato Harvester 🍅", desc: "Four tomatoes banked — a fruitful day" },
    { title: "Halftime Show 🎤", desc: "Get some water, and think about lunch 🤔" },
    { title: "Zen Mode 🧘", desc: "Empty your mind, regroup, and crush the next round 💪" },
  ],
};

const RING_RADIUS = 80;
const CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

const COLOR_STOPS = [
  { pct: 1.00, bgTop: "#fff8e7", bgBot: "#f5e6d3", ring: "#e6d0b3" },
  { pct: 0.82, bgTop: "#e8f5e9", bgBot: "#d4edda", ring: "#81c784" },
  { pct: 0.61, bgTop: "#e0f2f1", bgBot: "#b2dfdb", ring: "#4db6ac" },
  { pct: 0.43, bgTop: "#fff9e6", bgBot: "#ffe0b2", ring: "#ffb74d" },
  { pct: 0.22, bgTop: "#fff0e6", bgBot: "#ffccbc", ring: "#ff8a65" },
  { pct: 0.00, bgTop: "#ffebee", bgBot: "#ffcdd2", ring: "#e57373" },
];

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex(r, g, b) {
  return "#" + [r, g, b].map(v => Math.round(v).toString(16).padStart(2, "0")).join("");
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function lerpColor(c1, c2, t) {
  const a = hexToRgb(c1), b = hexToRgb(c2);
  return rgbToHex(lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t));
}

function getColors(pct) {
  let start = COLOR_STOPS[0], end = COLOR_STOPS[COLOR_STOPS.length - 1], t = 0;
  for (let i = 0; i < COLOR_STOPS.length - 1; i++) {
    const s = COLOR_STOPS[i], e = COLOR_STOPS[i + 1];
    if (pct <= s.pct && pct >= e.pct) {
      start = s; end = e;
      t = (pct - e.pct) / (s.pct - e.pct || 1);
      break;
    }
  }
  return {
    bgTop: lerpColor(start.bgTop, end.bgTop, t),
    bgBot: lerpColor(start.bgBot, end.bgBot, t),
    ring: lerpColor(start.ring, end.ring, t),
  };
}

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const spriteImg = $('#spriteImg');
const timerRing = $('#timerRing');
const timeDisplay = $('#timeDisplay');
const stageTitle = $('#stageTitle');
const stageDesc = $('#stageDesc');
const mainBtn = $('#mainBtn');
const mainBtnText = $('#mainBtnText');
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

function getStageText(pct, mode, sessionCount) {
  if (mode === 'focus') {
    for (const s of STAGE_TEXTS) {
      if (pct >= s.pct) return s;
    }
    return STAGE_TEXTS[STAGE_TEXTS.length - 1];
  }
  const list = BREAK_TEXTS[mode] || BREAK_TEXTS.shortBreak;
  const idx = Math.min(sessionCount || 0, list.length - 1);
  return list[idx];
}

async function render(state) {
  if (!state) return;
  const { mode, status, timeLeft, totalTime, sessionCount } = state;

  const pct = totalTime > 0 ? timeLeft / totalTime : 0;
  const frame = getFrame(pct);
  spriteImg.src = `${SPRITE_BASE}/frame_${frame}.webp`;

  const m = Math.floor(timeLeft / 60);
  const s = timeLeft % 60;
  timeDisplay.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

  const text = getStageText(pct, mode, sessionCount);
  stageTitle.textContent = text.title;
  stageDesc.textContent = text.desc;

  const colors = getColors(pct);
  const offset = CIRCUMFERENCE * Math.max(0, 1 - pct);
  timerRing.style.strokeDasharray = CIRCUMFERENCE;
  timerRing.style.strokeDashoffset = offset;
  timerRing.style.stroke = colors.ring;

  const app = $('#app');
  if (app) {
    app.style.background = `linear-gradient(180deg, ${colors.bgTop} 0%, ${colors.bgBot} 100%)`;
  }

  if (status === 'running') {
    mainBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg> <span>Pause</span>`;
  } else if (status === 'paused') {
    mainBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 4 20 12 6 20"/></svg> <span>Resume</span>`;
  } else {
    mainBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 4 20 12 6 20"/></svg> <span>Start</span>`;
  }
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
      </div>
      <div class="today-stat">
        🍅 Today: <strong>${stats.today}</strong> &nbsp;·&nbsp; Total: <strong>${stats.total}</strong>
      </div>
    `;
  } else {
    authSection.innerHTML = `
      <div class="login-prompt">
        <span>⏳ Local mode, no sync</span>
        <button id="loginBtn" class="btn-link">🔓 Log in to 100mini</button>
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

mainBtn.addEventListener('click', async () => {
  const state = currentState || await refreshState();
  let action = 'start';
  if (state.status === 'running') action = 'pause';
  else if (state.status === 'paused') action = 'resume';
  chrome.runtime.sendMessage({ action, mode: 'focus' }, refreshState);
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
  $('#loadingState')?.classList.add('hidden');
  if (state) applySettingsToUI(state.settings);
  const user = await checkAuth();
  await renderAuth(user);
});
