import { createFileRoute } from "@tanstack/react-router";
import { PetBadgeApp } from "~/components/petbadge/PetBadgeApp";
import i18n from "~/lib/i18n";
import { withLangPrefix, currentLang, BASE_URL } from "~/lib/seo";

function PetBadgeWithRelated() {
  return (
    <>
      <PetBadgeApp />
      <nav className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-kuaile" aria-label="Related tools">
        <div className="bg-white border-4 border-[#1a1a1a] shadow-[6px_6px_0_rgba(26,26,26,1)] p-5">
          <h3 className="font-['Bangers',cursive] text-xl mb-3">{i18n.t("petbadge.seo.relatedTitle")}</h3>
          <a href={`${BASE_URL}/petsafe`} className="inline-flex items-center gap-2 border-4 border-[#1a1a1a] bg-[#fffef0] hover:bg-[#ffcc00] shadow-[4px_4px_0_rgba(26,26,26,1)] px-4 py-2 text-sm font-black uppercase transition-colors">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            {i18n.t("petbadge.seo.related.petsafe")}
          </a>
        </div>
      </nav>
    </>
  );
}

export const Route = createFileRoute("/petbadge")({
  head: () => {
    const title = i18n.t("petbadge.title");
    const desc = i18n.t("petbadge.desc");
    const keywords = i18n.t("petbadge.keywords");
    const pageUrl = BASE_URL + withLangPrefix(currentLang(), "/petbadge");
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { name: "keywords", content: keywords },
        { name: "robots", content: "index, follow" },
        { property: "og:type", content: "website" },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:image", content: "https://100mini.com/spritesheet2/frame_38.webp" },
        { property: "og:site_name", content: "100mini" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: desc },
        { name: "twitter:image", content: "https://100mini.com/spritesheet2/frame_38.webp" },
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: title,
            url: pageUrl,
            description: desc,
            applicationCategory: "EntertainmentApplication",
            operatingSystem: "All",
            browserRequirements: "Requires JavaScript",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            author: { "@type": "Organization", name: "100mini", url: "https://100mini.com" },
          }),
        },
      ],
    };
  },
  component: PetBadgeWithRelated,
});
