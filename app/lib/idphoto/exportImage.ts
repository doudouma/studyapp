// 导出压缩与相纸排版网格。移植自 template/证件照工具.html L1080-1186。
import { DPI, mm2px } from "./specs";

/** 按质量递减搜索把 canvas 压到 maxKB 以内（PNG 或不限时一次导出） */
export function canvasToBlobLimit(
  canvas: HTMLCanvasElement,
  format: "jpeg" | "png",
  maxKB: number,
): Promise<{ blob: Blob; note: string }> {
  return new Promise((resolve) => {
    const mime = format === "png" ? "image/png" : "image/jpeg";
    if (format === "png" || !maxKB || maxKB <= 0) {
      canvas.toBlob((b) => resolve({ blob: b!, note: "" }), mime, 0.95);
      return;
    }
    let q = 0.92;
    const tryQ = () => {
      canvas.toBlob(
        (b) => {
          const kb = b!.size / 1024;
          if (kb <= maxKB || q <= 0.1) {
            resolve({
              blob: b!,
              note: kb > maxKB ? `(${Math.round(kb)}KB)` : `(${Math.round(q * 100)}%, ${Math.round(kb)}KB)`,
            });
          } else {
            q -= 0.08;
            tryQ();
          }
        },
        mime,
        q,
      );
    };
    tryQ();
  });
}

export function downloadBlob(blob: Blob, filename: string) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}

export interface PrintLayout {
  cols: number;
  rows: number;
  total: number;
  paperW: number;
  paperH: number;
  photoW: number;
  photoH: number;
  startX: number;
  startY: number;
}

const GAP_MM = 2;
const MARGIN_MM = 3;

/** 计算 n 列 × m 行排版；放不下返回 null */
export function buildPrintLayout(paperWmm: number, paperHmm: number, fwmm: number, fhmm: number): PrintLayout | null {
  const paperW = mm2px(paperWmm);
  const paperH = mm2px(paperHmm);
  const photoW = mm2px(fwmm);
  const photoH = mm2px(fhmm);
  const gap = mm2px(GAP_MM);
  const margin = mm2px(MARGIN_MM);
  const cols = Math.floor((paperW - margin * 2 + gap) / (photoW + gap));
  const rows = Math.floor((paperH - margin * 2 + gap) / (photoH + gap));
  if (cols < 1 || rows < 1) return null;
  const usedW = cols * photoW + (cols - 1) * gap;
  const usedH = rows * photoH + (rows - 1) * gap;
  return {
    cols,
    rows,
    total: cols * rows,
    paperW,
    paperH,
    photoW,
    photoH,
    startX: (paperW - usedW) / 2,
    startY: (paperH - usedH) / 2,
  };
}

/** 把结果照片平铺到排版画布（300DPI），带裁剪参考线 */
export function drawPrintLayout(canvas: HTMLCanvasElement, src: HTMLCanvasElement, layout: PrintLayout, rotatePhoto: boolean) {
  canvas.width = layout.paperW;
  canvas.height = layout.paperH;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, layout.paperW, layout.paperH);
  for (let r = 0; r < layout.rows; r++) {
    for (let c = 0; c < layout.cols; c++) {
      const px = layout.startX + c * (layout.photoW + mm2px(GAP_MM));
      const py = layout.startY + r * (layout.photoH + mm2px(GAP_MM));
      if (rotatePhoto) {
        ctx.save();
        ctx.translate(px + layout.photoW / 2, py + layout.photoH / 2);
        ctx.rotate(Math.PI / 2);
        ctx.drawImage(src, -layout.photoH / 2, -layout.photoW / 2, layout.photoH, layout.photoW);
        ctx.restore();
      } else {
        ctx.drawImage(src, px, py, layout.photoW, layout.photoH);
      }
      ctx.strokeStyle = "#CCCCCC";
      ctx.lineWidth = 2;
      ctx.strokeRect(px, py, layout.photoW, layout.photoH);
    }
  }
}

export { DPI };
