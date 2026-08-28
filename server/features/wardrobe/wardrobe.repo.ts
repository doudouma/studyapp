import { eq, desc, and, sql } from "drizzle-orm";
import { createDb } from "../../db";
import { wardrobeItem, wardrobeJob, wardrobeOutfit } from "../../db/schema";

/**
 * Wardrobe 数据访问层 (Repository)
 * 只做数据读写，不含业务规则，不感知 HTTP
 */

// ==================== Job ====================

/** 创建任务 */
export async function createJob(
  d1: D1Database,
  jobId: string,
  userId: string,
  imageUrl: string
): Promise<void> {
  const db = createDb(d1);
  await db.insert(wardrobeJob).values({
    id: jobId,
    userId,
    status: "pending",
    originalImageUrl: imageUrl,
  });
}

/** 获取任务 */
export async function getJob(
  d1: D1Database,
  jobId: string
): Promise<typeof wardrobeJob.$inferSelect | undefined> {
  const db = createDb(d1);
  return db.select().from(wardrobeJob).where(eq(wardrobeJob.id, jobId)).get();
}

/** 更新任务状态 */
export async function updateJobStatus(
  d1: D1Database,
  jobId: string,
  data: {
    status?: string;
    analysisResult?: string;
    error?: string;
  }
): Promise<void> {
  const db = createDb(d1);
  await db.update(wardrobeJob)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(wardrobeJob.id, jobId));
}

// ==================== Item ====================

/** 获取用户所有服装项 */
export async function getUserItems(
  d1: D1Database,
  userId: string
): Promise<typeof wardrobeItem.$inferSelect[]> {
  const db = createDb(d1);
  return db.select()
    .from(wardrobeItem)
    .where(eq(wardrobeItem.userId, userId))
    .orderBy(desc(wardrobeItem.createdAt))
    .all();
}

/** 获取服装项 */
export async function getItem(
  d1: D1Database,
  itemId: string
): Promise<typeof wardrobeItem.$inferSelect | undefined> {
  const db = createDb(d1);
  return db.select().from(wardrobeItem).where(eq(wardrobeItem.id, itemId)).get();
}

/** 创建服装项 */
export async function createItem(
  d1: D1Database,
  data: {
    id: string;
    userId: string;
    name: string;
    part: string;
    color: string;
    secondaryColor: string | null;
    tags: string;
    imageUrl: string;
  }
): Promise<void> {
  const db = createDb(d1);
  await db.insert(wardrobeItem).values(data);
}

/** 更新服装项 */
export async function updateItem(
  d1: D1Database,
  itemId: string,
  data: Record<string, unknown>
): Promise<void> {
  const db = createDb(d1);
  await db.update(wardrobeItem)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(wardrobeItem.id, itemId));
}

/** 删除服装项 */
export async function deleteItem(
  d1: D1Database,
  itemId: string
): Promise<void> {
  const db = createDb(d1);
  await db.delete(wardrobeItem).where(eq(wardrobeItem.id, itemId));
}

// ==================== Outfit ====================

/** 获取用户所有 outfit */
export async function getUserOutfits(
  d1: D1Database,
  userId: string
): Promise<typeof wardrobeOutfit.$inferSelect[]> {
  const db = createDb(d1);
  return db.select()
    .from(wardrobeOutfit)
    .where(eq(wardrobeOutfit.userId, userId))
    .orderBy(desc(wardrobeOutfit.createdAt))
    .all();
}

/** 获取 outfit */
export async function getOutfit(
  d1: D1Database,
  outfitId: string
): Promise<typeof wardrobeOutfit.$inferSelect | undefined> {
  const db = createDb(d1);
  return db.select().from(wardrobeOutfit).where(eq(wardrobeOutfit.id, outfitId)).get();
}

/** 创建 outfit */
export async function createOutfit(
  d1: D1Database,
  data: {
    id: string;
    userId: string;
    name: string;
    occasion: string | null;
    itemIds: string;
    status: string;
  }
): Promise<void> {
  const db = createDb(d1);
  await db.insert(wardrobeOutfit).values(data);
}

/** 更新 outfit 状态 */
export async function updateOutfitStatus(
  d1: D1Database,
  outfitId: string,
  data: {
    status?: string;
    imageUrl?: string;
    error?: string;
  }
): Promise<void> {
  const db = createDb(d1);
  await db.update(wardrobeOutfit)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(wardrobeOutfit.id, outfitId));
}

/** 删除 outfit */
export async function deleteOutfit(
  d1: D1Database,
  outfitId: string
): Promise<void> {
  const db = createDb(d1);
  await db.delete(wardrobeOutfit).where(eq(wardrobeOutfit.id, outfitId));
}

/** 批量获取服装项 (用于 outfit 验证) */
export async function getItemsByIds(
  d1: D1Database,
  userId: string,
  itemIds: string[]
): Promise<typeof wardrobeItem.$inferSelect[]> {
  const db = createDb(d1);
  return db.select()
    .from(wardrobeItem)
    .where(
      and(
        eq(wardrobeItem.userId, userId),
        sql`${wardrobeItem.id} IN (${sql.join(itemIds.map((id) => sql`${id}`), sql`, `)})`
      )
    )
    .all();
}