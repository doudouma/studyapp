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
import { AixBurst } from "~/components/aix/AixBurst";
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
      className={`ab-chip${active ? " active" : ""}`}
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

const BOOKS_CSS = `
.ab-layout{display:grid;gap:24px}
@media(min-width:1024px){.ab-layout{grid-template-columns:214px minmax(0,1fr);gap:36px}}
.ab-side{min-width:0;display:flex;flex-direction:column;gap:2px}
@media(min-width:1024px){.ab-side{position:sticky;top:96px;align-self:start}}
.ab-nav{display:flex;gap:2px;overflow-x:auto;padding-bottom:6px}
@media(min-width:1024px){.ab-nav{flex-direction:column;overflow:visible;padding-bottom:0}}
.ab-nav-item{
  display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:2px;border:1px solid transparent;
  background:transparent;color:var(--aix-mute);font-size:12px;font-weight:700;line-height:1.3;
  white-space:nowrap;cursor:pointer;text-align:left;transition:.15s;flex:none;
}
@media(min-width:1024px){.ab-nav-item{width:100%}}
.ab-nav-item:hover{background:var(--aix-grey);color:var(--aix-ink)}
.ab-nav-item.active{background:#111214;color:var(--aix-lime);border-color:#111214}
.ab-nav-item .ic{width:14px;height:14px;flex:none}
.ab-nav-item .badge{margin-left:auto;background:#111214;color:var(--aix-lime);font-size:8px;letter-spacing:.12em;padding:2px 5px;border-radius:2px;font-weight:800}
.ab-nav-item.ab-free{background:var(--aix-lime);color:#111214;border-color:transparent;margin-top:6px}
.ab-nav-item.ab-free:hover{background:#c9ef00;color:#111214}
.ab-label{font-size:9px;letter-spacing:.16em;text-transform:uppercase;font-weight:800;color:var(--aix-mute);padding:0 10px;margin:16px 0 5px}
.ab-topic{
  display:flex;align-items:center;justify-content:space-between;gap:10px;padding:7px 10px;border-radius:2px;
  border:0;background:transparent;color:var(--aix-mute);font-size:12px;text-align:left;cursor:pointer;white-space:nowrap;flex:none;
}
@media(min-width:1024px){.ab-topic{width:100%}}
.ab-topic:hover{background:var(--aix-grey);color:var(--aix-ink)}
.ab-topic.active{background:var(--aix-grey);color:var(--aix-ink);font-weight:800}
.ab-topic .n{font-size:10px;font-variant-numeric:tabular-nums;opacity:.6}
.ab-side-note{padding:10px;font-size:10.5px;line-height:1.5;color:var(--aix-mute)}

.ab-search{position:relative;width:100%;max-width:420px}
.ab-search input{
  width:100%;height:38px;border:1px solid var(--aix-line);background:var(--aix-paper);border-radius:2px;
  padding:0 36px 0 32px;font-size:12px;color:var(--aix-ink);outline:none;
}
.ab-search input:focus{border-color:var(--aix-ink)}
.ab-search .ic{position:absolute;left:10px;top:50%;transform:translateY(-50%);width:14px;height:14px;color:var(--aix-mute);pointer-events:none}
.ab-search kbd{
  position:absolute;right:8px;top:50%;transform:translateY(-50%);border:1px solid var(--aix-line);border-radius:2px;
  padding:1px 5px;font-size:9px;color:var(--aix-mute);background:var(--aix-grey);
}

.ab-viewhead{margin:22px 0 12px;border-bottom:1px solid var(--aix-line);padding-bottom:12px}
.ab-viewhead h2{margin:3px 0 0;font-size:clamp(20px,2.2vw,28px);font-weight:800;letter-spacing:-.03em;text-transform:uppercase;line-height:1.05}
.ab-viewhead p{margin:6px 0 0;max-width:72ch;font-size:12.5px;line-height:1.6;color:var(--aix-mute)}

.ab-filters{display:flex;flex-direction:column;gap:8px;margin:14px 0}
.ab-filterrow{display:flex;flex-wrap:wrap;align-items:center;gap:6px}
.ab-filterrow > span{min-width:74px;font-size:9px;letter-spacing:.1em;text-transform:uppercase;font-weight:800;color:var(--aix-mute)}
.ab-chip{
  height:28px;padding:0 11px;border:1px solid var(--aix-line);background:var(--aix-paper);color:var(--aix-mute);
  font-size:10.5px;font-weight:700;border-radius:2px;cursor:pointer;white-space:nowrap;transition:.15s;
}
.ab-chip:hover{border-color:var(--aix-ink);color:var(--aix-ink)}
.ab-chip.active{background:#111214;border-color:#111214;color:var(--aix-lime)}

.ab-details{border:1px solid var(--aix-line);background:var(--aix-paper);border-radius:2px;margin-top:16px}
.ab-details summary{display:flex;align-items:center;gap:8px;padding:11px 14px;cursor:pointer;list-style:none;font-size:12px;font-weight:800}
.ab-details summary::-webkit-details-marker{display:none}
.ab-details summary .chev{width:14px;height:14px;color:var(--aix-mute);transition:transform .2s;flex:none}
.ab-details[open] summary .chev{transform:rotate(180deg)}
.ab-details .hint{margin-left:auto;font-size:10px;color:var(--aix-mute);font-weight:600}
.ab-details .note{border-top:1px solid var(--aix-line);padding:8px 14px;font-size:10.5px;line-height:1.5;color:var(--aix-mute)}
.ab-tablewrap{overflow-x:auto;border-top:1px solid var(--aix-line)}
.ab-table{width:100%;min-width:920px;border-collapse:collapse;text-align:left}
.ab-table th{
  background:var(--aix-grey);font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:var(--aix-mute);
  font-weight:800;padding:8px 10px;border-bottom:1px solid var(--aix-line);
}
.ab-table td{padding:10px;border-bottom:1px solid var(--aix-line);vertical-align:top;font-size:11.5px;line-height:1.5;color:var(--aix-mute)}
.ab-table tr:last-child td{border-bottom:0}
.ab-table a{color:var(--aix-ink);font-weight:700;text-decoration:none}
.ab-table a:hover{text-decoration:underline}
.ab-meta{display:block;margin-top:2px;font-size:10px;color:var(--aix-mute);font-weight:600}
.ab-mark{display:inline-grid;place-items:center;width:16px;height:16px;border-radius:2px;font-size:10px;font-weight:800;margin-right:4px;vertical-align:1px}
.ab-mark.yes{background:var(--aix-lime);color:#111214}
.ab-mark.no{background:var(--aix-grey);color:var(--aix-mute)}

.ab-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px 12px;padding:18px 0}
@media(min-width:640px){.ab-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}
@media(min-width:768px){.ab-grid{grid-template-columns:repeat(4,minmax(0,1fr))}}
@media(min-width:1024px){.ab-grid{grid-template-columns:repeat(5,minmax(0,1fr))}}
@media(min-width:1280px){.ab-grid{grid-template-columns:repeat(6,minmax(0,1fr))}}
.ab-empty{padding:64px 0;text-align:center;font-size:12px;color:var(--aix-mute)}

.ab-browse{margin-top:30px;border-top:1px solid var(--aix-line);padding-top:18px}
.ab-subhead{margin:0;font-size:15px;font-weight:800;letter-spacing:-.02em;text-transform:uppercase}
.ab-subdesc{margin:4px 0 0;font-size:11px;color:var(--aix-mute)}
.ab-links{display:grid;gap:6px;margin-top:12px}
@media(min-width:640px){.ab-links{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(min-width:1024px){.ab-links{grid-template-columns:repeat(3,minmax(0,1fr))}}
.ab-link{
  display:flex;align-items:center;justify-content:space-between;gap:10px;border:1px solid var(--aix-line);
  border-radius:2px;padding:9px 11px;font-size:12px;color:var(--aix-mute);text-decoration:none;background:var(--aix-paper);transition:.15s;
}
.ab-link:hover{border-color:var(--aix-ink);color:var(--aix-ink)}
.ab-link .n{font-size:10px;font-variant-numeric:tabular-nums;opacity:.6}
.ab-path{
  display:inline-flex;align-items:center;gap:6px;margin-top:12px;font-size:11px;font-weight:800;
  color:var(--aix-ink);text-decoration:none;border-bottom:1px solid var(--aix-line);
}
.ab-path:hover{border-color:var(--aix-ink)}

.ab-notes{display:grid;gap:8px;margin-top:16px}
@media(min-width:640px){.ab-notes{grid-template-columns:repeat(3,minmax(0,1fr))}}
.ab-note{
  display:flex;flex-direction:column;gap:7px;border:1px solid var(--aix-line);border-radius:2px;
  background:var(--aix-grey);padding:14px;min-height:150px;
}
.ab-note.ink{background:#111214;color:#fff;border-color:#111214}
.ab-note.ink p{color:#cfcfcf;opacity:1}
.ab-note.lime{background:var(--aix-lime);color:#111214;border-color:transparent}
.ab-note .top{display:flex;align-items:baseline;justify-content:space-between;gap:8px}
.ab-note h3{margin:0;font-size:11px;letter-spacing:.08em;text-transform:uppercase;font-weight:800}
.ab-note .w{font-size:13px;font-weight:800}
.ab-note p{margin:0;font-size:11px;line-height:1.55;opacity:.75}
`;

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
          <style>{AIX_CSS}{BOOKS_CSS}</style>

          {/* HERO */}
          <section className="aix-frame aix-hero">
            <div className="aix-mininav">
              <span className="brand">
                <span className="dot" />
                AI BOOKS
              </span>
              <span>{t("aiBooks.stats", { books: BOOK_COUNT, ratings: fmt(TOTAL_RATINGS) })}</span>
              <Link to="/ai-books/free">
                {t("aiBooks.freeLink")}
                <ArrowUpRight className="size-3.5" />
              </Link>
            </div>

            <div className="aix-hero-grid">
              <div className="aix-hero-copy">
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
                  <h1 className="aix-h1">{t("aiBooks.h1")}</h1>
                  <p className="aix-lede">{QUICK_ANSWER[contentLocale]}</p>
                </div>

                <div className="aix-stats">
                  {[
                    { n: fmt(BOOK_COUNT), label: t("aiBooks.statBooks"), cls: "grey" },
                    { n: fmt(TOTAL_RATINGS), label: t("aiBooks.statRatings"), cls: "lime" },
                    { n: String(CATEGORY_KEYS.length), label: t("aiBooks.statTopics"), cls: "ink" },
                    { n: String(AI_BOOK_PAGES.length), label: t("aiBooks.statLists"), cls: "ghost" },
                  ].map((stat) => (
                    <div key={stat.label} className={`aix-stat ${stat.cls}`}>
                      <div className="n">{stat.n}</div>
                      <div className="l">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="aix-art" aria-hidden="true">
                <span className="aix-art-grid" />
                <AixBurst className="aix-art-burst" />
                <div className="aix-art-s">
                  {BOOK_COUNT}
                  <span>{t("aiBooks.stats", { books: BOOK_COUNT, ratings: fmt(TOTAL_RATINGS) })}</span>
                </div>
                <div className="aix-art-rows">
                  {[...CATEGORY_KEYS]
                    .sort((a, b) => (CATEGORY_COUNTS[b] ?? 0) - (CATEGORY_COUNTS[a] ?? 0))
                    .slice(0, 5)
                    .map((key) => (
                      <div className="aix-art-row" key={key}>
                        <b>{t(`aiBooks.cat.${key}`)}</b>
                        <span>{fmt(CATEGORY_COUNTS[key] ?? 0)}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </section>

          {/* CATALOG */}
          <section className="aix-frame">
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
                        className={`ab-nav-item${active ? " active" : ""}`}
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
                    className={`ab-topic${category === "all" ? " active" : ""}`}
                  >
                    <span>{t("aiBooks.cat.all")}</span>
                    <span className="n">{fmt(BOOK_COUNT)}</span>
                  </button>
                  {CATEGORY_KEYS.map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setCategory(key)}
                      className={`ab-topic${category === key ? " active" : ""}`}
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
