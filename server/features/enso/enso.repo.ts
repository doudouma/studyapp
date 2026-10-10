import { and, asc, desc, eq, gt, lt, sql } from "drizzle-orm";
import { createDb } from "../../db";
import { ensoRank } from "../../db/schema";

/**
 * Enso (一笔禅圆) 排行榜数据访问层 (Repo)
 * 只做 Drizzle 查询，不感知 HTTP
 */

export interface EnsoRankRow {
  name: string;
  score: number;
  passed: number;
  avg: number;
  playerKey: string;
}

const COLUMNS = {
  name: ensoRank.name,
  score: ensoRank.score,
  passed: ensoRank.passed,
  avg: ensoRank.avg,
  playerKey: ensoRank.playerKey,
} as const;

/** 全局 TOP100（并列分按先到先排） */
export async function getTop(d1: D1Database, limit = 100): Promise<EnsoRankRow[]> {
  const db = createDb(d1);
  return db
    .select(COLUMNS)
    .from(ensoRank)
    .orderBy(desc(ensoRank.score), asc(ensoRank.createdAt))
    .limit(limit);
}

/** 设备的个人最佳（无记录返回 null） */
export async function getBest(d1: D1Database, playerKey: string): Promise<EnsoRankRow | null> {
  const db = createDb(d1);
  const rows = await db
    .select(COLUMNS)
    .from(ensoRank)
    .where(eq(ensoRank.playerKey, playerKey))
    .orderBy(desc(ensoRank.score))
    .limit(1);
  return rows[0] ?? null;
}

/** 该分数之前的记录数（排名 = count + 1） */
export async function countAbove(d1: D1Database, score: number): Promise<number> {
  const db = createDb(d1);
  const rows = await db
    .select({ n: sql<number>`count(*)` })
    .from(ensoRank)
    .where(gt(ensoRank.score, score));
  return rows[0]?.n ?? 0;
}

/** 插入新纪录 */
export async function insertScore(
  d1: D1Database,
  row: { name: string; score: number; passed: number; avg: number; playerKey: string }
): Promise<void> {
  const db = createDb(d1);
  await db.insert(ensoRank).values({ ...row, createdAt: Date.now() });
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
    .from(ensoRank)
    .where(and(eq(ensoRank.playerKey, playerKey), gt(ensoRank.createdAt, sinceMs)));
  return rows[0]?.n ?? 0;
}

/** 清理 90 天前的旧记录（供 cron 复用） */
export async function deleteOlderThan(d1: D1Database, cutoff: number): Promise<void> {
  const db = createDb(d1);
  await db.delete(ensoRank).where(lt(ensoRank.createdAt, cutoff));
}
