import { useTranslation } from "react-i18next";
import type { QuestionTocChapter } from "~/features/questions/toc";

/**
 * 100 问地图：10×10（桌面 20×5）编号格子，已读/当前题高亮。
 * 点击任意格子跳转到对应题目，并同步阅读进度。
 */
export function QuestionMap({
  toc,
  visited,
  activeQuestionId,
  onSelect,
  onReset,
}: {
  toc: QuestionTocChapter[];
  visited: Set<string>;
  activeQuestionId: string | null;
  onSelect: (id: string) => void;
  onReset: () => void;
}) {
  const { t } = useTranslation();
  const questions = toc.flatMap((chapter) => chapter.questions);
  const read = questions.filter((question) => visited.has(question.id)).length;
  const total = questions.length;
  const percent = total ? (read / total) * 100 : 0;

  return (
    <section className="mt-4 rounded-lg border border-[#cfcfcf] bg-white p-3.5 dark:border-[#243244] dark:bg-[#0f1720]">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-[11px] font-bold text-[#000000] dark:text-[#e6edf6]">
          {t("questions.map.title")}
        </h2>
        <span className="text-[10px] text-muted-foreground">
          {t("questions.map.read", { read, total })}
        </span>
      </div>

      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#e0e0e0] dark:bg-[#243244]">
        <div
          className="h-full rounded-full bg-[color:var(--sc-accent)] transition-[width] dark:bg-[color:var(--sc-accent-dark)]"
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="qs-map-grid mt-3">
        {questions.map((question, index) => {
          const isRead = visited.has(question.id);
          const isActive = activeQuestionId === question.id;
          const n = question.number ?? index + 1;
          return (
            <a
              key={question.id}
              href={`#${question.id}`}
              onClick={() => onSelect(question.id)}
              title={question.title}
              aria-label={`${n}. ${question.title}`}
              aria-current={isActive ? "location" : undefined}
              className={`flex aspect-square items-center justify-center rounded-[3px] text-[9px] font-bold transition-colors ${
                isActive
                  ? "bg-[color:var(--sc-accent)] text-white ring-2 ring-[color:var(--sc-accent)] ring-offset-1 ring-offset-white dark:bg-[color:var(--sc-accent-dark)] dark:text-[#002113] dark:ring-[color:var(--sc-accent-dark)] dark:ring-offset-[#0f1720]"
                  : isRead
                    ? "bg-[color:var(--sc-accent)] text-white hover:opacity-85 dark:bg-[color:var(--sc-accent-dark)] dark:text-[#002113]"
                    : "border border-[#d8d8d8] text-muted-foreground hover:border-[color:var(--sc-accent)] hover:text-[color:var(--sc-accent)] dark:border-[#2c3a4b] dark:hover:border-[color:var(--sc-accent-dark)] dark:hover:text-[color:var(--sc-accent-dark)]"
              }`}
            >
              {n}
            </a>
          );
        })}
      </div>

      <div className="mt-2 flex items-center justify-between text-[9px] text-muted-foreground">
        <span>{t("questions.map.hint")}</span>
        <button
          type="button"
          onClick={onReset}
          className="cursor-pointer hover:text-[color:var(--sc-accent)] dark:hover:text-[color:var(--sc-accent-dark)]"
        >
          {t("questions.map.reset")}
        </button>
      </div>
    </section>
  );
}
