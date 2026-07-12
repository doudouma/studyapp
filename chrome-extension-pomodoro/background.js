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
    default: return settings.focusDuration;
  }
}

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

async function handleTimerComplete(state) {
  chrome.alarms.clear(ALARM_NAME);

  if (state.mode === 'focus') {
    const newCount = state.sessionCount + 1;
    await setState({ status: 'idle', sessionCount: newCount });

    syncSession(state.totalTime);

    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: '🍅 专注完成！',
      message: newCount % 4 === 0 ? '已完成 4 个番茄，来次长休息吧！' : '该休息一下了！',
    });

    const nextMode = (newCount % 4 === 0) ? 'longBreak' : 'shortBreak';
    const duration = getDurationForMode(nextMode, state.settings);
    await startTimer(nextMode, duration);
  } else {
    await setState({ status: 'idle' });

    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: '☕ 休息结束！',
      message: '开始新一轮专注吧',
    });

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
  const settings = state.settings;
  const totalTime = getDurationForMode('focus', settings);
  await setState({
    mode: 'focus',
    status: 'idle',
    timeLeft: totalTime,
    totalTime,
    endTime: null,
  });
}

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

chrome.runtime.onStartup.addListener(async () => {
  const state = await getState();
  if (state.status === 'running') {
    if (state.endTime && Date.now() >= state.endTime) {
      await handleTimerComplete(state);
    } else if (state.endTime) {
      const timeLeft = Math.round((state.endTime - Date.now()) / 1000);
      await setState({ timeLeft });
      chrome.alarms.create(ALARM_NAME, { periodInMinutes: 1 / 60 });
    }
  }
});

chrome.runtime.onInstalled.addListener(async () => {
  const state = await getState();
  if (!state.lastSyncDate) {
    await setState({ lastSyncDate: getTodayStr() });
  }
});
