import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  ShieldCheck, ScanFace, Ruler, Printer, ChevronDown,
  CircleAlert, Globe, Lock, Eye, FileDown, Scissors, BookOpen, Lightbulb,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { AppNav } from "~/components/HomeHeader";
import { AppFooter } from "~/components/AppFooter";
import { IdPhotoWorkbench } from "~/components/idphoto/IdPhotoWorkbench";
import i18n, { getBcp47 } from "~/lib/i18n";
import { withLangPrefix, currentLang } from "~/lib/seo";

export const Route = createFileRoute("/idphoto")({
  head: () => {
    const faqs = Array.from({ length: 9 }, (_, i) => ({
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

const PAIN_ICONS = [CircleAlert, Eye, ShieldCheck, FileDown, Globe];
const PAIN_COLORS = [
  "bg-red-500/10 text-red-600 dark:text-red-400",
  "bg-red-500/10 text-red-600 dark:text-red-400",
  "bg-red-500/10 text-red-600 dark:text-red-400",
  "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  "bg-blue-500/10 text-blue-600 dark:text-blue-400",
];
const PAIN_BADGES = [
  { key: "pain.bad", cls: "bg-red-500" },
  { key: "pain.bad", cls: "bg-red-500" },
  { key: "pain.bad", cls: "bg-red-500" },
  { key: "pain.mid", cls: "bg-amber-500" },
  { key: "pain.low", cls: "bg-blue-500" },
];

const FEAT_ICONS = [Lock, Eye, ShieldCheck, Globe, FileDown, Scissors, Printer, Lightbulb];
const FEAT_COLORS = [
  "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  "bg-pink-500/10 text-pink-600 dark:text-pink-400",
  "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  "bg-teal-500/10 text-teal-600 dark:text-teal-400",
];

function IdPhotoPage() {
  const { t } = useTranslation();

  const pains = Array.from({ length: 5 }, (_, i) => ({
    icon: PAIN_ICONS[i],
    color: PAIN_COLORS[i],
    badge: PAIN_BADGES[i],
    hd: t(`idphoto.pain.hd${i + 1}`),
    desc: t(`idphoto.pain.desc${i + 1}`),
  }));

  const features = Array.from({ length: 8 }, (_, i) => ({
    icon: FEAT_ICONS[i],
    color: FEAT_COLORS[i],
    title: t(`idphoto.feature${i + 1}.title`),
    desc: t(`idphoto.feature${i + 1}.desc`),
    pain: t(`idphoto.feature${i + 1}.pain`),
  }));

  const spotlight = [
    t("idphoto.spotlight.list1"),
    t("idphoto.spotlight.list2"),
    t("idphoto.spotlight.list3"),
  ];

  const faqs = Array.from({ length: 9 }, (_, i) => ({
    q: t(`idphoto.faq${i + 1}.q`),
    a: t(`idphoto.faq${i + 1}.a`),
  }));

  return (
    <div className="flex min-h-screen flex-col">
      <AppNav />
      <main className="flex-1">
        <IdPhotoWorkbench />

        {/* 痛点 */}
        <section className="mx-auto max-w-5xl px-6 pt-14">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            {t("idphoto.pain")}
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {pains.map((p, i) => {
              const Icon = p.icon;
              return (
                <div
                  key={i}
                  className="rounded-2xl border border-border/70 bg-card p-5"
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${p.color}`}>
                      <Icon className="size-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <span>{p.hd}</span>
                        <span className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold text-white ${p.badge.cls}`}>
                          {t(`idphoto.${p.badge.key}`)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">{p.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* 产品介绍 */}
        <section className="mx-auto max-w-5xl px-6 pt-14">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            {t("idphoto.des.title")}
          </h2>
          <div className="mt-4 space-y-3">
            <p className="text-[15px] leading-relaxed text-foreground">{t("idphoto.des.text")}</p>
            <p className="text-[14px] leading-relaxed text-muted-foreground">{t("idphoto.des.intro")}</p>
          </div>
        </section>

        {/* 核心特点 */}
        <section className="mx-auto max-w-5xl px-6 pt-14">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            {t("idphoto.features")}
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="rounded-2xl border border-border/70 bg-card p-5">
                  <div className="flex items-start gap-3">
                    <div className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${f.color}`}>
                      <Icon className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-foreground">{f.title}</h3>
                      <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{f.desc}</p>
                      <span className="mt-2 inline-block rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary dark:text-[#4edea3]">
                        {f.pain}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 亮点深挖：合规检测 */}
        <section className="mx-auto max-w-5xl px-6 pt-14">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            {t("idphoto.spotlight.title")}
          </h2>
          <div className="mt-4 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/[0.02] p-6">
            <p className="text-[15px] font-medium text-foreground">{t("idphoto.spotlight.lead")}</p>
            <ul className="mt-4 space-y-3">
              {spotlight.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-[14px] leading-relaxed text-muted-foreground">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <ShieldCheck className="size-3" />
                  </span>
                  <span dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.*?)\*\*/g, '<b class="font-semibold text-foreground">$1</b>') }} />
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 国际规格一览 */}
        <section className="mx-auto max-w-5xl px-6 pt-14">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            {t("idphoto.spec.title")}
          </h2>
          <div className="mt-4 rounded-2xl border border-border/70 bg-card p-5">
            <p className="whitespace-pre-line text-[13.5px] leading-relaxed text-muted-foreground">
              {t("idphoto.spec.note")}
            </p>
          </div>
        </section>

        {/* 常见问题 */}
        <section className="mx-auto max-w-5xl px-6 pt-14">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            {t("idphoto.faq")}
          </h2>
          <div className="mt-4 rounded-2xl border border-border/70 bg-card px-6 shadow-sm">
            {faqs.map((faq) => (
              <FaqItem key={faq.q} name={faq.q} text={faq.a} />
            ))}
          </div>
        </section>

        {/* 对比表 */}
        <section className="mx-auto max-w-5xl px-6 pt-14">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            {t("idphoto.vs.title")}
          </h2>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-border/70 bg-card">
            <table className="w-full text-[13.5px]">
              <thead>
                <tr className="border-b border-border/60">
                  <th className="px-4 py-3 text-left font-semibold text-foreground">{t("idphoto.vs.th1")}</th>
                  <th className="px-4 py-3 text-left font-semibold text-primary dark:text-[#4edea3]">{t("idphoto.vs.th2")}</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">{t("idphoto.vs.th3")}</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5, 6, 7].map((r) => (
                  <tr key={r} className="border-b border-border/30 last:border-b-0">
                    <td className="px-4 py-3 text-foreground">{t(`idphoto.vs.r${r}c1`)}</td>
                    <td className="px-4 py-3 font-semibold text-emerald-600 dark:text-emerald-400">{t(`idphoto.vs.r${r}c2`)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{t(`idphoto.vs.r${r}c3`)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-5xl px-6 pt-14 pb-16">
          <div className="rounded-2xl bg-foreground p-7 text-center">
            <p className="text-lg font-bold text-white">{t("idphoto.cta.title")}</p>
            <p className="mt-2 text-sm text-white/70">{t("idphoto.cta.tags")}</p>
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
