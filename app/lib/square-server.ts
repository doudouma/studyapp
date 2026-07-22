import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { createDb } from "../../server/db";
import { page, user } from "../../server/db/schema";
import { eq, desc } from "drizzle-orm";

const PAGE_SIZE = 12;

export interface SquareItem {
  id: string;
  title: string;
  category: string;
  tags: string;
  viewCount: number;
  sharedAt: number;
  previewPath: string | null;
  userName: string | null;
  userImage: string | null;
}

export interface SquareData {
  items: SquareItem[];
  hasMore: boolean;
}

export const fetchSquareData = createServerFn()
  .inputValidator((input: unknown) => input as { offset: number })
  .handler(async (ctx) => {
    const { offset } = ctx.data;
    const request = getRequest();
    const env = (request as any)?.cloudflare?.env || (globalThis as any).__CF_ENV__;

    if (!env?.D1) {
      return { items: [], hasMore: false };
    }

    const db = createDb(env.D1);
    const dbItems = await db
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
      .limit(PAGE_SIZE + 1)
      .offset(offset);

    const hasMore = dbItems.length > PAGE_SIZE;
    const items = dbItems.slice(0, PAGE_SIZE).map((item) => ({
      ...item,
      title: item.title || "",
      category: item.category || "general",
      tags: item.tags || "",
      sharedAt: item.sharedAt ? item.sharedAt.getTime() : 0,
    })) as SquareItem[];

    return { items, hasMore };
  });
