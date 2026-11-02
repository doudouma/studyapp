import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Check } from "lucide-react";
import { TERMINAL_FONT } from "~/components/showcase/TerminalWindow";
import type { QuestionTocChapter } from "~/features/questions/toc";

/**
 * 详情页左侧目录（桌面端）。
 * - 每章可独立展开/收起，支持同时展开多章
 * - 滚动正文时高亮当前章节和当前问题（用户随时知道看到哪儿）
 * - 点击过的菜单项留下 ✓，并按文章记录本次会话的阅读进度
 * - 移动端隐藏，改用正文上方的可折叠目录
 */
export function QuestionSidebar({
  toc,
  totalQuestions,
  visited,
  onVisited,
  onActiveQuestionChange,
}: {
  toc: QuestionTocChapter[];
  totalQuestions: number;
  visited: Set<string>;
  onVisited: (id: string) => void;
  onActiveQuestionChange?: (id: string | null) => void;
}) {
  const { t } = useTranslation();
  const navRef = useRef<HTMLElement>(null);
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(toc[0] ? [toc[0].id] : []),
  );
  const [activeChapterId, setActiveChapterId] = useState<string | null>(toc[0]?.id ?? null);
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);

  /** 展开/收起单章，不影响其它章 */
  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const markVisited = (id: string) => {
    onVisited(id);
  };

  // 切文章时重置展开/高亮
  useEffect(() => {
    setActiveChapterId(toc[0]?.id ?? null);
    setActiveQuestionId(null);
    setExpanded(new Set(toc[0] ? [toc[0].id] : []));
  }, [toc]);

  /** 扁平化标题列表，按 DOM 顺序用于滚动定位 */
  const headings = useMemo(
    () =>
      toc.flatMap((chapter) => [
        { id: chapter.id, chapterId: chapter.id, question: false },
        ...chapter.questions.map((q) => ({
          id: q.id,
          chapterId: chapter.id,
          question: true,
        })),
      ]),
    [toc],
  );

  useEffect(() => {
    onActiveQuestionChange?.(activeQuestionId);
  }, [activeQuestionId, onActiveQuestionChange]);

  // 跟随正文：找到最后一个越过顶部的标题，高亮对应章节/问题。
  // 每次 update 重新查询 DOM，避免正文 HTML 被替换后持有失效节点。
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const items = headings
        .map((h) => ({ ...h, el: document.getElementById(h.id) }))
        .filter((h): h is typeof h & { el: HTMLElement } => Boolean(h.el));
      if (items.length === 0) return;

      const line = 112; // 顶部 sticky 导航以下
      let current = items[0];
      for (const item of items) {
        if (item.el.getBoundingClientRect().top <= line) current = item;
        else break;
      }
      if (!current) return;
      setActiveChapterId(current.chapterId);
      setActiveQuestionId(current.question ? current.id : null);
      setExpanded((prev) =>
        prev.has(current.chapterId) ? prev : new Set(prev).add(current.chapterId),
      );
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [headings]);

  // 当前项被高亮后，把它滚进侧栏可视区（只滚动侧栏本身）
  const activeItemId = activeQuestionId ?? activeChapterId;
  useEffect(() => {
    if (!activeItemId) return;
    const nav = navRef.current;
    const item =
      nav?.querySelector<HTMLElement>(`[data-question-id="${activeItemId}"]`) ??
      nav?.querySelector<HTMLElement>(`[data-chapter-id="${activeItemId}"]`);
    if (!nav || !item) return;
    const navRect = nav.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();
    if (itemRect.top < navRect.top + 4) {
      nav.scrollTop += itemRect.top - navRect.top - 8;
    } else if (itemRect.bottom > navRect.bottom - 4) {
      nav.scrollTop += itemRect.bottom - navRect.bottom + 8;
    }
  }, [activeItemId]);

  const readCount = toc
    .flatMap((chapter) => chapter.questions)
    .filter((question) => visited.has(question.id)).length;

  return (
    <aside className="hidden lg:block lg:self-stretch">
      <div
        style={{ fontFamily: TERMINAL_FONT }}
        className="sticky top-20 overflow-hidden rounded-xl border border-[#cfcfcf] bg-white dark:border-[#243244] dark:bg-[#0f1720]"
      >
        <div className="flex items-center justify-between gap-2 border-b border-[#cfcfcf] bg-[#ececec] px-3 py-2 dark:border-[#243244] dark:bg-[#151d2b]">
          <span className="text-[10px] text-muted-foreground">$ cat toc.md</span>
          <span
            className="shrink-0 text-[9px] text-muted-foreground"
            title={t("questions.tocMeta", {
              chapters: toc.length,
              questions: totalQuestions,
            })}
          >
            {readCount}/{totalQuestions}
          </span>
        </div>
        <div className="h-0.5 bg-[#e0e0e0] dark:bg-[#243244]">
          <div
            className="h-full bg-[#006c49] transition-[width] dark:bg-[#4edea3]"
            style={{ width: `${totalQuestions ? (readCount / totalQuestions) * 100 : 0}%` }}
          />
        </div>

        <nav
          ref={navRef}
          aria-label={t("questions.toc")}
          className="relative max-h-[calc(100vh-9rem)] overflow-y-auto p-2 text-[10.5px]"
        >
          {toc.map((chapter) => {
            const open = expanded.has(chapter.id);
            const activeChapter = activeChapterId === chapter.id;
            const chapterVisited =
              visited.has(chapter.id) ||
              chapter.questions.some((question) => visited.has(question.id));
            return (
              <div key={chapter.id} className="mb-0.5" data-chapter-id={chapter.id}>
                <div
                  className={`flex items-center gap-0.5 rounded-md transition-colors ${
                    activeChapter
                      ? "bg-[#006c49]/10 text-[#006c49] dark:bg-[#4edea3]/10 dark:text-[#4edea3]"
                      : "text-[#000000] hover:bg-[#ececec] dark:text-[#e6edf6] dark:hover:bg-[#151d2b]"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggle(chapter.id)}
                    aria-expanded={open}
                    aria-controls={`toc-${chapter.id}`}
                    aria-label={open ? t("questions.collapse") : t("questions.expand")}
                    className="flex size-6 shrink-0 cursor-pointer items-center justify-center text-[9px] text-muted-foreground hover:text-foreground"
                  >
                    <span className={`transition-transform ${open ? "rotate-90" : ""}`}>▶</span>
                  </button>
                  <a
                    href={`#${chapter.id}`}
                    onClick={() => {
                      setActiveChapterId(chapter.id);
                      setActiveQuestionId(null);
                      markVisited(chapter.id);
                      setExpanded((prev) =>
                        prev.has(chapter.id) ? prev : new Set(prev).add(chapter.id),
                      );
                    }}
                    className="flex min-w-0 flex-1 items-center gap-1 truncate py-1.5 font-bold"
                    aria-current={activeChapter ? "location" : undefined}
                  >
                    {chapterVisited && !activeChapter ? (
                      <Check
                        aria-label={t("questions.visited")}
                        className="size-2.5 shrink-0 text-[#006c49] dark:text-[#4edea3]"
                      />
                    ) : null}
                    <span className="truncate">{chapter.title}</span>
                  </a>
                  <span className="mr-2 shrink-0 text-[9px] font-normal text-muted-foreground">
                    {chapter.questions.length}
                  </span>
                </div>

                {open && chapter.questions.length > 0 ? (
                  <ul
                    id={`toc-${chapter.id}`}
                    className="mb-1 ml-[1.15rem] mt-0.5 space-y-0.5 border-l border-dashed border-[#e0e0e0] pl-1.5 dark:border-[#243244]"
                  >
                    {chapter.questions.map((question) => {
                      const active = activeQuestionId === question.id;
                      const seen = visited.has(question.id);
                      return (
                        <li key={question.id} data-question-id={question.id}>
                          <a
                            href={`#${question.id}`}
                            onClick={() => {
                              setActiveChapterId(chapter.id);
                              setActiveQuestionId(question.id);
                              markVisited(question.id);
                            }}
                            aria-current={active ? "location" : undefined}
                            title={question.title}
                            className={`flex items-center gap-1 rounded px-1.5 py-[3px] text-[10px] transition-colors ${
                              active
                                ? "bg-[#006c49] font-semibold text-white dark:bg-[#4edea3] dark:text-[#002113]"
                                : "text-muted-foreground hover:bg-[#ececec] hover:text-foreground dark:hover:bg-[#151d2b]"
                            }`}
                          >
                            {seen && !active ? (
                              <Check
                                aria-label={t("questions.visited")}
                                className="size-2.5 shrink-0 text-[#006c49] dark:text-[#4edea3]"
                              />
                            ) : null}
                            <span className="truncate">{question.title}</span>
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
              </div>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
