import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import i18n from "~/lib/i18n";
import { BASE_URL } from "~/lib/lang";
import { AppNav } from "~/components/HomeHeader";
import { AppFooter } from "~/components/AppFooter";
import { CaseCard } from "~/components/showcase/CaseCard";
import {
  TerminalCmd,
  TerminalCursor,
  TerminalPrompt,
  TerminalWindow,
} from "~/components/showcase/TerminalWindow";
import { getCases, getUsedCategories } from "~/features/showcase/cases";

export const Route = createFileRoute("/showcase")({
  head: () => {
    const title = i18n.t("showcase.title");
    const desc = i18n.t("showcase.desc");
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { name: "keywords", content: i18n.t("showcase.keywords") },
        { name: "robots", content: "index, follow" },
        { property: "og:type", content: "website" },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:site_name", content: "100mini" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: desc },
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: title,
            description: desc,
            numberOfItems: getCases().length,
            itemListElement: getCases().map((c, i) => ({
              "@type": "ListItem",
              position: i + 1,
              url: `${BASE_URL}/showcase/${c.slug}`,
              name: c.name,
            })),
          }),
        },
      ],
    };
  },
  component: ShowcasePage,
});

function ShowcasePage() {
  const { t } = useTranslation();
  const cases = getCases();
  const categories = getUsedCategories();
  const [activeCategory, setActiveCategory] = useState("");
  const [query, setQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return cases.filter((c) => {
      if (activeCategory && c.category !== activeCategory) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.slug.includes(q) ||
        c.summary.toLowerCase().includes(q) ||
        c.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    });
  }, [cases, activeCategory, query]);

  return (
    <div className="flex min-h-screen flex-col">
      <AppNav />

      <main className="flex-1">
        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
          <TerminalWindow title="100mini ~ /showcase — zsh" bodyClassName="p-4 text-[11px] sm:p-5">
            <h1 className="font-bold text-[15px] leading-snug text-[#000000] dark:text-[#e6edf6]">
              <span aria-hidden className="text-muted-foreground/40">
                #{" "}
              </span>
              {t("showcase.heading")}
            </h1>
            <p className="mt-1 text-muted-foreground">{t("showcase.subtitle")}</p>

            {/* 命令栏 + 分类过滤 */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-b border-dashed border-[#e0e0e0] pb-3 dark:border-[#243244]">
              <div className="text-[11px]">
                <TerminalPrompt /> <TerminalCmd>ls /showcase</TerminalCmd>{" "}
                <span className="text-muted-foreground">
                  — {t("showcase.count", { count: filtered.length })}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setActiveCategory("")}
                  className={`cursor-pointer rounded-full border px-2.5 py-0.5 text-[10px] font-semibold transition-colors ${
                    activeCategory === ""
                      ? "border-[#006c49] bg-[#006c49] text-white dark:border-[#4edea3] dark:bg-[#4edea3] dark:text-[#002113]"
                      : "border-[#cfcfcf] text-muted-foreground hover:text-foreground dark:border-[#243244]"
                  }`}
                >
                  {t("showcase.filter.all")}
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(activeCategory === cat ? "" : cat)}
                    className={`cursor-pointer rounded-full border px-2.5 py-0.5 text-[10px] font-semibold transition-colors ${
                      activeCategory === cat
                        ? "border-[#006c49] bg-[#006c49] text-white dark:border-[#4edea3] dark:bg-[#4edea3] dark:text-[#002113]"
                        : "border-[#cfcfcf] text-muted-foreground hover:text-foreground dark:border-[#243244]"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* 搜索：未输入且未聚焦时显示「闪烁光标 + 占位文案」提示可以输入。
                提示符后用不换行空格（而非 flex gap）与 $ ls / cat 行的文字列严格对齐 */}
            <div className="mt-3 flex items-center">
              <span aria-hidden className="text-muted-foreground/50">
                {">\u00A0"}
              </span>
              <div className="relative min-w-0 flex-1">
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  aria-label={t("showcase.searchPlaceholder")}
                  placeholder={t("showcase.searchPlaceholder")}
                  className="w-full bg-transparent text-[11px] text-[#000000] outline-none placeholder:text-transparent dark:text-[#c9d5e4]"
                />
                {query === "" && !searchFocused ? (
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-y-0 left-0 flex items-center text-[11px] text-muted-foreground/60"
                  >
                    <TerminalCursor className="ml-0 translate-y-0" />
                    <span className="ml-1">{t("showcase.searchPlaceholder")}</span>
                  </span>
                ) : null}
              </div>
            </div>

            {/* 卡片网格：最大 3 列，保证缩略图够大 */}
            {filtered.length > 0 ? (
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((item, index) => (
                  <CaseCard key={item.slug} item={item} index={index} />
                ))}
              </div>
            ) : (
              <div className="mt-4 border border-dashed border-[#cfcfcf] px-4 py-8 text-center dark:border-[#243244]">
                <p className="text-[11px]">
                  <TerminalPrompt /> <TerminalCmd>grep</TerminalCmd>{" "}
                  <span className="text-muted-foreground">{t("showcase.empty")}</span>{" "}
                  <TerminalCursor />
                </p>
                <p className="mt-1.5 text-[10px] text-muted-foreground">{t("showcase.emptyDesc")}</p>
              </div>
            )}

            <div className="mt-4 text-[11px]">
              <TerminalPrompt /> <TerminalCmd>cat {"{slug}"}</TerminalCmd> <TerminalCursor />
            </div>
          </TerminalWindow>
        </div>
      </main>

      <AppFooter />
    </div>
  );
}
