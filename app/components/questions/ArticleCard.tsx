import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { accentVars } from "~/features/questions/articles";
import { TERMINAL_FONT } from "~/components/showcase/TerminalWindow";
import type { QuestionArticle } from "@shared/types/questions";

const COVER_THEMES = [
  { from: "#006c49", to: "#0a3d2c" }, // green
  { from: "#1d4ed8", to: "#0b2559" }, // blue
  { from: "#6d28d9", to: "#2e1065" }, // purple
  { from: "#b45309", to: "#5c2a06" }, // amber
  { from: "#be123c", to: "#5b0d1f" }, // rose
  { from: "#0f766e", to: "#083b38" }, // teal
  { from: "#24292f", to: "#0d1117" }, // github dark
  { from: "#0e7490", to: "#083344" }, // cyan
];

/** 根据 slug 稳定选一个封面主题：同一篇文章永远同一颜色，不同文章尽量不同 */
function coverTheme(slug: string) {
  if (slug.includes("codex")) return COVER_THEMES[0];
  if (slug.includes("vibe")) return COVER_THEMES[2];
  if (slug.includes("ai-")) return COVER_THEMES[1];
  if (slug.includes("github")) return COVER_THEMES[6];
  if (slug.includes("obsidian")) return COVER_THEMES[5];
  if (slug.includes("jev")) return COVER_THEMES[4];
  if (slug.includes("context")) return COVER_THEMES[7];
  if (slug.includes("workbuddy")) return COVER_THEMES[3];
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return COVER_THEMES[h % COVER_THEMES.length];
}

/** 列表页卡片：无封面图，用标题生成文字封面，避免所有文章缩略图一模一样 */
export function ArticleCard({ article, index = 0 }: { article: QuestionArticle; index?: number }) {
  const { t } = useTranslation();
  const theme = coverTheme(article.slug);
  return (
    <Link
      to="/100-questions/$slug"
      params={{ slug: article.slug }}
      style={{ ...accentVars(), fontFamily: TERMINAL_FONT }}
      className="group flex flex-col overflow-hidden rounded-lg border border-[#cfcfcf] bg-white transition-colors hover:border-[#006c49] dark:border-[#243244] dark:bg-[#0f1720] dark:hover:border-[#4edea3]"
    >
      <div
        className="relative flex aspect-[16/9] shrink-0 flex-col justify-between overflow-hidden p-5 text-white"
        style={{ background: `linear-gradient(135deg, ${theme.from}, ${theme.to})` }}
      >
        <div
          aria-hidden
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "linear-gradient(0deg, transparent 95%, rgba(255,255,255,.35) 95%), linear-gradient(90deg, transparent 95%, rgba(255,255,255,.35) 95%)",
            backgroundSize: "22px 22px",
          }}
        />
        <div className="relative flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.22em] text-white/70">
          <span>{t("questions.h1")}</span>
          <span className="font-mono tracking-normal">{String(index + 1).padStart(2, "0")}</span>
        </div>
        <div className="relative">
          <h2 className="line-clamp-3 break-words text-[17px] font-black leading-snug tracking-tight sm:text-[19px]">
            {article.title}
          </h2>
          <div className="mt-2 flex items-center gap-1.5 text-[10px] text-white/75">
            {article.chapterCount ? (
              <span>{t("questions.chapterMeta", { count: article.chapterCount })}</span>
            ) : null}
            {article.tags[0] ? (
              <>
                <span aria-hidden>·</span>
                <span className="truncate">{article.tags[0]}</span>
              </>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
          {article.summary}
        </p>
        <div className="mt-auto pt-3 text-[10px] text-muted-foreground transition-colors group-hover:text-[#006c49] dark:group-hover:text-[#4edea3]">
          → {article.slug}
        </div>
      </div>
    </Link>
  );
}
