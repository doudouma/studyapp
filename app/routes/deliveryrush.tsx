import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Maximize, Minimize, Share2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import i18n, { getBcp47 } from "~/lib/i18n";
import { withLangPrefix, currentLang, BASE_URL, DEFAULT_OG_IMAGE } from "~/lib/seo";
import { AppNav } from "~/components/HomeHeader";
import DeliveryRushGame from "~/components/DeliveryRush/DeliveryRushGame";
import { ShareModal } from "~/components/share/ShareModal";
import "./deliveryrush.css";

export const Route = createFileRoute("/deliveryrush")({
  head: () => {
    const bcp = getBcp47(i18n.language);
    const pageUrl = BASE_URL + withLangPrefix(currentLang(), "/deliveryrush");
    const faqs = Array.from({ length: 6 }, (_, i) => ({
      name: i18n.t(`deliveryrush.faq${i + 1}.q`),
      text: i18n.t(`deliveryrush.faq${i + 1}.a`),
    }));
    return {
      links: [
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Mochiy+Pop+One&family=M+PLUS+Rounded+1c:wght@700;900&display=swap",
        },
      ],
      meta: [
        { title: i18n.t("deliveryrush.title") },
        { name: "description", content: i18n.t("deliveryrush.desc") },
        { name: "keywords", content: i18n.t("deliveryrush.keywords") },
        { name: "robots", content: "index, follow" },
        { property: "og:type", content: "website" },
        { property: "og:title", content: i18n.t("deliveryrush.title") },
        { property: "og:description", content: i18n.t("deliveryrush.desc") },
        { property: "og:image", content: DEFAULT_OG_IMAGE },
        { property: "og:site_name", content: "100mini" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: i18n.t("deliveryrush.title") },
        { name: "twitter:description", content: i18n.t("deliveryrush.desc") },
        { name: "twitter:image", content: DEFAULT_OG_IMAGE },
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: i18n.t("deliveryrush.seo.heading"),
            url: pageUrl,
            description: i18n.t("deliveryrush.desc"),
            applicationCategory: "GameApplication",
            operatingSystem: "All",
            browserRequirements: "Requires JavaScript and WebGL",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            featureList: [
              i18n.t("deliveryrush.feature1"),
              i18n.t("deliveryrush.feature2"),
              i18n.t("deliveryrush.feature3"),
              i18n.t("deliveryrush.feature4"),
            ],
            author: { "@type": "Organization", name: "100mini", url: "https://100mini.com" },
            inLanguage: bcp,
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
  component: DeliveryRushPage,
});

function DeliveryRushPage() {
  const { t } = useTranslation();
  const gameRef = useRef<HTMLDivElement>(null);
  const [isFull, setIsFull] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  // 跟踪全屏状态（含用户按 ESC 退出的情况）
  useEffect(() => {
    const onChange = () => setIsFull(document.fullscreenElement === gameRef.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleFullscreen = async () => {
    const el = gameRef.current;
    if (!el) return;
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else if (el.requestFullscreen) {
        await el.requestFullscreen();
      } else {
        // 旧版 Safari 前缀 API
        (el as HTMLElement & { webkitRequestFullscreen?: () => void }).webkitRequestFullscreen?.();
      }
    } catch {
      // 用户拒绝或环境不支持（如 iOS Safari）时静默忽略
    }
  };

  const guideSteps = [
    t("deliveryrush.guide.step1"),
    t("deliveryrush.guide.step2"),
    t("deliveryrush.guide.step3"),
    t("deliveryrush.guide.step4"),
    t("deliveryrush.guide.step5"),
    t("deliveryrush.guide.step6"),
  ];
  const faqs = Array.from({ length: 6 }, (_, i) => ({
    name: t(`deliveryrush.faq${i + 1}.q`),
    text: t(`deliveryrush.faq${i + 1}.a`),
  }));
  return (
    <div className="flex min-h-screen flex-col">
      <AppNav />
      <main className="flex-1">
        <section className="relative overflow-hidden bg-gradient-to-b from-[#58b8f5]/10 via-[#58b8f5]/[0.02] to-background dark:from-[#58b8f5]/10 dark:via-[#58b8f5]/[0.02] dark:to-background pb-6 pt-6 sm:pt-10">
          <div className="mx-auto w-full max-w-4xl px-4">
            <div ref={gameRef} id="dr-game" className="relative h-[min(78vh,760px)] min-h-[480px] overflow-hidden rounded-3xl border-2 border-border shadow-lg">
              <DeliveryRushGame />
            </div>
            <div className="mt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShareOpen(true)}
                aria-label={t("deliveryrush.share.button")}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <Share2 className="size-4" />
                {t("deliveryrush.share.button")}
              </button>
              <button
                type="button"
                onClick={toggleFullscreen}
                aria-label={isFull ? t("deliveryrush.fullscreenExit") : t("deliveryrush.fullscreen")}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                {isFull ? <Minimize className="size-4" /> : <Maximize className="size-4" />}
                {isFull ? t("deliveryrush.fullscreenExit") : t("deliveryrush.fullscreen")}
              </button>
            </div>
            <ShareModal
              open={shareOpen}
              onOpenChange={setShareOpen}
              url={BASE_URL + withLangPrefix(currentLang(), "/deliveryrush")}
              text={t("deliveryrush.share.title")}
              title={t("deliveryrush.share.title")}
              subtitle={t("deliveryrush.share.subtitle")}
              fileName="deliveryrush.png"
            />
          </div>
        </section>
        <section className="mx-auto w-full max-w-3xl px-4 pb-20 pt-12">
          <h2 className="text-center text-2xl font-bold tracking-tight text-foreground">{t("deliveryrush.guide")}</h2>
          <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <h3 className="text-lg font-bold text-primary">{t("deliveryrush.guide.what")}</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{t("deliveryrush.guide.what.desc")}</p>
            <ol className="mt-6 list-decimal space-y-2.5 pl-5">
              {guideSteps.map((step) => (
                <li key={step} className="text-[15px] leading-relaxed text-muted-foreground">{step}</li>
              ))}
            </ol>
            <p className="mt-6 text-center text-sm italic text-muted-foreground">{t("deliveryrush.guide.tip")}</p>
          </div>
        </section>
        <section className="mx-auto w-full max-w-3xl px-4 pb-20">
          <h2 className="text-center text-2xl font-bold tracking-tight text-foreground">{t("deliveryrush.faq")}</h2>
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
