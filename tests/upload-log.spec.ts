import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  insertUploadLog,
  queryUploadLogs,
  deleteOldUploadLogs,
  type UploadLogEntry,
  type UploadLogRow,
} from "../server/features/admin/upload-log.repo";

// ───────────────────────────────────────────────
// Mock D1 factory
// ───────────────────────────────────────────────

interface MockD1Options {
  insertResult?: { success: boolean };
  insertError?: Error;
  countResult?: { cnt: number };
  queryResults?: UploadLogRow[];
  deleteResult?: { meta: { changes: number } };
}

interface D1Call {
  type: "run" | "first" | "all";
  sql: string;
  binds: unknown[];
}

function createMockD1(opts: MockD1Options = {}) {
  const calls: D1Call[] = [];

  return {
    prepare: (sql: string) => ({
      bind: (...args: unknown[]) => ({
        run: async () => {
          if (opts.insertError) throw opts.insertError;
          calls.push({ type: "run", sql, binds: args });
          if (sql.startsWith("DELETE")) {
            return opts.deleteResult ?? { meta: { changes: 0 } };
          }
          return opts.insertResult ?? { success: true };
        },
        all: async () => {
          calls.push({ type: "all", sql, binds: args });
          return { results: opts.queryResults ?? [] };
        },
        first: async <T>() => {
          calls.push({ type: "first", sql, binds: args });
          if (sql.includes("COUNT")) {
            return (opts.countResult ?? { cnt: 0 }) as T;
          }
          return null;
        },
      }),
    }),
    getCalls: () => calls,
    getInserted: () => calls.filter(c => c.type === "run"),
    getQueryCalls: () => calls.filter(c => c.type === "first" || c.type === "all"),
    getRunCallCount: () => calls.filter(c => c.type === "run").length,
  };
}

// ───────────────────────────────────────────────
// insertUploadLog
// ───────────────────────────────────────────────

describe("insertUploadLog", () => {
  it("should call D1.prepare with correct SQL", () => {
    const d1 = createMockD1();
    insertUploadLog(d1 as any, {
      pageId: "abc123",
      event: "upload",
      isAnonymous: false,
    });

    const inserted = d1.getInserted();
    expect(inserted).toHaveLength(1);
    expect(inserted[0].sql).toContain("INSERT INTO upload_log");
    expect(inserted[0].sql).toContain("user_id");
    expect(inserted[0].sql).toContain("page_id");
    expect(inserted[0].sql).toContain("event");
    expect(inserted[0].sql).toContain("content_type");
    expect(inserted[0].sql).toContain("is_anonymous");
    expect(inserted[0].sql).toContain("ip");
    expect(inserted[0].sql).toContain("file_size");
    expect(inserted[0].sql).toContain("created_at");
  });

  it("should bind all parameters in correct order", () => {
    const d1 = createMockD1();
    insertUploadLog(d1 as any, {
      userId: "user1",
      pageId: "page1",
      event: "upload",
      contentType: "html",
      isAnonymous: false,
      ip: "1.2.3.4",
      fileSize: 1024,
    });

    const binds = d1.getInserted()[0].binds;
    expect(binds[0]).toBe("user1");
    expect(binds[1]).toBe("page1");
    expect(binds[2]).toBe("upload");
    expect(binds[3]).toBe("html");
    expect(binds[4]).toBe(0); // isAnonymous=false → 0
    expect(binds[5]).toBe("1.2.3.4");
    expect(binds[6]).toBe(1024);
    expect(typeof binds[7]).toBe("number"); // createdAt is a timestamp
  });

  it("should bind null for anonymous user fields", () => {
    const d1 = createMockD1();
    insertUploadLog(d1 as any, {
      pageId: "page2",
      event: "upload",
      isAnonymous: true,
      ip: "5.6.7.8",
    });

    const binds = d1.getInserted()[0].binds;
    expect(binds[0]).toBeNull(); // userId
    expect(binds[1]).toBe("page2");
    expect(binds[2]).toBe("upload");
    expect(binds[3]).toBeNull(); // contentType
    expect(binds[4]).toBe(1); // isAnonymous=true → 1
    expect(binds[5]).toBe("5.6.7.8");
    expect(binds[6]).toBeNull(); // fileSize
  });

  it("should bind null for all optional fields when omitted", () => {
    const d1 = createMockD1();
    insertUploadLog(d1 as any, {
      pageId: "page3",
      event: "delete",
      isAnonymous: false,
    });

    const binds = d1.getInserted()[0].binds;
    expect(binds[0]).toBeNull(); // userId
    expect(binds[2]).toBe("delete");
    expect(binds[3]).toBeNull(); // contentType
    expect(binds[5]).toBeNull(); // ip
    expect(binds[6]).toBeNull(); // fileSize
  });

  it("should bind isAnonymous=1 for anonymous users", () => {
    const d1 = createMockD1();
    insertUploadLog(d1 as any, {
      pageId: "tmp1",
      event: "upload",
      isAnonymous: true,
    });

    const binds = d1.getInserted()[0].binds;
    expect(binds[4]).toBe(1);
  });

  it("should bind isAnonymous=0 for logged-in users", () => {
    const d1 = createMockD1();
    insertUploadLog(d1 as any, {
      userId: "u1",
      pageId: "p1",
      event: "upload",
      isAnonymous: false,
    });

    const binds = d1.getInserted()[0].binds;
    expect(binds[4]).toBe(0);
  });

  it("should handle upload event with html content type", () => {
    const d1 = createMockD1();
    insertUploadLog(d1 as any, {
      userId: "u1",
      pageId: "p1",
      event: "upload",
      contentType: "html",
      isAnonymous: false,
      fileSize: 5000,
    });

    const binds = d1.getInserted()[0].binds;
    expect(binds[2]).toBe("upload");
    expect(binds[3]).toBe("html");
    expect(binds[6]).toBe(5000);
  });

  it("should handle upload event with zip content type", () => {
    const d1 = createMockD1();
    insertUploadLog(d1 as any, {
      userId: "u1",
      pageId: "p1",
      event: "upload",
      contentType: "zip",
      isAnonymous: false,
      fileSize: 49000,
    });

    const binds = d1.getInserted()[0].binds;
    expect(binds[3]).toBe("zip");
    expect(binds[6]).toBe(49000);
  });

  it("should handle upload event with thumbnail content type", () => {
    const d1 = createMockD1();
    insertUploadLog(d1 as any, {
      userId: "u1",
      pageId: "p1",
      event: "upload",
      contentType: "thumbnail",
      isAnonymous: false,
      fileSize: 2048,
    });

    const binds = d1.getInserted()[0].binds;
    expect(binds[3]).toBe("thumbnail");
  });

  it("should handle cleanup event", () => {
    const d1 = createMockD1();
    insertUploadLog(d1 as any, {
      pageId: "batch",
      event: "cleanup",
      isAnonymous: false,
    });

    const binds = d1.getInserted()[0].binds;
    expect(binds[2]).toBe("cleanup");
    expect(binds[0]).toBeNull(); // userId
    expect(binds[3]).toBeNull(); // contentType
    expect(binds[5]).toBeNull(); // ip
    expect(binds[6]).toBeNull(); // fileSize
  });

  it("should return void (fire-and-forget)", () => {
    const d1 = createMockD1();
    const result = insertUploadLog(d1 as any, {
      pageId: "p1",
      event: "upload",
      isAnonymous: false,
    });
    expect(result).toBeUndefined();
  });

  it("should swallow errors and not throw", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const d1 = createMockD1({ insertError: new Error("D1 write failed") });

    // Should not throw
    expect(() => {
      insertUploadLog(d1 as any, {
        pageId: "p1",
        event: "upload",
        isAnonymous: false,
      });
    }).not.toThrow();

    // Wait for the async error to be caught
    vi.waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        "upload log write failed:",
        expect.any(Error)
      );
    });
    consoleSpy.mockRestore();
  });

  it("should include createdAt as current timestamp", () => {
    const d1 = createMockD1();
    const before = Date.now();
    insertUploadLog(d1 as any, {
      pageId: "p1",
      event: "upload",
      isAnonymous: false,
    });
    const after = Date.now();

    const createdAt = d1.getInserted()[0].binds[7] as number;
    expect(createdAt).toBeGreaterThanOrEqual(before);
    expect(createdAt).toBeLessThanOrEqual(after);
  });
});

// ───────────────────────────────────────────────
// queryUploadLogs
// ───────────────────────────────────────────────

describe("queryUploadLogs", () => {
  // D1 returns snake_case column names
  const sampleLogs = [
    {
      id: 1,
      user_id: "user1",
      page_id: "page1",
      event: "upload",
      content_type: "html",
      is_anonymous: 0,
      ip: "1.2.3.4",
      file_size: 1024,
      created_at: 1700000000000,
    },
    {
      id: 2,
      user_id: null,
      page_id: "tmp1",
      event: "upload",
      content_type: "zip",
      is_anonymous: 1,
      ip: "5.6.7.8",
      file_size: 4096,
      created_at: 1700000001000,
    },
  ];

  it("should return empty results when no logs exist", async () => {
    const d1 = createMockD1({ countResult: { cnt: 0 }, queryResults: [] });
    const result = await queryUploadLogs(d1 as any, {});

    expect(result.logs).toEqual([]);
    expect(result.total).toBe(0);
  });

  it("should return logs with default pagination", async () => {
    const d1 = createMockD1({ countResult: { cnt: 2 }, queryResults: sampleLogs });
    const result = await queryUploadLogs(d1 as any, {});

    expect(result.logs).toHaveLength(2);
    expect(result.total).toBe(2);
  });

  it("should default page to 1 and pageSize to 20", async () => {
    const d1 = createMockD1({ countResult: { cnt: 0 }, queryResults: [] });
    await queryUploadLogs(d1 as any, {});

    const queryCalls = d1.getQueryCalls();
    // The SELECT query should have LIMIT 20 OFFSET 0
    const selectQuery = queryCalls.find((i) => i.sql.includes("SELECT *"));
    expect(selectQuery).toBeDefined();
    // binds should contain pageSize=20 and offset=0 at the end
    const binds = selectQuery!.binds;
    expect(binds[binds.length - 2]).toBe(20); // pageSize
    expect(binds[binds.length - 1]).toBe(0);  // offset
  });

  it("should clamp page to minimum 1", async () => {
    const d1 = createMockD1({ countResult: { cnt: 0 }, queryResults: [] });
    await queryUploadLogs(d1 as any, { page: -5, pageSize: 10 });

    const selectQuery = d1.getQueryCalls().find((i) => i.sql.includes("SELECT *"));
    const binds = selectQuery!.binds;
    expect(binds[binds.length - 2]).toBe(10); // pageSize
    expect(binds[binds.length - 1]).toBe(0);  // offset (page=1 → offset=0)
  });

  it("should clamp pageSize to minimum 1", async () => {
    const d1 = createMockD1({ countResult: { cnt: 0 }, queryResults: [] });
    await queryUploadLogs(d1 as any, { page: 1, pageSize: -10 });

    const selectQuery = d1.getQueryCalls().find((i) => i.sql.includes("SELECT *"));
    const binds = selectQuery!.binds;
    expect(binds[binds.length - 2]).toBe(1); // pageSize clamped to 1
  });

  it("should clamp pageSize to maximum 100", async () => {
    const d1 = createMockD1({ countResult: { cnt: 0 }, queryResults: [] });
    await queryUploadLogs(d1 as any, { page: 1, pageSize: 999 });

    const selectQuery = d1.getQueryCalls().find((i) => i.sql.includes("SELECT *"));
    const binds = selectQuery!.binds;
    expect(binds[binds.length - 2]).toBe(100); // pageSize clamped to 100
  });

  it("should calculate correct offset for page 2", async () => {
    const d1 = createMockD1({ countResult: { cnt: 50 }, queryResults: [] });
    await queryUploadLogs(d1 as any, { page: 2, pageSize: 20 });

    const selectQuery = d1.getQueryCalls().find((i) => i.sql.includes("SELECT *"));
    const binds = selectQuery!.binds;
    expect(binds[binds.length - 2]).toBe(20); // pageSize
    expect(binds[binds.length - 1]).toBe(20); // offset = (2-1)*20 = 20
  });

  it("should calculate correct offset for page 3 with pageSize 10", async () => {
    const d1 = createMockD1({ countResult: { cnt: 50 }, queryResults: [] });
    await queryUploadLogs(d1 as any, { page: 3, pageSize: 10 });

    const selectQuery = d1.getQueryCalls().find((i) => i.sql.includes("SELECT *"));
    const binds = selectQuery!.binds;
    expect(binds[binds.length - 2]).toBe(10);
    expect(binds[binds.length - 1]).toBe(20); // offset = (3-1)*10 = 20
  });

  it("should filter by userId", async () => {
    const d1 = createMockD1({ countResult: { cnt: 0 }, queryResults: [] });
    await queryUploadLogs(d1 as any, { userId: "user1" });

    const countQuery = d1.getQueryCalls().find((i) => i.sql.includes("COUNT"));
    expect(countQuery!.sql).toContain("user_id = ?");
    expect(countQuery!.binds[0]).toBe("user1");
  });

  it("should filter by event", async () => {
    const d1 = createMockD1({ countResult: { cnt: 0 }, queryResults: [] });
    await queryUploadLogs(d1 as any, { event: "delete" });

    const countQuery = d1.getQueryCalls().find((i) => i.sql.includes("COUNT"));
    expect(countQuery!.sql).toContain("event = ?");
    expect(countQuery!.binds[0]).toBe("delete");
  });

  it("should filter by from timestamp", async () => {
    const d1 = createMockD1({ countResult: { cnt: 0 }, queryResults: [] });
    await queryUploadLogs(d1 as any, { from: 1700000000000 });

    const countQuery = d1.getQueryCalls().find((i) => i.sql.includes("COUNT"));
    expect(countQuery!.sql).toContain("created_at >= ?");
    expect(countQuery!.binds[0]).toBe(1700000000000);
  });

  it("should filter by to timestamp", async () => {
    const d1 = createMockD1({ countResult: { cnt: 0 }, queryResults: [] });
    await queryUploadLogs(d1 as any, { to: 1700000099999 });

    const countQuery = d1.getQueryCalls().find((i) => i.sql.includes("COUNT"));
    expect(countQuery!.sql).toContain("created_at <= ?");
    expect(countQuery!.binds[0]).toBe(1700000099999);
  });

  it("should combine multiple filters with AND", async () => {
    const d1 = createMockD1({ countResult: { cnt: 0 }, queryResults: [] });
    await queryUploadLogs(d1 as any, {
      userId: "user1",
      event: "upload",
      from: 1700000000000,
      to: 1700000099999,
    });

    const countQuery = d1.getQueryCalls().find((i) => i.sql.includes("COUNT"));
    expect(countQuery!.sql).toContain("WHERE");
    expect(countQuery!.sql).toContain("user_id = ?");
    expect(countQuery!.sql).toContain("event = ?");
    expect(countQuery!.sql).toContain("created_at >= ?");
    expect(countQuery!.sql).toContain("created_at <= ?");
    expect(countQuery!.sql).toContain(" AND ");
    expect(countQuery!.binds).toEqual(["user1", "upload", 1700000000000, 1700000099999]);
  });

  it("should include ORDER BY created_at DESC", async () => {
    const d1 = createMockD1({ countResult: { cnt: 0 }, queryResults: [] });
    await queryUploadLogs(d1 as any, {});

    const selectQuery = d1.getQueryCalls().find((i) => i.sql.includes("SELECT *"));
    expect(selectQuery!.sql).toContain("ORDER BY created_at DESC");
  });

  it("should return logs from query results", async () => {
    const d1 = createMockD1({ countResult: { cnt: 2 }, queryResults: sampleLogs });
    const result = await queryUploadLogs(d1 as any, {});

    expect(result.logs[0].id).toBe(1);
    expect(result.logs[0].userId).toBe("user1");
    expect(result.logs[0].event).toBe("upload");
    expect(result.logs[1].id).toBe(2);
    expect(result.logs[1].isAnonymous).toBe(1);
  });

  it("should handle null results from D1 gracefully", async () => {
    const d1 = createMockD1({ countResult: undefined, queryResults: undefined });
    const result = await queryUploadLogs(d1 as any, {});

    expect(result.logs).toEqual([]);
    expect(result.total).toBe(0);
  });

  it("should run COUNT and SELECT in parallel", async () => {
    const d1 = createMockD1({ countResult: { cnt: 1 }, queryResults: sampleLogs.slice(0, 1) });
    await queryUploadLogs(d1 as any, {});

    // Both queries should have been executed
    expect(d1.getQueryCalls()).toHaveLength(2);
    const sqls = d1.getQueryCalls().map((i) => i.sql);
    expect(sqls.some((s) => s.includes("COUNT"))).toBe(true);
    expect(sqls.some((s) => s.includes("SELECT *"))).toBe(true);
  });
});

// ───────────────────────────────────────────────
// deleteOldUploadLogs
// ───────────────────────────────────────────────

describe("deleteOldUploadLogs", () => {
  it("should execute DELETE with correct cutoff", async () => {
    const d1 = createMockD1({ deleteResult: { meta: { changes: 5 } } });
    const cutoff = 1700000000000;
    const result = await deleteOldUploadLogs(d1 as any, cutoff);

    expect(result).toBe(5);
    const inserted = d1.getInserted();
    expect(inserted).toHaveLength(1);
    expect(inserted[0].sql).toBe("DELETE FROM upload_log WHERE created_at < ?");
    expect(inserted[0].binds[0]).toBe(cutoff);
  });

  it("should return 0 when no rows deleted", async () => {
    const d1 = createMockD1({ deleteResult: { meta: { changes: 0 } } });
    const result = await deleteOldUploadLogs(d1 as any, 1700000000000);

    expect(result).toBe(0);
  });

  it("should return 0 when meta.changes is undefined", async () => {
    const d1 = createMockD1({ deleteResult: { meta: { changes: undefined as any } } });
    const result = await deleteOldUploadLogs(d1 as any, 1700000000000);

    expect(result).toBe(0);
  });

  it("should return large numbers correctly", async () => {
    const d1 = createMockD1({ deleteResult: { meta: { changes: 99999 } } });
    const result = await deleteOldUploadLogs(d1 as any, 1700000000000);

    expect(result).toBe(99999);
  });
});

// ───────────────────────────────────────────────
// Edge cases
// ───────────────────────────────────────────────

describe("edge cases", () => {
  it("should handle empty string userId", () => {
    const d1 = createMockD1();
    insertUploadLog(d1 as any, {
      userId: "",
      pageId: "p1",
      event: "upload",
      isAnonymous: false,
    });

    const binds = d1.getInserted()[0].binds;
    expect(binds[0]).toBe(""); // empty string, not null
  });

  it("should handle zero fileSize", () => {
    const d1 = createMockD1();
    insertUploadLog(d1 as any, {
      pageId: "p1",
      event: "upload",
      isAnonymous: false,
      fileSize: 0,
    });

    const binds = d1.getInserted()[0].binds;
    expect(binds[6]).toBe(0); // zero, not null
  });

  it("should handle very large fileSize", () => {
    const d1 = createMockD1();
    insertUploadLog(d1 as any, {
      pageId: "p1",
      event: "upload",
      isAnonymous: false,
      fileSize: 5 * 1024 * 1024, // 5MB
    });

    const binds = d1.getInserted()[0].binds;
    expect(binds[6]).toBe(5242880);
  });

  it("should handle IPv6 address", () => {
    const d1 = createMockD1();
    insertUploadLog(d1 as any, {
      pageId: "p1",
      event: "upload",
      isAnonymous: true,
      ip: "::1",
    });

    const binds = d1.getInserted()[0].binds;
    expect(binds[5]).toBe("::1");
  });

  it("should handle 'unknown' IP", () => {
    const d1 = createMockD1();
    insertUploadLog(d1 as any, {
      pageId: "p1",
      event: "upload",
      isAnonymous: true,
      ip: "unknown",
    });

    const binds = d1.getInserted()[0].binds;
    expect(binds[5]).toBe("unknown");
  });

  it("queryUploadLogs should handle page=0 (clamped to 1)", async () => {
    const d1 = createMockD1({ countResult: { cnt: 0 }, queryResults: [] });
    await queryUploadLogs(d1 as any, { page: 0 });

    const selectQuery = d1.getQueryCalls().find((i) => i.sql.includes("SELECT *"));
    const binds = selectQuery!.binds;
    expect(binds[binds.length - 1]).toBe(0); // offset = (1-1)*20 = 0
  });

  it("queryUploadLogs should handle pageSize=0 (clamped to 1)", async () => {
    const d1 = createMockD1({ countResult: { cnt: 0 }, queryResults: [] });
    await queryUploadLogs(d1 as any, { pageSize: 0 });

    const selectQuery = d1.getQueryCalls().find((i) => i.sql.includes("SELECT *"));
    const binds = selectQuery!.binds;
    expect(binds[binds.length - 2]).toBe(1);
  });

  it("query with no filters should have no WHERE clause", async () => {
    const d1 = createMockD1({ countResult: { cnt: 0 }, queryResults: [] });
    await queryUploadLogs(d1 as any, {});

    const countQuery = d1.getQueryCalls().find((i) => i.sql.includes("COUNT"));
    expect(countQuery!.sql).not.toContain("WHERE");
  });
});
