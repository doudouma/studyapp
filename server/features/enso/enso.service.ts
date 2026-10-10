import {
  ENSO_TOP_LIMIT,
  type EnsoRankEntry,
  type EnsoRankGetResponse,
  type EnsoRankMine,
  type EnsoRankPostResponse,
} from "@shared/types/enso";
import * as repo from "./enso.repo";

/**
 * Enso (一笔禅圆) 排行榜业务逻辑层 (Service)
 */

/** 同设备提交限流：10 秒内最多 1 条 */
const RATE_WINDOW_MS = 10_000;
/** 记录保留 90 天 */
const RETENTION_MS = 90 * 24 * 60 * 60 * 1000;

/** GET /api/enso/rank */
export async function getRanking(
  d1: D1Database,
  playerKey: string | null
): Promise<EnsoRankGetResponse> {
  const [top, best] = await Promise.all([
    repo.getTop(d1, ENSO_TOP_LIMIT),
    playerKey ? repo.getBest(d1, playerKey) : Promise.resolve(null),
  ]);

  const entries: EnsoRankEntry[] = top.map((r) => ({
    name: r.name,
    score: r.score,
    passed: r.passed,
    avg: r.avg,
    ...(playerKey && r.playerKey === playerKey ? { me: true } : {}),
  }));

  let mine: EnsoRankMine | null = null;
  if (best) {
    const above = await repo.countAbove(d1, best.score);
    const rank = above + 1;
    mine = { rank, score: best.score, inTop: rank <= ENSO_TOP_LIMIT };
  }

  return { top: entries, mine };
}

/** POST /api/enso/rank — 仅当分数刷新个人最佳时入库 */
export async function registerScore(
  d1: D1Database,
  input: { name: string; score: number; passed: number; avg: number; playerKey: string }
): Promise<EnsoRankPostResponse | { error: "rate_limited" } | { error: "invalid" }> {
  const { playerKey } = input;
  const name = input.name.trim().slice(0, 12) || "Player";
  const score = Math.floor(input.score);
  const passed = Math.floor(input.passed);
  const avg = Math.floor(input.avg);

  // 基本范围校验（防刷：单局得分理论上限远低于此值）
  if (
    score < 0 || score > 100_000_000 ||
    passed < 0 || passed > 9_999 ||
    avg < 0 || avg > 100
  ) {
    return { error: "invalid" };
  }

  // 限流
  const recent = await repo.countRecentByPlayer(d1, playerKey, Date.now() - RATE_WINDOW_MS);
  if (recent > 0) return { error: "rate_limited" };

  const best = await repo.getBest(d1, playerKey);
  if (best && best.score >= score) {
    const above = await repo.countAbove(d1, best.score);
    const rank = above + 1;
    return { updated: false, best: best.score, mine: { rank, score: best.score, inTop: rank <= ENSO_TOP_LIMIT } };
  }

  await repo.insertScore(d1, { name, score, passed, avg, playerKey });
  const above = await repo.countAbove(d1, score);
  const rank = above + 1;
  return { updated: true, best: score, mine: { rank, score, inTop: rank <= ENSO_TOP_LIMIT } };
}

/** cron 清理：删除 90 天前的记录 */
export async function cleanupOldEnsoRecords(d1: D1Database): Promise<void> {
  await repo.deleteOlderThan(d1, Date.now() - RETENTION_MS);
}
