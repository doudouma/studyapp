import { createFileRoute } from "@tanstack/react-router";
import { AppFooter } from "~/components/AppFooter";
import { AppNav } from "~/components/HomeHeader";
import i18n from "~/lib/i18n";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/cookie")({
  head: () => ({
    meta: [
      { title: i18n.t("cookie.title") },
      { name: "description", content: i18n.t("cookie.desc") },
    ],
  }),
  component: CookiePage,
});

function CookiePage() {
  const { t } = useTranslation();
  const sections = [
    { title: t("cookie.section1Title"), body: t("cookie.section1Body") },
    { title: t("cookie.section2Title"), body: t("cookie.section2Body") },
    { title: t("cookie.section3Title"), body: t("cookie.section3Body") },
    { title: t("cookie.section4Title"), body: t("cookie.section4Body") },
    { title: t("cookie.section5Title"), body: t("cookie.section5Body") },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <AppNav />
      <main className="flex-1 mx-auto max-w-3xl w-full px-6 py-12 md:py-16">
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">{t("cookie.heading")}</h1>
        <p className="text-sm text-muted-foreground mb-8">{t("cookie.lastUpdated")}</p>
        <p className="text-muted-foreground mb-8 leading-relaxed">{t("cookie.intro")}</p>
        <div className="space-y-8">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-lg font-semibold text-foreground mb-2">{section.title}</h2>
              <p className="text-muted-foreground leading-relaxed">{section.body}</p>
            </section>
          ))}
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
