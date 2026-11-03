import { useMemo } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ChevronRight, Sparkles } from "lucide-react";
import i18n from "~/lib/i18n";
import { BASE_URL, currentLang, withLangPrefix } from "~/lib/seo";
import { AppNav } from "~/components/HomeHeader";
import { AppFooter } from "~/components/AppFooter";
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
    <div className="flex min-h-screen flex-col bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <AppNav />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
          <nav className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            <Link to="/ai-books" className="font-medium text-primary hover:underline">
              {t("aiBooks.h1")}
            </Link>
            <ChevronRight className="size-3.5" />
            <span>{copy.topic}</span>
          </nav>

          <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {copy.h1}
          </h1>
          <p className="mt-3 max-w-3xl rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm leading-relaxed text-foreground/90">
            {answer}
          </p>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            {copy.intro}
          </p>
          <p className="mt-2 text-[11px] text-muted-foreground">
            {t("aiBookPage.meta", {
              count: books.length,
              ratings: totalRatings.toLocaleString("en-US"),
              date: AI_BOOKS_UPDATED,
            })}
          </p>

          <h2 className="mt-7 text-base font-bold text-foreground">
            {t("aiBookPage.listTitle", { count: books.length, topic: copy.topic })}
          </h2>

          <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {books.map((book, index) => (
              <BookCard key={book.asin} book={book} index={index} subtag={page.slug} />
            ))}
          </div>

          <section className="mt-10 border-t border-border pt-5">
            <h2 className="text-base font-bold text-foreground">{t("aiBookPage.tipsTitle")}</h2>
            <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-muted-foreground">
              <li>• {t("aiBookPage.tip1")}</li>
              <li>• {t("aiBookPage.tip2")}</li>
              <li>• {t("aiBookPage.tip3")}</li>
            </ul>
          </section>

          <section className="mt-8 border-t border-border pt-5">
            <h2 className="text-base font-bold text-foreground">{t("aiBookPage.method")}</h2>
            <p className="mt-1 max-w-3xl text-xs leading-relaxed text-muted-foreground">
              {t("aiBookPage.methodText")}{" "}
              <Link
                to="/ai-books"
                hash="methodology"
                className="font-medium text-primary hover:underline"
              >
                {t("aiBookPage.methodLink")}
              </Link>
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-base font-bold text-foreground">{t("aiBookPage.faqTitle")}</h2>
            <div className="mt-2 divide-y divide-border rounded-xl border border-border bg-card">
              {faqs.map((faq, index) => (
                <details key={index} className="group px-4 py-3">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-medium text-foreground [&::-webkit-details-marker]:hidden">
                    {faq.q}
                    <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-90" />
                  </summary>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{faq.a}</p>
                </details>
              ))}
            </div>
          </section>

          <section className="mt-8 rounded-xl border border-border bg-card px-4 py-3">
            <p className="text-sm font-medium text-foreground">{t("aiBookPage.freeCta")}</p>
            <Link
              to="/ai-books/free"
              className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              <Sparkles className="size-3.5" />
              {t("aiBookPage.freeLink")}
            </Link>
          </section>

          <section className="mt-8 border-t border-border pt-5">
            <h2 className="text-base font-bold text-foreground">{t("aiBookPage.related")}</h2>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {related.map((item) => (
                <Link
                  key={item.slug}
                  to="/ai-books/$slug"
                  params={{ slug: item.slug }}
                  className="group flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                >
                  <span>{item.copy[lang].topic}</span>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground group-hover:text-primary" />
                </Link>
              ))}
            </div>
          </section>

          <div className="mt-8">
            <Link
              to="/ai-books"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-4" />
              {t("aiBookPage.back")}
            </Link>
          </div>
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
