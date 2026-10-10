import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Maximize, Minimize, Share2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import i18n, { getBcp47 } from "~/lib/i18n";
import { withLangPrefix, currentLang, BASE_URL } from "~/lib/seo";
import { AppNav } from "~/components/HomeHeader";
import EnsoGame from "~/components/Enso/EnsoGame";
import { ShareModal } from "~/components/share/ShareModal";
import "./enso.css";

// 页面专属社交分享卡图（og:image / twitter:image），不用站点默认图
const OG_IMAGE = BASE_URL + "/og-enso.jpg";

export const Route = createFileRoute("/enso")({
  head: () => {
    const bcp = getBcp47(i18n.language);
    const pageUrl = BASE_URL + withLangPrefix(currentLang(), "/enso");
    const faqs = Array.from({ length: 7 }, (_, i) => ({
      name: i18n.t(`enso.faq${i + 1}.q`),
      text: i18n.t(`enso.faq${i + 1}.a`),
    }));
    return {
      links: [
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Shippori+Mincho+B1:wght@700;800&display=swap",
        },
      ],
      meta: [
        { title: i18n.t("enso.title") },
        { name: "description", content: i18n.t("enso.desc") },
        { name: "keywords", content: i18n.t("enso.keywords") },
        { name: "robots", content: "index, follow" },
        { property: "og:type", content: "website" },
        { property: "og:title", content: i18n.t("enso.title") },
        { property: "og:description", content: i18n.t("enso.desc") },
        { property: "og:image", content: OG_IMAGE },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { property: "og:site_name", content: "100mini" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: i18n.t("enso.title") },
        { name: "twitter:description", content: i18n.t("enso.desc") },
        { name: "twitter:image", content: OG_IMAGE },
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: i18n.t("enso.seo.heading"),
            url: pageUrl,
            description: i18n.t("enso.desc"),
            applicationCategory: "GameApplication",
            operatingSystem: "All",
            browserRequirements: "Requires JavaScript",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            featureList: [
              i18n.t("enso.feature1"),
              i18n.t("enso.feature2"),
              i18n.t("enso.feature3"),
              i18n.t("enso.feature4"),
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
  component: EnsoPage,
});

function EnsoPage() {
  const { t } = useTranslation();
  const gameRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
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
    t("enso.guide.step1"),
    t("enso.guide.step2"),
    t("enso.guide.step3"),
    t("enso.guide.step4"),
    t("enso.guide.step5"),
  ];
  const faqs = Array.from({ length: 7 }, (_, i) => ({
    name: t(`enso.faq${i + 1}.q`),
    text: t(`enso.faq${i + 1}.a`),
  }));
  return (
    <div className="flex min-h-screen flex-col">
      <AppNav />
      <main className="flex-1">
        <section className="relative overflow-hidden pb-6 pt-6 sm:pt-10">
          <div className="mx-auto w-full max-w-4xl px-4">
            <div ref={gameRef} id="enso-game" className="relative h-[min(78vh,760px)] min-h-[520px] overflow-hidden rounded-xl border-2 border-[#d8cdb4] shadow-lg">
              <EnsoGame canvasRef={canvasRef} />
            </div>
            <div className="mt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShareOpen(true)}
                aria-label={t("enso.share.button")}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#d8cdb4] bg-card px-3 py-1.5 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <Share2 className="size-4" />
                {t("enso.share.button")}
              </button>
              <button
                type="button"
                onClick={toggleFullscreen}
                aria-label={isFull ? t("enso.fullscreenExit") : t("enso.fullscreen")}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#d8cdb4] bg-card px-3 py-1.5 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                {isFull ? <Minimize className="size-4" /> : <Maximize className="size-4" />}
                {isFull ? t("enso.fullscreenExit") : t("enso.fullscreen")}
              </button>
            </div>
            <ShareModal
              open={shareOpen}
              onOpenChange={setShareOpen}
              url={BASE_URL + withLangPrefix(currentLang(), "/enso")}
              text={t("enso.share.title")}
              title={t("enso.share.title")}
              subtitle={t("enso.share.subtitle")}
              captureRef={canvasRef}
              fileName="enso.png"
            />
          </div>
        </section>
        <section className="mx-auto w-full max-w-3xl px-4 pb-20 pt-12">
          <h2 className="text-center text-2xl font-bold tracking-tight text-foreground">{t("enso.guide")}</h2>
          <p className="mx-auto mt-2 max-w-2xl text-center text-[15px] leading-relaxed text-muted-foreground">{t("enso.tagline")}</p>
          <div className="mt-8 rounded-2xl border border-[#d8cdb4] bg-card p-6 shadow-sm sm:p-8">
            <h3 className="text-lg font-bold text-primary">{t("enso.guide.what")}</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{t("enso.guide.what.desc")}</p>
            <ol className="mt-6 list-decimal space-y-2.5 pl-5">
              {guideSteps.map((step) => (
                <li key={step} className="text-[15px] leading-relaxed text-muted-foreground">{step}</li>
              ))}
            </ol>
            <p className="mt-6 text-center text-sm italic text-muted-foreground">{t("enso.guide.tip")}</p>
          </div>
        </section>
        <section className="mx-auto w-full max-w-3xl px-4 pb-20">
          <h2 className="text-center text-2xl font-bold tracking-tight text-foreground">{t("enso.faq")}</h2>
          <div className="mt-8 rounded-2xl border border-[#d8cdb4] bg-card px-6 shadow-sm">
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
    <div className="border-b border-[#d8cdb4] last:border-b-0">
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
