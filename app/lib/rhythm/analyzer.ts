/* 节奏锻造师 · 核心分析模块 (TypeScript 移植)
   原实现为 template/web/core.js: 由 Web Audio 完成解码,
   STFT / spectral flux 起音检测 / 轨道分配 / 双拇指可玩性求解
   / 长条去重 / 能量包络 全部用纯 JS 实现。
   可在主线程或 Web Worker 中运行。 */

export const SR = 22050; // 分析采样率
export const NFFT = 1024;
export const HOP = 512;
export const NHALF = NFFT / 2 + 1;
export const ENV_FPS = 20;

/* ---------- 谱面类型 ---------- */
export interface ChartNote {
  t: number;
  lane: number;
  d?: number;
}
export interface Chart {
  speed: number;
  count: number;
  notes: ChartNote[];
}
export type DiffName = "easy" | "normal" | "hard";
export interface Beatmap {
  title: string;
  artist: string;
  duration: number;
  lanes: number;
  onsets: number;
  envFps: number;
  env: number[];
  charts: Record<DiffName, Chart>;
}
interface DiffCfg {
  gap: number;
  keep: number;
  chord: number;
  hold: number;
  speed: number;
  extra?: number;
}

/* ---------- 工具: 可种子化随机数 (mulberry32) ---------- */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ---------- 工具: 汉宁窗 ---------- */
const HANN = (function () {
  const w = new Float64Array(NFFT);
  for (let i = 0; i < NFFT; i++) w[i] = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (NFFT - 1));
  return w;
})();

/* ---------- 迭代式 radix-2 FFT (原地) ---------- */
function fft(re: Float64Array, im: Float64Array) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      let t = re[i];
      re[i] = re[j];
      re[j] = t;
      t = im[i];
      im[i] = im[j];
      im[j] = t;
    }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = (-2 * Math.PI) / len;
    const wr = Math.cos(ang);
    const wi = Math.sin(ang);
    const half = len >> 1;
    for (let i = 0; i < n; i += len) {
      let cwr = 1;
      let cwi = 0;
      for (let k = 0; k < half; k++) {
        const ur = re[i + k];
        const ui = im[i + k];
        const vr = re[i + k + half] * cwr - im[i + k + half] * cwi;
        const vi = re[i + k + half] * cwi + im[i + k + half] * cwr;
        re[i + k] = ur + vr;
        im[i + k] = ui + vi;
        re[i + k + half] = ur - vr;
        im[i + k + half] = ui - vi;
        const ncwr = cwr * wr - cwi * wi;
        cwi = cwr * wi + cwi * wr;
        cwr = ncwr;
      }
    }
  }
}

/* ---------- spectral flux 起音检测 ---------- */
function spectralFlux(y: Float32Array, onProgress?: (p: number) => void) {
  const nFrames = 1 + Math.floor((y.length - NFFT) / HOP);
  if (nFrames < 4) throw new Error("音频太短，至少需要约 1 秒");
  const times = new Float64Array(nFrames);
  for (let i = 0; i < nFrames; i++) times[i] = (i * HOP) / SR;
  const flux = new Float64Array(nFrames);

  const re = new Float64Array(NFFT);
  const im = new Float64Array(NFFT);
  const CH = 512;
  let prevTail: Float64Array | null = null;

  for (let i = 0; i < nFrames; i += CH) {
    const j = Math.min(i + CH, nFrames);
    const m = j - i;
    const ls = new Float64Array(m * NHALF);
    for (let f = 0; f < m; f++) {
      const start = (i + f) * HOP;
      for (let k = 0; k < NFFT; k++) {
        re[k] = y[start + k] * HANN[k];
        im[k] = 0;
      }
      fft(re, im);
      const base = f * NHALF;
      for (let k = 0; k < NHALF; k++) {
        const mag = Math.sqrt(re[k] * re[k] + im[k] * im[k]);
        ls[base + k] = Math.log1p(mag * 8.0);
      }
    }
    for (let f = 0; f < m; f++) {
      const idx = i + f;
      if (idx === 0) {
        flux[0] = 0;
        continue;
      }
      const base = f * NHALF;
      const prow =
        f === 0 && prevTail
          ? prevTail
          : ls.subarray((f - 1) * NHALF, (f - 1) * NHALF + NHALF);
      let s = 0;
      for (let k = 0; k < NHALF; k++) {
        const d = ls[base + k] - prow[k];
        if (d > 0) s += d;
      }
      flux[idx] = s;
    }
    prevTail = ls.subarray((m - 1) * NHALF, m * NHALF);
    if (onProgress) onProgress(i / nFrames);
  }
  return { flux, times };
}

/* ---------- 自适应阈值峰值提取 ---------- */
function pickOnsets(flux: Float64Array, times: Float64Array) {
  const w = 17;
  const n = flux.length;
  const baseline = new Float64Array(n);
  const half = (w - 1) >> 1;
  for (let i = 0; i < n; i++) {
    const lo = Math.max(0, i - half);
    const hi = Math.min(n - 1, i + half);
    let s = 0;
    let c = 0;
    for (let j = lo; j <= hi; j++) {
      s += flux[j];
      c++;
    }
    baseline[i] = s / c;
  }
  let fmax = 0;
  for (let i = 0; i < n; i++) if (flux[i] > fmax) fmax = flux[i];
  const delta = 0.08 * fmax;
  const peaks: [number, number][] = [];
  for (let i = 1; i < n - 1; i++) {
    const v = flux[i];
    if (v < baseline[i] + delta) continue;
    if (v >= flux[i - 1] && v > flux[i + 1]) peaks.push([times[i], v]);
  }
  return peaks;
}

/* ---------- 低频占比 (kick 放内侧轨道) ---------- */
function bandEnergy(y: Float32Array, t: number) {
  const c = Math.floor(t * SR);
  const N = NFFT;
  if (c < N / 2 || c > y.length - N / 2) return 0.5;
  const re = new Float64Array(N);
  const im = new Float64Array(N);
  const seg = new Float64Array(N);
  for (let k = -N / 2; k < N / 2; k++) seg[k + N / 2] = y[c + k];
  for (let k = 0; k < N; k++) {
    re[k] = seg[k] * HANN[k];
    im[k] = 0;
  }
  fft(re, im);
  const half = N / 2 + 1;
  const spec = new Float64Array(half);
  let total = 0;
  for (let k = 0; k < half; k++) {
    spec[k] = Math.sqrt(re[k] * re[k] + im[k] * im[k]);
    total += spec[k];
  }
  total += 1e-9;
  const loN = Math.max(1, Math.floor(half / 8));
  let low = 0;
  for (let k = 0; k < loN; k++) low += spec[k];
  return low / total;
}

/* ---------- 难度参数 ---------- */
const DIFFS: Record<DiffName, DiffCfg> = {
  easy: { gap: 0.2, keep: 0.72, chord: 0.1, hold: 0.34, speed: 1.1 },
  normal: { gap: 0.11, keep: 1.0, chord: 0.22, hold: 0.42, speed: 1.45 },
  hard: { gap: 0.085, keep: 1.0, chord: 0.44, hold: 0.46, speed: 1.75, extra: 0.3 },
};
const LANES = 4;
const HAND: Record<number, number> = { 0: 0, 1: 0, 2: 1, 3: 1 };

function assignLanes(cand: number[][], lows: number[], rng: () => number) {
  const med = (function () {
    const s = lows.slice().sort((a, b) => a - b);
    return s[Math.floor(s.length / 2)];
  })();
  const used = [0, 0, 0, 0];
  const lanes: number[] = [];
  let last = -1;
  for (let i = 0; i < cand.length; i++) {
    const inner = lows[i] > med;
    const pref = inner ? [1, 2] : [0, 3];
    const alt = inner ? [0, 3] : [1, 2];
    let pool = pref.filter((l) => l !== last);
    if (!pool.length) pool = pref;
    if (used[pref[0]] + used[pref[1]] > (used[alt[0]] + used[alt[1]]) * 1.6 + 4) {
      const altPool = alt.filter((l) => l !== last);
      pool = altPool.length ? altPool : alt;
    }
    let min = Infinity;
    for (const l of pool) if (used[l] < min) min = used[l];
    const best = pool.filter((l) => used[l] === min);
    const lane = best[Math.floor(rng() * best.length)];
    used[lane]++;
    lanes.push(lane);
    last = lane;
  }
  return lanes;
}

interface PlayableNote extends ChartNote {
  lane: number;
}

/* 双拇指可玩性求解: 消除物理上打不出的组合 */
function playable(notes: PlayableNote[], rng: () => number) {
  notes = notes.slice().sort((a, b) => a.t - b.t || a.lane - b.lane);
  const holds = notes.filter((n) => n.d);
  const out: PlayableNote[] = [];
  let dropped = 0;
  let moved = 0;
  const HOLD_LEAD = 0.14;
  const HOLD_TAIL = 0.18;
  for (const n of notes) {
    if (n.d) {
      out.push(n);
      continue;
    }
    const t = n.t;
    const lane = n.lane;
    const blocked = new Set<number>();
    let sameLaneHold = false;
    for (const h of holds) {
      if (h === n) continue;
      if (h.t - HOLD_LEAD <= t && t <= h.t + (h.d || 0) + HOLD_TAIL) {
        blocked.add(HAND[h.lane]);
        if (h.lane === lane) sameLaneHold = true;
      }
    }
    if (!blocked.has(HAND[lane]) && !sameLaneHold) {
      out.push(n);
      continue;
    }
    const free: number[] = [];
    for (let l = 0; l < LANES; l++) if (!blocked.has(HAND[l])) free.push(l);
    const busy = new Set(out.filter((m) => Math.abs(m.t - t) < 0.005).map((m) => m.lane));
    const freeOk = free.filter((l) => !busy.has(l));
    if (freeOk.length) {
      n.lane = freeOk[Math.floor(rng() * freeOk.length)];
      out.push(n);
      moved++;
    } else dropped++;
  }
  out.sort((a, b) => a.t - b.t || a.lane - b.lane);
  return { notes: out, moved, dropped };
}

/* 困难档加料: 在过宽空隙插入切分音 */
function densify(kept: number[][], cfg: DiffCfg, rng: () => number) {
  const extra = cfg.extra || 0;
  if (extra <= 0 || kept.length < 2) return kept;
  const gap = cfg.gap;
  const target = Math.floor(kept.length * extra);
  const slots: [number, number][] = [];
  for (let i = 0; i < kept.length - 1; i++) {
    const span = kept[i + 1][0] - kept[i][0];
    if (span >= gap * 2.2) slots.push([span, i]);
  }
  slots.sort((a, b) => b[0] - a[0]);
  const added: number[][] = [];
  for (const [span, i] of slots.slice(0, target)) {
    const t0 = kept[i][0];
    const s0 = kept[i][1];
    const t1 = kept[i + 1][0];
    const s1 = kept[i + 1][1];
    const mid = (t0 + t1) / 2 + (rng() - 0.5) * gap * 0.18;
    if (mid - t0 < gap || t1 - mid < gap) continue;
    added.push([mid, ((s0 + s1) / 2) * 0.85]);
  }
  return added.concat(kept).sort((a, b) => a[0] - b[0]);
}

const HOLD_GAP_LANE = 1.2;
const HOLD_GAP_HAND = 0.55;
function dedupeHolds(notes: ChartNote[]) {
  notes = notes.slice().sort((a, b) => a.t - b.t || a.lane - b.lane);
  const active: number[][] = [];
  const lastLaneEnd: Record<number, number> = {};
  const lastHandEnd: Record<number, number> = {};
  for (const n of notes) {
    if (!n.d) continue;
    const t = n.t;
    const lane = n.lane;
    const hand = HAND[lane];
    for (let i = active.length - 1; i >= 0; i--) if (active[i][0] <= t) active.splice(i, 1);
    const tooSoon =
      active.some((a) => a[1] === hand) ||
      t - (lastLaneEnd[lane] ?? -99) < HOLD_GAP_LANE ||
      t - (lastHandEnd[hand] ?? -99) < HOLD_GAP_HAND;
    if (tooSoon) {
      delete n.d;
      continue;
    }
    const end = t + n.d;
    active.push([end, hand]);
    lastLaneEnd[lane] = end;
    lastHandEnd[hand] = end;
  }
  return notes;
}

function build(peaks: [number, number][], y: Float32Array, cfg: DiffCfg, seed: number) {
  const rng = mulberry32(seed);
  if (!peaks.length) return [];
  const strengths = peaks.map((p) => p[1]);
  const sorted = strengths.slice().sort((a, b) => b - a);
  const nKeep = Math.max(1, Math.floor(peaks.length * cfg.keep));
  const thresh = sorted[nKeep - 1];
  const cand = peaks.filter((p) => p[1] >= thresh);
  const kept: number[][] = [];
  let lastT = -99;
  for (const [t, s] of cand) {
    if (t - lastT < cfg.gap) continue;
    kept.push([t, s]);
    lastT = t;
  }
  const kept2 = densify(kept, cfg, rng);
  const lows = kept2.map(([t]) => bandEnergy(y, t));
  const lanes = assignLanes(kept2, lows, rng);
  const smax = Math.max(...strengths);
  const notes: ChartNote[] = [];
  for (let i = 0; i < kept2.length; i++) {
    const [t, s] = kept2[i];
    const lane = lanes[i];
    const norm = s / smax;
    const note: ChartNote = { t: Math.round(t * 1000) / 1000, lane };
    if (norm > 0.45 && rng() < cfg.hold) {
      note.d = Math.round(Math.min(1.4, Math.max(0.4, cfg.gap * 5)) * 1000) / 1000;
    }
    notes.push(note);
    if (norm > 0.7 && rng() < cfg.chord) {
      const others = [0, 1, 2, 3].filter((l) => HAND[l] !== HAND[lane]);
      notes.push({ t: Math.round(t * 1000) / 1000, lane: others[Math.floor(rng() * others.length)] });
    }
  }
  const deduped = dedupeHolds(notes);
  const res = playable(deduped as PlayableNote[], rng);
  return res.notes;
}

function envelope(y: Float32Array) {
  const step = Math.floor(SR / ENV_FPS);
  const n = Math.max(1, Math.floor(y.length / step));
  const out = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const a = i * step;
    const b = Math.min(y.length, (i + 1) * step);
    let s = 0;
    for (let k = a; k < b; k++) s += y[k] * y[k];
    out[i] = Math.sqrt(s / Math.max(1, b - a));
  }
  let peak = 0;
  for (let i = 0; i < n; i++) if (out[i] > peak) peak = out[i];
  if (peak <= 0) return new Array(n).fill(0);
  return Array.from(out, (v) => Math.round(Math.pow(v / peak, 0.65) * 100));
}

export interface AnalyzeOpts {
  title?: string;
  artist?: string;
  diff?: Partial<Record<DiffName, Partial<DiffCfg>>>;
}

/* ---------- 总入口 ---------- */
export function analyze(
  mono: Float32Array,
  sr: number,
  opts: AnalyzeOpts = {},
  onProgress?: (p: number) => void
): Beatmap {
  const y = sr === SR ? mono : resample(mono, sr, SR);
  const dur = y.length / SR;
  const { flux, times } = spectralFlux(y, (p) => onProgress && onProgress(p * 0.7));
  const peaks = pickOnsets(flux, times);
  const charts = {} as Record<DiffName, Chart>;
  const order: DiffName[] = ["easy", "normal", "hard"];
  order.forEach((name, di) => {
    const cfg = Object.assign({}, DIFFS[name], opts.diff && opts.diff[name]);
    const notes = build(peaks, y, cfg, 7);
    charts[name] = {
      speed: cfg.speed,
      count: notes.length,
      notes: notes.map((n) => (n.d ? { t: n.t, lane: n.lane, d: n.d } : { t: n.t, lane: n.lane })),
    };
    onProgress && onProgress(0.7 + ((di + 1) / order.length) * 0.3);
  });
  return {
    title: opts.title || "未命名",
    artist: opts.artist || "",
    duration: Math.round(dur * 100) / 100,
    lanes: LANES,
    onsets: peaks.length,
    envFps: ENV_FPS,
    env: envelope(y),
    charts,
  };
}

/* 通用线性重采样(把任意采样率转成 SR) */
export function resample(y: Float32Array, fromSr: number, toSr: number) {
  const ratio = fromSr / toSr;
  const outLen = Math.max(1, Math.floor(y.length / ratio));
  const out = new Float32Array(outLen);
  for (let i = 0; i < outLen; i++) {
    const src = i * ratio;
    const i0 = Math.floor(src);
    const frac = src - i0;
    const i1 = Math.min(i0 + 1, y.length - 1);
    out[i] = y[i0] * (1 - frac) + y[i1] * frac;
  }
  return out;
}
