import { eq, and, desc } from "drizzle-orm";
import { createDb } from "../../db";
import { page, user } from "../../db/schema";

/**
 * 广场数据访问层 (Repository)
 * 只做数据读写，不含业务规则，不感知 HTTP
 */

/** 广场列表查询的原始行结构 (sharedAt 为 Date，由 service 层转换) */
export interface SharedPageRow {
  id: string;
  title: string | null;
  category: string | null;
  tags: string | null;
  viewCount: number;
  sharedAt: Date | null;
  previewPath: string | null;
  userName: string | null;
  userImage: string | null;
}

/** 按分享时间倒序分页拉取已分享到广场的页面 (多取一条用于判断 hasMore) */
export async function listSharedPages(
  d1: D1Database,
  offset: number,
  limit: number
): Promise<SharedPageRow[]> {
  const db = createDb(d1);
  return db
    .select({
      id: page.id,
      title: page.title,
      category: page.category,
      tags: page.tags,
      viewCount: page.viewCount,
      sharedAt: page.sharedAt,
      previewPath: page.previewPath,
      userName: user.name,
      userImage: user.image,
    })
    .from(page)
    .leftJoin(user, eq(page.userId, user.id))
    .where(eq(page.isSharedToSquare, true))
    .orderBy(desc(page.sharedAt))
    .limit(limit + 1)
    .offset(offset);
}

/** 判断页面是否存在且属于指定用户 */
export async function isPageOwnedBy(
  d1: D1Database,
  pageId: string,
  userId: string
): Promise<boolean> {
  const db = createDb(d1);
  const rows = await db
    .select({ id: page.id })
    .from(page)
    .where(and(eq(page.id, pageId), eq(page.userId, userId)))
    .limit(1);
  return rows.length > 0;
}

/** 取消页面在广场的分享 */
export async function clearSquareSharing(d1: D1Database, pageId: string): Promise<void> {
  const db = createDb(d1);
  await db
    .update(page)
    .set({ isSharedToSquare: false, sharedAt: null })
    .where(eq(page.id, pageId));
}
