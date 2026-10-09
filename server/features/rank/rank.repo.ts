import { and, asc, desc, eq, gt, lt, sql } from "drizzle-orm";
import { createDb } from "../../db";
import { deliveryRank } from "../../db/schema";

/**
 * Delivery Rush 排行榜数据访问层 (Repo)
 * 只做 Drizzle 查询，不感知 HTTP
 */

export interface RankRow {
  name: string;
  score: number;
  delivered: number;
  combo: number;
  playerKey: string;
}

/** 某难度的 TOP100（并列分按先到先排） */
export async function getTop(
  d1: D1Database,
  diff: string,
  limit = 100
): Promise<RankRow[]> {
  const db = createDb(d1);
  return db
    .select({
      name: deliveryRank.name,
      score: deliveryRank.score,
      delivered: deliveryRank.delivered,
      combo: deliveryRank.combo,
      playerKey: deliveryRank.playerKey,
    })
    .from(deliveryRank)
    .where(eq(deliveryRank.diff, diff))
    .orderBy(desc(deliveryRank.score), asc(deliveryRank.createdAt))
    .limit(limit);
}

/** 设备在某难度的个人最佳（无记录返回 null） */
export async function getBest(
  d1: D1Database,
  diff: string,
  playerKey: string
): Promise<RankRow | null> {
  const db = createDb(d1);
  const rows = await db
    .select({
      name: deliveryRank.name,
      score: deliveryRank.score,
      delivered: deliveryRank.delivered,
      combo: deliveryRank.combo,
      playerKey: deliveryRank.playerKey,
    })
    .from(deliveryRank)
    .where(and(eq(deliveryRank.diff, diff), eq(deliveryRank.playerKey, playerKey)))
    .orderBy(desc(deliveryRank.score))
    .limit(1);
  return rows[0] ?? null;
}

/** 该分数之前的记录数（排名 = count + 1） */
export async function countAbove(
  d1: D1Database,
  diff: string,
  score: number
): Promise<number> {
  const db = createDb(d1);
  const rows = await db
    .select({ n: sql<number>`count(*)` })
    .from(deliveryRank)
    .where(and(eq(deliveryRank.diff, diff), gt(deliveryRank.score, score)));
  return rows[0]?.n ?? 0;
}

/** 插入新纪录 */
export async function insertScore(
  d1: D1Database,
  row: { diff: string; name: string; score: number; delivered: number; combo: number; playerKey: string }
): Promise<void> {
  const db = createDb(d1);
  await db.insert(deliveryRank).values({ ...row, createdAt: Date.now() });
}

/** 简单限流：设备最近 N 毫秒内的提交次数 */
export async function countRecentByPlayer(
  d1: D1Database,
  playerKey: string,
  sinceMs: number
): Promise<number> {
  const db = createDb(d1);
  const rows = await db
    .select({ n: sql<number>`count(*)` })
    .from(deliveryRank)
    .where(and(eq(deliveryRank.playerKey, playerKey), gt(deliveryRank.createdAt, sinceMs)));
  return rows[0]?.n ?? 0;
}

/** 清理 90 天前的旧记录（供 cron 复用） */
export async function deleteOlderThan(d1: D1Database, cutoff: number): Promise<void> {
  const db = createDb(d1);
  await db.delete(deliveryRank).where(lt(deliveryRank.createdAt, cutoff));
}
