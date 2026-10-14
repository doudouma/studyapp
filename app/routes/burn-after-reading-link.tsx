import { createFileRoute, Link } from "@tanstack/react-router";
import { Flame, Eye, Clock, Zap, Link2, ChevronDown } from "lucide-react";
import { AppNav } from "~/components/HomeHeader";
import { AppFooter } from "~/components/AppFooter";
import { useTranslation } from "react-i18next";
import i18n from "~/lib/i18n";
import { withLangPrefix, currentLang, BASE_URL, DEFAULT_OG_IMAGE } from "~/lib/seo";

/**
 * Dedicated landing page for the "burn after reading / one-time link" feature.
 * Targets high-intent long-tail keywords (self-destructing link, one-time secret
 * link, burn after reading link generator, view once link generator, no signup).
 */
export const Route = createFileRoute("/burn-after-reading-link")({
  head: () => {
    const pageUrl = BASE_URL + withLangPrefix(currentLang(), "/burn-after-reading-link");
    const faqs = [1, 2, 3, 4, 5].map((n) => ({
      "@type": "Question",
      name: i18n.t(`burn.faq${n}Q`),
      acceptedAnswer: { "@type": "Answer", text: i18n.t(`burn.faq${n}A`) },
    }));
    return {
      meta: [
        { title: i18n.t("burn.title") },
        { name: "description", content: i18n.t("burn.desc") },
        { name: "keywords", content: i18n.t("burn.keywords") },
        { name: "robots", content: "index, follow" },
        { property: "og:type", content: "website" },
        { property: "og:title", content: i18n.t("burn.title") },
        { property: "og:description", content: i18n.t("burn.desc") },
        { property: "og:image", content: DEFAULT_OG_IMAGE },
        { property: "og:url", content: pageUrl },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: i18n.t("burn.title") },
        { name: "twitter:description", content: i18n.t("burn.desc") },
        { name: "twitter:image", content: DEFAULT_OG_IMAGE },
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs,
          }),
        },
      ],
    };
  },
  component: BurnPage,
});

function BurnPage() {
  const { t } = useTranslation();

  const steps = [1, 2, 3].map((n) => ({
    title: t(`burn.step${n}Title`),
    desc: t(`burn.step${n}Desc`),
    icon: n === 1 ? Link2 : n === 2 ? Eye : Clock,
  }));
  const faqs = [1, 2, 3, 4, 5].map((n) => ({
    q: t(`burn.faq${n}Q`),
    a: t(`burn.faq${n}A`),
  }));

  return (
    <div className="flex min-h-screen flex-col">
      <AppNav />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[#ff5100]/10 via-[#ff5100]/[0.02] to-background px-6 pb-16 pt-20">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#ff5100]/30 bg-[#ff5100]/10 px-3 py-1 text-xs font-semibold text-[#c2410c] dark:text-[#ffb088]">
              <Zap className="size-3.5" /> {t("burn.badge")}
            </span>
            <h1 className="mt-5 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              {t("burn.h1")}
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              {t("burn.subtitle")}
            </p>
            <div className="mt-8 flex justify-center">
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-xl bg-[#ff5100] px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-[#e64a00]"
              >
                <Flame className="size-4" /> {t("burn.cta")}
              </Link>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-10 text-center text-2xl font-bold tracking-tight md:text-3xl">
              {t("burn.howTitle")}
            </h2>
            <div className="grid gap-10 md:grid-cols-3">
              {steps.map((step) => {
                const Icon = step.icon;
                return (
                  <div key={step.title} className="flex flex-col items-center text-center">
                    <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-[#ff5100]/10 text-[#c2410c] dark:text-[#ffb088]">
                      <Icon className="size-6" />
                    </div>
                    <h3 className="text-lg font-semibold">{step.title}</h3>
                    <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-muted-foreground">
                      {step.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Use cases */}
        <section className="bg-[#eff4ff] px-6 py-16 dark:bg-[#1e314a]">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-2xl font-bold tracking-tight md:text-3xl">
              {t("burn.useCasesTitle")}
            </h2>
            <p className="leading-relaxed text-muted-foreground">{t("burn.useCases")}</p>
          </div>
        </section>

        {/* FAQ */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-10 text-center text-2xl font-bold tracking-tight md:text-3xl">
              {t("burn.faqTitle")}
            </h2>
            <div className="rounded-2xl border border-border bg-card px-5">
              {faqs.map((faq) => (
                <details key={faq.q} className="group border-b border-border last:border-b-0">
                  <summary className="flex w-full cursor-pointer list-none items-center justify-between gap-4 py-4 text-left text-sm font-medium transition-colors hover:text-foreground/80 [&::-webkit-details-marker]:hidden">
                    <span>{faq.q}</span>
                    <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
                  </summary>
                  <div className="pb-4 text-sm leading-relaxed text-muted-foreground">{faq.a}</div>
                </details>
              ))}
            </div>
            <div className="mt-10 flex justify-center">
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-xl bg-[#ff5100] px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-[#e64a00]"
              >
                <Flame className="size-4" /> {t("burn.cta")}
              </Link>
            </div>
          </div>
        </section>
      </main>
      <AppFooter />
    </div>
  );
}
