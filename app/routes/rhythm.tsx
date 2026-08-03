import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import i18n from "~/lib/i18n";
import { AppNav } from "~/components/HomeHeader";
import { RhythmGame } from "~/components/RhythmGame";

export const Route = createFileRoute("/rhythm")({
  head: () => {
    const lang = i18n.language?.startsWith("zh") ? "zh" : "en";
    const pageUrl = "https://100mini.com/rhythm";
    const altUrls = {
      zh: "https://100mini.com/rhythm",
      en: "https://100mini.com/en/rhythm",
    };
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
        { rel: "canonical", href: altUrls[lang] || pageUrl },
        { rel: "alternate", hrefLang: "zh", href: altUrls.zh },
        { rel: "alternate", hrefLang: "en", href: altUrls.en },
        { rel: "alternate", hrefLang: "x-default", href: pageUrl },
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
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppNav />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-2xl px-4 pt-6 sm:pt-10">
          <RhythmGame />
        </div>
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
      </main>
    </div>
  );
}
