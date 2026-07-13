import { useState } from "react";
import { FileText, Upload, Share2, ChevronDown, FileImage, ImageDown, TestTube, Tag } from "lucide-react";
import { useTranslation } from "react-i18next";

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border">
      <button
        className="flex w-full items-center justify-between gap-4 py-4 text-left text-sm font-medium transition-colors hover:text-foreground/80 cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <span>{q}</span>
        <ChevronDown
          className={`size-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && (
        <div className="pb-4 text-sm text-muted-foreground leading-relaxed">
          {a}
        </div>
      )}
    </div>
  );
}

export function GuideSection() {
  const { t } = useTranslation();

  const steps = [
    {
      icon: FileText,
      title: t("components.guide.step1.title"),
      description: t("components.guide.step1.desc"),
    },
    {
      icon: Upload,
      title: t("components.guide.step2.title"),
      description: t("components.guide.step2.desc"),
    },
    {
      icon: Share2,
      title: t("components.guide.step3.title"),
      description: t("components.guide.step3.desc"),
    },
  ];

  const faqs = [
    {
      q: t("components.guide.faq1.q"),
      a: t("components.guide.faq1.a"),
    },
    {
      q: t("components.guide.faq2.q"),
      a: t("components.guide.faq2.a"),
    },
    {
      q: t("components.guide.faq3.q"),
      a: t("components.guide.faq3.a"),
    },
    {
      q: t("components.guide.faq4.q"),
      a: t("components.guide.faq4.a"),
    },
    {
      q: t("components.guide.faq5.q"),
      a: t("components.guide.faq5.a"),
    },
  ];

  const tips = [
    {
      icon: FileImage,
      title: t("components.guide.tip1.title"),
      description: t("components.guide.tip1.desc"),
    },
    {
      icon: ImageDown,
      title: t("components.guide.tip2.title"),
      description: t("components.guide.tip2.desc"),
    },
    {
      icon: TestTube,
      title: t("components.guide.tip3.title"),
      description: t("components.guide.tip3.desc"),
    },
    {
      icon: Tag,
      title: t("components.guide.tip4.title"),
      description: t("components.guide.tip4.desc"),
    },
  ];

  return (
    <>
      {/* Quick Start */}
      <section className="w-full py-20">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="mb-12 text-center text-2xl font-bold tracking-tight md:text-3xl">
            {t("components.guide.heading")}
          </h2>
          <div className="grid gap-10 md:grid-cols-3">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="relative flex flex-col items-center text-center">
                  <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-[#006c49]/10 text-[#006c49] dark:bg-[#4edea3]/10 dark:text-[#4edea3]">
                    <Icon className="size-7" />
                  </div>
                  <h4 className="text-lg font-semibold">{step.title}</h4>
                  <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed max-w-xs">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="w-full bg-[#eff4ff] dark:bg-[#1e314a] py-20">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="mb-12 text-center text-2xl font-bold tracking-tight md:text-3xl">
            {t("components.guide.faq")}
          </h2>
          <div className="rounded-2xl border border-[#d3e4fe] dark:border-[#3c4a42] bg-white dark:bg-[#15243b] px-6">
            {faqs.map((faq) => (
              <FaqItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* Pro Tips */}
      <section className="w-full py-20">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="mb-12 text-center text-2xl font-bold tracking-tight md:text-3xl">
            {t("components.guide.tips")}
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {tips.map((tip) => {
              const Icon = tip.icon;
              return (
                <div
                  key={tip.title}
                  className="flex flex-col items-center rounded-2xl border border-[#d3e4fe]/60 dark:border-[#3c4a42] bg-white dark:bg-[#15243b] p-8 text-center shadow-sm"
                >
                  <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-[#006c49]/10 text-[#006c49] dark:bg-[#4edea3]/10 dark:text-[#4edea3]">
                    <Icon className="size-6" />
                  </div>
                  <h4 className="text-base font-semibold">{tip.title}</h4>
                  <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                    {tip.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
