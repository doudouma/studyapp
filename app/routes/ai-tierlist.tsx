import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AppNav } from "~/components/HomeHeader";
import { AppFooter } from "~/components/AppFooter";
import { TierListMaker } from "~/components/tierlist/TierListMaker";
import i18n, { getBcp47 } from "~/lib/i18n";
import { withLangPrefix, currentLang, BASE_URL, DEFAULT_OG_IMAGE } from "~/lib/seo";
import { TIERLIST_THEMES, TIERLIST_TOOLS } from "@shared/types/tierlist";
import { AIX_CSS } from "~/components/aix/aix-styles";
import { AixBurst } from "~/components/aix/AixBurst";

/**
 * AI Tier List 页面
 *
 * 视觉参考 template/ai-rank/lime-corporate-presentation.html：
 * 浅灰底 + 白色细框、酸橙/墨黑、超大全大写标题、微型编号导航、数字统计卡。
 * 工具本体（TierListMaker）使用同一套变量换肤。
 */



export const Route = createFileRoute("/ai-tierlist")({
  head: () => {
    const pageUrl = BASE_URL + withLangPrefix(currentLang(), "/ai-tierlist");
    const faqs = Array.from({ length: 7 }, (_, i) => ({
      name: i18n.t(`aiTierlist.faq${i + 1}.q`),
      text: i18n.t(`aiTierlist.faq${i + 1}.a`),
    }));
    const steps = Array.from({ length: 4 }, (_, i) => i18n.t(`aiTierlist.howto.step${i + 1}`));
    return {
      meta: [
        { title: i18n.t("aiTierlist.title") },
        { name: "description", content: i18n.t("aiTierlist.desc") },
        { name: "keywords", content: i18n.t("aiTierlist.keywords") },
        { name: "robots", content: "index, follow" },
        { property: "og:type", content: "website" },
        { property: "og:title", content: i18n.t("aiTierlist.title") },
        { property: "og:description", content: i18n.t("aiTierlist.desc") },
        { property: "og:image", content: DEFAULT_OG_IMAGE },
        { property: "og:site_name", content: "100mini" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: i18n.t("aiTierlist.title") },
        { name: "twitter:description", content: i18n.t("aiTierlist.desc") },
        { name: "twitter:image", content: DEFAULT_OG_IMAGE },
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: i18n.t("aiTierlist.heading"),
            url: pageUrl,
            description: i18n.t("aiTierlist.desc"),
            inLanguage: getBcp47(i18n.language),
            applicationCategory: "DesignApplication",
            operatingSystem: "Any",
            browserRequirements: "Requires JavaScript",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            publisher: { "@id": `${BASE_URL}/#organization` },
          }),
        },
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
            "@type": "HowTo",
            name: i18n.t("aiTierlist.howto.title"),
            description: i18n.t("aiTierlist.desc"),
            inLanguage: getBcp47(i18n.language),
            totalTime: "PT3M",
            step: steps.map((text, i) => ({ "@type": "HowToStep", position: i + 1, text })),
          }),
        },
      ],
    };
  },
  component: AiTierListPage,
});


function AiTierListPage() {
  const { t } = useTranslation();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const lang = currentLang();
  const statsHref = withLangPrefix(lang, "/ai-tierlist-stats");

  const faqs = Array.from({ length: 7 }, (_, i) => ({
    q: t(`aiTierlist.faq${i + 1}.q`),
    a: t(`aiTierlist.faq${i + 1}.a`),
  }));

  const features = Array.from({ length: 4 }, (_, i) => ({
    title: t(`aiTierlist.feature${i + 1}.title`),
    desc: t(`aiTierlist.feature${i + 1}.desc`),
  }));

  const stats = [
    { n: String(TIERLIST_TOOLS.generic.length), label: t("aiTierlist.statTools"), cls: "grey" },
    { n: String(TIERLIST_THEMES.length), label: t("aiTierlist.statPools"), cls: "lime" },
    { n: "5", label: t("aiTierlist.statTiers"), cls: "ink" },
    { n: "0", label: t("aiTierlist.statSignup"), cls: "ghost" },
  ];

  const ladder = [2, 3, 4, 5].map((i) => ({
    letter: t(`aiTierlist.tier${i}.label`).slice(0, 1),
    label: t(`aiTierlist.tier${i}.en`),
  }));

  return (
    <div className="flex min-h-screen flex-col bg-[#ededed] dark:bg-[#0c0d0f]">
      <AppNav />
      <main className="flex-1">
        <div className="aix">
          <style>{AIX_CSS}</style>

          {/* HERO */}
          <section className="aix-frame aix-hero">
            <div className="aix-mininav">
              <span className="brand">
                <span className="dot" />
                AI TIER LIST
              </span>
              <span>{t("aiTierlist.kicker")}</span>
              <a href={statsHref}>
                {t("aiTierlist.viewStats")}
                <ArrowUpRight className="size-3.5" />
              </a>
            </div>

            <div className="aix-hero-grid">
              <div className="aix-hero-copy">
                <div>
                  <div className="aix-topline">
                    <span className="aix-pill lime">
                      <span className="dot" />
                      {t("aiTierlist.badge")}
                    </span>
                    <span className="aix-kicker">{t("aiTierlist.kicker")}</span>
                  </div>
                  <h1 className="aix-h1">{t("aiTierlist.heading")}</h1>
                  <p className="aix-lede">{t("aiTierlist.subheading")}</p>
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
                  S<span>{t("aiTierlist.tier1.en")}</span>
                </div>
                <div className="aix-art-rows">
                  {ladder.map((row) => (
                    <div key={row.letter} className="aix-art-row">
                      <b>{row.letter}</b>
                      <span>{row.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* MAKER */}
          <section className="aix-frame" id="aix-maker">
            <div className="aix-sec-head">
              <div>
                <div className="aix-section-num">01</div>
                <h2 className="aix-sec-title">{t("aiTierlist.sectionMaker")}</h2>
              </div>
              <span className="aix-dot-sm" />
            </div>
            <TierListMaker />
          </section>

          {/* STATS STRIP */}
          <a className="aix-strip" href={statsHref}>
            <span className="k">REDDIT / 30D</span>
            <span>
              <strong>{t("aiTierlist.statsLink")}</strong>
              <small>{t("aiTierlist.statsLinkDesc")}</small>
            </span>
            <span className="go">
              <ArrowUpRight className="size-4" />
            </span>
          </a>

          {/* WHY */}
          <section className="aix-frame">
            <div className="aix-sec-head">
              <div>
                <div className="aix-section-num">02</div>
                <h2 className="aix-sec-title">{t("aiTierlist.intro.title")}</h2>
              </div>
              <span className="aix-dot-sm" />
            </div>
            <p className="aix-body">{t("aiTierlist.intro.text")}</p>
            <div className="aix-notes">
              {features.map((f, i) => (
                <div
                  key={f.title}
                  className={`aix-note ${i === 0 ? "ink" : i === 1 ? "lime" : i === 2 ? "" : "ghost"}`}
                >
                  <span className="num">{String(i + 1).padStart(2, "0")}</span>
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* HOW */}
          <section className="aix-frame">
            <div className="aix-sec-head">
              <div>
                <div className="aix-section-num">03</div>
                <h2 className="aix-sec-title">{t("aiTierlist.howto.title")}</h2>
              </div>
              <span className="aix-dot-sm" />
            </div>
            <div className="aix-how">
              <p className="aix-body">{t("aiTierlist.desc")}</p>
              <ol className="aix-steps">
                {[1, 2, 3, 4].map((i) => (
                  <li key={i} className="aix-step">
                    <span className="num">{String(i).padStart(2, "0")}</span>
                    <span>{t(`aiTierlist.howto.step${i}`)}</span>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          {/* FAQ */}
          <section className="aix-frame">
            <div className="aix-sec-head">
              <div>
                <div className="aix-section-num">04</div>
                <h2 className="aix-sec-title">{t("aiTierlist.faqHeading")}</h2>
              </div>
              <span className="aix-dot-sm" />
            </div>
            <div className="aix-faq">
              {faqs.map((faq, i) => {
                const open = openFaq === i;
                return (
                  <details
                    key={faq.q}
                    open={open}
                    onToggle={(e) => {
                      const isOpen = (e.currentTarget as HTMLDetailsElement).open;
                      setOpenFaq(isOpen ? i : openFaq === i ? null : openFaq);
                    }}
                  >
                    <summary>
                      <span>{faq.q}</span>
                      <span className="plus">＋</span>
                    </summary>
                    <p className="answer">{faq.a}</p>
                  </details>
                );
              })}
            </div>
          </section>

          {/* CTA */}
          <section className="aix-cta">
            <div>
              <h2>{t("aiTierlist.ctaHeading")}</h2>
              <p>{t("aiTierlist.ctaText")}</p>
            </div>
            <a href="#aix-maker">
              {t("aiTierlist.ctaButton")}
              <ArrowUpRight className="size-4" />
            </a>
          </section>
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
