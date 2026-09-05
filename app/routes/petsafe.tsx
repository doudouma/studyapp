import { createFileRoute } from "@tanstack/react-router";
import PetSafeApp from "~/components/petsafe/PetSafeApp";
import i18n from "~/lib/i18n";
import { withLangPrefix, currentLang, BASE_URL } from "~/lib/seo";

export const Route = createFileRoute("/petsafe")({
  head: () => {
    const title = i18n.t("petsafe.title") || "PAW&CLAW Safe 宠安盾 - 宠物走失应急与永久安全牌";
    const desc = i18n.t("petsafe.desc") || "零后端隐私保护，一键生成走失海报、永久QR宠物牌、全网求助文案，48小时科学找回清单";
    const keywords = i18n.t("petsafe.keywords") || "宠物安全,走失海报,QR宠物牌,寻宠启事,宠安盾";
    const pageUrl = BASE_URL + withLangPrefix(currentLang(), "/petsafe");
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
            applicationCategory: "UtilityApplication",
            operatingSystem: "All",
            browserRequirements: "Requires JavaScript",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            author: { "@type": "Organization", name: "100mini", url: "https://100mini.com" },
          }),
        },
      ],
    };
  },
  component: PetSafeApp,
});
