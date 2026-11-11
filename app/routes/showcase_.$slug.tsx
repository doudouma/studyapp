import { createFileRoute, Link, notFound, useLoaderData } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { currentLang } from "~/lib/seo";
import { AppNav } from "~/components/HomeHeader";
import { AppFooter } from "~/components/AppFooter";
import { CaseActions } from "~/components/showcase/CaseActions";
import { CaseBody } from "~/components/showcase/CaseBody";
import { CaseFacts } from "~/components/showcase/CaseFacts";
import { CaseMedia } from "~/components/showcase/CaseMedia";
import { CaseSources } from "~/components/showcase/CaseSources";
import { CaseToc } from "~/components/showcase/CaseToc";
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
import { buildCaseToc } from "~/features/showcase/toc";
import { buildCaseHead } from "~/features/showcase/seo";

export const Route = createFileRoute("/showcase_/$slug")({
  // 案例内容按语言懒加载；loader 负责取正文，head 再取一次是缓存命中
  loader: async ({ params }) => {
    const lang = currentLang();
    const item = await getCaseBySlug(params.slug, lang);
    if (!item) throw notFound();
    const related = await getRelatedCases(item.slug, lang, 3);
    return { item, related, toc: buildCaseToc(item.body) };
  },
  head: async ({ params }) => {
    const item = await getCaseBySlug(params.slug, currentLang());
    if (!item) {
      return {
        meta: [
          { title: "Not found | 100mini" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    return buildCaseHead(item);
  },
  component: CaseDetailPage,
});

function CaseDetailPage() {
  const { t } = useTranslation();
  const { item, related, toc } = useLoaderData({ from: Route.id });

  return (
    <div className="flex min-h-screen flex-col">
      <AppNav />

      {/* 移动端底部有固定的操作条（CaseActions），留出可滚动空间 */}
      <main className="flex-1 pb-24 lg:pb-0">
        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[200px_minmax(0,1fr)] xl:grid-cols-[220px_768px] xl:justify-center">
            <CaseToc toc={toc} />
            <div className="min-w-0">
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
                    className="rounded-full border border-[#cfcfcf] px-2.5 py-0.5 text-[10px] text-muted-foreground dark:border-[#2a2d32]"
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

              {/* 移动端目录：左侧导航只在 lg 以上显示 */}
              {toc.length > 0 ? (
                <details className="mt-4 rounded-lg border border-[#cfcfcf] bg-white px-3.5 py-3 lg:hidden dark:border-[#2a2d32] dark:bg-[#0f1720]">
                  <summary className="cursor-pointer select-none text-[11px] font-bold text-[#000000] dark:text-[#e6edf6]">
                    {t("showcase.toc")}
                    <span className="ml-1.5 font-normal text-muted-foreground">
                      {t("showcase.tocMeta", {
                        sections: toc.length,
                        items: toc.reduce((n, s) => n + s.children.length, 0),
                      })}
                    </span>
                  </summary>
                  <div className="mt-3 space-y-2">
                    {toc.map((section) => (
                      <div key={section.id}>
                        <a
                          href={`#${section.id}`}
                          className="text-[11px] font-bold text-[color:var(--sc-accent)] hover:underline dark:text-[color:var(--sc-accent-dark)]"
                        >
                          {section.title}
                        </a>
                        {section.children.length > 0 ? (
                          <ul className="mt-1 grid grid-cols-1 gap-x-4 sm:grid-cols-2">
                            {section.children.map((child) => (
                              <li key={child.id} className="truncate">
                                <a
                                  href={`#${child.id}`}
                                  className="text-[10.5px] text-muted-foreground hover:text-foreground hover:underline"
                                >
                                  {child.title}
                                </a>
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </details>
              ) : null}

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
                        className="flex items-center justify-between gap-3 border-t border-dashed border-[#e0e0e0] py-1.5 first:border-t-0 dark:border-[#2a2d32]"
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
          </div>
        </div>
      </main>

      <AppFooter />
    </div>
  );
}
