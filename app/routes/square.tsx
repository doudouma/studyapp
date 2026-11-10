import { useState, useEffect, useRef } from "react";
import { createFileRoute, useLoaderData } from "@tanstack/react-router";
import { Loader2, Search } from "lucide-react";
import { AppNav } from "~/components/HomeHeader";
import { AppFooter } from "~/components/AppFooter";
import { SquareGrid } from "~/components/SquareGrid";
import { fetchSquareItems } from "~/features/square/api";
import type { SquareItem } from "@shared/types/square";
import { SQUARE_PAGE_SIZE } from "@shared/types/square";
import { useTranslation } from "react-i18next";
import i18n from "~/lib/i18n";
import { AIX_CSS } from "~/components/aix/aix-styles";
import { BOOKS_CSS } from "~/components/aix/books-styles";

export const Route = createFileRoute("/square")({
  // Only carry `q` when it is actually present. Returning a default `{ q: "" }`
  // makes TanStack Router normalize the URL and 307-redirect `/square` to
  // `/square?q=` — but `/square` is the canonical URL (and the sitemap entry),
  // so the redirect created a canonical↔redirect loop.
  validateSearch: (search: Record<string, string | undefined>): { q?: string } => {
    const q = typeof search.q === "string" ? search.q : "";
    return q ? { q } : {};
  },
  loader: async () => {
    return fetchSquareItems(0);
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
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: i18n.t("square.title") },
      {
        name: "twitter:description",
        content: i18n.t("square.desc"),
      },
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
  const { q = "" } = Route.useSearch();
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
            const result = await fetchSquareItems(offset);
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

  const handleDeleted = (id: string) => {
    setAllItems((prev) => {
      const next = prev.filter((item) => item.id !== id);
      allItemsRef.current = next;
      return next;
    });
  };

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
    <div className="flex min-h-screen flex-col bg-[#ededed] dark:bg-[#0c0d0f]">
      <AppNav />

      <main className="flex-1">
        <div className="aix">
          <style dangerouslySetInnerHTML={{ __html: AIX_CSS + BOOKS_CSS }} />
          <section className="aix-frame" style={{ marginTop: 0 }}>
            <div className="aix-lead">
              <div>
                <div className="aix-topline">
                  <span className="aix-pill lime">
                    <span className="dot" />
                    COMMUNITY
                  </span>
                </div>
                <h1>{t("square.heading")}</h1>
                <p>{t("square.subtitle")}</p>
              </div>
              <div className="aix-lead-meta">
                <span>{allItems.length} PAGES</span>
              </div>
            </div>

            <div className="ab-search">
              <Search className="ic" />
              <input
                type="search"
                placeholder={t("nav.search")}
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                autoComplete="off"
              />
            </div>

            <div className="ab-filterrow" style={{ marginTop: 14 }}>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key)}
                  className={`ab-chip${activeCategory === cat.key ? " is-active" : ""}`}
                >
                  {t(cat.tKey)}
                </button>
              ))}
            </div>

            {allTags.length > 0 && (
              <div className="ab-filterrow" style={{ marginTop: 10 }}>
                <button
                  onClick={() => setActiveTag("")}
                  className={`ab-chip${activeTag === "" ? " is-active" : ""}`}
                >
                  {t("square.allTags")}
                </button>
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setActiveTag(activeTag === tag ? "" : tag)}
                    className={`ab-chip${activeTag === tag ? " is-active" : ""}`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}

            <div style={{ marginTop: 22 }}>
              <SquareGrid items={filtered} onDeleted={handleDeleted} />
            </div>

            <div ref={sentinelRef} className="h-4" />
            {loading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="size-5 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">{t("common.loading")}</span>
              </div>
            )}
            {!hasMore && allItems.length > SQUARE_PAGE_SIZE && (
              <p className="py-8 text-center text-sm text-muted-foreground">
                {t("square.loadedAll")}
              </p>
            )}
          </section>
        </div>
      </main>

      <AppFooter />
    </div>
  );}
