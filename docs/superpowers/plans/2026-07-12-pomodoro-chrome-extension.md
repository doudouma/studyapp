# 100mini 番茄钟 Chrome 扩展 — 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个独立的 Chrome 扩展，在 popup 中提供完整的番茄钟计时器（含 Sprite 生长动画），登录 100mini 后同步数据。

**Architecture:** Service Worker 管理计时状态机（chrome.alarms 每秒触发），chrome.storage.local 持久化状态，Popup 只做渲染和用户交互。完成时发系统通知并调用 API 同步。

**Tech Stack:** Manifest V3, Chrome Extension APIs (alarms, notifications, storage), 复用 100mini 现有 API

---

### Task 1: 项目脚手架 — manifest + icons + 目录

**Files:**
- Create: `chrome-extension-pomodoro/manifest.json`
- Create: `chrome-extension-pomodoro/popup/popup.html`
- Create: `chrome-extension-pomodoro/popup/popup.css`
- Create: `chrome-extension-pomodoro/popup/popup.js`
- Create: `chrome-extension-pomodoro/background.js`

- [ ] **Step 1: 创建目录结构**

```bash
mkdir -p chrome-extension-pomodoro/popup chrome-extension-pomodoro/icons
```

- [ ] **Step 2: 复制图标（复用 100mini 品牌图标）**

```bash
cp chrome-extension/icons/* chrome-extension-pomodoro/icons/
```

- [ ] **Step 3: 创建 manifest.json**

```json
{
  "manifest_version": 3,
  "name": "100mini 番茄钟",
  "version": "1.0.0",
  "description": "在浏览器中随时使用番茄钟，登录 100mini 同步专注数据",
  "homepage_url": "https://100mini.com",
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  },
  "action": {
    "default_popup": "popup/popup.html",
    "default_title": "100mini 番茄钟",
    "default_icon": {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  },
  "background": {
    "service_worker": "background.js",
    "type": "module"
  },
  "permissions": [
    "alarms",
    "notifications",
    "storage"
  ],
  "host_permissions": [
    "https://100mini.com/*",
    "http://localhost:3000/*",
    "http://localhost:5173/*",
    "http://localhost:5174/*"
  ]
}
```

- [ ] **Step 4: 创建骨架文件（空占位）**

```bash
touch chrome-extension-pomodoro/background.js
touch chrome-extension-pomodoro/popup/popup.html
touch chrome-extension-pomodoro/popup/popup.css
touch chrome-extension-pomodoro/popup/popup.js
```

- [ ] **Step 5: Commit**

```bash
git add chrome-extension-pomodoro/
git commit -m "chore: scaffold pomodoro chrome extension project"
```

---

### Task 2: Service Worker — 计时状态机

**Files:**
- Modify: `chrome-extension-pomodoro/background.js`

- [ ] **Step 1: 定义存储结构和常量**

```javascript
const API_BASE = 'https://100mini.com';
const ALARM_NAME = 'pomodoro-tick';

const DEFAULT_SETTINGS = {
  focusDuration: 25 * 60,
  shortBreakDuration: 5 * 60,
  longBreakDuration: 15 * 60,
  soundEnabled: true,
};

const DEFAULT_STATE = {
  mode: 'focus',
  status: 'idle',
  timeLeft: DEFAULT_SETTINGS.focusDuration,
  totalTime: DEFAULT_SETTINGS.focusDuration,
  endTime: null,
  sessionCount: 0,
  lastSyncDate: '',
  settings: { ...DEFAULT_SETTINGS },
};

function getTodayStr() {
  return new Date().toISOString().slice(0, 10);
}

function getDurationForMode(mode, settings) {
  switch (mode) {
    case 'focus': return settings.focusDuration;
    case 'shortBreak': return settings.shortBreakDuration;
    case 'longBreak': return settings.longBreakDuration;
  }
}
```

- [ ] **Step 2: 实现存储读写**

```javascript
async function getState() {
  const data = await chrome.storage.local.get('pomodoro');
  return data.pomodoro || { ...DEFAULT_STATE, lastSyncDate: getTodayStr() };
}

async function setState(partial) {
  const current = await getState();
  const next = { ...current, ...partial };
  await chrome.storage.local.set({ pomodoro: next });
  return next;
}

async function resetDailyCount(state) {
  const today = getTodayStr();
  if (state.lastSyncDate !== today) {
    return setState({ sessionCount: 0, lastSyncDate: today });
  }
  return state;
}
```

- [ ] **Step 3: 实现 Alarm 回调（每秒计时核心）**

```javascript
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name !== ALARM_NAME) return;

  let state = await getState();
  state = await resetDailyCount(state);
  if (state.status !== 'running') return;

  const now = Date.now();
  if (state.endTime && now >= state.endTime) {
    await handleTimerComplete(state);
    return;
  }

  const timeLeft = Math.max(0, Math.round((state.endTime - now) / 1000));
  await setState({ timeLeft });
});
```

- [ ] **Step 4: 实现计时完成处理**

```javascript
async function handleTimerComplete(state) {
  chrome.alarms.clear(ALARM_NAME);

  if (state.mode === 'focus') {
    const newCount = state.sessionCount + 1;
    await setState({ status: 'idle', sessionCount: newCount });

    // API sync
    syncSession(state.totalTime);

    // Show notification
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: '🍅 专注完成！',
      message: newCount % 4 === 0 ? '已完成 4 个番茄，来次长休息吧！' : '该休息一下了！',
    });

    // Auto-start break after notification
    const nextMode = (newCount % 4 === 0) ? 'longBreak' : 'shortBreak';
    const duration = getDurationForMode(nextMode, state.settings);
    await startTimer(nextMode, duration);
  } else {
    // Break complete
    await setState({ status: 'idle' });

    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: '☕ 休息结束！',
      message: '开始新一轮专注吧',
    });

    // Auto-start focus
    await startTimer('focus', state.settings.focusDuration);
  }
}

async function syncSession(duration) {
  try {
    const res = await fetch(`${API_BASE}/api/pomodoro/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ duration }),
      credentials: 'include',
    });
    if (!res.ok) console.warn('Sync failed:', await res.text());
  } catch (e) {
    console.warn('Sync error:', e);
  }
}
```

- [ ] **Step 5: 实现 startTimer / pause / resume / reset**

```javascript
async function startTimer(mode, duration) {
  const settings = (await getState()).settings;
  const totalTime = duration || getDurationForMode(mode, settings);
  const endTime = Date.now() + totalTime * 1000;

  await setState({
    mode,
    status: 'running',
    timeLeft: totalTime,
    totalTime,
    endTime,
  });

  chrome.alarms.create(ALARM_NAME, { periodInMinutes: 1 / 60 });
}

async function pauseTimer() {
  const state = await getState();
  chrome.alarms.clear(ALARM_NAME);
  await setState({ status: 'paused', endTime: null });
}

async function resumeTimer() {
  const state = await getState();
  if (state.status !== 'paused') return;

  const endTime = Date.now() + state.timeLeft * 1000;
  await setState({ status: 'running', endTime });
  chrome.alarms.create(ALARM_NAME, { periodInMinutes: 1 / 60 });
}

async function resetTimer() {
  chrome.alarms.clear(ALARM_NAME);
  const state = await getState();
  const totalTime = getDurationForMode('focus', state.settings);
  await setState({
    mode: 'focus',
    status: 'idle',
    timeLeft: totalTime,
    totalTime,
    endTime: null,
  });
}

async function skipTimer() {
  const state = await getState();
  chrome.alarms.clear(ALARM_NAME);
  // Mark as idle, then handle as if completed (but don't count focus)
  await setState({ status: 'idle', endTime: null });
  if (state.mode === 'focus') {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: '⏭️ 已跳过',
      message: '专注已跳过',
    });
  }
}
```

- [ ] **Step 6: 消息处理（接收 Popup 指令）**

```javascript
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case 'getState':
      getState().then(sendResponse);
      return true;
    case 'start':
      startTimer(message.mode, message.duration).then(sendResponse);
      return true;
    case 'pause':
      pauseTimer().then(sendResponse);
      return true;
    case 'resume':
      resumeTimer().then(sendResponse);
      return true;
    case 'reset':
      resetTimer().then(sendResponse);
      return true;
    case 'skip':
      skipTimer().then(sendResponse);
      return true;
    case 'updateSettings':
      setState({ settings: message.settings }).then(() => {
        // If idle, update timeLeft to new focus duration
        return getState().then(s => {
          if (s.status === 'idle') {
            const d = getDurationForMode('focus', message.settings);
            return setState({ timeLeft: d, totalTime: d });
          }
        });
      }).then(sendResponse);
      return true;
  }
});
```

- [ ] **Step 7: 浏览器启动时恢复（处理浏览器关闭后残留的计时）**

```javascript
chrome.runtime.onStartup.addListener(async () => {
  const state = await getState();
  if (state.status === 'running') {
    // Timer was running when browser closed — check if expired
    if (state.endTime && Date.now() >= state.endTime) {
      await handleTimerComplete(state);
    } else if (state.endTime) {
      // Resume with corrected endTime
      const timeLeft = Math.round((state.endTime - Date.now()) / 1000);
      await setState({ timeLeft });
      chrome.alarms.create(ALARM_NAME, { periodInMinutes: 1 / 60 });
    }
  }
});
```

- [ ] **Step 8: 安装时初始化**

```javascript
chrome.runtime.onInstalled.addListener(async () => {
  const state = await getState();
  if (!state.lastSyncDate) {
    await setState({ lastSyncDate: getTodayStr() });
  }
  // Set default notification permission
  if (chrome.notifications) {
    // Notifications API doesn't need permission in MV3 if declared
  }
});
```

- [ ] **Step 9: Commit**

```bash
git add chrome-extension-pomodoro/background.js
git commit -m "feat: implement pomodoro timer service worker"
```

---

### Task 3: Popup HTML + CSS

**Files:**
- Modify: `chrome-extension-pomodoro/popup/popup.html`
- Modify: `chrome-extension-pomodoro/popup/popup.css`

- [ ] **Step 1: Popup HTML**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>100mini 番茄钟</title>
  <link rel="stylesheet" href="popup.css">
</head>
<body>
  <div id="app">
    <!-- Header -->
    <header class="header">
      <div class="header-left">
        <div class="logo">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14.5 4-5 16"/>
          </svg>
        </div>
        <span class="header-title">100mini 番茄钟</span>
      </div>
      <div class="header-right">
        <button id="settingsBtn" class="btn-icon" title="设置">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
          </svg>
        </button>
      </div>
    </header>

    <!-- Settings Drawer -->
    <div id="settingsDrawer" class="drawer hidden">
      <div class="drawer-backdrop"></div>
      <div class="drawer-content">
        <div class="drawer-header">
          <span class="drawer-title">番茄钟 设置</span>
          <button id="closeSettingsBtn" class="btn-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="drawer-body">
          <div class="field">
            <label class="field-label">专注时长</label>
            <select id="settingFocus">
              <option value="15">15 分钟</option>
              <option value="20">20 分钟</option>
              <option value="25" selected>25 分钟</option>
              <option value="30">30 分钟</option>
              <option value="40">40 分钟</option>
              <option value="50">50 分钟</option>
            </select>
          </div>
          <div class="field">
            <label class="field-label">短休息</label>
            <select id="settingShortBreak">
              <option value="3">3 分钟</option>
              <option value="5" selected>5 分钟</option>
              <option value="10">10 分钟</option>
            </select>
          </div>
          <div class="field">
            <label class="field-label">长休息</label>
            <select id="settingLongBreak">
              <option value="10">10 分钟</option>
              <option value="15" selected>15 分钟</option>
              <option value="20">20 分钟</option>
              <option value="30">30 分钟</option>
            </select>
          </div>
          <div class="field">
            <label class="checkbox-label">
              <input type="checkbox" id="settingSound" checked>
              提示音
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- Timer Section -->
    <div class="timer-section">
      <div class="sprite-container" id="spriteContainer">
        <img id="spriteImg" src="https://100mini.com/spritesheet2/frame_00.webp" alt="番茄生长">
      </div>

      <div class="time-display" id="timeDisplay">25:00</div>
      <div class="mode-label" id="modeLabel">专注时间</div>

      <div class="controls">
        <button id="startBtn" class="btn btn-primary">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 4 20 12 6 20"/></svg>
          <span id="startBtnText">开始</span>
        </button>
        <button id="resetBtn" class="btn btn-secondary">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
          重置
        </button>
        <button id="skipBtn" class="btn btn-ghost" title="跳过">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 4 20 12 6 20"/><line x1="4" y1="4" x2="4" y2="20"/></svg>
        </button>
      </div>

      <div class="progress-bar">
        <div class="progress-fill" id="progressFill"></div>
      </div>
    </div>

    <!-- Bottom Section -->
    <div class="bottom-section">
      <div id="authSection" class="auth-section">
        <!-- Dynamic: logged in or login prompt -->
      </div>
    </div>
  </div>
  <script src="popup.js"></script>
</body>
</html>
```

- [ ] **Step 2: Popup CSS**

```css
:root {
  --green: #006c49;
  --green-light: #4edea3;
  --green-bg: rgba(0, 108, 73, 0.08);
  --amber: #c49f00;
  --bg: #ffffff;
  --bg-secondary: #f8faf9;
  --border: #d3e4fe;
  --border-light: #e5eeff;
  --text: #1a1a2e;
  --text-secondary: #6b7280;
  --text-muted: #9ca3af;
  --danger: #dc2626;
  --radius: 8px;
  --radius-lg: 12px;
}

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  font-size: 13px;
  color: var(--text);
  background: var(--bg);
  width: 380px;
  overflow-x: hidden;
  min-height: 480px;
}

#app { display: flex; flex-direction: column; height: 100%; }

.hidden { display: none !important; }

/* Header */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border-bottom: 1px solid var(--border-light);
}
.header-left { display: flex; align-items: center; gap: 8px; }
.header-title { font-size: 15px; font-weight: 700; color: var(--green); }
.btn-icon {
  display: flex; align-items: center; justify-content: center;
  width: 30px; height: 30px; border: none; border-radius: var(--radius);
  background: transparent; color: var(--text-secondary); cursor: pointer;
  transition: all 0.15s ease;
}
.btn-icon:hover { background: var(--bg-secondary); color: var(--text); }

/* Timer Section */
.timer-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 14px 12px;
  flex: 1;
}

.sprite-container {
  width: 120px;
  height: 120px;
  margin-bottom: 12px;
}
.sprite-container img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  image-rendering: pixelated;
}

.time-display {
  font-size: 56px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  letter-spacing: 2px;
  color: var(--text);
  line-height: 1;
  margin-bottom: 4px;
}

.mode-label {
  font-size: 14px;
  color: var(--text-secondary);
  font-weight: 500;
  margin-bottom: 16px;
}

.controls {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  border: none;
  border-radius: var(--radius);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  padding: 8px 16px;
  transition: all 0.15s ease;
}
.btn:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-primary {
  background: var(--green);
  color: white;
  min-width: 90px;
}
.btn-primary:hover:not(:disabled) { background: #005a3e; }

.btn-secondary {
  background: var(--bg-secondary);
  color: var(--text);
  border: 1px solid var(--border);
}
.btn-secondary:hover { border-color: var(--green); color: var(--green); }

.btn-ghost {
  background: transparent;
  color: var(--text-muted);
  padding: 8px 10px;
}
.btn-ghost:hover { background: var(--bg-secondary); color: var(--text-secondary); }

.progress-bar {
  width: 100%;
  height: 4px;
  background: var(--border-light);
  border-radius: 2px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: var(--green);
  border-radius: 2px;
  transition: width 0.3s ease;
  width: 100%;
}

/* Bottom Section */
.bottom-section {
  border-top: 1px solid var(--border-light);
  padding: 10px 14px;
}

.auth-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.user-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.user-info-left {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text);
}
.user-info-name { font-weight: 600; }

.today-stat {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--text-secondary);
}
.today-stat strong { color: var(--green); font-size: 14px; }

.login-prompt {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: var(--text-muted);
}

.btn-sm { padding: 5px 10px; font-size: 12px; }
.btn-link {
  background: transparent;
  border: none;
  color: var(--green);
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: var(--radius);
}
.btn-link:hover { background: var(--green-bg); }

/* Settings Drawer */
.drawer-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.3);
  z-index: 100;
}
.drawer-content {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--bg);
  border-radius: 16px 16px 0 0;
  z-index: 101;
  padding: 16px 20px 24px;
  max-height: 80vh;
  overflow-y: auto;
}
.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.drawer-title { font-size: 16px; font-weight: 700; }
.drawer-body { display: flex; flex-direction: column; gap: 14px; }

.field { display: flex; flex-direction: column; gap: 4px; }
.field-label { font-size: 12px; font-weight: 600; color: var(--text); }
.field select {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  font-size: 13px;
  outline: none;
  background: var(--bg);
  color: var(--text);
  appearance: auto;
}
.field select:focus { border-color: var(--green); box-shadow: 0 0 0 2px var(--green-bg); }

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  cursor: pointer;
}
.checkbox-label input[type="checkbox"] { accent-color: var(--green); }
```

- [ ] **Step 3: Commit**

```bash
git add chrome-extension-pomodoro/popup/popup.html chrome-extension-pomodoro/popup/popup.css
git commit -m "feat: add popup HTML and CSS for pomodoro extension"
```

---

### Task 4: Popup JS — 渲染、控制、鉴权

**Files:**
- Modify: `chrome-extension-pomodoro/popup/popup.js`

- [ ] **Step 1: 常量与 DOM 引用**

```javascript
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

// DOM references
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
```

- [ ] **Step 2: 渲染函数**

```javascript
function getFrame(pct) {
  for (const s of STAGES) {
    if (pct >= s.pct) return String(s.frame).padStart(2, '0');
  }
  return '38';
}

async function render(state) {
  const { mode, status, timeLeft, totalTime, sessionCount, settings } = state;

  // Sprite
  const pct = totalTime > 0 ? timeLeft / totalTime : 0;
  const frame = getFrame(pct);
  spriteImg.src = `${SPRITE_BASE}/frame_${frame}.webp`;

  // Time
  const m = Math.floor(timeLeft / 60);
  const s = timeLeft % 60;
  timeDisplay.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  modeLabel.textContent = MODE_LABELS[mode] || '';

  // Progress
  progressFill.style.width = `${(1 - pct) * 100}%`;

  // Button state
  if (status === 'running') {
    startBtnText.textContent = '暂停';
    startBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg> <span>暂停</span>`;
  } else if (status === 'paused') {
    startBtnText.textContent = '继续';
    startBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 4 20 12 6 20"/></svg> <span>继续</span>`;
  } else {
    startBtnText.textContent = '开始';
    startBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 4 20 12 6 20"/></svg> <span>开始</span>`;
  }

  // Session count indicator in progress bar color
  progressFill.style.background = mode === 'focus' ? 'var(--green)' : '#c49f00';
}
```

- [ ] **Step 3: 鉴权与底部渲染**

```javascript
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
```

- [ ] **Step 4: 设置抽屉逻辑**

```javascript
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

// Save settings on change
$$('.drawer-body select, .drawer-body input').forEach(el => {
  el.addEventListener('change', () => {
    const settings = readSettingsFromUI();
    chrome.runtime.sendMessage({ action: 'updateSettings', settings });
  });
});
```

- [ ] **Step 5: 主控逻辑**

```javascript
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
```

- [ ] **Step 6: 监听状态变化 & 初始化**

```javascript
// Listen for storage changes (updates from SW while popup is open)
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
```

- [ ] **Step 7: Commit**

```bash
git add chrome-extension-pomodoro/popup/popup.js
git commit -m "feat: add popup controller with timer render, auth, and settings"
```

---

### Task 5: 加载测试验证

**Files:** (no new files)

- [ ] **Step 1: 在 Chrome 中加载未打包扩展测试**

```bash
# 打开 Chrome → chrome://extensions
# 开启"开发者模式"
# 点击"加载已解压的扩展程序"
# 选择 chrome-extension-pomodoro/ 目录
```

- [ ] **Step 2: 验证功能清单**

1. 点击扩展图标打开 popup，显示 25:00 + Sprite frame_00
2. 点击开始 → 计时开始倒计时，Sprite 随进度变化
3. 点击暂停 → 计时暂停，按钮变"继续"
4. 点击继续 → 继续倒计时
5. 关闭 popup，等待几秒再打开 → 计时仍在继续
6. 计时归零 → 弹出系统通知"🍅 专注完成！"
7. 检查通知后 → 自动进入短休息/长休息模式
8. 点击重置 → 回到 25:00 初始状态
9. 底部显示登录状态（未登录/已登录）
10. 点击设置 → 弹出设置抽屉，修改时长生效
11. 已登录时显示今日番茄数和累计番茄数

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: complete pomodoro chrome extension v1"
```

---

### 实现后验证 checklist

- [ ] Popup 打开不报错
- [ ] 计时器可开始/暂停/继续/重置
- [ ] 关闭 popup 后计时持续
- [ ] 专注完成弹出系统通知
- [ ] Sprite 动画随进度变化
- [ ] 设置保存并生效
- [ ] 登录状态正确显示
- [ ] 已登录时同步番茄数据到 API
