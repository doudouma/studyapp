import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Maximize, Minimize, Share2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import i18n, { getBcp47 } from "~/lib/i18n";
import { withLangPrefix, currentLang, BASE_URL } from "~/lib/seo";
import { AppNav } from "~/components/HomeHeader";
import { AppFooter } from "~/components/AppFooter";
import OutbreakGame from "~/components/Outbreak/OutbreakGame";
import { ShareModal } from "~/components/share/ShareModal";
import "./outbreak.css";

// 页面专属社交分享卡图（og:image / twitter:image），不用站点默认图
const OG_IMAGE = BASE_URL + "/og-outbreak.jpg";

export const Route = createFileRoute("/outbreak")({
  head: () => {
    const bcp = getBcp47(i18n.language);
    const pageUrl = BASE_URL + withLangPrefix(currentLang(), "/outbreak");
    const faqs = Array.from({ length: 2 }, (_, i) => ({
      name: i18n.t(`outbreak.faq${i + 1}.q`),
      text: i18n.t(`outbreak.faq${i + 1}.a`),
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
        { title: i18n.t("outbreak.title") },
        { name: "description", content: i18n.t("outbreak.desc") },
        { name: "keywords", content: i18n.t("outbreak.keywords") },
        { name: "robots", content: "index, follow" },
        { property: "og:type", content: "website" },
        { property: "og:title", content: i18n.t("outbreak.title") },
        { property: "og:description", content: i18n.t("outbreak.desc") },
        { property: "og:image", content: OG_IMAGE },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { property: "og:site_name", content: "100mini" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: i18n.t("outbreak.title") },
        { name: "twitter:description", content: i18n.t("outbreak.desc") },
        { name: "twitter:image", content: OG_IMAGE },
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: i18n.t("outbreak.heading"),
            url: pageUrl,
            description: i18n.t("outbreak.desc"),
            applicationCategory: "GameApplication",
            operatingSystem: "All",
            browserRequirements: "Requires JavaScript and WebGL",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            featureList: [
              i18n.t("outbreak.how.1"),
              i18n.t("outbreak.how.2"),
              i18n.t("outbreak.how.3"),
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
  component: OutbreakPage,
});

function OutbreakPage() {
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

  const guideSteps = [t("outbreak.how.1"), t("outbreak.how.2"), t("outbreak.how.3")];
  const faqs = Array.from({ length: 2 }, (_, i) => ({
    name: t(`outbreak.faq${i + 1}.q`),
    text: t(`outbreak.faq${i + 1}.a`),
  }));
  return (
    <div className="flex min-h-screen flex-col">
      <AppNav />
      <main className="flex-1">
        <section className="relative overflow-hidden bg-gradient-to-b from-[#ff2e4d]/10 via-[#ff2e4d]/[0.02] to-background dark:from-[#ff2e4d]/10 dark:via-[#ff2e4d]/[0.02] dark:to-background pb-6 pt-6 sm:pt-10">
          <div className="mx-auto w-full max-w-4xl px-4">
            <div ref={gameRef} id="outbreak-game" className="relative h-[min(78vh,760px)] min-h-[520px] overflow-hidden rounded-xl border-2 border-border shadow-lg">
              <OutbreakGame canvasRef={canvasRef} />
            </div>
            <div className="mt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShareOpen(true)}
                aria-label={t("outbreak.share.button")}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <Share2 className="size-4" />
                {t("outbreak.share.button")}
              </button>
              <button
                type="button"
                onClick={toggleFullscreen}
                aria-label={isFull ? t("outbreak.fullscreenExit") : t("outbreak.fullscreen")}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                {isFull ? <Minimize className="size-4" /> : <Maximize className="size-4" />}
                {isFull ? t("outbreak.fullscreenExit") : t("outbreak.fullscreen")}
              </button>
            </div>
            <ShareModal
              open={shareOpen}
              onOpenChange={setShareOpen}
              url={BASE_URL + withLangPrefix(currentLang(), "/outbreak")}
              text={t("outbreak.share.title")}
              title={t("outbreak.share.title")}
              subtitle={t("outbreak.share.subtitle")}
              captureRef={canvasRef}
              fileName="outbreak.png"
            />
          </div>
        </section>
        <section className="mx-auto w-full max-w-3xl px-4 pb-20 pt-12">
          <h2 className="text-center text-2xl font-bold tracking-tight text-foreground">{t("outbreak.how.title")}</h2>
          <p className="mx-auto mt-2 max-w-2xl text-center text-[15px] leading-relaxed text-muted-foreground">{t("outbreak.desc")}</p>
          <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <ol className="list-decimal space-y-2.5 pl-5">
              {guideSteps.map((step) => (
                <li key={step} className="text-[15px] leading-relaxed text-muted-foreground">{step}</li>
              ))}
            </ol>
          </div>
        </section>
        <section className="mx-auto w-full max-w-3xl px-4 pb-20">
          <h2 className="text-center text-2xl font-bold tracking-tight text-foreground">{t("outbreak.faq")}</h2>
          <div className="mt-8 rounded-2xl border border-border bg-card px-6 shadow-sm">
            {faqs.map((faq) => (
              <FaqItem key={faq.name} name={faq.name} text={faq.text} />
            ))}
          </div>
        </section>
      </main>
      <AppFooter />
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
