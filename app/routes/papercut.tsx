import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import i18n from "~/lib/i18n";
import { withLangPrefix, currentLang, BASE_URL } from "~/lib/seo";
import { PaperCutApp } from "~/components/papercut/PaperCutApp";

export const Route = createFileRoute("/papercut")({
  head: () => {
    const title = i18n.t("papercut.title");
    const desc = i18n.t("papercut.desc");
    const keywords = i18n.t("papercut.keywords");
    const pageUrl = BASE_URL + withLangPrefix(currentLang(), "/papercut");
    const faq = [1, 2, 3].map((n) => ({
      "@type": "Question",
      name: i18n.t(`papercut.faq.q${n}`),
      acceptedAnswer: { "@type": "Answer", text: i18n.t(`papercut.faq.a${n}`) },
    }));
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
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faq,
          }),
        },
      ],
    };
  },
  component: PaperCutPage,
});

function PaperCutPage() {
  const { t } = useTranslation();
  const features = [
    t("papercut.seo.feature1"),
    t("papercut.seo.feature2"),
    t("papercut.seo.feature3"),
    t("papercut.seo.feature4"),
  ];
  const related = [
    { to: "/petbadge", label: t("freetool.item.petbadge.title") },
    { to: "/pomodoro", label: t("freetool.item.pomodoro.title") },
    { to: "/idphoto", label: t("freetool.item.idphoto.title") },
  ] as const;
  const faq = [1, 2, 3].map((n) => ({
    q: t(`papercut.faq.q${n}`),
    a: t(`papercut.faq.a${n}`),
  }));

  return (
    <>
      <PaperCutApp />
      <section
        className="mx-auto w-full max-w-3xl px-5 py-12 text-[#5c231a]"
        aria-label={t("papercut.seo.heading")}
      >
        <h2
          className="text-[24px] font-semibold tracking-[0.16em]"
          style={{ fontFamily: "var(--serif)" }}
        >
          {t("papercut.seo.heading")}
        </h2>
        <p className="mt-4 text-[14.5px] leading-[1.85] text-[#6b5347]">
          {t("papercut.seo.intro")}
        </p>
        <ul className="mt-5 space-y-2">
          {features.map((f, i) => (
            <li key={i} className="flex gap-2 text-[14px] leading-[1.75] text-[#6b5347]">
              <span aria-hidden className="text-[#d6472e]">•</span>
              <span>{f}</span>
            </li>
          ))}
        </ul>

        <h3 className="mt-10 text-[17px] font-semibold text-[#7a2418]">
          {t("papercut.seo.relatedTitle")}
        </h3>
        <div className="mt-3 flex flex-wrap gap-3">
          {related.map((r) => (
            <Link
              key={r.to}
              to={r.to}
              className="rounded-full border border-[#e6cdb4] bg-white/70 px-4 py-2 text-[13.5px] font-medium text-[#7a2418] transition-colors hover:bg-white"
            >
              {r.label}
            </Link>
          ))}
        </div>

        <h3 className="mt-10 text-[17px] font-semibold text-[#7a2418]">
          {t("papercut.faq.title")}
        </h3>
        <dl className="mt-3 space-y-5">
          {faq.map((item, i) => (
            <div key={i}>
              <dt className="text-[14.5px] font-semibold text-[#5c231a]">{item.q}</dt>
              <dd className="mt-1.5 text-[14px] leading-[1.8] text-[#6b5347]">{item.a}</dd>
            </div>
          ))}
        </dl>
      </section>
    </>
  );
}
