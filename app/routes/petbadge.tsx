import { createFileRoute } from "@tanstack/react-router";
import { PetBadgeApp } from "~/components/petbadge/PetBadgeApp";
import i18n from "~/lib/i18n";
import { withLangPrefix, currentLang, BASE_URL } from "~/lib/seo";

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
  component: PetBadgeApp,
});
