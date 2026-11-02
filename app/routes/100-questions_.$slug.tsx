import { useEffect, useState } from "react";
import { createFileRoute, Link, notFound, useLoaderData } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { BASE_URL, currentLang, withLangPrefix } from "~/lib/seo";
import { AppNav } from "~/components/HomeHeader";
import { AppFooter } from "~/components/AppFooter";
import { QuestionBody } from "~/components/questions/QuestionBody";
import { QuestionSidebar } from "~/components/questions/QuestionSidebar";
import { QuestionMap } from "~/components/questions/QuestionMap";
import { QuestionSearch } from "~/components/questions/QuestionSearch";
import {
  TerminalCmd,
  TerminalCursor,
  TerminalPrompt,
  TerminalWindow,
} from "~/components/showcase/TerminalWindow";
import { accentVars, getArticleBySlug } from "~/features/questions/articles";
import { buildQuestionToc } from "~/features/questions/toc";
import { buildQuestionArticleJsonLd } from "~/features/questions/seo";
import { useQuestionProgress } from "~/features/questions/progress";

/** Keep meta descriptions near the 150–160 character sweet spot. */
function clampDescription(text: string, max = 158): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const space = cut.lastIndexOf(" ");
  return `${(space > 80 ? cut.slice(0, space) : cut).trimEnd()}…`;
}

/** Long titles already fill the SERP; drop the brand suffix to avoid truncation. */
function serpTitle(title: string): string {
  return title.length > 48 ? title : `${title} — 100mini`;
}

export const Route = createFileRoute("/100-questions_/$slug")({
  loader: async ({ params }) => {
    const article = await getArticleBySlug(params.slug, currentLang());
    if (!article) throw notFound();
    return { article, toc: buildQuestionToc(article.body) };
  },
  head: async ({ params }) => {
    const article = await getArticleBySlug(params.slug, currentLang());
    if (!article) {
      return {
        meta: [
          { title: "Not found | 100mini" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const url = BASE_URL + withLangPrefix(article.locale, `/100-questions/${article.slug}`);
    const description = clampDescription(article.summary);
    return {
      meta: [
        { title: serpTitle(article.title) },
        { name: "description", content: description },
        { name: "keywords", content: article.tags.join(", ") },
        { name: "robots", content: "index, follow" },
        { property: "og:type", content: "article" },
        { property: "og:title", content: article.title },
        { property: "og:description", content: description },
        { property: "og:url", content: url },
        { property: "og:site_name", content: "100mini" },
        { property: "article:published_time", content: article.publishedAt },
        { property: "article:modified_time", content: article.updatedAt ?? article.publishedAt },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: article.title },
        { name: "twitter:description", content: description },
      ],
    };
  },
  component: QuestionArticlePage,
});

function QuestionArticlePage() {
  const { t } = useTranslation();
  const { article, toc } = useLoaderData({ from: Route.id });
  const totalQuestions = toc.reduce((n, chapter) => n + chapter.questions.length, 0);
  const { visited, markVisited, reset } = useQuestionProgress(article.slug, toc);
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
  const jsonLd = buildQuestionArticleJsonLd(article, t("questions.h1"));

  useEffect(() => {
    if (activeQuestionId) markVisited(activeQuestionId);
  }, [activeQuestionId, markVisited]);

  return (
    <div className="flex min-h-screen flex-col">
      {jsonLd.map((block, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(block).replace(/</g, "\\u003c") }}
        />
      ))}
      <AppNav />

      <main className="flex-1">
        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[200px_minmax(0,1fr)] xl:grid-cols-[220px_768px] xl:justify-center">
            <QuestionSidebar
              toc={toc}
              totalQuestions={totalQuestions}
              visited={visited}
              onVisited={markVisited}
              onActiveQuestionChange={setActiveQuestionId}
            />
            <div className="min-w-0">
              <div className="sticky top-20 z-30 mb-3">
                <QuestionSearch
                  toc={toc}
                  markdown={article.body}
                  onSelect={(id) => {
                    markVisited(id);
                    setActiveQuestionId(id);
                  }}
                />
              </div>
              <TerminalWindow
                title={`100mini ~ /100-questions/${article.slug} — zsh`}
                bodyClassName="p-4 text-[11.5px] sm:p-6"
              >
                <article style={accentVars()}>
                  <div className="text-[10px]">
                    <TerminalPrompt /> <TerminalCmd>cat /100-questions/{article.slug}</TerminalCmd>
                  </div>
                  <nav
                    aria-label={t("questions.breadcrumb")}
                    className="mt-1 text-[10px] text-muted-foreground"
                  >
                    <Link to="/100-questions" className="hover:underline">
                      {t("questions.h1")}
                    </Link>
                    <span className="mx-1.5">/</span>
                    <span>{article.slug}</span>
                  </nav>

                  <h1 className="mt-3 text-2xl font-bold leading-tight tracking-tight text-[#000000] sm:text-3xl dark:text-[#e6edf6]">
                    {article.title}
                  </h1>
                  <p className="mt-2 text-[12.5px] leading-relaxed text-muted-foreground">
                    {article.summary}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <span className="rounded-full bg-[color:var(--sc-accent)] px-2.5 py-0.5 text-[10px] font-semibold text-white">
                      {t("questions.badge", { count: article.questionCount || totalQuestions })}
                    </span>
                    {article.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-[#cfcfcf] px-2.5 py-0.5 text-[10px] text-muted-foreground dark:border-[#243244]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {article.facts.length > 0 ? (
                    <dl className="mt-4 overflow-hidden rounded-lg border border-[#cfcfcf] bg-white dark:border-[#243244] dark:bg-[#0f1720]">
                      {article.facts.map((f) => (
                        <div
                          key={f.key}
                          className="grid grid-cols-[110px_1fr] gap-3 border-b border-dashed border-[#e0e0e0] px-3.5 py-1.5 last:border-b-0 sm:grid-cols-[130px_1fr] dark:border-[#243244]"
                        >
                          <dt className="truncate text-[11px] text-muted-foreground">{f.key}</dt>
                          <dd
                            className={
                              f.highlight
                                ? "text-[15px] font-bold leading-tight text-[color:var(--sc-accent)] dark:text-[color:var(--sc-accent-dark)]"
                                : "text-[11px] font-bold"
                            }
                          >
                            {f.value}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  ) : null}

                  <QuestionMap
                    toc={toc}
                    visited={visited}
                    activeQuestionId={activeQuestionId}
                    onSelect={(id) => {
                      markVisited(id);
                      setActiveQuestionId(id);
                    }}
                    onReset={reset}
                  />

                  <details className="mt-4 rounded-lg border lg:hidden border-[#cfcfcf] bg-white px-3.5 py-3 dark:border-[#243244] dark:bg-[#0f1720]">
                    <summary className="cursor-pointer select-none text-[11px] font-bold text-[#000000] dark:text-[#e6edf6]">
                      {t("questions.toc")}
                      <span className="ml-1.5 font-normal text-muted-foreground">
                        {t("questions.tocMeta", { chapters: article.chapterCount || toc.length, questions: totalQuestions })}
                      </span>
                    </summary>
                    <div className="mt-3 space-y-3">
                      {toc.map((chapter) => (
                        <section key={chapter.id}>
                          <a
                            href={`#${chapter.id}`}
                            className="text-[11px] font-bold text-[color:var(--sc-accent)] hover:underline dark:text-[color:var(--sc-accent-dark)]"
                          >
                            {chapter.title}
                          </a>
                          {chapter.questions.length > 0 ? (
                            <ul className="mt-1 grid grid-cols-1 gap-x-4 sm:grid-cols-2">
                              {chapter.questions.map((q) => (
                                <li key={q.id} className="truncate">
                                  <a
                                    href={`#${q.id}`}
                                    className="text-[10.5px] text-muted-foreground hover:text-foreground hover:underline"
                                  >
                                    {q.title}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          ) : null}
                        </section>
                      ))}
                    </div>
                  </details>

                  <QuestionBody article={article} />

                  <div className="mt-6 text-[11px]">
                    <TerminalPrompt /> <TerminalCmd>cat {"{slug}"}</TerminalCmd> <TerminalCursor />
                  </div>

                  <div className="mt-4">
                    <Link
                      to="/100-questions"
                      className="text-[10.5px] text-muted-foreground hover:underline"
                    >
                      ← {t("questions.backToList")}
                    </Link>
                  </div>
                </article>
              </TerminalWindow>
            </div>
          </div>
        </div>
      </main>

      <AppFooter />
    </div>
  );
}
