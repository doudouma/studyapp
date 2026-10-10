import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Trophy, Volume2, VolumeX, X } from "lucide-react";
import { fetchEnsoRank, submitEnsoScore } from "~/features/enso/api";
import type { EnsoRankEntry, EnsoRankMine } from "@shared/types/enso";

// ================= 类型 =================

type Phase = "ready" | "play" | "judge" | "over";
type ShapeKind = "circle" | "square" | "triangle" | "diamond" | "star";
type Rating = "god" | "great" | "good" | "fail";

interface Pt {
  x: number;
  y: number;
  t: number;
  w: number;
}

interface JudgeInfo {
  pct: number;
  rating: Rating;
  points: number;
  lifeLost: boolean;
  mult: number;
}

interface OverInfo {
  score: number;
  passed: number;
  avg: number;
  rank: string;
  bestScore: number;
  bestPct: number;
  bestShape: string;
  thumb: string | null;
}

// ================= 常量 =================

const IDEAL_N = 160;
const BASE_R = 0.36; // 形状半径占短边比例
const JUDGE_MS = 2300;
const GOD_MS = 2800;

const SHAPES: Record<ShapeKind, { baseTime: number }> = {
  circle: { baseTime: 3.8 },
  square: { baseTime: 3.4 },
  triangle: { baseTime: 3.2 },
  diamond: { baseTime: 3.0 },
  star: { baseTime: 2.8 },
};

const SHAPE_KINDS = Object.keys(SHAPES) as ShapeKind[];

const INK = "#191a1c";
const GOLD = ["#c9a227", "#e3c14a", "#a8821c", "#d4af37", "#f0d878"];

// ================= 形状理想路径 =================

function polygonVerts(kind: ShapeKind): Array<[number, number]> {
  const at = (deg: number): [number, number] => {
    const a = ((deg - 90) * Math.PI) / 180;
    return [Math.cos(a), Math.sin(a)];
  };
  switch (kind) {
    case "circle":
      return [];
    case "triangle":
      return [at(0), at(120), at(240)];
    case "square":
      return [at(45), at(135), at(225), at(315)];
    case "diamond":
      return [at(0), at(90), at(180), at(270)];
    case "star": {
      const v = [at(0), at(72), at(144), at(216), at(288)];
      return [v[0], v[2], v[4], v[1], v[3]];
    }
  }
}

/** 归一化理想路径（单位半径，中心在原点，顺时针） */
function idealPath(kind: ShapeKind): Array<[number, number]> {
  const out: Array<[number, number]> = [];
  if (kind === "circle") {
    for (let i = 0; i <= IDEAL_N; i++) {
      const a = (i / IDEAL_N) * Math.PI * 2;
      out.push([Math.cos(a), Math.sin(a)]);
    }
    return out;
  }
  const verts = polygonVerts(kind);
  const n = verts.length;
  for (let i = 0; i <= IDEAL_N; i++) {
    const e = Math.min(n - 1, Math.floor((i / IDEAL_N) * n));
    const f = (i / IDEAL_N) * n - e;
    const [x1, y1] = verts[e];
    const [x2, y2] = verts[(e + 1) % n];
    out.push([x1 + (x2 - x1) * f, y1 + (y2 - y1) * f]);
  }
  return out;
}

type PtLike = { x: number; y: number } | [number, number];

function px(p: PtLike): number {
  return Array.isArray(p) ? p[0] : p.x;
}

function py(p: PtLike): number {
  return Array.isArray(p) ? p[1] : p.y;
}

function pathLength(pts: ReadonlyArray<PtLike>): number {
  let len = 0;
  for (let i = 1; i < pts.length; i++) {
    len += Math.hypot(px(pts[i]) - px(pts[i - 1]), py(pts[i]) - py(pts[i - 1]));
  }
  return len;
}

/** 按弧长重采样 */
function resample(pts: Array<{ x: number; y: number }>, step: number): Array<[number, number]> {
  const out: Array<[number, number]> = [];
  if (pts.length === 0) return out;
  out.push([pts[0].x, pts[0].y]);
  let acc = 0;
  let prev = pts[0];
  for (let i = 1; i < pts.length; i++) {
    let cur = pts[i];
    let d = Math.hypot(cur.x - prev.x, cur.y - prev.y);
    while (acc + d >= step) {
      const f = (step - acc) / d;
      const nx = prev.x + (cur.x - prev.x) * f;
      const ny = prev.y + (cur.y - prev.y) * f;
      out.push([nx, ny]);
      prev = { x: nx, y: ny };
      d = Math.hypot(cur.x - prev.x, cur.y - prev.y);
      acc = 0;
    }
    acc += d;
    prev = cur;
  }
  return out;
}

/** 空间哈希网格，用于近邻查询 */
function buildGrid(pts: Array<[number, number]>, cell: number): Map<number, number[]> {
  const grid = new Map<number, number[]>();
  pts.forEach(([x, y], i) => {
    const gx = Math.floor(x / cell);
    const gy = Math.floor(y / cell);
    const key = gx * 100003 + gy;
    const arr = grid.get(key);
    if (arr) arr.push(i);
    else grid.set(key, [i]);
  });
  return grid;
}

function gridNearest(grid: Map<number, number[]>, pts: Array<[number, number]>, x: number, y: number, cell: number): number {
  const gx = Math.floor(x / cell);
  const gy = Math.floor(y / cell);
  let best = Infinity;
  for (let ox = -1; ox <= 1; ox++) {
    for (let oy = -1; oy <= 1; oy++) {
      const arr = grid.get((gx + ox) * 100003 + (gy + oy));
      if (!arr) continue;
      for (const idx of arr) {
        const d = (pts[idx][0] - x) ** 2 + (pts[idx][1] - y) ** 2;
        if (d < best) best = d;
      }
    }
  }
  return Math.sqrt(best);
}

// ================= 评分 =================

/** pts 为画布坐标，ideal 为画布坐标理想路径，r 为形状半径 */
function evaluateStroke(rawPts: Pt[], ideal: Array<[number, number]>, r: number): number {
  if (rawPts.length < 8 || ideal.length < 2) return 0;
  const tol = r * 0.15;
  const up = resample(rawPts, Math.max(2, r * 0.025));
  const idealPts = ideal.map(([x, y]) => [x, y] as [number, number]);
  const perim = pathLength(idealPts);
  const len = pathLength(up);
  if (len < perim * 0.35) return 0;

  const uGrid = buildGrid(up, tol);
  const iGrid = buildGrid(idealPts, tol);

  let cov = 0;
  for (const [x, y] of idealPts) {
    if (gridNearest(uGrid, up, x, y, tol) < tol) cov++;
  }
  let prec = 0;
  const upStep = Math.max(1, Math.floor(up.length / 400));
  let upCount = 0;
  for (let i = 0; i < up.length; i += upStep) {
    const [x, y] = up[i];
    if (gridNearest(iGrid, idealPts, x, y, tol) < tol) prec++;
    upCount++;
  }
  const covPct = cov / idealPts.length;
  const precPct = prec / Math.max(1, upCount);
  const rawScore = covPct * 55 + precPct * 45;
  let score = 100 - (100 - rawScore) * 0.75;

  // 闭合度：起笔与收笔距离过远则扣分
  const first = up[0];
  const last = up[up.length - 1];
  const gap = Math.hypot(first[0] - last[0], first[1] - last[1]);
  if (gap > r * 0.28) {
    score -= Math.min(14, ((gap - r * 0.28) / r) * 30);
  }
  return Math.max(0, Math.min(100, Math.round(score * 10) / 10));
}

// ================= 音效 =================

class Sfx {
  private ctx: AudioContext | null = null;
  private noiseBuf: AudioBuffer | null = null;
  private brushSrc: AudioBufferSourceNode | null = null;
  private brushGain: GainNode | null = null;
  enabled = true;

  private ensure(): AudioContext | null {
    try {
      if (!this.ctx) {
        const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.ctx = new AC();
        const len = this.ctx.sampleRate;
        this.noiseBuf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
        const data = this.noiseBuf.getChannelData(0);
        for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
      }
      if (this.ctx.state === "suspended") void this.ctx.resume();
      return this.ctx;
    } catch {
      return null;
    }
  }

  startBrush() {
    if (!this.enabled) return;
    const ctx = this.ensure();
    if (!ctx || !this.noiseBuf || this.brushSrc) return;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuf;
    src.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 1500;
    filter.Q.value = 0.6;
    const gain = ctx.createGain();
    gain.gain.value = 0;
    src.connect(filter).connect(gain).connect(ctx.destination);
    src.start();
    this.brushSrc = src;
    this.brushGain = gain;
  }

  setBrush(v: number) {
    if (this.brushGain && this.ctx) {
      this.brushGain.gain.setTargetAtTime(Math.min(0.22, v * 0.16), this.ctx.currentTime, 0.03);
    }
  }

  stopBrush() {
    if (this.brushGain && this.ctx) {
      this.brushGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.04);
    }
    if (this.brushSrc) {
      const src = this.brushSrc;
      this.brushSrc = null;
      setTimeout(() => {
        try {
          src.stop();
        } catch {
          /* noop */
        }
      }, 150);
    }
  }

  private pluck(freq: number, delay: number, dur: number, vol: number) {
    const ctx = this.ensure();
    if (!ctx) return;
    const t0 = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.value = freq;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(vol, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  private thud() {
    const ctx = this.ensure();
    if (!ctx) return;
    const t0 = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(140, t0);
    osc.frequency.exponentialRampToValueAtTime(60, t0 + 0.25);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.35, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.3);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + 0.35);
  }

  judge(rating: Rating) {
    if (!this.enabled) return;
    if (rating === "fail") {
      this.thud();
    } else if (rating === "god") {
      this.pluck(659, 0, 0.5, 0.18);
      this.pluck(880, 0.09, 0.5, 0.16);
      this.pluck(1319, 0.18, 0.7, 0.14);
    } else if (rating === "great") {
      this.pluck(587, 0, 0.45, 0.16);
      this.pluck(880, 0.08, 0.55, 0.14);
    } else {
      this.pluck(523, 0, 0.4, 0.14);
    }
  }
}

// ================= 纸纹背景 =================

let paperPattern: CanvasPattern | null = null;
function getPaperPattern(ctx: CanvasRenderingContext2D): CanvasPattern | null {
  if (paperPattern) return paperPattern;
  const tile = document.createElement("canvas");
  tile.width = 256;
  tile.height = 256;
  const tctx = tile.getContext("2d");
  if (!tctx) return null;
  tctx.fillStyle = "#f7f2e2";
  tctx.fillRect(0, 0, 256, 256);
  // 和纸纤维
  for (let i = 0; i < 150; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    const a = Math.random() * Math.PI;
    const l = 6 + Math.random() * 18;
    tctx.strokeStyle = `rgba(${150 + Math.random() * 40 | 0}, ${130 + Math.random() * 30 | 0}, 90, ${0.04 + Math.random() * 0.05})`;
    tctx.lineWidth = 0.8;
    tctx.beginPath();
    tctx.moveTo(x, y);
    tctx.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l);
    tctx.stroke();
  }
  // 斑点
  for (let i = 0; i < 40; i++) {
    tctx.fillStyle = `rgba(120, 100, 70, ${0.02 + Math.random() * 0.03})`;
    tctx.beginPath();
    tctx.arc(Math.random() * 256, Math.random() * 256, Math.random() * 1.6, 0, Math.PI * 2);
    tctx.fill();
  }
  paperPattern = ctx.createPattern(tile, "repeat");
  return paperPattern;
}

// ================= 组件 =================

/** 读取/生成匿名设备标识（排行榜身份），localStorage 不可用时返回 null */
function getEnsoPlayerKey(): string | null {
  try {
    let key = localStorage.getItem("enso_key");
    if (!key) {
      key = (crypto.randomUUID ? crypto.randomUUID() : "k" + Date.now() + "-" + Math.random().toString(36).slice(2)).padEnd(8, "0");
      localStorage.setItem("enso_key", key);
    }
    return key;
  } catch {
    return null;
  }
}

export default function EnsoGame({
  canvasRef: externalCanvasRef,
}: {
  canvasRef?: React.RefObject<HTMLCanvasElement | null>;
}) {
  const { t } = useTranslation();

  const innerCanvasRef = useRef<HTMLCanvasElement>(null);
  const canvasRef = externalCanvasRef ?? innerCanvasRef;
  const paperRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const secRef = useRef<HTMLSpanElement>(null);
  const centerRef = useRef<HTMLDivElement>(null);
  const inkCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // 游戏状态（ref，避免每帧 re-render）
  const phaseRef = useRef<Phase>("ready");
  const roundRef = useRef(1);
  const livesRef = useRef(3);
  const scoreRef = useRef(0);
  const chainRef = useRef(0);
  const passRef = useRef(70);
  const limitRef = useRef(3.8);
  const startRef = useRef(0);
  const shapeRef = useRef<ShapeKind>("circle");
  const idealRef = useRef<Array<[number, number]>>([]);
  const ptsRef = useRef<Pt[]>([]);
  const curWRef = useRef(0);
  const lastRef = useRef<{ x: number; y: number } | null>(null);
  const judgeRef = useRef<{ info: JudgeInfo; start: number } | null>(null);
  const confettiRef = useRef<Array<{ x: number; y: number; vx: number; vy: number; rot: number; vr: number; size: number; color: string }> | null>(null);
  const lastFrameRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sizeRef = useRef({ w: 0, h: 0, r: 0, cx: 0, cy: 0 });
  const bestRef = useRef<{ score: number; pct: number; shape: string; thumb: string | null }>({ score: 0, pct: 0, shape: "", thumb: null });
  const sessionRef = useRef<{ pctSum: number; rounds: number; passed: number }>({ pctSum: 0, rounds: 0, passed: 0 });
  const sfxRef = useRef<Sfx | null>(null);

  // HUD 状态
  const [hud, setHud] = useState({ score: 0, round: 1, lives: 3, nextMult: null as number | null, phase: "ready" as Phase });
  const [judgeLine, setJudgeLine] = useState<JudgeInfo | null>(null);
  const [centerPct, setCenterPct] = useState<number | null>(null);
  const [over, setOver] = useState<OverInfo | null>(null);
  const [soundOn, setSoundOn] = useState(true);
  const [shapeUi, setShapeUi] = useState<ShapeKind>("circle");

  // 排行榜状态
  const [rankOpen, setRankOpen] = useState(false);
  const [rankTop, setRankTop] = useState<EnsoRankEntry[] | null>(null);
  const [rankMine, setRankMine] = useState<EnsoRankMine | null>(null);
  const [rankLoading, setRankLoading] = useState(false);
  const [rankErr, setRankErr] = useState(false);
  const [nick, setNick] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [regMsg, setRegMsg] = useState("");

  const secTpl = t("enso.hud.seconds", { s: "@" });
  const secUnit = secTpl.split("@")[1] ?? "s";

  const setPhase = useCallback((p: Phase) => {
    phaseRef.current = p;
    setHud((h) => ({ ...h, phase: p }));
  }, []);

  // ---------- 初始化 ----------
  useEffect(() => {
    try {
      const saved = localStorage.getItem("enso.best");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object") {
          bestRef.current = {
            score: Number(parsed.score) || 0,
            pct: Number(parsed.pct) || 0,
            shape: typeof parsed.shape === "string" ? parsed.shape : "",
            thumb: typeof parsed.thumb === "string" ? parsed.thumb : null,
          };
        }
      }
    } catch {
      /* noop */
    }
    let soundDisabled = false;
    try {
      if (localStorage.getItem("enso.sound") === "0") {
        soundDisabled = true;
        setSoundOn(false);
      }
    } catch {
      /* noop */
    }
    try {
      const savedNick = localStorage.getItem("enso_nick");
      if (savedNick) setNick(savedNick);
    } catch {
      /* noop */
    }
    sfxRef.current = new Sfx();
    sfxRef.current.enabled = !soundDisabled;
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      sfxRef.current?.stopBrush();
    };
  }, []);

  // ---------- 画布尺寸 ----------
  const renderAllInk = useCallback(() => {
    const ink = inkCanvasRef.current;
    const { w, h } = sizeRef.current;
    if (!ink) return;
    ink.width = w;
    ink.height = h;
    const ictx = ink.getContext("2d");
    if (!ictx) return;
    const pts = ptsRef.current;
    for (let i = 1; i < pts.length; i++) {
      stampSegment(ictx, pts[i - 1], pts[i]);
    }
    if (pts.length > 0) {
      stampDot(ictx, pts[0].x, pts[0].y, pts[0].w * 1.35);
    }
  }, []);

  useEffect(() => {
    const paper = paperRef.current;
    const canvas = canvasRef.current;
    if (!paper || !canvas) return;
    const ro = new ResizeObserver(() => {
      const rect = paper.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.round(rect.width));
      const h = Math.max(1, Math.round(rect.height));
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const r = Math.min(w, h) * BASE_R;
      sizeRef.current = { w, h, r, cx: w / 2, cy: h / 2 };
      rebuildIdeal();
      const ink = document.createElement("canvas");
      inkCanvasRef.current = ink;
      renderAllInk();
    });
    ro.observe(paper);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rebuildIdeal = useCallback(() => {
    const { r, cx, cy } = sizeRef.current;
    idealRef.current = idealPath(shapeRef.current).map(([x, y]) => [cx + x * r, cy + y * r]);
  }, []);

  // ---------- 墨迹 ----------
  function stampDot(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) {
    ctx.fillStyle = INK;
    ctx.globalAlpha = 0.93;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  function stampSegment(ctx: CanvasRenderingContext2D, a: Pt, b: Pt) {
    const dist = Math.hypot(b.x - a.x, b.y - a.y);
    const step = Math.max(0.7, b.w * 0.22);
    const n = Math.max(1, Math.ceil(dist / step));
    ctx.fillStyle = INK;
    ctx.globalAlpha = 0.93;
    for (let i = 0; i <= n; i++) {
      const f = i / n;
      const x = a.x + (b.x - a.x) * f;
      const y = a.y + (b.y - a.y) * f;
      const w = (a.w + (b.w - a.w) * f) / 2;
      ctx.beginPath();
      ctx.arc(x, y, w, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // ---------- 回合 ----------
  const startRound = useCallback(
    (n: number) => {
      roundRef.current = n;
      passRef.current = Math.min(70 + (n - 1) * 2, 88);
      // 随机选形状，避免与上一题重复
      let kind = SHAPE_KINDS[Math.floor(Math.random() * SHAPE_KINDS.length)];
      if (n > 1 && kind === shapeRef.current) {
        kind = SHAPE_KINDS[(SHAPE_KINDS.indexOf(kind) + 1 + Math.floor(Math.random() * (SHAPE_KINDS.length - 1))) % SHAPE_KINDS.length];
      }
      shapeRef.current = kind;
      rebuildIdeal();
      limitRef.current = Math.max(SHAPES[kind].baseTime - (n - 1) * 0.18, 0.9);
      ptsRef.current = [];
      curWRef.current = 0;
      lastRef.current = null;
      judgeRef.current = null;
      confettiRef.current = null;
      renderAllInk();
      setJudgeLine(null);
      setCenterPct(null);
      setShapeUi(kind);
      setHud((h) => ({ ...h, round: n, nextMult: chainRef.current >= 2 ? 2 : chainRef.current === 1 ? 1.5 : null, phase: "ready" }));
      phaseRef.current = "ready";
      if (barRef.current) barRef.current.style.width = "100%";
      if (secRef.current) secRef.current.textContent = limitRef.current.toFixed(1) + secUnit;
    },
    [rebuildIdeal, renderAllInk, secUnit]
  );

  // ---------- 判定 ----------
  const doJudge = useCallback(() => {
    if (phaseRef.current !== "play") return;
    setPhase("judge");
    sfxRef.current?.stopBrush();

    const { r } = sizeRef.current;
    const pct = evaluateStroke(ptsRef.current, idealRef.current, r);
    const pass = passRef.current;
    let rating: Rating;
    if (pct >= 95) rating = "god";
    else if (pct >= 90) rating = "great";
    else if (pct >= pass) rating = "good";
    else rating = "fail";

    // 连击倍率：连续 ≥90% 时叠加
    let mult = 1;
    if (pct >= 90) {
      mult = chainRef.current === 0 ? 1 : chainRef.current === 1 ? 1.5 : 2;
      chainRef.current += 1;
    } else {
      chainRef.current = 0;
    }
    const points = Math.round(pct * 10) * mult;
    scoreRef.current += points;
    const lifeLost = rating === "fail";
    if (lifeLost) livesRef.current -= 1;

    sessionRef.current.pctSum += pct;
    sessionRef.current.rounds += 1;
    if (!lifeLost) sessionRef.current.passed += 1;

    const info: JudgeInfo = { pct, rating, points, lifeLost, mult };
    judgeRef.current = { info, start: performance.now() };
    setJudgeLine(info);
    setCenterPct(pct);
    setTimeout(() => setCenterPct(null), 1150);
    setHud((h) => ({
      ...h,
      score: scoreRef.current,
      lives: livesRef.current,
      nextMult: pct >= 90 ? (chainRef.current >= 2 ? 2 : 1.5) : null,
    }));
    sfxRef.current?.judge(rating);

    if (rating === "god") {
      // 金色纸屑
      const { w } = sizeRef.current;
      const parts: Array<{ x: number; y: number; vx: number; vy: number; rot: number; vr: number; size: number; color: string }> = [];
      for (let i = 0; i < 70; i++) {
        parts.push({
          x: Math.random() * w,
          y: -20 - Math.random() * 60,
          vx: (Math.random() - 0.5) * 60,
          vy: 80 + Math.random() * 140,
          rot: Math.random() * Math.PI,
          vr: (Math.random() - 0.5) * 4,
          size: 3 + Math.random() * 6,
          color: GOLD[Math.floor(Math.random() * GOLD.length)],
        });
      }
      confettiRef.current = parts;
    }

    // 记录最佳（画缩略图）
    if (pct > bestRef.current.pct && ptsRef.current.length > 8) {
      try {
        const ink = inkCanvasRef.current;
        const { cx, cy, r: rr } = sizeRef.current;
        if (ink) {
          const thumb = document.createElement("canvas");
          thumb.width = 140;
          thumb.height = 140;
          const tctx = thumb.getContext("2d");
          if (tctx) {
            tctx.fillStyle = "#f7f2e2";
            tctx.fillRect(0, 0, 140, 140);
            const half = rr * 1.35;
            tctx.drawImage(ink, cx - half, cy - half, half * 2, half * 2, 0, 0, 140, 140);
            bestRef.current = {
              score: bestRef.current.score,
              pct,
              shape: shapeRef.current,
              thumb: thumb.toDataURL("image/jpeg", 0.72),
            };
          }
        }
      } catch {
        /* noop */
      }
    }

    const wait = rating === "god" ? GOD_MS : JUDGE_MS;
    timerRef.current = setTimeout(() => {
      if (livesRef.current <= 0) {
        // 结束
        const s = sessionRef.current;
        const avg = s.rounds > 0 ? Math.round((s.pctSum / s.rounds) * 10) / 10 : 0;
        const rankKey =
          avg >= 93 ? "god" : avg >= 88 ? "expert" : avg >= 83 ? "master" : avg >= 75 ? "skilled" : avg >= 68 ? "apprentice" : "novice";
        if (scoreRef.current > bestRef.current.score) {
          bestRef.current.score = scoreRef.current;
        }
        try {
          localStorage.setItem(
            "enso.best",
            JSON.stringify({ score: bestRef.current.score, pct: bestRef.current.pct, shape: bestRef.current.shape, thumb: bestRef.current.thumb })
          );
        } catch {
          /* noop */
        }
        setOver({
          score: scoreRef.current,
          passed: s.passed,
          avg,
          rank: t(`enso.rank.${rankKey}`),
          bestScore: bestRef.current.score,
          bestPct: bestRef.current.pct,
          bestShape: bestRef.current.shape,
          thumb: bestRef.current.thumb,
        });
        setPhase("over");
      } else {
        startRound(roundRef.current + 1);
      }
    }, wait);
  }, [setPhase, startRound, t]);

  // ---------- 渲染循环 ----------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (now - lastFrameRef.current) / 1000);
      lastFrameRef.current = now;
      const { w, h, r, cx, cy } = sizeRef.current;
      if (w === 0) return;

      // 纸底
      const pattern = getPaperPattern(ctx);
      if (pattern) {
        ctx.fillStyle = pattern;
        ctx.fillRect(0, 0, w, h);
      } else {
        ctx.fillStyle = "#f7f2e2";
        ctx.fillRect(0, 0, w, h);
      }
      // 暗角
      const vg = ctx.createRadialGradient(cx, cy, r * 0.8, cx, cy, Math.max(w, h) * 0.75);
      vg.addColorStop(0, "rgba(120, 95, 50, 0)");
      vg.addColorStop(1, "rgba(120, 95, 50, 0.1)");
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, w, h);
      // 中心虚线十字
      ctx.strokeStyle = "rgba(60, 50, 30, 0.1)";
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 6]);
      ctx.beginPath();
      ctx.moveTo(cx - r * 1.5, cy);
      ctx.lineTo(cx + r * 1.5, cy);
      ctx.moveTo(cx, cy - r * 1.5);
      ctx.lineTo(cx, cy + r * 1.5);
      ctx.stroke();
      ctx.setLineDash([]);

      // 墨迹
      const ink = inkCanvasRef.current;
      if (ink) ctx.drawImage(ink, 0, 0, w, h);

      // 判定：红色理想线
      const jd = judgeRef.current;
      if (jd) {
        const p = Math.min(1, (now - jd.start) / 450);
        const ideal = idealRef.current;
        const upto = Math.max(2, Math.floor(ideal.length * p));
        ctx.strokeStyle = "rgba(192, 57, 43, 0.85)";
        ctx.lineWidth = Math.max(2, r * 0.02);
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(ideal[0][0], ideal[0][1]);
        for (let i = 1; i < upto; i++) ctx.lineTo(ideal[i][0], ideal[i][1]);
        ctx.stroke();
      }

      // 金色纸屑
      const parts = confettiRef.current;
      if (parts) {
        let alive = false;
        for (const pt of parts) {
          pt.y += pt.vy * dt;
          pt.x += pt.vx * dt;
          pt.rot += pt.vr * dt;
          if (pt.y < h + 20) alive = true;
          ctx.save();
          ctx.translate(pt.x, pt.y);
          ctx.rotate(pt.rot);
          ctx.fillStyle = pt.color;
          ctx.fillRect(-pt.size / 2, -pt.size / 4, pt.size, pt.size / 2);
          ctx.restore();
        }
        if (!alive) confettiRef.current = null;
      }

      // 计时
      if (phaseRef.current === "play") {
        const elapsed = (now - startRef.current) / 1000;
        const left = Math.max(0, limitRef.current - elapsed);
        if (barRef.current) barRef.current.style.width = `${(left / limitRef.current) * 100}%`;
        if (secRef.current) secRef.current.textContent = left.toFixed(1) + secUnit;
        if (left <= 0) doJudge();
      }
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [canvasRef, doJudge, secUnit]);

  // ---------- 指针 ----------
  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (over) return;
      if (e.pointerType === "mouse" && e.button !== 0) return;
      if (phaseRef.current === "judge") return;
      const paper = paperRef.current;
      if (!paper) return;

      if (phaseRef.current === "ready") {
        setPhase("play");
        startRef.current = performance.now();
      } else if (phaseRef.current !== "play") {
        return;
      }
      paper.setPointerCapture(e.pointerId);
      const rect = paper.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const { r } = sizeRef.current;
      const maxW = r * 0.085;
      curWRef.current = maxW;
      const pt: Pt = { x, y, t: performance.now(), w: maxW };
      ptsRef.current = [pt];
      lastRef.current = { x, y };
      const ictx = inkCanvasRef.current?.getContext("2d");
      if (ictx) stampDot(ictx, x, y, maxW * 0.75);
      sfxRef.current?.startBrush();
    },
    [over, setPhase]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (phaseRef.current !== "play") return;
      const paper = paperRef.current;
      if (!paper) return;
      const rect = paper.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const last = lastRef.current;
      if (!last) return;
      const dist = Math.hypot(x - last.x, y - last.y);
      if (dist < 2) return;
      const now = performance.now();
      const dt = Math.max(4, now - (ptsRef.current[ptsRef.current.length - 1]?.t ?? now));
      const v = dist / dt; // px/ms
      const { r } = sizeRef.current;
      const maxW = r * 0.085;
      const minW = r * 0.04;
      const target = Math.max(minW, maxW * (1.08 - Math.min(v / 2.2, 1) * 0.78));
      curWRef.current = curWRef.current + (target - curWRef.current) * 0.3;
      const prev = ptsRef.current[ptsRef.current.length - 1];
      const pt: Pt = { x, y, t: now, w: curWRef.current };
      ptsRef.current.push(pt);
      lastRef.current = { x, y };
      const ictx = inkCanvasRef.current?.getContext("2d");
      if (ictx && prev) {
        stampSegment(ictx, prev, pt);
      }
      sfxRef.current?.setBrush(v);
    },
    []
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (phaseRef.current !== "play") return;
      const paper = paperRef.current;
      if (paper?.hasPointerCapture(e.pointerId)) paper.releasePointerCapture(e.pointerId);
      doJudge();
    },
    [doJudge]
  );

  // ---------- 重开 ----------
  const restart = useCallback(() => {
    scoreRef.current = 0;
    livesRef.current = 3;
    chainRef.current = 0;
    sessionRef.current = { pctSum: 0, rounds: 0, passed: 0 };
    setOver(null);
    setSubmitted(false);
    setRegMsg("");
    startRound(1);
  }, [startRound]);

  // ---------- 排行榜 ----------
  const openRank = useCallback(async () => {
    setRankOpen(true);
    setRankLoading(true);
    setRankErr(false);
    try {
      const data = await fetchEnsoRank(getEnsoPlayerKey());
      setRankTop(data.top);
      setRankMine(data.mine);
    } catch {
      setRankErr(true);
    } finally {
      setRankLoading(false);
    }
  }, []);

  const doRegister = useCallback(async () => {
    if (!over || submitting || submitted) return;
    const key = getEnsoPlayerKey();
    if (!key) {
      setRegMsg(t("enso.lb.noStorage"));
      return;
    }
    const name = nick.trim().slice(0, 10) || t("enso.lb.defaultName");
    try {
      localStorage.setItem("enso_nick", name);
    } catch {
      /* noop */
    }
    setSubmitting(true);
    setRegMsg(t("enso.lb.saving"));
    try {
      const res = await submitEnsoScore(key, {
        name,
        score: over.score,
        passed: over.passed,
        avg: Math.round(over.avg),
      });
      setSubmitted(true);
      const pos = res.mine ? t("enso.lb.rankN", { n: res.mine.rank }) : "";
      setRegMsg(
        res.updated
          ? t("enso.lb.saved") + (pos ? " · " + pos : "")
          : t("enso.lb.notUpdated", { n: res.best.toLocaleString() })
      );
    } catch (e) {
      const status = (e as { status?: number }).status;
      setRegMsg(status === 400 ? t("enso.lb.invalid") : t("enso.lb.fail"));
    } finally {
      setSubmitting(false);
    }
  }, [over, nick, submitting, submitted, t]);

  const toggleSound = useCallback(() => {
    setSoundOn((s) => {
      const next = !s;
      if (sfxRef.current) sfxRef.current.enabled = next;
      try {
        localStorage.setItem("enso.sound", next ? "1" : "0");
      } catch {
        /* noop */
      }
      return next;
    });
  }, []);

  const scoreFmt = hud.score.toLocaleString();
  const shapeName = t(`enso.shape.${shapeUi}`);

  return (
    <div
      className="enso-root relative flex h-full w-full select-none flex-col overflow-hidden"
      style={{ touchAction: "none" }}
    >
      {/* 顶栏 */}
      <div className="flex items-start justify-between px-4 pt-3">
        <div className="min-w-24">
          <div className="flex h-5 items-center gap-1.5">
            <span className="text-[11px] font-medium text-muted-foreground">{t("enso.hud.score")}</span>
            {hud.nextMult && (
              <span className="enso-serif rounded-[3px] bg-[#b3402f] px-1.5 py-px text-[10px] font-bold leading-tight text-white">
                {t("enso.mult.next", { m: hud.nextMult })}
              </span>
            )}
          </div>
          <div className="enso-serif text-[26px] font-black leading-8 text-[#2b2620]">{scoreFmt}</div>
        </div>
        <div className="enso-serif pt-0.5 text-lg font-bold text-[#2b2620]">{t("enso.hud.round", { n: hud.round })}</div>
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onPointerUp={(e) => e.stopPropagation()}
            onClick={openRank}
            className="inline-flex cursor-pointer items-center gap-1 rounded-[6px] border border-[#b3402f]/35 bg-[#faf6ea] px-2 py-1 text-[11px] font-bold text-[#b3402f] transition-colors hover:bg-[#f3e9d2]"
          >
            <Trophy className="size-3.5" />
            {t("enso.lb.button")}
          </button>
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className={
                  i < hud.lives
                    ? "enso-serif grid size-6 place-items-center rounded-[3px] bg-[#b3402f] text-xs font-bold text-white shadow-sm"
                    : "enso-serif grid size-6 place-items-center rounded-[3px] border border-dashed border-[#b3402f]/40 text-xs text-transparent"
                }
              >
                {t("enso.hud.brush")}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 形状 + 合格线 + 计时条 */}
      <div className="px-4 pt-2">
        <div className="flex items-end justify-between">
          <div className="flex items-center gap-2">
            <span className="enso-serif text-3xl leading-none text-[#2b2620]">{glyphOf(shapeUi)}</span>
            <span className="enso-serif text-[26px] font-bold leading-none text-[#2b2620]">{shapeName}</span>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-medium leading-3 text-[#b3402f]/80">{t("enso.hud.passLine")}</div>
            <div className="enso-serif text-xl font-black leading-6 text-[#b3402f]">{t("enso.hud.pass", { p: passRef.current })}</div>
          </div>
        </div>
        <div className="mt-1.5 h-1.75 overflow-hidden rounded-full bg-[#e4dcc4]">
          <div ref={barRef} className="h-full rounded-full bg-[#3a3128]" style={{ width: "100%" }} />
        </div>
        <div className="mt-0.5 text-right">
          <span ref={secRef} className="text-[11px] text-muted-foreground tabular-nums">
            3.8{secUnit}
          </span>
        </div>
      </div>

      {/* 纸面 */}
      <div
        ref={paperRef}
        className="enso-paper relative mx-3 flex-1 overflow-hidden rounded-md shadow-[0_2px_10px_rgba(90,70,40,0.18)]"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <canvas ref={canvasRef} className="absolute inset-0 size-full" role="img" aria-label={t("enso.hint.draw")} />

        {/* 中央百分比 */}
        {centerPct !== null && (
          <div ref={centerRef} className="enso-center-pct pointer-events-none absolute inset-0 grid place-items-center">
            <div className="text-center">
              <div className="enso-serif font-black text-[#2b2620]" style={{ fontSize: "clamp(36px, 11vw, 64px)", lineHeight: 1.1 }}>
                {centerPct.toFixed(1)}
                <span className="text-[0.45em]">%</span>
              </div>
              {centerPct >= 90 && (
                <div className="enso-serif text-sm text-muted-foreground">{t("enso.hud.pass", { p: passRef.current })}</div>
              )}
            </div>
          </div>
        )}

        {/* 神 / 喝 印章 */}
        {judgeLine && (judgeLine.rating === "god" || judgeLine.rating === "fail") && (
          <div
            key={`${hud.round}-${judgeLine.rating}`}
            className="enso-stamp pointer-events-none absolute bottom-6 right-6"
          >
            <span
              className={`enso-serif grid size-14 place-items-center rounded-md border-[3px] text-3xl font-black ${
                judgeLine.rating === "god" ? "rotate-[-8deg] border-[#b3402f] bg-[#c0392b]/10 text-[#b3402f]" : "rotate-6 border-[#b3402f] text-[#b3402f]"
              }`}
            >
              {judgeLine.rating === "god" ? t("enso.rate.god") : t("enso.rate.fail")}
            </span>
          </div>
        )}

        {/* 就绪提示 */}
        {hud.phase === "ready" && !over && (
          <div className="pointer-events-none absolute inset-x-0 bottom-4 text-center">
            <span className="enso-hint enso-serif text-sm text-[#6b5d45]">{t("enso.hint.draw")}</span>
          </div>
        )}

        {/* 声音开关 */}
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onPointerUp={(e) => e.stopPropagation()}
          onClick={toggleSound}
          className="absolute right-2 top-2 grid size-8 cursor-pointer place-items-center rounded-md bg-white/85 shadow-sm transition-colors hover:bg-white"
          aria-label={soundOn ? "mute" : "unmute"}
        >
          {soundOn ? <Volume2 className="size-4 text-[#5a4f3a]" /> : <VolumeX className="size-4 text-[#5a4f3a]" />}
        </button>
      </div>

      {/* 底部结果行 */}
      <div className="enso-serif flex h-11 items-center justify-center gap-2 text-lg font-bold">
        {judgeLine ? (
          <>
            <span className="text-[#2b2620]">{judgeLine.pct.toFixed(1)}%</span>
            <span
              className={
                judgeLine.rating === "god"
                  ? "text-[#c9a227]"
                  : judgeLine.rating === "great"
                    ? "text-[#b3402f]"
                    : judgeLine.rating === "good"
                      ? "text-[#2c5f8a]"
                      : "text-[#b3402f]"
              }
            >
              {t(`enso.rate.${judgeLine.rating}`)}
            </span>
            <span className="text-[#6b5d45]">
              +{judgeLine.points.toLocaleString()}
              {judgeLine.mult > 1 && <span className="text-sm"> ×{judgeLine.mult}</span>}
            </span>
            {judgeLine.lifeLost && <span className="text-sm font-bold text-[#b3402f]">{t("enso.rate.lifeLost")}</span>}
          </>
        ) : (
          <span className="text-transparent">-</span>
        )}
      </div>

      {/* 结算 */}
      {over && (
        <div className="absolute inset-0 z-10 grid cursor-pointer place-items-center bg-[#57503f]/45 p-4" onClick={restart}>
          <div
            className="enso-serif w-full max-w-72 rounded-xl border border-[#d8cdb4] bg-[#faf6ea] px-6 py-5 text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-sm tracking-[0.5em] text-[#6b5d45]">{t("enso.result.heading")}</div>
            <div className="mt-1 text-4xl font-black text-[#2b2620]">
              {over.score.toLocaleString()}
              <span className="text-base font-bold"> {t("enso.result.pts")}</span>
            </div>
            <div className="mt-0.5 text-xs text-muted-foreground">{t("enso.result.best", { n: over.bestScore.toLocaleString() })}</div>
            {over.thumb && (
              <img src={over.thumb} alt="enso" className="mx-auto mt-2 size-24 rounded border border-[#d8cdb4] object-cover" />
            )}
            {over.bestPct > 0 && (
              <div className="mt-1 text-sm text-[#2b2620]">
                {t("enso.result.top", { p: over.bestPct.toFixed(1), shape: t(`enso.shape.${over.bestShape}`) })}
              </div>
            )}
            <div className="mt-2 flex justify-between border-t border-[#d8cdb4] pt-2 text-sm">
              <span className="text-muted-foreground">
                {t("enso.result.passed", { n: over.passed })}
              </span>
              <span className="text-muted-foreground">{t("enso.result.avg", { p: over.avg.toFixed(1) })}</span>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">{t("enso.result.rankLabel")}</div>
            <div className="text-2xl font-black text-[#b3402f]">{over.rank}</div>

            {/* 排行榜登记 */}
            {!submitted && (
              <div className="mt-3 flex gap-1.5">
                <input
                  value={nick}
                  onChange={(e) => setNick(e.target.value.slice(0, 10))}
                  maxLength={10}
                  placeholder={t("enso.lb.nickPh")}
                  aria-label={t("enso.lb.nickAria")}
                  autoComplete="off"
                  className="min-w-0 flex-1 rounded-md border border-[#d8cdb4] bg-white/70 px-2 py-1.5 text-sm text-[#2b2620] outline-none focus:border-[#b3402f]"
                />
                <button
                  type="button"
                  onClick={doRegister}
                  disabled={submitting}
                  className="shrink-0 cursor-pointer rounded-md bg-[#b3402f] px-3 py-1.5 text-sm font-bold text-white transition-opacity disabled:opacity-50"
                >
                  {t("enso.lb.register")}
                </button>
              </div>
            )}
            {regMsg && <div className="mt-1.5 text-xs text-[#6b5d45]">{regMsg}</div>}
            <button
              type="button"
              onClick={openRank}
              className="mt-3 inline-flex cursor-pointer items-center gap-1 rounded-md border border-[#b3402f]/35 px-3 py-1.5 text-sm font-bold text-[#b3402f] transition-colors hover:bg-[#f3e9d2]"
            >
              <Trophy className="size-4" />
              {t("enso.lb.button")}
            </button>
            <button type="button" onClick={restart} className="enso-hint mt-3 block w-full cursor-pointer text-sm text-[#6b5d45]">
              {t("enso.result.retry")}
            </button>
          </div>
        </div>
      )}

      {/* 排行榜 */}
      {rankOpen && (
        <div
          className="absolute inset-0 z-20 flex bg-[#57503f]/45 p-3"
          onClick={() => setRankOpen(false)}
        >
          <div
            className="enso-serif mx-auto flex h-full w-full max-w-md flex-col rounded-xl border border-[#d8cdb4] bg-[#faf6ea] p-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#2b2620]">{t("enso.lb.title")}</h3>
              <button
                type="button"
                onClick={() => setRankOpen(false)}
                aria-label={t("enso.lb.close")}
                className="grid size-8 cursor-pointer place-items-center rounded-md text-[#6b5d45] transition-colors hover:bg-[#f3e9d2]"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="mt-1 text-sm text-[#6b5d45]">
              {rankMine ? (
                <>
                  {t("enso.lb.myPos")}
                  <b className="text-[#b3402f]">{t("enso.lb.rankN", { n: rankMine.rank })}</b>
                  {` · ${t("enso.lb.points", { n: rankMine.score.toLocaleString() })}`}
                  {!rankMine.inTop && <span>{t("enso.lb.outOfTop")}</span>}
                </>
              ) : (
                <span>{t("enso.lb.unregistered")}</span>
              )}
            </div>
            <div className="mt-2 flex-1 overflow-y-auto">
              {rankLoading && !rankTop ? (
                <div className="py-8 text-center text-sm text-[#6b5d45]">{t("enso.lb.loading")}</div>
              ) : rankErr ? (
                <div className="py-8 text-center text-sm text-[#6b5d45]">{t("enso.lb.loadError")}</div>
              ) : !rankTop || rankTop.length === 0 ? (
                <div className="py-8 text-center text-sm text-[#6b5d45]">{t("enso.lb.empty")}</div>
              ) : (
                rankTop.map((row, i) => (
                  <div
                    key={`${i}-${row.name}-${row.score}`}
                    className={`flex items-center gap-3 border-b border-[#e7ddc6] px-1 py-2 last:border-b-0 ${row.me ? "rounded bg-[#f3e9d2]" : ""}`}
                  >
                    <div className={`w-6 shrink-0 text-center text-sm font-black ${i < 3 ? "text-[#b3402f]" : "text-[#8a7765]"}`}>
                      {i + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-bold text-[#2b2620]">
                        {row.name}
                        {row.me && <span className="ml-1 text-[10px] font-normal text-[#b3402f]">{t("enso.lb.youTag")}</span>}
                      </div>
                      <div className="text-[11px] text-[#8a7765]">{t("enso.lb.statLine", { passed: row.passed, avg: row.avg })}</div>
                    </div>
                    <div className="shrink-0 text-sm font-black tabular-nums text-[#2b2620]">{row.score.toLocaleString()}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function glyphOf(kind: ShapeKind): string {
  switch (kind) {
    case "circle":
      return "○";
    case "square":
      return "□";
    case "triangle":
      return "△";
    case "diamond":
      return "◇";
    case "star":
      return "☆";
  }
}
