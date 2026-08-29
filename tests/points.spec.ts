import { describe, it, expect } from "vitest";
import {
  FREE_PERMANENT_LIMIT,
  POINTS_PER_UPLOAD,
  DEFAULT_POINTS,
} from "../shared/types/pages";
import { deductPointsAndAddBonus } from "../server/features/pages/pages.repo";

// ───────────────────────────────────────────────
// 1. 常量一致性
// ───────────────────────────────────────────────
describe("积分常量", () => {
  it("免费链接数为 5", () => {
    expect(FREE_PERMANENT_LIMIT).toBe(5);
  });

  it("每个额外链接消耗 10 积分", () => {
    expect(POINTS_PER_UPLOAD).toBe(10);
  });

  it("新用户初始积分为 50", () => {
    expect(DEFAULT_POINTS).toBe(50);
  });
});

// ───────────────────────────────────────────────
// 2. 配额公式
// ───────────────────────────────────────────────
describe("配额公式: limit = 5 + floor(points / 10)", () => {
  function calcLimit(points: number, isMember: boolean): number {
    if (isMember) return -1; // 无限制
    return FREE_PERMANENT_LIMIT + Math.floor(points / POINTS_PER_UPLOAD);
  }

  it("0 积分 → 最多 5 个链接", () => {
    expect(calcLimit(0, false)).toBe(5);
  });

  it("9 积分 → 最多 5 个链接（不足10分不增加）", () => {
    expect(calcLimit(9, false)).toBe(5);
  });

  it("10 积分 → 最多 6 个链接", () => {
    expect(calcLimit(10, false)).toBe(6);
  });

  it("50 积分 → 最多 10 个链接", () => {
    expect(calcLimit(50, false)).toBe(10);
  });

  it("99 积分 → 最多 14 个链接（floor(99/10)=9）", () => {
    expect(calcLimit(99, false)).toBe(14);
  });

  it("100 积分 → 最多 15 个链接", () => {
    expect(calcLimit(100, false)).toBe(15);
  });

  it("会员 → 无限制（返回 -1）", () => {
    expect(calcLimit(50, true)).toBe(-1);
  });
});

// ───────────────────────────────────────────────
// 3. 扣分公式
// ───────────────────────────────────────────────
describe("扣分公式: newPoints = max(0, points - amount)", () => {
  function calcNewPoints(points: number, amount: number): number {
    return Math.max(0, points - amount);
  }

  it("50 - 10 = 40", () => {
    expect(calcNewPoints(50, 10)).toBe(40);
  });

  it("10 - 10 = 0", () => {
    expect(calcNewPoints(10, 10)).toBe(0);
  });

  it("5 - 10 = 0（不会变负数）", () => {
    expect(calcNewPoints(5, 10)).toBe(0);
  });

  it("0 - 10 = 0", () => {
    expect(calcNewPoints(0, 10)).toBe(0);
  });
});

// ───────────────────────────────────────────────
// 4. deductPointsAndAddBonus 函数（mock D1）
// ───────────────────────────────────────────────
describe("deductPointsAndAddBonus（mock D1）", () => {
  function createMockD1(initialPoints: number) {
    let points = initialPoints;
    let linksLimitBonus = 0;
    return {
      prepare: (sql: string) => ({
        bind: (...args: unknown[]) => ({
          run: async () => {
            if (sql.includes("UPDATE")) {
              // UPDATE user SET points = MAX(0, points - ?), links_limit_bonus = links_limit_bonus + 1 WHERE id = ?
              const amount = args[0] as number;
              points = Math.max(0, points - amount);
              linksLimitBonus++;
            }
            return { success: true };
          },
          all: async () => {
            if (sql.includes("SELECT points")) {
              return { results: [{ points }] };
            }
            return { results: [] };
          },
        }),
      }),
      getLinksLimitBonus: () => linksLimitBonus,
    };
  }

  it("50 积分扣除 10 → 返回 40，bonus +1", async () => {
    const d1 = createMockD1(50) as any;
    const result = await deductPointsAndAddBonus(d1, "user1", 10);
    expect(result).toBe(40);
    expect(d1.getLinksLimitBonus()).toBe(1);
  });

  it("10 积分扣除 10 → 返回 0，bonus +1", async () => {
    const d1 = createMockD1(10) as any;
    const result = await deductPointsAndAddBonus(d1, "user1", 10);
    expect(result).toBe(0);
    expect(d1.getLinksLimitBonus()).toBe(1);
  });

  it("5 积分扣除 10 → 返回 0（不为负数），bonus +1", async () => {
    const d1 = createMockD1(5) as any;
    const result = await deductPointsAndAddBonus(d1, "user1", 10);
    expect(result).toBe(0);
    expect(d1.getLinksLimitBonus()).toBe(1);
  });

  it("0 积分扣除 10 → 返回 0，bonus +1", async () => {
    const d1 = createMockD1(0) as any;
    const result = await deductPointsAndAddBonus(d1, "user1", 10);
    expect(result).toBe(0);
    expect(d1.getLinksLimitBonus()).toBe(1);
  });

  it("连续扣分：50→40→30→20→10→0，bonus 依次递增", async () => {
    const d1 = createMockD1(50) as any;
    expect(await deductPointsAndAddBonus(d1, "u", 10)).toBe(40);
    expect(d1.getLinksLimitBonus()).toBe(1);
    expect(await deductPointsAndAddBonus(d1, "u", 10)).toBe(30);
    expect(d1.getLinksLimitBonus()).toBe(2);
    expect(await deductPointsAndAddBonus(d1, "u", 10)).toBe(20);
    expect(d1.getLinksLimitBonus()).toBe(3);
    expect(await deductPointsAndAddBonus(d1, "u", 10)).toBe(10);
    expect(d1.getLinksLimitBonus()).toBe(4);
    expect(await deductPointsAndAddBonus(d1, "u", 10)).toBe(0);
    expect(d1.getLinksLimitBonus()).toBe(5);
    // 再扣不变
    expect(await deductPointsAndAddBonus(d1, "u", 10)).toBe(0);
    expect(d1.getLinksLimitBonus()).toBe(6);
  });
});

// ───────────────────────────────────────────────
// 5. 前端条件判断逻辑
// ───────────────────────────────────────────────
describe("前端条件判断", () => {
  function needsPoints(
    isLoggedIn: boolean,
    isMember: boolean,
    pageCount: number
  ): boolean {
    return isLoggedIn && !isMember && pageCount >= FREE_PERMANENT_LIMIT;
  }

  function canAfford(points: number): boolean {
    return points >= POINTS_PER_UPLOAD;
  }

  describe("needsPoints: 是否需要扣分", () => {
    it("未登录 → 不需要", () => {
      expect(needsPoints(false, false, 0)).toBe(false);
    });

    it("会员 → 不需要", () => {
      expect(needsPoints(true, true, 10)).toBe(false);
    });

    it("4 个链接 → 不需要（未超免费额度）", () => {
      expect(needsPoints(true, false, 4)).toBe(false);
    });

    it("5 个链接 → 需要（达到免费额度上限）", () => {
      expect(needsPoints(true, false, 5)).toBe(true);
    });

    it("10 个链接 → 需要", () => {
      expect(needsPoints(true, false, 10)).toBe(true);
    });
  });

  describe("canAfford: 积分是否足够", () => {
    it("0 积分 → 不够", () => {
      expect(canAfford(0)).toBe(false);
    });

    it("9 积分 → 不够", () => {
      expect(canAfford(9)).toBe(false);
    });

    it("10 积分 → 够", () => {
      expect(canAfford(10)).toBe(true);
    });

    it("50 积分 → 够", () => {
      expect(canAfford(50)).toBe(true);
    });
  });
});

// ───────────────────────────────────────────────
// 6. 完整场景模拟
// ───────────────────────────────────────────────
describe("完整场景：新用户发布链接", () => {
  it("50 积分用户：前5个免费，第6-10个各花10积分，bonus 从0增到5", () => {
    let points = DEFAULT_POINTS;
    let bonus = 0;
    let pageCount = 0;
    const isMember = false;

    function getLimit() {
      return FREE_PERMANENT_LIMIT + bonus;
    }

    // 前5个免费（不超过免费额度，不花积分，不增加bonus）
    for (let i = 0; i < 5; i++) {
      const needDeduct = pageCount >= FREE_PERMANENT_LIMIT;
      expect(needDeduct).toBe(false);
      pageCount++;
    }
    expect(points).toBe(50);
    expect(bonus).toBe(0);
    expect(pageCount).toBe(5);
    expect(getLimit()).toBe(5);

    // 第6-10个各扣10分，bonus +1
    for (let i = 0; i < 5; i++) {
      const needDeduct = !isMember && pageCount >= FREE_PERMANENT_LIMIT;
      expect(needDeduct).toBe(true);
      expect(points >= POINTS_PER_UPLOAD).toBe(true);
      points = Math.max(0, points - POINTS_PER_UPLOAD);
      bonus++;
      pageCount++;
    }
    expect(points).toBe(0);
    expect(bonus).toBe(5);
    expect(pageCount).toBe(10);
    expect(getLimit()).toBe(10);

    // 第11个失败（积分不足）
    expect(points < POINTS_PER_UPLOAD).toBe(true);
  });

  it("删除链接后 limit 不变", () => {
    let points = 30;
    let bonus = 0;
    let pageCount = 0;

    function getLimit() {
      return FREE_PERMANENT_LIMIT + bonus;
    }

    // 前5个免费
    pageCount = 5;

    // 第6-8个各扣10分
    for (let i = 0; i < 3; i++) {
      points -= POINTS_PER_UPLOAD;
      bonus++;
      pageCount++;
    }
    expect(points).toBe(0);
    expect(bonus).toBe(3);
    expect(getLimit()).toBe(8);

    // 删除2个链接，pageCount减少但limit不变
    pageCount -= 2;
    expect(pageCount).toBe(6);
    expect(getLimit()).toBe(8);
  });
});
