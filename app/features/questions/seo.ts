import { BASE_URL, getBcp47, withLangPrefix, DEFAULT_OG_IMAGE } from "~/lib/seo";
import type { QuestionArticle, QuestionLocale } from "@shared/types/questions";
import { buildQuestionToc } from "./toc";
import { buildQuestionFaq } from "./faq";

/**
 * 「100 个问题」的结构化数据。
 *
 * 这些 JSON-LD 由页面组件直接渲染到 body，而不是走 route head 的
 * `scripts`：TanStack 的 HeadContent 在客户端会再次渲染 head，
 * 导致 SSR 已输出的 JSON-LD 被重复插入。放在组件里由 React 管理，
 * SSR 与客户端导航都只有一份。
 */
export function buildQuestionArticleJsonLd(
  article: QuestionArticle,
  collectionName = "100 Questions",
): object[] {
  const url = BASE_URL + withLangPrefix(article.locale, `/100-questions/${article.slug}`);
  const sections = buildQuestionToc(article.body).map((chapter) => chapter.title);
  const faq = article.faq === false ? [] : buildQuestionFaq(article.body);

  const articleBlock = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: article.title,
      description: article.summary,
      url,
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
      image: DEFAULT_OG_IMAGE,
      inLanguage: getBcp47(article.locale),
      datePublished: article.publishedAt,
      dateModified: article.updatedAt ?? article.publishedAt,
      author: { "@type": "Organization", name: article.author ?? "100mini" },
      publisher: { "@type": "Organization", name: "100mini", url: BASE_URL },
      articleSection: sections,
      isAccessibleForFree: true,
      about: article.tags.slice(0, 3).map((name) => ({
        "@type": "Thing",
        name,
      })),
  };
  const breadcrumbBlock = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "100mini", item: BASE_URL },
        {
          "@type": "ListItem",
          position: 2,
          name: collectionName,
          item: BASE_URL + withLangPrefix(article.locale, "/100-questions"),
        },
        { "@type": "ListItem", position: 3, name: article.title, item: url },
      ],
  };
  const blocks: object[] = [articleBlock];
  if (article.faq !== false && faq.length > 0) {
    blocks.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      inLanguage: getBcp47(article.locale),
      mainEntity: faq.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
    });
  }
  blocks.push(breadcrumbBlock);
  return blocks;
}

export function buildQuestionCollectionJsonLd(
  articles: QuestionArticle[],
  locale: QuestionLocale,
  name: string,
  description: string,
): object {
  const url = BASE_URL + withLangPrefix(locale, "/100-questions");
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url,
    numberOfItems: articles.length,
    hasPart: articles.map((article) => ({
      "@type": "Article",
      headline: article.title,
      url: BASE_URL + withLangPrefix(article.locale, `/100-questions/${article.slug}`),
    })),
  };
}
