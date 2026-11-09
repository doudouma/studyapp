/**
 * 用户页面的「可索引」质量门槛（P0 SEO 卫生）
 *
 * 100mini 的 /p/* 是用户上传的任意 HTML：内容薄、外链杂、主题不可控。
 * 如果把这类页面全部放进 sitemap / 允许收录，整站会被打上低质量内容标签，
 * 外部检测（Moz Spam Score 等）也会被 UGC 稀释。
 *
 * 只有同时满足以下条件的页面才算「值得收录」：
 *  1. 归属登录用户（匿名页不收录）
 *  2. 用户主动分享到学习广场（isSharedToSquare）
 *  3. 永久且不限次（到期 / 一次性页面最终会 410，收录它们是软 404）
 *  4. 标题不是默认占位（有真实标题才说明作者认真做过）
 *  5. 创建已超过冷却期（给后台安全扫描与缩略图生成留时间）
 *
 * 其余页面照常可访问，但带 `noindex`，不进 sitemap。
 * 纯函数、无 IO，方便单测与 sitemap / 服务端共用同一套规则。
 */

/** 创建后至少多久才允许被收录：给审核、缩略图与人工观察留出窗口 */
export const INDEX_MIN_AGE_MS = 24 * 60 * 60 * 1000;

/** 上传时未填标题会落库成这个占位值（见 pages.service.ts createUpload） */
export const DEFAULT_PAGE_TITLE = "未命名";

export interface PageIndexabilityFacts {
  state?: string | null;
  isSharedToSquare?: boolean | null;
  userId?: string | null;
  title?: string | null;
  maxViews?: number | null;
  expiresAt?: Date | number | null;
  createdAt?: Date | number | null;
}

export interface SharedPageCandidate extends PageIndexabilityFacts {
  id: string;
  sharedAt?: Date | number | null;
  /** 主 HTML 的 SHA-256（上传时计算），用于剔除完全重复的页面 */
  contentHash?: string | null;
}

function toMillis(value: Date | number | null | undefined): number | null {
  if (value == null) return null;
  const ms = value instanceof Date ? value.getTime() : value;
  return Number.isFinite(ms) ? ms : null;
}

/** 页面是否允许被搜索引擎收录 / 进入 sitemap */
export function isIndexablePage(
  facts: PageIndexabilityFacts,
  now: number = Date.now(),
): boolean {
  if (facts.state !== "active") return false;
  if (facts.isSharedToSquare !== true) return false;
  if (!facts.userId) return false;

  // 限次 / 到期页面最终会变成 410，不应被收录
  if (facts.maxViews != null) return false;
  if (facts.expiresAt != null) return false;

  const title = (facts.title ?? "").trim();
  if (!title || title === DEFAULT_PAGE_TITLE) return false;

  const createdAt = toMillis(facts.createdAt);
  if (createdAt == null) return false;
  if (createdAt > now - INDEX_MIN_AGE_MS) return false;

  return true;
}

/**
 * 从 sitemap 候选行里挑出可收录页面：
 *  - 过 `isIndexablePage` 质量门槛
 *  - 跳过没有 sharedAt 的脏数据
 *  - 同一 contentHash 只保留一条（完全重复的页面是典型的薄内容/门页信号）
 *  - 最多 limit 条，避免 sitemap 无限膨胀
 */
export function selectIndexableSharedPages<T extends SharedPageCandidate>(
  rows: T[],
  now: number = Date.now(),
  limit: number = 1000,
): T[] {
  const seenHashes = new Set<string>();
  const picked: T[] = [];

  for (const row of rows) {
    if (picked.length >= limit) break;
    if (row.sharedAt == null) continue;
    if (!isIndexablePage(row, now)) continue;
    if (row.contentHash) {
      if (seenHashes.has(row.contentHash)) continue;
      seenHashes.add(row.contentHash);
    }
    picked.push(row);
  }

  return picked;
}
