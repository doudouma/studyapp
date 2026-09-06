import { createFileRoute } from "@tanstack/react-router";
import PetSafeApp from "~/components/petsafe/PetSafeApp";
import PetSafeSeoContent from "~/components/petsafe/PetSafeSeoContent";
import { PETSAFE_FAQ_KEYS } from "~/components/petsafe/petsafe-constants";
import i18n from "~/lib/i18n";
import { withLangPrefix, currentLang, BASE_URL } from "~/lib/seo";

export const Route = createFileRoute("/petsafe")({
  head: () => {
    const t = (key: string) => i18n.t(key) || "";
    const title = t("petsafe.title") || "PET Safe - Lost Pet Emergency & Permanent QR Tag | 100mini";
    const desc = t("petsafe.desc") || "Zero-backend privacy protection. Generate lost pet posters, permanent QR pet tags, social media broadcast copies, and 48-hour recovery checklist.";
    const keywords = t("petsafe.keywords") || "pet safety,lost pet poster,QR pet tag,lost pet notice,pet safe";
    const pageUrl = BASE_URL + withLangPrefix(currentLang(), "/petsafe");

    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: PETSAFE_FAQ_KEYS.map((key) => ({
        "@type": "Question",
        name: t(`petsafe.seo.qa.${key}.q`),
        acceptedAnswer: {
          "@type": "Answer",
          text: t(`petsafe.seo.qa.${key}.a`).replace(/<[^>]+>/g, ""),
        },
      })),
    };

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
        {
          type: "application/ld+json",
          children: JSON.stringify(faqSchema),
        },
      ],
    };
  },
  component: () => (
    <>
      <PetSafeApp />
      <PetSafeSeoContent />
    </>
  ),
});
