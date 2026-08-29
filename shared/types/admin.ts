/**
 * Admin 功能的共享类型与常量
 * 前后端唯一数据契约来源；时间字段统一为 Unix 毫秒 (number)
 */

/** 会员信息 */
export interface MembershipInfo {
  /** Unix 毫秒，会员到期时间 */
  expiresAt: number;
  /** 当前是否有效（基于 expiresAt 与当前时间比较） */
  isActive: boolean;
  /** Unix 毫秒，会员开始时间 */
  startedAt: number;
}

/** 管理员视角的用户列表项 */
export interface AdminUserData {
  id: string;
  name: string;
  email: string;
  role: string;
  /** Unix 毫秒 */
  createdAt: number;
  membership: MembershipInfo | null;
  /** 用户积分 */
  points: number;
}

/** GET /api/admin/users 响应 */
export interface AdminUsersResponse {
  users: AdminUserData[];
  total: number;
  page: number;
  pageSize: number;
}

/** 管理员视角的页面列表项 */
export interface AdminPageData {
  id: string;
  title: string;
  category: string;
  tags: string;
  viewCount: number;
  isSharedToSquare: boolean;
  /** Unix 毫秒 */
  createdAt: number;
  /** Unix 毫秒，null 表示永久 */
  expiresAt: number | null;
  userName: string | null;
  userEmail: string | null;
  userId: string | null;
}

/** GET /api/admin/pages 响应 */
export interface AdminPagesResponse {
  items: AdminPageData[];
  total: number;
  page: number;
  pageSize: number;
}

/** 支持的会员时长（月） */
export const MEMBERSHIP_DURATIONS = [1, 3, 6, 12] as const;
export type MembershipDuration = (typeof MEMBERSHIP_DURATIONS)[number];

/** POST /api/admin/users/:id/membership 请求体 */
export interface SetMembershipRequest {
  durationMonths: MembershipDuration;
}

/** POST /api/admin/users/:id/membership 响应 */
export interface SetMembershipResponse {
  success: boolean;
  /** Unix 毫秒，新的会员到期时间 */
  expiresAt: number;
}

/** DELETE /api/admin/users/:id/membership 响应 */
export interface CancelMembershipResponse {
  success: boolean;
  message: string;
}

/** POST /api/admin/cleanup-tmp 响应 */
export interface CleanupTmpResponse {
  success: boolean;
  deleted: number;
}

/** POST /api/admin/users/:id/points 请求体 */
export interface SetPointsRequest {
  points: number;
}

/** POST /api/admin/users/:id/points 响应 */
export interface SetPointsResponse {
  success: boolean;
  points: number;
}

/** DELETE /api/admin/pages/:id 响应 */
export interface DeletePageResponse {
  success: boolean;
}
