import { describe, it, expect, vi, beforeEach } from "vitest";
import { Hono } from "hono";
import type { AppEnv } from "../server/types";

/**
 * 广场页管理员删除端到端测试（路由 → service → repo → R2）
 * 前置：无。D1 的 drizzle 查询链用内存状态模拟，R2 用 MemoryBucket；
 * 未运行 dev server 也可执行。
 */

const dbState = vi.hoisted(() => ({
  pageId: "",
  pageExists: false,
  deletedIds: [] as string[],
}));

vi.mock("../server/db", () => ({
  createDb: () => ({
    select: () => ({
      from: () => ({
        where: () => ({
          limit: async () => (dbState.pageExists ? [{ id: dbState.pageId }] : []),
        }),
      }),
    }),
    delete: () => ({
      where: async () => {
        dbState.deletedIds.push(dbState.pageId);
        dbState.pageExists = false;
      },
    }),
  }),
}));

import { adminRoutes } from "../server/features/admin/admin.routes";

interface ObjEntry {
  key: string;
  body?: string;
}

class MemoryBucket {
  store = new Map<string, { key: string; body: string }>();

  constructor(entries: ObjEntry[] = []) {
    for (const e of entries) {
      this.store.set(e.key, { key: e.key, body: e.body ?? "<html></html>" });
    }
  }

  async list(opts: { prefix?: string; cursor?: string } = {}) {
    const prefix = opts.prefix ?? "";
    const objects = [...this.store.values()].filter((o) => o.key.startsWith(prefix));
    return { objects, truncated: false, cursor: undefined };
  }

  async delete(keys: string | string[]) {
    for (const k of Array.isArray(keys) ? keys : [keys]) this.store.delete(k);
  }
}

interface LogRow {
  sql: string;
  values: unknown[];
}

function makeD1(logs: LogRow[]) {
  return {
    prepare: (sql: string) => ({
      bind: (...values: unknown[]) => ({
        run: async () => {
          logs.push({ sql, values });
          return { success: true };
        },
      }),
    }),
  } as unknown as D1Database;
}

const ANON: AppEnv["Variables"]["user"] = null;
const USER: AppEnv["Variables"]["user"] = {
  id: "user-1",
  name: "User",
  email: "user@example.com",
  role: "user",
};
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
  app.route("/", adminRoutes);
  return app;
}

const PAGE_ID = "e2epage1";

beforeEach(() => {
  dbState.pageId = PAGE_ID;
  dbState.pageExists = true;
  dbState.deletedIds = [];
});

describe("广场页管理员删除 (e2e)", () => {
  it("管理员删除页面 → 200，R2 资源与数据库记录一并移除", async () => {
    const bucket = new MemoryBucket([
      { key: `${PAGE_ID}.html` },
      { key: `thumbnails/${PAGE_ID}.webp` },
      { key: `${PAGE_ID}/index.html` },
      { key: `${PAGE_ID}/main.js`, body: "console.log(1)" },
    ]);
    const logs: LogRow[] = [];

    const res = await makeApp(ADMIN).request(
      `/api/admin/pages/${PAGE_ID}`,
      { method: "DELETE" },
      { D1: makeD1(logs), BUCKET: bucket as unknown as R2Bucket }
    );

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true });
    expect(dbState.deletedIds).toEqual([PAGE_ID]);
    expect(dbState.pageExists).toBe(false);
    expect(bucket.store.size).toBe(0);

    expect(logs).toHaveLength(1);
    expect(logs[0].sql).toContain("INSERT INTO upload_log");
    expect(logs[0].values).toContain("delete");
    expect(logs[0].values).toContain(PAGE_ID);
    expect(logs[0].values).toContain("admin-1");
  });

  it("未登录删除 → 403，页面与 R2 资源保持不变", async () => {
    const bucket = new MemoryBucket([{ key: `${PAGE_ID}.html` }]);

    const res = await makeApp(ANON).request(
      `/api/admin/pages/${PAGE_ID}`,
      { method: "DELETE" },
      { D1: makeD1([]), BUCKET: bucket as unknown as R2Bucket }
    );

    expect(res.status).toBe(403);
    expect(dbState.deletedIds).toEqual([]);
    expect(bucket.store.has(`${PAGE_ID}.html`)).toBe(true);
  });

  it("普通用户删除 → 403，页面与 R2 资源保持不变", async () => {
    const bucket = new MemoryBucket([{ key: `${PAGE_ID}.html` }]);

    const res = await makeApp(USER).request(
      `/api/admin/pages/${PAGE_ID}`,
      { method: "DELETE" },
      { D1: makeD1([]), BUCKET: bucket as unknown as R2Bucket }
    );

    expect(res.status).toBe(403);
    expect(dbState.deletedIds).toEqual([]);
    expect(bucket.store.has(`${PAGE_ID}.html`)).toBe(true);
  });

  it("页面不存在 → 404，不删除 R2 资源", async () => {
    dbState.pageExists = false;
    const bucket = new MemoryBucket([{ key: `${PAGE_ID}.html` }]);

    const res = await makeApp(ADMIN).request(
      `/api/admin/pages/${PAGE_ID}`,
      { method: "DELETE" },
      { D1: makeD1([]), BUCKET: bucket as unknown as R2Bucket }
    );

    expect(res.status).toBe(404);
    expect(dbState.deletedIds).toEqual([]);
    expect(bucket.store.has(`${PAGE_ID}.html`)).toBe(true);
  });

  it("缺少 D1 binding → 503", async () => {
    const bucket = new MemoryBucket([{ key: `${PAGE_ID}.html` }]);

    const res = await makeApp(ADMIN).request(
      `/api/admin/pages/${PAGE_ID}`,
      { method: "DELETE" },
      { BUCKET: bucket as unknown as R2Bucket }
    );

    expect(res.status).toBe(503);
    expect(dbState.deletedIds).toEqual([]);
  });

  it("无 BUCKET binding → 仍删除数据库记录", async () => {
    const res = await makeApp(ADMIN).request(
      `/api/admin/pages/${PAGE_ID}`,
      { method: "DELETE" },
      { D1: makeD1([]) }
    );

    expect(res.status).toBe(200);
    expect(dbState.deletedIds).toEqual([PAGE_ID]);
    expect(dbState.pageExists).toBe(false);
  });
});
