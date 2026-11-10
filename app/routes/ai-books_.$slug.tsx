import { useMemo } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ChevronRight, Sparkles } from "lucide-react";
import i18n from "~/lib/i18n";
import { BASE_URL, currentLang, withLangPrefix } from "~/lib/seo";
import { AppNav } from "~/components/HomeHeader";
import { AppFooter } from "~/components/AppFooter";
import { AIX_CSS } from "~/components/aix/aix-styles";
import { BOOKS_CSS } from "~/components/aix/books-styles";
import { BookCard } from "~/features/books/BookCard";
import { BOOKS } from "~/features/books/data";
import { score } from "~/features/books/scoring";
import { AI_BOOKS_UPDATED, METHOD_SOURCE } from "~/features/books/ai-books-content";
import {
  AI_BOOK_PAGES,
  getAiBookPage,
  listAiBookPages,
  type AiBookPageConfig,
  type AiBookPageLocale,
} from "@shared/books/programmatic";

function booksForPage(page: AiBookPageConfig) {
  const list =
    page.kind === "category"
      ? BOOKS.filter((book) => book.category === page.category)
      : BOOKS.filter((book) => page.asins?.includes(book.asin));
  return list.slice().sort((a, b) => score(b) - score(a));
}

export const Route = createFileRoute("/ai-books_/$slug")({
  loader: ({ params }) => {
    const page = getAiBookPage(params.slug);
    if (!page) throw notFound();
    return { page };
  },
  head: ({ params }) => {
    const page = getAiBookPage(params.slug);
    if (!page) {
      return {
        meta: [{ title: "Not found | 100mini" }, { name: "robots", content: "noindex" }],
      };
    }
    const lang = currentLang();
    const copy = page.copy[lang];
    const count = booksForPage(page).length;
    const title = i18n.t("aiBookPage.title", { topic: copy.topic, count });
    const description = copy.intro;
    const pageUrl = BASE_URL + withLangPrefix(lang, `/ai-books/${page.slug}`);
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { name: "keywords", content: i18n.t("aiBookPage.keywords", { topic: copy.topic }) },
        { name: "robots", content: "index, follow" },
        { property: "og:type", content: "website" },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: pageUrl },
        { property: "og:site_name", content: "100mini" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
      ],
      links: [
        { rel: "preconnect", href: "https://m.media-amazon.com" },
        { rel: "dns-prefetch", href: "https://m.media-amazon.com" },
      ],
    };
  },
  component: AiBookProgrammaticPage,
});

const SLUG_CSS = `
.ab-tips{list-style:none;margin:14px 0 0;padding:0;display:flex;flex-direction:column;gap:6px}
.ab-tips li{display:flex;gap:8px;font-size:12px;line-height:1.6;color:var(--aix-mute)}
.ab-tips li::before{content:"—";opacity:.5}
.ab-related{display:grid;gap:6px;margin-top:14px}
@media(min-width:640px){.ab-related{grid-template-columns:repeat(2,minmax(0,1fr))}}
`;

function AiBookProgrammaticPage() {
  const { t } = useTranslation();
  const { page } = Route.useLoaderData();
  const lang = currentLang() as AiBookPageLocale;
  const copy = page.copy[lang];
  const books = useMemo(() => booksForPage(page), [page]);
  const top = books[0];
  const totalRatings = books.reduce((sum, book) => sum + (book.reviews || 0), 0);

  const answer = top
    ? t("aiBookPage.topAnswer", {
        book: top.displayTitle || top.title,
        author: top.displayAuthor || top.author,
        rating: top.rating.toFixed(1),
        reviews: top.reviews.toLocaleString("en-US"),
      })
    : copy.intro;

  const faqs = [
    {
      q: t("aiBookPage.faq.best.q", { topic: copy.topic }),
      a: top
        ? t("aiBookPage.faq.best.a", {
            book: top.displayTitle || top.title,
            author: top.displayAuthor || top.author,
            rating: top.rating.toFixed(1),
            reviews: top.reviews.toLocaleString("en-US"),
          })
        : copy.intro,
    },
    { q: t("aiBookPage.faq.rank.q"), a: t("aiBookPage.faq.rank.a") },
    { q: t("aiBookPage.faq.free.q"), a: t("aiBookPage.faq.free.a") },
  ];

  const related = AI_BOOK_PAGES.filter((item) => item.slug !== page.slug).slice(0, 8);
  const pageUrl = BASE_URL + withLangPrefix(lang, `/ai-books/${page.slug}`);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: copy.h1,
        description: copy.intro,
        url: pageUrl,
        inLanguage: lang,
        dateModified: AI_BOOKS_UPDATED,
        author: { "@type": "Organization", name: "100mini Editorial" },
        publisher: { "@type": "Organization", name: "100mini", url: BASE_URL },
        isPartOf: { "@type": "WebSite", name: "100mini", url: BASE_URL },
        about: { "@type": "Thing", name: copy.topic },
        citation: METHOD_SOURCE[lang],
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: books.length,
          itemListElement: books.slice(0, 12).map((book, index) => ({
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
        mainEntity: faqs.map((faq) => ({
          "@type": "Question",
          name: faq.q,
          acceptedAnswer: { "@type": "Answer", text: faq.a },
        })),
      },
    ],
  };

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
          <style dangerouslySetInnerHTML={{ __html: AIX_CSS + BOOKS_CSS + SLUG_CSS }} />

          {/* BOOKS */}
          <section className="aix-frame">
            <div className="aix-lead">
              <div>
                <div className="aix-topline">
                  <span className="aix-pill lime">
                    <span className="dot" />
                    {copy.topic}
                  </span>
                  <span className="aix-kicker">{AI_BOOKS_UPDATED}</span>
                </div>
                <h1>{copy.h1}</h1>
                <p>{answer}</p>
                <p>{copy.intro}</p>
              </div>
              <div className="aix-lead-meta">
                <span>
                  {t("aiBookPage.meta", {
                    count: books.length,
                    ratings: totalRatings.toLocaleString("en-US"),
                    date: AI_BOOKS_UPDATED,
                  })}
                </span>
                <Link to="/ai-books">
                  {t("aiBookPage.back")}
                  <ChevronRight className="size-3.5" />
                </Link>
              </div>
            </div>
            <div className="aix-sec-head">
              <div>
                <div className="aix-section-num">01</div>
                <h2 className="aix-sec-title">
                  {t("aiBookPage.listTitle", { count: books.length, topic: copy.topic })}
                </h2>
              </div>
              <span className="aix-dot-sm" />
            </div>
            <div className="ab-grid">
              {books.map((book, index) => (
                <BookCard key={book.asin} book={book} index={index} subtag={page.slug} />
              ))}
            </div>
          </section>

          {/* TIPS */}
          <section className="aix-frame">
            <div className="aix-sec-head">
              <div>
                <div className="aix-section-num">02</div>
                <h2 className="aix-sec-title">{t("aiBookPage.tipsTitle")}</h2>
              </div>
              <span className="aix-dot-sm" />
            </div>
            <ul className="ab-tips">
              <li>{t("aiBookPage.tip1")}</li>
              <li>{t("aiBookPage.tip2")}</li>
              <li>{t("aiBookPage.tip3")}</li>
            </ul>
          </section>

          {/* METHOD + FAQ */}
          <section className="aix-frame">
            <div className="aix-sec-head">
              <div>
                <div className="aix-section-num">03</div>
                <h2 className="aix-sec-title">{t("aiBookPage.faqTitle")}</h2>
              </div>
              <span className="aix-dot-sm" />
            </div>
            <p className="aix-body">
              {t("aiBookPage.methodText")}{" "}
              <Link to="/ai-books" hash="methodology" className="font-semibold underline">
                {t("aiBookPage.methodLink")}
              </Link>
            </p>
            <div className="aix-faq" style={{ marginTop: 14 }}>
              {faqs.map((faq, index) => (
                <details key={index}>
                  <summary>
                    <span>{faq.q}</span>
                    <span className="plus">＋</span>
                  </summary>
                  <p className="answer">{faq.a}</p>
                </details>
              ))}
            </div>
          </section>

          {/* RELATED + FREE CTA */}
          <section className="aix-frame">
            <div className="aix-sec-head">
              <div>
                <div className="aix-section-num">04</div>
                <h2 className="aix-sec-title">{t("aiBookPage.related")}</h2>
              </div>
              <span className="aix-dot-sm" />
            </div>
            <div className="ab-related">
              {related.map((item) => (
                <Link
                  key={item.slug}
                  to="/ai-books/$slug"
                  params={{ slug: item.slug }}
                  className="ab-link"
                >
                  <span>{item.copy[lang].topic}</span>
                  <ChevronRight className="size-4 shrink-0" />
                </Link>
              ))}
            </div>
            <a
              href={withLangPrefix(lang, "/ai-books/free")}
              className="aix-strip"
              style={{ marginTop: 14 }}
            >
              <span className="k">FREE</span>
              <span>
                <strong>{t("aiBookPage.freeLink")}</strong>
                <small>{t("aiBookPage.freeCta")}</small>
              </span>
              <span className="go">
                <Sparkles className="size-4" />
              </span>
            </a>
            <Link
              to="/ai-books"
              className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="size-3.5" />
              {t("aiBookPage.back")}
            </Link>
          </section>
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
