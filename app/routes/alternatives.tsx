import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { AppNav } from "~/components/HomeHeader";
import { AppFooter } from "~/components/AppFooter";
import { useTranslation } from "react-i18next";
import i18n from "~/lib/i18n";
import { withLangPrefix, currentLang, BASE_URL, DEFAULT_OG_IMAGE } from "~/lib/seo";
import { listCompetitors } from "~/features/alternatives/data";

export const Route = createFileRoute("/alternatives")({
  head: () => {
    const pageUrl = BASE_URL + withLangPrefix(currentLang(), "/alternatives");
    const competitors = listCompetitors();
    return {
      meta: [
        { title: i18n.t("alternatives.title") },
        { name: "description", content: i18n.t("alternatives.desc") },
        { name: "keywords", content: i18n.t("alternatives.keywords") },
        { name: "robots", content: "index, follow" },
        { property: "og:type", content: "website" },
        { property: "og:title", content: i18n.t("alternatives.title") },
        { property: "og:description", content: i18n.t("alternatives.desc") },
        { property: "og:image", content: DEFAULT_OG_IMAGE },
        { property: "og:site_name", content: "100mini" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: i18n.t("alternatives.title") },
        { name: "twitter:description", content: i18n.t("alternatives.desc") },
        { name: "twitter:image", content: DEFAULT_OG_IMAGE },
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: i18n.t("alternatives.h1"),
            url: pageUrl,
            itemListElement: competitors.map((c, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: i18n.t(`${c.i18nKey}.h1`),
              url: `${BASE_URL}${withLangPrefix(currentLang(), `/alternatives/${c.slug}`)}`,
            })),
          }),
        },
      ],
    };
  },
  component: AlternativesHubPage,
});

function AlternativesHubPage() {
  const { t } = useTranslation();
  const competitors = listCompetitors();

  return (
    <div className="flex min-h-screen flex-col">
      <AppNav />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-3xl px-6 py-10 sm:py-14">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t("alternatives.h1")}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            {t("alternatives.subtitle")}
          </p>

          <div className="mt-8 flex flex-col gap-4">
            {competitors.map((c) => (
              <Link
                key={c.slug}
                to="/alternatives/$competitor"
                params={{ competitor: c.slug }}
                className="group flex flex-col rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-[#006c49]/40 hover:shadow-md dark:hover:border-[#4edea3]/40"
              >
                <h2 className="text-lg font-semibold text-foreground">{c.name}</h2>
                <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {t(`${c.i18nKey}.desc`)}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[#006c49] dark:text-[#4edea3]">
                  {t("alternatives.read")}
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>

          <p className="mt-8 text-xs text-muted-foreground">{t("alternatives.disclaimer")}</p>
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
