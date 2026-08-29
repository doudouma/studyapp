/// <reference types="@cloudflare/workers-types" />
import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";
import { createDb } from "../../db";
import { user } from "../../db/schema";
import type {
  AdminUsersResponse,
  AdminPagesResponse,
  AdminUserData,
  AdminPageData,
  MembershipDuration,
  SetMembershipResponse,
  CancelMembershipResponse,
  CleanupTmpResponse,
  DeletePageResponse,
} from "@shared/types/admin";
import { MEMBERSHIP_DURATIONS } from "@shared/types/admin";
import {
  countAllUsers,
  listUsersWithMembership,
  findUserById,
  findMembershipByUserId,
  updateMembershipExpiry,
  insertMembership,
  deleteMembershipByUserId,
  countPages,
  listPagesWithUser,
  pageExists,
  deletePageRecord,
} from "./admin.repo";
import { cleanupAnonymousUploads, deletePageObjects } from "../pages/pages.storage";

/**
 * Admin 业务逻辑层
 * 编排 repo 与 storage，负责 DTO 转换（Date → Unix 毫秒）
 */

export class ServiceError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
  }
}

/** 判断时长是否合法 */
export function isValidDuration(months: unknown): months is MembershipDuration {
  return (MEMBERSHIP_DURATIONS as readonly number[]).includes(months as number);
}

/** 将 repo 行（Date 时间）转换为 DTO（Unix 毫秒） */
function toAdminUserData(row: Awaited<ReturnType<typeof listUsersWithMembership>>[number]): AdminUserData {
  const now = Date.now();
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    createdAt: row.createdAt.getTime(),
    membership: row.membershipId
      ? {
          expiresAt: row.membershipExpiresAt!.getTime(),
          isActive: row.membershipExpiresAt! .getTime() > now,
          startedAt: row.membershipStartedAt!.getTime(),
        }
      : null,
    points: row.points,
  };
}

/** 管理员获取用户列表 */
export async function listUsers(
  d1: D1Database,
  page: number,
  pageSize: number
): Promise<AdminUsersResponse> {
  const total = await countAllUsers(d1);
  const rows = await listUsersWithMembership(d1, pageSize, (page - 1) * pageSize);
  return {
    users: rows.map(toAdminUserData),
    total,
    page,
    pageSize,
  };
}

/** 管理员设置会员时长 */
export async function setMembership(
  d1: D1Database,
  adminId: string,
  userId: string,
  durationMonths: MembershipDuration
): Promise<SetMembershipResponse> {
  const exists = await findUserById(d1, userId);
  if (!exists) {
    throw new ServiceError(404, "用户不存在");
  }

  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setMonth(expiresAt.getMonth() + durationMonths);

  const existing = await findMembershipByUserId(d1, userId);
  if (existing) {
    await updateMembershipExpiry(d1, userId, expiresAt, adminId, now);
  } else {
    await insertMembership(d1, {
      id: nanoid(7),
      userId,
      adminId,
      startedAt: now,
      expiresAt,
      now,
    });
  }

  return { success: true, expiresAt: expiresAt.getTime() };
}

/** 管理员取消会员 */
export async function cancelMembership(
  d1: D1Database,
  userId: string
): Promise<CancelMembershipResponse> {
  const existing = await findMembershipByUserId(d1, userId);
  if (!existing) {
    throw new ServiceError(404, "该用户不是会员");
  }
  await deleteMembershipByUserId(d1, userId);
  return { success: true, message: "会员已取消" };
}

/** 设置用户积分 */
export async function setUserPoints(
  d1: D1Database,
  userId: string,
  points: number
): Promise<{ success: boolean; points: number }> {
  const exists = await findUserById(d1, userId);
  if (!exists) throw new ServiceError(404, "用户不存在");
  const db = createDb(d1);
  await db.update(user).set({ points }).where(eq(user.id, userId));
  return { success: true, points };
}

/** 将 repo 页面行（Date）转换为 DTO（Unix 毫秒） */
function toAdminPageData(row: Awaited<ReturnType<typeof listPagesWithUser>>[number]): AdminPageData {
  return {
    id: row.id,
    title: row.title ?? "",
    category: row.category ?? "general",
    tags: row.tags ?? "",
    viewCount: row.viewCount,
    isSharedToSquare: row.isSharedToSquare,
    createdAt: row.createdAt.getTime(),
    expiresAt: row.expiresAt ? row.expiresAt.getTime() : null,
    userName: row.userName,
    userEmail: row.userEmail,
    userId: row.userId,
  };
}

/** 管理员获取页面列表 */
export async function listPages(
  d1: D1Database,
  page: number,
  pageSize: number,
  scope: "all" | "square" = "all"
): Promise<AdminPagesResponse> {
  const total = await countPages(d1, scope);
  const rows = await listPagesWithUser(d1, pageSize, (page - 1) * pageSize, scope);
  return {
    items: rows.map(toAdminPageData),
    total,
    page,
    pageSize,
  };
}

/** 管理员手动触发匿名 tmp 文件清理 */
export async function cleanupTmp(bucket: R2Bucket): Promise<CleanupTmpResponse> {
  const deleted = await cleanupAnonymousUploads(bucket);
  return { success: true, deleted };
}

/** 管理员删除任意页面（无所有权校验） */
export async function deletePage(
  d1: D1Database,
  bucket: R2Bucket | undefined,
  pageId: string
): Promise<DeletePageResponse> {
  const exists = await pageExists(d1, pageId);
  if (!exists) {
    throw new ServiceError(404, "页面不存在");
  }

  if (bucket) {
    await deletePageObjects(bucket, pageId);
  }
  await deletePageRecord(d1, pageId);

  return { success: true };
}
