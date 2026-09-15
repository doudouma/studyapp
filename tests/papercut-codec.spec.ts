import { describe, it, expect, vi, afterEach } from "vitest";
import { Blob as NodeBlob } from "node:buffer";
import {
  encodeArt,
  decodeArt,
  SHARE_QUERY,
  type CutRegion,
} from "~/components/papercut/codec";

const cut = (...pts: Array<[number, number]>): CutRegion => ({
  pts: pts.map(([u, v]) => ({ u, v })),
});

/** Build a raw (uncompressed, flag "0") payload from Int16 values. */
function rawPayload(nums: number[]): string {
  const bytes = new Uint8Array(new Int16Array(nums).buffer);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return "0" + btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("SHARE_QUERY", () => {
  it("is the URL param name", () => {
    expect(SHARE_QUERY).toBe("d");
  });
});

describe("encodeArt / decodeArt round-trip", () => {
  it("round-trips folds and cuts for every supported fold count", async () => {
    for (const folds of [4, 6, 8]) {
      const cuts = [cut([0, 0.5], [0.1, 0.5], [0.05, 0.7])];
      const decoded = await decodeArt(await encodeArt(folds, cuts));
      expect(decoded).not.toBeNull();
      expect(decoded!.folds).toBe(folds);
      expect(decoded!.cuts).toHaveLength(1);
      expect(decoded!.cuts[0].pts).toHaveLength(3);
      decoded!.cuts[0].pts.forEach((p: { u: number; v: number }, i: number) => {
        expect(p.u).toBeCloseTo(cuts[0].pts[i].u, 3);
        expect(p.v).toBeCloseTo(cuts[0].pts[i].v, 3);
      });
    }
  });

  it("round-trips an empty artwork", async () => {
    const decoded = await decodeArt(await encodeArt(6, []));
    expect(decoded).toEqual({ folds: 6, cuts: [] });
  });

  it("round-trips many cuts and many points", async () => {
    const cuts: CutRegion[] = [];
    for (let c = 0; c < 50; c++) {
      cuts.push(cut([0, 0.1], [0.2, 0.3], [0.4, 0.5], [0.6, 0.7]));
    }
    const decoded = await decodeArt(await encodeArt(8, cuts));
    expect(decoded!.cuts).toHaveLength(50);
    expect(decoded!.cuts.every((c: CutRegion) => c.pts.length === 4)).toBe(true);
  });

  it("supports negative and zero coordinates", async () => {
    const cuts = [cut([-1, 0], [0, -0.5], [-0.25, 1.05])];
    const decoded = await decodeArt(await encodeArt(4, cuts));
    expect(decoded!.cuts[0].pts[0].u).toBeCloseTo(-1, 3);
    expect(decoded!.cuts[0].pts[1].v).toBeCloseTo(-0.5, 3);
    expect(decoded!.cuts[0].pts[2].v).toBeCloseTo(1.05, 3);
  });

  it("quantizes coordinates to 3 decimals", async () => {
    const decoded = await decodeArt(await encodeArt(6, [cut([0.1234, 0.1236], [0.5, 0.5], [0.9, 0.9])]));
    expect(decoded!.cuts[0].pts[0].u).toBeCloseTo(0.123, 3);
    expect(decoded!.cuts[0].pts[0].v).toBeCloseTo(0.124, 3);
  });

  it("clamps extreme coordinates to the Int16-safe bound", async () => {
    const decoded = await decodeArt(await encodeArt(6, [cut([1000, -1000], [0, 0], [40, -40])]));
    expect(decoded!.cuts[0].pts[0].u).toBe(32);
    expect(decoded!.cuts[0].pts[0].v).toBe(-32);
    expect(decoded!.cuts[0].pts[2].u).toBe(32);
  });

  it("uses the compression flag when CompressionStream is available", async () => {
    vi.stubGlobal("Blob", NodeBlob);
    const enc = await encodeArt(6, [cut([0, 1], [1, 1], [0.5, 0.2])]);
    expect(enc[0]).toBe("1");
    expect(await decodeArt(enc)).not.toBeNull();
  });

  it("falls back to raw base64 when CompressionStream is unavailable", async () => {
    vi.stubGlobal("CompressionStream", undefined);
    const enc = await encodeArt(6, [cut([0, 1], [1, 1], [0.5, 0.2])]);
    expect(enc[0]).toBe("0");
    const decoded = await decodeArt(enc);
    expect(decoded!.folds).toBe(6);
    expect(decoded!.cuts[0].pts).toHaveLength(3);
  });

  it("decodes a compressed payload produced externally", async () => {
    if (typeof CompressionStream === "undefined") return;
    vi.stubGlobal("Blob", NodeBlob);
    const nums = [6, 1, 3, 0, 1000, 1000, 1000, 500, 200];
    const bytes = new Uint8Array(new Int16Array(nums).buffer);
    const stream = new Blob([bytes]).stream().pipeThrough(new CompressionStream("deflate-raw"));
    const packed = new Uint8Array(await new Response(stream).arrayBuffer());
    let bin = "";
    for (let i = 0; i < packed.length; i++) bin += String.fromCharCode(packed[i]);
    const payload = "1" + btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    const decoded = await decodeArt(payload);
    expect(decoded).toEqual({
      folds: 6,
      cuts: [{ pts: [{ u: 0, v: 1 }, { u: 1, v: 1 }, { u: 0.5, v: 0.2 }] }],
    });
  });
});

describe("decodeArt validation", () => {
  it("returns null for empty or missing payloads", async () => {
    expect(await decodeArt("")).toBeNull();
    expect(await decodeArt("0")).toBeNull();
  });

  it("returns null for invalid base64 instead of throwing", async () => {
    expect(await decodeArt("0!!!!")).toBeNull();
    expect(await decodeArt("0@@@bad@@@")).toBeNull();
  });

  it("returns null for an unsupported fold count", async () => {
    expect(await decodeArt(rawPayload([5, 0]))).toBeNull();
    expect(await decodeArt(rawPayload([7, 0]))).toBeNull();
    expect(await decodeArt(rawPayload([0, 0]))).toBeNull();
  });

  it("returns null for a negative or oversized cut count", async () => {
    expect(await decodeArt(rawPayload([6, -1]))).toBeNull();
    expect(await decodeArt(rawPayload([6, 2001]))).toBeNull();
  });

  it("returns null for cuts with fewer than 3 points", async () => {
    expect(await decodeArt(rawPayload([6, 1, 0]))).toBeNull();
    expect(await decodeArt(rawPayload([6, 1, 2, 1, 1, 2, 2]))).toBeNull();
  });

  it("returns null for an oversized point count", async () => {
    expect(await decodeArt(rawPayload([6, 1, 20001]))).toBeNull();
  });

  it("returns null for truncated point data", async () => {
    expect(await decodeArt(rawPayload([6, 1, 5, 1, 2]))).toBeNull();
    expect(await decodeArt(rawPayload([6, 2, 3, 0, 0, 0, 0, 0, 0]))).toBeNull();
  });

  it("accepts a valid raw payload with folds, cuts and points", async () => {
    const decoded = await decodeArt(rawPayload([8, 1, 3, 100, 200, -300, -400, 500, -600]));
    expect(decoded).toEqual({
      folds: 8,
      cuts: [
        {
          pts: [
            { u: 0.1, v: 0.2 },
            { u: -0.3, v: -0.4 },
            { u: 0.5, v: -0.6 },
          ],
        },
      ],
    });
  });

  it("never throws on arbitrary garbage strings", async () => {
    for (const s of ["x", "1", "9zzz", "0~~~~", "-", "   "]) {
      await expect(decodeArt(s)).resolves.toBeNull();
    }
  });
});
