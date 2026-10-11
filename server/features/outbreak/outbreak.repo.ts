import { and, asc, desc, eq, gt, lt, sql } from "drizzle-orm";
import { createDb } from "../../db";
import { outbreakRank } from "../../db/schema";

/**
 * Outbreak Delivery 排行榜数据访问层 (Repo)
 */

export interface OutbreakRankRow {
  name: string;
  score: number;
  delivered: number;
  timeSec: number;
  playerKey: string;
}

const COLUMNS = {
  name: outbreakRank.name,
  score: outbreakRank.score,
  delivered: outbreakRank.delivered,
  timeSec: outbreakRank.timeSec,
  playerKey: outbreakRank.playerKey,
} as const;

/** 全局 TOP（并列分按先到先排） */
export async function getTop(d1: D1Database, limit = 100): Promise<OutbreakRankRow[]> {
  const db = createDb(d1);
  return db
    .select(COLUMNS)
    .from(outbreakRank)
    .orderBy(desc(outbreakRank.score), asc(outbreakRank.createdAt))
    .limit(limit);
}

/** 设备个人最佳（无记录返回 null） */
export async function getBest(d1: D1Database, playerKey: string): Promise<OutbreakRankRow | null> {
  const db = createDb(d1);
  const rows = await db
    .select(COLUMNS)
    .from(outbreakRank)
    .where(eq(outbreakRank.playerKey, playerKey))
    .orderBy(desc(outbreakRank.score))
    .limit(1);
  return rows[0] ?? null;
}

/** 该分数之前的记录数（排名 = count + 1） */
export async function countAbove(d1: D1Database, score: number): Promise<number> {
  const db = createDb(d1);
  const rows = await db
    .select({ n: sql<number>`count(*)` })
    .from(outbreakRank)
    .where(gt(outbreakRank.score, score));
  return rows[0]?.n ?? 0;
}

/** 插入新纪录 */
export async function insertScore(
  d1: D1Database,
  row: { name: string; score: number; delivered: number; timeSec: number; playerKey: string }
): Promise<void> {
  const db = createDb(d1);
  await db.insert(outbreakRank).values({ ...row, createdAt: Date.now() });
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
    .from(outbreakRank)
    .where(and(eq(outbreakRank.playerKey, playerKey), gt(outbreakRank.createdAt, sinceMs)));
  return rows[0]?.n ?? 0;
}

/** 清理 90 天前的旧记录（供 cron 复用） */
export async function deleteOlderThan(d1: D1Database, cutoff: number): Promise<void> {
  const db = createDb(d1);
  await db.delete(outbreakRank).where(lt(outbreakRank.createdAt, cutoff));
}
