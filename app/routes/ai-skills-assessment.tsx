import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Check, ClipboardCheck, Copy, Printer, RotateCcw, Sparkles } from "lucide-react";
import i18n from "~/lib/i18n";
import { BASE_URL, currentLang, withLangPrefix } from "~/lib/seo";
import { AppNav } from "~/components/HomeHeader";
import { AppFooter } from "~/components/AppFooter";
import { loadQuestions } from "@shared/questions";
import {
  ASSESSMENT_COPY,
  ASSESSMENT_LABELS,
  ASSESSMENT_LEVELS,
  ASSESSMENT_QUESTIONS,
  ASSESSMENT_SCALE,
} from "~/features/questions/assessment";

function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => String(vars[key] ?? ""));
}

function decodeHash(hash: string): number[] | null {
  const match = /(?:^|[#&])s=([0-3]{10})(?:&|$)/.exec(hash);
  if (!match) return null;
  return match[1].split("").map(Number);
}

export const Route = createFileRoute("/ai-skills-assessment")({
  loader: async () => {
    const lang = currentLang();
    const articles = await loadQuestions(lang);
    return {
      guides: articles.map((article) => ({
        slug: article.slug,
        title: article.title,
        summary: article.summary,
        locale: article.locale,
      })),
    };
  },
  head: () => {
    const lang = currentLang();
    const pageUrl = BASE_URL + withLangPrefix(lang, "/ai-skills-assessment");
    return {
      meta: [
        { title: i18n.t("aiAssessment.title") },
        { name: "description", content: i18n.t("aiAssessment.desc") },
        { name: "keywords", content: i18n.t("aiAssessment.keywords") },
        { name: "robots", content: "index, follow" },
        { property: "og:type", content: "website" },
        { property: "og:title", content: i18n.t("aiAssessment.title") },
        { property: "og:description", content: i18n.t("aiAssessment.desc") },
        { property: "og:url", content: pageUrl },
        { property: "og:site_name", content: "100mini" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: i18n.t("aiAssessment.title") },
        { name: "twitter:description", content: i18n.t("aiAssessment.desc") },
      ],
    };
  },
  component: AssessmentPage,
});

function AssessmentPage() {
  const { t } = useTranslation();
  const { guides } = Route.useLoaderData();
  const lang = currentLang() as keyof typeof ASSESSMENT_COPY;
  const copy = ASSESSMENT_COPY[lang] ?? ASSESSMENT_COPY.en;
  const questions = ASSESSMENT_QUESTIONS;

  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>(() => Array(questions.length).fill(-1));
  const [showResult, setShowResult] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const parsed = decodeHash(window.location.hash);
    if (parsed) {
      setAnswers(parsed);
      setStarted(true);
      setShowResult(true);
    }
  }, []);

  const result = useMemo(() => {
    if (answers.some((value) => value < 0)) return null;
    const total = answers.reduce((sum, value) => sum + value, 0);
    const score = Math.round((total / (questions.length * 3)) * 100);
    const level =
      ASSESSMENT_LEVELS.slice()
        .reverse()
        .find((item) => score >= item.min) ?? ASSESSMENT_LEVELS[0];

    const ranked = questions
      .map((question, index) => ({ question, value: answers[index] }))
      .sort((a, b) => a.value - b.value);
    const seen = new Set<string>();
    const recommendations: { question: (typeof questions)[number]; guide?: (typeof guides)[number] }[] = [];
    for (const item of ranked) {
      if (seen.has(item.question.guideSlug)) continue;
      seen.add(item.question.guideSlug);
      recommendations.push({
        question: item.question,
        guide: guides.find((guide) => guide.slug === item.question.guideSlug),
      });
      if (recommendations.length === 3) break;
    }

    return { score, level, recommendations, total };
  }, [answers, guides, questions]);

  const choose = (value: number) => {
    const next = answers.slice();
    next[step] = value;
    setAnswers(next);
    if (step < questions.length - 1) {
      setStep(step + 1);
      return;
    }
    if (next.every((item) => item >= 0)) {
      setShowResult(true);
      window.history.replaceState(null, "", `#s=${next.join("")}`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const restart = () => {
    setAnswers(Array(questions.length).fill(-1));
    setStep(0);
    setStarted(false);
    setShowResult(false);
    setCopied(false);
    window.history.replaceState(null, "", window.location.pathname);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const pageUrl = BASE_URL + withLangPrefix(lang, "/ai-skills-assessment");
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: copy.h1,
        description: copy.lede,
        url: pageUrl,
        applicationCategory: "EducationalApplication",
        operatingSystem: "Any",
        inLanguage: lang,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        isPartOf: { "@type": "WebSite", name: "100mini", url: BASE_URL },
      },
      {
        "@type": "FAQPage",
        mainEntity: copy.faq.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
      },
    ],
  };

  const current = questions[step];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <AppNav />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
          {!started && (
            <section className="text-center">
              <p className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
                <ClipboardCheck className="size-3.5" />
                {copy.kicker}
              </p>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                {copy.h1}
              </h1>
              <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
                {copy.lede}
              </p>
              <button
                type="button"
                onClick={() => {
                  setStarted(true);
                  setStep(0);
                }}
                className="mt-6 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                {copy.start}
              </button>
            </section>
          )}

          {started && !showResult && (
            <section className="rounded-2xl border border-border bg-card p-5 sm:p-7">
              <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground">
                <span>{fill(copy.progress, { current: step + 1, total: questions.length })}</span>
                <span>{ASSESSMENT_LABELS[current.id][lang]}</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${((step + 1) / questions.length) * 100}%` }}
                />
              </div>
              <p className="mt-5 text-lg font-semibold leading-relaxed text-foreground">
                {current.text[lang]}
              </p>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {ASSESSMENT_SCALE.map((label, value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => choose(value)}
                    className="rounded-xl border border-border px-4 py-3 text-left text-sm font-medium text-foreground transition-colors hover:border-primary/50 hover:bg-primary/5"
                  >
                    {label[lang]}
                  </button>
                ))}
              </div>
              {step > 0 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="mt-4 text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  {copy.back}
                </button>
              )}
            </section>
          )}

          {showResult && result && (
            <section>
              <div className="rounded-2xl border border-border bg-card p-5 sm:p-7">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
                  {copy.result}
                </p>
                <div className="mt-2 flex items-end gap-4">
                  <p className="text-5xl font-bold tracking-tight text-foreground">{result.score}</p>
                  <div className="pb-1">
                    <p className="text-sm font-semibold text-foreground">
                      {result.level.name[lang]}
                    </p>
                    <p className="text-[11px] text-muted-foreground">{copy.scoreLabel}</p>
                  </div>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {result.level.desc[lang]}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={copyLink}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90"
                  >
                    {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                    {copied ? copy.copied : copy.copy}
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted"
                  >
                    <Printer className="size-3.5" />
                    {copy.print}
                  </button>
                  <button
                    type="button"
                    onClick={restart}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
                  >
                    <RotateCcw className="size-3.5" />
                    {copy.restart}
                  </button>
                </div>
              </div>

              <section className="mt-5 rounded-xl border border-border bg-card p-4">
                <h2 className="text-base font-semibold text-foreground">{copy.breakdown}</h2>
                <ul className="mt-3 space-y-2">
                  {questions.map((question, index) => (
                    <li key={question.id}>
                      <div className="flex items-center justify-between gap-3 text-xs">
                        <span className="text-foreground">{ASSESSMENT_LABELS[question.id][lang]}</span>
                        <span className="tabular-nums text-muted-foreground">
                          {answers[index]}/3
                        </span>
                      </div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${(answers[index] / 3) * 100}%` }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="mt-5">
                <h2 className="text-base font-bold text-foreground">{copy.nextTitle}</h2>
                <p className="mt-1 text-xs text-muted-foreground">{copy.nextDesc}</p>
                <div className="mt-3 space-y-3">
                  {result.recommendations.map(({ question, guide }) => (
                    <article key={question.id} className="rounded-xl border border-border bg-card p-4">
                      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary">
                        {ASSESSMENT_LABELS[question.id][lang]}
                      </p>
                      <h3 className="mt-1 text-sm font-semibold text-foreground">
                        {guide?.title ?? question.text[lang]}
                      </h3>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        {question.action[lang]}
                      </p>
                      {guide ? (
                        <Link
                          to="/100-questions/$slug"
                          params={{ slug: guide.slug }}
                          className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                        >
                          {copy.readGuide} →
                        </Link>
                      ) : null}
                    </article>
                  ))}
                </div>
              </section>

              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  to="/host-single-html"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary/10"
                >
                  <Sparkles className="size-3.5" />
                  {copy.publishCta}
                </Link>
                <Link
                  to="/100-questions"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted"
                >
                  {copy.questionsCta}
                </Link>
              </div>
            </section>
          )}

          <section className="mt-10 border-t border-border pt-6">
            <h2 className="text-lg font-bold text-foreground">{copy.howTitle}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
              {copy.howText}
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-lg font-bold text-foreground">{copy.faqTitle}</h2>
            <div className="mt-3 divide-y divide-border rounded-xl border border-border bg-card">
              {copy.faq.map((item) => (
                <details key={item.q} className="group px-4 py-3">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-medium text-foreground [&::-webkit-details-marker]:hidden">
                    {item.q}
                    <span className="text-muted-foreground transition-transform group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{item.a}</p>
                </details>
              ))}
            </div>
            <p className="mt-3 text-[11px] text-muted-foreground">{copy.disclaimer}</p>
          </section>

          {!started && (
            <div className="mt-6">
              <Link
                to="/100-questions"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft className="size-4" />
                {copy.questionsCta}
              </Link>
            </div>
          )}
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
