import { useTranslation } from "react-i18next";
import type { ShowcaseSource } from "@shared/types/showcase";

/**
 * 详情页编号来源清单（外链，便于正文 [n] 引用）
 * 强调色来自祖先元素的 --sc-accent / --sc-accent-dark 变量
 */
export function CaseSources({ sources }: { sources: ShowcaseSource[] }) {
  const { t } = useTranslation();
  if (sources.length === 0) return null;

  return (
    <section>
      <h2 className="mt-6 text-[13px] font-bold text-[#000000] before:text-muted-foreground/40 before:content-['##_'] dark:text-[#e6edf6]">
        {t("showcase.section.sources")}
      </h2>
      <ol className="mt-1">
        {sources.map((s, i) => (
          <li
            key={s.url}
            className="flex gap-2.5 border-t border-dashed border-[#e0e0e0] py-2 first:border-t-0 dark:border-[#243244]"
          >
            <span className="shrink-0 text-[11px] font-bold text-[color:var(--sc-accent)] dark:text-[color:var(--sc-accent-dark)]">
              [{i + 1}]
            </span>
            <div className="min-w-0">
              <a
                href={s.url}
                target="_blank"
                rel="noopener"
                className="text-[11.5px] break-words text-[#1d4ed8] underline underline-offset-2 dark:text-[#7dd3fc]"
              >
                {s.title}
              </a>
              {s.publisher || s.date ? (
                <div className="text-[10px] text-muted-foreground">
                  {[s.publisher, s.date].filter(Boolean).join(" · ")}
                </div>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
