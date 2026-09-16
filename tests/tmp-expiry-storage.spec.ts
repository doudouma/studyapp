import { describe, it, expect, vi, afterEach } from "vitest";
import {
  cleanupAnonymousUploads,
  deletePageObjects,
  deleteTmpByBucketId,
  getMimeType,
  getTmpExpiryMs,
  isExpiredByUploaded,
  putHtml,
  TMP_EXPIRY_MS,
} from "../server/features/pages/pages.storage";

const DAY = 24 * 60 * 60 * 1000;
const daysAgo = (n: number) => new Date(Date.now() - n * DAY);

interface ObjEntry {
  key: string;
  body?: string;
  uploaded?: Date;
}

/**
 * In-memory R2 bucket with controllable `uploaded` timestamps and optional
 * pagination (`pageSize`) so the cursor loops in the storage layer are covered.
 */
class MemoryBucket {
  store = new Map<string, { key: string; body: string; uploaded?: Date }>();
  pageSize: number;

  constructor(entries: ObjEntry[] = [], pageSize = Number.POSITIVE_INFINITY) {
    this.pageSize = pageSize;
    for (const e of entries) {
      this.store.set(e.key, { key: e.key, body: e.body ?? "x", uploaded: e.uploaded });
    }
  }

  async put(key: string, body: unknown) {
    this.store.set(key, {
      key,
      body: typeof body === "string" ? body : "[bytes]",
      uploaded: new Date(),
    });
  }

  async list(opts: { prefix?: string; cursor?: string } = {}) {
    const prefix = opts.prefix ?? "";
    const all = [...this.store.values()]
      .filter((o) => o.key.startsWith(prefix))
      .sort((a, b) => (a.key < b.key ? -1 : 1));
    const found = opts.cursor ? all.findIndex((o) => o.key > opts.cursor!) : 0;
    const start = found < 0 ? all.length : found;
    const end = Math.min(start + this.pageSize, all.length);
    const objects = all.slice(start, end).map((o) => ({ key: o.key, uploaded: o.uploaded }));
    const truncated = end < all.length;
    return {
      objects,
      truncated,
      cursor: truncated ? objects[objects.length - 1]?.key : undefined,
    };
  }

  async delete(keys: string | string[]) {
    for (const k of Array.isArray(keys) ? keys : [keys]) this.store.delete(k);
  }

  async get(key: string) {
    const o = this.store.get(key);
    if (!o) return null;
    return {
      key: o.key,
      uploaded: o.uploaded,
      text: async () => o.body,
      arrayBuffer: async () => new TextEncoder().encode(o.body).buffer,
      body: null,
    };
  }
}

const asBucket = (b: MemoryBucket) => b as unknown as R2Bucket;

afterEach(() => {
  vi.useRealTimers();
});

describe("getMimeType", () => {
  it("maps every known extension and falls back to octet-stream", () => {
    const cases: Array<[string, string]> = [
      ["a.html", "text/html; charset=utf-8"],
      ["a.htm", "text/html; charset=utf-8"],
      ["a.json", "application/json; charset=utf-8"],
      ["a.js", "application/javascript; charset=utf-8"],
      ["a.css", "text/css; charset=utf-8"],
      ["a.png", "image/png"],
      ["a.jpg", "image/jpeg"],
      ["a.jpeg", "image/jpeg"],
      ["a.gif", "image/gif"],
      ["a.svg", "image/svg+xml"],
      ["a.webp", "image/webp"],
      ["a.woff2", "font/woff2"],
      ["a.woff", "font/woff"],
      ["a.ttf", "font/ttf"],
      ["a.mp3", "audio/mpeg"],
      ["a.wav", "audio/wav"],
      ["a.mp4", "video/mp4"],
      ["a.pdf", "application/pdf"],
      ["a.unknown", "application/octet-stream"],
    ];
    for (const [name, mime] of cases) {
      expect(getMimeType(name)).toBe(mime);
    }
  });
});

describe("getTmpExpiryMs", () => {
  it("accepts numbers and numeric strings", () => {
    expect(getTmpExpiryMs({ TMP_EXPIRY_MS: 5000 })).toBe(5000);
    expect(getTmpExpiryMs({ TMP_EXPIRY_MS: "10000" })).toBe(10000);
  });

  it("falls back to 7 days for empty / invalid / non-positive values", () => {
    expect(getTmpExpiryMs({ TMP_EXPIRY_MS: "" })).toBe(TMP_EXPIRY_MS);
    expect(getTmpExpiryMs({ TMP_EXPIRY_MS: "abc" })).toBe(TMP_EXPIRY_MS);
    expect(getTmpExpiryMs({ TMP_EXPIRY_MS: "0" })).toBe(TMP_EXPIRY_MS);
    expect(getTmpExpiryMs({ TMP_EXPIRY_MS: 0 })).toBe(TMP_EXPIRY_MS);
    expect(getTmpExpiryMs({ TMP_EXPIRY_MS: -100 })).toBe(TMP_EXPIRY_MS);
    expect(getTmpExpiryMs({ TMP_EXPIRY_MS: undefined })).toBe(TMP_EXPIRY_MS);
    expect(getTmpExpiryMs({})).toBe(TMP_EXPIRY_MS);
    expect(getTmpExpiryMs()).toBe(TMP_EXPIRY_MS);
  });
});

describe("isExpiredByUploaded", () => {
  it("treats a missing uploaded time as expired", () => {
    expect(isExpiredByUploaded(undefined)).toBe(true);
  });

  it("uses the 7-day default when no expiry is given", () => {
    expect(isExpiredByUploaded(daysAgo(6))).toBe(false);
    expect(isExpiredByUploaded(daysAgo(8))).toBe(true);
  });

  it("honours a custom expiry and its exact boundary", () => {
    const t0 = new Date("2026-01-01T00:00:00Z");
    vi.useFakeTimers();
    vi.setSystemTime(t0);
    expect(isExpiredByUploaded(new Date(t0.getTime() - 9_000), 10_000)).toBe(false);
    expect(isExpiredByUploaded(new Date(t0.getTime() - 10_000), 10_000)).toBe(false);
    expect(isExpiredByUploaded(new Date(t0.getTime() - 10_001), 10_000)).toBe(true);
  });
});

describe("putHtml", () => {
  it("writes the html body", async () => {
    const bucket = new MemoryBucket();
    await putHtml(asBucket(bucket), "abc1234.html", "<h1>hi</h1>");
    expect(bucket.store.get("abc1234.html")?.body).toBe("<h1>hi</h1>");
  });
});

describe("deletePageObjects", () => {
  it("removes html, thumbnail and all page assets", async () => {
    const bucket = new MemoryBucket([
      { key: "abc1234.html" },
      { key: "thumbnails/abc1234.webp" },
      { key: "abc1234/index.html" },
      { key: "abc1234/app.js" },
      { key: "keepme.html" },
    ]);
    await deletePageObjects(asBucket(bucket), "abc1234");
    expect(bucket.store.has("abc1234.html")).toBe(false);
    expect(bucket.store.has("thumbnails/abc1234.webp")).toBe(false);
    expect(bucket.store.has("abc1234/index.html")).toBe(false);
    expect(bucket.store.has("abc1234/app.js")).toBe(false);
    expect(bucket.store.has("keepme.html")).toBe(true);
  });

  it("iterates every page of assets via the cursor", async () => {
    const bucket = new MemoryBucket(
      [
        { key: "abc1234/a.js" },
        { key: "abc1234/b.js" },
        { key: "abc1234/c.js" },
      ],
      1
    );
    await deletePageObjects(asBucket(bucket), "abc1234");
    expect(bucket.store.size).toBe(0);
  });

  it("is a no-op when the page has no assets", async () => {
    const bucket = new MemoryBucket([{ key: "abc1234.html" }]);
    await deletePageObjects(asBucket(bucket), "abc1234");
    expect(bucket.store.has("abc1234.html")).toBe(false);
    expect(bucket.store.size).toBe(0);
  });
});

describe("cleanupAnonymousUploads", () => {
  it("deletes expired tmp objects and keeps fresh / non-tmp ones (default expiry)", async () => {
    const bucket = new MemoryBucket([
      { key: "tmp/aaaaaaa.html", uploaded: daysAgo(10) },
      { key: "tmp/bbbbbbb.html", uploaded: daysAgo(1) },
      { key: "keepme.html", uploaded: daysAgo(60) },
    ]);
    expect(await cleanupAnonymousUploads(asBucket(bucket))).toBe(1);
    expect(bucket.store.has("tmp/aaaaaaa.html")).toBe(false);
    expect(bucket.store.has("tmp/bbbbbbb.html")).toBe(true);
    expect(bucket.store.has("keepme.html")).toBe(true);
  });

  it("returns 0 and deletes nothing when no tmp object is expired", async () => {
    const bucket = new MemoryBucket([
      { key: "tmp/bbbbbbb.html", uploaded: daysAgo(1) },
      { key: "keepme.html", uploaded: daysAgo(99) },
    ]);
    expect(await cleanupAnonymousUploads(asBucket(bucket))).toBe(0);
    expect(bucket.store.size).toBe(2);
  });

  it("honours a custom expiry window", async () => {
    const t0 = new Date("2026-01-01T00:00:00Z");
    vi.useFakeTimers();
    vi.setSystemTime(t0);
    const bucket = new MemoryBucket([
      { key: "tmp/aaaaaaa.html", uploaded: new Date(t0.getTime() - 9_000) },
      { key: "tmp/bbbbbbb.html", uploaded: new Date(t0.getTime() - 11_000) },
    ]);
    expect(await cleanupAnonymousUploads(asBucket(bucket), 10_000)).toBe(1);
    expect(bucket.store.has("tmp/bbbbbbb.html")).toBe(false);
    expect(bucket.store.has("tmp/aaaaaaa.html")).toBe(true);
  });

  it("walks all pages when the listing is truncated", async () => {
    const bucket = new MemoryBucket(
      [
        { key: "tmp/a1.html", uploaded: daysAgo(9) },
        { key: "tmp/a2.html", uploaded: daysAgo(9) },
        { key: "tmp/a3.html", uploaded: daysAgo(9) },
      ],
      2
    );
    expect(await cleanupAnonymousUploads(asBucket(bucket))).toBe(3);
    expect(bucket.store.size).toBe(0);
  });
});

describe("deleteTmpByBucketId", () => {
  it("deletes both tmp/{id}.html and tmp/{id}/... but not look-alike keys", async () => {
    const bucket = new MemoryBucket([
      { key: "tmp/aaaaaaa.html" },
      { key: "tmp/aaaaaaa/index.html" },
      { key: "tmp/aaaaaaa/app.js" },
      { key: "tmp/aaaaaaab.html" }, // shares prefix but belongs to another id
      { key: "tmp/otherid.html" },
    ]);
    await deleteTmpByBucketId(asBucket(bucket), "aaaaaaa");
    expect(bucket.store.has("tmp/aaaaaaa.html")).toBe(false);
    expect(bucket.store.has("tmp/aaaaaaa/index.html")).toBe(false);
    expect(bucket.store.has("tmp/aaaaaaa/app.js")).toBe(false);
    expect(bucket.store.has("tmp/aaaaaaab.html")).toBe(true);
    expect(bucket.store.has("tmp/otherid.html")).toBe(true);
  });

  it("is a no-op when nothing matches", async () => {
    const bucket = new MemoryBucket([{ key: "tmp/bbbbbbb.html" }]);
    await deleteTmpByBucketId(asBucket(bucket), "aaaaaaa");
    expect(bucket.store.has("tmp/bbbbbbb.html")).toBe(true);
  });

  it("walks all pages when the listing is truncated", async () => {
    const bucket = new MemoryBucket(
      [
        { key: "tmp/aaaaaaa.html" },
        { key: "tmp/aaaaaaa/a.js" },
        { key: "tmp/aaaaaaa/b.js" },
      ],
      1
    );
    await deleteTmpByBucketId(asBucket(bucket), "aaaaaaa");
    expect(bucket.store.size).toBe(0);
  });
});
