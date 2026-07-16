import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "~/lib/auth-context";
import { AuthDialog } from "~/components/AuthDialog";
import { useTranslation } from "react-i18next";
import i18n from "~/lib/i18n";

export const Route = createFileRoute("/pomodoro")({
  head: () => {
    const title = i18n.t("pomodoro.title");
    const desc = i18n.t("pomodoro.desc");
    const keywords = i18n.t("pomodoro.keywords");
    const lang = i18n.language?.startsWith("zh") ? "zh" : "en";
    const pageUrl = "https://100mini.com/pomodoro";
    const altUrls = {
      zh: "https://100mini.com/pomodoro",
      en: "https://100mini.com/en/pomodoro",
    };
    return {
      title,
      meta: [
        { name: "description", content: desc },
        { name: "keywords", content: keywords },
        { name: "robots", content: "index, follow" },
        { property: "og:type", content: "website" },
        { property: "og:url", content: pageUrl },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:image", content: "https://100mini.com/spritesheet2/frame_38.webp" },
        { property: "og:locale", content: lang === "zh" ? "zh_CN" : "en_US" },
        { property: "og:site_name", content: "100mini" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: desc },
        { name: "twitter:image", content: "https://100mini.com/spritesheet2/frame_38.webp" },
      ],
      links: [
        { rel: "canonical", href: altUrls[lang] || pageUrl },
        { rel: "alternate", hrefLang: "zh", href: altUrls.zh },
        { rel: "alternate", hrefLang: "en", href: altUrls.en },
        { rel: "alternate", hrefLang: "x-default", href: pageUrl },
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: lang === "zh" ? "100mini 番茄时钟" : "100mini Pomodoro Timer",
            url: pageUrl,
            description: desc,
            applicationCategory: "ProductivityApplication",
            operatingSystem: "All",
            browserRequirements: "Requires JavaScript",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            author: { "@type": "Organization", name: "100mini", url: "https://100mini.com" },
            inLanguage: lang === "zh" ? "zh-CN" : "en-US",
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: lang === "zh" ? [
              {
                "@type": "Question",
                name: "什么是番茄工作法？",
                acceptedAnswer: { "@type": "Answer", text: "番茄工作法是一种时间管理方法，将工作分为 25 分钟的专注时段，中间穿插短暂休息。每完成 4 个专注时段后，进行一次长休息，帮助保持高效专注。" },
              },
              {
                "@type": "Question",
                name: "一个番茄时段多久？",
                acceptedAnswer: { "@type": "Answer", text: "默认每个番茄时段为 25 分钟专注。你可以在设置中自定义专注时长、短休息和长休息的时间。" },
              },
              {
                "@type": "Question",
                name: "一天应该完成几个番茄？",
                acceptedAnswer: { "@type": "Answer", text: "因人而异，初学者可以从每天 4-6 个番茄开始，有经验的用户通常每天完成 8-12 个番茄。关键在于保持节奏，而不是追求数量。" },
              },
              {
                "@type": "Question",
                name: "番茄时钟免费吗？",
                acceptedAnswer: { "@type": "Answer", text: "完全免费，无需注册即可使用。登录后可以追踪每日完成的番茄数量，帮助更好地管理时间。" },
              },
              {
                "@type": "Question",
                name: "可以自定义时长和提示音吗？",
                acceptedAnswer: { "@type": "Answer", text: "可以。点击左上角菜单按钮，在设置中可分别调整专注时长、短休息时长、长休息时长，以及选择 5 种不同的提示音效。" },
              },
            ] : [
              {
                "@type": "Question",
                name: "What is the Pomodoro Technique?",
                acceptedAnswer: { "@type": "Answer", text: "The Pomodoro Technique is a time management method that breaks work into 25-minute focus sessions separated by short breaks. After every 4 focus sessions, take a longer break to maintain productivity." },
              },
              {
                "@type": "Question",
                name: "How long is a Pomodoro session?",
                acceptedAnswer: { "@type": "Answer", text: "By default, each Pomodoro session is 25 minutes of focused work. You can customize the focus duration, short break, and long break in the Settings menu." },
              },
              {
                "@type": "Question",
                name: "How many Pomodoros should I do per day?",
                acceptedAnswer: { "@type": "Answer", text: "It varies by individual. Beginners can start with 4-6 Pomodoros per day, while experienced users typically complete 8-12. The key is maintaining a sustainable rhythm rather than chasing a specific number." },
              },
              {
                "@type": "Question",
                name: "Is this Pomodoro timer free?",
                acceptedAnswer: { "@type": "Answer", text: "Yes, it is completely free with no sign-up required. Logging in allows you to track your daily completed Pomodoros and monitor your productivity over time." },
              },
              {
                "@type": "Question",
                name: "Can I customize the duration and alarm sounds?",
                acceptedAnswer: { "@type": "Answer", text: "Yes. Click the menu button in the top-left corner to open Settings, where you can adjust the focus duration, short break, and long break, and choose from 5 different alarm melodies." },
              },
            ],
          }),
        },
      ],
    };
  },
  component: PomodoroPage,
});

const CIRCUMFERENCE = 2 * Math.PI * 140;

const COLOR_STOPS = [
  { pct: 1.00, bgTop: "#fff8e7", bgBot: "#f5e6d3", ring: "#e6d0b3" },
  { pct: 0.82, bgTop: "#e8f5e9", bgBot: "#d4edda", ring: "#81c784" },
  { pct: 0.61, bgTop: "#e0f2f1", bgBot: "#b2dfdb", ring: "#4db6ac" },
  { pct: 0.43, bgTop: "#fff9e6", bgBot: "#ffe0b2", ring: "#ffb74d" },
  { pct: 0.22, bgTop: "#fff0e6", bgBot: "#ffccbc", ring: "#ff8a65" },
  { pct: 0.00, bgTop: "#ffebee", bgBot: "#ffcdd2", ring: "#e57373" },
];

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

function formatTime(sec: number) {
  const m = Math.floor(sec / 60).toString().padStart(2, "0");
  const s = (sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
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

function GuideContent() {
  const { t } = useTranslation();
  return (
    <section className="p-guide-section">
      <h2>{t("pomodoro.guide")}</h2>
      <h3>{t("pomodoro.guide.what")}</h3>
      <p>{t("pomodoro.guide.what.desc")}</p>
      <ol>
        <li>{t("pomodoro.guide.step1")}</li>
        <li>{t("pomodoro.guide.step2")}</li>
        <li>{t("pomodoro.guide.step3")}</li>
        <li>{t("pomodoro.guide.step4")}</li>
        <li>{t("pomodoro.guide.step5")}</li>
      </ol>
      <p className="p-guide-tip">{t("pomodoro.guide.customize")}</p>
    </section>
  );
}

function PomodoroPage() {
  return (
    <>
      <div className="min-h-screen flex flex-col items-center pomodoro-outer">
        <style>{`
          .pomodoro-app {
          width: 100%; height: 100%; max-width: 420px; max-height: 900px;
          display: flex; flex-direction: column; position: relative; overflow: hidden;
          transition: background 1.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
        @media (min-width: 480px) {
          .pomodoro-app { height: auto; min-height: 700px; border-radius: 32px; border: 1px solid #e5e5e5; }
        }
        @media (max-width: 479px) {
          body { overflow: auto; }
          .pomodoro-app { height: auto; padding: 12px 0; border-radius: 32px; border: 1px solid #e5e5e5; }
          .pomodoro-outer { min-height: 100dvh; overflow-y: auto; }
          .p-hdr { padding: 4px 16px; }
          .p-hdr h1 { font-size: 14px; }
          .p-hdr button { width: 32px; height: 32px; }
          .p-hdr svg { width: 16px; height: 16px; }
          .p-main { padding: 0 12px; gap: 8px; }
          .p-timer-wrap { width: min(60vw, 220px); margin-bottom: 0; }
          .p-time { font-size: clamp(28px, 10vw, 40px); top: 28%; }
          .p-plant { bottom: -80px; }
          .p-status { margin-bottom: 0; min-height: 44px; }
          .p-status h2 { font-size: 16px; }
          .p-status p { font-size: 12px; }
          .p-ctrl { padding: 0 16px 4px; }
          .p-btn { min-width: 130px; padding: 10px 24px; font-size: 14px; }
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

        .p-guide-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.3); z-index: 100;
          backdrop-filter: blur(2px); display: flex; align-items: center; justify-content: center;
          padding: 20px; transition: opacity .3s;
        }
        .p-guide-card {
          background: rgba(255,255,255,0.96); backdrop-filter: blur(12px);
          border-radius: 20px; max-width: 380px; width: 100%; max-height: 80vh;
          overflow-y: auto; padding: 28px 24px; box-shadow: 0 8px 40px rgba(0,0,0,0.15);
          animation: p-guide-in .3s ease;
        }
        @keyframes p-guide-in {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .p-guide-card h2 { font-size: 18px; font-weight: 700; color: #3e3e3e; margin-bottom: 16px; letter-spacing: .3px; }
        .p-guide-card h3 { font-size: 14px; font-weight: 700; color: #e57373; margin: 16px 0 6px; letter-spacing: .3px; }
        .p-guide-card p { font-size: 14px; color: #5a5a5a; line-height: 1.7; margin-bottom: 8px; }
        .p-guide-card ol { margin: 0 0 12px; padding-left: 20px; }
        .p-guide-card li { font-size: 14px; color: #5a5a5a; line-height: 1.8; margin-bottom: 4px; }
        .p-guide-card .p-guide-tip { font-size: 13px; color: #999; font-style: italic; margin-top: 4px; }
        .p-guide-close { display: block; width: 100%; margin-top: 16px; padding: 10px; border: none;
          border-radius: 12px; background: #e57373; color: #fff; font-size: 15px; font-weight: 600;
          cursor: pointer; transition: background .2s; }
        .p-guide-close:hover { background: #d35f5f; }

        .p-guide-section { max-width: 640px; margin: 48px auto; padding: 0 24px 64px; }
        .p-guide-section h2 { font-size: 24px; font-weight: 700; color: #3e3e3e; margin-bottom: 20px; text-align: center; letter-spacing: .5px; }
        .p-guide-section h3 { font-size: 18px; font-weight: 700; color: #e57373; margin-bottom: 10px; }
        .p-guide-section p { font-size: 15px; color: #5a5a5a; line-height: 1.8; margin-bottom: 16px; }
        .p-guide-section ol { margin: 0 0 20px; padding-left: 24px; }
        .p-guide-section li { font-size: 15px; color: #5a5a5a; line-height: 1.9; margin-bottom: 8px; }
        .p-guide-section .p-guide-tip { font-size: 14px; color: #999; font-style: italic; text-align: center; }

      `}</style>
      <PomodoroTimer />
    </div>
    <GuideContent />
  </>
  );
}

const DEFAULT_MINUTES = [25, 5, 15];
const ALARM_PLAYS = [
  (ctx: AudioContext) => playMelody(ctx, [
    { f: 523.25, d: 0.18 }, { f: 659.25, d: 0.18 },
    { f: 783.99, d: 0.18 }, { f: 1046.50, d: 0.45 },
  ]),
  (ctx: AudioContext) => playMelody(ctx, [
    { f: 880, d: 0.22 }, { f: 660, d: 0.35 },
  ]),
  (ctx: AudioContext) => playMelody(ctx, [
    { f: 1200, d: 0.08 }, { f: 1400, d: 0.08 },
    { f: 1600, d: 0.08 }, { f: 1800, d: 0.08 },
    { f: 2000, d: 0.12 },
  ]),
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
  (ctx: AudioContext) => playMelody(ctx, [
    { f: 392, d: 0.35 }, { f: 440, d: 0.35 },
    { f: 523.25, d: 0.5 },
  ]),
];

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

function PomodoroTimer() {
  const { t, i18n: i18nInstance } = useTranslation();
  const [presetMinutes, setPresetMinutes] = useState([...DEFAULT_MINUTES]);
  const [mode, setMode] = useState<'focus' | 'shortBreak' | 'longBreak'>('focus');
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const [remaining, setRemaining] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [fading, setFading] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [alarmIndex, setAlarmIndex] = useState(0);
  const [previewPlaying, setPreviewPlaying] = useState(false);
  const [todayTomatoes, setTodayTomatoes] = useState(0);
  const [totalTomatoes, setTotalTomatoes] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    try { return localStorage.getItem('pomodoro_sound') !== 'off'; } catch { return true; }
  });

  const navigate = useNavigate();
  const { user } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [pulseCta, setPulseCta] = useState(false);
  const recordedRef = useRef(false);
  const confettiRef = useRef<HTMLDivElement>(null);
  const stageTitleRef = useRef("");
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const hasStartedRef = useRef(false);

  const STAGES = [
    { pct: 1.00, frame: 0, title: t("pomodoro.stage0.title"), desc: t("pomodoro.stage0.desc") },
    { pct: 0.82, frame: 5, title: t("pomodoro.stage1.title"), desc: t("pomodoro.stage1.desc") },
    { pct: 0.61, frame: 10, title: t("pomodoro.stage2.title"), desc: t("pomodoro.stage2.desc") },
    { pct: 0.43, frame: 17, title: t("pomodoro.stage3.title"), desc: t("pomodoro.stage3.desc") },
    { pct: 0.22, frame: 28, title: t("pomodoro.stage4.title"), desc: t("pomodoro.stage4.desc") },
    { pct: 0.00, frame: 38, title: t("pomodoro.stage5.title"), desc: t("pomodoro.stage5.desc") },
  ];

  const BREAK_TEXTS = {
    shortBreak: [
      { title: t("pomodoro.break.short0.title"), desc: t("pomodoro.break.short0.desc") },
      { title: t("pomodoro.break.short1.title"), desc: t("pomodoro.break.short1.desc") },
      { title: t("pomodoro.break.short2.title"), desc: t("pomodoro.break.short2.desc") },
      { title: t("pomodoro.break.short3.title"), desc: t("pomodoro.break.short3.desc") },
      { title: t("pomodoro.break.short4.title"), desc: t("pomodoro.break.short4.desc") },
      { title: t("pomodoro.break.short5.title"), desc: t("pomodoro.break.short5.desc") },
      { title: t("pomodoro.break.short6.title"), desc: t("pomodoro.break.short6.desc") },
      { title: t("pomodoro.break.short7.title"), desc: t("pomodoro.break.short7.desc") },
    ],
    longBreak: [
      { title: t("pomodoro.break.long0.title"), desc: t("pomodoro.break.long0.desc") },
      { title: t("pomodoro.break.long1.title"), desc: t("pomodoro.break.long1.desc") },
      { title: t("pomodoro.break.long2.title"), desc: t("pomodoro.break.long2.desc") },
      { title: t("pomodoro.break.long3.title"), desc: t("pomodoro.break.long3.desc") },
      { title: t("pomodoro.break.long4.title"), desc: t("pomodoro.break.long4.desc") },
      { title: t("pomodoro.break.long5.title"), desc: t("pomodoro.break.long5.desc") },
      { title: t("pomodoro.break.long6.title"), desc: t("pomodoro.break.long6.desc") },
      { title: t("pomodoro.break.long7.title"), desc: t("pomodoro.break.long7.desc") },
    ],
  };

  const ALARMS = [
    { name: t("pomodoro.alarm1") },
    { name: t("pomodoro.alarm2") },
    { name: t("pomodoro.alarm3") },
    { name: t("pomodoro.alarm4") },
    { name: t("pomodoro.alarm5") },
  ];

  const MODE_LABELS = [t("pomodoro.focus"), t("pomodoro.shortBreak"), t("pomodoro.longBreak")];
  const modeLabel = MODE_LABELS[mode === 'focus' ? 0 : mode === 'shortBreak' ? 1 : 2];

  const breakTextRef = useRef(BREAK_TEXTS.shortBreak[0]);
  useEffect(() => {
    if (mode === 'focus') return;
    const pool = BREAK_TEXTS[mode];
    breakTextRef.current = pool[Math.floor(Math.random() * pool.length)];
  }, [mode, i18nInstance.language]);

  function getStage(pct: number) {
    for (let i = 0; i < STAGES.length - 1; i++) {
      if (pct >= STAGES[i + 1].pct) return STAGES[i];
    }
    return STAGES[STAGES.length - 1];
  }

  const nextRunningRef = useRef(true);
  const modeRef = useRef(mode);
  const countRef = useRef(pomodoroCount);
  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { countRef.current = pomodoroCount; }, [pomodoroCount]);
  const todayRef = useRef(todayTomatoes);
  useEffect(() => { todayRef.current = todayTomatoes; }, [todayTomatoes]);

  const duration = mode === 'focus' ? presetMinutes[0] : mode === 'shortBreak' ? presetMinutes[1] : presetMinutes[2];
  const totalSeconds = duration * 60;
  const pct = remaining / totalSeconds;
  const stage = getStage(pct);
  const colors = getColors(pct);

  const nextStage = STAGES[Math.min(STAGES.indexOf(stage) + 1, STAGES.length - 1)];
  const segmentPct = (pct - nextStage.pct) / (stage.pct - nextStage.pct || 1);
  const frame = Math.round(stage.frame + (nextStage.frame - stage.frame) * (1 - segmentPct));
  const frameClamped = Math.min(38, Math.max(0, frame));
  const displayFrame = mode === 'focus' ? frameClamped : 0;

  const ringOffset = CIRCUMFERENCE * Math.max(0, 1 - pct);

  useEffect(() => {
    if (!running || completed) return;
    const id = setInterval(() => {
      setRemaining(r => Math.max(0, r - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [running, completed]);

  useEffect(() => {
    if (remaining <= 0 && !completed) {
      setCompleted(true);
      setRunning(false);
    }
  }, [remaining, completed]);

  useEffect(() => {
    if (stage.title !== stageTitleRef.current) {
      stageTitleRef.current = stage.title;
      setFading(true);
      const t = setTimeout(() => setFading(false), 400);
      return () => clearTimeout(t);
    }
  }, [stage.title]);

  useEffect(() => {
    if (!completed) return;
    playSound();
    if (navigator.vibrate) navigator.vibrate([300, 150, 300, 150, 500]);
    if (modeRef.current === 'focus') {
      if (!user) {
        makeConfetti();
        setPulseCta(true);
      } else if (todayRef.current < 8) {
        makeConfetti();
        recordSession();
        setTodayTomatoes(t => t + 1);
        setTotalTomatoes(t => t + 1);
      }
    }
    advanceTimerRef.current = setTimeout(() => advanceMode(), 3000);
    return () => { if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completed]);

  useEffect(() => {
    if (!user) return;
    fetch("/api/pomodoro/today-count")
      .then(r => r.json())
      .then((d: any) => { if (typeof d.today === 'number') setTodayTomatoes(d.today); if (typeof d.total === 'number') setTotalTomatoes(d.total); })
      .catch(() => {});
  }, [user]);

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

  function getAudioCtx(): AudioContext | null {
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    if (!AC) return null;
    try { return new AC(); } catch { return null; }
  }

  function playSound() {
    if (!soundEnabled) return;
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

  useEffect(() => {
    if (!hasStartedRef.current) { hasStartedRef.current = true; return; }
    recordedRef.current = false;
    setRemaining(duration * 60);
    setRunning(nextRunningRef.current);
    setCompleted(false);
    const el = confettiRef.current;
    if (el) { el.classList.remove("active"); el.innerHTML = ""; }
  }, [mode, duration]);

  function advanceMode() {
    const m = modeRef.current;
    const c = countRef.current;
    let nextMode: 'focus' | 'shortBreak' | 'longBreak';
    let nextCount: number;
    if (m === 'focus') {
      const earned = c + 1;
      if (earned >= 4) {
        nextMode = 'longBreak';
        nextCount = 0;
      } else {
        nextMode = 'shortBreak';
        nextCount = earned;
      }
    } else {
      nextMode = 'focus';
      nextCount = c;
    }
    nextRunningRef.current = m !== 'longBreak';
    setMode(nextMode);
    setPomodoroCount(nextCount);
  }

  function advanceNow() {
    if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    advanceMode();
  }

  function togglePause() {
    setRunning(r => !r);
  }

  return (
    <div className="pomodoro-app" style={{ background: `linear-gradient(180deg, ${colors.bgTop} 0%, ${colors.bgBot} 100%)` }}>
      <div className="p-drawer-overlay" style={{ display: showDrawer ? "block" : "none" }} onClick={() => setShowDrawer(false)} />
      <div className={`p-drawer${showDrawer ? " open" : ""}`}>
        <Link to="/" className="p-drawer-home">{t("pomodoro.drawerBack")}</Link>
        <div className="p-drawer-title">{t("pomodoro.settings")}</div>
        {[
          { label: t("pomodoro.focus"), idx: 0 },
          { label: t("pomodoro.shortBreak"), idx: 1 },
          { label: t("pomodoro.longBreak"), idx: 2 },
        ].map(({ label, idx }) => (
          <div key={label} className="p-settings-row">
            <span>{label}</span>
            <input
              type="number" min={idx === 0 ? 25 : 1} max={120}
              className="p-settings-input"
              value={presetMinutes[idx]}
              onChange={e => {
                const min = idx === 0 ? 25 : 1;
                const v = Math.max(min, parseInt(e.target.value) || min);
                const next = [...presetMinutes];
                next[idx] = v;
                setPresetMinutes(next);
              }}
            />
            <span className="p-settings-unit">{t("pomodoro.minutes")}</span>
          </div>
        ))}
        <div className="p-drawer-section">{t("pomodoro.alarm")}</div>
        <div className="p-alarm-select-wrap">
          <select className="p-alarm-select" value={alarmIndex} onChange={e => {
            const i = Number(e.target.value);
            setAlarmIndex(i);
            previewAlarm(i);
          }}>
            {ALARMS.map((a, i) => <option key={i} value={i}>{a.name}</option>)}
          </select>
        </div>
        <div className="p-settings-actions">
          <button className="p-btn p-btn-pause" onClick={() => setPresetMinutes([...DEFAULT_MINUTES])}>{t("common.reset")}</button>
          <button className="p-btn p-btn-complete" onClick={() => setShowDrawer(false)}>{t("common.close")}</button>
        </div>
      </div>

      {showGuide && (
        <div className="p-guide-overlay" onClick={() => setShowGuide(false)}>
          <div className="p-guide-card" onClick={e => e.stopPropagation()}>
            <h2>{t("pomodoro.guide")}</h2>
            <h3>{t("pomodoro.guide.what")}</h3>
            <p>{t("pomodoro.guide.what.desc")}</p>
            <ol>
              <li>{t("pomodoro.guide.step1")}</li>
              <li>{t("pomodoro.guide.step2")}</li>
              <li>{t("pomodoro.guide.step3")}</li>
              <li>{t("pomodoro.guide.step4")}</li>
              <li>{t("pomodoro.guide.step5")}</li>
            </ol>
            <p className="p-guide-tip">{t("pomodoro.guide.customize")}</p>
            <button className="p-guide-close" onClick={() => setShowGuide(false)}>
              {t("common.close")}
            </button>
          </div>
        </div>
      )}

      <header className="p-hdr">
        <button aria-label={t("nav.menu")} onClick={() => setShowDrawer(true)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
        </button>
        <h1>{completed ? t("pomodoro.completed", { mode: modeLabel }) : t("pomodoro.inProgress", { mode: modeLabel })}</h1>
        <div className="flex items-center gap-1">
          <button aria-label={t("pomodoro.guide")} onClick={() => setShowGuide(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </button>
          <button aria-label={t("pomodoro.sound")} onClick={() => {
            setSoundEnabled(s => { const n = !s; try { localStorage.setItem('pomodoro_sound', n ? 'on' : 'off'); } catch {} return n; });
          }}>
            {soundEnabled ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H2v6h4l5 4V5z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
            )}
          </button>
        </div>
      </header>

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
            <img src={`/spritesheet2/frame_${String(displayFrame).padStart(2, "0")}.webp`} alt={t("pomodoro.alt")} />
          </div>
          <div className="p-time">{formatTime(remaining)}</div>
        </div>

        <div className={`p-status${fading ? " fading" : ""}`} key={mode === 'focus' ? stage.title : mode}>
          <h2>{completed ? t("pomodoro.completed", { mode: modeLabel }) : mode === 'focus' ? stage.title : breakTextRef.current.title}</h2>
          <p>{completed ? t("pomodoro.harvest") : mode === 'focus' ? stage.desc : breakTextRef.current.desc}</p>
        </div>
      </main>

      {user ? (
        <div style={{textAlign:'center',marginBottom:8,fontSize:14,color:'#7a7a7a',fontWeight:600}}>
          {t("pomodoro.todayCount", { count: todayTomatoes })}
        </div>
      ) : (
        <div style={{textAlign:'center',marginBottom:8}}>
          <button
            onClick={() => setAuthOpen(true)}
            className={`cursor-pointer text-sm font-semibold transition-all ${
              pulseCta ? 'animate-pulse text-[#e57373]' : 'text-[#7a7a7a] hover:text-[#e57373]'
            }`}
          >
            {t("pomodoro.loginCta")}
          </button>
        </div>
      )}
      <AuthDialog
        open={authOpen}
        onOpenChange={setAuthOpen}
        onSuccess={() => { navigate({ to: "/" }); }}
      />
      <div className="p-ctrl">
        <button className={`p-btn ${completed ? "p-btn-complete" : "p-btn-pause"}`} onClick={completed ? advanceNow : togglePause}>
          {completed ? (
            <>{t("common.next")}<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg></>
          ) : (
            <><span>{running ? t("pomodoro.pause") : t("pomodoro.start")}</span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">{running ? <><line x1="10" y1="4" x2="10" y2="20"/><line x1="14" y1="4" x2="14" y2="20"/></> : <polygon points="6 4 20 12 6 20"/>}</svg></>
          )}
        </button>
      </div>

      <div className={`p-confetti${completed ? " active" : ""}`} ref={confettiRef} />
    </div>
  );
}
