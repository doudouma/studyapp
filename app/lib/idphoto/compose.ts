// 自动定位、合成绘制、坐标换算、头身比标尺。移植自 template/证件照工具.html L918-1062。
import { headRange, headTarget, type Box } from "./specs";

export interface Base {
  scale: number;
  x: number;
  y: number;
}

export interface HeadSrc {
  cx: number;
  crownY: number;
  chinY: number;
}

/**
 * 计算人物在画布上的基础摆放。
 * 有脸框：按目标头身比缩放、人脸水平居中、头顶留 7% 上边距；
 * 无脸框：cover 式居中。
 */
export function computeBase(o: {
  srcW: number;
  srcH: number;
  W: number;
  H: number;
  faceBox: Box | null;
  personTop: number | null;
  target: number;
}): { base: Base; headSrc: HeadSrc | null } {
  const cover = Math.max(o.W / o.srcW, o.H / o.srcH); // 铺满画布所需最小缩放
  if (!o.faceBox) {
    return {
      base: { scale: cover, x: (o.W - o.srcW * cover) / 2, y: (o.H - o.srcH * cover) / 2 },
      headSrc: null,
    };
  }
  const f = o.faceBox;
  // 头顶优先用抠图轮廓真实顶（须位于检测框中点以上，否则视为无效回退估算）
  let crownY = f.y - f.h * 0.6;
  if (o.personTop != null && o.personTop < f.y + f.h * 0.5) crownY = o.personTop;
  const chinY = f.y + f.h;
  const headH = Math.max(1, chinY - crownY);
  let scale = (o.H * o.target) / headH;
  const faceCx = f.x + f.w / 2;
  const needX = Math.max(
    o.W / (2 * Math.max(1, faceCx)),
    o.W / (2 * Math.max(1, o.srcW - faceCx)),
  );
  scale = Math.max(scale, cover, needX);
  let y = o.H * 0.07 - crownY * scale;
  y = Math.max(y, o.H - o.srcH * scale);
  y = Math.min(y, o.H * 0.15);
  const x = o.W / 2 - faceCx * scale;
  return { base: { scale, x, y }, headSrc: { cx: faceCx, crownY, chinY } };
}

interface ComposeGeom {
  srcW: number;
  srcH: number;
  W: number;
  H: number;
  base: Base;
  zoom: number; // 百分制，100 = 1x
  adjX: number; // -100..100
  adjY: number;
}

/** 把微调后的合成结果画到结果画布（背景填充由调用方负责） */
export function renderCompose(
  ctx: CanvasRenderingContext2D,
  o: ComposeGeom & { img: CanvasImageSource },
) {
  const sc = o.base.scale * (o.zoom / 100);
  const dx = (o.adjX / 100) * o.W * 0.5;
  const dy = (o.adjY / 100) * o.H * 0.5;
  const dw = o.srcW * sc;
  const dh = o.srcH * sc;
  const cx = o.base.x + o.srcW * o.base.scale * 0.5;
  const cy = o.base.y + o.srcH * o.base.scale * 0.5;
  ctx.drawImage(o.img, cx - dw / 2 + dx, cy - dh / 2 + dy, dw, dh);
}

/** 源图坐标 → 结果画布坐标（与 renderCompose 变换一致） */
export function srcToCanvas(sx: number, sy: number, o: ComposeGeom): [number, number] {
  const sc = o.base.scale * (o.zoom / 100);
  const dx = (o.adjX / 100) * o.W * 0.5;
  const dy = (o.adjY / 100) * o.H * 0.5;
  const cx = o.base.x + o.srcW * o.base.scale * 0.5;
  const cy = o.base.y + o.srcH * o.base.scale * 0.5;
  return [cx - (o.srcW * sc) / 2 + dx + sx * sc, cy - (o.srcH * sc) / 2 + dy + sy * sc];
}

/** 头高占画幅高度的比例 */
export function complianceRatio(o: { headSrc: HeadSrc; base: Base; zoom: number; H: number }): number {
  return ((o.headSrc.chinY - o.headSrc.crownY) * o.base.scale * (o.zoom / 100)) / o.H;
}

/**
 * 在 overlay 画布上画头身比参考线与占比标签。
 * label 为调用方已翻译好的文案（如「头占比 62%」）；仅预览层，不入导出图。
 */
export function drawRuler(
  ctx: CanvasRenderingContext2D,
  o: ComposeGeom & { headSrc: HeadSrc; lo: number; hi: number; label: string },
) {
  ctx.clearRect(0, 0, o.W, o.H);
  ctx.font = "bold 15px sans-serif";
  const ratio = complianceRatio({ headSrc: o.headSrc, base: o.base, zoom: o.zoom, H: o.H });
  const [, cyTop] = srcToCanvas(o.headSrc.cx, o.headSrc.crownY, o);
  const [, cyBot] = srcToCanvas(o.headSrc.cx, o.headSrc.chinY, o);
  const pass = ratio >= o.lo - 0.005 && ratio <= o.hi + 0.005;
  const color = pass ? "#10b981" : "#ef4444";
  const mx = o.W * 0.5;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.setLineDash([7, 5]);
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, cyTop); ctx.lineTo(o.W, cyTop); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, cyBot); ctx.lineTo(o.W, cyBot); ctx.stroke();
  ctx.setLineDash([]);
  ctx.beginPath(); ctx.moveTo(mx - 18, cyTop); ctx.lineTo(mx + 18, cyTop); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(mx - 18, cyBot); ctx.lineTo(mx + 18, cyBot); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(mx, cyTop + 6); ctx.lineTo(mx, cyBot - 6); ctx.stroke();
  const tw = ctx.measureText(o.label).width + 14;
  let ly = cyTop - 24;
  if (ly < 4) ly = cyBot + 8;
  ctx.fillStyle = color;
  ctx.fillRect(6, ly, tw, 22);
  ctx.fillStyle = "#fff";
  ctx.textBaseline = "middle";
  ctx.fillText(o.label, 13, ly + 11);
  ctx.restore();
}

// re-export 供 Workbench 统一取用
export { headRange, headTarget };
