import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Check, X, ArrowRight, ArrowLeft } from "lucide-react";
import { AppNav } from "~/components/HomeHeader";
import { AppFooter } from "~/components/AppFooter";
import { useTranslation } from "react-i18next";
import i18n, { getBcp47 } from "~/lib/i18n";
import { withLangPrefix, currentLang, BASE_URL, DEFAULT_OG_IMAGE } from "~/lib/seo";
import { getCompetitor } from "~/features/alternatives/data";

const TABLE_ROWS = ["r1", "r2", "r3", "r4", "r5", "r6", "r7"];
const SECTIONS = ["s1", "s2", "s3"];
const FAQS = ["faq1", "faq2", "faq3", "faq4"];

export const Route = createFileRoute("/alternatives_/$competitor")({
  loader: ({ params }) => {
    const competitor = getCompetitor(params.competitor);
    if (!competitor) throw notFound();
    return { competitor };
  },
  head: ({ params }) => {
    const competitor = getCompetitor(params.competitor);
    if (!competitor) {
      return { meta: [{ title: "Not found | 100mini" }, { name: "robots", content: "noindex" }] };
    }
    const k = competitor.i18nKey;
    const bcp = getBcp47(i18n.language);
    const pageUrl = BASE_URL + withLangPrefix(currentLang(), `/alternatives/${competitor.slug}`);
    const faqs = FAQS.map((f) => ({ name: i18n.t(`${k}.${f}.q`), text: i18n.t(`${k}.${f}.a`) }));
    return {
      meta: [
        { title: i18n.t(`${k}.title`) },
        { name: "description", content: i18n.t(`${k}.desc`) },
        { name: "keywords", content: i18n.t(`${k}.keywords`) },
        { name: "robots", content: "index, follow" },
        { property: "og:type", content: "article" },
        { property: "og:title", content: i18n.t(`${k}.title`) },
        { property: "og:description", content: i18n.t(`${k}.desc`) },
        { property: "og:image", content: DEFAULT_OG_IMAGE },
        { property: "og:site_name", content: "100mini" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: i18n.t(`${k}.title`) },
        { name: "twitter:description", content: i18n.t(`${k}.desc`) },
        { name: "twitter:image", content: DEFAULT_OG_IMAGE },
      ],
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
  component: AlternativePage,
});

function AlternativePage() {
  const { t } = useTranslation();
  const { competitor } = Route.useLoaderData();

  return (
    <div className="flex min-h-screen flex-col">
      <AppNav />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-3xl px-6 py-10 sm:py-14">
          <Link
            to="/alternatives"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            {t("alternatives.back")}
          </Link>

          <h1 className="mt-5 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t(`${competitor.i18nKey}.h1`)}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            {t(`${competitor.i18nKey}.tldr`)}
          </p>

          {/* Comparison table */}
          <div className="mt-8 overflow-x-auto rounded-2xl border border-border">
            <table className="w-full min-w-[520px] border-collapse text-sm">
              <thead>
                <tr className="bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground"></th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">
                    {t("alternatives.oursName")}
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">{competitor.name}</th>
                </tr>
              </thead>
              <tbody>
                {TABLE_ROWS.map((r) => (
                  <tr key={r} className="border-t border-border align-top">
                    <th scope="row" className="px-4 py-3 text-left font-medium text-muted-foreground">
                      {t(`${competitor.i18nKey}.${r}.label`)}
                    </th>
                    <td className="px-4 py-3 text-foreground">{t(`${competitor.i18nKey}.${r}.ours`)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{t(`${competitor.i18nKey}.${r}.theirs`)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Narrative sections */}
          {SECTIONS.map((s) => (
            <section key={s} className="mt-8">
              <h2 className="text-xl font-semibold tracking-tight text-foreground">
                {t(`${competitor.i18nKey}.${s}.title`)}
              </h2>
              <p className="mt-2 text-base leading-relaxed text-muted-foreground">
                {t(`${competitor.i18nKey}.${s}.body`)}
              </p>
            </section>
          ))}

          {/* Who it's for */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-[#006c49]/20 bg-[#006c49]/5 p-5 dark:border-[#4edea3]/20 dark:bg-[#4edea3]/5">
              <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
                <Check className="size-4 text-[#006c49] dark:text-[#4edea3]" />
                {t(`${competitor.i18nKey}.ours.title`)}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {t(`${competitor.i18nKey}.ours.body`)}
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5">
              <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
                <X className="size-4 text-muted-foreground" />
                {t(`${competitor.i18nKey}.theirs.title`)}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {t(`${competitor.i18nKey}.theirs.body`)}
              </p>
            </div>
          </div>

          {/* Migration */}
          <section className="mt-8">
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              {t(`${competitor.i18nKey}.migrate.title`)}
            </h2>
            <p className="mt-2 text-base leading-relaxed text-muted-foreground">
              {t(`${competitor.i18nKey}.migrate.body`)}
            </p>
          </section>

          {/* CTA */}
          <div className="mt-8 flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-5">
            <span className="flex-1 text-sm font-medium text-foreground">
              {t(`${competitor.i18nKey}.cta`)}
            </span>
            <Link
              to="/"
              className="inline-flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {t("alternatives.try")} <ArrowRight className="size-4" />
            </Link>
          </div>

          {/* FAQ */}
          <section className="mt-10">
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              {t("alternatives.faqTitle")}
            </h2>
            <div className="mt-4 rounded-2xl border border-border bg-card px-6">
              {FAQS.map((f) => (
                <details key={f} className="group border-b border-border last:border-b-0">
                  <summary className="flex w-full cursor-pointer list-none items-center justify-between gap-4 py-4 text-left text-sm font-medium transition-colors hover:text-foreground/80 [&::-webkit-details-marker]:hidden">
                    <span>{t(`${competitor.i18nKey}.${f}.q`)}</span>
                  </summary>
                  <div className="pb-4 text-sm leading-relaxed text-muted-foreground">
                    {t(`${competitor.i18nKey}.${f}.a`)}
                  </div>
                </details>
              ))}
            </div>
          </section>

          <p className="mt-6 text-xs text-muted-foreground">
            {t("alternatives.updated", { date: competitor.asOf })}
          </p>
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
