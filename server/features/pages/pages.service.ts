/// <reference types="@cloudflare/workers-types" />
import { nanoid } from "nanoid";
import {
  FREE_PERMANENT_LIMIT,
  DEFAULT_POINTS,
  POINTS_PER_UPLOAD,
  MAX_CONTENT_SIZE,
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
import { injectBanner, notFoundHtml, detectLangFromHeader } from "./pages.render";
import {
  getMembershipExpiresAt,
  isMemberByUserId,
  countUserPages,
  listUserPages,
  findOwnedPage,
  getPageRecord,
  insertPageRecord,
  updatePageRecord,
  deletePageRecord,
  getUserPoints,
  getUserLinksLimitBonus,
  deductPointsAndAddBonus,
  incrementPageViewCount,
  getPageMeta,
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

// ---------- DTO 转换 ----------

function toUserPageItem(row: UserPageRow): UserPageItem {
  return {
    id: row.id,
    title: row.title || "",
    category: row.category || "general",
    tags: row.tags || "",
    isPermanent: row.isPermanent,
    viewCount: row.viewCount,
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

  const pageCount = await countUserPages(d1, user.id);
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

export interface UpdatePageInput {
  d1: D1Database;
  bucket: R2Bucket;
  userId: string;
  pageId: string;
  title?: string;
  category?: string;
  tags?: string;
  content?: string;
  file?: PageFileInput;
}

export async function updateOwnPage(input: UpdatePageInput): Promise<UpdatePageResponse> {
  const { d1, bucket, userId, pageId } = input;
  if (!(await findOwnedPage(d1, pageId, userId))) throw new ServiceError(404, "页面不存在");

  const updates: Record<string, string> = {};
  if (input.title) updates.title = input.title;
  if (input.category) updates.category = input.category;
  if (input.tags !== undefined) updates.tags = input.tags;

  if (input.content !== undefined && new Blob([input.content]).size > MAX_CONTENT_SIZE) {
    throw new ServiceError(413, "内容大小不能超过 5MB");
  }

  if (Object.keys(updates).length > 0) {
    await updatePageRecord(d1, pageId, updates);
  }

  if (input.file) {
    await replacePageObjects(bucket, pageId, input.file);
  } else if (input.content !== undefined) {
    // Detect ZIP format: HTML is stored under {id}/index.html instead of {id}.html
    const isZip = await bucket.get(`${pageId}/index.html`).then(Boolean).catch(() => false);
    const key = isZip ? `${pageId}/index.html` : `${pageId}.html`;
    await putHtml(bucket, key, input.content);
  }

  const updated = (await getPageRecord(d1, pageId))!;
  return { success: true, page: toUserPageItem(updated as UserPageRow) };
}

/** 用新文件整体替换页面的 R2 对象（ZIP: 清空 {id}/ 前缀重写；单 HTML: 覆盖并清理 ZIP 残留） */
async function replacePageObjects(bucket: R2Bucket, pageId: string, file: PageFileInput): Promise<void> {
  const { bytes, filename } = file;
  if (bytes.length > MAX_CONTENT_SIZE) throw new ServiceError(413, "文件大小不能超过 5MB");

  if (filename.toLowerCase().endsWith(".zip")) {
    const { unzipSync } = await import("fflate");
    const files = unzipSync(bytes);
    const entries = Object.keys(files);

    const htmlEntry =
      entries.find((f) => f.endsWith("/index.html") || f === "index.html") ||
      entries.find((f) => f.endsWith(".html"));
    if (!htmlEntry) throw new ServiceError(400, "ZIP 中未找到 HTML 文件");

    const totalSize = entries.reduce((sum, f) => sum + files[f].length, 0);
    if (totalSize > MAX_CONTENT_SIZE) throw new ServiceError(413, "解压后文件大小不能超过 5MB");

    await deletePageObjects(bucket, pageId);
    const puts = Object.entries(files).map(([name, data]) => {
      const key = name === htmlEntry ? `${pageId}/index.html` : `${pageId}/${name}`;
      const mime = getMimeType(name);
      const buf = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
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
  content?: string;
  file?: PageFileInput;
}

export async function createUpload(input: CreateUploadInput): Promise<UploadResult> {
  const { d1, bucket, user } = input;
  const title = input.title.trim();

  if (user && !title) throw new ServiceError(400, "标题不能为空");

  // Check quota for logged-in users requesting permanent storage.
  // Points are deducted only AFTER the page is successfully inserted (see below),
  // so a failed upload never consumes points.
  const wantPermanent = !!user;
  let needsDeduct = false;
  if (wantPermanent && user) {
    const expiresAt = d1 ? await getMembershipExpiresAt(d1, user.id) : null;
    const member = expiresAt !== null && expiresAt > Date.now();
    if (!member) {
      if (!d1) throw new ServiceError(503, "database unavailable");
      const pageCount = await countUserPages(d1, user.id);
      if (pageCount >= FREE_PERMANENT_LIMIT) {
        // Beyond free limit, need to spend points
        const points = await getUserPoints(d1, user.id);
        if (points < POINTS_PER_UPLOAD) {
          throw new ServiceError(
            403,
            `免费额度已用完（${pageCount}/${FREE_PERMANENT_LIMIT}），积分不足（当前 ${points}，需要 ${POINTS_PER_UPLOAD}）`
          );
        }
        needsDeduct = true;
      }
    }
  }

  let html: string;
  let zipEntries: Record<string, Uint8Array> | null = null;
  let htmlFile: string | undefined;

  if (input.file) {
    const { bytes, filename } = input.file;
    const ext = ALLOWED_EXTENSIONS.find((e) => filename.toLowerCase().endsWith(e));
    if (!ext) throw new ServiceError(400, "仅支持 .html 或 .zip 文件");
    if (bytes.length > MAX_CONTENT_SIZE) throw new ServiceError(413, "文件大小不能超过 5MB");

    if (ext === ".zip") {
      const { unzipSync } = await import("fflate");
      const files = unzipSync(bytes);
      const entries = Object.keys(files);

      htmlFile = entries.find((f) => f.endsWith("/index.html") || f === "index.html");
      if (!htmlFile) htmlFile = entries.find((f) => f.endsWith(".html"));
      if (!htmlFile) throw new ServiceError(400, "ZIP 中未找到 HTML 文件");

      const totalSize = entries.reduce((sum, f) => sum + files[f].length, 0);
      if (totalSize > MAX_CONTENT_SIZE) throw new ServiceError(413, "解压后文件大小不能超过 5MB");

      html = new TextDecoder().decode(files[htmlFile]);
      zipEntries = files;
    } else {
      html = new TextDecoder().decode(bytes);
    }
  } else if (input.content && input.content.trim()) {
    if (new Blob([input.content]).size > MAX_CONTENT_SIZE) {
      throw new ServiceError(413, "内容大小不能超过 5MB");
    }
    html = input.content;
  } else {
    throw new ServiceError(400, "请提供 HTML 内容或上传文件");
  }

  // 恶意 HTML 检测 + 净化（sanitize-html + 钓鱼关键词 + PhishDestroy + AI）
  const { detectAndSanitizeHtml, extractDomains, checkDomainsWithPhishDestroy, detectWithAi } = await import("./html-guard");
  const guard = detectAndSanitizeHtml(html);
  if (!guard.safe) {
    const detail = guard.threats.map((t) => `${t.label}(${t.count})`).join(", ");
    throw new ServiceError(400, `检测到不安全内容：${detail}`);
  }
  // 使用净化后的 HTML 存储（剥离 iframe/object/embed 等）
  html = guard.sanitizedHtml || html;

  // PhishDestroy 域名检查（提取 HTML 中的外部域名，检查是否为钓鱼站点）
  const domains = extractDomains(html);
  if (domains.length > 0) {
    const domainCheck = await checkDomainsWithPhishDestroy(domains);
    if (!domainCheck.safe) {
      const detail = domainCheck.threats.map((t) => `${t.domain}(${t.severity}, ${t.score}分)`).join(", ");
      throw new ServiceError(400, `检测到钓鱼域名：${detail}`);
    }
  }

  // AI 辅助检测（所有用户上传均触发）
  if (input.ai) {
    const aiResult = await detectWithAi(input.ai, html);
    if (!aiResult.safe) {
      throw new ServiceError(400, `AI 检测到不安全内容：${aiResult.verdict}`);
    }
  }

  const id = nanoid(7);
  const now = Date.now();
  const isAnonymous = !user;

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

  const isPermanent = wantPermanent;
  const expiresAt = isPermanent ? null : now + 7 * 24 * 60 * 60 * 1000;

  // Record in D1 only for logged-in users
  if (user && d1) {
    await insertPageRecord(d1, {
      id,
      userId: user.id,
      title: title || "未命名",
      category: input.category,
      tags: input.tags,
      isPermanent: true,
      isSharedToSquare: input.shareToSquare,
      sharedAt: input.shareToSquare ? new Date(now) : null,
      createdAt: new Date(now),
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    });
    // Deduct points and increase link limit bonus after the page is successfully persisted
    if (needsDeduct) {
      await deductPointsAndAddBonus(d1, user.id, POINTS_PER_UPLOAD);
    }
  }

  return {
    id,
    url: `/p/${id}`,
    expiresAt,
    isPermanent,
    title,
    isSharedToSquare: input.shareToSquare,
    previewPath: null,
  };
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
}

/** 服务用户页面 HTML 或其资产文件，含过期惰性清理、浏览量与 SEO 注入 */
export async function serveUserPage(
  env: ServePageEnv,
  rawPath: string,
  acceptLanguage: string | undefined
): Promise<Response> {
  const lang = detectLangFromHeader(acceptLanguage);

  // Parse /{id} or /{id}/{path}
  const match = rawPath.match(/^([a-zA-Z0-9_-]{7})(?:\/(.*))?$/);
  if (!match) return new Response(notFoundHtml(lang), { status: 404, headers: htmlHeaders() });

  const id = match[1];
  const path = match[2];

  // Check expiration from D1 (logged-in user pages)
  if (env.d1) {
    const record = await getPageRecord(env.d1, id);
    if (record && record.expiresAt && new Date(record.expiresAt) < new Date()) {
      if (env.bucket) await deletePageObjects(env.bucket, id);
      await deletePageRecord(env.d1, id);
      return new Response(notFoundHtml(lang), { status: 404, headers: htmlHeaders() });
    }
  }

  const bucket = env.bucket;
  if (!bucket) return new Response(notFoundHtml(lang), { status: 404, headers: htmlHeaders() });

  if (path && path !== "index.html") {
    // Serving an asset file (e.g. data.json, image.png)
    let isTmp = false;
    let obj = await bucket.get(`${id}/${path}`);
    if (!obj) { obj = await bucket.get(`tmp/${id}/${path}`); isTmp = true; }
    if (!obj) return new Response(notFoundHtml(lang), { status: 404, headers: htmlHeaders() });

    // Lazy cleanup for expired tmp uploads
    if (isTmp && isExpiredByUploaded(obj.uploaded)) {
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
    return new Response(notFoundHtml(lang), { status: 404, headers: htmlHeaders() });
  }

  // Lazy cleanup: delete expired anonymous tmp uploads
  if (obj.key?.startsWith("tmp/") && isExpiredByUploaded(obj.uploaded)) {
    await deleteTmpByBucketId(bucket, id);
    return new Response(notFoundHtml(lang), { status: 404, headers: htmlHeaders() });
  }

  // Increment view count + build SEO meta if tracked in D1
  let pageMeta: { title?: string; description?: string; url?: string } | undefined;
  if (env.d1) {
    const record = await getPageMeta(env.d1, id);
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
        url: `https://100mini.com/p/${id}`,
      };
    }
    await incrementPageViewCount(env.d1, id);
  }

  const rawHtml = await obj.text();
  const baseHref = isZip ? `/p/${id}/` : undefined;
  const injected = injectBanner(rawHtml, pageMeta, baseHref);

  return new Response(injected, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Security-Policy": "form-action 'none';",
    },
  });
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
