import { useState, useRef, useEffect, useCallback, Suspense, lazy } from "react";
import { useTranslation } from "react-i18next";
import { encodeArt, decodeArt, SHARE_QUERY, type CutRegion } from "./codec";

const ShareModal = lazy(() =>
  import("~/components/share/ShareModal").then((m) => ({ default: m.ShareModal }))
);

// Types
interface Project {
  id: string;
  ts: number;
  date: string;
  folds: number;
  cuts: CutRegion[];
  thumb: string;
}

interface PaperState {
  folds: number;
  cuts: CutRegion[];
  projectId: string;
  draftSaved: boolean;
}

// Constants
const KEY = {
  gal: "jz.gallery.v3",
  draft: "jz.draft.v3",
  hint: "jz.hint.v3",
  demo: "jz.demo.v1",
};

// Utility functions
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const clone = <T,>(o: T): T => JSON.parse(JSON.stringify(o));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const fmtDate = (d: Date) =>
  `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;

// Geometry helpers
const circlePts = (u: number, v: number, r: number, n = 18) => {
  const o = [];
  for (let i = 0; i < n; i++) {
    const t = (2 * Math.PI * i) / n;
    o.push({ u: u + r * Math.cos(t), v: v + r * Math.sin(t) });
  }
  return o;
};

const capsulePts = (a: { u: number; v: number }, b: { u: number; v: number }, r: number, steps = 9) => {
  const dx = b.u - a.u;
  const dv = b.v - a.v;
  if (Math.hypot(dx, dv) < 1e-4) return circlePts(a.u, a.v, r);
  const al = Math.atan2(dv, dx);
  const o: Array<{ u: number; v: number }> = [];
  for (let i = 0; i <= steps; i++) {
    const t = al + Math.PI / 2 + (Math.PI * i) / steps;
    o.push({ u: a.u + r * Math.cos(t), v: a.v + r * Math.sin(t) });
  }
  for (let i = 0; i <= steps; i++) {
    const t = al - Math.PI / 2 + (Math.PI * i) / steps;
    o.push({ u: b.u + r * Math.cos(t), v: b.v + r * Math.sin(t) });
  }
  return o;
};

const cap = (arr: number[][], r: number) =>
  capsulePts({ u: arr[0][0], v: arr[0][1] }, { u: arr[1][0], v: arr[1][1] }, r);
const dot = (arr: [number, number], r: number) => circlePts(arr[0], arr[1], r);

// Patterns
const PATTERNS = {
  six: {
    folds: 6,
    cuts: [
      { pts: cap([[-0.06, 1.03], [0.06, 1.03]], 0.042) },
      { pts: cap([[0.185, 0.882], [0.281, 0.856]], 0.038) },
      { pts: cap([[0, 0.6], [0, 0.705]], 0.046) },
      { pts: cap([[0.1, 0.615], [0.175, 0.7]], 0.036) },
      { pts: cap([[0, 0.28], [0, 0.462]], 0.056) },
      { pts: cap([[0, 0.085], [0, 0.15]], 0.03) },
      { pts: cap([[0.16, 0.3], [0.23, 0.405]], 0.024) },
      { pts: dot([0.125, 0.845], 0.026) },
    ],
  },
  four: {
    folds: 4,
    cuts: [
      { pts: cap([[-0.09, 1.03], [0.09, 1.03]], 0.05) },
      { pts: cap([[0.289, 0.854], [0.399, 0.808]], 0.045) },
      { pts: cap([[0, 0.3], [0, 0.5]], 0.064) },
      { pts: cap([[0.18, 0.55], [0.285, 0.665]], 0.046) },
      { pts: cap([[0.3, 0.34], [0.385, 0.44]], 0.034) },
      { pts: cap([[0, 0.1], [0, 0.175]], 0.036) },
      { pts: dot([0.22, 0.8], 0.028) },
    ],
  },
  eight: {
    folds: 8,
    cuts: [
      { pts: cap([[-0.05, 1.03], [0.05, 1.03]], 0.04) },
      { pts: cap([[0.131, 0.891], [0.219, 0.873]], 0.035) },
      { pts: cap([[0, 0.615], [0, 0.72]], 0.042) },
      { pts: cap([[0.07, 0.6], [0.125, 0.685]], 0.034) },
      { pts: cap([[0, 0.295], [0, 0.465]], 0.05) },
      { pts: cap([[0, 0.085], [0, 0.15]], 0.028) },
      { pts: cap([[0.1, 0.34], [0.165, 0.44]], 0.022) },
      { pts: dot([0.09, 0.83], 0.022) },
    ],
  },
  classic: {
    folds: 6,
    cuts: [
      { pts: cap([[0, 0.33], [0, 0.45]], 0.048) },
      { pts: cap([[0, 0.185], [0, 0.25]], 0.032) },
      { pts: dot([0.155, 0.83], 0.03) },
      { pts: cap([[0, 0.63], [0, 0.75]], 0.05) },
      { pts: cap([[0.1, 0.56], [0.165, 0.66]], 0.038) },
      { pts: cap([[0.145, 0.745], [0.243, 0.718]], 0.026) },
      { pts: cap([[0.073, 0.463], [0.169, 0.437]], 0.024) },
      { pts: cap([[-0.055, 1.02], [0.055, 1.02]], 0.05) },
    ],
  },
};

// Paper engine functions
export function makePaper(folds: number, cuts: CutRegion[], R: number, dpr: number) {
  const th = Math.PI / folds;
  const w = 2 * R * Math.sin(th / 2) + 8;
  const h = R + 8;
  const c = document.createElement("canvas");
  c.width = Math.max(2, Math.round(w * dpr));
  c.height = Math.max(2, Math.round(h * dpr));
  const P = { c, ctx: c.getContext("2d")!, folds, th, R, dpr, ax: w / 2, ay: h - 4, w, h };
  paintPaper(P, cuts);
  return P;
}

function wedgePath(x: CanvasRenderingContext2D, ax: number, ay: number, R: number, th: number) {
  x.beginPath();
  x.moveTo(ax, ay);
  x.arc(ax, ay, R, -Math.PI / 2 - th / 2, -Math.PI / 2 + th / 2);
  x.closePath();
}

function regionPath(x: CanvasRenderingContext2D, pts: Array<{ u: number; v: number }>, R: number) {
  const P = pts.map((p) => [p.u * R, -p.v * R]);
  const n = P.length;
  x.beginPath();
  if (n < 3) {
    x.arc(P[0][0], P[0][1], Math.max(2, R * 0.004), 0, 6.2832);
    return;
  }
  x.moveTo((P[0][0] + P[n - 1][0]) / 2, (P[0][1] + P[n - 1][1]) / 2);
  for (let i = 0; i < n; i++) {
    const c = P[i];
    const nx = P[(i + 1) % n];
    x.quadraticCurveTo(c[0], c[1], (c[0] + nx[0]) / 2, (c[1] + nx[1]) / 2);
  }
  x.closePath();
}

function paintPaper(
  P: { ctx: CanvasRenderingContext2D; R: number; th: number; dpr: number; ax: number; ay: number; w: number; h: number },
  cuts: CutRegion[]
) {
  const { ctx: x, R, th, dpr, ax, ay, w, h } = P;
  x.setTransform(dpr, 0, 0, dpr, 0, 0);
  x.globalCompositeOperation = "source-over";
  x.clearRect(0, 0, w, h);
  const g = x.createRadialGradient(ax, ay, R * 0.04, ax, ay, R);
  g.addColorStop(0, "#c9303a");
  g.addColorStop(0.72, "#b31f2b");
  g.addColorStop(1, "#9f1a25");
  wedgePath(x, ax, ay, R, th);
  x.fillStyle = g;
  x.fill();
  x.globalCompositeOperation = "destination-out";
  x.translate(ax, ay);
  x.fillStyle = "#000";
  for (const c of cuts) {
    regionPath(x, c.pts, R);
    x.fill();
  }
}

export function drawFlower(
  ctx: CanvasRenderingContext2D,
  size: number,
  P: { c: HTMLCanvasElement; folds: number; th: number; R: number; ax: number; ay: number; w: number; h: number },
  progress = 1,
  rot = 0,
  scale = 1
) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, size, size);
  const c = size / 2;
  const s = ((size * 0.485) / P.R) * scale;
  const slots = 2 * P.folds;
  const step = P.th;
  const n = clamp(progress, 0, 1) * slots;
  const full = Math.floor(n + 1e-6);
  ctx.save();
  ctx.translate(c, c);
  ctx.rotate(rot);
  for (let k = 0; k < Math.min(full + 1, slots); k++) {
    const frac = k < full ? 1 : n - k;
    if (frac <= 0) break;
    ctx.save();
    ctx.globalAlpha = clamp(frac, 0, 1);
    ctx.rotate(k * step);
    if (k % 2 === 1) ctx.scale(-1, 1);
    ctx.scale(s, s);
    ctx.drawImage(P.c, -P.ax, -P.ay, P.w, P.h);
    ctx.drawImage(P.c, -P.ax, -P.ay, P.w, P.h);
    ctx.drawImage(P.c, -P.ax, -P.ay, P.w, P.h);
    ctx.restore();
  }
  ctx.restore();
}

// Storage functions
function loadGal(): Project[] {
  try {
    return JSON.parse(localStorage.getItem(KEY.gal) || "[]");
  } catch {
    return [];
  }
}

function saveGal(g: Project[]) {
  try {
    localStorage.setItem(KEY.gal, JSON.stringify(g));
  } catch {}
}

function makeThumb(folds: number, cuts: CutRegion[]) {
  const P = makePaper(folds, cuts, 170, 2);
  const c = document.createElement("canvas");
  c.width = c.height = 220;
  drawFlower(c.getContext("2d")!, 220, P, 1, 0, 1);
  return c.toDataURL("image/png");
}

// Main component
export function PaperCutApp() {
  const { t } = useTranslation();

  // State
  const [state, setState] = useState<PaperState>({
    folds: 6,
    cuts: [],
    projectId: uid(),
    draftSaved: false,
  });
  const [page, setPage] = useState<"home" | "cut">("home");
  const [showResult, setShowResult] = useState(false);
  const [showCulture, setShowCulture] = useState(false);
  const [resultViewing, setResultViewing] = useState<{
    cuts: CutRegion[];
    folds: number;
    id: string;
    current: boolean;
    demo?: boolean;
    entry?: Project;
  } | null>(null);
  const [undoStack, setUndoStack] = useState<Array<{ t: string; c?: CutRegion; prev?: CutRegion[] }>>([]);
  const [redoStack, setRedoStack] = useState<Array<{ t: string; c?: CutRegion; prev?: CutRegion[] }>>([]);
  const [toastMsg, setToastMsg] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  // Refs
  const stageRef = useRef<HTMLDivElement>(null);
  const cutCanvasRef = useRef<HTMLCanvasElement>(null);
  const resultCanvasRef = useRef<HTMLCanvasElement>(null);
  const cutPRef = useRef<ReturnType<typeof makePaper> | null>(null);
  const curRef = useRef<CutRegion | null>(null);
  const drawPtrRef = useRef<number | null>(null);
  const rafIdRef = useRef<number>(0);
  const cutsRef = useRef<CutRegion[]>([]);

  // Canvas state
  const GRef = useRef({ W: 0, H: 0, dpr: 1, cx: 0, apexY: 0, R: 0, th: Math.PI / 6 });

  // Load draft on mount
  useEffect(() => {
    try {
      const d = JSON.parse(localStorage.getItem(KEY.draft) || "null");
      if (d && Array.isArray(d.cuts) && d.cuts.length) {
        setState({
          folds: d.folds || 6,
          cuts: d.cuts,
          projectId: d.projectId || uid(),
          draftSaved: !!d.draftSaved,
        });
      }
    } catch {}
  }, []);

  // Save draft
  const saveDraft = useCallback(() => {
    try {
      localStorage.setItem(
        KEY.draft,
        JSON.stringify({
          folds: state.folds,
          cuts: state.cuts,
          projectId: state.projectId,
          draftSaved: state.draftSaved,
        })
      );
    } catch {}
  }, [state]);

  useEffect(() => {
    saveDraft();
  }, [state, saveDraft]);

  // Keep cutsRef in sync
  useEffect(() => {
    cutsRef.current = state.cuts;
  }, [state.cuts]);

  // Open a shared artwork from the URL (?d=...)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const d = params.get(SHARE_QUERY);
    if (!d) return;
    let cancelled = false;
    decodeArt(d).then((art) => {
      if (cancelled || !art || !art.cuts.length) return;
      setResultViewing({ folds: art.folds, cuts: art.cuts, id: uid(), current: false });
      setShowResult(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Build a shareable link for the artwork currently on screen
  useEffect(() => {
    if (!showResult || !resultViewing) {
      setShareUrl("");
      return;
    }
    let cancelled = false;
    encodeArt(resultViewing.folds, resultViewing.cuts).then((enc) => {
      if (cancelled) return;
      const base = window.location.pathname.replace(/\/+$/, "");
      const viewPath = base.endsWith("/view") ? base : `${base}/view`;
      setShareUrl(`${window.location.origin}${viewPath}?${SHARE_QUERY}=${enc}`);
    });
    return () => {
      cancelled = true;
    };
  }, [showResult, resultViewing]);

  // Toast
  const toast = useCallback((msg: string, dur = 1800) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), dur);
  }, []);

  // Layout cut
  const layoutCut = useCallback(() => {
    const stage = stageRef.current;
    const cutCanvas = cutCanvasRef.current;
    if (!stage || !cutCanvas) return;
    const r = stage.getBoundingClientRect();
    if (r.width < 10 || r.height < 10) return;
    const G = GRef.current;
    G.W = r.width;
    G.H = r.height;
    G.dpr = Math.min(2.5, window.devicePixelRatio || 1);
    cutCanvas.width = Math.round(G.W * G.dpr);
    cutCanvas.height = Math.round(G.H * G.dpr);
    G.th = Math.PI / state.folds;
    G.cx = G.W / 2;
    const wBound = (G.W - 40) / (2 * Math.sin(G.th / 2));
    const hBound = G.H - Math.max(24, G.H * 0.035) - G.H * 0.02;
    if (wBound < hBound) {
      G.R = wBound;
      const gap = G.H - G.R;
      G.apexY = Math.min(G.H - 24, gap / 2 + G.R + gap * 0.06);
    } else {
      G.R = hBound;
      G.apexY = G.H - Math.max(24, G.H * 0.035);
    }
    cutPRef.current = makePaper(state.folds, state.cuts, G.R, G.dpr);
    paintCut();
  }, [state.folds, state.cuts]);

  // Paint cut
  const paintCut = useCallback(
    (preview?: CutRegion) => {
      const cutP = cutPRef.current;
      const cutCanvas = cutCanvasRef.current;
      if (!cutP || !cutCanvas) return;
      const x = cutCanvas.getContext("2d")!;
      const G = GRef.current;
      x.setTransform(G.dpr, 0, 0, G.dpr, 0, 0);
      x.clearRect(0, 0, G.W, G.H);
      x.drawImage(cutP.c, G.cx - cutP.ax, G.apexY - cutP.ay, cutP.w, cutP.h);
      if (preview && preview.pts.length) {
        x.setTransform(G.dpr, 0, 0, G.dpr, 0, 0);
        x.translate(G.cx, G.apexY);
        const pts = preview.pts;
        if (pts.length >= 3) {
          regionPath(x, pts, G.R);
          x.fillStyle = "rgba(255,199,92,.55)";
          x.fill();
          x.strokeStyle = "rgba(240,152,54,.95)";
          x.lineWidth = 2.5;
          x.stroke();
        } else {
          x.strokeStyle = "rgba(240,152,54,.95)";
          x.lineWidth = 2.5;
          x.lineCap = "round";
          x.lineJoin = "round";
          x.beginPath();
          x.moveTo(pts[0].u * G.R, -pts[0].v * G.R);
          for (let i = 1; i < pts.length; i++) x.lineTo(pts[i].u * G.R, -pts[i].v * G.R);
          x.stroke();
        }
      }
    },
    []
  );

  // Resize handler
  useEffect(() => {
    const handleResize = () => {
      if (page === "cut") layoutCut();
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [page, layoutCut]);

  // Layout cut when page changes to cut
  useEffect(() => {
    if (page === "cut") {
      requestAnimationFrame(layoutCut);
    }
  }, [page, layoutCut]);

  // Draw result canvas when overlay shows
  useEffect(() => {
    if (!showResult || !resultViewing || !resultCanvasRef.current) return;
    const canvas = resultCanvasRef.current;
    const stageEl = canvas.parentElement;
    if (!stageEl) return;

    // Size the canvas
    const s = stageEl.getBoundingClientRect();
    const px = Math.max(200, Math.min(s.width - 4, window.innerHeight * 0.42, 348));
    const d = Math.min(2, window.devicePixelRatio || 1);
    canvas.style.width = px + "px";
    canvas.style.height = px + "px";
    canvas.width = Math.round(px * d);
    canvas.height = Math.round(px * d);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const P = makePaper(resultViewing.folds, resultViewing.cuts, 420, 2);

    // Animate unfold
    const t0 = performance.now();
    const dur = 1050;
    let rafId = 0;

    const frame = (t: number) => {
      const p = clamp((t - t0) / dur, 0, 1);
      const appear = Math.min(1, p * 1.5);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawFlower(ctx, canvas.width, P, 1, -0.16 * (1 - appear), 0.93 + 0.07 * appear);
      if (p < 1) rafId = requestAnimationFrame(frame);
      else {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawFlower(ctx, canvas.width, P, 1, 0, 1);
      }
    };
    rafId = requestAnimationFrame(frame);

    return () => cancelAnimationFrame(rafId);
  }, [showResult, resultViewing]);

  // Touch handlers
  const toLocal = useCallback(
    (e: React.PointerEvent | PointerEvent) => {
      const cutCanvas = cutCanvasRef.current;
      if (!cutCanvas) return { u: 0, v: 0 };
      const r = cutCanvas.getBoundingClientRect();
      const G = GRef.current;
      return {
        u: (e.clientX - r.left - G.cx) / G.R,
        v: (G.apexY - (e.clientY - r.top)) / G.R,
      };
    },
    []
  );

  const polyArea = useCallback((pts: Array<{ u: number; v: number }>) => {
    let a = 0;
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      const q = pts[(i + 1) % pts.length];
      a += p.u * q.v - q.u * p.v;
    }
    return Math.abs(a) / 2;
  }, []);

  const regionTouchesPaper = useCallback(
    (pts: Array<{ u: number; v: number }>) => {
      const th = GRef.current.th;
      for (const p of pts) {
        const h = Math.hypot(p.u, p.v);
        const ang = Math.atan2(p.u, p.v);
        if (h <= 1.05 && Math.abs(ang) <= th + 0.08) return true;
      }
      return false;
    },
    []
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (page !== "cut" || drawPtrRef.current !== null) return;
      drawPtrRef.current = e.pointerId;
      try {
        stageRef.current?.setPointerCapture(e.pointerId);
      } catch {}
      curRef.current = { pts: [toLocal(e)] };
      paintCut(curRef.current);
      if (navigator.vibrate) navigator.vibrate(8);
    },
    [page, toLocal, paintCut]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (drawPtrRef.current !== e.pointerId || !curRef.current) return;
      const p = toLocal(e);
      const last = curRef.current.pts[curRef.current.pts.length - 1];
      const du = p.u - last.u;
      const dv = p.v - last.v;
      if (du * du + dv * dv < 0.000036) return;
      curRef.current.pts.push(p);
      paintCut(curRef.current);
    },
    [toLocal, paintCut]
  );

  const endDraw = useCallback(
    (e: React.PointerEvent | PointerEvent) => {
      if (drawPtrRef.current !== e.pointerId) return;
      drawPtrRef.current = null;
      if (curRef.current) {
        const c = curRef.current;
        curRef.current = null;
        if (c.pts.length >= 3 && polyArea(c.pts) >= 0.0001 && regionTouchesPaper(c.pts)) {
          setState((prev) => ({ ...prev, cuts: [...prev.cuts, c] }));
          setUndoStack((prev) => [...prev, { t: "add" }]);
          setRedoStack([]);
          if (cutPRef.current) {
            paintPaper(cutPRef.current, [...cutsRef.current, c]);
          }
          if (navigator.vibrate) navigator.vibrate(15);
        }
        paintCut();
      }
    },
    [polyArea, regionTouchesPaper, paintCut]
  );

  // History
  const afterHistory = useCallback(() => {
    if (cutPRef.current) paintPaper(cutPRef.current, state.cuts);
    paintCut();
  }, [state.cuts, paintCut]);

  const doUndo = useCallback(() => {
    setUndoStack((prev) => {
      const a = prev[prev.length - 1];
      if (!a) return prev;
      const newStack = prev.slice(0, -1);
      if (a.t === "add") {
        setState((s) => {
          const c = s.cuts[s.cuts.length - 1];
          setRedoStack((r) => [...r, { t: "add", c }]);
          return { ...s, cuts: s.cuts.slice(0, -1) };
        });
      } else if (a.prev) {
        setRedoStack((r) => [...r, { t: "clear", prev: clone(a.prev!) }]);
        setState((s) => ({ ...s, cuts: clone(a.prev!) }));
      }
      return newStack;
    });
  }, []);

  const doRedo = useCallback(() => {
    setRedoStack((prev) => {
      const a = prev[prev.length - 1];
      if (!a) return prev;
      const newStack = prev.slice(0, -1);
      if (a.t === "add" && a.c) {
        setState((s) => ({ ...s, cuts: [...s.cuts, a.c!] }));
        setUndoStack((u) => [...u, { t: "add" }]);
      } else if (a.prev) {
        setUndoStack((u) => [...u, { t: "clear", prev: clone(a.prev!) }]);
        setState((s) => ({ ...s, cuts: [] }));
      }
      return newStack;
    });
  }, []);

  // Clear
  const handleClear = useCallback(() => {
    if (!state.cuts.length) return;
    setUndoStack((prev) => [...prev, { t: "clear", prev: clone(state.cuts) }]);
    setState((prev) => ({ ...prev, cuts: [] }));
    setRedoStack([]);
    toast(t("papercut.toast.cleared"));
  }, [state.cuts, toast, t]);

  // Update tools state
  const canUndo = undoStack.length > 0;
  const canRedo = redoStack.length > 0;
  const canClear = state.cuts.length > 0;

  // Start new project
  const handleStart = useCallback(() => {
    if (state.draftSaved || !state.cuts.length) {
      setState((prev) => ({
        ...prev,
        cuts: [],
        projectId: uid(),
        draftSaved: false,
      }));
      setUndoStack([]);
      setRedoStack([]);
    }
    setPage("cut");
  }, [state]);

  // Switch folds
  const handleFoldsChange = useCallback(
    (folds: number) => {
      if (folds === state.folds) return;
      setState((prev) => ({ ...prev, folds }));
      requestAnimationFrame(layoutCut);
    },
    [state.folds, layoutCut]
  );

  // Unfold
  const handleUnfold = useCallback(() => {
    if (showResult) return;
    setResultViewing({
      cuts: state.cuts,
      folds: state.folds,
      id: state.projectId,
      current: true,
    });
    setShowResult(true);
  }, [state, showResult]);

  // Close result
  const closeResult = useCallback(() => {
    cancelAnimationFrame(rafIdRef.current);
    setShowResult(false);
    setResultViewing(null);
  }, []);

  // Download
  const downloadBlob = useCallback((b: Blob) => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(b);
    a.download = "paper-cut-art_" + fmtDate(new Date()).replace(/\//g, "") + ".png";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }, []);

  // Generate blob from current result
  const currentBlob = useCallback(async (): Promise<Blob | null> => {
    if (!resultViewing) return null;
    const P = makePaper(resultViewing.folds, resultViewing.cuts, 560, 2);
    const c = document.createElement("canvas");
    c.width = c.height = 1200;
    const x = c.getContext("2d")!;
    x.clearRect(0, 0, 1200, 1200);
    const f = document.createElement("canvas");
    f.width = f.height = 1160;
    drawFlower(f.getContext("2d")!, 1160, P, 1, 0, 1);
    x.drawImage(f, 20, 20);
    return new Promise((r) => c.toBlob((b) => r(b!), "image/png"));
  }, [resultViewing]);

  // Download handler
  const handleDownload = useCallback(async () => {
    const blob = await currentBlob();
    if (blob) {
      downloadBlob(blob);
      toast(t("papercut.result.saved"));
    }
  }, [currentBlob, downloadBlob, toast, t]);

  // Jump to the standalone showcase page
  const handleOpenView = useCallback(() => {
    if (!shareUrl) return;
    toast(t("papercut.result.viewOpening"));
    window.setTimeout(() => {
      window.location.href = shareUrl;
    }, 350);
  }, [shareUrl, toast, t]);

  // Render
  return (
    <div className="flex min-h-screen flex-col">
      <style>{`
        :root {
          --serif: "Songti SC", "STSong", "Noto Serif SC", "SimSun", serif;
          --red: #b7202d;
          --accent: #d6472e;
          --ink: #5c231a;
          --ink2: #8d7a6a;
        }
        .papercut-app {
          position: relative;
          margin: 0 auto;
          height: 100vh;
          height: 100dvh;
          max-width: 480px;
          overflow: hidden;
          user-select: none;
          -webkit-user-select: none;
          -webkit-touch-callout: none;
          background: linear-gradient(180deg, #fdf8f0 0%, #fbeeda 46%, #f7dbbe 100%);
        }
        @media (min-width: 520px) {
          .papercut-app {
            width: 480px;
            height: min(900px, 94vh);
            border-radius: 42px;
            box-shadow: 0 36px 90px rgba(90, 45, 15, 0.4);
          }
        }
        .papercut-page {
          position: absolute;
          inset: 0;
          display: none;
          flex-direction: column;
        }
        .papercut-page.active {
          display: flex;
          animation: papercutPageIn 0.35s ease both;
        }
        @keyframes papercutPageIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .papercut-glow {
          position: absolute;
          top: 44px;
          left: -66px;
          width: 280px;
          height: 280px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(242, 150, 140, 0.55), rgba(242, 150, 140, 0) 68%);
          filter: blur(6px);
          pointer-events: none;
          z-index: 0;
        }
        .papercut-hero-card {
          position: relative;
          z-index: 1;
          margin: max(10vh, 86px) 7vw 0;
          text-align: center;
          background: linear-gradient(180deg, rgba(255, 253, 249, 0.94), rgba(255, 241, 229, 0.72));
          border-radius: 30px;
          padding: 8vh 10px 9vh;
          box-shadow: 0 18px 50px rgba(200, 120, 70, 0.15);
        }
        .papercut-hero-card h1 {
          font-family: var(--serif);
          color: #7a1d12;
          font-weight: 700;
          font-size: clamp(40px, 11.5vw, 56px);
          letter-spacing: 0.06em;
          text-indent: 0.06em;
          animation: papercutFadeUp 0.6s 0.05s ease both;
        }
        .papercut-btn-start {
          margin-top: 6vh;
          border: none;
          color: #fff;
          font-size: 20px;
          font-weight: 600;
          letter-spacing: 0.35em;
          text-indent: 0.35em;
          padding: 17px 44px;
          border-radius: 18px;
          background: linear-gradient(120deg, #f5a266, #d84a2d);
          box-shadow: 0 12px 26px rgba(216, 74, 45, 0.38), inset 0 1px 0 rgba(255, 255, 255, 0.35);
          transition: transform 0.15s;
          animation: papercutFadeUp 0.6s 0.18s ease both;
        }
        .papercut-btn-start:active {
          transform: scale(0.95);
        }
        @keyframes papercutFadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: none; }
        }
        .papercut-recent {
          position: relative;
          z-index: 1;
          margin-top: 4vh;
          text-align: center;
          padding-bottom: 40px;
          animation: papercutFadeUp 0.6s 0.3s ease both;
        }
        .papercut-recent-pill {
          display: inline-block;
          font-family: var(--serif);
          font-weight: 600;
          color: #5c2018;
          letter-spacing: 0.3em;
          text-indent: 0.3em;
          padding: 13px 36px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.88);
          box-shadow: 0 8px 22px rgba(200, 120, 70, 0.14);
        }
        .papercut-gallery {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(106px, 1fr));
          gap: 20px 16px;
          padding: 26px 26px 8px;
          text-align: left;
        }
        .papercut-g-item {
          cursor: pointer;
        }
        .papercut-g-thumb {
          width: 100%;
          aspect-ratio: 1;
          border-radius: 18px;
          padding: 9%;
          background: linear-gradient(180deg, #fffdf9, #fdeede);
          box-shadow: 0 8px 20px rgba(190, 110, 60, 0.16);
          transition: transform 0.15s;
        }
        .papercut-g-item:active .papercut-g-thumb {
          transform: scale(0.94);
        }
        .papercut-g-thumb img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        .papercut-g-date {
          text-align: center;
          margin-top: 8px;
          color: #96705a;
          font-size: 12.5px;
        }
        .papercut-gallery-empty {
          padding: 34px 0 6px;
          color: #bb9c87;
          font-size: 14px;
          letter-spacing: 0.12em;
        }
        .papercut-cut-top {
          position: relative;
          z-index: 6;
          padding: calc(env(safe-area-inset-top) + 14px) 16px 0;
        }
        .papercut-home-btn {
          margin-top: 10px;
          width: 52px;
          height: 52px;
          border-radius: 50%;
          border: none;
          display: grid;
          place-items: center;
          background: #fff;
          box-shadow: 0 6px 16px rgba(190, 100, 60, 0.2);
          transition: transform 0.12s;
        }
        .papercut-home-btn:active {
          transform: scale(0.92);
        }
        .papercut-seg {
          position: absolute;
          left: 50%;
          top: calc(env(safe-area-inset-top) + 26px);
          transform: translateX(-50%);
          display: flex;
          padding: 4px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.62);
          box-shadow: 0 6px 18px rgba(190, 110, 60, 0.12);
          backdrop-filter: blur(8px);
        }
        .papercut-seg button {
          border: none;
          background: transparent;
          padding: 9px 19px;
          border-radius: 999px;
          white-space: nowrap;
          font-size: 15.5px;
          color: var(--ink2);
          font-weight: 500;
          transition: all 0.2s;
        }
        .papercut-seg button.on {
          background: #fff;
          color: #41302a;
          font-weight: 700;
          box-shadow: 0 3px 10px rgba(150, 80, 40, 0.18);
        }
        .papercut-stage {
          flex: 1;
          position: relative;
          touch-action: none;
          min-height: 0;
        }
        .papercut-canvas {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          cursor: crosshair;
          filter: drop-shadow(0 18px 20px rgba(155, 65, 32, 0.32));
        }
        .papercut-tools {
          position: absolute;
          left: 18px;
          bottom: calc(env(safe-area-inset-bottom) + 28px);
          display: flex;
          flex-direction: column;
          gap: 14px;
          z-index: 5;
        }
        .papercut-cbtn {
          width: 54px;
          height: 54px;
          border-radius: 50%;
          border: none;
          background: #fff;
          display: grid;
          place-items: center;
          box-shadow: 0 6px 16px rgba(190, 100, 60, 0.2);
          transition: transform 0.12s, opacity 0.25s;
        }
        .papercut-cbtn:active {
          transform: scale(0.9);
        }
        .papercut-cbtn.disabled {
          opacity: 0.38;
          pointer-events: none;
        }
        .papercut-unfold {
          position: absolute;
          right: 22px;
          bottom: calc(env(safe-area-inset-bottom) + 26px);
          z-index: 5;
          border: none;
          background: transparent;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }
        .papercut-unfold .disc {
          width: 68px;
          height: 68px;
          border-radius: 50%;
          background: #fff;
          display: grid;
          place-items: center;
          box-shadow: 0 8px 22px rgba(190, 100, 60, 0.26);
          transition: transform 0.15s;
        }
        .papercut-unfold:active .disc {
          transform: scale(0.9);
        }
        .papercut-unfold .lab {
          font-family: var(--serif);
          color: #7a2418;
          font-size: 18px;
          font-weight: 600;
          letter-spacing: 0.35em;
          text-indent: 0.35em;
        }
        .papercut-overlay {
          position: absolute;
          inset: 0;
          z-index: 50;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(62, 48, 40, 0.56);
          backdrop-filter: blur(3px);
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s;
        }
        .papercut-overlay.show {
          opacity: 1;
          pointer-events: auto;
        }
        .papercut-result-card {
          position: relative;
          width: 86%;
          max-width: 392px;
          max-height: 94%;
          border-radius: 28px;
          padding: 26px 18px 22px;
          background: linear-gradient(180deg, #fffcf7 0%, #fdf3e6 55%, #fbe9d6 100%);
          box-shadow: 0 30px 70px rgba(40, 20, 10, 0.45);
          transform: translateY(34px) scale(0.96);
          transition: transform 0.4s cubic-bezier(0.2, 0.9, 0.3, 1.15);
        }
        .papercut-overlay.show .papercut-result-card {
          transform: none;
        }
        .papercut-result-stage {
          display: flex;
          justify-content: center;
          padding: 2px 0 20px;
        }
        .papercut-result-canvas {
          filter: drop-shadow(0 16px 24px rgba(150, 60, 30, 0.35));
        }
        .papercut-result-actions {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: 14px;
        }
        .papercut-rbtn {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          border: none;
          background: #fff;
          display: grid;
          place-items: center;
          box-shadow: 0 6px 16px rgba(190, 100, 60, 0.24);
          transition: transform 0.12s, opacity 0.2s;
        }
        .papercut-rbtn:active {
          transform: scale(0.9);
        }
        .papercut-rbtn.disabled {
          opacity: 0.38;
          pointer-events: none;
        }
        .papercut-share-btn {
          min-width: 148px;
          padding: 15px 34px;
          border: none;
          border-radius: 999px;
          color: #fff;
          font-size: 19px;
          font-weight: 700;
          letter-spacing: 0.3em;
          text-indent: 0.3em;
          background: linear-gradient(120deg, #f29a5f, #d6472e);
          box-shadow: 0 10px 22px rgba(214, 71, 46, 0.4);
          transition: transform 0.12s;
        }
        .papercut-share-btn:active {
          transform: scale(0.95);
        }
        .papercut-toast {
          position: absolute;
          left: 50%;
          bottom: 128px;
          transform: translateX(-50%) translateY(10px);
          background: rgba(58, 38, 28, 0.88);
          color: #fff;
          padding: 10px 20px;
          border-radius: 999px;
          font-size: 14px;
          letter-spacing: 0.05em;
          opacity: 0;
          transition: 0.3s;
          z-index: 99;
          pointer-events: none;
          white-space: nowrap;
        }
        .papercut-toast.show {
          opacity: 1;
          transform: translateX(-50%);
        }
        .papercut-culture-card {
          position: relative;
          width: 86%;
          max-width: 392px;
          max-height: 88%;
          overflow-y: auto;
          border-radius: 28px;
          padding: 24px 22px 24px;
          text-align: center;
          background: linear-gradient(180deg, #fffcf7 0%, #fdf3e6 55%, #fbe9d6 100%);
          box-shadow: 0 30px 70px rgba(40, 20, 10, 0.45);
          transform: translateY(34px) scale(0.96);
          transition: transform 0.4s cubic-bezier(0.2, 0.9, 0.3, 1.15);
          scrollbar-width: none;
        }
        .papercut-culture-card::-webkit-scrollbar {
          display: none;
        }
        .papercut-overlay.show .papercut-culture-card {
          transform: none;
        }
        .papercut-culture-card h2 {
          font-family: var(--serif);
          color: #7a1d12;
          font-size: 26px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-indent: 0.2em;
        }
        .papercut-culture-sub {
          font-family: var(--serif);
          color: #a4553f;
          font-size: 13px;
          margin: 7px 0 10px;
          letter-spacing: 0.12em;
        }
        .papercut-culture-body {
          text-align: left;
          margin-top: 6px;
        }
        .papercut-culture-body h3 {
          font-family: var(--serif);
          color: #8f2a1c;
          font-size: 15.5px;
          font-weight: 700;
          margin: 15px 0 6px;
          display: flex;
          align-items: center;
          gap: 9px;
        }
        .papercut-culture-body h3::before {
          content: "";
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #d6472e;
          box-shadow: 0 0 0 3px rgba(214, 71, 46, 0.14);
          flex: none;
        }
        .papercut-culture-body p {
          font-size: 13.5px;
          line-height: 1.95;
          color: #6b4a3a;
          text-align: justify;
        }
        .papercut-culture-end {
          font-family: var(--serif);
          color: #a4553f;
          font-size: 12.5px;
          margin-top: 20px;
          letter-spacing: 0.08em;
        }
      `}</style>

      <div className="papercut-app">
        {/* Home page */}
        <section className={`papercut-page ${page === "home" ? "active" : ""}`} style={{ overflowY: "auto" }}>
          <div className="papercut-glow" />
          <div className="papercut-hero-card">
            <h1>{t("papercut.home.title")}</h1>
            <button className="papercut-btn-start" onClick={handleStart}>
              {t("papercut.home.start")}
            </button>
          </div>
          <div className="papercut-recent">
            <div className="papercut-recent-pill">{t("papercut.home.recent")}</div>
            {(() => {
              const gallery = loadGal();
              return (
                <>
                  <div id="gallery" className="papercut-gallery">
                    {gallery.map((entry) => (
                      <div
                        key={entry.id}
                        className="papercut-g-item"
                        onClick={() => {
                          setResultViewing({
                            cuts: entry.cuts,
                            folds: entry.folds,
                            id: entry.id,
                            current: false,
                            entry,
                          });
                          setShowResult(true);
                        }}
                      >
                        <div className="papercut-g-thumb">
                          <img src={entry.thumb} alt="Paper cut art" />
                        </div>
                        <div className="papercut-g-date">{entry.date}</div>
                      </div>
                    ))}
                  </div>
                  {gallery.length === 0 && (
                    <div className="papercut-gallery-empty">{t("papercut.home.empty")}</div>
                  )}
                </>
              );
            })()}
            <button
              className="papercut-culture-link"
              onClick={() => setShowCulture(true)}
              style={{
                marginTop: 26,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                border: "none",
                background: "rgba(255,255,255,.68)",
                color: "#7a2418",
                fontFamily: "var(--serif)",
                fontWeight: 600,
                fontSize: "14.5px",
                letterSpacing: ".18em",
                textIndent: ".09em",
                padding: "11px 24px",
                borderRadius: 999,
                boxShadow: "0 6px 16px rgba(200,120,70,.13)",
                transition: "transform .15s",
                cursor: "pointer",
              }}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#d6472e" strokeWidth="2" strokeLinecap="round">
                <circle cx="6.2" cy="6.4" r="2.7" />
                <circle cx="6.2" cy="17.6" r="2.7" />
                <path d="M8.6 7.9 19.5 18.2M8.6 16.1 19.5 5.8" />
              </svg>
              {t("papercut.home.culture")}
            </button>
          </div>
        </section>

        {/* Cut page */}
        <section className={`papercut-page ${page === "cut" ? "active" : ""}`}>
          <div className="papercut-cut-top">
            <button className="papercut-home-btn" onClick={() => setPage("home")}>
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path d="M12 3.2 2.6 11.2h2.6V21h5.4v-5.4h2.8V21h5.4v-9.8h2.6z" fill="#c8402c" />
              </svg>
            </button>
            <div className="papercut-seg">
              {[4, 6, 8].map((f) => (
                <button
                  key={f}
                  className={state.folds === f ? "on" : ""}
                  onClick={() => handleFoldsChange(f)}
                >
                  {f === 4 ? t("papercut.cut.folds4") : f === 6 ? t("papercut.cut.folds6") : t("papercut.cut.folds8")}
                </button>
              ))}
            </div>
          </div>
          <div
            ref={stageRef}
            className="papercut-stage"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={endDraw}
            onPointerCancel={endDraw}
          >
            <canvas ref={cutCanvasRef} className="papercut-canvas" />
          </div>
          <div className="papercut-tools">
            <button
              className={`papercut-cbtn ${!canClear ? "disabled" : ""}`}
              onClick={handleClear}
            >
              <svg viewBox="0 0 24 24" width="23" height="23" fill="none" stroke="#c8402c" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4.5 6.8h15" />
                <path d="M9.3 6.5V4.9c0-.7.5-1.2 1.2-1.2h3c.7 0 1.2.5 1.2 1.2v1.6" />
                <path d="M6.4 6.8l.9 12.4c.1.7.6 1.2 1.3 1.2h6.8c.7 0 1.2-.5 1.3-1.2l.9-12.4" />
                <path d="M10 10.5v6.2M14 10.5v6.2" />
              </svg>
            </button>
            <button
              className={`papercut-cbtn ${!canUndo ? "disabled" : ""}`}
              onClick={doUndo}
            >
              <svg viewBox="0 0 24 24" width="23" height="23" fill="none" stroke="#c8402c" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8.8 13.6 4.4 9.2l4.4-4.4" />
                <path d="M4.4 9.2h9.2a5.8 5.8 0 0 1 5.8 5.8v3.2" />
              </svg>
            </button>
            <button
              className={`papercut-cbtn ${!canRedo ? "disabled" : ""}`}
              onClick={doRedo}
            >
              <svg viewBox="0 0 24 24" width="23" height="23" fill="none" stroke="#c8402c" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15.2 13.6l4.4-4.4-4.4-4.4" />
                <path d="M19.6 9.2h-9.2A5.8 5.8 0 0 0 4.6 15v3.2" />
              </svg>
            </button>
          </div>
          <button className="papercut-unfold" onClick={handleUnfold}>
            <span className="disc">
              <svg viewBox="0 0 34 34" width="36" height="36">
                {Array.from({ length: state.folds }, (_, i) => {
                  const cx = 17,
                    cy = 17,
                    r = 15,
                    gap = 0.035;
                  const a0 = -Math.PI / 2 + i * ((2 * Math.PI) / state.folds) + gap;
                  const a1 = -Math.PI / 2 + (i + 1) * ((2 * Math.PI) / state.folds) - gap;
                  const x0 = cx + r * Math.cos(a0),
                    y0 = cy + r * Math.sin(a0);
                  const x1 = cx + r * Math.cos(a1),
                    y1 = cy + r * Math.sin(a1);
                  const fill = i === 0 ? "#dd4b30" : i % 2 ? "#f3ab80" : "#f6c9ab";
                  return (
                    <path
                      key={i}
                      d={`M${cx},${cy} L${x0.toFixed(2)},${y0.toFixed(2)} A${r},${r} 0 0,1 ${x1.toFixed(2)},${y1.toFixed(2)} Z`}
                      fill={fill}
                    />
                  );
                })}
              </svg>
            </span>
            <span className="lab">{t("papercut.cut.unfold")}</span>
          </button>
        </section>

        {/* Result overlay */}
        <div className={`papercut-overlay ${showResult ? "show" : ""}`}>
          <button
            className="papercut-cbtn"
            style={{ position: "absolute", top: "calc(env(safe-area-inset-top) + 18px)", left: 18 }}
            onClick={closeResult}
          >
            <svg viewBox="0 0 24 24" width="22" height="22">
              <path d="M14.8 4.8 8 12l6.8 7.2" fill="none" stroke="#c8402c" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div className="papercut-result-card">
            <div className="papercut-result-stage">
              <canvas ref={resultCanvasRef} className="papercut-result-canvas" />
            </div>
            <div className="papercut-result-actions">
              <button className="papercut-rbtn" onClick={closeResult}>
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#e06a3c" strokeWidth="2" strokeLinecap="round">
                  <circle cx="6.2" cy="6.4" r="2.7" />
                  <circle cx="6.2" cy="17.6" r="2.7" />
                  <path d="M8.6 7.9 19.5 18.2M8.6 16.1 19.5 5.8" />
                </svg>
              </button>
              <button className="papercut-share-btn" onClick={() => setShareOpen(true)}>{t("papercut.result.share")}</button>
              <button className="papercut-rbtn" onClick={handleDownload}>
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#e06a3c" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 4.2v9.6" />
                  <path d="m7.6 10 4.4 4.4L16.4 10" />
                  <path d="M5 19.4h14" />
                </svg>
              </button>
              <button
                className={`papercut-rbtn ${!shareUrl ? "disabled" : ""}`}
                onClick={handleOpenView}
                aria-label={t("papercut.result.view")}
                title={t("papercut.result.view")}
              >
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#e06a3c" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 5h5v5" />
                  <path d="M19 5l-7.6 7.6" />
                  <path d="M18 13.6V18a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4.4" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Culture overlay */}
        <div className={`papercut-overlay ${showCulture ? "show" : ""}`}>
          <button
            className="papercut-cbtn"
            style={{ position: "absolute", top: "calc(env(safe-area-inset-top) + 18px)", left: 18 }}
            onClick={() => setShowCulture(false)}
          >
            <svg viewBox="0 0 24 24" width="22" height="22">
              <path d="M14.8 4.8 8 12l6.8 7.2" fill="none" stroke="#c8402c" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div className="papercut-culture-card">
            <h2>{t("papercut.culture.title")}</h2>
            <p className="papercut-culture-sub">{t("papercut.culture.subtitle")}</p>
            <div className="papercut-culture-body">
              <h3>{t("papercut.culture.s1.title")}</h3>
              <p>{t("papercut.culture.s1.body")}</p>
              <h3>{t("papercut.culture.s2.title")}</h3>
              <p>{t("papercut.culture.s2.body")}</p>
              <h3>{t("papercut.culture.s3.title")}</h3>
              <p>{t("papercut.culture.s3.body")}</p>
              <h3>{t("papercut.culture.s4.title")}</h3>
              <p>{t("papercut.culture.s4.body")}</p>
            </div>
            <p className="papercut-culture-end">{t("papercut.culture.end")}</p>
          </div>
        </div>

        {/* Toast */}
        <div className={`papercut-toast ${showToast ? "show" : ""}`}>{toastMsg}</div>
      </div>
      <Suspense>
        <ShareModal
          open={shareOpen}
          onOpenChange={setShareOpen}
          url={shareUrl || undefined}
          text={t("papercut.result.shareText", "剪纸生花 - 我的剪纸作品")}
          title={t("papercut.share.title", "分享剪纸作品")}
          subtitle={t("papercut.share.subtitle", "与朋友分享你的剪纸创作 🎨")}
          linkHint={t("papercut.share.viewHint")}
          captureRef={resultCanvasRef}
          fileName="paper-cut-art.png"
          transparent
        />
      </Suspense>
    </div>
  );
}
