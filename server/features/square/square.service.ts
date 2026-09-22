import type { SquareData, SquareItem } from "@shared/types/square";
import {
  listSharedPages,
  isPageOwnedBy,
  clearSquareSharing,
  listSharedPageIds,
  clearNonSharedPreviewPaths,
  type SharedPageRow,
} from "./square.repo";

/**
 * 广场业务逻辑层 (Service)
 * 承载业务规则与 DTO 转换，供 routes 与未来其他调用方复用
 */

/** DB 原始行 → 前端 DTO */
function toSquareItem(row: SharedPageRow): SquareItem {
  return {
    id: row.id,
    title: row.title || "",
    category: row.category || "general",
    tags: row.tags || "",
    viewCount: row.viewCount,
    sharedAt: row.sharedAt ? row.sharedAt.getTime() : 0,
    previewPath: row.previewPath,
    userName: row.userName,
    userImage: row.userImage,
  };
}

/** 获取广场分页数据；offset 越界时返回空页 */
export async function getSquarePage(
  d1: D1Database | undefined,
  offset: number,
  pageSize: number
): Promise<SquareData> {
  if (!d1) return { items: [], hasMore: false };

  const rows = await listSharedPages(d1, Math.max(0, offset), pageSize);
  const hasMore = rows.length > pageSize;
  const items = rows.slice(0, pageSize).map(toSquareItem);
  return { items, hasMore };
}

/** 取消分享；页面不存在或不属于该用户时返回 false。同时删除不再需要的缩略图 */
export async function unshareFromSquare(
  d1: D1Database | undefined,
  bucket: R2Bucket | undefined,
  pageId: string,
  userId: string
): Promise<boolean> {
  if (!d1) return false;
  const owned = await isPageOwnedBy(d1, pageId, userId);
  if (!owned) return false;
  await clearSquareSharing(d1, pageId);
  // 缩略图仅用于广场，取消分享后删除（失败不影响取消结果）
  if (bucket) {
    try {
      await bucket.delete(`thumbnails/${pageId}.webp`);
    } catch {
      // best-effort：R2 删除失败仅遗留孤立对象，不影响分享状态
    }
  }
  return true;
}

const THUMBNAIL_PREFIX = "thumbnails/";

/**
 * 清理孤立缩略图（只有已分享到广场的页面需要缩略图）：
 * - 全量扫描 R2 `thumbnails/` 前缀，删除不属于任何已分享页面的对象（含无 D1 记录的残留）；
 * - 清空非分享页面的 `preview_path` 引用。
 * 由每日 cron 调用，也可经管理接口手动触发。
 */
export async function cleanupOrphanThumbnails(
  d1: D1Database | undefined,
  bucket: R2Bucket | undefined
): Promise<{ deleted: number; scanned: number }> {
  if (!d1 || !bucket) return { deleted: 0, scanned: 0 };

  const sharedIds = await listSharedPageIds(d1);
  const keep = new Set(sharedIds.map((id) => `${THUMBNAIL_PREFIX}${id}.webp`));

  let cursor: string | undefined;
  let scanned = 0;
  let deleted = 0;
  do {
    const listed = await bucket.list({ prefix: THUMBNAIL_PREFIX, cursor });
    scanned += listed.objects.length;
    const orphans = listed.objects.map((o) => o.key).filter((key) => !keep.has(key));
    if (orphans.length > 0) {
      await bucket.delete(orphans);
      deleted += orphans.length;
    }
    cursor = listed.truncated ? listed.cursor : undefined;
  } while (cursor);

  await clearNonSharedPreviewPaths(d1);

  return { deleted, scanned };
}
