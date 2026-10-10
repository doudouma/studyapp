// public/games/outbreak/rules.js
/**
 * 末世配送 纯规则（ES module，浏览器与 vitest 共用）
 * 不含 DOM / three.js，仅数据变换。
 */

/** 每类僵尸的每秒感染贡献（door-open 暴露时） */
export const ZOMBIE_INFECTION = {
  walker: 6,
  spitter: 0, // spitter 为命中爆发，见 SPIT_INFECTION
  sprayer: 0, // sprayer 为向下喷淋命中爆发，见 SPRAY_INFECTION
  runner: 0,  // runner 为扑击爆发，见 LUNGE_INFECTION
  brute: 15,
};

/** 喷酸/扑击/下喷的爆发感染 */
export const SPIT_INFECTION = 12;
export const LUNGE_INFECTION = 20;
export const SPRAY_INFECTION = 14;

/** 各包裹基础分 */
export const PACKAGE_POINTS = {
  normal: 100,
  express: 250,
  fragile: 200,
  vaccine: 150,
  bio: 300,
};

/** combo 倍率：min(3, 1 + 0.1*(combo-1)) */
export function comboMultiplier(combo) {
  const c = Math.max(1, combo | 0);
  return Math.min(3, 1 + 0.1 * (c - 1));
}

/** 单件得分：基础分 × 倍率，四舍五入到十位 */
export function packageScore(type, combo) {
  const base = PACKAGE_POINTS[type] ?? PACKAGE_POINTS.normal;
  return Math.round((base * comboMultiplier(combo)) / 10) * 10;
}

/**
 * 每秒感染增量（只会增长，永不下降）。
 * types: 当前威胁半径内的僵尸类型数组；scale: 难度感染系数（>=1）。
 * 无威胁时返回 0（感染保持不变）。
 */
export function infectionPerSecond(types, scale = 1) {
  if (!types || types.length === 0) return 0;
  let per = 0;
  for (const t of types) per += ZOMBIE_INFECTION[t] ?? 0;
  if (per <= 0) per = 2; // 只有 spitter/runner 在近距时给一个基础威胁
  return per * scale;
}

/** 每 30 秒一个强度台阶 */
const STEP_SEC = 30;

/**
 * 依据存活秒数与送达数返回当前难度。
 * @returns {{ zombieDensity:number, spawnRate:number, infectionScale:number, unlocked:string[] }}
 */
export function difficultyAt(elapsedSec, delivered) {
  const step = Math.floor(Math.max(0, elapsedSec) / STEP_SEC) + Math.floor(delivered / 8);
  const zombieDensity = Math.min(12, 2 + step);
  const spawnRate = Math.min(4, 1 + step * 0.15);
  const infectionScale = Math.min(3, 1 + step * 0.08);
  const unlocked = ["walker"];
  if (elapsedSec >= STEP_SEC * 0.5) unlocked.push("sprayer");
  if (elapsedSec >= STEP_SEC * 1) unlocked.push("spitter");
  if (elapsedSec >= STEP_SEC * 2) unlocked.push("runner");
  if (elapsedSec >= STEP_SEC * 3) unlocked.push("brute");
  return { zombieDensity, spawnRate, infectionScale, unlocked };
}

/**
 * 结算评级：按送达件数（快递为准），与感染值无关。
 */
export function rankFor(delivered) {
  if (delivered >= 50) return "S";
  if (delivered >= 30) return "A";
  if (delivered >= 15) return "B";
  return "C";
}
