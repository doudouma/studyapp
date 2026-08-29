/**
 * Pages（学习页面）功能的共享类型与常量
 * 前后端唯一数据契约来源；时间字段统一为 Unix 毫秒 (number)
 */

/** 免费用户基础永久页面数上限 */
export const FREE_PERMANENT_LIMIT = 5;

/** 新用户默认积分 */
export const DEFAULT_POINTS = 50;

/** 每增加1次上传需要的积分 */
export const POINTS_PER_UPLOAD = 10;

/** 上传/更新内容与文件的大小上限（与 server/r2.ts MAX_SIZE 一致，5MB） */
export const MAX_CONTENT_SIZE = 5 * 1024 * 1024;

export interface PageOwnerInfo {
  id: string;
  name: string;
  email: string;
  image?: string;
  role?: string;
}

/** GET /api/me 响应 */
export interface MeResponse {
  user: PageOwnerInfo | null;
  pageCount: number;
  isMember: boolean;
  /** ISO 时间字符串，非会员为 null */
  membershipExpiresAt: string | null;
  /** 剩余可永久保存配额：-1 = 无限制 */
  limit: number;
  /** 用户积分 */
  points: number;
  /** 积分可兑换的额外上传次数 */
  extraUploads: number;
}

/** 用户页面列表项（登录用户的"我的页面"） */
export interface UserPageItem {
  id: string;
  title: string;
  category: string;
  tags: string;
  isPermanent: boolean;
  viewCount: number;
  /** Unix 毫秒 */
  createdAt: number;
  /** Unix 毫秒，null 表示永久 */
  expiresAt: number | null;
  previewPath: string | null;
}

/** GET /api/pages 响应 */
export interface PagesListResponse {
  pages: UserPageItem[];
  total: number;
  /** -1 = 无限制（会员） */
  limit: number;
  /** 用户积分 */
  points: number;
}

/** GET /api/pages/:id/content 响应 */
export interface PageContentResponse {
  content: string;
}

/** PATCH /api/pages/:id 响应 */
export interface UpdatePageResponse {
  success: boolean;
  page: UserPageItem;
}

/** POST /api/upload 响应 */
export interface UploadResult {
  id: string;
  url: string;
  /** Unix 毫秒，null 表示永久 */
  expiresAt: number | null;
  isPermanent: boolean;
  title: string;
  isSharedToSquare: boolean;
  previewPath: string | null;
}

/** POST /api/upload-thumbnail 响应 */
export interface UploadThumbnailResponse {
  success: boolean;
  previewPath: string;
}
