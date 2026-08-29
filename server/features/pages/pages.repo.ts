import { and, count, desc, eq, sql } from "drizzle-orm";
import { createDb } from "../../db";
import { page, user } from "../../db/schema";

/**
 * Pages 数据访问层 (Repository)
 * 只做 D1 读写，不含业务规则，不感知 HTTP
 */

/** 会员资格到期时间 (Unix 毫秒)，无记录返回 null */
export async function getMembershipExpiresAt(d1: D1Database, userId: string): Promise<number | null> {
  const rows = await d1.prepare("SELECT expires_at FROM membership WHERE user_id = ?")
    .bind(userId)
    .all<{ expires_at: number }>();
  if (rows.results.length === 0) return null;
  return Number(rows.results[0].expires_at) * 1000;
}

export async function isMemberByUserId(d1: D1Database, userId: string): Promise<boolean> {
  const expiresAt = await getMembershipExpiresAt(d1, userId);
  return expiresAt !== null && expiresAt > Date.now();
}

/** 获取用户积分 */
export async function getUserPoints(d1: D1Database, userId: string): Promise<number> {
  const db = createDb(d1);
  const rows = await db.select({ points: user.points }).from(user).where(eq(user.id, userId)).limit(1);
  return rows[0]?.points ?? 0;
}

/** 获取用户链接上限奖励（每花10积分+1，永久生效） */
export async function getUserLinksLimitBonus(d1: D1Database, userId: string): Promise<number> {
  const db = createDb(d1);
  const rows = await db.select({ linksLimitBonus: user.linksLimitBonus }).from(user).where(eq(user.id, userId)).limit(1);
  return rows[0]?.linksLimitBonus ?? 0;
}

/** 扣除用户积分并增加链接上限奖励，返回扣除后余额。原子操作 */
export async function deductPointsAndAddBonus(d1: D1Database, userId: string, amount: number): Promise<number> {
  await d1
    .prepare("UPDATE user SET points = MAX(0, points - ?), links_limit_bonus = links_limit_bonus + 1 WHERE id = ?")
    .bind(amount, userId)
    .run();
  const rows = await d1
    .prepare("SELECT points FROM user WHERE id = ?")
    .bind(userId)
    .all<{ points: number }>();
  return rows.results[0]?.points ?? 0;
}

export async function countUserPages(d1: D1Database, userId: string): Promise<number> {
  const db = createDb(d1);
  const [result] = await db.select({ count: count() }).from(page).where(eq(page.userId, userId));
  return result?.count ?? 0;
}

export interface UserPageRow {
  id: string;
  title: string | null;
  category: string | null;
  tags: string | null;
  isPermanent: boolean;
  viewCount: number;
  createdAt: Date;
  expiresAt: Date | null;
  previewPath: string | null;
}

export async function listUserPages(
  d1: D1Database,
  userId: string,
  limit: number,
  offset: number
): Promise<UserPageRow[]> {
  const db = createDb(d1);
  return db
    .select({
      id: page.id,
      title: page.title,
      category: page.category,
      tags: page.tags,
      isPermanent: page.isPermanent,
      viewCount: page.viewCount,
      createdAt: page.createdAt,
      expiresAt: page.expiresAt,
      previewPath: page.previewPath,
    })
    .from(page)
    .where(eq(page.userId, userId))
    .orderBy(desc(page.createdAt))
    .limit(limit)
    .offset(offset);
}

export interface OwnedPageRow {
  id: string;
  title: string | null;
  category: string | null;
  tags: string | null;
  isPermanent: boolean;
  viewCount: number;
  createdAt: Date;
  expiresAt: Date | null;
  previewPath: string | null;
}

export async function findOwnedPage(d1: D1Database, pageId: string, userId: string): Promise<boolean> {
  const db = createDb(d1);
  const rows = await db
    .select({ id: page.id })
    .from(page)
    .where(and(eq(page.id, pageId), eq(page.userId, userId)))
    .limit(1);
  return rows.length > 0;
}

export async function getPageRecord(d1: D1Database, pageId: string) {
  const db = createDb(d1);
  const rows = await db.select().from(page).where(eq(page.id, pageId)).limit(1);
  return rows[0] ?? null;
}

export async function insertPageRecord(d1: D1Database, values: typeof page.$inferInsert) {
  const db = createDb(d1);
  await db.insert(page).values(values);
}

export async function updatePageRecord(
  d1: D1Database,
  pageId: string,
  updates: Partial<typeof page.$inferInsert>
) {
  const db = createDb(d1);
  await db.update(page).set(updates).where(eq(page.id, pageId));
}

export async function deletePageRecord(d1: D1Database, pageId: string) {
  const db = createDb(d1);
  await db.delete(page).where(eq(page.id, pageId));
}

export async function incrementPageViewCount(d1: D1Database, pageId: string) {
  const db = createDb(d1);
  await db.update(page).set({ viewCount: sql`view_count + 1` }).where(eq(page.id, pageId));
}

/** 页面 meta（用于 /p/:id 的 SEO 注入），不存在返回 null */
export async function getPageMeta(
  d1: D1Database,
  pageId: string
): Promise<{ title: string | null; category: string | null; tags: string | null } | null> {
  const db = createDb(d1);
  const [record] = await db
    .select({ title: page.title, category: page.category, tags: page.tags })
    .from(page)
    .where(eq(page.id, pageId))
    .limit(1);
  return record ?? null;
}
