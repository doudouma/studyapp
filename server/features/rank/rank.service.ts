import {
  RANK_DIFFS,
  type RankDiff,
  type RankEntry,
  type RankGetResponse,
  type RankMine,
  type RankPostResponse,
} from "@shared/types/deliveryrush";
import * as repo from "./rank.repo";

/**
 * Delivery Rush 排行榜业务逻辑层 (Service)
 */

const TOP_LIMIT = 100;
/** 同设备提交限流：10 秒内最多 1 条 */
const RATE_WINDOW_MS = 10_000;
/** 记录保留 90 天 */
const RETENTION_MS = 90 * 24 * 60 * 60 * 1000;

export function isValidDiff(diff: unknown): diff is RankDiff {
  return typeof diff === "string" && (RANK_DIFFS as readonly string[]).includes(diff);
}

/** GET /api/rank?diff= */
export async function getRanking(
  d1: D1Database,
  diff: RankDiff,
  playerKey: string | null
): Promise<RankGetResponse> {
  const [top, best] = await Promise.all([
    repo.getTop(d1, diff, TOP_LIMIT),
    playerKey ? repo.getBest(d1, diff, playerKey) : Promise.resolve(null),
  ]);

  const entries: RankEntry[] = top.map((r) => ({
    name: r.name,
    score: r.score,
    del: r.delivered,
    combo: r.combo,
    ...(playerKey && r.playerKey === playerKey ? { me: true } : {}),
  }));

  let mine: RankMine | null = null;
  if (best) {
    const above = await repo.countAbove(d1, diff, best.score);
    const rank = above + 1;
    mine = { rank, score: best.score, inTop: rank <= TOP_LIMIT };
  }

  return { top: entries, mine };
}

/** POST /api/rank — 仅当分数刷新个人最佳时入库 */
export async function registerScore(
  d1: D1Database,
  input: { diff: RankDiff; name: string; score: number; delivered: number; combo: number; playerKey: string }
): Promise<RankPostResponse | { error: "rate_limited" } | { error: "invalid" }> {
  const { diff, playerKey } = input;
  const name = input.name.trim().slice(0, 12) || "Player";
  const score = Math.floor(input.score);
  const delivered = Math.floor(input.delivered);
  const combo = Math.floor(input.combo);

  // 基本范围校验（防刷：单局得分理论上限远低于此值）
  if (
    score < 0 || score > 10_000_000 ||
    delivered < 0 || delivered > 9_999 ||
    combo < 0 || combo > 9_999
  ) {
    return { error: "invalid" };
  }

  // 限流
  const recent = await repo.countRecentByPlayer(d1, playerKey, Date.now() - RATE_WINDOW_MS);
  if (recent > 0) return { error: "rate_limited" };

  const best = await repo.getBest(d1, diff, playerKey);
  if (best && best.score >= score) {
    const above = await repo.countAbove(d1, diff, best.score);
    const rank = above + 1;
    return { updated: false, best: best.score, mine: { rank, score: best.score, inTop: rank <= TOP_LIMIT } };
  }

  await repo.insertScore(d1, { diff, name, score, delivered, combo, playerKey });
  const above = await repo.countAbove(d1, diff, score);
  const rank = above + 1;
  return { updated: true, best: score, mine: { rank, score, inTop: rank <= TOP_LIMIT } };
}

/** cron 清理：删除 90 天前的记录 */
export async function cleanupOldRecords(d1: D1Database): Promise<void> {
  await repo.deleteOlderThan(d1, Date.now() - RETENTION_MS);
}
