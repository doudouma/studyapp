import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck, ScanFace, Ruler, Printer, ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AppNav } from "~/components/HomeHeader";
import { AppFooter } from "~/components/AppFooter";
import { IdPhotoWorkbench } from "~/components/idphoto/IdPhotoWorkbench";
import i18n, { getBcp47 } from "~/lib/i18n";
import { withLangPrefix, currentLang } from "~/lib/seo";

export const Route = createFileRoute("/idphoto")({
  head: () => {
    const faqs = Array.from({ length: 6 }, (_, i) => ({
      name: i18n.t(`idphoto.faq${i + 1}.q`),
      text: i18n.t(`idphoto.faq${i + 1}.a`),
    }));
    return {
      meta: [
        { title: i18n.t("idphoto.title") },
        { name: "description", content: i18n.t("idphoto.desc") },
        { name: "keywords", content: i18n.t("idphoto.keywords") },
        { name: "robots", content: "index, follow" },
        { property: "og:type", content: "website" },
        { property: "og:title", content: i18n.t("idphoto.heading") },
        { property: "og:description", content: i18n.t("idphoto.desc") },
        { name: "twitter:card", content: "summary" },
        { name: "twitter:title", content: i18n.t("idphoto.heading") },
        { name: "twitter:description", content: i18n.t("idphoto.desc") },
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            inLanguage: getBcp47(i18n.language),
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
  component: IdPhotoPage,
});

function IdPhotoPage() {
  const { t } = useTranslation();

  const features = [
    { icon: ShieldCheck, title: t("idphoto.feature1.title"), desc: t("idphoto.feature1.desc") },
    { icon: ScanFace, title: t("idphoto.feature2.title"), desc: t("idphoto.feature2.desc") },
    { icon: Ruler, title: t("idphoto.feature3.title"), desc: t("idphoto.feature3.desc") },
    { icon: Printer, title: t("idphoto.feature4.title"), desc: t("idphoto.feature4.desc") },
  ];

  const faqs = Array.from({ length: 6 }, (_, i) => ({
    q: t(`idphoto.faq${i + 1}.q`),
    a: t(`idphoto.faq${i + 1}.a`),
  }));

  return (
    <div className="flex min-h-screen flex-col">
      <AppNav />
      <main className="flex-1">
        <section className="border-b border-border/60 bg-[#006c49] py-10 dark:bg-[#0b1c30]">
          <div className="mx-auto max-w-7xl px-4 text-center">
            <h1
              data-testid="idphoto-heading"
              className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl"
            >
              {i18n.t("idphoto.heading")}
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-white/80 sm:text-base">
              {i18n.t("idphoto.subheading")}
            </p>
          </div>
        </section>
        <IdPhotoWorkbench />

        {/* 描述 */}
        <section className="mx-auto max-w-5xl px-6 pb-4 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">{t("idphoto.des.title")}</h2>
          <p className="mx-auto mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            {t("idphoto.des.text")}
          </p>
        </section>

        {/* 特性 */}
        <section className="mx-auto max-w-5xl px-6 pt-10">
          <h2 className="text-center text-2xl font-bold tracking-tight text-foreground">{t("idphoto.features")}</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div key={f.title} className="rounded-2xl border border-border/70 bg-card p-5">
                <div className="flex size-9 items-center justify-center rounded-xl bg-[#006c49]/10 text-[#006c49] dark:bg-[#4edea3]/10 dark:text-[#4edea3]">
                  <f.icon className="size-4.5" />
                </div>
                <h3 className="mt-3 text-sm font-semibold text-foreground">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 常见问题 */}
        <section className="mx-auto max-w-5xl px-6 py-12">
          <h2 className="text-center text-2xl font-bold tracking-tight text-foreground">{t("idphoto.faq")}</h2>
          <div className="mt-6 rounded-2xl border border-border/70 bg-card px-6 shadow-sm">
            {faqs.map((faq) => (
              <FaqItem key={faq.q} name={faq.q} text={faq.a} />
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
    <div className="border-b border-border/60 last:border-b-0">
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
