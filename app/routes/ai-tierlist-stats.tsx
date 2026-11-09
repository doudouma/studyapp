import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { ArrowUpRight } from "lucide-react";
import { AppNav } from "~/components/HomeHeader";
import { AppFooter } from "~/components/AppFooter";
import i18n, { getBcp47 } from "~/lib/i18n";
import { withLangPrefix, currentLang, BASE_URL, DEFAULT_OG_IMAGE } from "~/lib/seo";
import {
  REDDIT_STATS,
  REDDIT_TOOL_STATS,
  type RedditToolStat,
} from "@shared/data/reddit-ai-tools";
import { AIX_CSS } from "~/components/aix/aix-styles";
import { AixBurst } from "~/components/aix/AixBurst";
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

const STATS_CSS = `
.aixs-bars{display:flex;flex-direction:column;gap:10px;margin-top:18px}
.aixs-bar{display:grid;grid-template-columns:110px minmax(0,1fr) 92px;gap:12px;align-items:center}
.aixs-bar .k{font-size:11px;letter-spacing:.08em;text-transform:uppercase;font-weight:800;line-height:1.2}
.aixs-bar .k small{display:block;margin-top:2px;font-size:9px;letter-spacing:.12em;color:var(--aix-mute);font-weight:700}
.aixs-bar .track{height:8px;background:var(--aix-grey);border-radius:2px;overflow:hidden}
.aixs-bar .fill{height:100%;background:var(--aix-lime);border-right:1px solid rgba(17,18,20,.2)}
.aixs-bar .v{text-align:right;font-size:12px;font-weight:800;font-variant-numeric:tabular-nums}
.aixs-bar .v span{font-size:9px;letter-spacing:.1em;color:var(--aix-mute);margin-left:2px}

.aixs-ranks{border-top:1px solid var(--aix-line);margin-top:16px}
.aixs-rank{display:grid;grid-template-columns:34px minmax(0,1fr) auto;gap:14px;padding:15px 0;border-bottom:1px solid var(--aix-line)}
.aixs-no{font-size:10px;letter-spacing:.14em;font-weight:800;color:var(--aix-mute);padding-top:3px;font-variant-numeric:tabular-nums}
.aixs-main{min-width:0}
.aixs-head{display:flex;flex-wrap:wrap;align-items:center;gap:8px}
.aixs-head h3{margin:0;font-size:14px;font-weight:800;letter-spacing:-.01em}
.aixs-cat{font-size:9px;letter-spacing:.1em;text-transform:uppercase;font-weight:700;background:var(--aix-grey);color:var(--aix-mute);padding:3px 6px;border-radius:2px}
.aixs-badge{font-size:9px;letter-spacing:.1em;text-transform:uppercase;font-weight:800;padding:3px 7px;border-radius:2px;border:1px solid transparent}
.aixs-badge.top{background:#111214;color:var(--aix-lime)}
.aixs-badge.strong{background:var(--aix-lime);color:#111214}
.aixs-badge.steady{background:var(--aix-grey);color:var(--aix-ink)}
.aixs-badge.watch{background:transparent;border-color:var(--aix-line);color:var(--aix-mute)}
.aixs-note{margin:6px 0 0;font-size:12.5px;line-height:1.55;color:var(--aix-mute);max-width:70ch}
.aixs-post{display:inline-flex;align-items:center;gap:4px;max-width:100%;margin-top:7px;font-size:11.5px;font-weight:600;color:var(--aix-ink);text-decoration:none;border-bottom:1px solid var(--aix-line)}
.aixs-post span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.aixs-post:hover{border-color:var(--aix-ink)}
.aixs-rank-num{text-align:right;min-width:96px;padding-top:1px}
.aixs-rank-num b{font-size:18px;font-weight:800;letter-spacing:-.03em;font-variant-numeric:tabular-nums}
.aixs-rank-num i{font-style:normal;font-size:9px;letter-spacing:.08em;color:var(--aix-mute);margin-left:3px}
.aixs-rank-num small{display:block;margin-top:3px;font-size:10px;color:var(--aix-mute);line-height:1.3}

.aixs-posts{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-top:18px}
.aixs-postcard{display:flex;flex-direction:column;gap:9px;min-height:160px;padding:16px;border:1px solid var(--aix-line);border-radius:2px;background:var(--aix-grey);color:var(--aix-ink);text-decoration:none;transition:transform .2s}
.aixs-postcard:hover{transform:translateY(-3px)}
.aixs-postcard.lime{background:var(--aix-lime);border-color:transparent;color:#111214}
.aixs-postcard.ink{background:#111214;border-color:#111214;color:#fff}
.aixs-postcard-head{display:flex;align-items:center;justify-content:space-between;gap:10px;font-size:12px;font-weight:800}
.aixs-postcard-head b{font-size:11px;font-variant-numeric:tabular-nums}
.aixs-postcard p{margin:0;font-size:12.5px;line-height:1.5;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.aixs-postcard small{margin-top:auto;font-size:9px;letter-spacing:.12em;opacity:.6}
.aixs-postcard.ink p{color:#d0d0d0}

.aixs-method{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:18px}
.aixs-method .aix-note{min-height:0}
.aixs-method .aix-note p{margin:0;font-size:12.5px;line-height:1.6;opacity:.85}
.aixs-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:6px}
.aixs-list li{display:flex;gap:8px;font-size:12px;line-height:1.5}
.aixs-list li::before{content:"—";opacity:.5}
.aixs-subs{margin-top:auto !important;font-size:10px !important;letter-spacing:.06em;opacity:.55 !important}

@media(max-width:900px){
  .aixs-posts{grid-template-columns:repeat(2,minmax(0,1fr))}
  .aixs-method{grid-template-columns:1fr}
}
@media(max-width:560px){
  .aixs-bar{grid-template-columns:88px minmax(0,1fr) 76px;gap:8px}
  .aixs-rank{grid-template-columns:24px minmax(0,1fr);gap:10px}
  .aixs-rank-num{grid-column:2;text-align:left;display:flex;flex-wrap:wrap;align-items:baseline;gap:6px;min-width:0}
  .aixs-rank-num small{width:100%;margin-top:0}
  .aixs-posts{grid-template-columns:1fr}
}
`;

function AiTierListStatsPage() {
  const { t } = useTranslation();
  const lang = currentLang();
  const tierListHref = withLangPrefix(lang, "/ai-tierlist");

  const stats = [
    { n: String(REDDIT_TOOL_STATS.length), label: t("aiTierlistStats.statTools"), cls: "grey" },
    { n: String(REDDIT_STATS.subs.length), label: t("aiTierlistStats.statSubs"), cls: "lime" },
    { n: `${REDDIT_STATS.windowDays}D`, label: t("aiTierlistStats.statWindow"), cls: "ink" },
    { n: `${TOTAL_SAMPLED.toLocaleString("en-US")}+`, label: t("aiTierlistStats.statSampled"), cls: "ghost" },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-[#ededed] dark:bg-[#0c0d0f]">
      <AppNav />
      <main className="flex-1">
        <div className="aix">
          <style>{AIX_CSS}{STATS_CSS}</style>

          {/* HERO */}
          <section className="aix-frame aix-hero">
            <div className="aix-mininav">
              <span className="brand">
                <span className="dot" />
                AI TIER LIST / STATS
              </span>
              <span>{t("aiTierlistStats.badge")}</span>
              <a href={tierListHref}>
                {t("aiTierlist.sectionMaker")}
                <ArrowUpRight className="size-3.5" />
              </a>
            </div>

            <div className="aix-hero-grid">
              <div className="aix-hero-copy">
                <div>
                  <div className="aix-topline">
                    <span className="aix-pill lime">
                      <span className="dot" />
                      {t("aiTierlistStats.badge")}
                    </span>
                    <span className="aix-kicker">
                      {t("aiTierlistStats.updated", { date: REDDIT_STATS.asOf })}
                    </span>
                  </div>
                  <h1 className="aix-h1">{t("aiTierlistStats.heading")}</h1>
                  <p className="aix-lede">{t("aiTierlistStats.subheading")}</p>
                </div>

                <div className="aix-stats">
                  {stats.map((s) => (
                    <div key={s.label} className={`aix-stat ${s.cls}`}>
                      <div className="n">{s.n}</div>
                      <div className="l">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="aix-art" aria-hidden="true">
                <span className="aix-art-grid" />
                <AixBurst className="aix-art-burst" />
                <div className="aix-art-s">
                  {REDDIT_STATS.windowDays}
                  <span>
                    {t("aiTierlistStats.statWindow")} · {t(`aiTierlist.cat.${TOP_CATEGORY.cat}`)} #1
                  </span>
                </div>
                <div className="aix-art-rows">
                  {CATEGORY_STATS.slice(0, 5).map((row) => (
                    <div className="aix-art-row" key={row.cat}>
                      <b>{t(`aiTierlist.cat.${row.cat}`)}</b>
                      <span>
                        {row.daily.toFixed(1)} {t("aiTierlistStats.perDay")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* 01 CATEGORY */}
          <section className="aix-frame">
            <div className="aix-sec-head">
              <div>
                <div className="aix-section-num">01</div>
                <h2 className="aix-sec-title">{t("aiTierlistStats.sectionCategory")}</h2>
              </div>
              <span className="aix-dot-sm" />
            </div>
            <div className="aixs-bars">
              {CATEGORY_STATS.map((row) => (
                <div className="aixs-bar" key={row.cat}>
                  <div className="k">
                    {t(`aiTierlist.cat.${row.cat}`)}
                    <small>×{row.tools}</small>
                  </div>
                  <div className="track">
                    <div
                      className="fill"
                      style={{ width: `${Math.max(3, (row.daily / MAX_CATEGORY_DAILY) * 100)}%` }}
                    />
                  </div>
                  <div className="v">
                    {row.daily.toFixed(1)}
                    <span>{t("aiTierlistStats.perDay")}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 02 RANKING */}
          <section className="aix-frame">
            <div className="aix-sec-head">
              <div>
                <div className="aix-section-num">02</div>
                <h2 className="aix-sec-title">{t("aiTierlistStats.sectionRanking")}</h2>
              </div>
              <span className="aix-dot-sm" />
            </div>
            <p className="aix-body">{t("aiTierlistStats.cappedNote")}</p>
            <div className="aixs-ranks">
              {SORTED.map((item, index) => (
                <article className="aixs-rank" key={item.tool}>
                  <div className="aixs-no">{index + 1}</div>
                  <div className="aixs-main">
                    <div className="aixs-head">
                      <h3>{item.tool}</h3>
                      <span className="aixs-cat">{t(`aiTierlist.cat.${item.cat}`)}</span>
                      <span className={`aixs-badge ${item.verdict}`}>
                        {t(`aiTierlistStats.verdict.${item.verdict}`)}
                      </span>
                    </div>
                    <p className="aixs-note">{item.note[lang] ?? item.note.en}</p>
                    {item.topPost && (
                      <a
                        className="aixs-post"
                        href={item.topPost.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ArrowUpRight className="size-3.5 shrink-0" />
                        <span>
                          {item.topPost.score.toLocaleString("en-US")} · r/{item.topPost.sub} ·{" "}
                          {item.topPost.title}
                        </span>
                      </a>
                    )}
                  </div>
                  <div className="aixs-rank-num">
                    <b>{item.daily.toFixed(1)}</b>
                    <i>{t("aiTierlistStats.perDay")}</i>
                    <small>
                      {item.capped ? `${REDDIT_STATS.sampleCap}+` : item.mentions}{" "}
                      {t("aiTierlistStats.mentions30d")}
                    </small>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* 03 TOP POSTS */}
          <section className="aix-frame">
            <div className="aix-sec-head">
              <div>
                <div className="aix-section-num">03</div>
                <h2 className="aix-sec-title">{t("aiTierlistStats.sectionTopPosts")}</h2>
              </div>
              <span className="aix-dot-sm" />
            </div>
            <p className="aix-body">{t("aiTierlistStats.topPostsDesc")}</p>
            <div className="aixs-posts">
              {TOP_POSTS.map((item, i) => (
                <a
                  key={item.tool}
                  href={item.topPost!.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`aixs-postcard${i === 1 ? " lime" : i === 3 ? " ink" : ""}`}
                >
                  <div className="aixs-postcard-head">
                    <span>{item.tool}</span>
                    <b>{item.topPost!.score.toLocaleString("en-US")}</b>
                  </div>
                  <p>{item.topPost!.title}</p>
                  <small>r/{item.topPost!.sub}</small>
                </a>
              ))}
            </div>
          </section>

          {/* 04 METHOD + LIMITS */}
          <section className="aix-frame">
            <div className="aix-sec-head">
              <div>
                <div className="aix-section-num">04</div>
                <h2 className="aix-sec-title">{t("aiTierlistStats.sectionMethod")}</h2>
              </div>
              <span className="aix-dot-sm" />
            </div>
            <div className="aixs-method">
              <div className="aix-note">
                <span className="num">01</span>
                <p>{t("aiTierlistStats.methodText")}</p>
                <ul className="aixs-list">
                  {[1, 2, 3].map((i) => (
                    <li key={i}>{t(`aiTierlistStats.method${i}`)}</li>
                  ))}
                </ul>
              </div>
              <div className="aix-note ghost">
                <span className="num">02</span>
                <p>{t("aiTierlistStats.limitText")}</p>
                <p className="aixs-subs">
                  {REDDIT_STATS.subs.map((sub) => `r/${sub}`).join(" · ")}
                </p>
              </div>
            </div>
          </section>

          {/* 05 FAQ */}
          <section className="aix-frame">
            <div className="aix-sec-head">
              <div>
                <div className="aix-section-num">05</div>
                <h2 className="aix-sec-title">{t("aiTierlistStats.sectionFaq")}</h2>
              </div>
              <span className="aix-dot-sm" />
            </div>
            <div className="aix-faq">
              {[1, 2, 3].map((i) => (
                <details key={i}>
                  <summary>
                    <span>{t(`aiTierlistStats.faq${i}.q`)}</span>
                    <span className="plus">＋</span>
                  </summary>
                  <p className="answer">{t(`aiTierlistStats.faq${i}.a`)}</p>
                </details>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="aix-cta">
            <div>
              <h2>{t("aiTierlistStats.ctaTitle")}</h2>
              <p>{t("aiTierlistStats.ctaText")}</p>
            </div>
            <a href={tierListHref}>
              {t("aiTierlistStats.ctaButton")}
              <ArrowUpRight className="size-4" />
            </a>
          </section>
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
