import { useState, useEffect } from "react";
import { createFileRoute, useLoaderData } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { Globe } from "lucide-react";
import { AppNav } from "~/components/HomeHeader";
import { AppFooter } from "~/components/AppFooter";
import { SquareGrid } from "~/components/SquareGrid";
import { useAuth } from "~/lib/auth-context";
import { createDb } from "~/../server/db";
import { page, user } from "~/../server/db/schema";
import { eq, desc } from "drizzle-orm";

interface SquareItem {
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

const fetchSquareData = createServerFn().handler(async (): Promise<SquareItem[]> => {
  const request = getRequest();
  const env = (request as any)?.cloudflare?.env || (globalThis as any).__CF_ENV__;
  
  if (!env?.D1) {
    return [];
  }

  const db = createDb(env.D1);
  const items = await db
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
    .orderBy(desc(page.sharedAt));

  return items.map((item) => ({
    ...item,
    title: item.title || "",
    category: item.category || "general",
    tags: item.tags || "",
    sharedAt: item.sharedAt ? new Date(item.sharedAt).getTime() : 0,
  })) as SquareItem[];
});

export const Route = createFileRoute("/square")({
  validateSearch: (search: Record<string, string | undefined>) => ({
    q: search.q || "",
  }),
  loader: async () => {
    const items = await fetchSquareData();
    return { items };
  },
  head: () => ({
    title: "学习广场 - 发现和分享 HTML 学习资源 | 100mini",
    meta: [
      {
        name: "description",
        content: "浏览社区分享的 HTML 学习页面、互动工具和创意作品。支持按学科、标签筛选，发现优质学习资源。",
      },
      { name: "keywords", content: "学习广场,HTML分享,学习资源,互动工具,教育页面,学科资源" },
      { property: "og:type", content: "website" },
      { property: "og:title", content: "学习广场 - 发现和分享 HTML 学习资源 | 100mini" },
      {
        property: "og:description",
        content: "浏览社区分享的 HTML 学习页面、互动工具和创意作品。支持按学科、标签筛选。",
      },
      { property: "og:url", content: "https://100mini.com/square" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "学习广场 - 发现和分享 HTML 学习资源 | 100mini" },
      {
        name: "twitter:description",
        content: "浏览社区分享的 HTML 学习页面、互动工具和创意作品。",
      },
    ],
    links: [
      { rel: "canonical", href: "https://100mini.com/square" },
    ],
  }),
  component: SquarePage,
});

const CATEGORIES = [
  { key: "", label: "全部" },
  { key: "general", label: "通用" },
  { key: "chinese", label: "语文" },
  { key: "math", label: "数学" },
  { key: "english", label: "英语" },
  { key: "physics", label: "物理" },
  { key: "chemistry", label: "化学" },
  { key: "history", label: "历史" },
  { key: "biology", label: "生物" },
  { key: "geography", label: "地理" },
  { key: "other", label: "其他" },
];

function SquarePage() {
  const { q } = Route.useSearch();
  const { user } = useAuth();
  const { items: initialItems } = useLoaderData({ from: Route.id });
  const [items, setItems] = useState<SquareItem[]>(initialItems);
  const [activeCategory, setActiveCategory] = useState("");
  const [activeTag, setActiveTag] = useState("");
  const [searchQuery, setSearchQuery] = useState(q);

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const allTags = Array.from(
    new Set(
      items
        .flatMap((i) => (i.tags ? i.tags.split(/[,，]+/).map((t) => t.trim()).filter(Boolean) : []))
    )
  ).sort();

  const filtered = items.filter((i) => {
    if (activeCategory && i.category !== activeCategory) return false;
    if (activeTag) {
      const itemTags = i.tags ? i.tags.split(/[,，]+/).map((t) => t.trim()) : [];
      if (!itemTags.includes(activeTag)) return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = i.title.toLowerCase().includes(q);
      const matchUser = i.userName?.toLowerCase().includes(q) ?? false;
      const matchCategory = i.category.toLowerCase().includes(q);
      const matchTags = i.tags?.toLowerCase().includes(q) ?? false;
      if (!matchTitle && !matchUser && !matchCategory && !matchTags) return false;
    }
    return true;
  });

  return (
    <div className="flex min-h-screen flex-col">
      <AppNav
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <main className="flex-1">
        <div className="mx-auto max-w-360 px-6 pt-10 pb-12">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2">
              <Globe className="size-6 text-[#006c49] dark:text-[#4edea3]" />
              <h1 className="text-2xl font-bold text-foreground">学习广场</h1>
            </div>
            <p className="mt-1.5 text-base text-muted-foreground">
              发现来自社区的学习页面与互动工具
            </p>
          </div>

          {/* Category filter */}
          <div className="mb-4 flex items-center gap-2 overflow-x-auto border-b border-[#d3e4fe] dark:border-[#3c4a42] pb-3">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                  activeCategory === cat.key
                    ? "bg-[#006c49] text-white dark:bg-[#4edea3] dark:text-[#002113]"
                    : "bg-[#e5eeff] text-[#3c4a42] dark:bg-[#1e314a] dark:text-[#8f9e95] hover:bg-[#dce9ff] dark:hover:bg-[#213145]"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Tag filter */}
          {allTags.length > 0 && (
            <div className="mb-8 flex flex-wrap items-center gap-2">
              <button
                onClick={() => setActiveTag("")}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                  activeTag === ""
                    ? "bg-secondary text-secondary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                全部标签
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(activeTag === tag ? "" : tag)}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                    activeTag === tag
                      ? "bg-secondary text-secondary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}

          {/* Grid */}
          <SquareGrid items={filtered} />
        </div>
      </main>

      <AppFooter />
    </div>
  );
}
