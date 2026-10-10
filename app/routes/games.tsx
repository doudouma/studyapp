import { createFileRoute, Link } from "@tanstack/react-router";
import { Gamepad2, ArrowRight, Scissors, Truck } from "lucide-react";
import { AppNav } from "~/components/HomeHeader";
import { AppFooter } from "~/components/AppFooter";
import { useTranslation } from "react-i18next";
import i18n from "~/lib/i18n";
import { withLangPrefix, currentLang, BASE_URL, DEFAULT_OG_IMAGE } from "~/lib/seo";

export const Route = createFileRoute("/games")({
  head: () => {
    const pageUrl = BASE_URL + withLangPrefix(currentLang(), "/games");
    return {
      meta: [
        { title: i18n.t("games.title") },
        { name: "description", content: i18n.t("games.desc") },
        { name: "keywords", content: i18n.t("games.keywords") },
        { name: "robots", content: "index, follow" },
        { property: "og:type", content: "website" },
        { property: "og:title", content: i18n.t("games.title") },
        { property: "og:description", content: i18n.t("games.desc") },
        { property: "og:image", content: DEFAULT_OG_IMAGE },
        { property: "og:site_name", content: "100mini" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: i18n.t("games.title") },
        { name: "twitter:description", content: i18n.t("games.desc") },
        { name: "twitter:image", content: DEFAULT_OG_IMAGE },
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: i18n.t("games.heading"),
            url: pageUrl,
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: i18n.t("games.item.papercut.title"),
                url: "https://100mini.com/papercut",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: i18n.t("games.item.deliveryrush.title"),
                url: "https://100mini.com/deliveryrush",
              },
            ],
          }),
        },
      ],
    };
  },
  component: GamesPage,
});

function GamesPage() {
  const { t } = useTranslation();

  const games = [
    {
      href: "/papercut" as const,
      icon: Scissors,
      title: t("games.item.papercut.title"),
      desc: t("games.item.papercut.desc"),
    },
    {
      href: "/deliveryrush" as const,
      icon: Truck,
      title: t("games.item.deliveryrush.title"),
      desc: t("games.item.deliveryrush.desc"),
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <AppNav />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-[#006c49] dark:bg-[#0b1c30]">
          {/* 装饰：光晕 + 点阵纹理 */}
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <div className="absolute -left-24 -top-24 size-72 rounded-full bg-[#4edea3]/20 blur-3xl" />
            <div className="absolute -bottom-32 -right-24 size-80 rounded-full bg-white/10 blur-3xl" />
            <div
              className="absolute inset-0 opacity-[0.15]"
              style={{
                backgroundImage:
                  "radial-gradient(circle, #fff 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            />
          </div>
          <div className="relative mx-auto max-w-5xl px-6 py-20 text-center sm:py-28">
            <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
              <Gamepad2 className="size-4 text-[#4edea3]" />
              {t("games.more")}
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              {t("games.heading")}
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-[#cfe8dd] sm:text-lg">
              {t("games.subheading")}
            </p>
          </div>
        </section>

        {/* Game cards grid */}
        <section className="mx-auto max-w-5xl px-6 py-12 sm:py-16">
          <div className="grid gap-6 sm:grid-cols-2">
            {games.map((game) => {
              const Icon = game.icon;
              return (
                <Link
                  key={game.href}
                  to={game.href}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#d3e4fe]/70 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#006c49]/40 hover:shadow-md dark:border-[#3c4a42] dark:bg-[#15243b] dark:hover:border-[#4edea3]/40 sm:p-7"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-[#006c49]/10 text-[#006c49] transition-colors group-hover:bg-[#006c49] group-hover:text-white dark:bg-[#4edea3]/10 dark:text-[#4edea3] dark:group-hover:bg-[#4edea3] dark:group-hover:text-[#002113]">
                      <Icon className="size-6" />
                    </div>
                    <ArrowRight className="size-5 text-muted-foreground/40 transition-all group-hover:translate-x-0.5 group-hover:text-[#006c49] dark:group-hover:text-[#4edea3]" />
                  </div>
                  <h2 className="mt-4 text-lg font-semibold text-foreground">{game.title}</h2>
                  <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {game.desc}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[#006c49] dark:text-[#4edea3]">
                    {t("games.cta")}
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
