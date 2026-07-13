import { createFileRoute } from "@tanstack/react-router";
import { AppFooter } from "~/components/AppFooter";
import { AppNav } from "~/components/HomeHeader";
import i18n from "~/lib/i18n";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    title: i18n.t("privacy.title"),
    meta: [
      { name: "description", content: i18n.t("privacy.desc") },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  const { t } = useTranslation();
  const sections = [
    { title: t("privacy.section1Title"), body: t("privacy.section1Body") },
    { title: t("privacy.section2Title"), body: t("privacy.section2Body") },
    { title: t("privacy.section3Title"), body: t("privacy.section3Body") },
    { title: t("privacy.section4Title"), body: t("privacy.section4Body") },
    { title: t("privacy.section5Title"), body: t("privacy.section5Body") },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <AppNav />
      <main className="flex-1 mx-auto max-w-3xl w-full px-6 py-12 md:py-16">
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">{t("privacy.heading")}</h1>
        <p className="text-sm text-muted-foreground mb-8">{t("privacy.lastUpdated")}</p>
        <p className="text-muted-foreground mb-8 leading-relaxed">{t("privacy.intro")}</p>
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
