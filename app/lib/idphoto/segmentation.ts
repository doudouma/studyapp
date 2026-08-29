// transformers.js + RMBG-1.4 浏览器端抠图管线。
// 移植自 template/证件照工具.html L595-845；进度回调改为 SegEvent 结构化事件。
export type SegEvent =
  | { kind: "runtimeLoading" }
  | { kind: "modelDownloading"; pct: number }
  | { kind: "modelCompiling" }
  | { kind: "inferring" };

const TRANSFORMERS_URLS = [
  "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1",
  "https://fastly.jsdelivr.net/npm/@huggingface/transformers@3.8.1",
  "https://gcore.jsdelivr.net/npm/@huggingface/transformers@3.8.1",
  "https://unpkg.com/@huggingface/transformers@3.8.1",
];

async function importTransformers(): Promise<any> {
  let lastErr: unknown = null;
  for (const u of TRANSFORMERS_URLS) {
    try {
      return await import(/* @vite-ignore */ u);
    } catch (e) {
      lastErr = e;
      console.warn("transformers.js 加载失败，换源重试", u, e);
    }
  }
  throw lastErr ?? new Error("AI runtime load failed");
}

let segPipePromise: Promise<any> | null = null;

export interface SegmentResult {
  cut: HTMLImageElement;
  personTopSrc: number | null;
}

/** 加载 RMBG-1.4 pipeline：huggingface.co 优先，失败换 hf-mirror；fp16 失败回退 q8 */
async function loadPipeline(T: any, onEvent?: (e: SegEvent) => void): Promise<any> {
  const progress = (p: any) => {
    if (p.status === "progress" && p.total)
      onEvent?.({ kind: "modelDownloading", pct: Math.round(((p.loaded || 0) / p.total) * 100) });
    else if (p.status === "done") onEvent?.({ kind: "modelCompiling" });
    else if (p.status === "initiate") onEvent?.({ kind: "runtimeLoading" });
  };
  const HOSTS = ["https://huggingface.co", "https://hf-mirror.com"];
  const DTYPES = ["fp16", "q8"];
  let lastErr: unknown = null;
  outer: for (const host of HOSTS) {
    T.env.remoteHost = host;
    for (const dtype of DTYPES) {
      try {
        return await T.pipeline("background-removal", "briaai/RMBG-1.4", { dtype, progress_callback: progress });
      } catch (e) {
        lastErr = e;
        console.warn(`抠图模型加载失败（${host} / ${dtype}），换源重试`, e);
      }
    }
  }
  throw lastErr ?? new Error("segmentation model load failed");
}

/**
 * 对图片执行 AI 抠图，返回去背 cut 图与人物头顶行（原图坐标）。
 * 可能抛错（AI 组件下载失败/跨域污染画布/cut 解码失败），调用方须 try/catch 并回退「仅裁剪排版」路径。
 */
export async function segmentImage(
  img: HTMLImageElement,
  onEvent?: (e: SegEvent) => void,
): Promise<SegmentResult> {
  onEvent?.({ kind: "runtimeLoading" });
  const T = await importTransformers();
  T.env.allowLocalModels = false;
  // 缓存 Promise 防并发竞态：并发调用复用同一次模型加载（进度事件只发给首个触发者）
  if (!segPipePromise) {
    segPipePromise = loadPipeline(T, onEvent).catch((e) => {
      segPipePromise = null; // 失败后允许下次重试
      throw e;
    });
  }
  const segPipe = await segPipePromise;
  onEvent?.({ kind: "inferring" });

  // 超大照片先降采样到最长边 1600 再推理
  const MAX_SEG = 1600;
  let sw = img.naturalWidth, sh = img.naturalHeight;
  if (Math.max(sw, sh) > MAX_SEG) {
    const k = MAX_SEG / Math.max(sw, sh);
    sw = Math.round(sw * k); sh = Math.round(sh * k);
  }
  const c = document.createElement("canvas");
  c.width = sw; c.height = sh;
  const ctx0 = c.getContext("2d")!;
  ctx0.drawImage(img, 0, 0, sw, sh);
  const srcPx = ctx0.getImageData(0, 0, sw, sh).data;
  const bg = estimateBg(srcPx, sw, sh);

  const out = await segPipe(c.toDataURL("image/png"));
  const rgba = out[0]; // RawImage RGBA，与送入尺寸一致
  const px = new Uint8ClampedArray(rgba.data);
  const rw = rgba.width, rh = rgba.height;
  cleanMask(px, rw, rh);
  unmixBg(px, rw, rh, bg);
  decontaminate(px, rw, rh, bg);

  const cc = document.createElement("canvas");
  cc.width = rw; cc.height = rh;
  cc.getContext("2d")!.putImageData(new ImageData(px, rw, rh), 0, 0);

  // 从 alpha 轮廓找人物真实头顶行（含发型）
  let topRow = -1;
  outer: for (let y = 0; y < rgba.height; y++) {
    for (let x = 0; x < rgba.width; x++) {
      if (px[(y * rgba.width + x) * 4 + 3] > 30) { topRow = y; break outer; }
    }
  }
  const cut = new Image();
  await new Promise<void>((res, rej) => { cut.onload = () => res(); cut.onerror = () => rej(new Error("cut image decode failed")); cut.src = cc.toDataURL("image/png"); });
  const personTopSrc = topRow >= 0 ? topRow * (img.naturalHeight / rgba.height) : null;
  return { cut, personTopSrc };
}

// 遮罩清理管线（双阈值磁滞重建 + 闭运算填孔 + 羽化）：
// 强阈值(a>140)取"确定是人"的核心并保留其最大连通块；弱阈值(a>40)区域仅当与核心相连才保留。
// 外围斑块与人体核心不相连 → 被清除；不确定但与身体相连的部位（浅色头发/脸边缘）→ 保留。
function cleanMask(px: Uint8ClampedArray, rw: number, rh: number) {
  const MW = 512, MH = Math.max(1, Math.round(MW * rh / rw));
  const strong = new Uint8Array(MW * MH);
  const weak = new Uint8Array(MW * MH);
  for (let my = 0; my < MH; my++)
    for (let mx = 0; mx < MW; mx++) {
      const sx = Math.min(rw - 1, (mx * rw / MW) | 0);
      const sy = Math.min(rh - 1, (my * rh / MH) | 0);
      const a = px[(sy * rw + sx) * 4 + 3];
      strong[my * MW + mx] = a > 140 ? 1 : 0;
      weak[my * MW + mx] = a > 40 ? 1 : 0;
    }
  // 1) 强核心的最大连通块
  const label = new Int32Array(MW * MH).fill(-1);
  const area = [];
  let nComp = 0;
  const stack: number[] = [];
  for (let i = 0; i < MW * MH; i++) {
    if (!strong[i] || label[i] >= 0) continue;
    const id = nComp++;
    let cnt = 0;
    stack.length = 0; stack.push(i); label[i] = id;
    while (stack.length) {
      const cur = stack.pop()!; cnt++;
      const cx0 = cur % MW, cy0 = (cur / MW) | 0;
      if (cx0 > 0 && strong[cur - 1] && label[cur - 1] < 0) { label[cur - 1] = id; stack.push(cur - 1); }
      if (cx0 < MW - 1 && strong[cur + 1] && label[cur + 1] < 0) { label[cur + 1] = id; stack.push(cur + 1); }
      if (cy0 > 0 && strong[cur - MW] && label[cur - MW] < 0) { label[cur - MW] = id; stack.push(cur - MW); }
      if (cy0 < MH - 1 && strong[cur + MW] && label[cur + MW] < 0) { label[cur + MW] = id; stack.push(cur + MW); }
    }
    area[id] = cnt;
  }
  if (!nComp) return; // 没有可靠核心就不动遮罩
  let best = 0;
  for (let i = 1; i < nComp; i++) if (area[i] > area[best]) best = i;
  // 2) 从核心出发在弱遮罩上生长（磁滞重建）
  let m = new Uint8Array(MW * MH);
  stack.length = 0;
  for (let i = 0; i < MW * MH; i++) if (label[i] === best) { m[i] = 1; stack.push(i); }
  while (stack.length) {
    const cur = stack.pop()!;
    const cx0 = cur % MW, cy0 = (cur / MW) | 0;
    if (cx0 > 0 && weak[cur - 1] && !m[cur - 1]) { m[cur - 1] = 1; stack.push(cur - 1); }
    if (cx0 < MW - 1 && weak[cur + 1] && !m[cur + 1]) { m[cur + 1] = 1; stack.push(cur + 1); }
    if (cy0 > 0 && weak[cur - MW] && !m[cur - MW]) { m[cur - MW] = 1; stack.push(cur - MW); }
    if (cy0 < MH - 1 && weak[cur + MW] && !m[cur + MW]) { m[cur + MW] = 1; stack.push(cur + MW); }
  }
  // 3) 闭运算：填平人物内部小孔（脸/衣服上的色点）
  const dilate = (src: Uint8Array, r: number) => {
    let t = new Uint8Array(MW * MH), out = new Uint8Array(MW * MH);
    for (let y = 0; y < MH; y++)
      for (let x = 0; x < MW; x++) {
        let v = 0;
        for (let k = -r; k <= r; k++) { const xx = x + k; if (xx >= 0 && xx < MW && src[y * MW + xx]) { v = 1; break; } }
        t[y * MW + x] = v;
      }
    for (let y = 0; y < MH; y++)
      for (let x = 0; x < MW; x++) {
        let v = 0;
        for (let k = -r; k <= r; k++) { const yy = y + k; if (yy >= 0 && yy < MH && t[yy * MW + x]) { v = 1; break; } }
        out[y * MW + x] = v;
      }
    return out;
  };
  const erode = (src: Uint8Array, r: number) => {
    let t = new Uint8Array(MW * MH), out = new Uint8Array(MW * MH);
    for (let y = 0; y < MH; y++)
      for (let x = 0; x < MW; x++) {
        let v = 1;
        for (let k = -r; k <= r; k++) { const xx = x + k; if (xx < 0 || xx >= MW || !src[y * MW + xx]) { v = 0; break; } }
        t[y * MW + x] = v;
      }
    for (let y = 0; y < MH; y++)
      for (let x = 0; x < MW; x++) {
        let v = 1;
        for (let k = -r; k <= r; k++) { const yy = y + k; if (yy < 0 || yy >= MH || !t[yy * MW + x]) { v = 0; break; } }
        out[y * MW + x] = v;
      }
    return out;
  };
  m = erode(dilate(m, 3), 3);  // 闭运算填小孔（保留细丝：细线经膨胀-腐蚀后仍在）
  // 羽化：512 网格画到 canvas 再双线性放大回原尺寸，边缘自然过渡
  const mc = document.createElement("canvas"); mc.width = MW; mc.height = MH;
  const mctx = mc.getContext("2d")!;
  const mimg = mctx.createImageData(MW, MH);
  for (let i = 0; i < MW * MH; i++) {
    const v = m[i] * 255;
    mimg.data[i * 4] = v; mimg.data[i * 4 + 1] = v; mimg.data[i * 4 + 2] = v; mimg.data[i * 4 + 3] = 255;
  }
  mctx.putImageData(mimg, 0, 0);
  const big = document.createElement("canvas"); big.width = rw; big.height = rh;
  const bctx = big.getContext("2d")!;
  bctx.imageSmoothingEnabled = true; bctx.imageSmoothingQuality = "high";
  bctx.drawImage(mc, 0, 0, rw, rh);
  const soft = bctx.getImageData(0, 0, rw, rh).data;
  // 最终 alpha = min(模型原始软 alpha, 清理后遮罩)
  // 保留碎发的半透明细节（不丢发丝），被清理区域归零；仅压掉 alpha<25 的极弱丝
  for (let i = 0; i < rw * rh; i++) {
    const a = Math.min(px[i * 4 + 3], soft[i * 4]);
    px[i * 4 + 3] = a < 25 ? 0 : a;
  }
}

// 估计原背景色：取四边边缘带的每通道中位数
function estimateBg(px: Uint8ClampedArray, rw: number, rh: number): [number, number, number] {
  const samples: number[][] = [[], [], []];
  const band = Math.max(2, Math.round(Math.min(rw, rh) * 0.03));
  for (let y = 0; y < rh; y += 2)
    for (let x = 0; x < rw; x += 2) {
      if (x < band || x >= rw - band || y < band || y >= rh - band) {
        const i = (y * rw + x) * 4;
        samples[0].push(px[i]); samples[1].push(px[i+1]); samples[2].push(px[i+2]);
      }
    }
  const med = (arr: number[]) => { arr.sort((a, b) => a - b); return arr[arr.length >> 1]; };
  return [med(samples[0]), med(samples[1]), med(samples[2])];
}

// 反混色（un-premultiply）：半透明像素的颜色 = (观测色 - (1-a)·背景色) / a
// 还原碎发/边缘的真实颜色，去掉"罩了一层原背景色"的白纱感
function unmixBg(px: Uint8ClampedArray, rw: number, rh: number, bg: [number, number, number]) {
  for (let i = 0; i < rw * rh; i++) {
    const a = px[i * 4 + 3];
    if (a > 10 && a < 245) {
      const inv = 255 - a;
      for (let ch = 0; ch < 3; ch++) {
        const idx = i * 4 + ch;
        px[idx] = Math.max(0, Math.min(255, Math.round((px[idx] * 255 - inv * bg[ch]) / a)));
      }
    }
  }
}

// 颜色净化：边缘带像素的 RGB 从人物深内部逐层借色。
// 种子 = 完全不透明 且 颜色与原背景明显不同（白渣点颜色接近背景色 → 不当种子，会被借色修正）
function decontaminate(px: Uint8ClampedArray, rw: number, rh: number, bg: [number, number, number]) {
  const colorDist = (i: number) => Math.abs(px[i*4] - bg[0]) + Math.abs(px[i*4+1] - bg[1]) + Math.abs(px[i*4+2] - bg[2]);
  const interior = new Uint8Array(rw * rh);
  for (let y = 1; y < rh - 1; y++)
    for (let x = 1; x < rw - 1; x++) {
      const i = y * rw + x;
      if (px[i*4+3] === 255 && colorDist(i) > 50
          && px[(i-1)*4+3] === 255 && px[(i+1)*4+3] === 255
          && px[(i-rw)*4+3] === 255 && px[(i+rw)*4+3] === 255)
        interior[i] = 1;
    }
  for (let iter = 0; iter < 20; iter++) {  // 20 轮 ≈ 覆盖 20px 边缘带（发际碎发较长）
    let changed = 0;
    for (let y = 1; y < rh - 1; y++)
      for (let x = 1; x < rw - 1; x++) {
        const i = y * rw + x;
        if (interior[i]) continue;
        if (interior[i-1] || interior[i+1] || interior[i-rw] || interior[i+rw]) {
          const j = interior[i-1] ? i-1 : interior[i+1] ? i+1 : interior[i-rw] ? i-rw : i+rw;
          px[i*4] = px[j*4]; px[i*4+1] = px[j*4+1]; px[i*4+2] = px[j*4+2];
          interior[i] = 1; changed++;
        }
      }
    if (!changed) break;
  }
}
