import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import {
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  Flame,
  Layers,
  MessageSquare,
  Sparkles,
  Users,
} from "lucide-react";
import { AppNav } from "~/components/HomeHeader";
import { AppFooter } from "~/components/AppFooter";
import i18n, { getBcp47 } from "~/lib/i18n";
import { withLangPrefix, currentLang, BASE_URL, DEFAULT_OG_IMAGE } from "~/lib/seo";
import {
  REDDIT_STATS,
  REDDIT_TOOL_STATS,
  type RedditToolStat,
  type RedditVerdict,
} from "@shared/data/reddit-ai-tools";
import type { TierCat } from "@shared/types/tierlist";

/**
 * Reddit「AI 工具提及统计」页面
 *
 * 数据是 2026-11-09 一次性采集的采样结果（见 `shared/data/reddit-ai-tools.ts`）。
 * 页面必须保留口径与局限说明，避免把采样值当成 Reddit 官方全量数据传播。
 */

const SORTED: RedditToolStat[] = [...REDDIT_TOOL_STATS].sort((a, b) => b.daily - a.daily);
const TOTAL_SAMPLED = REDDIT_TOOL_STATS.reduce((sum, item) => sum + item.mentions, 0);

const CATEGORY_ORDER: TierCat[] = ["chat", "code", "image", "audio", "search", "video", "productivity"];
const CATEGORY_STATS = CATEGORY_ORDER.map((cat) => ({
  cat,
  daily: REDDIT_TOOL_STATS.filter((item) => item.cat === cat).reduce((sum, item) => sum + item.daily, 0),
  tools: REDDIT_TOOL_STATS.filter((item) => item.cat === cat).length,
})).sort((a, b) => b.daily - a.daily);
const MAX_CATEGORY_DAILY = Math.max(...CATEGORY_STATS.map((item) => item.daily));
const TOP_CATEGORY = CATEGORY_STATS[0];

const TOP_POSTS = SORTED.filter((item) => item.topPost)
  .sort((a, b) => (b.topPost?.score ?? 0) - (a.topPost?.score ?? 0))
  .slice(0, 6);

const VERDICT_STYLE: Record<RedditVerdict, string> = {
  top:
    "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:border-[#4edea3]/30 dark:bg-[#4edea3]/10 dark:text-[#4edea3]",
  strong: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  steady: "border-border bg-muted text-muted-foreground",
  watch: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
};

export const Route = createFileRoute("/ai-tierlist-stats")({
  head: () => {
    const pageUrl = BASE_URL + withLangPrefix(currentLang(), "/ai-tierlist-stats");
    const faqs = [1, 2, 3].map((i) => ({
      name: i18n.t(`aiTierlistStats.faq${i}.q`),
      text: i18n.t(`aiTierlistStats.faq${i}.a`),
    }));
    return {
      meta: [
        { title: i18n.t("aiTierlistStats.title") },
        { name: "description", content: i18n.t("aiTierlistStats.desc") },
        { name: "keywords", content: i18n.t("aiTierlistStats.keywords") },
        { name: "robots", content: "index, follow" },
        { property: "og:type", content: "article" },
        { property: "og:title", content: i18n.t("aiTierlistStats.title") },
        { property: "og:description", content: i18n.t("aiTierlistStats.desc") },
        { property: "og:image", content: DEFAULT_OG_IMAGE },
        { property: "og:url", content: pageUrl },
        { property: "og:site_name", content: "100mini" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: i18n.t("aiTierlistStats.title") },
        { name: "twitter:description", content: i18n.t("aiTierlistStats.desc") },
        { name: "twitter:image", content: DEFAULT_OG_IMAGE },
      ],
      links: [{ rel: "canonical", href: pageUrl }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            inLanguage: getBcp47(i18n.language),
            mainEntity: faqs.map((faq) => ({
              "@type": "Question",
              name: faq.name,
              acceptedAnswer: { "@type": "Answer", text: faq.text },
            })),
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: i18n.t("aiTierlistStats.heading"),
            url: pageUrl,
            description: i18n.t("aiTierlistStats.desc"),
            inLanguage: getBcp47(i18n.language),
            dateModified: REDDIT_STATS.asOf,
            isPartOf: { "@type": "WebSite", name: "100mini", url: BASE_URL },
          }),
        },
      ],
    };
  },
  component: AiTierListStatsPage,
});

function AiTierListStatsPage() {
  const { t } = useTranslation();
  const lang = currentLang();
  const tierListHref = withLangPrefix(lang, "/ai-tierlist");

  const stats = [
    { icon: Layers, label: t("aiTierlistStats.statTools"), value: String(REDDIT_TOOL_STATS.length) },
    { icon: Users, label: t("aiTierlistStats.statSubs"), value: String(REDDIT_STATS.subs.length) },
    { icon: CalendarDays, label: t("aiTierlistStats.statWindow"), value: `${REDDIT_STATS.windowDays}d` },
    { icon: Flame, label: t("aiTierlistStats.statTopCategory"), value: t(`aiTierlist.cat.${TOP_CATEGORY.cat}`) },
    {
      icon: MessageSquare,
      label: t("aiTierlistStats.statSampled"),
      value: `${TOTAL_SAMPLED.toLocaleString("en-US")}+`,
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <AppNav />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-[#006c49] dark:bg-[#0b1c30]">
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <div className="absolute -left-24 -top-24 size-72 rounded-full bg-[#4edea3]/20 blur-3xl" />
            <div className="absolute -bottom-32 -right-24 size-80 rounded-full bg-white/10 blur-3xl" />
            <div
              className="absolute inset-0 opacity-[0.15]"
              style={{
                backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            />
          </div>
          <div className="relative mx-auto max-w-5xl px-6 py-14 text-center sm:py-18">
            <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
              <Sparkles className="size-4 text-[#4edea3]" />
              {t("aiTierlistStats.badge")}
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              {t("aiTierlistStats.heading")}
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-[#cfe8dd] sm:text-lg">
              {t("aiTierlistStats.subheading")}
            </p>
            <p className="mt-4 text-xs text-[#cfe8dd]/80">
              {t("aiTierlistStats.updated", { date: REDDIT_STATS.asOf })}
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-5xl px-6">
          {/* Key numbers */}
          <section className="relative z-10 -mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {stats.map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm"
              >
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Icon className="size-4" />
                  <span className="text-[11px] font-semibold uppercase tracking-wide">{label}</span>
                </div>
                <div className="mt-2 text-xl font-extrabold tracking-tight text-foreground">{value}</div>
              </div>
            ))}
          </section>

          {/* Category bars */}
          <section className="pt-12">
            <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
              <BarChart3 className="size-5 text-primary dark:text-[#4edea3]" />
              {t("aiTierlistStats.sectionCategory")}
            </h2>
            <div className="mt-5 space-y-3">
              {CATEGORY_STATS.map((row) => (
                <div key={row.cat} className="flex items-center gap-3">
                  <div className="w-24 shrink-0 text-sm font-semibold text-foreground sm:w-28">
                    {t(`aiTierlist.cat.${row.cat}`)}
                    <span className="ml-1 text-[11px] font-normal text-muted-foreground">×{row.tools}</span>
                  </div>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-[#006c49] dark:bg-[#4edea3]"
                      style={{ width: `${Math.max(3, (row.daily / MAX_CATEGORY_DAILY) * 100)}%` }}
                    />
                  </div>
                  <div className="w-24 shrink-0 text-right text-sm font-semibold tabular-nums text-foreground">
                    {row.daily.toFixed(1)}
                    <span className="ml-1 text-[11px] font-normal text-muted-foreground">
                      {t("aiTierlistStats.perDay")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Ranking */}
          <section className="pt-12">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              {t("aiTierlistStats.sectionRanking")}
            </h2>
            <p className="mt-2 text-[13px] text-muted-foreground">{t("aiTierlistStats.cappedNote")}</p>
            <div className="mt-5 divide-y divide-border/60 overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
              {SORTED.map((item, index) => {
                const note = item.note[lang] ?? item.note.en;
                return (
                  <article key={item.tool} className="p-4 sm:p-5">
                    <div className="flex flex-wrap items-start gap-x-4 gap-y-2">
                      <div className="w-6 pt-0.5 text-sm font-black tabular-nums text-muted-foreground">
                        {index + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-bold text-foreground">{item.tool}</h3>
                          <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                            {t(`aiTierlist.cat.${item.cat}`)}
                          </span>
                          <span
                            className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${VERDICT_STYLE[item.verdict]}`}
                          >
                            {t(`aiTierlistStats.verdict.${item.verdict}`)}
                          </span>
                        </div>
                        <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{note}</p>
                        {item.topPost && (
                          <a
                            href={item.topPost.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 inline-flex max-w-full items-center gap-1 text-[12px] font-medium text-[#006c49] hover:underline dark:text-[#4edea3]"
                          >
                            <ArrowUpRight className="size-3.5 shrink-0" />
                            <span className="truncate">
                              {item.topPost.score.toLocaleString("en-US")} · r/{item.topPost.sub} ·{" "}
                              {item.topPost.title}
                            </span>
                          </a>
                        )}
                      </div>
                      <div className="w-full shrink-0 text-left sm:w-28 sm:text-right">
                        <div className="text-lg font-extrabold tabular-nums text-foreground">
                          {item.daily.toFixed(1)}
                          <span className="ml-1 text-[11px] font-normal text-muted-foreground">
                            {t("aiTierlistStats.perDay")}
                          </span>
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {item.capped ? `${REDDIT_STATS.sampleCap}+` : item.mentions}{" "}
                          {t("aiTierlistStats.mentions30d")}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          {/* Top posts */}
          <section className="pt-12">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              {t("aiTierlistStats.sectionTopPosts")}
            </h2>
            <p className="mt-2 text-[13px] text-muted-foreground">{t("aiTierlistStats.topPostsDesc")}</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {TOP_POSTS.map((item) => (
                <a
                  key={item.tool}
                  href={item.topPost!.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col rounded-2xl border border-border/70 bg-card p-4 shadow-sm transition-colors hover:border-[#006c49]/40 dark:hover:border-[#4edea3]/40"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-foreground">{item.tool}</span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#006c49] dark:text-[#4edea3]">
                      <ArrowUpRight className="size-3.5" />
                      {item.topPost!.score.toLocaleString("en-US")}
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-3 text-[13px] leading-relaxed text-muted-foreground">
                    {item.topPost!.title}
                  </p>
                  <span className="mt-auto pt-3 text-[10px] font-semibold tracking-wide text-muted-foreground/70">
                    r/{item.topPost!.sub}
                  </span>
                </a>
              ))}
            </div>
          </section>

          {/* Method + limits */}
          <section className="grid gap-4 pt-12 sm:grid-cols-2">
            <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
              <h2 className="text-base font-bold text-foreground">{t("aiTierlistStats.sectionMethod")}</h2>
              <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                {t("aiTierlistStats.methodText")}
              </p>
              <ul className="mt-3 space-y-1.5 text-[13px] leading-relaxed text-muted-foreground">
                {[1, 2, 3].map((i) => (
                  <li key={i} className="flex gap-2">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[#006c49] dark:bg-[#4edea3]" />
                    <span>{t(`aiTierlistStats.method${i}`)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
              <h2 className="text-base font-bold text-foreground">{t("aiTierlistStats.sectionLimits")}</h2>
              <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                {t("aiTierlistStats.limitText")}
              </p>
              <p className="mt-3 text-[12px] text-muted-foreground/80">
                {REDDIT_STATS.subs.map((sub) => `r/${sub}`).join(" · ")}
              </p>
            </div>
          </section>

          {/* FAQ */}
          <section className="pt-12">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              {t("aiTierlistStats.sectionFaq")}
            </h2>
            <div className="mt-4 rounded-2xl border border-border/70 bg-card px-5 shadow-sm">
              {[1, 2, 3].map((i) => (
                <details key={i} className="group border-b border-border/60 py-4 last:border-b-0">
                  <summary className="cursor-pointer list-none text-sm font-medium text-foreground marker:hidden">
                    <span className="flex items-center justify-between gap-4">
                      {t(`aiTierlistStats.faq${i}.q`)}
                      <span className="text-muted-foreground transition-transform group-open:rotate-45">＋</span>
                    </span>
                  </summary>
                  <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                    {t(`aiTierlistStats.faq${i}.a`)}
                  </p>
                </details>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="py-14">
            <div className="rounded-3xl bg-[#006c49] px-6 py-10 text-center dark:bg-[#0b1c30]">
              <h2 className="text-xl font-extrabold tracking-tight text-white sm:text-2xl">
                {t("aiTierlistStats.ctaTitle")}
              </h2>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-[#cfe8dd]">
                {t("aiTierlistStats.ctaText")}
              </p>
              <a
                href={tierListHref}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#4edea3] px-5 py-2.5 text-sm font-bold text-[#002113] transition-colors hover:bg-[#3ecf92]"
              >
                {t("aiTierlistStats.ctaButton")}
                <ArrowUpRight className="size-4" />
              </a>
            </div>
          </section>
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
