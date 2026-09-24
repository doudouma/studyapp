import { describe, it, expect } from "vitest";
import { hashStr, mulberry32, deriveBadge } from "~/components/petbadge/PetBadgeApp";

// ===== hashStr (FNV-1a 32-bit) =====
describe("hashStr", () => {
  it("空串返回 FNV offset basis", () => {
    expect(hashStr("")).toBe(2166136261);
  });

  it("命中已知 FNV-1a 向量", () => {
    expect(hashStr("a")).toBe(3826002220); // 0xE40C292C
    expect(hashStr("猫咪:123")).toBe(1714721434);
  });

  it("确定性：同输入同输出", () => {
    expect(hashStr("paw&claw")).toBe(hashStr("paw&claw"));
  });

  it("不同输入得到不同 hash（采样）", () => {
    const inputs = ["a", "b", "c", "Tom", "Tom:1", "Tom:2", " puss"];
    expect(new Set(inputs.map(hashStr)).size).toBe(inputs.length);
  });

  it("返回无符号 32 位整数", () => {
    for (const s of ["", "x", "中文", "123456"]) {
      const h = hashStr(s);
      expect(Number.isInteger(h)).toBe(true);
      expect(h).toBeGreaterThanOrEqual(0);
      expect(h).toBeLessThanOrEqual(0xffffffff);
    }
  });
});

// ===== mulberry32 =====
describe("mulberry32", () => {
  it("同 seed 产出完全相同的序列", () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });

  it("命中参考值", () => {
    const r = mulberry32(42);
    expect(r()).toBeCloseTo(0.6011037519201636, 12);
    expect(r()).toBeCloseTo(0.44829055899754167, 12);
    expect(r()).toBeCloseTo(0.8524657934904099, 12);
  });

  it("不同 seed 序列发散", () => {
    expect(mulberry32(1)()).not.toBe(mulberry32(2)());
  });

  it("1000 次采样全部落在 [0,1)", () => {
    const r = mulberry32(123456);
    for (let i = 0; i < 1000; i++) {
      const v = r();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

// ===== deriveBadge =====
// 固定输入的完整期望值（由实现推导，锁定行为防止回归）
const AVATAR = "data:image/png;base64,AAAA"; // length 26

describe("deriveBadge", () => {
  it("同名同照片 → 徽章完全一致（可复现）", () => {
    expect(deriveBadge("Tom", AVATAR, "20260101")).toEqual(
      deriveBadge("Tom", AVATAR, "20260101")
    );
  });

  it("固定输入命中精确期望值", () => {
    expect(deriveBadge("Tom", AVATAR, "20260101")).toEqual({
      jobIdx: 13,
      hrIdx: 1,
      payIdx: 0,
      vals: [82, 84, 92, 97, 69, 43],
      no: "PCP-20260101-001",
      code: "PET 8850 7188",
    });
  });

  it("名字不同 → 徽章不同", () => {
    const a = deriveBadge("Tom", AVATAR, "20260101");
    const b = deriveBadge("Jerry", AVATAR, "20260101");
    expect(a).not.toEqual(b);
  });

  it("照片（长度）参与 seed", () => {
    const a = deriveBadge("Tom", AVATAR, "20260101");
    const b = deriveBadge("Tom", AVATAR + "x", "20260101");
    expect(a.jobIdx).not.toBe(b.jobIdx);
    expect(a.code).not.toBe(b.code);
  });

  it("dateStr 注入工号日期，空名字也能生成", () => {
    const b = deriveBadge("", AVATAR, "20260101");
    expect(b.no).toBe("PCP-20260101-036");
    expect(b.jobIdx).toBe(14);
  });

  it("500 组 seed 下所有字段都在合法范围内", () => {
    for (let i = 0; i < 500; i++) {
      const b = deriveBadge(`pet${i}`, `${"d".repeat(i + 1)}`, "20260101");
      expect(b.jobIdx).toBeGreaterThanOrEqual(0);
      expect(b.jobIdx).toBeLessThanOrEqual(15);
      expect(b.hrIdx).toBeGreaterThanOrEqual(0);
      expect(b.hrIdx).toBeLessThanOrEqual(6);
      expect(b.payIdx).toBeGreaterThanOrEqual(0);
      expect(b.payIdx).toBeLessThanOrEqual(6);
      expect(b.vals).toHaveLength(6);
      for (const v of b.vals) {
        expect(v).toBeGreaterThanOrEqual(38);
        expect(v).toBeLessThanOrEqual(99);
      }
      expect(b.no).toMatch(/^PCP-\d{8}-\d{3}$/);
      expect(b.no.endsWith("-000")).toBe(false);
      expect(b.code).toMatch(/^PET \d{4} \d{4}$/);
    }
  });

  it("默认日期为当天（YYYYMMDD）", () => {
    const d = new Date();
    const today = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
    expect(deriveBadge("Tom", AVATAR).no).toMatch(new RegExp(`^PCP-${today}-\\d{3}$`));
  });
});
