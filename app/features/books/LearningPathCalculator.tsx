import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { CalendarClock, Check, Copy, Printer, RotateCcw, Sparkles } from "lucide-react";
import { getBcp47 } from "~/lib/i18n";
import { currentLang } from "~/lib/seo";
import { BOOKS, type Book } from "~/features/books/data";
import { LEARNING_PATH } from "~/features/books/free-path";
import {
  FOCUS_HOURS,
  GOAL_HOURS,
  LEVEL_MULT,
  LP_COPY,
  LP_QUESTIONS,
  STAGE_BOOKS,
  STAGE_WEIGHTS,
  type FocusKey,
  type GoalKey,
  type HoursKey,
  type LevelKey,
  type LpLocale,
} from "~/features/books/learning-path-calculator";

interface Answers {
  g?: GoalKey;
  l?: LevelKey;
  h?: HoursKey;
  f?: FocusKey;
}

const GOALS: GoalKey[] = ["job", "product", "work", "curious"];
const LEVELS: LevelKey[] = ["beginner", "some", "dev"];
const HOURS: HoursKey[] = ["3", "5", "10", "20"];
const FOCUSES: FocusKey[] = ["unsure", "nlp", "agents", "cv", "rl"];

function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => String(vars[key] ?? ""));
}

function isValidAnswers(a: Answers): a is Required<Answers> {
  return (
    !!a.g &&
    !!a.l &&
    !!a.h &&
    !!a.f &&
    GOALS.includes(a.g) &&
    LEVELS.includes(a.l) &&
    HOURS.includes(a.h) &&
    FOCUSES.includes(a.f)
  );
}

function decodeHash(hash: string): Answers {
  const params = new URLSearchParams(hash.replace(/^#/, ""));
  return {
    g: (params.get("g") as GoalKey) || undefined,
    l: (params.get("l") as LevelKey) || undefined,
    h: (params.get("h") as HoursKey) || undefined,
    f: (params.get("f") as FocusKey) || undefined,
  };
}

function encodeAnswers(a: Required<Answers>): string {
  return `g=${a.g}&l=${a.l}&h=${a.h}&f=${a.f}`;
}

function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + Math.round(months));
  return d;
}

function formatMonth(date: Date, lang: LpLocale): string {
  return new Intl.DateTimeFormat(getBcp47(lang), { month: "short", year: "numeric" }).format(date);
}

function booksForStage(stageId: string, focus: FocusKey): Book[] {
  const config = STAGE_BOOKS[stageId];
  if (!config) return [];
  const asins = config.byFocus?.[focus] ?? config.asins;
  return asins
    .map((asin) => BOOKS.find((book) => book.asin === asin))
    .filter((book): book is Book => Boolean(book));
}

export function LearningPathCalculator({
  compact = false,
}: {
  compact?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  const lang = currentLang() as LpLocale;
  const copy = LP_COPY[lang];
  const questions = LP_QUESTIONS[lang];

  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [showResult, setShowResult] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const parsed = decodeHash(window.location.hash);
    if (isValidAnswers(parsed)) {
      setAnswers(parsed);
      setStarted(true);
      setShowResult(true);
    }
  }, []);

  const result = useMemo(() => {
    if (!isValidAnswers(answers)) return null;
    const hours = Math.max(1, parseInt(answers.h, 10));
    const total = Math.round(
      GOAL_HOURS[answers.g] * LEVEL_MULT[answers.l] + FOCUS_HOURS[answers.f],
    );
    const weeks = Math.ceil(total / hours);
    const months = weeks / 4.33;
    const now = new Date();
    const low = addMonths(now, months * 0.8);
    const high = addMonths(now, months * 1.25);
    return { hours, total, weeks, low, high, answers };
  }, [answers]);

  const scrollToCalculator = () => {
    if (compact) {
      containerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      scrollToCalculator();
    }
  };

  const choose = (key: keyof Answers, value: string) => {
    const next = { ...answers, [key]: value } as Answers;
    setAnswers(next);
    if (step < questions.length - 1) {
      setStep(step + 1);
      return;
    }
    if (isValidAnswers(next)) {
      setShowResult(true);
      window.history.replaceState(null, "", `#${encodeAnswers(next)}`);
      scrollToCalculator();
    }
  };

  const restart = () => {
    setAnswers({});
    setStep(0);
    setStarted(false);
    setShowResult(false);
    setCopied(false);
    window.history.replaceState(null, "", window.location.pathname);
    scrollToCalculator();
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

  const current = questions[step];

  return (
    <div ref={containerRef} className={compact ? "scroll-mt-24" : ""}>
      <div className={compact ? "" : "mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14"}>

          {started &&
            (compact ? (
              <h2 className="sr-only">{copy.h1}</h2>
            ) : (
              <h1 className="sr-only">{copy.h1}</h1>
            ))}
          {!started && (
            <section className={compact ? "" : "text-center"}>
              <p className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
                <CalendarClock className="size-3.5" />
                {copy.kicker}
              </p>
              {compact ? (
                <h2 className="mt-3 text-xl font-bold tracking-tight text-foreground">
                  {copy.h1}
                </h2>
              ) : (
                <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  {copy.h1}
                </h1>
              )}
              <p
                className={
                  compact
                    ? "mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground"
                    : "mx-auto mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground"
                }
              >
                {copy.lede}
              </p>
              <div
                className={
                  compact
                    ? "mt-3 flex flex-wrap gap-1.5"
                    : "mt-4 flex flex-wrap justify-center gap-2"
                }
              >
                {copy.facts.map((fact) => (
                  <span
                    key={fact}
                    className="rounded-full border border-border bg-card px-3 py-1 text-[11px] text-muted-foreground"
                  >
                    {fact}
                  </span>
                ))}
              </div>
              <button
                type="button"
                onClick={() => {
                  setStarted(true);
                  setStep(0);
                  scrollToCalculator();
                }}
                className="mt-6 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                {copy.start}
              </button>
            </section>
          )}

          {started && !showResult && (
            <section className="rounded-2xl border border-border bg-card p-5 sm:p-7">
              <div className="flex items-center gap-1.5">
                {questions.map((_, index) => (
                  <span
                    key={index}
                    className={
                      index <= step
                        ? "h-1.5 flex-1 rounded-full bg-primary"
                        : "h-1.5 flex-1 rounded-full bg-muted"
                    }
                  />
                ))}
              </div>
              <p className="mt-5 text-lg font-semibold text-foreground">{current.q}</p>
              <p className="mt-1 text-xs text-muted-foreground">{current.hint}</p>
              <div
                className={`mt-4 grid gap-2 ${current.options.length > 3 ? "sm:grid-cols-2" : ""}`}
              >
                {current.options.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => choose(current.key, option.value)}
                    className="flex flex-col rounded-xl border border-border px-4 py-3 text-left transition-colors hover:border-primary/50 hover:bg-primary/5"
                  >
                    <span className="text-sm font-medium text-foreground">{option.label}</span>
                    <span className="mt-0.5 text-[11px] text-muted-foreground">{option.sub}</span>
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
                  {result.answers.g === "job" ? copy.resultJob : copy.resultFinish}
                </p>
                <p className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  {formatMonth(result.low, lang)} – <em>{formatMonth(result.high, lang)}</em>
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {fill(result.answers.g === "job" ? copy.summaryJob : copy.summaryFinish, {
                    hours: result.hours,
                    total: result.total,
                    weeks: result.weeks,
                  })}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {[
                    copy.focusChip[result.answers.f],
                    copy.levelChip[result.answers.l],
                    fill(copy.totalHours, { count: result.total }),
                    fill(copy.perWeek, { hours: result.hours }),
                  ].map((chip) => (
                    <span
                      key={chip}
                      className="rounded-full bg-muted px-2.5 py-1 text-[11px] text-muted-foreground"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
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

              <div className="mt-5 space-y-3">
                {LEARNING_PATH.map((stage) => {
                  const weight = STAGE_WEIGHTS[stage.id] ?? 0.1;
                  const stageHours = Math.max(4, Math.round(result.total * weight));
                  const stageWeeks = Math.max(1, Math.ceil(stageHours / result.hours));
                  const books = booksForStage(stage.id, result.answers.f);
                  return (
                    <article key={stage.id} className="rounded-xl border border-border bg-card p-4">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary">
                            {copy.stageKicker[stage.id] ?? ""}
                          </span>
                          <h2 className="text-base font-semibold text-foreground">
                            {t(`freeLib.path.${stage.id}.title`)}
                          </h2>
                        </div>
                        <span className="text-[11px] tabular-nums text-muted-foreground">
                          {fill(copy.stageMeta, { hours: stageHours, weeks: stageWeeks })}
                        </span>
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        {t(`freeLib.path.${stage.id}.desc`)}
                      </p>
                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                            {copy.doThis}
                          </p>
                          <ul className="mt-1.5 space-y-1">
                            {stage.resources.map((resource) => (
                              <li key={resource.url + resource.name}>
                                <a
                                  href={resource.url}
                                  target="_blank"
                                  rel="noopener"
                                  className="flex items-start justify-between gap-2 rounded px-1 py-1 text-xs hover:bg-muted"
                                >
                                  <span className="min-w-0">
                                    <span className="block truncate font-medium text-foreground">
                                      {resource.name}
                                    </span>
                                    <span className="block truncate text-[11px] text-muted-foreground">
                                      {resource.by}
                                    </span>
                                  </span>
                                  <span className="shrink-0 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary">
                                    {resource.tag}
                                  </span>
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                            {copy.readThis}
                          </p>
                          <ul className="mt-1.5 space-y-1">
                            {books.map((book) => (
                              <li key={book.asin}>
                                <a
                                  href={`${book.url}${book.url.includes("?") ? "&" : "?"}ascsubtag=path-${book.asin}`}
                                  target="_blank"
                                  rel="nofollow sponsored noopener"
                                  className="flex items-center gap-2 rounded px-1 py-1 text-xs hover:bg-muted"
                                >
                                  <img
                                    src={book.image}
                                    alt=""
                                    loading="lazy"
                                    className="h-12 w-9 shrink-0 rounded object-cover"
                                  />
                                  <span className="min-w-0">
                                    <span className="block truncate font-medium text-foreground">
                                      {book.displayTitle || book.title}
                                    </span>
                                    <span className="block text-[11px] text-muted-foreground">
                                      ★ {book.rating.toFixed(1)} ·{" "}
                                      {t("aiBooks.ratingsCount", { count: book.reviews.toLocaleString("en-US") })}
                                    </span>
                                  </span>
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              <section className="mt-5 rounded-xl border border-border bg-card p-4">
                <h2 className="text-base font-semibold text-foreground">{copy.firstWeeks}</h2>
                <div className="mt-2 space-y-2">
                  {LEARNING_PATH[0].resources.slice(0, 4).map((resource, index) => (
                    <label
                      key={resource.url + resource.name}
                      className="flex items-start gap-2 rounded-lg px-1 py-1 text-xs hover:bg-muted"
                    >
                      <input type="checkbox" className="mt-0.5 size-3.5 accent-[#d8ff00]" />
                      <span>
                        <span className="font-semibold text-foreground">
                          {fill(copy.week, { n: index + 1 })}: {resource.name}
                        </span>
                        <span className="block text-[11px] text-muted-foreground">
                          {resource.by} — {copy.weekTask}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </section>

              <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground">
                {copy.disclosure}
              </p>

              <Link
                to="/host-single-html"
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary/10"
              >
                <Sparkles className="size-3.5" />
                {copy.publishCta}
              </Link>

              {!compact && (
                <div className="mt-3 flex flex-wrap gap-3 text-xs font-medium text-primary">
                  <Link to="/ai-books/free" className="hover:underline">
                    {copy.freeLibrary}
                  </Link>
                  <Link to="/ai-books" className="hover:underline">
                    {copy.allBooks}
                  </Link>
                </div>
              )}
            </section>
          )}
      </div>
    </div>
  );
}
