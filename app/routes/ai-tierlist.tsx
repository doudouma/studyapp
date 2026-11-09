import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight, ChevronDown, Layers, Sparkles, Share2, ImageDown, GripHorizontal } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AppNav } from "~/components/HomeHeader";
import { AppFooter } from "~/components/AppFooter";
import { TierListMaker } from "~/components/tierlist/TierListMaker";
import { ToolSeoBlock } from "~/components/ToolSeoBlock";
import i18n, { getBcp47 } from "~/lib/i18n";
import { withLangPrefix, currentLang, BASE_URL, DEFAULT_OG_IMAGE } from "~/lib/seo";

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
            step: steps.map((text, i) => ({
              "@type": "HowToStep",
              position: i + 1,
              text,
            })),
          }),
        },
      ],
    };
  },
  component: AiTierListPage,
});

const FEATURE_ICONS = [GripHorizontal, Share2, ImageDown, Layers];

function AiTierListPage() {
  const { t } = useTranslation();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = Array.from({ length: 7 }, (_, i) => ({
    q: t(`aiTierlist.faq${i + 1}.q`),
    a: t(`aiTierlist.faq${i + 1}.a`),
  }));

  const features = FEATURE_ICONS.map((Icon, i) => ({
    Icon,
    title: t(`aiTierlist.feature${i + 1}.title`),
    desc: t(`aiTierlist.feature${i + 1}.desc`),
  }));

  return (
    <div className="flex min-h-screen flex-col">
      <AppNav />
      <main className="flex-1">
        {/* Hero */}
    

        {/* 工具主体 */}
        <TierListMaker />

        {/* Reddit 统计与社区评价 */}
        <section className="mx-auto max-w-5xl px-6 pt-8">
          <a
            href={withLangPrefix(currentLang(), "/ai-tierlist-stats")}
            className="group flex flex-col gap-3 rounded-2xl border border-border/70 bg-card p-5 shadow-sm transition-colors hover:border-[#006c49]/40 dark:hover:border-[#4edea3]/40 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <h2 className="text-base font-bold text-foreground">{t("aiTierlist.statsLink")}</h2>
              <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                {t("aiTierlist.statsLinkDesc")}
              </p>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-[#006c49] dark:text-[#4edea3]">
              {t("common.view")}
              <ArrowUpRight className="size-4" />
            </span>
          </a>
        </section>

        {/* 产品说明 */}
        <section className="mx-auto max-w-5xl px-6 pt-6">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            {t("aiTierlist.intro.title")}
          </h2>
          <div className="mt-4 space-y-3">
            <p className="text-[15px] leading-relaxed text-foreground">
              {t("aiTierlist.intro.text")}
            </p>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f, i) => {
              const Icon = f.Icon;
              return (
                <div key={i} className="rounded-2xl border border-border/70 bg-card p-5">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary dark:text-[#4edea3]">
                    <Icon className="size-4" />
                  </div>
                  <h3 className="mt-3 text-sm font-semibold text-foreground">{f.title}</h3>
                  <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* How to */}
        <ToolSeoBlock
          className="mx-auto max-w-5xl px-6 pt-14"
          title={t("aiTierlist.howto.title")}
          answer={t("aiTierlist.desc")}
          steps={[
            t("aiTierlist.howto.step1"),
            t("aiTierlist.howto.step2"),
            t("aiTierlist.howto.step3"),
            t("aiTierlist.howto.step4"),
          ]}
        />

        {/* FAQ */}
        <section className="mx-auto max-w-5xl px-6 pt-14 pb-16">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            {t("aiTierlist.faqHeading")}
          </h2>
          <div className="mt-4 rounded-2xl border border-border/70 bg-card px-6 shadow-sm">
            {faqs.map((faq, i) => (
              <div key={faq.q} className="border-b border-border/60 last:border-b-0">
                <button
                  className="flex w-full cursor-pointer items-center justify-between gap-4 py-4 text-left text-sm font-medium transition-colors hover:text-foreground/80"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`size-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
                      openFaq === i ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openFaq === i && (
                  <div className="pb-4 text-sm leading-relaxed text-muted-foreground">{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>
      <AppFooter />
    </div>
  );
}
