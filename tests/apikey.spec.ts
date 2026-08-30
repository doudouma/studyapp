import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock createDb before importing the service
const mockDbState = {
  // For select queries: controls what .select().from().where() returns
  selectResult: [] as any[],
  // For getUserByApiKey: two sequential queries (key lookup, then user lookup)
  selectSequence: [] as any[][],
  selectCallIndex: 0,
  // For insert: captures what was inserted
  insertValues: null as any,
  // For update returning: controls what .update().set().where().returning() returns
  updateResult: [] as any[],
};

vi.mock("../server/db", () => {
  function getSelectResult() {
    if (mockDbState.selectSequence.length > 0) {
      const idx = mockDbState.selectCallIndex++;
      return mockDbState.selectSequence[idx] || [];
    }
    return mockDbState.selectResult;
  }
  function makeWhereResult() {
    const p = Promise.resolve(getSelectResult());
    (p as any).orderBy = () => p;
    (p as any).limit = () => p;
    return p;
  }
  return {
    createDb: () => ({
      select: (_fields?: any) => ({
        from: (_table: any) => ({
          where: (_cond: any) => makeWhereResult(),
        }),
      }),
      insert: (_table: any) => ({
        values: (vals: any) => {
          mockDbState.insertValues = vals;
          return Promise.resolve();
        },
      }),
      update: (_table: any) => ({
        set: (_vals: any) => ({
          where: (_cond: any) => ({
            returning: () => Promise.resolve(mockDbState.updateResult),
            execute: () => Promise.resolve(),
          }),
        }),
      }),
    }),
  };
});

// Import after mock
import {
  createApiKey,
  listApiKeys,
  revokeApiKey,
  getUserByApiKey,
} from "../server/features/pages/apikey.service";

function fakeD1(): any {
  return {} as any;
}

beforeEach(() => {
  mockDbState.selectResult = [];
  mockDbState.selectSequence = [];
  mockDbState.selectCallIndex = 0;
  mockDbState.insertValues = null;
  mockDbState.updateResult = [];
});

// ───────────────────────────────────────────────
// 1. Key format and generation
// ───────────────────────────────────────────────
describe("API Key 格式", () => {
  it("生成的 key 以 100m_ 开头", async () => {
    mockDbState.selectResult = [];
    const result = await createApiKey(fakeD1(), "user1", "test");
    expect(result.key.startsWith("100m_")).toBe(true);
  });

  it("生成的 key 长度为 69（100m_ + 64 hex）", async () => {
    // 32 random bytes → 64 hex chars + "100m_" (5) = 69
    mockDbState.selectResult = [];
    const result = await createApiKey(fakeD1(), "user1", "test");
    expect(result.key.length).toBe(69);
  });

  it("key 的 hex 部分只含 0-9a-f", async () => {
    mockDbState.selectResult = [];
    const result = await createApiKey(fakeD1(), "user1", "test");
    const hex = result.key.slice(5); // after "100m_"
    expect(/^[0-9a-f]{64}$/.test(hex)).toBe(true);
  });

  it("prefix 是 key 的前 8 位", async () => {
    mockDbState.selectResult = [];
    const result = await createApiKey(fakeD1(), "user1", "test");
    expect(result.prefix).toBe(result.key.slice(0, 8));
  });

  it("每次生成的 key 不同", async () => {
    mockDbState.selectResult = [];
    const r1 = await createApiKey(fakeD1(), "user1", "test");
    mockDbState.selectResult = [];
    const r2 = await createApiKey(fakeD1(), "user1", "test");
    expect(r1.key).not.toBe(r2.key);
  });
});

// ───────────────────────────────────────────────
// 2. createApiKey
// ───────────────────────────────────────────────
describe("createApiKey", () => {
  it("返回 CreatedApiKey 结构", async () => {
    mockDbState.selectResult = [];
    const result = await createApiKey(fakeD1(), "user1", "my-key");
    expect(result).toHaveProperty("id");
    expect(result).toHaveProperty("key");
    expect(result).toHaveProperty("name", "my-key");
    expect(result).toHaveProperty("prefix");
    expect(result).toHaveProperty("createdAt");
    expect(result.lastUsedAt).toBeNull();
  });

  it("空 name 使用 'unnamed'", async () => {
    mockDbState.selectResult = [];
    const result = await createApiKey(fakeD1(), "user1", "");
    expect(result.name).toBe("unnamed");
  });

  it("将 keyHash 和 prefix 写入数据库", async () => {
    mockDbState.selectResult = [];
    await createApiKey(fakeD1(), "user1", "test");
    expect(mockDbState.insertValues).toBeTruthy();
    expect(mockDbState.insertValues.keyHash).toMatch(/^[0-9a-f]{64}$/); // SHA-256 hex
    expect(mockDbState.insertValues.prefix).toMatch(/^100m_[0-9a-f]{3}$/); // 100m_ + 3 hex
  });

  it("超过 MAX_KEYS_PER_USER (10) 时抛错", async () => {
    mockDbState.selectResult = Array.from({ length: 10 }, (_, i) => ({ id: `k${i}` }));
    await expect(createApiKey(fakeD1(), "user1", "test")).rejects.toThrow("最多允许 10 个活跃密钥");
  });

  it("9 个已有 key 时仍可创建", async () => {
    mockDbState.selectResult = Array.from({ length: 9 }, (_, i) => ({ id: `k${i}` }));
    const result = await createApiKey(fakeD1(), "user1", "test");
    expect(result.key).toBeTruthy();
  });
});

// ───────────────────────────────────────────────
// 3. listApiKeys
// ───────────────────────────────────────────────
describe("listApiKeys", () => {
  it("返回 key 列表（不含 keyHash）", async () => {
    mockDbState.selectResult = [
      { id: "k1", name: "key-1", prefix: "100m_aaa", createdAt: new Date(), lastUsedAt: null },
    ];
    const result = await listApiKeys(fakeD1(), "user1");
    expect(result).toHaveLength(1);
    expect(result[0]).not.toHaveProperty("keyHash");
    expect(result[0].name).toBe("key-1");
  });

  it("空列表返回空数组", async () => {
    mockDbState.selectResult = [];
    const result = await listApiKeys(fakeD1(), "user1");
    expect(result).toEqual([]);
  });
});

// ───────────────────────────────────────────────
// 4. revokeApiKey
// ───────────────────────────────────────────────
describe("revokeApiKey", () => {
  it("成功吊销返回 true", async () => {
    mockDbState.updateResult = [{ id: "k1" }];
    const result = await revokeApiKey(fakeD1(), "user1", "k1");
    expect(result).toBe(true);
  });

  it("找不到 key 返回 false", async () => {
    mockDbState.updateResult = [];
    const result = await revokeApiKey(fakeD1(), "user1", "nonexistent");
    expect(result).toBe(false);
  });
});

// ───────────────────────────────────────────────
// 5. getUserByApiKey
// ───────────────────────────────────────────────
describe("getUserByApiKey", () => {
  it("有效 key 返回用户信息", async () => {
    // Two sequential queries: key lookup → user lookup
    mockDbState.selectSequence = [
      [{ id: "k1", userId: "user1", keyHash: "abc" }],        // key found
      [{ id: "user1", name: "Alice", email: "a@b.com", image: null, role: "user" }], // user found
    ];
    mockDbState.selectCallIndex = 0;

    const result = await getUserByApiKey(fakeD1(), "100m_abc123");
    expect(result).toEqual({
      id: "user1",
      name: "Alice",
      email: "a@b.com",
      image: undefined,
      role: "user",
    });
  });

  it("无效 key 返回 null", async () => {
    mockDbState.selectSequence = [[]]; // no key found
    mockDbState.selectCallIndex = 0;

    const result = await getUserByApiKey(fakeD1(), "100m_invalid");
    expect(result).toBeNull();
  });

  it("key 存在但用户已删除返回 null", async () => {
    mockDbState.selectSequence = [
      [{ id: "k1", userId: "user1" }],  // key found
      [],                                 // user not found
    ];
    mockDbState.selectCallIndex = 0;

    const result = await getUserByApiKey(fakeD1(), "100m_valid");
    expect(result).toBeNull();
  });

  it("吊销的 key 返回 null", async () => {
    // Key lookup returns empty because revoked keys are filtered out by WHERE clause
    mockDbState.selectSequence = [[]];
    mockDbState.selectCallIndex = 0;

    const result = await getUserByApiKey(fakeD1(), "100m_revoked");
    expect(result).toBeNull();
  });
});

// ───────────────────────────────────────────────
// 6. SHA-256 hash consistency
// ───────────────────────────────────────────────
describe("SHA-256 哈希", () => {
  it("哈希长度为 64 位（256 bit）", async () => {
    mockDbState.selectResult = [];
    await createApiKey(fakeD1(), "user1", "test");
    expect(mockDbState.insertValues.keyHash.length).toBe(64);
  });

  it("哈希只含 hex 字符", async () => {
    mockDbState.selectResult = [];
    await createApiKey(fakeD1(), "user1", "test");
    expect(mockDbState.insertValues.keyHash).toMatch(/^[0-9a-f]{64}$/);
  });
});

// ───────────────────────────────────────────────
// 7. Upload script argument parsing (unit test the logic)
// ───────────────────────────────────────────────
describe("upload.mjs 参数解析逻辑", () => {
  // Test the argument parsing logic by extracting it
  function parseArgs(argv: string[]) {
    const args = argv.slice(2);
    const opts: Record<string, string | boolean> = {};
    for (let i = 0; i < args.length; i++) {
      const a = args[i];
      if (a === "-h" || a === "--help") {
        opts.help = true;
      } else if (a === "--quiet") {
        opts.quiet = true;
      } else if (a === "--anonymous") {
        opts.anonymous = true;
      } else if (a.startsWith("--") && i + 1 < args.length) {
        const key = a.slice(2);
        opts[key] = args[++i];
      } else if (!a.startsWith("--")) {
        if (!opts.file) opts.file = a;
      }
    }
    return opts;
  }

  it("--file 解析为 file", () => {
    const opts = parseArgs(["node", "upload.mjs", "--file", "test.html"]);
    expect(opts.file).toBe("test.html");
  });

  it("--content 解析为 content", () => {
    const opts = parseArgs(["node", "upload.mjs", "--content", "<h1>hi</h1>"]);
    expect(opts.content).toBe("<h1>hi</h1>");
  });

  it("--token 解析为 token", () => {
    const opts = parseArgs(["node", "upload.mjs", "--token", "100m_abc"]);
    expect(opts.token).toBe("100m_abc");
  });

  it("--quiet 设置 quiet 标志", () => {
    const opts = parseArgs(["node", "upload.mjs", "--file", "x.html", "--quiet"]);
    expect(opts.quiet).toBe(true);
  });

  it("--anonymous 设置 anonymous 标志", () => {
    const opts = parseArgs(["node", "upload.mjs", "--file", "x.html", "--anonymous"]);
    expect(opts.anonymous).toBe(true);
  });

  it("-h 设置 help 标志", () => {
    const opts = parseArgs(["node", "upload.mjs", "-h"]);
    expect(opts.help).toBe(true);
  });

  it("位置参数作为 file", () => {
    const opts = parseArgs(["node", "upload.mjs", "page.html"]);
    expect(opts.file).toBe("page.html");
  });

  it("--base-url 解析为 base-url", () => {
    const opts = parseArgs(["node", "upload.mjs", "--base-url", "http://localhost:5173"]);
    expect(opts["base-url"]).toBe("http://localhost:5173");
  });

  it("--title 解析为 title", () => {
    const opts = parseArgs(["node", "upload.mjs", "--title", "My Page"]);
    expect(opts.title).toBe("My Page");
  });

  it("组合参数正确解析", () => {
    const opts = parseArgs([
      "node", "upload.mjs",
      "--token", "100m_abc",
      "--file", "app.zip",
      "--title", "My App",
      "--tags", "test,demo",
      "--quiet",
    ]);
    expect(opts.token).toBe("100m_abc");
    expect(opts.file).toBe("app.zip");
    expect(opts.title).toBe("My App");
    expect(opts.tags).toBe("test,demo");
    expect(opts.quiet).toBe(true);
  });
});
