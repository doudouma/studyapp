import { describe, it, expect } from "vitest";
import { OUTBREAK_TOP_LIMIT } from "@shared/types/outbreak";
import {
  comboMultiplier,
  packageScore,
  infectionPerSecond,
  difficultyAt,
  rankFor,
} from "../public/games/outbreak/rules.js";

describe("outbreak shared constants", () => {
  it("TOP 上限为 100", () => {
    expect(OUTBREAK_TOP_LIMIT).toBe(100);
  });
});

describe("comboMultiplier", () => {
  it("0/1 连击为 1x", () => {
    expect(comboMultiplier(0)).toBe(1);
    expect(comboMultiplier(1)).toBe(1);
  });
  it("每 +1 连击 +0.1，最高 3x", () => {
    expect(comboMultiplier(2)).toBeCloseTo(1.1);
    expect(comboMultiplier(11)).toBeCloseTo(2.0);
    expect(comboMultiplier(100)).toBe(3);
  });
});

describe("packageScore", () => {
  it("普通件基础 100 × 倍率，四舍五入到十位", () => {
    expect(packageScore("normal", 1)).toBe(100);
    expect(packageScore("normal", 2)).toBe(110);
  });
  it("疫苗件 150、生物样本 300", () => {
    expect(packageScore("vaccine", 1)).toBe(150);
    expect(packageScore("bio", 1)).toBe(300);
  });
});

describe("infectionPerSecond", () => {
  it("无僵尸时为 0（感染只增不减）", () => {
    expect(infectionPerSecond([], 1)).toBe(0);
  });
  it("含 walker 时为正，且随难度系数放大", () => {
    const base = infectionPerSecond(["walker"], 1);
    expect(base).toBeGreaterThan(0);
    expect(infectionPerSecond(["walker"], 1.5)).toBeGreaterThan(base);
  });
  it("brute 比 walker 更狠", () => {
    expect(infectionPerSecond(["brute"], 1)).toBeGreaterThan(infectionPerSecond(["walker"], 1));
  });
});

describe("difficultyAt", () => {
  it("0 秒时不解锁特殊僵尸", () => {
    expect(difficultyAt(0, 0).unlocked).toEqual(["walker"]);
  });
  it("随时间解锁 sprayer/spitter/runner/brute", () => {
    expect(difficultyAt(60, 0).unlocked).toContain("sprayer");
    expect(difficultyAt(120, 0).unlocked).toContain("spitter");
    expect(difficultyAt(240, 0).unlocked).toContain("runner");
    expect(difficultyAt(360, 0).unlocked).toContain("brute");
  });
  it("密度/感染系数单调不减", () => {
    expect(difficultyAt(600, 50).zombieDensity).toBeGreaterThanOrEqual(difficultyAt(0, 0).zombieDensity);
    expect(difficultyAt(600, 50).infectionScale).toBeGreaterThanOrEqual(difficultyAt(0, 0).infectionScale);
  });
});

describe("rankFor", () => {
  it("按送达件数评级（快递为准）", () => {
    expect(rankFor(0)).toBe("C");
    expect(rankFor(60)).toBe("S");
    expect(rankFor(40)).toBe("A");
    expect(rankFor(20)).toBe("B");
  });
});
