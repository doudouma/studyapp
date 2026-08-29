/// <reference types="@cloudflare/workers-types" />
import { count, eq, desc } from "drizzle-orm";
import { createDb } from "../../db";
import { user, membership, page } from "../../db/schema";
import type { MembershipDuration } from "@shared/types/admin";

/**
 * Admin 数据访问层 (D1)
 * 只做数据库读写，不含业务逻辑或 HTTP 感知
 * 时间字段：Drizzle timestamp mode 返回 Date 对象
 */

/** 用户列表行（含左连接的会员信息） */
export interface UserWithMembershipRow {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
  membershipId: string | null;
  membershipStartedAt: Date | null;
  membershipExpiresAt: Date | null;
  points: number;
}

/** 统计用户总数 */
export async function countAllUsers(d1: D1Database): Promise<number> {
  const db = createDb(d1);
  const [result] = await db.select({ count: count() }).from(user);
  return result?.count ?? 0;
}

/** 分页查询用户（左连接 membership） */
export async function listUsersWithMembership(
  d1: D1Database,
  limit: number,
  offset: number
): Promise<UserWithMembershipRow[]> {
  const db = createDb(d1);
  return db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      membershipId: membership.id,
      membershipStartedAt: membership.startedAt,
      membershipExpiresAt: membership.expiresAt,
      points: user.points,
    })
    .from(user)
    .leftJoin(membership, eq(membership.userId, user.id))
    .orderBy(desc(user.createdAt))
    .limit(limit)
    .offset(offset);
}

/** 查询单个用户是否存在 */
export async function findUserById(d1: D1Database, userId: string): Promise<boolean> {
  const db = createDb(d1);
  const rows = await db.select({ id: user.id }).from(user).where(eq(user.id, userId)).limit(1);
  return rows.length > 0;
}

/** 查询用户当前会员记录 */
export async function findMembershipByUserId(
  d1: D1Database,
  userId: string
): Promise<{ id: string; startedAt: Date; expiresAt: Date } | null> {
  const db = createDb(d1);
  const rows = await db
    .select({ id: membership.id, startedAt: membership.startedAt, expiresAt: membership.expiresAt })
    .from(membership)
    .where(eq(membership.userId, userId))
    .limit(1);
  return rows[0] ?? null;
}

/** 更新现有会员到期时间（不改变 startedAt） */
export async function updateMembershipExpiry(
  d1: D1Database,
  userId: string,
  expiresAt: Date,
  adminId: string,
  now: Date
): Promise<void> {
  const db = createDb(d1);
  await db
    .update(membership)
    .set({ expiresAt, adminId, updatedAt: now })
    .where(eq(membership.userId, userId));
}

/** 创建新会员记录 */
export async function insertMembership(
  d1: D1Database,
  data: { id: string; userId: string; adminId: string; startedAt: Date; expiresAt: Date; now: Date }
): Promise<void> {
  const db = createDb(d1);
  await db.insert(membership).values({
    id: data.id,
    userId: data.userId,
    adminId: data.adminId,
    startedAt: data.startedAt,
    expiresAt: data.expiresAt,
    createdAt: data.now,
    updatedAt: data.now,
  });
}

/** 删除用户会员 */
export async function deleteMembershipByUserId(d1: D1Database, userId: string): Promise<void> {
  const db = createDb(d1);
  await db.delete(membership).where(eq(membership.userId, userId));
}

/** 页面列表行（含左连接的作者信息） */
export interface AdminPageRow {
  id: string;
  title: string | null;
  category: string | null;
  tags: string | null;
  viewCount: number;
  isSharedToSquare: boolean;
  createdAt: Date;
  expiresAt: Date | null;
  userName: string | null;
  userEmail: string | null;
  userId: string | null;
}

/** 统计页面总数（可选只统计广场分享的） */
export async function countPages(d1: D1Database, scope: "all" | "square" = "all"): Promise<number> {
  const db = createDb(d1);
  const where = scope === "square" ? eq(page.isSharedToSquare, true) : undefined;
  const [result] = await db.select({ count: count() }).from(page).where(where);
  return result?.count ?? 0;
}

/** 分页查询页面（左连接 user 获取作者信息） */
export async function listPagesWithUser(
  d1: D1Database,
  limit: number,
  offset: number,
  scope: "all" | "square" = "all"
): Promise<AdminPageRow[]> {
  const db = createDb(d1);
  return db
    .select({
      id: page.id,
      title: page.title,
      category: page.category,
      tags: page.tags,
      viewCount: page.viewCount,
      isSharedToSquare: page.isSharedToSquare,
      createdAt: page.createdAt,
      expiresAt: page.expiresAt,
      userName: user.name,
      userEmail: user.email,
      userId: user.id,
    })
    .from(page)
    .leftJoin(user, eq(page.userId, user.id))
    .where(scope === "square" ? eq(page.isSharedToSquare, true) : undefined)
    .orderBy(desc(page.createdAt))
    .limit(limit)
    .offset(offset);
}

/** 删除页面记录（不含 R2 清理） */
export async function deletePageRecord(d1: D1Database, pageId: string): Promise<void> {
  const db = createDb(d1);
  await db.delete(page).where(eq(page.id, pageId));
}

/** 检查页面是否存在 */
export async function pageExists(d1: D1Database, pageId: string): Promise<boolean> {
  const db = createDb(d1);
  const rows = await db.select({ id: page.id }).from(page).where(eq(page.id, pageId)).limit(1);
  return rows.length > 0;
}

export type { MembershipDuration };
