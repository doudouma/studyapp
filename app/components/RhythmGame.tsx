/* 节奏游戏组件
   基于 template/web 的节奏锻造师移植:
   - 上传/拖拽 -> 解码 -> (Worker) 分析鼓点 -> 生成谱面 -> 4K 下落式音游
   用户文件只在本地浏览器处理, 不会上传到任何服务器。 */
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { AudioLines, Music, Pause, Play, RotateCcw } from "lucide-react";
import { analyze, resample, SR } from "~/lib/rhythm/analyzer";
import type { Beatmap, DiffName, AnalyzeOpts } from "~/lib/rhythm/analyzer";
import { rhythmCss } from "~/lib/rhythm/rhythm.css";
import { Button } from "~/components/ui/button";

const LANES = 4;
const KEYS = ["d", "f", "j", "k"];
/* 四轨四色: 粉 / 青 / 琥珀 / 紫, 亮度接近以免某轨显得更"重" */
const COLORS = ["#ff4d8d", "#3ddcff", "#ffc247", "#a77bff"];
const laneBg = [
  "rgba(255,77,141,.055)",
  "rgba(61,220,255,.055)",
  "rgba(255,194,71,.055)",
  "rgba(167,123,255,.055)",
];
/* 判定窗口: 移动端触屏有 50-80ms 延迟, Perfect 窗口不能太窄 */
const W = { perfect: 0.055, great: 0.105, good: 0.165, miss: 0.195 };
const SCORE = { perfect: 300, great: 200, good: 100, miss: 0 };
const BASE_TRAVEL = 1.1; // 音符从顶部落到判定线的秒数(speed=1)
const HIT_LINE = 0.84; // 判定线在画布高度的比例
const LEAD_IN = 5.0; // 点开始后的准备时间(秒), 期间不落任何音符

export interface JudgementStat {
  score: number;
  combo: number;
  maxCombo: number;
  perfect: number;
  great: number;
  good: number;
  miss: number;
}

/* ---------- 评级 ----------
   SSS 要求全 Perfect(理论满分), 是硬门槛而非百分比 */
export const RANKS = [
  { key: "SSS", min: 100, color: "#ff6bd6" },
  { key: "SS", min: 98, color: "#ffd45e" },
  { key: "S", min: 93, color: "#ffd45e" },
  { key: "A", min: 85, color: "#5eff9f" },
  { key: "B", min: 75, color: "#3ddcff" },
  { key: "C", min: 60, color: "#a77bff" },
  { key: "D", min: 0, color: "#8892ab" },
];

export function accuracyOf(stat: JudgementStat) {
  const total = stat.perfect + stat.great + stat.good + stat.miss;
  if (!total) return 100;
  // 权重参考 IIDX: Great 0.85 / Good 0.5
  const got = stat.perfect * 1 + stat.great * 0.85 + stat.good * 0.5;
  return (got / total) * 100;
}

export function rankOf(stat: JudgementStat) {
  const acc = accuracyOf(stat);
  const total = stat.perfect + stat.great + stat.good + stat.miss;
  if (total > 0 && stat.perfect === total) return RANKS[0];
  return RANKS.find((r) => acc >= r.min && r.key !== "SSS") || RANKS[RANKS.length - 1];
}

interface EngineDoms {
  canvas: HTMLCanvasElement | null;
  score: HTMLElement | null;
  combo: HTMLElement | null;
  acc: HTMLElement | null;
  judge: HTMLElement | null;
  big: HTMLElement | null;
  bar: HTMLElement | null;
  overlay: HTMLElement | null;
}

interface RuntimeNote {
  t: number;
  lane: number;
  d: number;
  hit: boolean;
  dead: boolean;
  holding: boolean;
}

/* ==================== 游戏引擎 (game.js 移植) ==================== */
class RhythmEngine {
  private doms: EngineDoms;
  private g: CanvasRenderingContext2D | null;
  private beatmap: Beatmap;
  private ac: AudioContext;
  private buffer: AudioBuffer;
  private onFinish: (stat: JudgementStat) => void;

  private diff: DiffName = "normal";
  private notes: RuntimeNote[] = [];
  private speed = 1;
  private travel = BASE_TRAVEL;
  private running = false;
  private raf = 0;
  private dpr = 1;
  private cw = 0;
  private ch = 0;
  private disposed = false;

  /* 音频 (AudioContext 时钟) */
  private src: AudioBufferSourceNode | null = null;
  private startedAt = 0;
  private pausedAt = 0;
  private playing = false;

  /* 渲染缓存: 音符预渲染成离屏 sprite, 渐变按尺寸缓存 */
  private cache: {
    notes: { img: HTMLCanvasElement; pad: number; w: number; h: number }[];
    streak: HTMLCanvasElement | null;
    edge: HTMLCanvasElement | null;
    bg: CanvasGradient | null;
    laneFlash: CanvasGradient[];
    nh: number;
  } = { notes: [], streak: null, edge: null, bg: null, laneFlash: [], nh: 0 };

  private stat: JudgementStat = {
    score: 0, combo: 0, maxCombo: 0, perfect: 0, great: 0, good: 0, miss: 0,
  };
  private laneFlash = new Array(LANES).fill(0);
  private laneHeld = new Array(LANES).fill(false);
  private bursts: { x: number; y: number; vx: number; vy: number; color: string; life: number }[] = [];
  private rings: { lane: number; color: string; life: number }[] = [];
  private sparks: { x: number; y: number; vx: number; vy: number; color: string; life: number }[] = [];
  private milestone = 0;
  private milestoneFx = 0;
  private shockwaves: { color: string; life: number }[] = [];
  private streaks: {
    x: number; y: number; vx: number; vy: number; w: number; color: string; life: number;
  }[] = [];
  private shake = 0;
  private pulse = 0;
  private lastComboShown = -1;
  private lastCount = -1;
  private perf = { last: 0, avg: 16.7, level: 1, frame: 0 };
  private head = 0;
  private tail = 0;
  private hudDirty = false;
  private flashTimer: ReturnType<typeof setTimeout> | null = null;
  private bigTimer: ReturnType<typeof setTimeout> | null = null;
  private touchLane = new Map<number, number>();

  constructor(
    doms: EngineDoms,
    beatmap: Beatmap,
    buffer: AudioBuffer,
    ctx: AudioContext,
    onFinish: (stat: JudgementStat) => void
  ) {
    this.doms = doms;
    this.beatmap = beatmap;
    this.buffer = buffer;
    this.ac = ctx;
    this.onFinish = onFinish;
    this.g = doms.canvas ? doms.canvas.getContext("2d") : null;
    this.attach();
  }

  /* ---------- 事件绑定 ---------- */
  private onKeydown = (e: KeyboardEvent) => {
    const i = KEYS.indexOf(e.key.toLowerCase());
    if (i >= 0) {
      e.preventDefault();
      this.press(i);
      return;
    }
    if (e.key === "Escape" && this.running) this.togglePause();
    if (e.key === " " && this.doms.overlay && !this.doms.overlay.hidden) {
      e.preventDefault();
      this.togglePause();
    }
  };
  private onKeyup = (e: KeyboardEvent) => {
    const i = KEYS.indexOf(e.key.toLowerCase());
    if (i >= 0) this.release(i);
  };
  private onTouchStart = (e: TouchEvent) => {
    e.preventDefault();
    if (!this.doms.canvas) return;
    for (const t of Array.from(e.changedTouches)) {
      const l = this.laneOf(t.clientX);
      this.touchLane.set(t.identifier, l);
      this.press(l);
    }
  };
  private onTouchEnd = (e: TouchEvent) => {
    e.preventDefault();
    for (const t of Array.from(e.changedTouches)) {
      const l = this.touchLane.get(t.identifier);
      if (l !== undefined) {
        this.release(l);
        this.touchLane.delete(t.identifier);
      }
    }
  };
  private onTouchCancel = (e: TouchEvent) => {
    for (const t of Array.from(e.changedTouches)) {
      const l = this.touchLane.get(t.identifier);
      if (l !== undefined) {
        this.release(l);
        this.touchLane.delete(t.identifier);
      }
    }
  };
  private onMouseDown = (e: MouseEvent) => {
    if (!this.doms.canvas) return;
    this.press(this.laneOf(e.clientX));
  };
  private onMouseUp = () => {
    for (let i = 0; i < LANES; i++) this.release(i);
  };
  private onResize = () => {
    if (this.running) this.resize();
  };
  private onOrient = () => {
    setTimeout(() => {
      if (this.running) this.resize();
    }, 200);
  };
  private onVis = () => {
    if (document.hidden && this.running) this.togglePause();
  };

  private attach() {
    addEventListener("keydown", this.onKeydown);
    addEventListener("keyup", this.onKeyup);
    const c = this.doms.canvas;
    if (c) {
      c.addEventListener("touchstart", this.onTouchStart, { passive: false });
      c.addEventListener("touchend", this.onTouchEnd, { passive: false });
      c.addEventListener("touchcancel", this.onTouchCancel);
      c.addEventListener("mousedown", this.onMouseDown);
    }
    addEventListener("mouseup", this.onMouseUp);
    addEventListener("resize", this.onResize);
    addEventListener("orientationchange", this.onOrient);
    document.addEventListener("visibilitychange", this.onVis);
  }

  destroy() {
    this.disposed = true;
    this.running = false;
    cancelAnimationFrame(this.raf);
    this.stopAudio();
    removeEventListener("keydown", this.onKeydown);
    removeEventListener("keyup", this.onKeyup);
    const c = this.doms.canvas;
    if (c) {
      c.removeEventListener("touchstart", this.onTouchStart);
      c.removeEventListener("touchend", this.onTouchEnd);
      c.removeEventListener("touchcancel", this.onTouchCancel);
      c.removeEventListener("mousedown", this.onMouseDown);
    }
    removeEventListener("mouseup", this.onMouseUp);
    removeEventListener("resize", this.onResize);
    removeEventListener("orientationchange", this.onOrient);
    document.removeEventListener("visibilitychange", this.onVis);
  }

  /* ---------- 音频 ---------- */
  private unlock() {
    if (this.ac.state === "suspended") void this.ac.resume();
  }
  private stopSrc() {
    if (this.src) {
      try {
        this.src.stop();
      } catch {
        /* 已停止 */
      }
      this.src.disconnect();
      this.src = null;
    }
  }
  private async playAudio(from = 0) {
    this.unlock();
    if (this.ac.state === "suspended") await this.ac.resume();
    this.stopSrc();
    const s = this.ac.createBufferSource();
    s.buffer = this.buffer;
    s.connect(this.ac.destination);
    /* from 为负数时表示前置留白: 音频延后启动, 时钟先走负数 */
    const delay = from < 0 ? -from : 0;
    const offset = from < 0 ? 0 : from;
    s.start(this.ac.currentTime + delay, offset);
    this.src = s;
    this.startedAt = this.ac.currentTime + delay - offset;
    this.playing = true;
  }
  private pauseAudio() {
    if (!this.playing) return;
    this.pausedAt = this.time();
    this.stopSrc();
    this.playing = false;
  }
  private stopAudio() {
    this.pauseAudio();
    this.pausedAt = 0;
  }
  private time() {
    return this.playing ? this.ac.currentTime - this.startedAt : this.pausedAt;
  }
  private get duration() {
    return this.beatmap.duration;
  }

  /* ---------- 画布尺寸 ---------- */
  private makeCanvas(w: number, h: number) {
    const c = document.createElement("canvas");
    c.width = Math.max(1, Math.ceil(w));
    c.height = Math.max(1, Math.ceil(h));
    return c;
  }

  /* 音符连同辉光一次性画进离屏画布 */
  private buildNoteSprites(lw: number, nh: number) {
    const pad = 14;
    const w = lw * 0.82;
    this.cache.notes = [];
    for (let i = 0; i < LANES; i++) {
      const c = this.makeCanvas(w + pad * 2, nh + pad * 2);
      const g = c.getContext("2d");
      if (!g) continue;
      const col = COLORS[i];
      g.translate(pad, pad);
      g.shadowColor = col;
      g.shadowBlur = 16;
      g.fillStyle = col;
      this.roundRect(g, 0, 0, w, nh, nh * 0.42);
      g.fill();
      g.shadowBlur = 0;
      g.fillStyle = "rgba(255,255,255,.30)";
      this.roundRect(g, w * 0.08, nh * 0.23, w * 0.84, Math.max(2, nh * 0.16), nh * 0.12);
      g.fill();
      g.strokeStyle = "rgba(255,255,255,.55)";
      g.lineWidth = 1;
      this.roundRect(g, 0.5, 0.5, w - 1, nh - 1, nh * 0.38);
      g.stroke();
      this.cache.notes.push({ img: c, pad, w, h: nh });
    }
  }

  private buildStreakSprite(bw: number) {
    const h = 52;
    const c = this.makeCanvas(bw, h);
    const g = c.getContext("2d");
    if (!g) return;
    const sg = g.createLinearGradient(0, 0, 0, h);
    sg.addColorStop(0, "rgba(255,255,255,0)");
    sg.addColorStop(0.5, "rgba(255,255,255,.55)");
    sg.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = sg;
    g.fillRect(0, 0, bw, h);
    this.cache.streak = c;
  }

  private buildEdgeSprite() {
    const c = this.makeCanvas(this.cw, this.ch);
    const g = c.getContext("2d");
    if (!g) return;
    const edge = Math.max(this.cw, this.ch) * 0.13;
    const sides = [
      [0, 0, 0, edge],
      [0, this.ch, 0, this.ch - edge],
      [0, 0, edge, 0],
      [this.cw, 0, this.cw - edge, 0],
    ];
    for (const [x0, y0, x1, y1] of sides) {
      const lg = g.createLinearGradient(x0, y0, x1, y1);
      lg.addColorStop(0, "rgba(255,224,140,1)");
      lg.addColorStop(1, "rgba(255,224,140,0)");
      g.fillStyle = lg;
      g.fillRect(0, 0, this.cw, this.ch);
    }
    this.cache.edge = c;
  }

  private buildCache() {
    if (!this.g) return;
    const lw = this.cw / LANES;
    const hy = this.ch * HIT_LINE;
    this.cache.nh = Math.max(22, this.ch * 0.034);
    this.buildNoteSprites(lw, this.cache.nh);
    this.buildStreakSprite(lw * 0.68);
    this.buildEdgeSprite();

    this.cache.bg = this.g.createRadialGradient(
      this.cw / 2, hy, 0, this.cw / 2, hy, Math.max(this.cw, this.ch) * 0.95
    );
    this.cache.bg.addColorStop(0, "rgba(120,90,220,1)");
    this.cache.bg.addColorStop(0.55, "rgba(60,40,140,.35)");
    this.cache.bg.addColorStop(1, "rgba(8,10,20,0)");

    this.cache.laneFlash = [];
    for (let i = 0; i < LANES; i++) {
      const g = this.g.createLinearGradient(0, hy, 0, hy - this.ch * 0.42);
      g.addColorStop(0, this.hexA(COLORS[i], 1));
      g.addColorStop(1, this.hexA(COLORS[i], 0));
      this.cache.laneFlash.push(g);
    }
  }

  private resize() {
    if (!this.doms.canvas) return;
    /* dpr 封顶 1.5: 视觉差异很小, 但填充率减少约 45% */
    this.dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const r = this.doms.canvas.getBoundingClientRect();
    this.cw = r.width;
    this.ch = r.height;
    this.doms.canvas.width = Math.round(this.cw * this.dpr);
    this.doms.canvas.height = Math.round(this.ch * this.dpr);
    if (this.g) this.g.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.buildCache();
  }

  private roundRect(
    g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number
  ) {
    r = Math.min(r, w / 2, Math.abs(h) / 2);
    g.beginPath();
    g.moveTo(x + r, y);
    g.arcTo(x + w, y, x + w, y + h, r);
    g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r);
    g.arcTo(x, y, x + w, y, r);
    g.closePath();
  }

  private hexA(hex: string, a: number) {
    const v = parseInt(hex.slice(1), 16);
    return `rgba(${(v >> 16) & 255},${(v >> 8) & 255},${v & 255},${a})`;
  }

  /* ---------- 开局 ---------- */
  begin(diff: DiffName) {
    const chart = this.beatmap.charts[diff];
    this.diff = diff;
    this.speed = chart.speed || 1;
    this.travel = BASE_TRAVEL / this.speed;
    this.notes = chart.notes.map((n) => ({
      t: n.t, lane: n.lane, d: n.d || 0, hit: false, dead: false, holding: false,
    }));
    Object.assign(this.stat, {
      score: 0, combo: 0, maxCombo: 0, perfect: 0, great: 0, good: 0, miss: 0,
    });
    this.laneFlash.fill(0);
    this.laneHeld.fill(false);
    this.bursts.length = 0;
    this.rings.length = 0;
    this.sparks.length = 0;
    this.shockwaves.length = 0;
    this.streaks.length = 0;
    this.shake = 0;
    this.milestone = 0;
    this.milestoneFx = 0;
    this.pulse = 0;
    this.lastCount = -1;
    this.lastComboShown = -1;
    this.resize();
    this.unlock();
    this.head = 0;
    this.tail = 0;
    void this.playAudio(-LEAD_IN)
      .then(() => {
        if (this.disposed) return;
        this.running = true;
        this.raf = requestAnimationFrame(this.loop);
      })
      .catch(() => {
        this.flash("音频启动失败", "#ff4d6d");
      });
  }

  /* ---------- 主循环 ---------- */
  private loop = (ts: number) => {
    if (!this.running) return;
    this.tickPerf(ts || performance.now());
    const now = this.time();
    this.advance(now);
    this.draw(now);
    this.flushHud();
    this.countdown(now);
    if (this.perf.frame++ % 6 === 0) {
      const pct = Math.max(0, Math.min(100, (now / this.duration) * 100));
      if (this.doms.bar) this.doms.bar.style.width = pct + "%";
    }
    if (now >= this.duration - 0.02) return this.finish();
    this.raf = requestAnimationFrame(this.loop);
  };

  private tickPerf(ts: number) {
    if (this.perf.last) {
      const dt = ts - this.perf.last;
      if (dt > 0 && dt < 500) this.perf.avg = this.perf.avg * 0.9 + dt * 0.1;
    }
    this.perf.last = ts;
    if (this.perf.avg > 26 && this.perf.level > 0.35)
      this.perf.level = Math.max(0.35, this.perf.level - 0.02);
    else if (this.perf.avg < 19 && this.perf.level < 1)
      this.perf.level = Math.min(1, this.perf.level + 0.01);
  }

  /* 前置准备期的倒计时提示 */
  private countdown(now: number) {
    if (now >= 0) {
      if (this.lastCount !== 0) {
        this.lastCount = 0;
        if (this.doms.big) this.doms.big.classList.remove("show");
      }
      return;
    }
    const n = Math.ceil(-now);
    if (n !== this.lastCount) {
      this.lastCount = n;
      this.bigText(String(n), "#ffd45e");
    }
  }

  /* 推进滑动窗口, 并对漏掉的音符判 MISS */
  private advance(now: number) {
    while (this.tail < this.notes.length && this.notes[this.tail].t - now <= this.travel + 0.15)
      this.tail++;
    while (this.head < this.tail && this.notes[this.head].dead && !this.notes[this.head].holding)
      this.head++;

    for (let i = this.head; i < this.tail; i++) {
      const n = this.notes[i];
      if (n.dead) continue;
      if (!n.hit && now - n.t > W.miss) {
        n.dead = true;
        this.judge("miss");
        if (n.d > 0) this.judge("miss", true);
      } else if (n.holding && now >= n.t + n.d) {
        n.dead = true;
        n.holding = false;
        this.laneFlash[n.lane] = 1;
        this.judge("perfect", true);
        this.spawnHitEffect(n.lane, "perfect");
      }
    }
  }

  private energyAt(now: number) {
    if (!this.beatmap.env || !this.beatmap.env.length || now < 0) return 0;
    const i = Math.floor(now * (this.beatmap.envFps || 20));
    if (i < 0 || i >= this.beatmap.env.length) return 0;
    return this.beatmap.env[i] / 100;
  }

  private draw(now: number) {
    const g = this.g;
    if (!g) return;
    const lw = this.cw / LANES;
    const hy = this.ch * HIT_LINE;

    const e = this.energyAt(now);
    this.pulse = e > this.pulse ? e : this.pulse * 0.88 + e * 0.12;
    if (this.milestoneFx > 0) this.milestoneFx = Math.max(0, this.milestoneFx - 0.016);

    g.clearRect(0, 0, this.cw, this.ch);

    g.save();
    if (this.shake > 0.01) {
      g.translate(
        (Math.random() - 0.5) * this.shake * 16,
        (Math.random() - 0.5) * this.shake * 11
      );
      this.shake *= 0.9;
    } else {
      this.shake = 0;
    }

    const bg = this.cache.bg;
    const glow = 0.05 + this.pulse * 0.26 + this.milestoneFx * 0.12;
    g.globalAlpha = glow;
    if (bg) {
      g.fillStyle = bg;
      g.fillRect(0, 0, this.cw, this.ch);
    }
    g.globalAlpha = 1;

    for (let i = 0; i < LANES; i++) {
      g.fillStyle = laneBg[i];
      g.fillRect(i * lw, 0, lw, this.ch);
      if (this.laneFlash[i] > 0) {
        g.globalAlpha = this.laneFlash[i] * 0.28;
        g.fillStyle = this.cache.laneFlash[i];
        g.fillRect(i * lw, hy - this.ch * 0.42, lw, this.ch * 0.42);
        g.globalAlpha = 1;
        this.laneFlash[i] = Math.max(0, this.laneFlash[i] - 0.06);
      }
    }
    g.strokeStyle = "rgba(255,255,255,.07)";
    g.lineWidth = 1;
    for (let i = 1; i < LANES; i++) {
      g.beginPath();
      g.moveTo(i * lw, 0);
      g.lineTo(i * lw, this.ch);
      g.stroke();
    }

    g.strokeStyle = "rgba(255,212,94,.20)";
    g.lineWidth = 9;
    g.beginPath();
    g.moveTo(0, hy);
    g.lineTo(this.cw, hy);
    g.stroke();
    g.strokeStyle = "rgba(255,240,180,.95)";
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(0, hy);
    g.lineTo(this.cw, hy);
    g.stroke();
    this.drawEffects(hy);

    const nh = this.cache.nh;
    for (let i = this.head; i < this.tail; i++) {
      const n = this.notes[i];
      if (n.hit && !n.holding) continue;
      const dt = n.t - now;
      if (dt > this.travel + 0.1) continue;
      if (dt < -0.35 && !n.holding) continue;

      const y = hy - (dt / this.travel) * hy;
      const x = n.lane * lw + lw * 0.09;
      const w = lw * 0.82;

      if (n.d > 0) {
        const yEnd = hy - ((n.t + n.d - now) / this.travel) * hy;
        const top = Math.min(y, yEnd);
        const bot = Math.max(y, yEnd);
        const bx = x + w * 0.16;
        const bw = w * 0.68;
        const bh = bot - top;
        g.globalAlpha = n.holding ? 0.48 : 0.24;
        g.fillStyle = COLORS[n.lane];
        this.rrect(bx, top, bw, bh, w * 0.2);
        g.fill();
        g.globalAlpha = 1;
        if (n.holding && this.cache.streak) {
          g.save();
          this.rrect(bx, top, bw, bh, w * 0.2);
          g.clip();
          const off = ((now / 0.42) % 1) * bh;
          for (let k = -1; k <= 1; k++) {
            const sy = bot - off + k * bh - 26;
            if (sy > bot || sy + 52 < top) continue;
            g.drawImage(this.cache.streak, bx, sy, bw, 52);
          }
          g.restore();
          this.spawnHoldSpark(n.lane, hy);
        }
      }
      const sp = this.cache.notes[n.lane];
      if (sp) g.drawImage(sp.img, x - sp.pad, y - nh / 2 - sp.pad);
    }

    for (let i = 0; i < LANES; i++) {
      if (this.laneHeld[i]) {
        g.globalAlpha = 0.3;
        g.fillStyle = COLORS[i];
      } else {
        g.globalAlpha = 1;
        g.fillStyle = "rgba(255,255,255,.05)";
      }
      g.fillRect(i * lw + 1, hy + 2, lw - 2, this.ch - hy - 2);
    }
    g.globalAlpha = 1;

    this.drawFullScreenFx(hy);
    g.restore();
  }

  private rrect(x: number, y: number, w: number, h: number, r: number) {
    const g = this.g;
    if (!g) return;
    r = Math.min(r, w / 2, Math.abs(h) / 2);
    g.beginPath();
    g.moveTo(x + r, y);
    g.arcTo(x + w, y, x + w, y + h, r);
    g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r);
    g.arcTo(x, y, x + w, y, r);
    g.closePath();
  }

  private drawFullScreenFx(hy: number) {
    const g = this.g;
    if (!g) return;
    for (let i = this.streaks.length - 1; i >= 0; i--) {
      const s = this.streaks[i];
      s.life -= 0.035;
      if (s.life <= 0) {
        this.streaks.splice(i, 1);
        continue;
      }
      s.x += s.vx;
      s.y += s.vy;
      g.strokeStyle = this.hexA(s.color, s.life * 0.34);
      g.lineWidth = s.w;
      g.beginPath();
      g.moveTo(s.x, s.y);
      g.lineTo(s.x - s.vx * 7, s.y - s.vy * 7);
      g.stroke();
    }
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const s = this.shockwaves[i];
      s.life -= 0.028;
      if (s.life <= 0) {
        this.shockwaves.splice(i, 1);
        continue;
      }
      const p = 1 - s.life;
      const r = p * Math.max(this.cw, this.ch) * 1.15;
      g.strokeStyle = this.hexA(s.color, s.life * s.life * 0.38);
      g.lineWidth = 1.5 + s.life * 4;
      g.beginPath();
      g.arc(this.cw / 2, hy, r, 0, Math.PI * 2);
      g.stroke();
    }
    if (this.milestoneFx > 0) {
      const f = this.milestoneFx;
      const soft = f * f;
      g.fillStyle = `rgba(255,214,110,${(soft * 0.055).toFixed(3)})`;
      g.fillRect(0, 0, this.cw, this.ch);
      if (this.cache.edge) {
        g.globalAlpha = soft * 0.22;
        g.drawImage(this.cache.edge, 0, 0, this.cw, this.ch);
        g.globalAlpha = 1;
      }
      g.fillStyle = `rgba(255,236,180,${(soft * 0.13).toFixed(3)})`;
      g.fillRect(0, hy - 26 * f, this.cw, 52 * f);
    }
  }

  private spawnHoldSpark(lane: number, hy: number) {
    if (this.sparks.length > 40 * this.perf.level) return;
    if (Math.random() > 0.55 * this.perf.level) return;
    const lw = this.cw / LANES;
    const x = (lane + 0.5) * lw + (Math.random() - 0.5) * lw * 0.5;
    this.sparks.push({
      x,
      y: hy,
      vx: (Math.random() - 0.5) * 1.1,
      vy: -1.6 - Math.random() * 1.8,
      color: COLORS[lane],
      life: 0.85 + Math.random() * 0.3,
    });
  }

  private drawEffects(hy: number) {
    const g = this.g;
    if (!g) return;
    const lw = this.cw / LANES;
    for (let i = this.rings.length - 1; i >= 0; i--) {
      const r = this.rings[i];
      r.life -= 0.055;
      if (r.life <= 0) {
        this.rings.splice(i, 1);
        continue;
      }
      const x = (r.lane + 0.5) * lw;
      const radius = (1 - r.life) * lw * 1.15 + lw * 0.2;
      g.strokeStyle = this.hexA(r.color, r.life * 0.75);
      g.lineWidth = 2 + r.life * 3;
      g.beginPath();
      g.arc(x, hy, radius, 0, Math.PI * 2);
      g.stroke();
    }
    for (let i = this.bursts.length - 1; i >= 0; i--) {
      const p = this.bursts[i];
      p.life -= 0.045;
      if (p.life <= 0) {
        this.bursts.splice(i, 1);
        continue;
      }
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.13;
      g.fillStyle = this.hexA(p.color, p.life * p.life);
      g.beginPath();
      g.arc(p.x, p.y, 1.8 + p.life * 2.6, 0, Math.PI * 2);
      g.fill();
    }
    for (let i = this.sparks.length - 1; i >= 0; i--) {
      const s = this.sparks[i];
      s.life -= 0.05;
      if (s.life <= 0) {
        this.sparks.splice(i, 1);
        continue;
      }
      s.x += s.vx;
      s.y += s.vy;
      s.vy *= 0.97;
      g.fillStyle = this.hexA(s.color, s.life * 0.8);
      g.beginPath();
      g.arc(s.x, s.y, 1.2 + s.life * 1.8, 0, Math.PI * 2);
      g.fill();
    }
    if (this.milestoneFx > 0) {
      g.fillStyle = `rgba(255,255,255,${(this.milestoneFx * 0.3).toFixed(3)})`;
      g.fillRect(0, hy - 34 * this.milestoneFx, this.cw, 68 * this.milestoneFx);
    }
  }

  private spawnHitEffect(lane: number, kind: "perfect" | "great" | "good" | "miss") {
    const color = TCOL[kind];
    const x = (lane + 0.5) * (this.cw / LANES);
    const y = this.ch * HIT_LINE;
    this.rings.push({ lane, color, life: 1 });
    const count = Math.max(
      3,
      Math.round((kind === "perfect" ? 14 : kind === "great" ? 10 : 7) * this.perf.level)
    );
    for (let i = 0; i < count; i++) {
      const a = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
      const v = 2.2 + Math.random() * 3.2;
      this.bursts.push({
        x,
        y,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v - 1.5,
        color,
        life: 0.9 + Math.random() * 0.25,
      });
    }
    if (this.bursts.length > 72) this.bursts.splice(0, this.bursts.length - 72);
    if (this.rings.length > 8) this.rings.splice(0, this.rings.length - 8);
  }

  /* ---------- 判定 ---------- */
  private press(lane: number) {
    if (!this.running || this.laneHeld[lane]) return;
    this.laneHeld[lane] = true;
    this.laneFlash[lane] = 1;

    const now = this.time();
    let best: RuntimeNote | null = null;
    let bestGap = Infinity;
    for (let i = this.head; i < this.tail; i++) {
      const n = this.notes[i];
      if (n.lane !== lane || n.hit || n.dead) continue;
      const gap = Math.abs(n.t - now);
      if (gap < bestGap) {
        bestGap = gap;
        best = n;
      }
    }
    if (!best || bestGap > W.good) return;

    best.hit = true;
    if (best.d > 0) best.holding = true;
    else best.dead = true;
    const kind = bestGap <= W.perfect ? "perfect" : bestGap <= W.great ? "great" : "good";
    this.spawnHitEffect(lane, kind);
    this.judge(kind);
  }

  private release(lane: number) {
    this.laneHeld[lane] = false;
    const now = this.time();
    for (let i = this.head; i < this.tail; i++) {
      const n = this.notes[i];
      if (n.lane !== lane || !n.holding) continue;

      const ratio = n.d > 0 ? (now - n.t) / n.d : 1;
      n.holding = false;
      n.dead = true;
      if (ratio >= 0.8 - 0.001) {
        this.judge("perfect", true);
        this.spawnHitEffect(lane, "perfect");
      } else if (ratio >= 0.5 - 0.001) {
        this.judge("good", true);
      } else {
        this.judge("miss", true);
      }
    }
  }

  private judge(kind: "perfect" | "great" | "good" | "miss", isTail = false) {
    const s = this.stat;
    s[kind]++;
    s.score += SCORE[kind];
    if (kind === "miss") {
      this.breakCombo();
    } else {
      s.combo++;
      if (s.combo > s.maxCombo) s.maxCombo = s.combo;
      s.score += Math.min(s.combo, 100);
      this.checkMilestone();
    }
    this.flash(
      isTail ? (HOLD_TEXT[kind] || TEXT[kind]) : TEXT[kind],
      TCOL[kind]
    );
    this.hudDirty = true;
  }

  private checkMilestone() {
    const c = this.stat.combo;
    const reached = c >= 50 && (c === 50 || c === 100 || (c > 100 && c % 100 === 0));
    if (!reached || c <= this.milestone) return;
    this.milestone = c;
    this.milestoneFx = 0.85;
    this.shake = 0.55;
    const tier = c >= 300 ? 3 : c >= 100 ? 2 : 1;
    const hue = tier === 3 ? "#ff6bd6" : tier === 2 ? "#ffd45e" : "#5eff9f";
    if (this.doms.combo) {
      this.doms.combo.dataset.milestone = String(c);
      this.doms.combo.classList.remove("burst");
      void this.doms.combo.offsetWidth;
      this.doms.combo.classList.add("burst");
    }
    this.bigText(c + " COMBO", hue);

    for (let i = 0; i < tier + 1; i++) {
      this.shockwaves.push({ color: hue, life: 1 - i * 0.16 });
    }
    for (let l = 0; l < LANES; l++) this.rings.push({ lane: l, color: hue, life: 1 });

    const n = Math.round((26 + tier * 10) * this.perf.level);
    for (let i = 0; i < n; i++) {
      const a = Math.PI * 2 * Math.random();
      const sp = 9 + Math.random() * 16;
      const R = Math.max(this.cw, this.ch) * (0.55 + Math.random() * 0.5);
      this.streaks.push({
        x: this.cw / 2 + Math.cos(a) * R,
        y: this.ch * HIT_LINE + Math.sin(a) * R,
        vx: -Math.cos(a) * sp,
        vy: -Math.sin(a) * sp,
        w: 1 + Math.random() * 2.4,
        color: hue,
        life: 0.9 + Math.random() * 0.3,
      });
    }

    const y = this.ch * HIT_LINE;
    const nb = Math.round(34 * this.perf.level);
    for (let i = 0; i < nb; i++) {
      const a = (Math.PI * 2 * i) / nb;
      const v = 3.4 + Math.random() * 5;
      this.bursts.push({
        x: this.cw / 2,
        y,
        vx: Math.cos(a) * v * 1.9,
        vy: Math.sin(a) * v - 1.2,
        color: hue,
        life: 1,
      });
    }
    if (this.bursts.length > 130) this.bursts.splice(0, this.bursts.length - 130);
    if (this.streaks.length > 90) this.streaks.splice(0, this.streaks.length - 90);
  }

  private bigText(text: string, color: string) {
    const b = this.doms.big;
    if (!b) return;
    b.textContent = text;
    b.style.color = color;
    b.classList.remove("show");
    void b.offsetWidth;
    b.classList.add("show");
    if (this.bigTimer) clearTimeout(this.bigTimer);
    this.bigTimer = setTimeout(() => b.classList.remove("show"), 1100);
  }

  private breakCombo() {
    this.stat.combo = 0;
    this.milestone = 0;
    this.hudDirty = true;
  }

  private flash(text: string, color: string) {
    const j = this.doms.judge;
    if (!j) return;
    j.textContent = text;
    j.style.color = color;
    j.dataset.kind = text.toLowerCase();
    j.classList.remove("show");
    void j.offsetWidth;
    j.classList.add("show");
    if (this.flashTimer) clearTimeout(this.flashTimer);
    this.flashTimer = setTimeout(() => j.classList.remove("show"), 460);
  }

  private flushHud() {
    if (!this.hudDirty) return;
    this.hudDirty = false;
    if (this.doms.score) this.doms.score.textContent = String(this.stat.score);
    if (this.doms.acc)
      this.doms.acc.textContent = accuracyOf(this.stat).toFixed(2) + "%";
    if (this.stat.combo !== this.lastComboShown) {
      this.lastComboShown = this.stat.combo;
      if (this.doms.combo) {
        this.doms.combo.textContent =
          this.stat.combo > 1 ? String(this.stat.combo) : "";
        if (this.stat.combo > 1) {
          this.doms.combo.classList.remove("pop");
          void this.doms.combo.offsetWidth;
          this.doms.combo.classList.add("pop");
        }
      }
    }
  }

  /* ---------- 结算 / 暂停 ---------- */
  private finish() {
    this.running = false;
    cancelAnimationFrame(this.raf);
    this.stopAudio();
    this.flushHud();
    this.onFinish({ ...this.stat });
  }

  quit() {
    this.running = false;
    cancelAnimationFrame(this.raf);
    this.stopAudio();
    if (this.doms.overlay) this.doms.overlay.hidden = true;
  }

  togglePause() {
    if (this.running) {
      this.running = false;
      cancelAnimationFrame(this.raf);
      this.pauseAudio();
      if (this.doms.overlay) this.doms.overlay.hidden = false;
    } else {
      if (this.doms.overlay) this.doms.overlay.hidden = true;
      const at = this.pausedAt;
      void this.playAudio(at).then(() => {
        if (this.disposed) return;
        this.running = true;
        this.raf = requestAnimationFrame(this.loop);
      });
    }
  }

  /* 触屏: 多点独立跟踪 */
  private laneOf(clientX: number) {
    const c = this.doms.canvas;
    if (!c) return 0;
    const r = c.getBoundingClientRect();
    return Math.max(0, Math.min(LANES - 1, Math.floor(((clientX - r.left) / r.width) * LANES)));
  }
}

const TEXT: Record<string, string> = {
  perfect: "PERFECT",
  great: "GREAT",
  good: "GOOD",
  miss: "MISS",
};
const TCOL: Record<string, string> = {
  perfect: "#ffd45e",
  great: "#5eff9f",
  good: "#4dd0ff",
  miss: "#ff4d6d",
};
const HOLD_TEXT: Record<string, string> = { perfect: "HOLD ✓", miss: "HOLD ✗" };

/* ==================== 应用层 (app.js 移植) ==================== */

function titleFromName(name: string) {
  return (name || "未命名").replace(/\.[^.]+$/, "");
}

/* 从 AudioBuffer 提取单声道并降到 22050Hz 供分析 */
function toMono22050(buf: AudioBuffer) {
  const ch0 = buf.getChannelData(0);
  const ch = buf.numberOfChannels;
  let mono: Float32Array;
  if (ch === 1) {
    mono = Float32Array.from(ch0);
  } else {
    mono = new Float32Array(ch0.length);
    for (let c = 0; c < ch; c++) {
      const d = buf.getChannelData(c);
      for (let i = 0; i < mono.length; i++) mono[i] += d[i];
    }
    for (let i = 0; i < mono.length; i++) mono[i] /= ch;
  }
  return resample(mono, buf.sampleRate, SR);
}

/* 内置 Demo 节拍 (无需上传即可试玩) */
function makeDemo(ctx: AudioContext, title: string, artist: string) {
  const bpm = 124;
  const beat = 60 / bpm;
  const bars = 16;
  const dur = bars * 4 * beat;
  const n = Math.floor(SR * dur);
  const y = new Float32Array(n);
  const add = (t: number, len: number, fn: (tt: number) => number, amp: number) => {
    const i = Math.floor(t * SR);
    const L = Math.floor(len * SR);
    for (let k = 0; k < L; k++) {
      const tt = k / SR;
      const v = fn(tt);
      if (v) y[i + k] += v * amp;
    }
  };
  const kick = (tt: number) =>
    Math.sin(2 * Math.PI * (120 * Math.exp(-tt * 30) + 45) * tt) * Math.exp(-tt * 16);
  const snare = (tt: number) =>
    (Math.random() * 2 - 1) * Math.exp(-tt * 20) +
    Math.sin(2 * Math.PI * 185 * tt) * Math.exp(-tt * 20) * 0.4;
  const hat = (tt: number) => (Math.random() * 2 - 1) * Math.exp(-tt * 55);
  const beats = Math.floor(dur / beat);
  for (let b = 0; b < beats; b++) {
    const t0 = b * beat;
    add(t0, 0.2, b % 2 === 0 ? kick : snare, 0.95);
    add(t0, 0.05, hat, 0.28);
    add(t0 + beat / 2, 0.05, hat, 0.22);
  }
  const buf = ctx.createBuffer(1, n, SR);
  buf.copyToChannel(y, 0);
  return { buffer: buf, mono: y };
}

const DIFF_ORDER: DiffName[] = ["easy", "normal", "hard"];

/* ==================== React 组件 ==================== */
export function RhythmGame() {
  const { t } = useTranslation();
  const [screen, setScreen] = useState<"upload" | "menu" | "play" | "result">("upload");
  const [diff, setDiff] = useState<DiffName>("normal");
  const [stat, setStat] = useState<JudgementStat | null>(null);
  const [beatmap, setBeatmap] = useState<Beatmap | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scoreRef = useRef<HTMLSpanElement>(null);
  const comboRef = useRef<HTMLSpanElement>(null);
  const accRef = useRef<HTMLSpanElement>(null);
  const judgeRef = useRef<HTMLDivElement>(null);
  const bigRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const engineRef = useRef<RhythmEngine | null>(null);
  const audioRef = useRef<{ buffer: AudioBuffer; ctx: AudioContext } | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const workerRef = useRef<Promise<Worker | null> | null>(null);
  const pendingStartRef = useRef<DiffName | null>(null);

  const getAudioCtx = () => {
    if (ctxRef.current) return ctxRef.current;
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    ctxRef.current = new AC();
    return ctxRef.current;
  };

  /* 返回就绪的 worker; 加载失败/超时返回 null, 调用方回退主线程分析。
     ready 握手规避开发期 worker 首编译与 postMessage 的竞态 */
  const getWorker = () => {
    if (workerRef.current) return workerRef.current;
    workerRef.current = new Promise<Worker | null>((resolve) => {
      let w: Worker;
      try {
        const url = new URL("../lib/rhythm/analyzer.worker", import.meta.url);
        w = new Worker(url, { type: "module" });
      } catch {
        resolve(null);
        return;
      }
      const onReady = (e: MessageEvent) => {
        const d = e.data as { type?: string };
        if (d?.type === "ready") {
          w.removeEventListener("message", onReady);
          resolve(w);
        }
      };
      const onError = () => {
        /* 加载失败(如开发期首编译出错): 退回主线程分析 */
        w.removeEventListener("message", onReady);
        w.removeEventListener("error", onError);
        resolve(null);
      };
      w.addEventListener("message", onReady);
      w.addEventListener("error", onError);
      /* 兜底超时: ready 未及时到达也放行, 后续由 analyzeMono 的 error 监听兜底 */
      setTimeout(() => {
        w.removeEventListener("message", onReady);
        resolve(w);
      }, 4000);
    });
    return workerRef.current;
  };

  /* 在 worker 中分析谱面; worker 不可用/运行时出错时回退主线程 */
  const analyzeMono = async (mono: Float32Array, opts: AnalyzeOpts) => {
    const w = await getWorker();
    if (!w) {
      return new Promise<Beatmap>((resolve, reject) => {
        setTimeout(() => {
          try {
            resolve(analyze(mono, SR, opts, setProgress));
          } catch (err) {
            reject(err);
          }
        }, 30);
      });
    }
    return new Promise<Beatmap>((resolve, reject) => {
      const onMsg = (e: MessageEvent) => {
        const d = e.data as { type: string; p?: number; beatmap?: Beatmap; message?: string };
        if (d.type === "progress") setProgress(d.p ?? 0);
        else if (d.type === "done") {
          w.removeEventListener("message", onMsg);
          w.removeEventListener("error", onError);
          resolve(d.beatmap!);
        } else if (d.type === "error") {
          w.removeEventListener("message", onMsg);
          w.removeEventListener("error", onError);
          reject(new Error(d.message || "analysis failed"));
        }
      };
      const onError = () => {
        w.removeEventListener("message", onMsg);
        w.removeEventListener("error", onError);
        setTimeout(() => {
          try {
            resolve(analyze(mono, SR, opts, setProgress));
          } catch (err) {
            reject(err);
          }
        }, 30);
      };
      w.addEventListener("message", onMsg);
      w.addEventListener("error", onError);
      w.postMessage({ mono, sr: SR, opts }, [mono.buffer]);
    });
  };

  const handleFile = async (file: File) => {
    if (!file || busy) return;
    setBusy(true);
    setError("");
    setProgress(0);
    setProgressLabel(t("rhythm.decode"));
    try {
      const arr = await file.arrayBuffer();
      const ctx = getAudioCtx();
      const buf = await ctx.decodeAudioData(arr);
      const mono = toMono22050(buf);
      setProgressLabel(t("rhythm.analyze"));
      const opts: AnalyzeOpts = { title: titleFromName(file.name), artist: "" };
      const bm = await analyzeMono(mono, opts);
      audioRef.current = { buffer: buf, ctx };
      setBeatmap(bm);
      setDiff("normal");
      setStat(null);
      setScreen("menu");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(t("rhythm.error", { msg }));
    } finally {
      setBusy(false);
      setProgressLabel("");
    }
  };

  const handleDemo = async () => {
    if (busy) return;
    setBusy(true);
    setError("");
    setProgress(0);
    setProgressLabel(t("rhythm.analyze"));
    try {
      const ctx = getAudioCtx();
      const { buffer, mono } = makeDemo(ctx, "", "");
      const opts: AnalyzeOpts = { title: t("rhythm.demoTitle"), artist: t("rhythm.demoArtist") };
      const bm = await analyzeMono(mono, opts);
      audioRef.current = { buffer, ctx };
      setBeatmap(bm);
      setDiff("normal");
      setStat(null);
      setScreen("menu");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(t("rhythm.error", { msg }));
    } finally {
      setBusy(false);
      setProgressLabel("");
    }
  };

  /* 谱面就绪后创建引擎 */
  useEffect(() => {
    if (!beatmap || !audioRef.current) return;
    const engine = new RhythmEngine(
      {
        canvas: canvasRef.current,
        score: scoreRef.current,
        combo: comboRef.current,
        acc: accRef.current,
        judge: judgeRef.current,
        big: bigRef.current,
        bar: barRef.current,
        overlay: overlayRef.current,
      },
      beatmap,
      audioRef.current.buffer,
      audioRef.current.ctx,
      (s) => {
        setStat(s);
        setScreen("result");
      }
    );
    engineRef.current = engine;
    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, [beatmap]);

  const startGame = (d: DiffName) => {
    pendingStartRef.current = d;
    setDiff(d);
    setScreen("play");
  };

  /* play 画面挂载完成后再启动游戏(保证 canvas 已布局) */
  useEffect(() => {
    if (screen === "play" && pendingStartRef.current) {
      const d = pendingStartRef.current;
      pendingStartRef.current = null;
      engineRef.current?.begin(d);
    }
  }, [screen]);

  const handleBackToMenu = () => {
    engineRef.current?.quit();
    setScreen("menu");
  };

  const handleChangeSong = () => {
    engineRef.current?.quit();
    setBeatmap(null);
    audioRef.current = null;
    setStat(null);
    setDiff("normal");
    setError("");
    setScreen("upload");
  };

  const acc = stat ? accuracyOf(stat) : 100;
  const rank = stat ? rankOf(stat) : RANKS[RANKS.length - 1];
  const total = stat ? stat.perfect + stat.great + stat.good + stat.miss : 0;
  const fc = !!stat && stat.miss === 0 && total > 0;
  const ap = fc && !!stat && stat.perfect === total;

  const metaText = (() => {
    if (!beatmap) return "";
    const m = Math.floor(beatmap.duration / 60);
    const s = String(Math.round(beatmap.duration % 60)).padStart(2, "0");
    const who = beatmap.artist ? beatmap.artist + " · " : "";
    return `${who}${m}:${s} · ${t("rhythm.onsets", { count: beatmap.onsets })}`;
  })();

  return (
    <div className="rhythm-page">
      <style>{rhythmCss}</style>
      <div className="relative mx-auto flex h-[clamp(440px,calc(100dvh-190px),820px)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm sm:rounded-3xl">
        {/* 上传界面 */}
        <section
          className={`${screen === "upload" ? "flex" : "hidden"} absolute inset-0 flex-col items-center justify-center gap-5 overflow-y-auto p-6 text-center`}
        >
          <div className="mb-1">
            <h1 className="bg-gradient-to-r from-[#ff4d8d] via-[#ffc247] to-[#a77bff] bg-clip-text text-4xl font-bold tracking-tight text-transparent">
              {t("rhythm.brand")}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">{t("rhythm.sub")}</p>
          </div>
          <label
            className={`flex w-full max-w-md cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-border bg-muted/30 px-6 py-10 transition-colors hover:border-primary/50 ${
              dragging ? "border-primary bg-primary/5" : ""
            }`}
            onDragEnter={(e) => { e.preventDefault(); setDragging(true); }}
            onDragOver={(e) => e.preventDefault()}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              const f = e.dataTransfer.files?.[0];
              if (f) void handleFile(f);
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void handleFile(f);
                e.target.value = "";
              }}
            />
            <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <AudioLines className="size-7" />
            </div>
            <div className="font-semibold text-foreground">{t("rhythm.dropMain")}</div>
            <div className="max-w-xs text-xs leading-relaxed text-muted-foreground">{t("rhythm.dropHint")}</div>
          </label>
          {busy && (
            <div className="w-full max-w-md">
              <div className="mb-1.5 text-sm text-muted-foreground">{progressLabel}</div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-150"
                  style={{ width: `${Math.round(progress * 100)}%` }}
                />
              </div>
            </div>
          )}
          {error && <p className="max-w-md break-all text-sm text-destructive">{error}</p>}
          <Button variant="outline" onClick={() => void handleDemo()} disabled={busy}>
            <Music className="size-4" />
            {t("rhythm.demo")}
          </Button>
          <p className="text-xs text-muted-foreground">{t("rhythm.tip")}</p>
        </section>

        {/* 选难度界面 */}
        <section
          className={`${screen === "menu" ? "flex" : "hidden"} absolute inset-0 flex-col items-center justify-center gap-5 overflow-y-auto p-6 text-center`}
        >
          <Button variant="ghost" size="sm" className="absolute left-3 top-3" onClick={handleChangeSong}>
            <RotateCcw className="size-3.5" />
            {t("rhythm.resong")}
          </Button>
          <h1 className="max-w-full break-all text-xl font-bold tracking-tight text-foreground">{beatmap?.title}</h1>
          <p className="text-sm text-muted-foreground">{metaText}</p>
          <div className="flex w-full max-w-sm flex-col gap-3" role="radiogroup" aria-label={t("rhythm.diffLabel")}>
            {DIFF_ORDER.map((d) => (
              <button
                key={d}
                role="radio"
                aria-checked={diff === d}
                onClick={() => setDiff(d)}
                className={`grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-0.5 rounded-xl border px-4 py-3 text-left transition-colors cursor-pointer ${
                  diff === d
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                    : "border-border bg-card hover:border-primary/40"
                }`}
              >
                <span className="text-base font-semibold text-foreground">{t(`rhythm.diff.${d}`)}</span>
                <span className="row-span-2 self-center font-mono text-xl font-bold text-primary">
                  {beatmap?.charts[d].count}
                </span>
                <span className="text-xs text-muted-foreground">{t(`rhythm.diff.${d}Hint`)}</span>
              </button>
            ))}
          </div>
          <Button size="lg" className="w-full max-w-sm" onClick={() => startGame(diff)}>
            <Play className="size-4" />
            {t("rhythm.start")}
          </Button>
          <details className="w-full max-w-sm text-left">
            <summary className="cursor-pointer select-none text-sm text-muted-foreground [&::-webkit-details-marker]:hidden">
              {t("rhythm.ranks")}
            </summary>
            <table className="mt-2 w-full border-collapse text-sm">
              <tbody>
                {RANKS.map((r) => (
                  <tr key={r.key} className="border-t border-border">
                    <th className="w-14 py-1.5 pr-3 text-left font-mono text-[13px]" style={{ color: r.color }}>{r.key}</th>
                    <td className="py-1.5 text-muted-foreground">{t(`rhythm.rank.${r.key.toLowerCase()}`)}</td>
                  </tr>
                ))}
                <tr className="border-t border-border">
                  <th className="w-14 py-1.5 pr-3 text-left font-mono text-[13px]" style={{ color: "#5eff9f" }}>FC</th>
                  <td className="py-1.5 text-muted-foreground">{t("rhythm.fc")}</td>
                </tr>
                <tr className="border-t border-border">
                  <th className="w-14 py-1.5 pr-3 text-left font-mono text-[13px]" style={{ color: "#ff6bd6" }}>AP</th>
                  <td className="py-1.5 text-muted-foreground">{t("rhythm.ap")}</td>
                </tr>
              </tbody>
            </table>
          </details>
          <p className="text-xs text-muted-foreground">{t("rhythm.tip")}</p>
        </section>

        {/* 游戏界面 */}
        <section
          className={`${screen === "play" ? "flex" : "hidden"} absolute inset-0 flex-col bg-[#0a0e1c]`}
        >
          <div className="flex w-full shrink-0 items-center justify-between gap-2 px-4 py-3">
            <div className="flex min-w-[72px] flex-col">
              <span className="r-score font-mono text-xl font-semibold leading-none text-[#f0f2ff]" ref={scoreRef}>0</span>
              <span className="mt-1 text-[9px] font-medium tracking-[0.16em] text-[#7c88ab]">SCORE</span>
            </div>
            <div className="flex-1 text-center">
              <span className="r-combo font-mono text-3xl font-bold leading-none text-[#ffd45e]" ref={comboRef} />
            </div>
            <div className="flex items-center gap-2.5">
              <div className="flex min-w-[72px] flex-col items-end">
                <span className="r-acc font-mono text-xl font-semibold leading-none text-[#f0f2ff]" ref={accRef}>100.00%</span>
                <span className="mt-1 text-[9px] font-medium tracking-[0.16em] text-[#7c88ab]">ACC</span>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                className="shrink-0 rounded-full border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                aria-label={t("rhythm.pause")}
                onClick={() => engineRef.current?.togglePause()}
              >
                <Pause className="size-3.5" />
              </Button>
            </div>
          </div>
          <div className="h-0.5 w-full shrink-0 bg-white/10">
            <i className="r-progress-bar bg-[#ffd45e]" ref={barRef} />
          </div>
          <canvas className="r-stage block min-h-0 w-full flex-1 touch-none" ref={canvasRef} aria-label={t("rhythm.stage")} />
          <div className="r-judge" ref={judgeRef} />
          <div className="r-big" ref={bigRef} />
        </section>

        {/* 结算界面 */}
        <section
          className={`${screen === "result" ? "flex" : "hidden"} absolute inset-0 flex-col items-center justify-center gap-4 overflow-y-auto p-6 text-center`}
        >
          <div
            className="r-rank font-mono text-7xl font-bold leading-none"
            data-rank={rank.key}
            style={{ color: rank.color, textShadow: `0 0 34px ${rank.color}59` }}
          >
            {rank.key}
          </div>
          {ap ? (
            <div className="rounded-full border border-[#ff6bd6] px-3.5 py-1 font-mono text-xs font-bold tracking-[0.14em] text-[#ff6bd6]">
              {t("rhythm.apBadge")}
            </div>
          ) : fc ? (
            <div className="rounded-full border border-[#5eff9f] px-3.5 py-1 font-mono text-xs font-bold tracking-[0.14em] text-[#5eff9f]">
              {t("rhythm.fcBadge")}
            </div>
          ) : null}
          <div className="max-w-full break-all text-lg font-semibold text-foreground">
            {t("rhythm.resultTitle", { title: beatmap?.title ?? "", diff: t(`rhythm.diff.${diff}`) })}
          </div>
          <div className="font-mono text-3xl font-bold text-foreground">{stat?.score ?? 0}</div>
          <table className="w-full max-w-sm overflow-hidden rounded-xl border border-border text-sm">
            <tbody>
              {[
                { k: t("rhythm.perfect"), v: stat?.perfect ?? 0 },
                { k: t("rhythm.great"), v: stat?.great ?? 0 },
                { k: t("rhythm.good"), v: stat?.good ?? 0 },
                { k: t("rhythm.miss"), v: stat?.miss ?? 0 },
                { k: t("rhythm.maxCombo"), v: stat?.maxCombo ?? 0 },
                { k: t("rhythm.accuracy"), v: acc.toFixed(2) + "%" },
              ].map((row, i) => (
                <tr key={i} className={i > 0 ? "border-t border-border" : ""}>
                  <th className="px-4 py-2 text-left font-normal tracking-wide text-muted-foreground">{row.k}</th>
                  <td className="px-4 py-2 text-right font-mono font-semibold text-foreground">{row.v}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex flex-wrap justify-center gap-3 pt-1">
            <Button onClick={() => startGame(diff)}>
              <RotateCcw className="size-4" />
              {t("rhythm.retry")}
            </Button>
            <Button variant="outline" onClick={handleBackToMenu}>
              {t("rhythm.back")}
            </Button>
          </div>
        </section>

        {/* 暂停遮罩 */}
        <div className="r-overlay absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-black/90 backdrop-blur-sm" ref={overlayRef} hidden>
          <p className="text-xl font-semibold text-white">{t("rhythm.paused")}</p>
          <Button size="lg" className="min-w-36" onClick={() => engineRef.current?.togglePause()}>{t("rhythm.resume")}</Button>
          <Button size="lg" variant="outline" className="min-w-36 border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white" onClick={handleBackToMenu}>{t("rhythm.quit")}</Button>
        </div>
      </div>
    </div>
  );
}