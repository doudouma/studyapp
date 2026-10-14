import { and, count, desc, eq, isNotNull, lt, sql } from "drizzle-orm";
import { createDb } from "../../db";
import { burnEvent, page, user } from "../../db/schema";

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

/**
 * 仅扣除用户积分（不增加链接上限奖励），返回扣除后余额。原子操作。
 * 用于按内容尺寸计费（尺寸费不应奖励链接额度）。
 */
export async function deductPoints(d1: D1Database, userId: string, amount: number): Promise<number> {
  await d1
    .prepare("UPDATE user SET points = MAX(0, points - ?) WHERE id = ?")
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
  const [result] = await db
    .select({ count: count() })
    .from(page)
    .where(and(eq(page.userId, userId), eq(page.state, "active")));
  return result?.count ?? 0;
}

/** 永久页面数（配额用）；到期/焚毁页面不占用永久配额 */
export async function countPermanentPages(d1: D1Database, userId: string): Promise<number> {
  const db = createDb(d1);
  const [result] = await db
    .select({ count: count() })
    .from(page)
    .where(and(eq(page.userId, userId), eq(page.isPermanent, true), eq(page.state, "active")));
  return result?.count ?? 0;
}

export interface UserPageRow {
  id: string;
  userId: string | null;
  slug: string | null;
  title: string | null;
  category: string | null;
  tags: string | null;
  isPermanent: boolean;
  viewCount: number;
  maxViews: number | null;
  state: string;
  burnReason: string | null;
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
      userId: page.userId,
      slug: page.slug,
      title: page.title,
      category: page.category,
      tags: page.tags,
      isPermanent: page.isPermanent,
      viewCount: page.viewCount,
      maxViews: page.maxViews,
      state: page.state,
      burnReason: page.burnReason,
      createdAt: page.createdAt,
      expiresAt: page.expiresAt,
      previewPath: page.previewPath,
    })
    .from(page)
    .where(and(eq(page.userId, userId), eq(page.state, "active")))
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

/** 按自定义地址查页面 id，不存在返回 null */
export async function getPageIdBySlug(d1: D1Database, slug: string): Promise<string | null> {
  const db = createDb(d1);
  const rows = await db.select({ id: page.id }).from(page).where(eq(page.slug, slug)).limit(1);
  return rows[0]?.id ?? null;
}

/** 自定义地址是否已被占用 */
export async function slugExists(d1: D1Database, slug: string): Promise<boolean> {
  const db = createDb(d1);
  const rows = await db.select({ id: page.id }).from(page).where(eq(page.slug, slug)).limit(1);
  return rows.length > 0;
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

// ---------- 到期 / 限次 / 焚毁 ----------

export interface ClaimViewResult {
  /** 是否成功占位一次访问（false = 已达上限 / 已焚毁 / 已过期） */
  claimed: boolean;
  /** 占位后的累计访问次数；未占位时为 0 */
  viewCount: number;
}

/**
 * 原子占位一次访问：仅当页面 active、未过期且未达 max_views 上限时才自增。
 * 单条条件 UPDATE + RETURNING 保证并发下不会超出 max_views。
 */
export async function claimPageView(
  d1: D1Database,
  pageId: string,
  now: number
): Promise<ClaimViewResult> {
  // expires_at 由 drizzle timestamp 模式写入，存储为 Unix 秒
  const nowSec = Math.floor(now / 1000);
  const result = await d1
    .prepare(
      `UPDATE page SET view_count = view_count + 1
       WHERE id = ? AND state = 'active'
         AND (expires_at IS NULL OR expires_at > ?)
         AND (max_views IS NULL OR view_count < max_views)
       RETURNING view_count`
    )
    .bind(pageId, nowSec)
    .all<{ view_count: number }>();
  const row = result.results?.[0];
  return { claimed: !!row, viewCount: row ? Number(row.view_count) : 0 };
}

/**
 * 标记页面已焚毁（内容已删），保留元数据供滥用处置与统计；
 * 同时撤下广场分享与缩略图引用，避免广场残留死链。
 */
export async function markPageBurned(
  d1: D1Database,
  pageId: string,
  reason: "views" | "expired" | "manual",
  burnedAt: number
): Promise<void> {
  const db = createDb(d1);
  await db
    .update(page)
    .set({
      state: "burned",
      burnReason: reason,
      burnedAt: new Date(burnedAt),
      isSharedToSquare: false,
      sharedAt: null,
      previewPath: null,
    })
    .where(eq(page.id, pageId));
}

export interface ExpiredPageRow {
  id: string;
  userId: string | null;
}

/** 列出已到期的 active 页面（cron 定时焚毁用） */
export async function listExpiredActivePages(
  d1: D1Database,
  now: number,
  limit = 200
): Promise<ExpiredPageRow[]> {
  const db = createDb(d1);
  return db
    .select({ id: page.id, userId: page.userId })
    .from(page)
    .where(and(eq(page.state, "active"), isNotNull(page.expiresAt), lt(page.expiresAt, new Date(now))))
    .limit(limit);
}

// ---------- 焚毁事件埋点 ----------

export interface BurnEventEntry {
  pageId: string;
  userId?: string | null;
  event: "created" | "burned";
  expiryPreset?: string | null;
  maxViews?: number | null;
  isOneTime: boolean;
  burnReason?: string | null;
  viewCountAtBurn?: number | null;
}

/** 写入焚毁事件（错误吞掉，绝不阻塞主流程） */
export function insertBurnEvent(d1: D1Database, entry: BurnEventEntry): Promise<void> {
  return d1
    .prepare(
      `INSERT INTO burn_event (page_id, user_id, event, expiry_preset, max_views, is_one_time, burn_reason, view_count_at_burn, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      entry.pageId,
      entry.userId ?? null,
      entry.event,
      entry.expiryPreset ?? null,
      entry.maxViews ?? null,
      entry.isOneTime ? 1 : 0,
      entry.burnReason ?? null,
      entry.viewCountAtBurn ?? null,
      Date.now()
    )
    .run()
    .then(() => {})
    .catch(() => {});
}

/** 清理超过保留期的焚毁事件（KPI 表），返回删除行数 */
export async function deleteOldBurnEvents(d1: D1Database, cutoffMs: number): Promise<number> {
  const result = await d1.prepare("DELETE FROM burn_event WHERE created_at < ?").bind(cutoffMs).run();
  return result.meta.changes ?? 0;
}

export { burnEvent };

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
