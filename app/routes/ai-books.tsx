import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import {
  CalendarClock,
  ChevronDown,
  Heart,
  Library,
  Search,
  Sparkles,
  Star,
  Sun,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import i18n from "~/lib/i18n";
import { BASE_URL, currentLang, withLangPrefix } from "~/lib/seo";
import { AppNav } from "~/components/HomeHeader";
import { AppFooter } from "~/components/AppFooter";
import { BookCard } from "~/features/books/BookCard";
import {
  BOOKS,
  BOOK_COUNT,
  CATEGORIES,
  TOTAL_RATINGS,
  type BookCategory,
} from "~/features/books/data";
import { risingScore, score, shuffle } from "~/features/books/scoring";
import { AI_BOOK_PAGES } from "@shared/books/programmatic";
import {
  AI_BOOKS_UPDATED,
  FAQ,
  METHOD_AUTHOR,
  METHOD_INTRO,
  METHOD_ROWS,
  METHOD_SOURCE,
  QUICK_ANSWER,
  TOP_PICKS,
} from "~/features/books/ai-books-content";

const VIEW_KEYS = ["today", "alltime", "recommended", "rising", "foryou"] as const;
type ViewKey = (typeof VIEW_KEYS)[number];
type CategoryFilter = "all" | BookCategory;

const RATING_OPTIONS = [0, 4.5, 4.3, 4.0] as const;
const COUNT_OPTIONS = [0, 1000, 500, 100] as const;

const CATEGORY_KEYS = Object.keys(CATEGORIES) as BookCategory[];
const CATEGORY_COUNTS = CATEGORY_KEYS.reduce<Record<string, number>>(
  (acc, key) => {
    acc[key] = BOOKS.filter((b) => b.category === key).length;
    return acc;
  },
  {},
);

const numberFormat = new Intl.NumberFormat("en-US");

function fmt(n: number): string {
  return numberFormat.format(n || 0);
}

function short(n: number): string {
  const value = Number(n) || 0;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(value);
}

export const Route = createFileRoute("/ai-books")({
  head: () => {
    const lang = currentLang();
    const pageUrl = BASE_URL + withLangPrefix(lang, "/ai-books");
    return {
      meta: [
        { title: i18n.t("aiBooks.title") },
        { name: "description", content: i18n.t("aiBooks.desc") },
        { name: "keywords", content: i18n.t("aiBooks.keywords") },
        { name: "robots", content: "index, follow" },
        { property: "og:type", content: "website" },
        { property: "og:title", content: i18n.t("aiBooks.title") },
        { property: "og:description", content: i18n.t("aiBooks.desc") },
        { property: "og:url", content: pageUrl },
        { property: "og:site_name", content: "100mini" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: i18n.t("aiBooks.title") },
        { name: "twitter:description", content: i18n.t("aiBooks.desc") },
      ],
      links: [
        { rel: "preconnect", href: "https://m.media-amazon.com" },
        { rel: "dns-prefetch", href: "https://m.media-amazon.com" },
      ],
    };
  },
  component: AiBooksPage,
});

interface ViewMeta {
  key: ViewKey;
  icon: LucideIcon;
  label: string;
  title: string;
  desc: string;
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={
        active
          ? "h-[30px] whitespace-nowrap rounded-full border border-primary bg-primary px-3.5 text-xs font-medium text-primary-foreground"
          : "h-[30px] whitespace-nowrap rounded-full border border-border bg-card px-3.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
      }
    >
      {children}
    </button>
  );
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="min-w-14 text-xs text-muted-foreground">{label}</span>
      {children}
    </div>
  );
}

function AiBooksPage() {
  const { t } = useTranslation();
  const contentLocale = currentLang();
  const [view, setView] = useState<ViewKey>("recommended");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [rating, setRating] = useState<number>(0);
  const [count, setCount] = useState<number>(0);
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const day = useMemo(() => Math.floor(Date.now() / 86_400_000), []);

  const views: ViewMeta[] = [
    {
      key: "today",
      icon: Sun,
      label: t("aiBooks.view.today.label"),
      title: t("aiBooks.view.today.title"),
      desc: t("aiBooks.view.today.desc"),
    },
    {
      key: "alltime",
      icon: Star,
      label: t("aiBooks.view.alltime.label"),
      title: t("aiBooks.view.alltime.title"),
      desc: t("aiBooks.view.alltime.desc"),
    },
    {
      key: "recommended",
      icon: Sparkles,
      label: t("aiBooks.view.recommended.label"),
      title: t("aiBooks.view.recommended.title"),
      desc: t("aiBooks.view.recommended.desc"),
    },
    {
      key: "rising",
      icon: TrendingUp,
      label: t("aiBooks.view.rising.label"),
      title: t("aiBooks.view.rising.title"),
      desc: t("aiBooks.view.rising.desc"),
    },
    {
      key: "foryou",
      icon: Heart,
      label: t("aiBooks.view.foryou.label"),
      title: t("aiBooks.view.foryou.title"),
      desc: t("aiBooks.view.foryou.desc"),
    },
  ];

  const activeView = views.find((v) => v.key === view) ?? views[2];

  useEffect(() => {
    const applyHash = () => {
      const key = window.location.hash.replace("#", "");
      if ((VIEW_KEYS as readonly string[]).includes(key)) setView(key as ViewKey);
    };
    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, []);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      const tag = (event.target as HTMLElement | null)?.tagName;
      const typing =
        tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
      if (event.key === "/" && !typing) {
        event.preventDefault();
        searchRef.current?.focus();
      }
      if (event.key === "Escape") searchRef.current?.blur();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const books = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = BOOKS.filter((book) => {
      if (category !== "all" && book.category !== category) return false;
      if (rating && !(book.rating >= rating)) return false;
      if (count && !(book.reviews >= count)) return false;
      if (!q) return true;
      const haystack = [
        book.title,
        book.author,
        book.displayAuthor,
        book.displayTitle,
        book.category,
        t(`aiBooks.cat.${book.category}`),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });

    if (view === "alltime") {
      list.sort(
        (a, b) => (b.reviews || 0) - (a.reviews || 0) || (b.rating || 0) - (a.rating || 0),
      );
    } else if (view === "rising") {
      list.sort((a, b) => risingScore(b) - risingScore(a));
    } else if (view === "foryou") {
      return shuffle(list, day).slice(0, 24);
    } else if (view === "today") {
      list.sort((a, b) => score(b) - score(a));
      return shuffle(list.slice(0, 30), day).slice(0, 12);
    } else {
      list.sort((a, b) => score(b) - score(a));
    }

    return list;
  }, [view, category, rating, count, query, day, t]);

  const chooseView = (key: ViewKey) => {
    setView(key);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `#${key}`);
    }
  };

  const jsonLd = useMemo(() => {
    const topTen = BOOKS.slice()
      .sort((a, b) => score(b) - score(a))
      .slice(0, 10);
    return {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "CollectionPage",
          name: t("aiBooks.h1"),
          description: t("aiBooks.desc"),
          url: BASE_URL + withLangPrefix(currentLang(), "/ai-books"),
          inLanguage: contentLocale,
          dateModified: AI_BOOKS_UPDATED,
          author: { "@type": "Organization", name: "100mini Editorial" },
          publisher: { "@type": "Organization", name: "100mini", url: BASE_URL },
          isPartOf: { "@type": "WebSite", name: "100mini", url: BASE_URL },
          about: { "@type": "Thing", name: "Artificial Intelligence books" },
          citation: METHOD_SOURCE[contentLocale],
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: BOOK_COUNT,
            itemListElement: topTen.map((book, index) => ({
              "@type": "ListItem",
              position: index + 1,
              item: {
                "@type": "Book",
                name: book.displayTitle || book.title,
                author: { "@type": "Person", name: book.displayAuthor || book.author },
                url: book.url,
              },
            })),
          },
        },
        {
          "@type": "FAQPage",
          mainEntity: FAQ.map((item) => ({
            "@type": "Question",
            name: item.q[contentLocale],
            acceptedAnswer: { "@type": "Answer", text: item.a[contentLocale] },
          })),
        },
      ],
    };
  }, [contentLocale, t]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <AppNav />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:py-10">
          <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
            <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
              <nav className="flex gap-1 overflow-x-auto pb-2 lg:flex-col lg:gap-0.5 lg:overflow-visible lg:pb-0">
                {views.map((item) => {
                  const Icon = item.icon;
                  const active = item.key === view;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => chooseView(item.key)}
                      className={
                        active
                          ? "flex w-auto shrink-0 items-center gap-2.5 rounded-lg bg-primary/10 px-3 py-2 text-sm font-semibold text-primary lg:w-full"
                          : "flex w-auto shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:w-full"
                      }
                    >
                      <Icon className="size-4 shrink-0" />
                      <span className="whitespace-nowrap">{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              <Link
                to="/ai-books/free"
                className="mt-2 flex w-auto shrink-0 items-center gap-2.5 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10 lg:w-full"
              >
                <Library className="size-4 shrink-0" />
                <span className="whitespace-nowrap">{t("aiBooks.freeLink")}</span>
                <span className="ml-auto hidden rounded-full bg-primary px-1.5 py-0.5 text-[9px] font-bold uppercase text-primary-foreground lg:inline">
                  Free
                </span>
              </Link>

              <p className="mt-6 hidden px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground lg:block">
                {t("aiBooks.topics")}
              </p>
              <div className="mt-1 flex gap-1.5 overflow-x-auto pb-3 lg:mt-1.5 lg:flex-col lg:gap-px lg:overflow-visible lg:pb-0">
                <button
                  type="button"
                  onClick={() => setCategory("all")}
                  className={
                    category === "all"
                      ? "flex shrink-0 items-center justify-between gap-3 rounded-lg bg-muted px-3 py-2 text-sm font-semibold text-foreground lg:w-full"
                      : "flex shrink-0 items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:w-full"
                  }
                >
                  <span className="whitespace-nowrap">{t("aiBooks.cat.all")}</span>
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {fmt(BOOK_COUNT)}
                  </span>
                </button>
                {CATEGORY_KEYS.map((key) => {
                  const active = category === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setCategory(key)}
                      className={
                        active
                          ? "flex shrink-0 items-center justify-between gap-3 rounded-lg bg-muted px-3 py-2 text-sm font-semibold text-foreground lg:w-full"
                          : "flex shrink-0 items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:w-full"
                      }
                    >
                      <span className="whitespace-nowrap">{t(`aiBooks.cat.${key}`)}</span>
                      <span className="text-xs tabular-nums text-muted-foreground">
                        {fmt(CATEGORY_COUNTS[key] ?? 0)}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-7 hidden px-3 text-xs leading-relaxed text-muted-foreground lg:block">
                <div>{t("aiBooks.stats", { books: BOOK_COUNT, ratings: fmt(TOTAL_RATINGS) })}</div>
              </div>
            </aside>

            <section className="min-w-0">
              <div className="relative w-full sm:max-w-md">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  ref={searchRef}
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={t("aiBooks.searchPlaceholder")}
                  autoComplete="off"
                  className="h-10 w-full rounded-lg border border-border bg-card pl-9 pr-10 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/15"
                />
                <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:block">
                  /
                </kbd>
              </div>

              <div className="mt-5">
                <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  {t("aiBooks.h1")}
                </h1>
                <p className="mt-2 max-w-3xl text-[13px] leading-relaxed text-muted-foreground">
                  <span className="font-semibold text-primary">
                    {t("aiBooks.quickLabel")}:
                  </span>{" "}
                  {QUICK_ANSWER[contentLocale]}
                </p>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  {t("aiBooks.factLine", {
                    books: BOOK_COUNT,
                    ratings: fmt(TOTAL_RATINGS),
                    topics: CATEGORY_KEYS.length,
                    date: AI_BOOKS_UPDATED,
                  })}
                </p>
              </div>

              <details
                id="top-picks"
                className="group mt-4 scroll-mt-24 rounded-xl border border-border bg-card"
              >
                <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2.5 [&::-webkit-details-marker]:hidden">
                  <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                  <h2 className="text-sm font-semibold text-foreground">
                    {t("aiBooks.table.title")}
                  </h2>
                  <span className="ml-auto text-[11px] font-normal text-muted-foreground">
                    {t("aiBooks.table.summary", { count: TOP_PICKS.length })}
                  </span>
                </summary>
                <div className="overflow-x-auto border-t border-border">
                  <table className="w-full min-w-[920px] text-left text-sm">
                    <thead className="bg-muted/60 text-[11px] uppercase tracking-wide text-muted-foreground">
                      <tr>
                        <th className="px-3 py-2 font-semibold">{t("aiBooks.table.goal")}</th>
                        <th className="px-3 py-2 font-semibold">{t("aiBooks.table.book")}</th>
                        <th className="px-3 py-2 font-semibold">{t("aiBooks.table.author")}</th>
                        <th className="px-3 py-2 font-semibold">{t("aiBooks.table.why")}</th>
                        <th className="px-3 py-2 font-semibold">{t("aiBooks.table.fitFor")}</th>
                        <th className="px-3 py-2 font-semibold">{t("aiBooks.table.notFor")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {TOP_PICKS.map((pick) => {
                        const book = BOOKS.find((item) => item.asin === pick.asin);
                        if (!book) return null;
                        const separator = book.url.includes("?") ? "&" : "?";
                        return (
                          <tr key={pick.asin} className="border-t border-border align-top">
                            <td className="whitespace-nowrap px-3 py-2.5 text-xs font-medium text-foreground">
                              {pick.goal[contentLocale]}
                            </td>
                            <td className="px-3 py-2.5">
                              <a
                                href={`${book.url}${separator}ascsubtag=shelf-${pick.asin}-pick`}
                                target="_blank"
                                rel="nofollow sponsored noopener"
                                className="font-medium text-primary hover:underline"
                              >
                                {pick.book}
                              </a>
                              <span className="mt-0.5 block text-[11px] text-muted-foreground">
                                ★ {book.rating.toFixed(1)} · {short(book.reviews)}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 text-xs text-muted-foreground">{pick.author}</td>
                            <td className="px-3 py-2.5 text-xs leading-relaxed text-muted-foreground">
                              {pick.why[contentLocale]}
                            </td>
                            <td className="px-3 py-2.5 text-xs leading-relaxed text-muted-foreground">
                              <span className="mr-1 font-bold text-emerald-600 dark:text-emerald-400">
                                ✓
                              </span>
                              {pick.fitFor[contentLocale]}
                            </td>
                            <td className="px-3 py-2.5 text-xs leading-relaxed text-muted-foreground">
                              <span className="mr-1 font-bold text-rose-600 dark:text-rose-400">
                                ✗
                              </span>
                              {pick.notFor[contentLocale]}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <p className="border-t border-border px-3 py-2 text-[11px] text-muted-foreground">
                  {t("aiBooks.table.note")}
                </p>
              </details>

              <div className="mt-6">
                <h2 className="text-lg font-bold tracking-tight text-foreground">
                  {activeView.title}
                </h2>
                <p className="mt-1 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                  {activeView.desc}
                </p>
              </div>

              <div className="mt-4 flex flex-col gap-2.5">
                <FilterRow label={t("aiBooks.ratingLabel")}>
                  {RATING_OPTIONS.map((value) => (
                    <Chip
                      key={value}
                      active={rating === value}
                      onClick={() => setRating(value)}
                    >
                      {value === 0 ? t("aiBooks.filterAll") : `${value.toFixed(1)}+`}
                    </Chip>
                  ))}
                </FilterRow>
                <FilterRow label={t("aiBooks.ratingsLabel")}>
                  {COUNT_OPTIONS.map((value) => (
                    <Chip
                      key={value}
                      active={count === value}
                      onClick={() => setCount(value)}
                    >
                      {value === 0 ? t("aiBooks.filterAll") : `${fmt(value)}+`}
                    </Chip>
                  ))}
                </FilterRow>
              </div>

              <div className="mt-2 lg:hidden">
                <p className="text-xs text-muted-foreground">
                  {t("aiBooks.stats", { books: BOOK_COUNT, ratings: fmt(TOTAL_RATINGS) })}
                </p>
              </div>

              {books.length === 0 ? (
                <div className="py-20 text-center text-sm text-muted-foreground">
                  {t("aiBooks.empty")}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-x-3 gap-y-6 py-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                  {books.map((book, index) => (
                    <BookCard key={book.asin} book={book} index={index} />
                  ))}
                </div>
              )}

              <section className="mt-10 border-t border-border pt-5">
                <h2 className="text-lg font-bold text-foreground">{t("aiBooks.browseTitle")}</h2>
                <p className="mt-1 text-xs text-muted-foreground">{t("aiBooks.browseDesc")}</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {AI_BOOK_PAGES.map((page) => {
                    const count =
                      page.kind === "category"
                        ? BOOKS.filter((book) => book.category === page.category).length
                        : BOOKS.filter((book) => page.asins?.includes(book.asin)).length;
                    return (
                      <Link
                        key={page.slug}
                        to="/ai-books/$slug"
                        params={{ slug: page.slug }}
                        className="group flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                      >
                        <span>{page.copy[contentLocale].topic}</span>
                        <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
                          {t("aiBooks.pageCount", { count })}
                        </span>
                      </Link>
                    );
                  })}
                </div>
                <Link
                  to="/ai-books/learning-path"
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                >
                  <CalendarClock className="size-3.5" />
                  {t("aiBooks.pathCta")}
                </Link>
              </section>

              <section id="methodology" className="mt-10 scroll-mt-24 border-t border-border pt-6">
                <h2 className="text-lg font-bold text-foreground">{t("aiBooks.method.title")}</h2>
                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                  {METHOD_INTRO[contentLocale]}
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {METHOD_ROWS.map((row) => (
                    <div key={row.id} className="rounded-xl border border-border bg-card p-4">
                      <div className="flex items-baseline justify-between gap-2">
                        <h3 className="text-sm font-semibold text-foreground">
                          {t(`aiBooks.method.${row.id}`)}
                        </h3>
                        <span className="text-xs font-bold text-primary">{row.weight}</span>
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        {row.text[contentLocale]}
                      </p>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                  {METHOD_SOURCE[contentLocale]}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {METHOD_AUTHOR[contentLocale]}
                </p>
              </section>

              <section id="faq" className="mt-10 scroll-mt-24 border-t border-border pt-6">
                <h2 className="text-lg font-bold text-foreground">{t("aiBooks.faq.title")}</h2>
                <div className="mt-3 divide-y divide-border rounded-xl border border-border bg-card">
                  {FAQ.map((item) => (
                    <details key={item.id} className="group px-4 py-3">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-medium text-foreground [&::-webkit-details-marker]:hidden">
                        {item.q[contentLocale]}
                        <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                      </summary>
                      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                        {item.a[contentLocale]}
                      </p>
                    </details>
                  ))}
                </div>
              </section>
            </section>
          </div>
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
