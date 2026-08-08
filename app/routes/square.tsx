import { useState, useEffect, useRef } from "react";
import { createFileRoute, useLoaderData } from "@tanstack/react-router";
import { Globe, Loader2 } from "lucide-react";
import { AppNav } from "~/components/HomeHeader";
import { AppFooter } from "~/components/AppFooter";
import { SquareGrid } from "~/components/SquareGrid";
import { fetchSquareData, type SquareItem } from "~/lib/square-server";
import { useTranslation } from "react-i18next";
import i18n from "~/lib/i18n";

const PAGE_SIZE = 12;

export const Route = createFileRoute("/square")({
  validateSearch: (search: Record<string, string | undefined>) => ({
    q: search.q || "",
  }),
  loader: async () => {
    return fetchSquareData({ data: { offset: 0 } });
  },
  head: () => ({
    meta: [
      { title: i18n.t("square.title") },
      {
        name: "description",
        content: i18n.t("square.desc"),
      },
      { name: "keywords", content: i18n.t("square.keywords") },
      { property: "og:type", content: "website" },
      { property: "og:title", content: i18n.t("square.title") },
      {
        property: "og:description",
        content: i18n.t("square.desc"),
      },
      { property: "og:url", content: "https://100mini.com/square" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: i18n.t("square.title") },
      {
        name: "twitter:description",
        content: i18n.t("square.desc"),
      },
    ],
    links: [
      { rel: "canonical", href: "https://100mini.com/square" },
    ],
  }),
  component: SquarePage,
});

const CATEGORIES = [
  { key: "", tKey: "square.all" },
  { key: "general", tKey: "home.select.default" },
  { key: "chinese", tKey: "home.select.chinese" },
  { key: "math", tKey: "home.select.math" },
  { key: "english", tKey: "home.select.english" },
  { key: "physics", tKey: "home.select.physics" },
  { key: "chemistry", tKey: "home.select.chemistry" },
  { key: "history", tKey: "home.select.history" },
  { key: "biology", tKey: "home.select.biology" },
  { key: "geography", tKey: "home.select.geography" },
  { key: "other", tKey: "home.select.other" },
];

function SquarePage() {
  const { t } = useTranslation();
  const { q } = Route.useSearch();
  const { items: initialItems, hasMore: initialHasMore } = useLoaderData({ from: Route.id });
  const [allItems, setAllItems] = useState<SquareItem[]>(initialItems);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState("");
  const [activeTag, setActiveTag] = useState("");
  const [searchQuery, setSearchQuery] = useState(q);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const allItemsRef = useRef(initialItems);
  const hasMoreRef = useRef(initialHasMore);
  const loadingRef = useRef(false);

  useEffect(() => {
    setAllItems(initialItems);
    allItemsRef.current = initialItems;
    setHasMore(initialHasMore);
    hasMoreRef.current = initialHasMore;
  }, [initialItems, initialHasMore]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      async ([entry]) => {
        if (entry.isIntersecting && hasMoreRef.current && !loadingRef.current) {
          loadingRef.current = true;
          setLoading(true);
          try {
            const offset = allItemsRef.current.length;
            const result = await fetchSquareData({ data: { offset } });
            setAllItems((prev) => {
              const next = [...prev, ...result.items];
              allItemsRef.current = next;
              return next;
            });
            setHasMore(result.hasMore);
            hasMoreRef.current = result.hasMore;
          } finally {
            loadingRef.current = false;
            setLoading(false);
          }
        }
      },
      { rootMargin: "400px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  const allTags = Array.from(
    new Set(
      allItems
        .flatMap((i) => (i.tags ? i.tags.split(/[,，]+/).map((t) => t.trim()).filter(Boolean) : []))
    )
  ).sort();

  const filtered = allItems.filter((i) => {
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
              <h1 className="text-2xl font-bold text-foreground">{t("square.heading")}</h1>
            </div>
            <p className="mt-1.5 text-base text-muted-foreground">
              {t("square.subtitle")}
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
                {t(cat.tKey)}
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
                {t("square.allTags")}
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

          {/* Infinite scroll sentinel */}
          <div ref={sentinelRef} className="h-4" />
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">{t("common.loading")}</span>
            </div>
          )}
          {!hasMore && allItems.length > PAGE_SIZE && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {t("square.loadedAll")}
            </p>
          )}
        </div>
      </main>

      <AppFooter />
    </div>
  );
}
