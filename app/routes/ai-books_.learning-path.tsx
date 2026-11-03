import { createFileRoute } from "@tanstack/react-router";
import i18n from "~/lib/i18n";
import { BASE_URL, currentLang, withLangPrefix } from "~/lib/seo";
import { AppNav } from "~/components/HomeHeader";
import { AppFooter } from "~/components/AppFooter";
import { LearningPathCalculator } from "~/features/books/LearningPathCalculator";
import { LP_COPY, type LpLocale } from "~/features/books/learning-path-calculator";

export const Route = createFileRoute("/ai-books_/learning-path")({
  head: () => {
    const lang = currentLang();
    const pageUrl = BASE_URL + withLangPrefix(lang, "/ai-books/learning-path");
    return {
      meta: [
        { title: i18n.t("aiLearningPath.title") },
        { name: "description", content: i18n.t("aiLearningPath.desc") },
        { name: "keywords", content: i18n.t("aiLearningPath.keywords") },
        { name: "robots", content: "index, follow" },
        { property: "og:type", content: "website" },
        { property: "og:title", content: i18n.t("aiLearningPath.title") },
        { property: "og:description", content: i18n.t("aiLearningPath.desc") },
        { property: "og:url", content: pageUrl },
        { property: "og:site_name", content: "100mini" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: i18n.t("aiLearningPath.title") },
        { name: "twitter:description", content: i18n.t("aiLearningPath.desc") },
      ],
      links: [
        { rel: "preconnect", href: "https://m.media-amazon.com" },
        { rel: "dns-prefetch", href: "https://m.media-amazon.com" },
      ],
    };
  },
  component: LearningPathPage,
});

function LearningPathPage() {
  const lang = currentLang() as LpLocale;
  const copy = LP_COPY[lang];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: copy.h1,
    description: copy.lede,
    url: BASE_URL + withLangPrefix(lang, "/ai-books/learning-path"),
    applicationCategory: "EducationalApplication",
    operatingSystem: "Any",
    inLanguage: lang,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    isPartOf: { "@type": "WebSite", name: "100mini", url: BASE_URL },
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <AppNav />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
          <LearningPathCalculator />
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
