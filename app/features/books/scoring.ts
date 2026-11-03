import type { Book } from "./data";

export function bayes(b: Book, m = 50, C = 4.3): number {
  return ((b.rating || 0) * (b.reviews || 0) + C * m) / ((b.reviews || 0) + m);
}

export function demand(b: Book): number {
  return Math.log10((b.reviews || 0) + 10) / Math.log10(5010);
}

export function quality(b: Book): number {
  return Math.max(0, Math.min(1, (bayes(b) - 3.8) / 1.2));
}

export function titleQuality(b: Book): number {
  const title = b.title || "";
  let q = 1;
  if (title.length > 70) q -= Math.min(0.35, (title.length - 70) / 300);
  if (/\b(complete|guide|master|essential|proven|step)\b/i.test(title)) q += 0.08;
  if (/[A-Z]{4,}/.test(title)) q -= 0.1;
  return Math.max(0, Math.min(1, q));
}

export function score(b: Book): number {
  return 0.5 * demand(b) + 0.3 * quality(b) + 0.2 * titleQuality(b);
}

export function risingScore(b: Book): number {
  return (
    (quality(b) * 0.7 + (1 - Math.min(1, (b.reviews || 0) / 800)) * 0.3) *
    (b.reviews > 15 ? 1 : 0.6)
  );
}

export function seeded(day: number): () => number {
  let seed = day % 2147483647;
  return () => {
    seed = (seed * 48271) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

export function shuffle<T>(items: readonly T[], day: number): T[] {
  const result = items.slice();
  const random = seeded(day);
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
