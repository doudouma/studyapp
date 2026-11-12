import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ChevronDown, Globe, Link2, Store } from "lucide-react";
import { AppNav } from "~/components/HomeHeader";
import { AppFooter } from "~/components/AppFooter";
import { buttonVariants } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { useTranslation } from "react-i18next";
import i18n, { getBcp47 } from "~/lib/i18n";
import { withLangPrefix, currentLang, BASE_URL, DEFAULT_OG_IMAGE } from "~/lib/seo";

const PREFIX = "makeHtmlWebsite";
const FAQ_COUNT = 5;

const ROUTE_ICONS = [Link2, Globe, Store];

export const Route = createFileRoute("/make-html-file-into-website")({
  head: () => {
    const bcp = getBcp47(i18n.language);
    const pageUrl = BASE_URL + withLangPrefix(currentLang(), "/make-html-file-into-website");
    const faqs = Array.from({ length: FAQ_COUNT }, (_, i) => ({
      name: i18n.t(`${PREFIX}.faq${i + 1}.q`),
      text: i18n.t(`${PREFIX}.faq${i + 1}.a`),
    }));
    return {
      meta: [
        { title: i18n.t(`${PREFIX}.title`) },
        { name: "description", content: i18n.t(`${PREFIX}.desc`) },
        { name: "keywords", content: i18n.t(`${PREFIX}.keywords`) },
        { name: "robots", content: "index, follow" },
        { property: "og:type", content: "article" },
        { property: "og:title", content: i18n.t(`${PREFIX}.title`) },
        { property: "og:description", content: i18n.t(`${PREFIX}.desc`) },
        { property: "og:image", content: DEFAULT_OG_IMAGE },
        { property: "og:site_name", content: "100mini" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: i18n.t(`${PREFIX}.title`) },
        { name: "twitter:description", content: i18n.t(`${PREFIX}.desc`) },
        { name: "twitter:image", content: DEFAULT_OG_IMAGE },
      ],
      links: [{ rel: "canonical", href: pageUrl }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            inLanguage: bcp,
            mainEntity: faqs.map((faq) => ({
              "@type": "Question",
              name: faq.name,
              acceptedAnswer: { "@type": "Answer", text: faq.text },
            })),
          }),
        },
      ],
    };
  },
  component: MakeHtmlWebsitePage,
});

function MakeHtmlWebsitePage() {
  const { t } = useTranslation();
  const faqs = Array.from({ length: FAQ_COUNT }, (_, i) => ({
    q: t(`${PREFIX}.faq${i + 1}.q`),
    a: t(`${PREFIX}.faq${i + 1}.a`),
  }));
  const rows = [1, 2, 3].map((n) => ({
    need: t(`${PREFIX}.decide.r${n}.need`),
    use: t(`${PREFIX}.decide.r${n}.use`),
  }));
  const steps = [1, 2, 3].map((n) => t(`${PREFIX}.route1.step${n}`));

  return (
    <div className="flex min-h-screen flex-col">
      <AppNav />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[#111214]/10 via-[#111214]/[0.02] to-background pb-10 pt-16 dark:from-[#d8ff00]/10 dark:via-[#d8ff00]/[0.02] dark:to-background md:pt-24">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-[#111214]/20 bg-[#111214]/5 px-3 py-1 text-xs font-medium text-[#111214] dark:border-[#d8ff00]/20 dark:bg-[#d8ff00]/5 dark:text-[#d8ff00]">
              {t(`${PREFIX}.badge`)}
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              {t(`${PREFIX}.h1`)}
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              {t(`${PREFIX}.subtitle`)}
            </p>
          </div>
        </section>

        {/* Decision table */}
        <section className="mx-auto max-w-3xl px-6 pb-14">
          <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            {t(`${PREFIX}.decide.title`)}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            {t(`${PREFIX}.decide.lead`)}
          </p>

          <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card">
            <div className="hidden grid-cols-2 gap-4 border-b border-border bg-muted/40 px-6 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground md:grid">
              <span>{t(`${PREFIX}.decide.col1`)}</span>
              <span>{t(`${PREFIX}.decide.col2`)}</span>
            </div>
            {rows.map((row, i) => (
              <div
                key={i}
                className="grid gap-2 border-b border-border px-6 py-5 last:border-b-0 md:grid-cols-2 md:gap-4"
              >
                <span className="text-sm font-medium text-foreground">{row.need}</span>
                <span className="text-sm leading-relaxed text-muted-foreground">{row.use}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Three routes */}
        <section className="mx-auto max-w-3xl space-y-4 px-6 pb-14">
          <div className="rounded-2xl border border-border/70 bg-card p-6">
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-lg bg-[#111214]/10 text-[#111214] dark:bg-[#d8ff00]/10 dark:text-[#d8ff00]">
                {(() => {
                  const Icon = ROUTE_ICONS[0];
                  return <Icon className="size-4" />;
                })()}
              </span>
              <h2 className="text-base font-semibold text-foreground">
                {t(`${PREFIX}.route1.title`)}
              </h2>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {t(`${PREFIX}.route1.desc`)}
            </p>
            <ol className="mt-4 space-y-2">
              {steps.map((step, i) => (
                <li key={i} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border border-border text-[11px] font-semibold text-foreground">
                    {i + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
            <Link
              to="/host-single-html"
              className={cn(buttonVariants({ size: "lg" }), "mt-5 gap-2")}
            >
              {t(`${PREFIX}.route1.cta`)}
              <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="rounded-2xl border border-border/70 bg-card p-6">
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-lg bg-[#111214]/10 text-[#111214] dark:bg-[#d8ff00]/10 dark:text-[#d8ff00]">
                {(() => {
                  const Icon = ROUTE_ICONS[1];
                  return <Icon className="size-4" />;
                })()}
              </span>
              <h2 className="text-base font-semibold text-foreground">
                {t(`${PREFIX}.route2.title`)}
              </h2>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {t(`${PREFIX}.route2.desc`)}
            </p>
            <Link
              to="/alternatives"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-[#111214] hover:underline dark:text-[#ededed]"
            >
              {t(`${PREFIX}.route2.link`)}
              <ArrowRight className="size-3.5" />
            </Link>
          </div>

          <div className="rounded-2xl border border-border/70 bg-card p-6">
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-lg bg-[#111214]/10 text-[#111214] dark:bg-[#d8ff00]/10 dark:text-[#d8ff00]">
                {(() => {
                  const Icon = ROUTE_ICONS[2];
                  return <Icon className="size-4" />;
                })()}
              </span>
              <h2 className="text-base font-semibold text-foreground">
                {t(`${PREFIX}.route3.title`)}
              </h2>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {t(`${PREFIX}.route3.desc`)}
            </p>
          </div>
        </section>

        {/* Honest boundary */}
        <section className="mx-auto max-w-3xl px-6 pb-14">
          <div className="rounded-2xl border border-border bg-muted/30 p-6">
            <h2 className="text-sm font-semibold text-foreground">{t(`${PREFIX}.honest.title`)}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {t(`${PREFIX}.honest.desc`)}
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="mx-auto max-w-3xl px-6 pb-14">
          <h2 className="mb-8 text-center text-2xl font-bold tracking-tight md:text-3xl">
            {t("hostSingleHtml.faq.title")}
          </h2>
          <div className="rounded-2xl border border-border bg-card px-6">
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
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-3xl px-6 pb-20">
          <div className="rounded-2xl border border-border bg-card p-8 text-center">
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              {t(`${PREFIX}.cta.title`)}
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
              {t(`${PREFIX}.cta.desc`)}
            </p>
            <Link
              to="/host-single-html"
              className={cn(buttonVariants({ size: "lg" }), "mt-5 gap-2")}
            >
              {t(`${PREFIX}.cta.button`)}
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>
      </main>
      <AppFooter />
    </div>
  );
}
