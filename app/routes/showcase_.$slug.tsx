import { createFileRoute, Link, notFound, useLoaderData } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import i18n from "~/lib/i18n";
import { BASE_URL } from "~/lib/lang";
import { AppNav } from "~/components/HomeHeader";
import { AppFooter } from "~/components/AppFooter";
import { CaseActions } from "~/components/showcase/CaseActions";
import { CaseBlocks } from "~/components/showcase/CaseBlocks";
import { CaseFacts } from "~/components/showcase/CaseFacts";
import { CaseMedia } from "~/components/showcase/CaseMedia";
import { CaseSources } from "~/components/showcase/CaseSources";
import {
  TerminalCmd,
  TerminalCursor,
  TerminalPrompt,
  TerminalWindow,
} from "~/components/showcase/TerminalWindow";
import { accentVars, getCaseBySlug, getRelatedCases } from "~/features/showcase/cases";

function caseUrl(slug: string): string {
  return `${BASE_URL}/showcase/${slug}`;
}

export const Route = createFileRoute("/showcase_/$slug")({
  loader: ({ params }) => {
    const item = getCaseBySlug(params.slug);
    if (!item) throw notFound();
    return item;
  },
  head: ({ params }) => {
    const item = getCaseBySlug(params.slug);
    if (!item) return { meta: [{ title: "Not found | 100mini" }] };

    const title = `${item.name} — 100mini Case Library`;
    const url = caseUrl(item.slug);

    const article: Record<string, unknown> = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: item.name,
      description: item.summary,
      url,
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
      inLanguage: "en",
      keywords: item.tags.join(", "),
      articleSection: item.category,
      publisher: { "@type": "Organization", name: "100mini", url: BASE_URL },
      author: item.author ? { "@type": "Person", name: item.author } : undefined,
      datePublished: item.publishedAt,
      dateModified: item.updatedAt ?? item.publishedAt,
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
            thumbnailUrl: item.cover.videoPoster
              ? item.cover.videoPoster.startsWith("/")
                ? BASE_URL + item.cover.videoPoster
                : item.cover.videoPoster
              : undefined,
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
          item: `${BASE_URL}/showcase`,
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
        ...(item.cover?.src ? [{ property: "og:image", content: BASE_URL + item.cover.src }] : []),
        { name: "twitter:card", content: "summary" },
        { name: "twitter:title", content: title },
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
  const item = useLoaderData({ from: Route.id });
  const related = getRelatedCases(item.slug);

  return (
    <div className="flex min-h-screen flex-col">
      <AppNav />

      <main className="flex-1">
        <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
          <TerminalWindow
            title={`100mini ~ /showcase/${item.slug} — zsh`}
            bodyClassName="p-4 text-[11.5px] sm:p-6"
          >
            <article style={accentVars(item)}>
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

              <h1 className="mt-3 text-2xl font-bold leading-tight tracking-tight text-[#26302b] sm:text-3xl dark:text-[#e6edf6]">
                {item.name}
              </h1>
              <p className="mt-2 text-[12.5px] leading-relaxed text-muted-foreground">
                {item.summary}
              </p>

              <div className="mt-3 flex flex-wrap gap-1.5">
                <span className="rounded-full bg-[color:var(--sc-accent)] px-2.5 py-0.5 text-[10px] font-semibold text-white">
                  {item.category}
                </span>
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-[#d9d9d0] px-2.5 py-0.5 text-[10px] text-muted-foreground dark:border-[#243244]"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <CaseActions item={item} />

              <CaseMedia item={item} />

                <div className="mt-5">
                  <CaseFacts facts={item.facts} />
                </div>

                {item.sections.map((section) => (
                  <section key={section.heading}>
                    <h2 className="mt-6 text-[13px] font-bold text-[#26302b] before:text-muted-foreground/40 before:content-['##_'] dark:text-[#e6edf6]">
                      {section.heading}
                    </h2>
                    <div className="mt-1.5 space-y-2.5">
                      {section.paragraphs?.map((p, i) => (
                        <p
                          key={i}
                          className="text-[11.5px] leading-[1.75] text-[#4b5563] dark:text-[#9fb0c3]"
                        >
                          {p}
                        </p>
                      ))}
                      {section.blocks?.length ? <CaseBlocks blocks={section.blocks} /> : null}
                    </div>
                  </section>
                ))}

                <CaseSources sources={item.sources} />

                {related.length > 0 ? (
                  <section>
                    <h2 className="mt-6 text-[13px] font-bold text-[#26302b] before:text-muted-foreground/40 before:content-['##_'] dark:text-[#e6edf6]">
                      {t("showcase.section.related")}
                    </h2>
                    <ul className="mt-1.5">
                      {related.map((r) => (
                        <li
                          key={r.slug}
                          className="flex items-center justify-between gap-3 border-t border-dashed border-[#e6e6de] py-1.5 first:border-t-0 dark:border-[#243244]"
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
                            {r.category}
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
