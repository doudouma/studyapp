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

/** 免费内容尺寸上限：不超过该尺寸不产生尺寸费（5MB） */
export const FREE_CONTENT_SIZE = 5 * 1024 * 1024;

/** 匿名用户上传/更新内容与文件的大小上限（5MB） */
export const MAX_CONTENT_SIZE = FREE_CONTENT_SIZE;

/** 登录用户上传/更新内容与文件的大小上限，超出免费尺寸部分按块扣积分（50MB） */
export const MAX_USER_CONTENT_SIZE = 50 * 1024 * 1024;

/** 超出免费尺寸后每个计费块的积分价格 */
export const POINTS_PER_SIZE_BLOCK = 10;

/** 尺寸计费块大小（5MB） */
export const SIZE_BLOCK_BYTES = 5 * 1024 * 1024;

/**
 * 依据内容尺寸计算尺寸费（积分）。
 * ≤ FREE_CONTENT_SIZE 免费；此后每 SIZE_BLOCK_BYTES（不足一块按一块）
 * 收取 POINTS_PER_SIZE_BLOCK。前后端共用，保证报价与扣费一致。
 */
export function computeSizeFeePoints(sizeBytes: number): number {
  const over = sizeBytes - FREE_CONTENT_SIZE;
  if (over <= 0) return 0;
  return Math.ceil(over / SIZE_BLOCK_BYTES) * POINTS_PER_SIZE_BLOCK;
}

/** 上传/更新计费的输入上下文（前后端共用） */
export interface UploadFeeContext {
  /** 匿名（未登录）用户不产生任何费用 */
  isAnonymous: boolean;
  /** 有效会员无配额费，但尺寸费照付 */
  isMember: boolean;
  /** 当前永久页面数 */
  pageCount: number;
  /** 非会员最大永久页面数（FREE_PERMANENT_LIMIT + linksLimitBonus） */
  userLimit: number;
  /** 计费尺寸（字节）：文件为 max(原始字节, ZIP 解压总和)，粘贴为内容字节数 */
  contentBytes: number;
  /** 用户当前积分（匿名传 0） */
  points: number;
}

/** 上传/更新费用明细 */
export interface UploadFeeBreakdown {
  /** 配额费：非会员超出免费页面数时为 POINTS_PER_UPLOAD，否则 0 */
  quotaFee: number;
  /** 尺寸费：内容超过 FREE_CONTENT_SIZE 的按块费用，匿名为 0 */
  sizeFee: number;
  /** 总费用 = 配额费 + 尺寸费（叠加，互不替代） */
  totalFee: number;
  /** 积分是否足够支付总费用 */
  affordable: boolean;
}

/**
 * 计算一次上传/更新的费用明细。
 * 规则：匿名全程免费；会员免配额费但尺寸费照付；
 * 非会员超出免费页面数收配额费，超出免费尺寸收尺寸费，二者叠加。
 */
export function computeUploadFees(ctx: UploadFeeContext): UploadFeeBreakdown {
  if (ctx.isAnonymous) {
    return { quotaFee: 0, sizeFee: 0, totalFee: 0, affordable: true };
  }
  const quotaFee =
    !ctx.isMember && ctx.pageCount >= ctx.userLimit ? POINTS_PER_UPLOAD : 0;
  const sizeFee = computeSizeFeePoints(ctx.contentBytes);
  const totalFee = quotaFee + sizeFee;
  return { quotaFee, sizeFee, totalFee, affordable: ctx.points >= totalFee };
}

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
