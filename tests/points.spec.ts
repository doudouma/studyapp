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
describe("配额公式: limit = 5 + bonus", () => {
  function calcLimit(bonus: number, isMember: boolean): number {
    if (isMember) return -1; // 无限制
    return FREE_PERMANENT_LIMIT + bonus;
  }

  it("bonus=0 → 最多 5 个链接", () => {
    expect(calcLimit(0, false)).toBe(5);
  });

  it("bonus=1 → 最多 6 个链接", () => {
    expect(calcLimit(1, false)).toBe(6);
  });

  it("bonus=5 → 最多 10 个链接", () => {
    expect(calcLimit(5, false)).toBe(10);
  });

  it("会员 → 无限制（返回 -1）", () => {
    expect(calcLimit(5, true)).toBe(-1);
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
    pageCount: number,
    limit: number
  ): boolean {
    return isLoggedIn && !isMember && limit > 0 && pageCount >= limit;
  }

  function canAfford(points: number): boolean {
    return points >= POINTS_PER_UPLOAD;
  }

  describe("needsPoints: 是否需要扣分", () => {
    it("未登录 → 不需要", () => {
      expect(needsPoints(false, false, 0, 5)).toBe(false);
    });

    it("会员 → 不需要", () => {
      expect(needsPoints(true, true, 10, -1)).toBe(false);
    });

    it("4 个链接，limit=5 → 不需要", () => {
      expect(needsPoints(true, false, 4, 5)).toBe(false);
    });

    it("5 个链接，limit=5 → 需要", () => {
      expect(needsPoints(true, false, 5, 5)).toBe(true);
    });

    it("10 个链接，limit=5 → 需要", () => {
      expect(needsPoints(true, false, 10, 5)).toBe(true);
    });

    it("5 个链接，limit=6（有bonus）→ 不需要", () => {
      expect(needsPoints(true, false, 5, 6)).toBe(false);
    });

    it("6 个链接，limit=6（有bonus）→ 需要", () => {
      expect(needsPoints(true, false, 6, 6)).toBe(true);
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
// 6. 服务端配额判断逻辑
// ───────────────────────────────────────────────
describe("服务端配额判断: pageCount >= FREE_PERMANENT_LIMIT + bonus", () => {
  function shouldDeduct(pageCount: number, bonus: number, isMember: boolean): boolean {
    if (isMember) return false;
    const userLimit = FREE_PERMANENT_LIMIT + bonus;
    return pageCount >= userLimit;
  }

  it("bonus=0, pageCount=4 → 不扣", () => {
    expect(shouldDeduct(4, 0, false)).toBe(false);
  });

  it("bonus=0, pageCount=5 → 扣", () => {
    expect(shouldDeduct(5, 0, false)).toBe(true);
  });

  it("bonus=1, pageCount=5 → 不扣（有bonus余量）", () => {
    expect(shouldDeduct(5, 1, false)).toBe(false);
  });

  it("bonus=1, pageCount=6 → 扣", () => {
    expect(shouldDeduct(6, 1, false)).toBe(true);
  });

  it("bonus=3, pageCount=6 → 不扣（删除后低于limit）", () => {
    expect(shouldDeduct(6, 3, false)).toBe(false);
  });

  it("bonus=3, pageCount=8 → 扣", () => {
    expect(shouldDeduct(8, 3, false)).toBe(true);
  });

  it("会员 → 永不扣", () => {
    expect(shouldDeduct(100, 0, true)).toBe(false);
  });
});

// ───────────────────────────────────────────────
// 7. 完整场景模拟
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
    for (let i = 0; i < 5; i++) {
      pageCount++;
    }

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

  it("删除后重新发布：pageCount < limit 则不扣积分", () => {
    let points = 30;
    let bonus = 0;
    let pageCount = 0;

    function getLimit() {
      return FREE_PERMANENT_LIMIT + bonus;
    }

    function shouldDeduct(): boolean {
      return pageCount >= getLimit();
    }

    // 前5个免费（pageCount 0→4 都 < 5）
    for (let i = 0; i < 5; i++) {
      expect(shouldDeduct()).toBe(false);
      pageCount++;
    }
    expect(pageCount).toBe(5);
    expect(getLimit()).toBe(5);

    // 第6个：pageCount(5) >= limit(5)，需要积分
    expect(shouldDeduct()).toBe(true);
    points -= POINTS_PER_UPLOAD;
    bonus++;
    pageCount++;
    expect(getLimit()).toBe(6);

    // 第7个：pageCount(6) >= limit(6)，需要积分
    expect(shouldDeduct()).toBe(true);
    points -= POINTS_PER_UPLOAD;
    bonus++;
    pageCount++;
    expect(getLimit()).toBe(7);

    // 删除1个链接
    pageCount--;
    expect(pageCount).toBe(6);
    expect(getLimit()).toBe(7);

    // 重新发布：pageCount(6) < limit(7)，不扣积分
    expect(shouldDeduct()).toBe(false);

    // 再发布一个：pageCount(7) == limit(7)，需要积分
    pageCount++;
    expect(shouldDeduct()).toBe(true);
    points -= POINTS_PER_UPLOAD;
    bonus++;
    expect(getLimit()).toBe(8);
  });

  it("删除到免费额度以下：不扣积分且bonus保持", () => {
    let points = 40;
    let bonus = 0;
    let pageCount = 0;

    function getLimit() {
      return FREE_PERMANENT_LIMIT + bonus;
    }

    // 前5个免费
    for (let i = 0; i < 5; i++) {
      pageCount++;
    }

    // 第6个扣分+bonus
    points -= POINTS_PER_UPLOAD;
    bonus++;
    pageCount++;
    expect(getLimit()).toBe(6);
    expect(points).toBe(30);

    // 连续删除5个，pageCount=1
    pageCount -= 5;
    expect(pageCount).toBe(1);
    expect(getLimit()).toBe(6);
    expect(bonus).toBe(1);

    // 重新发布5个免费链接，不扣积分
    for (let i = 0; i < 5; i++) {
      expect(pageCount < getLimit()).toBe(true);
      pageCount++;
    }
    expect(points).toBe(30); // 积分未变
    expect(bonus).toBe(1);   // bonus未变
  });
});
