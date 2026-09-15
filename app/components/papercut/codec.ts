export interface CutRegion {
  pts: Array<{ u: number; v: number }>;
}

export interface Artwork {
  folds: number;
  cuts: CutRegion[];
}

export const SHARE_QUERY = "d";
const QUANT = 1000;

const toBase64Url = (bytes: Uint8Array) => {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

const fromBase64Url = (str: string) => {
  const s = str.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(s + "=".repeat((4 - (s.length % 4)) % 4));
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
};

const q16 = (n: number) => Math.max(-32000, Math.min(32000, Math.round(n * QUANT)));

export async function encodeArt(folds: number, cuts: CutRegion[]): Promise<string> {
  const nums: number[] = [folds, cuts.length];
  for (const c of cuts) {
    nums.push(c.pts.length);
    for (const p of c.pts) nums.push(q16(p.u), q16(p.v));
  }
  const bytes = new Uint8Array(new Int16Array(nums).buffer);
  if (typeof CompressionStream !== "undefined") {
    try {
      const stream = new Blob([bytes])
        .stream()
        .pipeThrough(new CompressionStream("deflate-raw"));
      return "1" + toBase64Url(new Uint8Array(await new Response(stream).arrayBuffer()));
    } catch {}
  }
  return "0" + toBase64Url(bytes);
}

export async function decodeArt(raw: string): Promise<Artwork | null> {
  try {
    const flag = raw[0];
    let bytes = fromBase64Url(raw.slice(1));
    if (flag === "1") {
      const stream = new Blob([bytes])
        .stream()
        .pipeThrough(new DecompressionStream("deflate-raw"));
      bytes = new Uint8Array(await new Response(stream).arrayBuffer());
    }
    const i16 = new Int16Array(bytes.buffer, bytes.byteOffset, Math.floor(bytes.byteLength / 2));
    let i = 0;
    const folds = i16[i++];
    const count = i16[i++];
    if (folds !== 4 && folds !== 6 && folds !== 8) return null;
    if (!Number.isFinite(count) || count < 0 || count > 2000) return null;
    const cuts: CutRegion[] = [];
    for (let k = 0; k < count; k++) {
      const np = i16[i++];
      if (!Number.isFinite(np) || np < 3 || np > 20000 || i + np * 2 > i16.length) return null;
      const pts: Array<{ u: number; v: number }> = [];
      for (let j = 0; j < np; j++) pts.push({ u: i16[i++] / QUANT, v: i16[i++] / QUANT });
      cuts.push({ pts });
    }
    return { folds, cuts };
  } catch {
    return null;
  }
}
