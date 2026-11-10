import { and, eq, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { createDb } from "../../db";
import { tierlistVote } from "../../db/schema";
import type { TierlistTally } from "@shared/types/tierlist";

/**
 * AI Tier List 数据访问层 (Repository)
 * 只做数据读写，不含业务规则，不感知 HTTP
 *
 * 投票是「一人一榜一工具一票」，由 (user_id, board, tool) 唯一索引兜底，
 * 因此写入直接走 upsert，不做先查后写（并发下会撞唯一约束）。
 */

/** 记录/更新一票 */
export async function upsertVote(
  d1: D1Database,
  userId: string,
  board: string,
  tool: string,
  tier: number,
): Promise<void> {
  const db = createDb(d1);
  const now = new Date();
  await db
    .insert(tierlistVote)
    .values({
      id: nanoid(12),
      userId,
      board,
      tool,
      tier,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: [tierlistVote.userId, tierlistVote.board, tierlistVote.tool],
      set: { tier, updatedAt: now },
    });
}

/** 当前用户在某榜的全部投票，返回 { tool: 档位 } */
export async function getMyVotes(
  d1: D1Database,
  userId: string,
  board: string,
): Promise<Record<string, number>> {
  const db = createDb(d1);
  const rows = await db
    .select({ tool: tierlistVote.tool, tier: tierlistVote.tier })
    .from(tierlistVote)
    .where(and(eq(tierlistVote.userId, userId), eq(tierlistVote.board, board)));

  const out: Record<string, number> = {};
  for (const row of rows) out[row.tool] = row.tier;
  return out;
}

/** 某榜的原始计数：按 工具 × 档位 分组（聚合在 service 做，repo 不做口径决定） */
export async function getTallies(
  d1: D1Database,
  board: string,
): Promise<TierlistTally[]> {
  const db = createDb(d1);
  const rows = await db
    .select({
      tool: tierlistVote.tool,
      tier: tierlistVote.tier,
      count: sql<number>`count(*)`,
    })
    .from(tierlistVote)
    .where(eq(tierlistVote.board, board))
    .groupBy(tierlistVote.tool, tierlistVote.tier);

  return rows.map((row) => ({
    tool: row.tool,
    tier: row.tier,
    count: Number(row.count),
  }));
}
