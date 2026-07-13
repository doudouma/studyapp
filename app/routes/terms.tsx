import { createFileRoute } from "@tanstack/react-router";
import { AppFooter } from "~/components/AppFooter";
import { AppNav } from "~/components/HomeHeader";
import i18n from "~/lib/i18n";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/terms")({
  head: () => ({
    title: i18n.t("terms.title"),
    meta: [
      { name: "description", content: i18n.t("terms.desc") },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  const { t } = useTranslation();
  const sections = [
    { title: t("terms.section1Title"), body: t("terms.section1Body") },
    { title: t("terms.section2Title"), body: t("terms.section2Body") },
    { title: t("terms.section3Title"), body: t("terms.section3Body") },
    { title: t("terms.section4Title"), body: t("terms.section4Body") },
    { title: t("terms.section5Title"), body: t("terms.section5Body") },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <AppNav />
      <main className="flex-1 mx-auto max-w-3xl w-full px-6 py-12 md:py-16">
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">{t("terms.heading")}</h1>
        <p className="text-sm text-muted-foreground mb-8">{t("terms.lastUpdated")}</p>
        <p className="text-muted-foreground mb-8 leading-relaxed">{t("terms.intro")}</p>
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
