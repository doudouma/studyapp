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
            mainEntity: lang === "zh" ? [
              {
                "@type": "Question",
                name: "什么是一首歌变成音游？",
                acceptedAnswer: { "@type": "Answer", text: "上传任意一首歌，AI 会自动分析鼓点，生成 4K 下落式谱面，你可以立刻在浏览器里用键盘或触屏游玩。" },
              },
              {
                "@type": "Question",
                name: "支持哪些音乐格式？",
                acceptedAnswer: { "@type": "Answer", text: "支持 MP3、WAV、OGG 和 M4A 格式，直接拖入或选择本地文件即可。" },
              },
              {
                "@type": "Question",
                name: "需要注册或付费吗？",
                acceptedAnswer: { "@type": "Answer", text: "完全免费，无需注册。你的音乐文件始终在本地浏览器中处理，不会上传到任何服务器。" },
              },
              {
                "@type": "Question",
                name: "怎么玩？",
                acceptedAnswer: { "@type": "Answer", text: "音符下落时用键盘 D F J K 四个键击中对应轨道，手机上直接点击四条轨道。长条按住不放，松手时机决定 PERFECT、GOOD 还是 MISS。" },
              },
              {
                "@type": "Question",
                name: "没有音乐可以试玩吗？",
                acceptedAnswer: { "@type": "Answer", text: "可以，页面内置了一段 Demo 节拍，无需任何音乐文件即可体验完整的谱面生成与玩法。" },
              },
            ] : [
              {
                "@type": "Question",
                name: "What is this song-to-rhythm-game generator?",
                acceptedAnswer: { "@type": "Answer", text: "Upload any song and AI auto-analyzes its beats to generate a 4K falling-note beatmap you can play instantly in your browser with keyboard or touch." },
              },
              {
                "@type": "Question",
                name: "Which audio formats are supported?",
                acceptedAnswer: { "@type": "Answer", text: "MP3, WAV, OGG and M4A are supported — just drag in or pick a local file." },
              },
              {
                "@type": "Question",
                name: "Do I need to register or pay?",
                acceptedAnswer: { "@type": "Answer", text: "It is completely free and requires no account. Your music file is processed entirely in your local browser and never uploaded to any server." },
              },
              {
                "@type": "Question",
                name: "How do I play?",
                acceptedAnswer: { "@type": "Answer", text: "Hit the D F J K keys as notes fall, or tap the four lanes on mobile. Hold long notes and release at the right moment to earn PERFECT, GOOD or MISS." },
              },
              {
                "@type": "Question",
                name: "Can I try it without a music file?",
                acceptedAnswer: { "@type": "Answer", text: "Yes — a built-in demo beat lets you experience the full chart generation and gameplay without any audio file." },
              },
            ],
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
