import { describe, it, expect, vi, beforeEach } from "vitest";

// createDb 被 mock 成可配置的链式查询构造器；D1 原生 prepare/bind/run/all 用 fakeD1 模拟
const dbState = {
  selectSequence: [] as unknown[][],
  selectRows: [] as unknown[],
  selectIndex: 0,
  insertValues: null as unknown,
  updateValues: null as unknown,
  deleteCalls: 0,
};

vi.mock("../server/db", () => {
  function pickRows(): unknown[] {
    if (dbState.selectSequence.length > 0) {
      const idx = dbState.selectIndex++;
      return dbState.selectSequence[idx] ?? [];
    }
    return dbState.selectRows;
  }
  function thenable(rows: unknown[]) {
    const p: any = Promise.resolve(rows);
    p.orderBy = () => p;
    p.limit = () => p;
    p.offset = () => p;
    return p;
  }
  return {
    createDb: () => ({
      select: () => ({ from: () => ({ where: () => thenable(pickRows()) }) }),
      insert: () => ({
        values: (v: unknown) => {
          dbState.insertValues = v;
          return Promise.resolve();
        },
      }),
      update: () => ({
        set: (v: unknown) => ({
          where: () => {
            dbState.updateValues = v;
            return Promise.resolve();
          },
        }),
      }),
      delete: () => ({
        where: () => {
          dbState.deleteCalls++;
          return Promise.resolve();
        },
      }),
    }),
  };
});

import {
  getMembershipExpiresAt,
  isMemberByUserId,
  getUserPoints,
  getUserLinksLimitBonus,
  deductPointsAndAddBonus,
  deductPoints,
  countUserPages,
  listUserPages,
  findOwnedPage,
  getPageRecord,
  insertPageRecord,
  updatePageRecord,
  deletePageRecord,
  incrementPageViewCount,
  getPageMeta,
} from "../server/features/pages/pages.repo";

/** 最小 D1 桩：prepare().bind().run()/all() 返回固定 results */
function fakeD1(results: unknown[] = []): any {
  return {
    prepare: () => ({
      bind: () => ({
        run: async () => ({ success: true }),
        all: async () => ({ results }),
      }),
    }),
  };
}

beforeEach(() => {
  dbState.selectSequence = [];
  dbState.selectRows = [];
  dbState.selectIndex = 0;
  dbState.insertValues = null;
  dbState.updateValues = null;
  dbState.deleteCalls = 0;
});

describe("getMembershipExpiresAt", () => {
  it("无记录返回 null", async () => {
    expect(await getMembershipExpiresAt(fakeD1([]), "u")).toBeNull();
  });

  it("有记录返回毫秒时间戳", async () => {
    expect(await getMembershipExpiresAt(fakeD1([{ expires_at: 1000 }]), "u")).toBe(1_000_000);
  });
});

describe("isMemberByUserId", () => {
  it("无会员记录 → false", async () => {
    expect(await isMemberByUserId(fakeD1([]), "u")).toBe(false);
  });

  it("会员已过期 → false", async () => {
    const past = Math.floor((Date.now() - 86_400_000) / 1000);
    expect(await isMemberByUserId(fakeD1([{ expires_at: past }]), "u")).toBe(false);
  });

  it("会员有效 → true", async () => {
    const future = Math.floor((Date.now() + 86_400_000) / 1000);
    expect(await isMemberByUserId(fakeD1([{ expires_at: future }]), "u")).toBe(true);
  });
});

describe("getUserPoints / getUserLinksLimitBonus", () => {
  it("返回积分", async () => {
    dbState.selectRows = [{ points: 42 }];
    expect(await getUserPoints(fakeD1(), "u")).toBe(42);
  });

  it("无用户记录时积分为 0", async () => {
    dbState.selectRows = [];
    expect(await getUserPoints(fakeD1(), "u")).toBe(0);
  });

  it("返回链接上限奖励", async () => {
    dbState.selectRows = [{ linksLimitBonus: 3 }];
    expect(await getUserLinksLimitBonus(fakeD1(), "u")).toBe(3);
  });

  it("无用户记录时奖励为 0", async () => {
    dbState.selectRows = [];
    expect(await getUserLinksLimitBonus(fakeD1(), "u")).toBe(0);
  });
});

describe("deductPointsAndAddBonus / deductPoints", () => {
  it("扣分后返回余额", async () => {
    expect(await deductPointsAndAddBonus(fakeD1([{ points: 30 }]), "u", 10)).toBe(30);
  });

  it("查询无结果时返回 0", async () => {
    expect(await deductPointsAndAddBonus(fakeD1([]), "u", 10)).toBe(0);
  });

  it("deductPoints 返回余额", async () => {
    expect(await deductPoints(fakeD1([{ points: 20 }]), "u", 30)).toBe(20);
  });

  it("deductPoints 查询无结果时返回 0", async () => {
    expect(await deductPoints(fakeD1([]), "u", 30)).toBe(0);
  });
});

describe("countUserPages", () => {
  it("返回计数", async () => {
    dbState.selectRows = [{ count: 7 }];
    expect(await countUserPages(fakeD1(), "u")).toBe(7);
  });

  it("无结果时为 0", async () => {
    dbState.selectRows = [];
    expect(await countUserPages(fakeD1(), "u")).toBe(0);
  });
});

describe("listUserPages", () => {
  it("返回页面行", async () => {
    const rows = [{ id: "a" }, { id: "b" }];
    dbState.selectRows = rows;
    expect(await listUserPages(fakeD1(), "u", 10, 0)).toBe(rows);
  });
});

describe("findOwnedPage", () => {
  it("存在 → true", async () => {
    dbState.selectRows = [{ id: "p1" }];
    expect(await findOwnedPage(fakeD1(), "p1", "u")).toBe(true);
  });

  it("不存在 → false", async () => {
    dbState.selectRows = [];
    expect(await findOwnedPage(fakeD1(), "p1", "u")).toBe(false);
  });
});

describe("getPageRecord / getPageMeta", () => {
  it("getPageRecord 返回首行", async () => {
    dbState.selectRows = [{ id: "p1", title: "t" }];
    expect(await getPageRecord(fakeD1(), "p1")).toEqual({ id: "p1", title: "t" });
  });

  it("getPageRecord 无结果返回 null", async () => {
    dbState.selectRows = [];
    expect(await getPageRecord(fakeD1(), "p1")).toBeNull();
  });

  it("getPageMeta 返回 meta 或 null", async () => {
    dbState.selectRows = [{ title: "t", category: "c", tags: "a,b" }];
    expect(await getPageMeta(fakeD1(), "p1")).toEqual({ title: "t", category: "c", tags: "a,b" });
    dbState.selectRows = [];
    expect(await getPageMeta(fakeD1(), "p1")).toBeNull();
  });
});

describe("写操作", () => {
  it("insertPageRecord 写入 values", async () => {
    await insertPageRecord(fakeD1(), { id: "p1" } as any);
    expect(dbState.insertValues).toEqual({ id: "p1" });
  });

  it("updatePageRecord 写入 set 值", async () => {
    await updatePageRecord(fakeD1(), "p1", { title: "new" });
    expect(dbState.updateValues).toEqual({ title: "new" });
  });

  it("deletePageRecord 执行删除", async () => {
    await deletePageRecord(fakeD1(), "p1");
    expect(dbState.deleteCalls).toBe(1);
  });

  it("incrementPageViewCount 执行更新", async () => {
    await incrementPageViewCount(fakeD1(), "p1");
    expect(dbState.updateValues).toHaveProperty("viewCount");
  });
});
