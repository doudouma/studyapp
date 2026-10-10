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
    <div className="flex min-h-screen flex-col bg-[#f4f4f4]">
      <AppNav />
      <main className="flex-1 font-mono">
        {/* Hero */}
        <section className="bg-[#1a1c2c] px-4 py-12 md:px-8 md:py-20">
          <div className="mx-auto max-w-5xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 border-4 border-[#1a1c2c] bg-[#ffec27] px-4 py-1.5 text-sm font-bold text-[#1a1c2c] shadow-[4px_4px_0_#ff004d]">
              <Gamepad2 className="size-4" />
              {t("games.more")}
            </div>
            <h1 className="text-3xl font-bold uppercase tracking-wider text-[#ffec27] md:text-5xl">
              {t("games.heading")}
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base text-[#f4f4f4] md:text-lg">
              {t("games.subheading")}
            </p>
          </div>
        </section>

        {/* Game cards grid */}
        <section className="mx-auto max-w-5xl px-4 py-12 md:px-8 md:py-20">
          <div className="grid gap-6 sm:grid-cols-2">
            {games.map((game) => {
              const Icon = game.icon;
              return (
                <Link
                  key={game.href}
                  to={game.href}
                  className="group flex flex-col rounded-none border-4 border-[#1a1c2c] bg-white p-6 shadow-[4px_4px_0_#1a1c2c] transition-none hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0_#1a1c2c] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none focus:outline-none focus:shadow-[inset_0_0_0_3px_#29adff] motion-reduce:transform-none"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex size-12 items-center justify-center border-4 border-[#1a1c2c] bg-[#29adff] text-[#1a1c2c] transition-none group-hover:bg-[#ff004d] group-hover:text-[#ffec27]">
                      <Icon className="size-6" />
                    </div>
                    <ArrowRight className="size-5 text-[#1a1c2c] transition-none group-hover:translate-x-1" />
                  </div>
                  <h2 className="mt-4 text-lg font-bold uppercase tracking-wider text-[#1a1c2c] md:text-xl">
                    {game.title}
                  </h2>
                  <p className="mt-1.5 flex-1 text-sm leading-relaxed text-[#5f574f]">{game.desc}</p>
                  <span className="mt-4 inline-flex w-fit items-center gap-1 border-4 border-[#1a1c2c] bg-[#ffec27] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#1a1c2c] shadow-[2px_2px_0_#1a1c2c]">
                    {t("games.cta")}
                    <ArrowRight className="size-3.5" />
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
