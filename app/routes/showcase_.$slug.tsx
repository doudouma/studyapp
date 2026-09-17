import { createFileRoute, Link, notFound, useLoaderData } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import i18n from "~/lib/i18n";
import { BASE_URL, currentLang, getBcp47, withLangPrefix } from "~/lib/seo";
import type { ShowcaseLocale } from "@shared/types/showcase";
import { AppNav } from "~/components/HomeHeader";
import { AppFooter } from "~/components/AppFooter";
import { CaseActions } from "~/components/showcase/CaseActions";
import { CaseBody } from "~/components/showcase/CaseBody";
import { CaseFacts } from "~/components/showcase/CaseFacts";
import { CaseMedia } from "~/components/showcase/CaseMedia";
import { CaseSources } from "~/components/showcase/CaseSources";
import {
  TerminalCmd,
  TerminalCursor,
  TerminalPrompt,
  TerminalWindow,
} from "~/components/showcase/TerminalWindow";
import {
  accentVars,
  getCaseBySlug,
  getFactRows,
  getRelatedCases,
} from "~/features/showcase/cases";

/** 案例页 URL：按内容实际语言加前缀（未翻译的案例指回英文原版） */
function caseUrl(slug: string, locale: ShowcaseLocale): string {
  return BASE_URL + withLangPrefix(locale, `/showcase/${slug}`);
}

export const Route = createFileRoute("/showcase_/$slug")({
  loader: ({ params }) => {
    const item = getCaseBySlug(params.slug, currentLang());
    if (!item) throw notFound();
    return item;
  },
  head: ({ params }) => {
    const lang = currentLang();
    const item = getCaseBySlug(params.slug, lang);
    if (!item) return { meta: [{ title: "Not found | 100mini" }] };

    const title = `${item.name} — 100mini Case Library`;
    const url = caseUrl(item.slug, item.locale);
    // 案例封面：public 下用根路径，外链原样；缺省时由 __root 的站点级兜底图接上
    const image = item.cover?.src
      ? item.cover.src.startsWith("/")
        ? BASE_URL + item.cover.src
        : item.cover.src
      : undefined;
    const videoPoster = item.cover?.videoPoster
      ? item.cover.videoPoster.startsWith("/")
        ? BASE_URL + item.cover.videoPoster
        : item.cover.videoPoster
      : undefined;

    const article: Record<string, unknown> = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: item.name,
      description: item.summary,
      url,
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
      inLanguage: getBcp47(item.locale),
      keywords: item.tags.join(", "),
      articleSection: item.category,
      publisher: { "@type": "Organization", name: "100mini", url: BASE_URL },
      author: item.author ? { "@type": "Person", name: item.author } : undefined,
      datePublished: item.publishedAt,
      dateModified: item.updatedAt ?? item.publishedAt,
      // Article 富结果要求 headline + image + datePublished 三者齐备
      image,
      isBasedOn: item.externalUrl,
      citation: item.sources.map((s) => ({
        "@type": "CreativeWork",
        name: s.title,
        url: s.url,
      })),
      video: item.cover?.video
        ? {
            "@type": "VideoObject",
            contentUrl: item.cover.video,
            name: item.name,
            description: item.summary,
            thumbnailUrl: videoPoster ?? image,
          }
        : undefined,
    };

    const breadcrumb = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: i18n.t("nav.home"),
          item: BASE_URL + "/",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: i18n.t("showcase.heading"),
          item: BASE_URL + withLangPrefix(lang, "/showcase"),
        },
        { "@type": "ListItem", position: 3, name: item.name, item: url },
      ],
    };

    return {
      meta: [
        { title },
        { name: "description", content: item.summary },
        { name: "keywords", content: item.tags.join(", ") },
        { name: "robots", content: "index, follow" },
        { property: "og:type", content: "article" },
        { property: "og:title", content: title },
        { property: "og:description", content: item.summary },
        { property: "og:url", content: url },
        { property: "og:site_name", content: "100mini" },
        ...(image
          ? [
              { property: "og:image", content: image },
              { property: "og:image:alt", content: item.name },
            ]
          : []),
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        ...(image ? [{ name: "twitter:image", content: image }] : []),
        { name: "twitter:description", content: item.summary },
      ],
      scripts: [
        { type: "application/ld+json", children: JSON.stringify(article) },
        { type: "application/ld+json", children: JSON.stringify(breadcrumb) },
      ],
    };
  },
  component: CaseDetailPage,
});

function CaseDetailPage() {
  const { t } = useTranslation();
  const lang = currentLang();
  const item = useLoaderData({ from: Route.id });
  const related = getRelatedCases(item.slug, lang, 3);

  return (
    <div className="flex min-h-screen flex-col">
      <AppNav />

      {/* 移动端底部有固定的操作条（CaseActions），留出可滚动空间 */}
      <main className="flex-1 pb-24 lg:pb-0">
        <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
          <TerminalWindow
            title={`100mini ~ /showcase/${item.slug} — zsh`}
            bodyClassName="p-4 text-[11.5px] sm:p-6"
          >
            <article style={accentVars()}>
              <div className="text-[10px]">
                <TerminalPrompt /> <TerminalCmd>cat /showcase/{item.slug}</TerminalCmd>
              </div>
              <nav
                aria-label={t("showcase.breadcrumb")}
                className="mt-1 text-[10px] text-muted-foreground"
              >
                <Link to="/showcase" className="hover:underline">
                  {t("showcase.heading")}
                </Link>
                <span className="mx-1.5">/</span>
                <span>{item.name}</span>
              </nav>

              <h1 className="mt-3 text-2xl font-bold leading-tight tracking-tight text-[#000000] sm:text-3xl dark:text-[#e6edf6]">
                {item.name}
              </h1>
              <p className="mt-2 text-[12.5px] leading-relaxed text-muted-foreground">
                {item.summary}
              </p>

              <div className="mt-3 flex flex-wrap gap-1.5">
                <span className="rounded-full bg-[color:var(--sc-accent)] px-2.5 py-0.5 text-[10px] font-semibold text-white">
                  {t(`showcase.category.${item.category}`)}
                </span>
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-[#cfcfcf] px-2.5 py-0.5 text-[10px] text-muted-foreground dark:border-[#243244]"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <CaseActions item={item} />

              <CaseMedia item={item} />

              <div className="mt-5">
                <CaseFacts facts={getFactRows(item)} />
              </div>

              <CaseBody item={item} />

              <CaseSources sources={item.sources} />

              {related.length > 0 ? (
                <section>
                  <h2 className="mt-6 text-[13px] font-bold text-[#000000] before:text-muted-foreground/40 before:content-['##_'] dark:text-[#e6edf6]">
                    {t("showcase.section.related")}
                  </h2>
                  <ul className="mt-1.5">
                    {related.map((r) => (
                      <li
                        key={r.slug}
                        className="flex items-center justify-between gap-3 border-t border-dashed border-[#e0e0e0] py-1.5 first:border-t-0 dark:border-[#243244]"
                      >
                        <Link
                          to="/showcase/$slug"
                          params={{ slug: r.slug }}
                          className="min-w-0 truncate text-[11.5px] hover:underline"
                        >
                          <TerminalCmd className="font-normal">→ </TerminalCmd>
                          {r.name}
                        </Link>
                        <span className="shrink-0 text-[10px] text-muted-foreground">
                          {t(`showcase.category.${r.category}`)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              <div className="mt-6 text-[11px]">
                <TerminalPrompt /> <TerminalCmd>./cite {item.slug}</TerminalCmd>{" "}
                <TerminalCursor />
              </div>

              <div className="mt-4">
                <Link
                  to="/showcase"
                  className="text-[10.5px] text-muted-foreground hover:underline"
                >
                  ← {t("showcase.backToList")}
                </Link>
              </div>
            </article>
          </TerminalWindow>
        </div>
      </main>

      <AppFooter />
    </div>
  );
}
