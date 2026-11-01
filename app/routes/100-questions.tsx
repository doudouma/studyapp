import { useMemo, useState } from "react";
import { createFileRoute, useLoaderData } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import i18n from "~/lib/i18n";
import { currentLang } from "~/lib/seo";
import { AppNav } from "~/components/HomeHeader";
import { AppFooter } from "~/components/AppFooter";
import { ArticleCard } from "~/components/questions/ArticleCard";
import {
  TerminalCmd,
  TerminalCursor,
  TerminalPrompt,
  TerminalWindow,
} from "~/components/showcase/TerminalWindow";
import { getArticles } from "~/features/questions/articles";
import { buildQuestionCollectionJsonLd } from "~/features/questions/seo";

export const Route = createFileRoute("/100-questions")({
  loader: async () => await getArticles(currentLang()),
  head: async () => {
    const title = i18n.t("questions.title");
    const desc = i18n.t("questions.desc");
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { name: "keywords", content: i18n.t("questions.keywords") },
        { name: "robots", content: "index, follow" },
        { property: "og:type", content: "website" },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:site_name", content: "100mini" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: desc },
      ],
    };
  },
  component: QuestionsPage,
});

function QuestionsPage() {
  const { t } = useTranslation();
  const articles = useLoaderData({ from: Route.id });
  const jsonLd = buildQuestionCollectionJsonLd(
    articles,
    articles[0]?.locale ?? currentLang(),
    t("questions.h1"),
    t("questions.desc"),
  );
  const [query, setQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return articles;
    return articles.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.slug.includes(q) ||
        a.summary.toLowerCase().includes(q) ||
        a.tags.some((tag) => tag.toLowerCase().includes(q)),
    );
  }, [articles, query]);

  return (
    <div className="flex min-h-screen flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <AppNav />

      <main className="flex-1">
        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
          <TerminalWindow title="100mini ~ /100-questions — zsh" bodyClassName="p-4 text-[11px] sm:p-5">
            <div className="flex items-baseline gap-1.5">
              <span aria-hidden className="text-[15px] font-bold leading-snug text-muted-foreground/40">
                #
              </span>
              <h1 className="text-[15px] font-bold leading-snug text-[#000000] dark:text-[#e6edf6]">
                {t("questions.h1")}
              </h1>
            </div>
            <p className="mt-1 text-muted-foreground">{t("questions.subtitle")}</p>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-b border-dashed border-[#e0e0e0] pb-3 dark:border-[#243244]">
              <div className="text-[11px]">
                <TerminalPrompt /> <TerminalCmd>ls /100-questions</TerminalCmd>{" "}
                <span className="text-muted-foreground">
                  — {t("questions.count", { count: filtered.length })}
                </span>
              </div>
            </div>

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
                  aria-label={t("questions.searchPlaceholder")}
                  placeholder={t("questions.searchPlaceholder")}
                  className="w-full bg-transparent text-[11px] text-[#000000] outline-none placeholder:text-transparent dark:text-[#c9d5e4]"
                />
                {query === "" && !searchFocused ? (
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-y-0 left-0 flex items-center text-[11px] text-muted-foreground/60"
                  >
                    <TerminalCursor className="ml-0 translate-y-0" />
                    <span className="ml-1">{t("questions.searchPlaceholder")}</span>
                  </span>
                ) : null}
              </div>
            </div>

            {filtered.length > 0 ? (
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((article, index) => (
                  <ArticleCard key={article.slug} article={article} index={index} />
                ))}
              </div>
            ) : (
              <div className="mt-4 border border-dashed border-[#cfcfcf] px-4 py-8 text-center dark:border-[#243244]">
                <p className="text-[11px]">
                  <TerminalPrompt /> <TerminalCmd>grep</TerminalCmd>{" "}
                  <span className="text-muted-foreground">{t("questions.empty")}</span>{" "}
                  <TerminalCursor />
                </p>
                <p className="mt-1.5 text-[10px] text-muted-foreground">{t("questions.emptyDesc")}</p>
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
