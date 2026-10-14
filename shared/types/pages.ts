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

/** 自定义地址（slug）每次收费 */
export const POINTS_PER_CUSTOM_SLUG = 10;

// ---------- 到期 / 限次 / 一次性（焚毁）----------

/** 登录用户到期预设：键为预设标识，值为毫秒时长 */
export const EXPIRY_PRESETS = {
  "1h": 60 * 60 * 1000,
  "1d": 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
  "30d": 30 * 24 * 60 * 60 * 1000,
} as const;

/** 到期预设标识（含永久与自定义） */
export type ExpiryPreset = keyof typeof EXPIRY_PRESETS | "permanent" | "custom";

/** 自定义到期上限（登录用户 30 天） */
export const MAX_USER_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000;

/** 自定义到期下限（1 分钟） */
export const MIN_USER_EXPIRY_MS = 60 * 1000;

/** 最大访问次数的可选项；∞ 用 null 表示 */
export const MAX_VIEWS_OPTIONS = [1, 3, 5, 10] as const;

/** 上传到期 / 限次选项（前端面板 ↔ 上传接口共用） */
export interface UploadExpiryOptions {
  expiryPreset: ExpiryPreset;
  /** 自定义到期毫秒数（expiryPreset=custom 时有效） */
  expiryCustomMs: number | null;
  /** 最大访问次数；null = 不限次（∞） */
  maxViews: number | null;
}

/** 最大访问次数上限（防滥用） */
export const MAX_VIEWS_LIMIT = 1000;

/**
 * 将到期预设解析为毫秒时长：permanent → null（永久）；
 * 合法预设/自定义 → 时长；非法 → undefined（调用方回退默认）。
 */
export function resolveExpiryMs(preset: string, customMs?: number): number | null | undefined {
  if (preset === "permanent") return null;
  if (preset === "custom") {
    if (typeof customMs !== "number" || !Number.isFinite(customMs)) return undefined;
    if (customMs < MIN_USER_EXPIRY_MS || customMs > MAX_USER_EXPIRY_MS) return undefined;
    return Math.floor(customMs);
  }
  return (EXPIRY_PRESETS as Record<string, number>)[preset];
}

/**
 * 解析最大访问次数：null / 空 / ∞ → null（不限次）；
 * 正整数字符串/数字 → 归一化后的次数；非法 → undefined。
 */
export function resolveMaxViews(raw: string | number | null | undefined): number | null | undefined {
  if (raw === null || raw === undefined || raw === "" || raw === "inf" || raw === "∞") return null;
  const n = typeof raw === "number" ? raw : Number(raw);
  if (!Number.isFinite(n) || n < 1) return undefined;
  return Math.min(Math.floor(n), MAX_VIEWS_LIMIT);
}

/** 自定义地址长度下限 */
export const CUSTOM_SLUG_MIN = 3;

/** 自定义地址长度上限 */
export const CUSTOM_SLUG_MAX = 50;

/**
 * 自定义地址保留字：顶层路由、系统路径与语言前缀，
 * 防止自定义地址与站点功能路由冲突。
 */
export const RESERVED_SLUGS: ReadonlySet<string> = new Set([
  // 顶层功能路由
  "md2html",
  "any2md",
  "freetool",
  "games",
  "showcase",
  "square",
  "rhythm",
  "pomodoro",
  "petsafe",
  "petbadge",
  "papercut",
  "deliveryrush",
  "enso",
  "outbreak",
  "view",
  "idphoto",
  "wardrobe",
  "admin",
  "links",
  "terms",
  "privacy",
  "cookie",
  "contact",
  // 系统路径
  "api",
  "auth",
  "assets",
  "p",
  "thumbnails",
  "tmp",
  "sitemap",
  "robots",
  // 语言前缀
  "zh",
  "en",
  "es",
  "pt",
  "fr",
]);

/** 自定义地址格式：小写字母/数字/连字符，首尾必须为字母或数字 */
const CUSTOM_SLUG_RE = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

/**
 * 校验自定义地址格式。前后端共用，保证前端实时校验与服务端一致。
 * 返回 "ok" 或具体不通过原因（length/invalid/reserved）。
 */
export function validateCustomSlug(slug: string): "ok" | "length" | "invalid" | "reserved" {
  if (slug.length < CUSTOM_SLUG_MIN || slug.length > CUSTOM_SLUG_MAX) return "length";
  if (!CUSTOM_SLUG_RE.test(slug)) return "invalid";
  if (RESERVED_SLUGS.has(slug)) return "reserved";
  return "ok";
}

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
  /** 是否使用自定义地址（slug），登录用户收取 POINTS_PER_CUSTOM_SLUG */
  customSlug?: boolean;
}

/** 上传/更新费用明细 */
export interface UploadFeeBreakdown {
  /** 配额费：非会员超出免费页面数时为 POINTS_PER_UPLOAD，否则 0 */
  quotaFee: number;
  /** 尺寸费：内容超过 FREE_CONTENT_SIZE 的按块费用，匿名为 0 */
  sizeFee: number;
  /** 自定义地址费：使用自定义地址时为 POINTS_PER_CUSTOM_SLUG，匿名为 0 */
  slugFee: number;
  /** 总费用 = 配额费 + 尺寸费 + 自定义地址费（叠加，互不替代） */
  totalFee: number;
  /** 积分是否足够支付总费用 */
  affordable: boolean;
}

/**
 * 计算一次上传/更新的费用明细。
 * 规则：匿名全程免费；会员免配额费但尺寸费与自定义地址费照付；
 * 非会员超出免费页面数收配额费，超出免费尺寸收尺寸费，
 * 使用自定义地址收地址费，三者叠加。
 */
export function computeUploadFees(ctx: UploadFeeContext): UploadFeeBreakdown {
  if (ctx.isAnonymous) {
    return { quotaFee: 0, sizeFee: 0, slugFee: 0, totalFee: 0, affordable: true };
  }
  const quotaFee =
    !ctx.isMember && ctx.pageCount >= ctx.userLimit ? POINTS_PER_UPLOAD : 0;
  const sizeFee = computeSizeFeePoints(ctx.contentBytes);
  const slugFee = ctx.customSlug ? POINTS_PER_CUSTOM_SLUG : 0;
  const totalFee = quotaFee + sizeFee + slugFee;
  return { quotaFee, sizeFee, slugFee, totalFee, affordable: ctx.points >= totalFee };
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
  /** 自定义地址，null 表示使用随机 ID */
  slug: string | null;
  title: string;
  category: string;
  tags: string;
  isPermanent: boolean;
  viewCount: number;
  /** 最大访问次数；null = 不限次（∞） */
  maxViews: number | null;
  /** 生命周期状态：active=正常，burned=已焚毁/已过期 */
  state: "active" | "burned";
  /** 焚毁原因：views | expired | manual，未焚毁为 null */
  burnReason: string | null;
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
  /** 最大访问次数；null = 不限次（∞） */
  maxViews: number | null;
  /** 是否一次性链接（打开即焚，等价于 maxViews=1） */
  isOneTime: boolean;
}

/** POST /api/upload-thumbnail 响应 */
export interface UploadThumbnailResponse {
  success: boolean;
  previewPath: string;
}
