/// <reference types="@cloudflare/workers-types" />
import { nanoid } from "nanoid";
import {
  FREE_PERMANENT_LIMIT,
  DEFAULT_POINTS,
  POINTS_PER_UPLOAD,
  MAX_CONTENT_SIZE,
  MAX_USER_CONTENT_SIZE,
  FREE_CONTENT_SIZE,
  CUSTOM_SLUG_MIN,
  CUSTOM_SLUG_MAX,
  POINTS_PER_CUSTOM_SLUG,
  validateCustomSlug,
  computeSizeFeePoints,
  computeUploadFees,
  resolveExpiryMs,
  resolveMaxViews,
  EXPIRY_PRESETS,
  type MeResponse,
  type PagesListResponse,
  type UserPageItem,
  type UpdatePageResponse,
  type UploadResult,
  type PageOwnerInfo,
} from "@shared/types/pages";
import {
  ALLOWED_EXTENSIONS,
  MAX_THUMBNAIL_SIZE,
  getMimeType,
  putHtml,
  deletePageObjects,
  deleteTmpByBucketId,
  isExpiredByUploaded,
} from "./pages.storage";
import { injectBanner, notFoundHtml, blockedHtml, burnedHtml, isLikelyCrawler, detectLangFromHeader } from "./pages.render";
import type { Lang } from "../../../app/lib/lang";
import { log } from "../../lib/log";
import { insertUploadLog, insertScanLog, getLatestBlockedScan } from "../admin/upload-log.repo";
import {
  getMembershipExpiresAt,
  isMemberByUserId,
  countUserPages,
  countPermanentPages,
  claimPageView,
  markPageBurned,
  insertBurnEvent,
  listExpiredActivePages,
  listUserPages,
  findOwnedPage,
  getPageRecord,
  insertPageRecord,
  updatePageRecord,
  deletePageRecord,
  getUserPoints,
  getUserLinksLimitBonus,
  deductPointsAndAddBonus,
  deductPoints,
  getPageIdBySlug,
  slugExists,
  type UserPageRow,
} from "./pages.repo";

/**
 * Pages 业务逻辑层 (Service)
 * 承载配额规则、上传/更新编排、页面服务与 DTO 转换
 * 校验失败抛 ServiceError，由 routes 层映射为 HTTP 状态码
 */

export class ServiceError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
  }
}

/** SHA-256 十六进制摘要（内容哈希 / 上传者指纹用） */
async function sha256Hex(data: string): Promise<string> {
  const bytes = new TextEncoder().encode(data);
  const digest = await crypto.subtle.digest("SHA-256", bytes.buffer as ArrayBuffer);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

// ---------- DTO 转换 ----------

function toUserPageItem(row: UserPageRow): UserPageItem {
  return {
    id: row.id,
    slug: row.slug ?? null,
    title: row.title || "",
    category: row.category || "general",
    tags: row.tags || "",
    isPermanent: row.isPermanent,
    viewCount: row.viewCount,
    maxViews: row.maxViews ?? null,
    state: row.state === "burned" ? "burned" : "active",
    burnReason: row.burnReason ?? null,
    createdAt: row.createdAt ? new Date(row.createdAt).getTime() : 0,
    expiresAt: row.expiresAt ? new Date(row.expiresAt).getTime() : null,
    previewPath: row.previewPath,
  };
}

// ---------- 账户 / 配额 ----------

export async function getMeInfo(
  d1: D1Database | undefined,
  user: PageOwnerInfo | null
): Promise<MeResponse> {
  if (!user || !d1) {
    return { user: user ?? null, pageCount: 0, isMember: false, membershipExpiresAt: null, limit: 0, points: 0, extraUploads: 0 };
  }

  const pageCount = await countPermanentPages(d1, user.id);
  const expiresAt = await getMembershipExpiresAt(d1, user.id);
  const isMember = expiresAt !== null && expiresAt > Date.now();
  const points = await getUserPoints(d1, user.id);
  const linksLimitBonus = await getUserLinksLimitBonus(d1, user.id);
  const limit = isMember ? -1 : FREE_PERMANENT_LIMIT + linksLimitBonus;

  return {
    user,
    pageCount,
    isMember,
    membershipExpiresAt: isMember ? new Date(expiresAt).toISOString() : null,
    limit,
    points,
    extraUploads: linksLimitBonus,
  };
}

// ---------- 我的页面列表 ----------

export async function listMyPages(
  d1: D1Database | undefined,
  user: PageOwnerInfo,
  pageParam: number,
  pageSizeParam: number
): Promise<PagesListResponse> {
  if (!d1) throw new ServiceError(503, "database unavailable");

  const pageSize = Math.min(100, Math.max(1, pageSizeParam));
  const offset = (Math.max(1, pageParam) - 1) * pageSize;

  const [total, rows] = await Promise.all([
    countUserPages(d1, user.id),
    listUserPages(d1, user.id, pageSize, offset),
  ]);

  const member = await isMemberByUserId(d1, user.id);
  const points = await getUserPoints(d1, user.id);
  const linksLimitBonus = member ? 0 : await getUserLinksLimitBonus(d1, user.id);
  return { pages: rows.map(toUserPageItem), total, limit: member ? -1 : FREE_PERMANENT_LIMIT + linksLimitBonus, points };
}

// ---------- 删除 ----------

export async function deleteOwnPage(
  d1: D1Database | undefined,
  bucket: R2Bucket | undefined,
  userId: string,
  pageId: string
): Promise<void> {
  if (!d1) throw new ServiceError(503, "database unavailable");
  if (!(await findOwnedPage(d1, pageId, userId))) throw new ServiceError(404, "页面不存在");

  if (bucket) await deletePageObjects(bucket, pageId);
  await deletePageRecord(d1, pageId);
}

// ---------- 内容读取 ----------

export async function getPageContent(
  d1: D1Database | undefined,
  bucket: R2Bucket | undefined,
  userId: string,
  pageId: string
): Promise<string> {
  if (!d1) throw new ServiceError(503, "database unavailable");
  if (!(await findOwnedPage(d1, pageId, userId))) throw new ServiceError(404, "页面不存在");

  let content = "";
  if (bucket) {
    let obj = await bucket.get(`${pageId}.html`);
    if (!obj) obj = await bucket.get(`${pageId}/index.html`);
    if (obj) content = await obj.text();
  }
  return content;
}

// ---------- 元数据标准化 ----------

export function normalizeTags(raw: string): string {
  return raw
    .split(/[,，\s]+/)
    .map((t) => t.trim())
    .filter(Boolean)
    .filter((t, i, arr) => arr.indexOf(t) === i)
    .join(",");
}

// ---------- 更新页面 ----------

export interface PageFileInput {
  bytes: Uint8Array;
  filename: string;
}

/** 预处理的页面文件：ZIP 已解压，附带计费尺寸，供校验与落盘共用 */
interface PreparedPageFile {
  bytes: Uint8Array;
  filename: string;
  entries?: Record<string, Uint8Array>;
  /** 计费尺寸：max(原始字节, ZIP 解压总和) */
  size: number;
}

async function preparePageFile(file: PageFileInput): Promise<PreparedPageFile> {
  const { bytes, filename } = file;
  if (filename.toLowerCase().endsWith(".zip")) {
    const { unzipSync } = await import("fflate");
    const entries = unzipSync(bytes);
    const totalSize = Object.values(entries).reduce((sum, f) => sum + f.length, 0);
    return { bytes, filename, entries, size: Math.max(bytes.length, totalSize) };
  }
  return { bytes, filename, size: bytes.length };
}

export interface UpdatePageInput {
  d1: D1Database;
  bucket: R2Bucket;
  userId: string;
  pageId: string;
  title?: string;
  category?: string;
  tags?: string;
  /** 自定义地址：undefined 不修改；空字符串清除；新地址设置/更换扣 POINTS_PER_CUSTOM_SLUG */
  slug?: string;
  content?: string;
  file?: PageFileInput;
}

export async function updateOwnPage(input: UpdatePageInput): Promise<UpdatePageResponse> {
  const { d1, bucket, userId, pageId } = input;
  const record = await getPageRecord(d1, pageId);
  if (!record || record.userId !== userId) throw new ServiceError(404, "页面不存在");

  const updates: Record<string, string | null> = {};
  if (input.title) updates.title = input.title;
  if (input.category) updates.category = input.category;
  if (input.tags !== undefined) updates.tags = input.tags;

  // 自定义地址：设置/更换扣积分，清除与不变免费
  let slugFee = 0;
  if (input.slug !== undefined) {
    const normalized = input.slug.trim().toLowerCase();
    if (normalized) {
      const verdict = validateCustomSlug(normalized);
      if (verdict === "length") {
        throw new ServiceError(400, `自定义地址长度需在 ${CUSTOM_SLUG_MIN}-${CUSTOM_SLUG_MAX} 位之间`);
      }
      if (verdict === "invalid") {
        throw new ServiceError(400, "自定义地址仅支持小写字母、数字和连字符，且以字母或数字开头结尾");
      }
      if (verdict === "reserved") {
        throw new ServiceError(400, "该自定义地址为系统保留，请换一个");
      }
    }
    if ((record.slug ?? "") !== normalized) {
      if (normalized) {
        if (await slugExists(d1, normalized)) throw new ServiceError(409, "该自定义地址已被占用");
        slugFee = POINTS_PER_CUSTOM_SLUG;
      }
      updates.slug = normalized || null;
    }
  }

  const maxSizeMB = MAX_USER_CONTENT_SIZE / (1024 * 1024);

  let preparedFile: PreparedPageFile | undefined;
  if (input.file) {
    preparedFile = await preparePageFile(input.file);
    if (preparedFile.size > MAX_USER_CONTENT_SIZE) {
      throw new ServiceError(413, `文件大小不能超过 ${maxSizeMB}MB`);
    }
  }

  let contentBytes = 0;
  if (input.content !== undefined) {
    contentBytes = new Blob([input.content]).size;
    if (contentBytes > MAX_USER_CONTENT_SIZE) {
      throw new ServiceError(413, `内容大小不能超过 ${maxSizeMB}MB`);
    }
  }

  // 费用：尺寸费（替换超出 5MB 的文件/内容按块扣积分）+ 自定义地址费，叠加校验
  const effectiveSize = preparedFile ? preparedFile.size : contentBytes;
  const sizeFee = computeSizeFeePoints(effectiveSize);
  const totalFee = sizeFee + slugFee;
  if (totalFee > 0) {
    const points = await getUserPoints(d1, userId);
    if (points < totalFee) {
      const reasons: string[] = [];
      if (sizeFee > 0) reasons.push(`内容超过 ${FREE_CONTENT_SIZE / (1024 * 1024)}MB 免费尺寸需 ${sizeFee} 积分`);
      if (slugFee > 0) reasons.push(`自定义地址需 ${slugFee} 积分`);
      throw new ServiceError(403, `积分不足（当前 ${points}，本次需要 ${totalFee} 积分）：${reasons.join("；")}`);
    }
  }

  if (Object.keys(updates).length > 0) {
    try {
      await updatePageRecord(d1, pageId, updates);
    } catch (e) {
      // 并发竞态兜底：check 与 update 之间 slug 被抢占，唯一索引冲突
      if (updates.slug && String(e).includes("UNIQUE constraint failed")) {
        throw new ServiceError(409, "该自定义地址已被占用");
      }
      throw e;
    }
  }

  if (preparedFile) {
    await replacePageObjects(bucket, pageId, preparedFile);
  } else if (input.content !== undefined) {
    // Detect ZIP format: HTML is stored under {id}/index.html instead of {id}.html
    const isZip = await bucket.get(`${pageId}/index.html`).then(Boolean).catch(() => false);
    const key = isZip ? `${pageId}/index.html` : `${pageId}.html`;
    await putHtml(bucket, key, input.content);
  }

  // 替换成功后再扣费：尺寸费与自定义地址费
  if (totalFee > 0) {
    await deductPoints(d1, userId, totalFee);
  }

  const updated = (await getPageRecord(d1, pageId))!;
  return { success: true, page: toUserPageItem(updated as UserPageRow) };
}

/** 用新文件整体替换页面的 R2 对象（ZIP: 清空 {id}/ 前缀重写；单 HTML: 覆盖并清理 ZIP 残留） */
async function replacePageObjects(bucket: R2Bucket, pageId: string, prepared: PreparedPageFile): Promise<void> {
  const { bytes } = prepared;
  const files = prepared.entries;

  if (files) {
    const entries = Object.keys(files);

    const htmlEntry =
      entries.find((f) => f.endsWith("/index.html") || f === "index.html") ||
      entries.find((f) => f.endsWith(".html"));
    if (!htmlEntry) throw new ServiceError(400, "ZIP 中未找到 HTML 文件");

    await deletePageObjects(bucket, pageId);
    const puts = Object.entries(files).map(([name, data]) => {
      const key = name === htmlEntry ? `${pageId}/index.html` : `${pageId}/${name}`;
      const mime = getMimeType(name);
      const buf = new Uint8Array(data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength));
      return bucket.put(key, buf, { httpMetadata: { contentType: mime } });
    });
    await Promise.all(puts);
  } else {
    const content = new TextDecoder().decode(bytes);
    await putHtml(bucket, `${pageId}.html`, content);
    // Clean up any existing ZIP format files (with pagination)
    let cursor: string | undefined;
    do {
      const listed = await bucket.list({ prefix: `${pageId}/`, cursor });
      if (listed.objects.length > 0) {
        await bucket.delete(listed.objects.map((o) => o.key));
      }
      cursor = listed.truncated ? listed.cursor : undefined;
    } while (cursor);
  }
}

// ---------- 上传 ----------

export interface CreateUploadInput {
  d1: D1Database | undefined;
  bucket: R2Bucket | undefined;
  ai?: Ai | undefined;
  user: PageOwnerInfo | null;
  title: string;
  category: string;
  tags: string;
  shareToSquare: boolean;
  /** 自定义地址（/p/{slug}），仅登录用户生效，匿名忽略 */
  customSlug?: string;
  /** 到期预设：permanent|1h|1d|7d|30d|custom（仅登录用户生效；缺省 permanent） */
  expiryPreset?: string;
  /** 自定义到期毫秒数（expiryPreset=custom 时使用） */
  expiryCustomMs?: number;
  /** 最大访问次数：null/缺省=不限次；1=一次性链接 */
  maxViews?: string | number | null;
  /** 来源 IP（计算上传者指纹用） */
  ip?: string;
  /** User-Agent（计算上传者指纹用） */
  userAgent?: string;
  content?: string;
  file?: PageFileInput;
}

export async function createUpload(input: CreateUploadInput): Promise<UploadResult & { _html: string; _isAnonymous: boolean }> {
  const { d1, bucket, user } = input;
  const title = input.title.trim();

  if (user && !title) throw new ServiceError(400, "标题不能为空");

  // 配额费（非会员超出免费链接数）与尺寸费（内容超过 5MB）由共享纯函数计算，
  // 合并校验，成功后一并扣除，失败不扣分。
  const isAnonymous = !user;
  const maxSize = isAnonymous ? MAX_CONTENT_SIZE : MAX_USER_CONTENT_SIZE;
  const maxSizeMB = maxSize / (1024 * 1024);

  // 到期 / 限次 / 一次性（仅登录用户可选）。匿名维持 7 天自动销毁。
  // 到期或限次的页面属「即焚」免费能力：不占用永久配额、不收配额费。
  let permanent = !!user;
  let expiryMs: number | null = isAnonymous ? EXPIRY_PRESETS["7d"] : null;
  let expiryPreset: string | null = isAnonymous ? null : "permanent";
  if (user && input.expiryPreset) {
    const resolved = resolveExpiryMs(input.expiryPreset, input.expiryCustomMs);
    if (resolved === undefined) {
      throw new ServiceError(400, "到期时间无效（需在 1 分钟至 30 天之间）");
    }
    expiryMs = resolved;
    permanent = resolved === null;
    expiryPreset = input.expiryPreset;
  }
  let maxViews: number | null = null;
  if (user && input.maxViews !== undefined) {
    const resolvedViews = resolveMaxViews(input.maxViews);
    if (resolvedViews === undefined) throw new ServiceError(400, "最大访问次数无效");
    maxViews = resolvedViews;
  }
  const isOneTime = maxViews === 1;
  // 「真正永久」= 无到期时间且不限访问次数。到期或限次的页面属即焚能力：
  // 不进广场（广场是长期精选位），也不占用永久配额。
  const trulyPermanent = permanent && maxViews == null;
  const shareToSquare = trulyPermanent && input.shareToSquare;

  // 取配额与积分（仅登录用户；会员无配额费，但仍需积分支付尺寸费）
  let isMember = false;
  let pageCount = 0;
  let userLimit = 0;
  let points = 0;
  if (user) {
    if (!d1) throw new ServiceError(503, "database unavailable");
    const membershipExpiresAt = await getMembershipExpiresAt(d1, user.id);
    isMember = membershipExpiresAt !== null && membershipExpiresAt > Date.now();
    if (!isMember) {
      // 即焚（到期或限次）页面不计入永久配额
      pageCount = trulyPermanent ? await countPermanentPages(d1, user.id) : 0;
      userLimit = FREE_PERMANENT_LIMIT + (await getUserLinksLimitBonus(d1, user.id));
    }
    points = await getUserPoints(d1, user.id);
  }

  // 自定义地址（仅登录用户；匿名忽略该字段）：校验格式与占用
  let slug: string | undefined;
  if (user && d1 && input.customSlug) {
    const normalized = input.customSlug.trim().toLowerCase();
    const verdict = validateCustomSlug(normalized);
    if (verdict === "length") {
      throw new ServiceError(400, `自定义地址长度需在 ${CUSTOM_SLUG_MIN}-${CUSTOM_SLUG_MAX} 位之间`);
    }
    if (verdict === "invalid") {
      throw new ServiceError(400, "自定义地址仅支持小写字母、数字和连字符，且以字母或数字开头结尾");
    }
    if (verdict === "reserved") {
      throw new ServiceError(400, "该自定义地址为系统保留，请换一个");
    }
    if (await slugExists(d1, normalized)) {
      throw new ServiceError(409, "该自定义地址已被占用");
    }
    slug = normalized;
  }

  let html: string;
  let zipEntries: Record<string, Uint8Array> | null = null;
  let htmlFile: string | undefined;
  let contentBytes = 0;

  if (input.file) {
    const { bytes, filename } = input.file;
    const ext = ALLOWED_EXTENSIONS.find((e) => filename.toLowerCase().endsWith(e));
    if (!ext) throw new ServiceError(400, "仅支持 .html 或 .zip 文件");
    if (bytes.length > maxSize) throw new ServiceError(413, `文件大小不能超过 ${maxSizeMB}MB`);
    contentBytes = bytes.length;

    if (ext === ".zip") {
      const { unzipSync } = await import("fflate");
      const files = unzipSync(bytes);
      const entries = Object.keys(files);

      htmlFile = entries.find((f) => f.endsWith("/index.html") || f === "index.html");
      if (!htmlFile) htmlFile = entries.find((f) => f.endsWith(".html"));
      if (!htmlFile) throw new ServiceError(400, "ZIP 中未找到 HTML 文件");

      const totalSize = entries.reduce((sum, f) => sum + files[f].length, 0);
      if (totalSize > maxSize) throw new ServiceError(413, `解压后文件大小不能超过 ${maxSizeMB}MB`);
      contentBytes = Math.max(contentBytes, totalSize);

      html = new TextDecoder().decode(files[htmlFile]);
      zipEntries = files;
    } else {
      html = new TextDecoder().decode(bytes);
    }
  } else if (input.content && input.content.trim()) {
    contentBytes = new Blob([input.content]).size;
    if (contentBytes > maxSize) throw new ServiceError(413, `内容大小不能超过 ${maxSizeMB}MB`);
    html = input.content;
  } else {
    throw new ServiceError(400, "请提供 HTML 内容或上传文件");
  }

  const fees = computeUploadFees({
    isAnonymous,
    isMember,
    pageCount,
    userLimit,
    contentBytes,
    points,
    customSlug: !!slug,
  });

  if (user && fees.totalFee > 0 && !fees.affordable) {
    const reasons: string[] = [];
    if (fees.quotaFee > 0) reasons.push(`免费额度已用完（${pageCount}/${userLimit}）`);
    if (fees.sizeFee > 0) reasons.push(`内容超过 ${FREE_CONTENT_SIZE / (1024 * 1024)}MB 需 ${fees.sizeFee} 积分`);
    if (fees.slugFee > 0) reasons.push(`自定义地址需 ${fees.slugFee} 积分`);
    throw new ServiceError(
      403,
      `积分不足（当前 ${points}，本次需要 ${fees.totalFee} 积分）${reasons.length ? "：" + reasons.join("；") : ""}`
    );
  }

  const id = nanoid(7);
  const now = Date.now();

  if (zipEntries) {
    // Store all ZIP files under {id}/ prefix; rename main HTML to index.html
    const prefix = isAnonymous ? `tmp/${id}` : id;
    if (bucket) {
      const puts = Object.entries(zipEntries).map(([filename, data]) => {
        const key = filename === htmlFile ? `${prefix}/index.html` : `${prefix}/${filename}`;
        const mime = getMimeType(filename);
        const opts: R2PutOptions = { httpMetadata: { contentType: mime } };
        if (isAnonymous) {
          opts.customMetadata = { createdAt: String(now) };
        }
        const buf = new Uint8Array(data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength));
        return bucket.put(key, buf, opts);
      });
      await Promise.all(puts);
    }
  } else if (isAnonymous) {
    // Store under tmp/ with creation timestamp for auto-cleanup
    if (bucket) {
      await bucket.put(`tmp/${id}.html`, html, {
        httpMetadata: { contentType: "text/html; charset=utf-8" },
        customMetadata: { createdAt: String(now) },
      });
    }
  } else if (bucket) {
    await putHtml(bucket, `${id}.html`, html);
  }

  // isPermanent 表示「真正永久」(无到期且不限次)，用于配额/广场/展示；
  // expiresAt 仅由到期时间决定，限次页面仍可永久（在时间维度上）。
  const isPermanent = trulyPermanent;
  const expiresAt = permanent ? null : now + (expiryMs ?? EXPIRY_PRESETS["7d"]);

  // Record in D1 only for logged-in users
  if (user && d1) {
    let contentHash: string | null = null;
    let uploaderFp: string | null = null;
    try {
      contentHash = await sha256Hex(html);
      uploaderFp = await sha256Hex(`${input.ip ?? ""}|${input.userAgent ?? ""}`);
    } catch {
      // 哈希失败不影响上传（仅失去去重/指纹能力）
    }
    try {
      await insertPageRecord(d1, {
        id,
        slug: slug ?? null,
        userId: user.id,
        title: title || "未命名",
        category: input.category,
        tags: input.tags,
        isPermanent,
        maxViews,
        state: "active",
        expiryPreset,
        contentHash,
        uploaderFp,
        isSharedToSquare: shareToSquare,
        sharedAt: shareToSquare ? new Date(now) : null,
        createdAt: new Date(now),
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      });
    } catch (e) {
      // 并发竞态兜底：check 与 insert 之间 slug 被抢占，唯一索引冲突
      if (slug && String(e).includes("UNIQUE constraint failed")) {
        throw new ServiceError(409, "该自定义地址已被占用");
      }
      throw e;
    }
    // 埋点：记录上传时选用的到期/限次选项（KPI：到期分布、一次性占比）
    await insertBurnEvent(d1, {
      pageId: id,
      userId: user.id,
      event: "created",
      expiryPreset,
      maxViews,
      isOneTime,
    });
    // 成功落库后再扣分：配额费附带链接额度 +1，尺寸费与自定义地址费仅扣积分
    if (fees.quotaFee > 0) {
      await deductPointsAndAddBonus(d1, user.id, fees.quotaFee);
    }
    if (fees.sizeFee > 0) {
      await deductPoints(d1, user.id, fees.sizeFee);
    }
    if (fees.slugFee > 0) {
      await deductPoints(d1, user.id, fees.slugFee);
    }
  }

  return {
    id,
    url: slug ? `/p/${slug}` : `/p/${id}`,
    expiresAt,
    isPermanent,
    title,
    isSharedToSquare: shareToSquare,
    previewPath: null,
    maxViews,
    isOneTime,
    /** @internal 后台扫描用，不暴露给前端 */
    _html: html,
    _isAnonymous: isAnonymous,
  };
}

// ---------- 后台安全扫描 ----------

export interface ScanContext {
  d1?: D1Database;
  bucket?: R2Bucket;
  ai?: Ai;
}

/**
 * 后台扫描已上传的 HTML 内容
 * 上传成功后异步调用，不阻塞用户响应
 * 检测不通过时自动删除页面
 */
export async function scanHtmlInBackground(
  ctx: ScanContext,
  pageId: string,
  html: string,
  isAnonymous: boolean,
): Promise<void> {
  try {
    const { detectAndSanitizeHtml, extractDomains, checkDomainsWithPhishDestroy, detectWithAi } = await import("./html-guard");

    log.info("审核开始", { pageId, isAnonymous, htmlLength: html.length });

    // 1. 正则检测 + 净化
    const guard = detectAndSanitizeHtml(html);
    if (!guard.safe) {
      log.warn("审核不通过", { pageId, status: "blocked", reason: "regex", threats: guard.threats });
      if (ctx.d1) {
        await insertUploadLog(ctx.d1, { pageId, event: "upload", isAnonymous, status: "blocked" });
        await insertScanLog(ctx.d1, {
          pageId, status: "blocked", reason: "regex",
          threats: JSON.stringify(guard.threats), htmlLength: html.length, isAnonymous,
        });
      }
      await deletePageById(ctx, pageId, isAnonymous);
      return;
    }

    // 2. 钓鱼域名检查
    const domains = extractDomains(html);
    if (domains.length > 0) {
      const domainCheck = await checkDomainsWithPhishDestroy(domains);
      if (!domainCheck.safe) {
        log.warn("审核不通过", { pageId, status: "blocked", reason: "phishing", threats: domainCheck.threats });
        if (ctx.d1) {
          await insertUploadLog(ctx.d1, { pageId, event: "upload", isAnonymous, status: "blocked" });
          await insertScanLog(ctx.d1, {
            pageId, status: "blocked", reason: "phishing",
            threats: JSON.stringify(domainCheck.threats), htmlLength: html.length, isAnonymous,
          });
        }
        await deletePageById(ctx, pageId, isAnonymous);
        return;
      }
    }

    // 3. AI 辅助检测
    if (ctx.ai) {
      const aiResult = await detectWithAi(ctx.ai, html);
      if (!aiResult.safe) {
        log.warn("审核不通过", { pageId, status: "blocked", reason: "ai", verdict: aiResult.verdict });
        if (ctx.d1) {
          await insertUploadLog(ctx.d1, { pageId, event: "upload", isAnonymous, status: "blocked" });
          await insertScanLog(ctx.d1, {
            pageId, status: "blocked", reason: "ai",
            threats: JSON.stringify({ verdict: aiResult.verdict }), htmlLength: html.length, isAnonymous,
          });
        }
        await deletePageById(ctx, pageId, isAnonymous);
        return;
      }
    }

    log.info("审核通过", { pageId, status: "approved" });
    if (ctx.d1) {
      await insertScanLog(ctx.d1, { pageId, status: "approved", htmlLength: html.length, isAnonymous });
    }
  } catch (e) {
    // 后台扫描失败不影响已上传的页面
    log.error("审核异常", { pageId, status: "error", error: String(e) });
    if (ctx.d1) {
      await insertScanLog(ctx.d1, {
        pageId, status: "error", threats: JSON.stringify({ error: String(e) }), isAnonymous,
      });
    }
  }
}

/** 删除页面的所有资源（R2 + D1） */
async function deletePageById(
  ctx: ScanContext,
  pageId: string,
  isAnonymous: boolean,
): Promise<void> {
  try {
    if (ctx.bucket) {
      if (isAnonymous) {
        await deleteTmpByBucketId(ctx.bucket, pageId);
      } else {
        await deletePageObjects(ctx.bucket, pageId);
      }
    }
    if (!isAnonymous && ctx.d1) await deletePageRecord(ctx.d1, pageId);
    log.info("page deleted", { pageId, isAnonymous });
  } catch (e) {
    log.error("delete failed", { pageId, isAnonymous, error: String(e) });
  }
}

// ---------- 缩略图 ----------

export async function savePageThumbnail(
  d1: D1Database | undefined,
  bucket: R2Bucket | undefined,
  userId: string,
  pageId: string,
  thumbnail: File
): Promise<{ success: true; previewPath: string }> {
  if (!d1) throw new ServiceError(503, "database unavailable");
  if (thumbnail.type !== "image/webp") throw new ServiceError(400, "仅支持 WebP 格式的缩略图");
  if (thumbnail.size > MAX_THUMBNAIL_SIZE) throw new ServiceError(413, "缩略图大小不能超过 2MB");
  if (!(await findOwnedPage(d1, pageId, userId))) throw new ServiceError(404, "页面不存在");

  const key = `thumbnails/${pageId}.webp`;
  if (bucket) {
    await bucket.put(key, await thumbnail.arrayBuffer(), {
      httpMetadata: { contentType: "image/webp" },
    });
  }
  await updatePageRecord(d1, pageId, { previewPath: key });
  return { success: true, previewPath: key };
}

// ---------- 页面访问 (/p/:id) 与缩略图服务 ----------

export interface ServePageEnv {
  d1?: D1Database;
  bucket?: R2Bucket;
  /** tmp 匿名上传过期毫秒数，默认 7 天（可由环境变量覆盖） */
  tmpExpiryMs?: number;
  /** 请求 User-Agent（用于识别爬虫/预取，决定是否计入访问次数） */
  userAgent?: string;
  /** 是否为预取/预览请求（不计数，避免一次性链接被提前焚毁） */
  isPrefetch?: boolean;
}

/** 服务用户页面 HTML 或其资产文件，含过期惰性清理、浏览量与 SEO 注入 */
export async function serveUserPage(
  env: ServePageEnv,
  rawPath: string,
  acceptLanguage: string | undefined
): Promise<Response> {
  const lang = detectLangFromHeader(acceptLanguage);
  const notFound = () => new Response(notFoundHtml(lang), { status: 404, headers: htmlHeaders() });

  // Parse /{first} or /{first}/{path}：first 为 7 位随机 ID 或自定义地址（slug）
  const match = rawPath.match(/^([^/]+)(?:\/(.*))?$/);
  if (!match) return notFound();

  const first = match[1];
  const path = match[2];

  // 先按 7 位随机 ID 尝试（兼容存量页面与匿名 tmp 页面——匿名页无 D1 记录）
  if (/^[a-zA-Z0-9_-]{7}$/.test(first)) {
    const res = await servePageById(env, first, path, lang, first);
    if (res.status !== 404) return res;
  }

  // 未命中则按自定义地址解析为真实页面 id 后重试
  if (env.d1) {
    let pageId: string | null = null;
    try {
      pageId = await getPageIdBySlug(env.d1, first);
    } catch {
      pageId = null; // slug 查询失败时按 404 处理，不让 D1 异常放大
    }
    if (pageId) return servePageById(env, pageId, path, lang, first);
  }

  return notFound();
}

/** 按页面 id（R2 key）服务页面：资产文件或主 HTML，urlSegment 用于 baseHref/SEO 展示 */
async function servePageById(
  env: ServePageEnv,
  id: string,
  path: string | undefined,
  lang: Lang,
  urlSegment: string
): Promise<Response> {
  const notFound = () => new Response(notFoundHtml(lang), { status: 404, headers: htmlHeaders() });
  const ashes = (reason?: string) =>
    new Response(burnedHtml(lang, reason), { status: 410, headers: htmlHeaders() });

  // D1 记录（仅登录用户页面有）：已焚毁 / 已到期 → 灰烬页（保留元数据）
  const record = env.d1 ? await getPageRecord(env.d1, id) : null;
  if (record) {
    if (record.state === "burned") return ashes(record.burnReason ?? undefined);
    if (record.expiresAt && new Date(record.expiresAt).getTime() < Date.now()) {
      await burnPageContent(env, id, "expired");
      return ashes("expired");
    }
  }

  const bucket = env.bucket;
  if (!bucket) return notFound();

  if (path && path !== "index.html") {
    // Serving an asset file (e.g. data.json, image.png)
    let isTmp = false;
    let obj = await bucket.get(`${id}/${path}`);
    if (!obj) { obj = await bucket.get(`tmp/${id}/${path}`); isTmp = true; }
    if (!obj) return new Response(notFoundHtml(lang), { status: 404, headers: htmlHeaders() });

    // Lazy cleanup for expired tmp uploads
    if (isTmp && isExpiredByUploaded(obj.uploaded, env.tmpExpiryMs)) {
      await deleteTmpByBucketId(bucket, id);
      return new Response(notFoundHtml(lang), { status: 404, headers: htmlHeaders() });
    }

    const buf = await obj.arrayBuffer();
    return new Response(buf, {
      status: 200,
      headers: {
        "Content-Type": getMimeType(path),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  }

  // Serving the main HTML page
  // Try ZIP directory format first, then flat format (backward compat)
  let obj = await bucket.get(`${id}/index.html`);
  let isZip = !!obj;
  if (!obj) obj = await bucket.get(`tmp/${id}/index.html`);
  if (obj) isZip = true;
  if (!obj) obj = await bucket.get(`${id}.html`);
  if (!obj) obj = await bucket.get(`tmp/${id}.html`);

  if (!obj) {
    // 页面不存在：若是被安全扫描下架的页面，返回带原因的 410 提示页
    if (env.d1) {
      try {
        const blocked = await getLatestBlockedScan(env.d1, id);
        if (blocked) {
          return new Response(blockedHtml(lang, blocked), { status: 410, headers: htmlHeaders() });
        }
      } catch { /* 查询失败时回退普通 404 */ }
    }
    return new Response(notFoundHtml(lang), { status: 404, headers: htmlHeaders() });
  }

  // Lazy cleanup: delete expired anonymous tmp uploads
  if (obj.key?.startsWith("tmp/") && isExpiredByUploaded(obj.uploaded, env.tmpExpiryMs)) {
    await deleteTmpByBucketId(bucket, id);
    return new Response(notFoundHtml(lang), { status: 404, headers: htmlHeaders() });
  }

  // SEO meta + 访问占位（仅登录用户页面有 record；匿名 tmp 不计数）
  let pageMeta: { title?: string; description?: string; url?: string } | undefined;
  let burnAfterServe = false;
  if (record) {
    const categoryLabels: Record<string, string> = {
      general: "通用", chinese: "语文", math: "数学", english: "英语",
      physics: "物理", chemistry: "化学", history: "历史",
      biology: "生物", geography: "地理", other: "其他",
    };
    const categoryLabel = categoryLabels[record.category ?? "general"] || "学习";
    const description = record.tags ? `${categoryLabel} - ${record.tags}` : categoryLabel;
    pageMeta = {
      title: record.title || "学习页面",
      description,
      url: `https://100mini.com/p/${urlSegment}`,
    };

    // 爬虫/预取请求不计入访问次数，避免一次性链接被提前焚毁
    if (env.d1 && !isLikelyCrawler(env.userAgent, env.isPrefetch)) {
      const claim = await claimPageView(env.d1, id, Date.now());
      if (!claim.claimed) {
        // 并发抢占 / 已达上限：重读状态后给灰烬页
        const fresh = await getPageRecord(env.d1, id);
        if (fresh?.state === "burned") return ashes(fresh.burnReason ?? undefined);
        await burnPageContent(env, id, "views");
        return ashes("views");
      }
      // 达到上限：本次服务后焚毁（一次性链接即 maxViews=1）
      if (record.maxViews != null && claim.viewCount >= record.maxViews) burnAfterServe = true;
    }
  }

  const rawHtml = await obj.text();
  const baseHref = isZip ? `/p/${urlSegment}/` : undefined;
  // Anonymous uploads live under the `tmp/` R2 prefix; keep them out of search.
  const isAnonymousTmp = obj.key?.startsWith("tmp/") ?? false;
  const injected = injectBanner(rawHtml, pageMeta, baseHref, isAnonymousTmp);

  // 内容已读取：本次达上限后焚毁（一次性链接打开即焚）
  if (burnAfterServe) {
    await burnPageContent(env, id, "views");
  }

  return new Response(injected, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Security-Policy": "form-action 'none';",
    },
  });
}

/**
 * 焚毁页面内容：删除 R2 对象并标记 D1 记录为 burned，
 * 保留元数据（state/burn_reason/burned_at）与 burn_event 供滥用处置与统计。
 */
export async function burnPageContent(
  env: ServePageEnv,
  id: string,
  reason: "views" | "expired" | "manual"
): Promise<void> {
  const now = Date.now();
  try {
    if (env.bucket) await deletePageObjects(env.bucket, id);
    if (env.d1) {
      const record = await getPageRecord(env.d1, id);
      await markPageBurned(env.d1, id, reason, now);
      if (record) {
        await insertBurnEvent(env.d1, {
          pageId: id,
          userId: record.userId,
          event: "burned",
          expiryPreset: record.expiryPreset ?? null,
          maxViews: record.maxViews ?? null,
          isOneTime: record.maxViews === 1,
          burnReason: reason,
          viewCountAtBurn: record.viewCount ?? 0,
        });
      }
    }
    log.info("页面已焚毁", { pageId: id, reason });
  } catch (e) {
    log.error("焚毁失败", { pageId: id, reason, error: String(e) });
  }
}

function htmlHeaders(): HeadersInit {
  return { "Content-Type": "text/html; charset=utf-8" };
}

/** 服务页面缩略图（带一年 immutable 缓存），不存在返回 null */
export async function serveThumbnail(
  bucket: R2Bucket | undefined,
  id: string
): Promise<Response | null> {
  if (!/^[a-zA-Z0-9_-]{7}$/.test(id)) return null;
  if (!bucket) return null;

  const obj = await bucket.get(`thumbnails/${id}.webp`);
  if (!obj) return null;

  const headers = new Headers();
  headers.set("Content-Type", "image/webp");
  headers.set("Cache-Control", "public, max-age=31536000, immutable");
  return new Response(obj.body, { headers });
}
