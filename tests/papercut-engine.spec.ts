import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { makePaper, drawFlower } from "~/components/papercut/PaperCutApp";
import type { CutRegion } from "~/components/papercut/codec";

const cut = (...pts: Array<[number, number]>): CutRegion => ({
  pts: pts.map(([u, v]) => ({ u, v })),
});

interface FakeGradient {
  addColorStop: ReturnType<typeof vi.fn>;
}

function makeCtx() {
  const gradients: FakeGradient[] = [];
  const ctx: Record<string, any> = {};
  const methods = [
    "setTransform",
    "clearRect",
    "beginPath",
    "moveTo",
    "lineTo",
    "closePath",
    "arc",
    "quadraticCurveTo",
    "fill",
    "stroke",
    "translate",
    "rotate",
    "scale",
    "save",
    "restore",
    "drawImage",
    "clip",
    "rect",
    "roundRect",
  ];
  for (const m of methods) ctx[m] = vi.fn();
  const gradient = () => {
    const g: FakeGradient = { addColorStop: vi.fn() };
    gradients.push(g);
    return g;
  };
  ctx.createRadialGradient = vi.fn(gradient);
  ctx.createLinearGradient = vi.fn(gradient);
  ctx.canvas = {};
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 1;
  ctx.fillStyle = "#000";
  return { ctx: ctx as unknown as CanvasRenderingContext2D, raw: ctx, gradients };
}

let fake: ReturnType<typeof makeCtx>;

beforeEach(() => {
  fake = makeCtx();
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(fake.ctx);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("makePaper", () => {
  it("computes geometry from folds, R and dpr", () => {
    const R = 100;
    const dpr = 2;
    const P = makePaper(6, [], R, dpr);
    const w = 2 * R * Math.sin(Math.PI / 12) + 8;
    const h = R + 8;

    expect(P.folds).toBe(6);
    expect(P.th).toBeCloseTo(Math.PI / 6);
    expect(P.R).toBe(R);
    expect(P.dpr).toBe(dpr);
    expect(P.w).toBeCloseTo(w);
    expect(P.h).toBeCloseTo(h);
    expect(P.ax).toBeCloseTo(w / 2);
    expect(P.ay).toBeCloseTo(h - 4);
    expect(P.c.width).toBe(Math.max(2, Math.round(w * dpr)));
    expect(P.c.height).toBe(Math.max(2, Math.round(h * dpr)));
  });

  it("uses the fold angle for each supported fold count", () => {
    for (const folds of [4, 6, 8]) {
      expect(makePaper(folds, [], 100, 1).th).toBeCloseTo(Math.PI / folds);
    }
  });

  it("paints the red wedge with a radial gradient", () => {
    makePaper(6, [], 100, 2);
    expect(fake.raw.setTransform).toHaveBeenCalledWith(2, 0, 0, 2, 0, 0);
    expect(fake.raw.createRadialGradient).toHaveBeenCalledTimes(1);
    expect(fake.gradients[0].addColorStop).toHaveBeenCalledTimes(3);
    expect(fake.raw.arc).toHaveBeenCalled();
    expect(fake.raw.fill).toHaveBeenCalledTimes(1);
    expect(fake.raw.globalCompositeOperation).toBe("destination-out");
  });

  it("cuts one region per cut", () => {
    makePaper(6, [cut([0, 0.5], [0.1, 0.5], [0.05, 0.7])], 100, 2);
    // one fill for the wedge + one per cut
    expect(fake.raw.fill).toHaveBeenCalledTimes(2);
    expect(fake.raw.quadraticCurveTo).toHaveBeenCalled();
  });

  it("draws a dot for cuts with fewer than 3 points", () => {
    makePaper(6, [cut([0, 0.5], [0.1, 0.5])], 100, 2);
    expect(fake.raw.fill).toHaveBeenCalledTimes(2);
    expect(fake.raw.arc).toHaveBeenCalled();
  });
});

describe("drawFlower", () => {
  it("draws 2*folds slots at full progress (3 passes each)", () => {
    const P = makePaper(6, [], 100, 1);
    const target = makeCtx();
    drawFlower(target.ctx, 200, P, 1, 0, 1);
    expect(P.folds * 2 * 3).toBe(36);
    expect(target.raw.drawImage).toHaveBeenCalledTimes(36);
    expect(target.raw.clearRect).toHaveBeenCalledWith(0, 0, 200, 200);
  });

  it("draws nothing at progress 0", () => {
    const P = makePaper(6, [], 100, 1);
    const target = makeCtx();
    drawFlower(target.ctx, 200, P, 0, 0, 1);
    expect(target.raw.drawImage).not.toHaveBeenCalled();
  });

  it("draws half the slots at progress 0.5", () => {
    const P = makePaper(6, [], 100, 1);
    const target = makeCtx();
    drawFlower(target.ctx, 200, P, 0.5, 0, 1);
    expect(target.raw.drawImage).toHaveBeenCalledTimes(6 * 3);
  });

  it("scales drawImage passes with the fold count", () => {
    for (const folds of [4, 6, 8]) {
      const P = makePaper(folds, [], 100, 1);
      const target = makeCtx();
      drawFlower(target.ctx, 300, P, 1, 0, 1);
      expect(target.raw.drawImage).toHaveBeenCalledTimes(folds * 2 * 3);
    }
  });

  it("rotates once per slot", () => {
    const P = makePaper(6, [], 100, 1);
    const target = makeCtx();
    drawFlower(target.ctx, 200, P, 1, 0, 1);
    // one initial rotate for the whole flower plus one per slot
    expect(target.raw.rotate).toHaveBeenCalledTimes(1 + P.folds * 2);
  });
});
