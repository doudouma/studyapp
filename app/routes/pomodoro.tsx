import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "~/lib/auth-context";

export const Route = createFileRoute("/pomodoro")({
  head: () => ({
    title: "番茄时钟 - 100mini",
    meta: [
      { name: "description", content: "番茄工作法专注计时，让专注自然生长" },
    ],
  }),
  component: PomodoroPage,
});

const CIRCUMFERENCE = 2 * Math.PI * 140;

const STAGES = [
  { pct: 1.00, frame: 0, title: "种下专注的种子", desc: "保持专注，番茄会慢慢长大" },
  { pct: 0.82, frame: 5, title: "番茄发芽了", desc: "继续加油，它需要你的专注" },
  { pct: 0.61, frame: 10, title: "长出新叶了", desc: "专注让它茁壮成长" },
  { pct: 0.43, frame: 17, title: "即将开花", desc: "再坚持一下就能看到花朵了" },
  { pct: 0.22, frame: 28, title: "小番茄出现了", desc: "快完成啦，番茄在等你！" },
  { pct: 0.00, frame: 38, title: "番茄成熟啦！", desc: "收获你的专注成果🍅" },
];

const COLOR_STOPS = [
  { pct: 1.00, bgTop: "#fff8e7", bgBot: "#f5e6d3", ring: "#e6d0b3" },
  { pct: 0.82, bgTop: "#e8f5e9", bgBot: "#d4edda", ring: "#81c784" },
  { pct: 0.61, bgTop: "#e0f2f1", bgBot: "#b2dfdb", ring: "#4db6ac" },
  { pct: 0.43, bgTop: "#fff9e6", bgBot: "#ffe0b2", ring: "#ffb74d" },
  { pct: 0.22, bgTop: "#fff0e6", bgBot: "#ffccbc", ring: "#ff8a65" },
  { pct: 0.00, bgTop: "#ffebee", bgBot: "#ffcdd2", ring: "#e57373" },
];

function getStage(pct: number) {
  for (let i = 0; i < STAGES.length - 1; i++) {
    if (pct >= STAGES[i + 1].pct) return STAGES[i];
  }
  return STAGES[STAGES.length - 1];
}

function hexToRgb(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex(r: number, g: number, b: number) {
  return "#" + [r, g, b].map(v => Math.round(v).toString(16).padStart(2, "0")).join("");
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function lerpColor(c1: string, c2: string, t: number) {
  const a = hexToRgb(c1), b = hexToRgb(c2);
  return rgbToHex(lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t));
}

function getColors(pct: number) {
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

function formatTime(sec: number) {
  const m = Math.floor(sec / 60).toString().padStart(2, "0");
  const s = (sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function PomodoroPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f2f2f2]">
      <style>{`
        .pomodoro-app {
          width: 100%; height: 100%; max-width: 420px; max-height: 900px;
          display: flex; flex-direction: column; position: relative; overflow: hidden;
          transition: background 1.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
        @media (min-width: 480px) {
          .pomodoro-app { height: auto; min-height: 700px; border-radius: 32px; box-shadow: 0 24px 80px rgba(0,0,0,0.18); }
        }
        .p-hdr { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; flex-shrink: 0; }
        .p-hdr button {
          width: 40px; height: 40px; border: none; background: rgba(255,255,255,0.45); border-radius: 50%;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          transition: transform .2s, background .2s; backdrop-filter: blur(4px);
        }
        .p-hdr button:hover { background: rgba(255,255,255,0.7); transform: scale(1.05); }
        .p-hdr h1 { font-size: 17px; font-weight: 600; letter-spacing: 1px; color: #5a5a5a; }
        .p-hdr svg { width: 20px; height: 20px; color: #5a5a5a; }
        .p-main { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 0 28px; position: relative; }
        .p-timer-wrap { position: relative; width: min(76vw, 320px); aspect-ratio: 1; margin-bottom: 36px; }
        .p-timer-svg { width: 100%; height: 100%; transform: rotate(-90deg); }
        .p-timer-bg { fill: none; stroke: rgba(0,0,0,0.06); stroke-width: 8; }
        .p-timer-progress {
          fill: none; stroke-width: 8; stroke-linecap: round;
          transition: stroke 1.5s cubic-bezier(0.4, 0, 0.2, 1), stroke-dashoffset 1s linear;
        }
        .p-plant { position: absolute; inset: 0; bottom: -108px; display: flex; align-items: center; justify-content: center; pointer-events: none; }
        .p-plant img { width: 52%; height: auto; object-fit: contain; transition: opacity .3s ease; }
        .p-time {
          position: absolute; top: 30%; left: 50%; transform: translate(-50%, -50%);
          font-size: clamp(40px, 12vw, 64px); font-weight: 500; letter-spacing: 2px;
          color: #3e3e3e; text-align: center; pointer-events: none; text-shadow: 0 2px 12px rgba(255,255,255,0.6);
        }
        .p-status { text-align: center; margin-bottom: 36px; min-height: 72px; opacity: 1; transition: opacity 0.4s ease; }
        .p-status.fading { opacity: 0; }
        .p-status h2 { font-size: 22px; font-weight: 600; margin-bottom: 8px; color: #3e3e3e; }
        .p-status p { font-size: 14px; color: #7a7a7a; line-height: 1.5; }
        .p-ctrl { flex-shrink: 0; padding: 0 32px 44px; display: flex; justify-content: center; }
        .p-btn {
          min-width: 160px; padding: 14px 32px; border: none; border-radius: 999px;
          font-size: 16px; font-weight: 600; cursor: pointer;
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          transition: transform .2s, box-shadow .2s, background .2s;
        }
        .p-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.12); }
        .p-btn:active { transform: translateY(0); }
        .p-btn-pause { background: rgba(255,255,255,0.65); color: #5a5a5a; backdrop-filter: blur(6px); }
        .p-btn-complete { background: #e57373; color: #fff; }
        .p-confetti {
          position: absolute; inset: 0; pointer-events: none; overflow: hidden; opacity: 0; transition: opacity .6s ease;
        }
        .p-confetti.active { opacity: 1; }
        .p-confetti span {
          position: absolute; width: 8px; height: 8px; border-radius: 2px;
          animation: p-fall 2.5s linear infinite;
        }
        @keyframes p-fall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
        .p-drawer-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.3); z-index: 100;
          backdrop-filter: blur(2px); transition: opacity .3s;
        }
        .p-drawer {
          position: fixed; top: 0; left: 0; bottom: 0; width: 260px; z-index: 101;
          background: rgba(255,255,255,0.95); backdrop-filter: blur(12px);
          padding: 24px 20px; box-shadow: 4px 0 24px rgba(0,0,0,0.12);
          transform: translateX(-100%); transition: transform .3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .p-drawer.open { transform: translateX(0); }
        .p-drawer-home { display: block; font-size: 14px; color: #7a7a7a; text-decoration: none; margin-bottom: 16px; transition: color .2s; }
        .p-drawer-home:hover { color: #e57373; }
        .p-drawer-title { font-size: 16px; font-weight: 700; color: #3e3e3e; margin-bottom: 18px; letter-spacing: .5px; }
        .p-drawer-section { font-size: 12px; font-weight: 700; color: #999; text-transform: uppercase; letter-spacing: 1px; margin: 18px 0 10px; }
        .p-alarm-select-wrap { display: flex; flex-direction: column; gap: 8px; margin-bottom: 8px; }
        .p-alarm-select {
          width: 100%; padding: 8px 10px; border: 2px solid #ddd; border-radius: 10px;
          background: #fff; font-size: 14px; color: #3e3e3e; outline: none; cursor: pointer;
          appearance: auto; transition: border-color .2s;
        }
        .p-alarm-select:focus { border-color: #e57373; }
        .p-alarm-preview {
          width: 100%; padding: 8px 0; border: 2px solid #ddd; border-radius: 10px; background: #fff;
          cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 5px;
          font-size: 13px; font-weight: 600; color: #7a7a7a; transition: all .2s;
        }
        .p-alarm-preview:hover { border-color: #e57373; color: #e57373; background: #fff5f5; }
        .p-alarm-preview.playing { border-color: #e57373; color: #e57373; background: #fff0f0; cursor: default; }
        .p-alarm-preview:disabled { opacity: 1; }
        .p-playing-dot {
          display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #e57373;
          animation: p-pulse .6s ease-in-out infinite alternate;
        }
        @keyframes p-pulse { from { opacity: .4; transform: scale(.8); } to { opacity: 1; transform: scale(1.1); } }
        .p-settings-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
        .p-settings-row span:first-child { font-size: 14px; font-weight: 600; color: #5a5a5a; min-width: 44px; }
        .p-settings-input {
          flex: 1; padding: 8px 10px; border: 2px solid #ddd; border-radius: 10px;
          background: #fff; font-size: 15px; font-weight: 600; color: #3e3e3e; text-align: center;
          outline: none; transition: border-color .2s;
        }
        .p-settings-input:focus { border-color: #e57373; }
        .p-settings-unit { font-size: 13px; color: #999; white-space: nowrap; }
        .p-settings-actions { display: flex; gap: 10px; margin-top: 20px; }
        .p-settings-actions .p-btn { flex: 1; min-width: 0; padding: 10px 0; font-size: 14px; }
        .p-dur { display: flex; justify-content: center; gap: 8px; padding: 0 24px 12px; flex-shrink: 0; }
        .p-dur button {
          min-width: 56px; padding: 6px 16px; border: 2px solid rgba(255,255,255,0.5); border-radius: 999px;
          background: rgba(255,255,255,0.25); color: #5a5a5a; font-size: 14px; font-weight: 600;
          cursor: pointer; transition: all .2s; backdrop-filter: blur(4px);
        }
        .p-dur button:hover { background: rgba(255,255,255,0.5); border-color: rgba(255,255,255,0.7); }
        .p-dur button.active { background: rgba(255,255,255,0.7); border-color: #e57373; color: #e57373; }
        .p-hidden { display: none; }
      `}</style>
      <PomodoroTimer />
    </div>
  );
}

const DEFAULT_MINUTES = [25, 5, 15];
const PRESET_LABELS = ["专注", "短休", "长休"];
const ALARMS = [
  { name: "番茄成熟" },
  { name: "叮咚" },
  { name: "鸟鸣" },
  { name: "经典" },
  { name: "柔和" },
];

function PomodoroTimer() {
  const [presetMinutes, setPresetMinutes] = useState([...DEFAULT_MINUTES]);
  const [duration, setDuration] = useState(25);
  const [remaining, setRemaining] = useState(25 * 60);
  const [running, setRunning] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [fading, setFading] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [alarmIndex, setAlarmIndex] = useState(0);
  const [previewPlaying, setPreviewPlaying] = useState(false);

  const { user } = useAuth();
  const recordedRef = useRef(false);
  const confettiRef = useRef<HTMLDivElement>(null);
  const stageTitleRef = useRef("");

  const totalSeconds = duration * 60;
  const pct = remaining / totalSeconds;
  const stage = getStage(pct);
  const colors = getColors(pct);

  const nextStage = STAGES[Math.min(STAGES.indexOf(stage) + 1, STAGES.length - 1)];
  const segmentPct = (pct - nextStage.pct) / (stage.pct - nextStage.pct || 1);
  const frame = Math.round(stage.frame + (nextStage.frame - stage.frame) * (1 - segmentPct));
  const frameClamped = Math.min(38, Math.max(0, frame));

  const ringOffset = CIRCUMFERENCE * Math.max(0, 1 - pct);

  // Timer
  useEffect(() => {
    if (!running || completed) return;
    const id = setInterval(() => {
      setRemaining(r => Math.max(0, r - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [running, completed]);

  // Detect completion
  useEffect(() => {
    if (remaining <= 0 && !completed) {
      setCompleted(true);
      setRunning(false);
    }
  }, [remaining, completed]);

  // Stage text fade
  useEffect(() => {
    if (stage.title !== stageTitleRef.current) {
      stageTitleRef.current = stage.title;
      setFading(true);
      const t = setTimeout(() => setFading(false), 400);
      return () => clearTimeout(t);
    }
  }, [stage.title]);

  // Completion effects
  useEffect(() => {
    if (!completed) return;
    playSound();
    if (navigator.vibrate) navigator.vibrate([300, 150, 300, 150, 500]);
    makeConfetti();
    recordSession();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completed]);

  async function recordSession() {
    if (!user || recordedRef.current) return;
    recordedRef.current = true;
    try {
      await fetch("/api/pomodoro/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ duration }),
      });
    } catch {}
  }

  function playMelody(ctx: AudioContext, notes: { f: number; d: number }[]) {
    let t = ctx.currentTime + 0.05;
    notes.forEach(n => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(n.f, t);
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.22, t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, t + n.d);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + n.d);
      t += n.d + 0.06;
    });
  }

  const ALARM_PLAYS = [
    // 番茄成熟
    (ctx: AudioContext) => playMelody(ctx, [
      { f: 523.25, d: 0.18 }, { f: 659.25, d: 0.18 },
      { f: 783.99, d: 0.18 }, { f: 1046.50, d: 0.45 },
    ]),
    // 叮咚
    (ctx: AudioContext) => playMelody(ctx, [
      { f: 880, d: 0.22 }, { f: 660, d: 0.35 },
    ]),
    // 鸟鸣
    (ctx: AudioContext) => playMelody(ctx, [
      { f: 1200, d: 0.08 }, { f: 1400, d: 0.08 },
      { f: 1600, d: 0.08 }, { f: 1800, d: 0.08 },
      { f: 2000, d: 0.12 },
    ]),
    // 经典
    (ctx: AudioContext) => {
      for (let i = 0; i < 3; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "square";
        osc.frequency.setValueAtTime(800, ctx.currentTime + i * 0.35);
        gain.gain.setValueAtTime(0.001, ctx.currentTime + i * 0.35);
        gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + i * 0.35 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.35 + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.35);
        osc.stop(ctx.currentTime + i * 0.35 + 0.3);
      }
    },
    // 柔和
    (ctx: AudioContext) => playMelody(ctx, [
      { f: 392, d: 0.35 }, { f: 440, d: 0.35 },
      { f: 523.25, d: 0.5 },
    ]),
  ];

  function getAudioCtx(): AudioContext | null {
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    if (!AC) return null;
    try { return new AC(); } catch { return null; }
  }

  function playSound() {
    const ctx = getAudioCtx();
    if (!ctx) return;
    try { ALARM_PLAYS[alarmIndex](ctx); } catch {}
    setTimeout(() => ctx.close().catch(() => {}), 2000);
  }

  function previewAlarm(i: number) {
    const ctx = getAudioCtx();
    if (!ctx) return;
    setPreviewPlaying(true);
    try { ALARM_PLAYS[i](ctx); } catch {}
    setTimeout(() => {
      ctx.close().catch(() => {});
      setPreviewPlaying(false);
    }, 1500);
  }

  function makeConfetti() {
    const el = confettiRef.current;
    if (!el) return;
    el.innerHTML = "";
    const c = ["#ff8a65", "#81c784", "#4db6ac", "#ffb74d", "#e57373", "#64b5f6"];
    for (let i = 0; i < 40; i++) {
      const span = document.createElement("span");
      span.style.left = Math.random() * 100 + "%";
      span.style.top = -20 - Math.random() * 80 + "px";
      span.style.background = c[Math.floor(Math.random() * c.length)];
      span.style.animationDelay = Math.random() * 2 + "s";
      span.style.animationDuration = 2 + Math.random() * 2 + "s";
      el.appendChild(span);
    }
  }

  // Reset when duration changes
  useEffect(() => {
    recordedRef.current = false;
    setRemaining(duration * 60);
    setRunning(true);
    setCompleted(false);
    const el = confettiRef.current;
    if (el) { el.classList.remove("active"); el.innerHTML = ""; }
  }, [duration]);

  function selectDuration(m: number) {
    setDuration(m);
  }

  function reset() {
    recordedRef.current = false;
    setRemaining(totalSeconds);
    setRunning(true);
    setCompleted(false);
    const el = confettiRef.current;
    if (el) { el.classList.remove("active"); el.innerHTML = ""; }
  }

  function togglePause() {
    setRunning(r => !r);
  }

  return (
    <div className="pomodoro-app" style={{ background: `linear-gradient(180deg, ${colors.bgTop} 0%, ${colors.bgBot} 100%)` }}>
      <div className="p-drawer-overlay" style={{ display: showDrawer ? "block" : "none" }} onClick={() => setShowDrawer(false)} />
      <div className={`p-drawer${showDrawer ? " open" : ""}`}>
        <Link to="/" className="p-drawer-home">← 返回首页</Link>
        <div className="p-drawer-title">番茄时钟 设置</div>
        {PRESET_LABELS.map((label, i) => (
          i === 0 ? null : (
            <div key={label} className="p-settings-row">
              <span>{label}</span>
              <input
                type="number" min={1} max={120}
                className="p-settings-input"
                value={presetMinutes[i]}
                onChange={e => {
                  const v = Math.max(1, parseInt(e.target.value) || 1);
                  const next = [...presetMinutes];
                  next[i] = v;
                  setPresetMinutes(next);
                }}
              />
              <span className="p-settings-unit">分钟</span>
            </div>
          )
        ))}
        <div className="p-drawer-section">提示音</div>
        <div className="p-alarm-select-wrap">
          <select className="p-alarm-select" value={alarmIndex} onChange={e => setAlarmIndex(Number(e.target.value))}>
            {ALARMS.map((a, i) => <option key={a.name} value={i}>{a.name}</option>)}
          </select>
          <button
            className={`p-alarm-preview${previewPlaying ? " playing" : ""}`}
            onClick={() => previewAlarm(alarmIndex)}
            disabled={previewPlaying}
            aria-label="预览"
          >
            {previewPlaying ? (
              <><span className="p-playing-dot" /> 播放中</>
            ) : (
              <><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 4 20 12 6 20"/></svg> 试听</>
            )}
          </button>
        </div>
        <div className="p-settings-actions">
          <button className="p-btn p-btn-pause" onClick={() => setPresetMinutes([...DEFAULT_MINUTES])}>重置</button>
          <button className="p-btn p-btn-complete" onClick={() => setShowDrawer(false)}>关闭</button>
        </div>
      </div>

      <header className="p-hdr">
        <button aria-label="菜单" onClick={() => setShowDrawer(true)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
        </button>
        <h1>{completed ? "专注完成！" : "专注中"}</h1>
        <button aria-label="声音">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
        </button>
      </header>

      {!completed && (
        <div className="p-dur">
          {presetMinutes.map((m, i) => (
            <button key={i} className={duration === m ? "active" : ""} onClick={() => selectDuration(m)}>
              {PRESET_LABELS[i]}
            </button>
          ))}
        </div>
      )}

      <main className="p-main">
        <div className="p-timer-wrap">
          <svg className="p-timer-svg" viewBox="0 0 320 320">
            <circle className="p-timer-bg" cx="160" cy="160" r="140" />
            <circle
              className="p-timer-progress"
              cx="160" cy="160" r="140"
              style={{
                stroke: colors.ring,
                strokeDasharray: CIRCUMFERENCE,
                strokeDashoffset: ringOffset,
              }}
            />
          </svg>
          <div className="p-plant">
            <img src={`/spritesheet2/frame_${String(frameClamped).padStart(2, "0")}.webp`} alt="番茄生长" />
          </div>
          <div className="p-time">{formatTime(remaining)}</div>
        </div>

        <div className={`p-status${fading ? " fading" : ""}`} key={stage.title}>
          <h2>{stage.title}</h2>
          <p>{completed ? "收获你的专注成果🍅" : stage.desc}</p>
        </div>
      </main>

      <div className="p-ctrl">
        <button className={`p-btn ${completed ? "p-btn-complete" : "p-btn-pause"}`} onClick={completed ? reset : togglePause}>
          {completed ? (
            <>完成<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg></>
          ) : (
            <><span>{running ? "暂停" : "继续"}</span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">{running ? <><line x1="10" y1="4" x2="10" y2="20"/><line x1="14" y1="4" x2="14" y2="20"/></> : <polygon points="6 4 20 12 6 20"/>}</svg></>
          )}
        </button>
      </div>

      <div className={`p-confetti${completed ? " active" : ""}`} ref={confettiRef} />
    </div>
  );
}
