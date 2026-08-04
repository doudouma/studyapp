import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import i18n from "~/lib/i18n";
import { AppNav } from "~/components/HomeHeader";
import { RhythmGame } from "~/components/RhythmGame";

export const Route = createFileRoute("/rhythm")({
  head: () => {
    const lang = i18n.language?.startsWith("zh") ? "zh" : "en";
    const pageUrl = "https://100mini.com/rhythm";
    const faqs = Array.from({ length: 5 }, (_, i) => ({
      name: i18n.t(`rhythm.faq${i + 1}.q`),
      text: i18n.t(`rhythm.faq${i + 1}.a`),
    }));
    return {
      title: i18n.t("rhythm.title"),
      meta: [
        { name: "description", content: i18n.t("rhythm.desc") },
        { name: "keywords", content: i18n.t("rhythm.keywords") },
        { name: "robots", content: "index, follow" },
        { property: "og:type", content: "website" },
        { property: "og:url", content: pageUrl },
        { property: "og:title", content: i18n.t("rhythm.title") },
        { property: "og:description", content: i18n.t("rhythm.desc") },
        { property: "og:image", content: "https://100mini.com/spritesheet2/frame_38.webp" },
        { property: "og:locale", content: lang === "zh" ? "zh_CN" : "en_US" },
        { property: "og:site_name", content: "100mini" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: i18n.t("rhythm.title") },
        { name: "twitter:description", content: i18n.t("rhythm.desc") },
        { name: "twitter:image", content: "https://100mini.com/spritesheet2/frame_38.webp" },
      ],
      links: [
        { rel: "canonical", href: pageUrl },
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: lang === "zh" ? "100mini 节奏游戏" : "100mini Rhythm Forge",
            url: pageUrl,
            description: i18n.t("rhythm.desc"),
            applicationCategory: "GameApplication",
            operatingSystem: "All",
            browserRequirements: "Requires JavaScript and Web Audio API",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            featureList: [
              "Turn any song into a rhythm game",
              "Auto-generated 4K falling-note beatmaps",
              "Runs 100% locally in the browser",
              "Supports MP3, WAV, OGG and M4A",
            ],
            author: { "@type": "Organization", name: "100mini", url: "https://100mini.com" },
            inLanguage: lang === "zh" ? "zh-CN" : "en-US",
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
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
  component: RhythmPage,
});

function RhythmPage() {
  const { t } = useTranslation();
  const guideSteps = [
    t("rhythm.guide.step1"),
    t("rhythm.guide.step2"),
    t("rhythm.guide.step3"),
    t("rhythm.guide.step4"),
    t("rhythm.guide.step5"),
  ];
  const faqs = Array.from({ length: 5 }, (_, i) => ({
    name: t(`rhythm.faq${i + 1}.q`),
    text: t(`rhythm.faq${i + 1}.a`),
  }));
  return (
    <div className="flex min-h-screen flex-col">
      <AppNav />
      <main className="flex-1">
        <section className="relative overflow-hidden bg-gradient-to-b from-[#006c49]/10 via-[#006c49]/[0.02] to-background dark:from-[#4edea3]/10 dark:via-[#4edea3]/[0.02] dark:to-background pb-6 pt-6 sm:pt-10">
          <div className="mx-auto w-full max-w-2xl px-4">
            <RhythmGame />
          </div>
        </section>
        <section className="mx-auto w-full max-w-3xl px-4 pb-20 pt-12">
          <h2 className="text-center text-2xl font-bold tracking-tight text-foreground">{t("rhythm.guide")}</h2>
          <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <h3 className="text-lg font-bold text-primary">{t("rhythm.guide.what")}</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{t("rhythm.guide.what.desc")}</p>
            <ol className="mt-6 list-decimal space-y-2.5 pl-5">
              {guideSteps.map((step) => (
                <li key={step} className="text-[15px] leading-relaxed text-muted-foreground">{step}</li>
              ))}
            </ol>
            <p className="mt-6 text-center text-sm italic text-muted-foreground">{t("rhythm.guide.tip")}</p>
          </div>
        </section>
        <section className="mx-auto w-full max-w-3xl px-4 pb-20">
          <h2 className="text-center text-2xl font-bold tracking-tight text-foreground">{t("rhythm.faq")}</h2>
          <div className="mt-8 rounded-2xl border border-border bg-card px-6 shadow-sm">
            {faqs.map((faq) => (
              <FaqItem key={faq.name} name={faq.name} text={faq.text} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function FaqItem({ name, text }: { name: string; text: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border last:border-b-0">
      <button
        className="flex w-full cursor-pointer items-center justify-between gap-4 py-4 text-left text-sm font-medium transition-colors hover:text-foreground/80"
        onClick={() => setOpen(!open)}
      >
        <span>{name}</span>
        <ChevronDown
          className={`size-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && <div className="pb-4 text-sm leading-relaxed text-muted-foreground">{text}</div>}
    </div>
  );
}
