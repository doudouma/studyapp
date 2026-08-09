import { createFileRoute, Link } from "@tanstack/react-router";
import { Timer, Music, FileText, FileCode2, ArrowRight, Sparkles } from "lucide-react";
import { AppNav } from "~/components/HomeHeader";
import { AppFooter } from "~/components/AppFooter";
import { useTranslation } from "react-i18next";
import i18n from "~/lib/i18n";

export const Route = createFileRoute("/freetool")({
  head: () => {
    const lang = i18n.language?.startsWith("zh") ? "zh" : "en";
    const pageUrl = "https://100mini.com/freetool";
    const ogImage = "https://100mini.com/spritesheet2/frame_38.webp";
    return {
      meta: [
        { title: i18n.t("freetool.title") },
        { name: "description", content: i18n.t("freetool.desc") },
        { name: "keywords", content: i18n.t("freetool.keywords") },
        { name: "robots", content: "index, follow" },
        { property: "og:type", content: "website" },
        { property: "og:url", content: pageUrl },
        { property: "og:title", content: i18n.t("freetool.title") },
        { property: "og:description", content: i18n.t("freetool.desc") },
        { property: "og:image", content: ogImage },
        { property: "og:locale", content: lang === "zh" ? "zh_CN" : "en_US" },
        { property: "og:site_name", content: "100mini" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: i18n.t("freetool.title") },
        { name: "twitter:description", content: i18n.t("freetool.desc") },
        { name: "twitter:image", content: ogImage },
      ],
      links: [
        { rel: "canonical", href: pageUrl },
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: i18n.t("freetool.heading"),
            url: pageUrl,
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: i18n.t("freetool.item.pomodoro.title"),
                url: "https://100mini.com/pomodoro",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: i18n.t("freetool.item.rhythm.title"),
                url: "https://100mini.com/rhythm",
              },
              {
                "@type": "ListItem",
                position: 3,
                name: i18n.t("freetool.item.md2html.title"),
                url: "https://100mini.com/md2html",
              },
              {
                "@type": "ListItem",
                position: 4,
                name: i18n.t("freetool.item.any2md.title"),
                url: "https://100mini.com/any2md",
              },
            ],
          }),
        },
      ],
    };
  },
  component: FreeToolPage,
});

function FreeToolPage() {
  const { t } = useTranslation();

  const tools = [
    {
      href: "/pomodoro" as const,
      icon: Timer,
      title: t("freetool.item.pomodoro.title"),
      desc: t("freetool.item.pomodoro.desc"),
    },
    {
      href: "/rhythm" as const,
      icon: Music,
      title: t("freetool.item.rhythm.title"),
      desc: t("freetool.item.rhythm.desc"),
    },
    {
      href: "/md2html" as const,
      icon: FileText,
      title: t("freetool.item.md2html.title"),
      desc: t("freetool.item.md2html.desc"),
    },
    {
      href: "/any2md" as const,
      icon: FileCode2,
      title: t("freetool.item.any2md.title"),
      desc: t("freetool.item.any2md.desc"),
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <AppNav />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-[#006c49]/5 via-[#006c49]/[0.02] to-background dark:from-[#4edea3]/5 dark:via-[#4edea3]/[0.02] dark:to-background py-16 sm:py-20">
          <div className="mx-auto max-w-5xl px-6 text-center">
            <div className="mx-auto mb-5 inline-flex items-center gap-1.5 rounded-full border border-[#006c49]/20 bg-[#006c49]/5 px-3 py-1 text-xs font-medium text-[#006c49] dark:border-[#4edea3]/20 dark:bg-[#4edea3]/10 dark:text-[#4edea3]">
              <Sparkles className="size-3.5" />
              {t("freetool.more")}
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {t("freetool.heading")}
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              {t("freetool.subheading")}
            </p>
          </div>
        </section>

        {/* Tool cards grid */}
        <section className="mx-auto max-w-5xl px-6 py-12 sm:py-16">
          <div className="grid gap-6 sm:grid-cols-2">
            {tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link
                  key={tool.href}
                  to={tool.href}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#d3e4fe]/70 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#006c49]/40 hover:shadow-md dark:border-[#3c4a42] dark:bg-[#15243b] dark:hover:border-[#4edea3]/40 sm:p-7"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-[#006c49]/10 text-[#006c49] transition-colors group-hover:bg-[#006c49] group-hover:text-white dark:bg-[#4edea3]/10 dark:text-[#4edea3] dark:group-hover:bg-[#4edea3] dark:group-hover:text-[#002113]">
                      <Icon className="size-6" />
                    </div>
                    <ArrowRight className="size-5 text-muted-foreground/40 transition-all group-hover:translate-x-0.5 group-hover:text-[#006c49] dark:group-hover:text-[#4edea3]" />
                  </div>
                  <h2 className="mt-4 text-lg font-semibold text-foreground">{tool.title}</h2>
                  <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {tool.desc}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[#006c49] dark:text-[#4edea3]">
                    {t("freetool.cta")}
                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      </main>
      <AppFooter />
    </div>
  );
}
