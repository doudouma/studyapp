import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { accentVars } from "~/features/questions/articles";
import { TERMINAL_FONT } from "~/components/showcase/TerminalWindow";
import type { QuestionArticle } from "@shared/types/questions";

/** 列表页卡片：无封面图，用「100」字样做主视觉，保持终端风格 */
export function ArticleCard({ article, index = 0 }: { article: QuestionArticle; index?: number }) {
  const { t } = useTranslation();
  return (
    <Link
      to="/100-questions/$slug"
      params={{ slug: article.slug }}
      style={{ ...accentVars(), fontFamily: TERMINAL_FONT }}
      className="group flex flex-col overflow-hidden rounded-lg border border-[#cfcfcf] bg-white transition-colors hover:border-[#006c49] dark:border-[#243244] dark:bg-[#0f1720] dark:hover:border-[#4edea3]"
    >
      <div className="relative flex aspect-[16/9] shrink-0 flex-col justify-between overflow-hidden bg-[#006c49] p-5 text-white dark:bg-[#0a3d2c]">
        <div
          aria-hidden
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              "linear-gradient(0deg, transparent 95%, rgba(255,255,255,.35) 95%), linear-gradient(90deg, transparent 95%, rgba(255,255,255,.35) 95%)",
            backgroundSize: "22px 22px",
          }}
        />
        <span className="relative text-[10px] font-bold uppercase tracking-[0.22em] text-white/70">
          100 questions
        </span>
        <div className="relative flex items-end justify-between gap-3">
          <span className="text-[64px] font-black leading-[0.8] tracking-tighter sm:text-[72px]">
            100
          </span>
          <span className="mb-1 max-w-[9rem] text-right text-[10px] leading-snug text-white/75">
            {article.chapterCount ? t("questions.chapterMeta", { count: article.chapterCount }) : ""}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="text-[9px] font-bold uppercase tracking-wider text-[color:var(--sc-accent)] dark:text-[color:var(--sc-accent-dark)]">
          {article.questionCount ? t("questions.cardMeta", { count: article.questionCount }) : "topics"}
          {article.tags[0] ? <span className="text-muted-foreground"> · {article.tags[0]}</span> : null}
        </div>
        <h2 className="mt-1 text-sm font-bold leading-snug text-[#000000] dark:text-[#e6edf6]">
          {article.title}
        </h2>
        <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
          {article.summary}
        </p>
        <div className="mt-auto pt-3 text-[10px] text-muted-foreground transition-colors group-hover:text-[#006c49] dark:group-hover:text-[#4edea3]">
          → {article.slug}
        </div>
      </div>
    </Link>
  );
}
