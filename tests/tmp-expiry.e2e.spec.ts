import { describe, it, expect, vi, afterEach } from "vitest";
import { Hono } from "hono";
import { pagesRoutes } from "../server/features/pages/pages.routes";
import { adminRoutes } from "../server/features/admin/admin.routes";
import {
  cleanupAnonymousUploads,
  getTmpExpiryMs,
  isExpiredByUploaded,
  TMP_EXPIRY_MS,
} from "../server/features/pages/pages.storage";
import type { AppEnv } from "../server/types";
import { scheduled } from "../app/server";

const DAY = 24 * 60 * 60 * 1000;
const daysAgo = (n: number) => new Date(Date.now() - n * DAY);

interface ObjEntry {
  key: string;
  body?: string;
  uploaded?: Date;
}

/** In-memory R2 bucket with a controllable `uploaded` timestamp per object. */
class MemoryBucket {
  store = new Map<string, { key: string; body: string; uploaded?: Date }>();

  constructor(entries: ObjEntry[] = []) {
    for (const e of entries) {
      this.store.set(e.key, {
        key: e.key,
        body: e.body ?? "<html><body><h1>hi</h1></body></html>",
        uploaded: e.uploaded,
      });
    }
  }

  async list(opts: { prefix?: string; cursor?: string } = {}) {
    const prefix = opts.prefix ?? "";
    const objects = [...this.store.values()]
      .filter((o) => o.key.startsWith(prefix))
      .sort((a, b) => (a.key < b.key ? -1 : 1))
      .map((o) => ({ key: o.key, uploaded: o.uploaded }));
    return { objects, truncated: false, cursor: undefined };
  }

  async delete(keys: string | string[]) {
    for (const k of Array.isArray(keys) ? keys : [keys]) this.store.delete(k);
  }

  async get(key: string) {
    const o = this.store.get(key);
    if (!o) return null;
    const bytes = new TextEncoder().encode(o.body);
    return {
      key: o.key,
      uploaded: o.uploaded,
      size: bytes.length,
      text: async () => o.body,
      arrayBuffer: async () => bytes.buffer,
      body: null,
      httpMetadata: {},
      customMetadata: {},
    };
  }
}

const asBucket = (b: MemoryBucket) => b as unknown as R2Bucket;

const ANON: AppEnv["Variables"]["user"] = null;
const ADMIN: AppEnv["Variables"]["user"] = {
  id: "admin-1",
  name: "Admin",
  email: "admin@example.com",
  role: "admin",
};

function makeApp(user: AppEnv["Variables"]["user"]) {
  const app = new Hono<AppEnv>();
  app.use("*", async (c, next) => {
    c.set("user", user);
    c.set("session", null);
    await next();
  });
  app.route("/", pagesRoutes);
  app.route("/", adminRoutes);
  return app;
}

const ID = {
  expiredFlat: "aaaaaaa",
  freshFlat: "bbbbbbb",
  expiredZip: "ccccccc",
  userPage: "ddddddd",
};

describe("匿名 tmp 7 天到期自动删除 (e2e)", () => {
  describe("惰性清理（访问过期页面时）", () => {
    it("过期的 tmp 单文件 HTML → 404 且对象被删除", async () => {
      const bucket = new MemoryBucket([
        { key: `tmp/${ID.expiredFlat}.html`, uploaded: daysAgo(8) },
      ]);
      const app = makeApp(ANON);

      const res = await app.request(
        `/p/${ID.expiredFlat}`,
        undefined,
        { BUCKET: asBucket(bucket) }
      );

      expect(res.status).toBe(404);
      expect(bucket.store.has(`tmp/${ID.expiredFlat}.html`)).toBe(false);
    });

    it("过期的 tmp ZIP 入口 → 404 且整目录被删除", async () => {
      const bucket = new MemoryBucket([
        { key: `tmp/${ID.expiredZip}/index.html`, uploaded: daysAgo(9) },
        { key: `tmp/${ID.expiredZip}/main.js`, uploaded: daysAgo(9), body: "console.log(1)" },
      ]);
      const app = makeApp(ANON);

      const res = await app.request(
        `/p/${ID.expiredZip}`,
        undefined,
        { BUCKET: asBucket(bucket) }
      );

      expect(res.status).toBe(404);
      expect(bucket.store.has(`tmp/${ID.expiredZip}/index.html`)).toBe(false);
      expect(bucket.store.has(`tmp/${ID.expiredZip}/main.js`)).toBe(false);
    });

    it("过期的 tmp 资产文件 → 404 且整目录被删除", async () => {
      const bucket = new MemoryBucket([
        { key: `tmp/${ID.expiredZip}/index.html`, uploaded: daysAgo(8) },
        { key: `tmp/${ID.expiredZip}/style.css`, uploaded: daysAgo(8), body: "body{}" },
      ]);
      const app = makeApp(ANON);

      const res = await app.request(
        `/p/${ID.expiredZip}/style.css`,
        undefined,
        { BUCKET: asBucket(bucket) }
      );

      expect(res.status).toBe(404);
      expect(bucket.store.size).toBe(0);
    });

    it("未过期（6 天）的 tmp 文件可正常访问", async () => {
      const bucket = new MemoryBucket([
        { key: `tmp/${ID.freshFlat}.html`, uploaded: daysAgo(6) },
      ]);
      const app = makeApp(ANON);

      const res = await app.request(
        `/p/${ID.freshFlat}`,
        undefined,
        { BUCKET: asBucket(bucket) }
      );

      expect(res.status).toBe(200);
      expect(bucket.store.has(`tmp/${ID.freshFlat}.html`)).toBe(true);
    });

    it("非 tmp 的用户页面不受过期清理影响", async () => {
      const bucket = new MemoryBucket([
        { key: `${ID.userPage}.html`, uploaded: daysAgo(30) },
      ]);
      const app = makeApp(ANON);

      const res = await app.request(
        `/p/${ID.userPage}`,
        undefined,
        { BUCKET: asBucket(bucket) }
      );

      expect(res.status).toBe(200);
      expect(bucket.store.has(`${ID.userPage}.html`)).toBe(true);
    });
  });

  describe("手动清理端点 POST /api/admin/cleanup-tmp", () => {
    const seed = () =>
      new MemoryBucket([
        { key: `tmp/${ID.expiredFlat}.html`, uploaded: daysAgo(8) },
        { key: `tmp/${ID.expiredZip}/index.html`, uploaded: daysAgo(8) },
        { key: `tmp/${ID.expiredZip}/main.js`, uploaded: daysAgo(8) },
        { key: `tmp/${ID.freshFlat}.html`, uploaded: daysAgo(6) },
        { key: `${ID.userPage}.html`, uploaded: daysAgo(30) },
      ]);

    it("仅删除过期的 tmp 文件并返回删除数量", async () => {
      const bucket = seed();
      const app = makeApp(ADMIN);

      const res = await app.request(
        "/api/admin/cleanup-tmp",
        { method: "POST" },
        { BUCKET: asBucket(bucket) }
      );

      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ success: true, deleted: 3 });
      expect(bucket.store.has(`tmp/${ID.expiredFlat}.html`)).toBe(false);
      expect(bucket.store.has(`tmp/${ID.expiredZip}/index.html`)).toBe(false);
      expect(bucket.store.has(`tmp/${ID.expiredZip}/main.js`)).toBe(false);
      expect(bucket.store.has(`tmp/${ID.freshFlat}.html`)).toBe(true);
      expect(bucket.store.has(`${ID.userPage}.html`)).toBe(true);
    });

    it("非管理员 → 403 且不删除任何文件", async () => {
      const bucket = seed();
      const app = makeApp(ANON);

      const res = await app.request(
        "/api/admin/cleanup-tmp",
        { method: "POST" },
        { BUCKET: asBucket(bucket) }
      );

      expect(res.status).toBe(403);
      expect(bucket.store.size).toBe(5);
    });
  });

  describe("定时清理（cron 核心 cleanupAnonymousUploads）", () => {
    it("删除过期对象、保留未过期与非 tmp 对象，并返回删除数量", async () => {
      const bucket = new MemoryBucket([
        { key: `tmp/${ID.expiredFlat}.html`, uploaded: daysAgo(10) },
        { key: "tmp/no-uploaded.html", uploaded: undefined },
        { key: `tmp/${ID.freshFlat}.html`, uploaded: daysAgo(1) },
        { key: `${ID.userPage}.html`, uploaded: daysAgo(60) },
      ]);

      const deleted = await cleanupAnonymousUploads(asBucket(bucket));

      expect(deleted).toBe(2);
      expect(bucket.store.has(`tmp/${ID.expiredFlat}.html`)).toBe(false);
      expect(bucket.store.has("tmp/no-uploaded.html")).toBe(false);
      expect(bucket.store.has(`tmp/${ID.freshFlat}.html`)).toBe(true);
      expect(bucket.store.has(`${ID.userPage}.html`)).toBe(true);
    });

    it("scheduled() cron 处理器会触发清理", async () => {
      const bucket = new MemoryBucket([
        { key: `tmp/${ID.expiredFlat}.html`, uploaded: daysAgo(10) },
        { key: `tmp/${ID.freshFlat}.html`, uploaded: daysAgo(2) },
      ]);

      await scheduled(
        {} as ScheduledEvent,
        { BUCKET: asBucket(bucket) } as any,
        {} as ExecutionContext
      );

      expect(bucket.store.has(`tmp/${ID.expiredFlat}.html`)).toBe(false);
      expect(bucket.store.has(`tmp/${ID.freshFlat}.html`)).toBe(true);
    });
  });

  describe("过期判定边界", () => {
    it("uploaded 缺失视为过期", () => {
      expect(isExpiredByUploaded(undefined)).toBe(true);
    });

    it("恰好 7 天以内保留，超过 7 天过期", () => {
      expect(isExpiredByUploaded(new Date(Date.now() - TMP_EXPIRY_MS + 60_000))).toBe(false);
      expect(isExpiredByUploaded(new Date(Date.now() - TMP_EXPIRY_MS - 60_000))).toBe(true);
    });
  });

  describe("可配置过期时间（TMP_EXPIRY_MS）", () => {
    afterEach(() => {
      vi.useRealTimers();
    });

    it("getTmpExpiryMs：读取 env，非法值回退默认 7 天", () => {
      expect(getTmpExpiryMs({ TMP_EXPIRY_MS: "10000" })).toBe(10000);
      expect(getTmpExpiryMs({ TMP_EXPIRY_MS: 5000 })).toBe(5000);
      expect(getTmpExpiryMs({ TMP_EXPIRY_MS: "abc" })).toBe(TMP_EXPIRY_MS);
      expect(getTmpExpiryMs({ TMP_EXPIRY_MS: "0" })).toBe(TMP_EXPIRY_MS);
      expect(getTmpExpiryMs({})).toBe(TMP_EXPIRY_MS);
      expect(getTmpExpiryMs()).toBe(TMP_EXPIRY_MS);
    });

    it("设置为 10 秒：10 秒内可访问，超过后被自动删除", async () => {
      const t0 = new Date("2026-01-01T00:00:00Z");
      const bucket = new MemoryBucket([
        { key: `tmp/${ID.expiredFlat}.html`, uploaded: new Date(t0.getTime()) },
      ]);
      const app = makeApp(ANON);
      const env = { BUCKET: asBucket(bucket), TMP_EXPIRY_MS: "10000" };

      vi.useFakeTimers();
      vi.setSystemTime(t0);

      // 9 秒后：未过期，仍可访问
      vi.setSystemTime(new Date(t0.getTime() + 9_000));
      const fresh = await app.request(`/p/${ID.expiredFlat}`, undefined, env);
      expect(fresh.status).toBe(200);
      expect(bucket.store.has(`tmp/${ID.expiredFlat}.html`)).toBe(true);

      // 11 秒后：过期，惰性清理删除并 404
      vi.setSystemTime(new Date(t0.getTime() + 11_000));
      const expired = await app.request(`/p/${ID.expiredFlat}`, undefined, env);
      expect(expired.status).toBe(404);
      expect(bucket.store.has(`tmp/${ID.expiredFlat}.html`)).toBe(false);
    });

    it("设置为 10 秒：cleanupAnonymousUploads 仅删除超过 10 秒的对象", async () => {
      const t0 = new Date("2026-01-01T00:00:00Z");
      const bucket = new MemoryBucket([
        { key: `tmp/${ID.expiredFlat}.html`, uploaded: new Date(t0.getTime()) },
      ]);

      vi.useFakeTimers();
      vi.setSystemTime(t0);

      vi.setSystemTime(new Date(t0.getTime() + 9_000));
      expect(await cleanupAnonymousUploads(asBucket(bucket), 10_000)).toBe(0);
      expect(bucket.store.size).toBe(1);

      vi.setSystemTime(new Date(t0.getTime() + 11_000));
      expect(await cleanupAnonymousUploads(asBucket(bucket), 10_000)).toBe(1);
      expect(bucket.store.size).toBe(0);
    });
  });
});
