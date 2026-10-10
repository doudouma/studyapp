import {
  OUTBREAK_TOP_LIMIT,
  type OutbreakRankEntry,
  type OutbreakRankGetResponse,
  type OutbreakRankMine,
  type OutbreakRankPostResponse,
} from "@shared/types/outbreak";
import * as repo from "./outbreak.repo";

/** 同设备提交限流：10 秒内最多 1 条 */
const RATE_WINDOW_MS = 10_000;
/** 记录保留 90 天 */
const RETENTION_MS = 90 * 24 * 60 * 60 * 1000;

/** GET /api/outbreak/rank */
export async function getRanking(
  d1: D1Database,
  playerKey: string | null
): Promise<OutbreakRankGetResponse> {
  const [top, best] = await Promise.all([
    repo.getTop(d1, OUTBREAK_TOP_LIMIT),
    playerKey ? repo.getBest(d1, playerKey) : Promise.resolve(null),
  ]);

  const entries: OutbreakRankEntry[] = top.map((r) => ({
    name: r.name,
    score: r.score,
    delivered: r.delivered,
    time: r.timeSec,
    ...(playerKey && r.playerKey === playerKey ? { me: true } : {}),
  }));

  let mine: OutbreakRankMine | null = null;
  if (best) {
    const above = await repo.countAbove(d1, best.score);
    const rank = above + 1;
    mine = { rank, score: best.score, inTop: rank <= OUTBREAK_TOP_LIMIT };
  }

  return { top: entries, mine };
}

/** POST /api/outbreak/rank — 仅当刷新个人最佳时入库 */
export async function registerScore(
  d1: D1Database,
  input: { name: string; score: number; delivered: number; time: number; playerKey: string }
): Promise<OutbreakRankPostResponse | { error: "rate_limited" } | { error: "invalid" }> {
  const { playerKey } = input;
  const name = input.name.trim().slice(0, 12) || "Player";
  const score = Math.floor(input.score);
  const delivered = Math.floor(input.delivered);
  const timeSec = Math.floor(input.time);

  if (
    score < 0 || score > 100_000_000 ||
    delivered < 0 || delivered > 99_999 ||
    timeSec < 0 || timeSec > 86_400
  ) {
    return { error: "invalid" };
  }

  const recent = await repo.countRecentByPlayer(d1, playerKey, Date.now() - RATE_WINDOW_MS);
  if (recent > 0) return { error: "rate_limited" };

  const best = await repo.getBest(d1, playerKey);
  if (best && best.score >= score) {
    const above = await repo.countAbove(d1, best.score);
    const rank = above + 1;
    return { updated: false, best: best.score, mine: { rank, score: best.score, inTop: rank <= OUTBREAK_TOP_LIMIT } };
  }

  await repo.insertScore(d1, { name, score, delivered, timeSec, playerKey });
  const above = await repo.countAbove(d1, score);
  const rank = above + 1;
  return { updated: true, best: score, mine: { rank, score, inTop: rank <= OUTBREAK_TOP_LIMIT } };
}

/** cron 清理：删除 90 天前的记录 */
export async function cleanupOldOutbreakRecords(d1: D1Database): Promise<void> {
  await repo.deleteOlderThan(d1, Date.now() - RETENTION_MS);
}
