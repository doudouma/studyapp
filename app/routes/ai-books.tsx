import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import {
  ArrowUpRight,
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
import { AIX_CSS } from "~/components/aix/aix-styles";
import { BOOKS_CSS } from "~/components/aix/books-styles";
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
      className={`ab-chip${active ? " is-active" : ""}`}
    >
      {children}
    </button>
  );
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="ab-filterrow">
      <span>{label}</span>
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
    <div className="flex min-h-screen flex-col bg-[#ededed] dark:bg-[#0c0d0f]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <AppNav />
      <main className="flex-1">
        <div className="aix">
          <style
            dangerouslySetInnerHTML={{
              // 搜索条吸顶后，锚点跳转要额外让开它（header 64px + 搜索条 ~56px）
              __html: AIX_CSS + BOOKS_CSS + ".aix-frame{scroll-margin-top:130px}",
            }}
          />

          {/* CATALOG */}
          <section className="aix-frame">
            <div className="aix-lead">
              <div>
                <div className="aix-topline">
                  <span className="aix-pill lime">
                    <span className="dot" />
                    {t("aiBooks.quickLabel")}
                  </span>
                  <span className="aix-kicker">
                    {t("aiBooks.factLine", {
                      books: BOOK_COUNT,
                      ratings: fmt(TOTAL_RATINGS),
                      topics: CATEGORY_KEYS.length,
                      date: AI_BOOKS_UPDATED,
                    })}
                  </span>
                </div>
                <h1>{t("aiBooks.h1")}</h1>
                <p>{QUICK_ANSWER[contentLocale]}</p>
              </div>
              <div className="aix-lead-meta">
                <span>{t("aiBooks.stats", { books: BOOK_COUNT, ratings: fmt(TOTAL_RATINGS) })}</span>
                <Link to="/ai-books/free">
                  {t("aiBooks.freeLink")}
                  <ArrowUpRight className="size-3.5" />
                </Link>
              </div>
            </div>
            <div className="ab-layout">
              <aside className="ab-side">
                <nav className="ab-nav">
                  {views.map((item) => {
                    const Icon = item.icon;
                    const active = item.key === view;
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => chooseView(item.key)}
                        className={`ab-nav-item${active ? " is-active" : ""}`}
                      >
                        <Icon className="ic" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </nav>

                <Link to="/ai-books/free" className="ab-nav-item ab-free">
                  <Library className="ic" />
                  <span>{t("aiBooks.freeLink")}</span>
                  <span className="badge">FREE</span>
                </Link>

                <div className="ab-label">{t("aiBooks.topics")}</div>
                <div className="ab-nav">
                  <button
                    type="button"
                    onClick={() => setCategory("all")}
                    className={`ab-topic${category === "all" ? " is-active" : ""}`}
                  >
                    <span>{t("aiBooks.cat.all")}</span>
                    <span className="n">{fmt(BOOK_COUNT)}</span>
                  </button>
                  {CATEGORY_KEYS.map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setCategory(key)}
                      className={`ab-topic${category === key ? " is-active" : ""}`}
                    >
                      <span>{t(`aiBooks.cat.${key}`)}</span>
                      <span className="n">{fmt(CATEGORY_COUNTS[key] ?? 0)}</span>
                    </button>
                  ))}
                </div>

                <p className="ab-side-note hidden lg:block">
                  {t("aiBooks.stats", { books: BOOK_COUNT, ratings: fmt(TOTAL_RATINGS) })}
                </p>
              </aside>

              <div className="min-w-0">
                <div className="ab-search">
                  <Search className="ic" />
                  <input
                    ref={searchRef}
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={t("aiBooks.searchPlaceholder")}
                    autoComplete="off"
                  />
                  <kbd>/</kbd>
                </div>

                <div className="ab-viewhead">
                  <h2>{activeView.title}</h2>
                  <p>{activeView.desc}</p>
                </div>

                <details id="top-picks" className="ab-details group">
                  <summary>
                    <ChevronDown className="chev" />
                    <span>{t("aiBooks.table.title")}</span>
                    <span className="hint">{t("aiBooks.table.summary", { count: TOP_PICKS.length })}</span>
                  </summary>
                  <div className="ab-tablewrap">
                    <table className="ab-table">
                      <thead>
                        <tr>
                          <th>{t("aiBooks.table.goal")}</th>
                          <th>{t("aiBooks.table.book")}</th>
                          <th>{t("aiBooks.table.author")}</th>
                          <th>{t("aiBooks.table.why")}</th>
                          <th>{t("aiBooks.table.fitFor")}</th>
                          <th>{t("aiBooks.table.notFor")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {TOP_PICKS.map((pick) => {
                          const book = BOOKS.find((item) => item.asin === pick.asin);
                          if (!book) return null;
                          const separator = book.url.includes("?") ? "&" : "?";
                          return (
                            <tr key={pick.asin}>
                              <td>{pick.goal[contentLocale]}</td>
                              <td>
                                <a
                                  href={`${book.url}${separator}ascsubtag=shelf-${pick.asin}-pick`}
                                  target="_blank"
                                  rel="nofollow sponsored noopener"
                                >
                                  {pick.book}
                                </a>
                                <span className="ab-meta">
                                  ★ {book.rating.toFixed(1)} · {short(book.reviews)}
                                </span>
                              </td>
                              <td>{pick.author}</td>
                              <td>{pick.why[contentLocale]}</td>
                              <td>
                                <span className="ab-mark yes">✓</span>
                                {pick.fitFor[contentLocale]}
                              </td>
                              <td>
                                <span className="ab-mark no">✗</span>
                                {pick.notFor[contentLocale]}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <p className="note">{t("aiBooks.table.note")}</p>
                </details>

                <div className="ab-filters">
                  <FilterRow label={t("aiBooks.ratingLabel")}>
                    {RATING_OPTIONS.map((value) => (
                      <Chip key={value} active={rating === value} onClick={() => setRating(value)}>
                        {value === 0 ? t("aiBooks.filterAll") : `${value.toFixed(1)}+`}
                      </Chip>
                    ))}
                  </FilterRow>
                  <FilterRow label={t("aiBooks.ratingsLabel")}>
                    {COUNT_OPTIONS.map((value) => (
                      <Chip key={value} active={count === value} onClick={() => setCount(value)}>
                        {value === 0 ? t("aiBooks.filterAll") : `${fmt(value)}+`}
                      </Chip>
                    ))}
                  </FilterRow>
                </div>

                <p className="ab-side-note lg:hidden">
                  {t("aiBooks.stats", { books: BOOK_COUNT, ratings: fmt(TOTAL_RATINGS) })}
                </p>

                {books.length === 0 ? (
                  <div className="ab-empty">{t("aiBooks.empty")}</div>
                ) : (
                  <div className="ab-grid">
                    {books.map((book, index) => (
                      <BookCard key={book.asin} book={book} index={index} />
                    ))}
                  </div>
                )}

                <section className="ab-browse">
                  <h2 className="ab-subhead">{t("aiBooks.browseTitle")}</h2>
                  <p className="ab-subdesc">{t("aiBooks.browseDesc")}</p>
                  <div className="ab-links">
                    {AI_BOOK_PAGES.map((page) => {
                      const pageCount =
                        page.kind === "category"
                          ? BOOKS.filter((book) => book.category === page.category).length
                          : BOOKS.filter((book) => page.asins?.includes(book.asin)).length;
                      return (
                        <Link
                          key={page.slug}
                          to="/ai-books/$slug"
                          params={{ slug: page.slug }}
                          className="ab-link"
                        >
                          <span>{page.copy[contentLocale].topic}</span>
                          <span className="n">
                            {t("aiBooks.pageCount", { count: pageCount })}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                  <Link to="/ai-books/learning-path" className="ab-path">
                    <CalendarClock className="size-3.5" />
                    {t("aiBooks.pathCta")}
                  </Link>
                </section>
              </div>
            </div>
          </section>

          {/* METHODOLOGY */}
          <section className="aix-frame" id="methodology">
            <div className="aix-sec-head">
              <div>
                <div className="aix-section-num">01</div>
                <h2 className="aix-sec-title">{t("aiBooks.method.title")}</h2>
              </div>
              <span className="aix-dot-sm" />
            </div>
            <p className="aix-body">{METHOD_INTRO[contentLocale]}</p>
            <div className="ab-notes">
              {METHOD_ROWS.map((row, index) => (
                <div key={row.id} className={`ab-note${index === 0 ? " ink" : index === 1 ? " lime" : ""}`}>
                  <div className="top">
                    <h3>{t(`aiBooks.method.${row.id}`)}</h3>
                    <span className="w">{row.weight}</span>
                  </div>
                  <p>{row.text[contentLocale]}</p>
                </div>
              ))}
            </div>
            <p className="aix-kicker" style={{ marginTop: 14 }}>{METHOD_SOURCE[contentLocale]}</p>
            <p className="aix-kicker">{t("aiBooks.updatedOn", { date: AI_BOOKS_UPDATED })}</p>
            <p className="aix-kicker">{METHOD_AUTHOR[contentLocale]}</p>
          </section>

          {/* FAQ */}
          <section className="aix-frame" id="faq">
            <div className="aix-sec-head">
              <div>
                <div className="aix-section-num">02</div>
                <h2 className="aix-sec-title">{t("aiBooks.faq.title")}</h2>
              </div>
              <span className="aix-dot-sm" />
            </div>
            <div className="aix-faq">
              {FAQ.map((item) => (
                <details key={item.id}>
                  <summary>
                    <span>{item.q[contentLocale]}</span>
                    <span className="plus">＋</span>
                  </summary>
                  <p className="answer">{item.a[contentLocale]}</p>
                </details>
              ))}
            </div>
          </section>
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
