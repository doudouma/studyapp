import { describe, it, expect, vi } from "vitest";
import {
  DPI, mm2px, SIZE_PRESETS, REGIONS, BG_COLORS, PAPERS, DIGITAL,
  currentSize, headRange, headTarget, type SizePreset,
} from "~/lib/idphoto/specs";
import {
  computeBase, complianceRatio, srcToCanvas,
} from "~/lib/idphoto/compose";
import { buildPrintLayout } from "~/lib/idphoto/exportImage";

// ===== specs.ts =====
describe("specs.ts", () => {
  it("DPI = 300", () => {
    expect(DPI).toBe(300);
  });

  it("mm2px converts correctly", () => {
    expect(mm2px(25.4)).toBe(300);
    expect(mm2px(0)).toBe(0);
    expect(mm2px(10)).toBe(118);
  });

  it("SIZE_PRESETS has presets for all regions", () => {
    const groups = new Set(SIZE_PRESETS.map((p: SizePreset) => p.group));
    expect(groups.has("cn")).toBe(true);
    expect(groups.has("uk")).toBe(true);
    expect(groups.has("other")).toBe(true);
  });

  it("SIZE_PRESETS length > 20", () => {
    expect(SIZE_PRESETS.length).toBeGreaterThan(20);
  });

  it("REGIONS contains all", () => {
    expect(REGIONS[0].value).toBe("all");
    expect(REGIONS.length).toBeGreaterThanOrEqual(10);
  });

  it("BG_COLORS has white", () => {
    expect(BG_COLORS[0].value).toBe("#FFFFFF");
  });

  it("PAPERS has A4", () => {
    expect(PAPERS.A4.wmm).toBe(210);
    expect(PAPERS.A4.hmm).toBe(297);
  });

  it("PAPERS has 4R", () => {
    expect(PAPERS["4R"].wmm).toBe(102);
    expect(PAPERS["4R"].hmm).toBe(152);
  });

  it("DIGITAL has DS160", () => {
    expect(DIGITAL.DS160.maxKB).toBe(240);
  });

  it("DIGITAL has all keys", () => {
    expect(DIGITAL.US_RENEW.maxKB).toBe(5120);
    expect(DIGITAL.UK.maxKB).toBe(10240);
    expect(DIGITAL.JP.maxKB).toBe(600);
    expect(DIGITAL.IN.maxKB).toBe(30);
    expect(DIGITAL.CA.maxKB).toBe(0);
  });

  it("currentSize returns preset size", () => {
    const s = currentSize(0, 0, 0);
    expect(s.key).toBe("oneInch");
    expect(s.w).toBe(295);
    expect(s.h).toBe(413);
  });

  it("currentSize for US passport", () => {
    const usIdx = SIZE_PRESETS.findIndex((p: SizePreset) => p.key === "us2x2");
    const s = currentSize(usIdx, 0, 0);
    expect(s.key).toBe("us2x2");
    expect(s.w).toBe(602);
    expect(s.h).toBe(602);
  });

  it("currentSize custom with values", () => {
    const customIdx = SIZE_PRESETS.findIndex((p: SizePreset) => p.key === "custom");
    const s = currentSize(customIdx, 600, 800);
    expect(s.key).toBe("custom");
    expect(s.w).toBe(600);
    expect(s.h).toBe(800);
    expect(s.wmm).toBeCloseTo((600 / 300) * 25.4);
  });

  it("currentSize custom defaults to 295x413", () => {
    const customIdx = SIZE_PRESETS.findIndex((p: SizePreset) => p.key === "custom");
    const s = currentSize(customIdx, 0, 0);
    expect(s.w).toBe(295);
    expect(s.h).toBe(413);
  });

  it("currentSize invalid index returns first", () => {
    const s = currentSize(999, 0, 0);
    expect(s.key).toBe("oneInch");
  });

  it("currentSize negative index returns first", () => {
    const s = currentSize(-1, 0, 0);
    expect(s.key).toBe("oneInch");
  });

  it("headRange with explicit min/max", () => {
    const r = headRange({ headMin: 25, headMax: 35, hmm: 51 });
    expect(r[0]).toBeCloseTo(25 / 51);
    expect(r[1]).toBeCloseTo(35 / 51);
  });

  it("headRange without min/max uses defaults (55%-72%)", () => {
    const r = headRange({ hmm: 50 });
    expect(r[0]).toBeCloseTo(0.55);
    expect(r[1]).toBeCloseTo(0.72);
  });

  it("headRange zero hmm returns [0,1]", () => {
    const r = headRange({ hmm: 0 });
    expect(r).toEqual([0, 1]);
  });

  it("headRange with only min set uses defaults", () => {
    const r = headRange({ headMin: 20, hmm: 50 });
    expect(r[0]).toBeCloseTo(0.55);
    expect(r[1]).toBeCloseTo(0.72);
  });

  it("headTarget is midpoint of range", () => {
    const t = headTarget({ headMin: 20, headMax: 40, hmm: 50 });
    expect(t).toBeCloseTo(0.6);
  });

  it("headTarget without min/max", () => {
    const t = headTarget({ hmm: 50 });
    expect(t).toBeCloseTo((0.55 + 0.72) / 2);
  });

  it("each preset has required fields", () => {
    for (const p of SIZE_PRESETS) {
      expect(p.key).toBeTruthy();
      expect(p.group).toBeTruthy();
      expect(p.flag).toBeTruthy();
    }
  });
});

// ===== compose.ts =====
describe("compose.ts", () => {
  it("computeBase without faceBox returns cover", () => {
    const { base, headSrc } = computeBase({
      srcW: 1000, srcH: 1500, W: 600, H: 800,
      faceBox: null, personTop: null, target: 0.65,
    });
    expect(headSrc).toBeNull();
    expect(base.scale).toBeGreaterThan(0);
    expect(base.x).toBeDefined();
    expect(base.y).toBeDefined();
  });

  it("computeBase with faceBox computes head", () => {
    const { base, headSrc } = computeBase({
      srcW: 1000, srcH: 1500, W: 600, H: 800,
      faceBox: { x: 400, y: 200, w: 200, h: 300 },
      personTop: 100, target: 0.65,
    });
    expect(headSrc).not.toBeNull();
    expect(headSrc!.cx).toBe(500);
    expect(headSrc!.crownY).toBe(100);
    expect(headSrc!.chinY).toBe(500);
    expect(base.scale).toBeGreaterThan(0);
  });

  it("computeBase faceBox without personTop uses estimate", () => {
    const { headSrc } = computeBase({
      srcW: 1000, srcH: 1500, W: 600, H: 800,
      faceBox: { x: 400, y: 200, w: 200, h: 300 },
      personTop: null, target: 0.65,
    });
    expect(headSrc).not.toBeNull();
    expect(headSrc!.crownY).toBe(200 - 300 * 0.6);
  });

  it("computeBase with personTop invalid uses estimate", () => {
    const { headSrc } = computeBase({
      srcW: 1000, srcH: 1500, W: 600, H: 800,
      faceBox: { x: 400, y: 200, w: 200, h: 300 },
      personTop: 500, target: 0.65,
    });
    expect(headSrc).not.toBeNull();
    expect(headSrc!.crownY).toBe(200 - 300 * 0.6);
  });

  it("complianceRatio computes correctly", () => {
    const r = complianceRatio({
      headSrc: { cx: 500, crownY: 100, chinY: 300 },
      base: { scale: 1, x: 0, y: 0 },
      zoom: 100,
      H: 800,
    });
    expect(r).toBeCloseTo(200 / 800);
  });

  it("complianceRatio with zoom 150%", () => {
    const r = complianceRatio({
      headSrc: { cx: 500, crownY: 100, chinY: 300 },
      base: { scale: 1, x: 0, y: 0 },
      zoom: 150,
      H: 800,
    });
    expect(r).toBeCloseTo((200 * 1.5) / 800);
  });

  it("complianceRatio with scale 2", () => {
    const r = complianceRatio({
      headSrc: { cx: 500, crownY: 100, chinY: 300 },
      base: { scale: 2, x: 0, y: 0 },
      zoom: 100,
      H: 800,
    });
    expect(r).toBeCloseTo((200 * 2) / 800);
  });

  it("srcToCanvas transforms (0,0)", () => {
    const [cx, cy] = srcToCanvas(0, 0, {
      srcW: 100, srcH: 100, W: 600, H: 800,
      base: { scale: 1, x: 0, y: 0 }, zoom: 100, adjX: 0, adjY: 0,
    });
    expect(cx).toBe(0);
    expect(cy).toBe(0);
  });

  it("srcToCanvas with zoom", () => {
    const [cx, cy] = srcToCanvas(50, 50, {
      srcW: 100, srcH: 100, W: 600, H: 800,
      base: { scale: 1, x: 0, y: 0 }, zoom: 150, adjX: 0, adjY: 0,
    });
    expect(cx).toBeGreaterThan(0);
    expect(cy).toBeGreaterThan(0);
  });

  it("srcToCanvas with adjX/Y", () => {
    const [cx1] = srcToCanvas(50, 50, {
      srcW: 100, srcH: 100, W: 600, H: 800,
      base: { scale: 1, x: 0, y: 0 }, zoom: 100, adjX: 50, adjY: 0,
    });
    const [cx2] = srcToCanvas(50, 50, {
      srcW: 100, srcH: 100, W: 600, H: 800,
      base: { scale: 1, x: 0, y: 0 }, zoom: 100, adjX: 0, adjY: 0,
    });
    expect(cx1).toBeGreaterThan(cx2);
  });
});

// ===== exportImage.ts =====
describe("exportImage.ts", () => {
  it("buildPrintLayout A4 with 2x2 photos", () => {
    const l = buildPrintLayout(210, 297, 51, 51);
    expect(l).not.toBeNull();
    expect(l!.cols).toBeGreaterThan(0);
    expect(l!.rows).toBeGreaterThan(0);
    expect(l!.total).toBe(l!.cols * l!.rows);
    expect(l!.paperW).toBeGreaterThan(0);
    expect(l!.paperH).toBeGreaterThan(0);
    expect(l!.photoW).toBeGreaterThan(0);
    expect(l!.photoH).toBeGreaterThan(0);
  });

  it("buildPrintLayout 4R with 2x2 photos", () => {
    const l = buildPrintLayout(102, 152, 51, 51);
    expect(l).not.toBeNull();
    expect(l!.total).toBeGreaterThan(0);
  });

  it("buildPrintLayout returns null if too small", () => {
    const l = buildPrintLayout(10, 10, 100, 100);
    expect(l).toBeNull();
  });

  it("buildPrintLayout calculates margins", () => {
    const l = buildPrintLayout(210, 297, 51, 51);
    expect(l).not.toBeNull();
    expect(l!.startX).toBeGreaterThanOrEqual(0);
    expect(l!.startY).toBeGreaterThanOrEqual(0);
  });

  it("buildPrintLayout landscape paper", () => {
    const l = buildPrintLayout(297, 210, 51, 51);
    expect(l).not.toBeNull();
    expect(l!.total).toBeGreaterThan(0);
  });
});
