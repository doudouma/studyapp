import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { TERMINAL_FONT } from "~/components/showcase/TerminalWindow";
import type { CaseTocSection } from "~/features/showcase/toc";

/**
 * 案例详情页左侧目录（桌面端，参照 100-questions 的 QuestionSidebar）。
 * - 有小节的章节可展开/收起，滚动正文时自动展开当前章节
 * - 滚动正文时高亮当前章节/小节，并把高亮项滚进侧栏可视区
 * - 移动端隐藏，改用正文上方的可折叠目录
 */
export function CaseToc({ toc }: { toc: CaseTocSection[] }) {
  const { t } = useTranslation();
  const navRef = useRef<HTMLElement>(null);
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(toc[0] ? [toc[0].id] : []),
  );
  const [activeSectionId, setActiveSectionId] = useState<string | null>(toc[0]?.id ?? null);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);

  /** 展开/收起单节，不影响其它节 */
  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // 切案例时重置展开/高亮
  useEffect(() => {
    setActiveSectionId(toc[0]?.id ?? null);
    setActiveItemId(null);
    setExpanded(new Set(toc[0] ? [toc[0].id] : []));
  }, [toc]);

  /** 扁平化标题列表，按 DOM 顺序用于滚动定位 */
  const headings = useMemo(
    () =>
      toc.flatMap((section) => [
        { id: section.id, sectionId: section.id, child: false },
        ...section.children.map((child) => ({
          id: child.id,
          sectionId: section.id,
          child: true,
        })),
      ]),
    [toc],
  );

  // 跟随正文：找到最后一个越过顶部的标题，高亮对应章节/小节。
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
      setActiveSectionId(current.sectionId);
      setActiveItemId(current.child ? current.id : null);
      setExpanded((prev) =>
        prev.has(current.sectionId) ? prev : new Set(prev).add(current.sectionId),
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
  const currentId = activeItemId ?? activeSectionId;
  useEffect(() => {
    if (!currentId) return;
    const nav = navRef.current;
    const item =
      nav?.querySelector<HTMLElement>(`[data-toc-id="${currentId}"]`);
    if (!nav || !item) return;
    const navRect = nav.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();
    if (itemRect.top < navRect.top + 4) {
      nav.scrollTop += itemRect.top - navRect.top - 8;
    } else if (itemRect.bottom > navRect.bottom - 4) {
      nav.scrollTop += itemRect.bottom - navRect.bottom + 8;
    }
  }, [currentId]);

  const childCount = toc.reduce((n, section) => n + section.children.length, 0);

  return (
    <aside className="hidden lg:block lg:self-stretch">
      <div
        style={{ fontFamily: TERMINAL_FONT }}
        className="sticky top-20 overflow-hidden rounded-xl border border-[#cfcfcf] bg-white dark:border-[#2a2d32] dark:bg-[#0f1720]"
      >
        <div className="flex items-center justify-between gap-2 border-b border-[#cfcfcf] bg-[#ececec] px-3 py-2 dark:border-[#2a2d32] dark:bg-[#151d2b]">
          <span className="text-[10px] text-muted-foreground">$ cat toc.md</span>
          <span
            className="shrink-0 text-[9px] text-muted-foreground"
            title={t("showcase.tocMeta", { sections: toc.length, items: childCount })}
          >
            {toc.length}
          </span>
        </div>

        <nav
          ref={navRef}
          aria-label={t("showcase.toc")}
          className="max-h-[calc(100vh-9rem)] overflow-y-auto p-2 text-[10.5px]"
        >
          {toc.map((section) => {
            const open = expanded.has(section.id) && section.children.length > 0;
            const activeSection = activeSectionId === section.id;
            return (
              <div key={section.id} className="mb-0.5" data-toc-id={section.id}>
                <div
                  className={`flex items-center gap-0.5 rounded-md transition-colors ${
                    activeSection
                      ? "bg-[#111214]/10 text-[#111214] dark:bg-[#d8ff00]/10 dark:text-[#d8ff00]"
                      : "text-[#000000] hover:bg-[#ececec] dark:text-[#e6edf6] dark:hover:bg-[#151d2b]"
                  }`}
                >
                  {section.children.length > 0 ? (
                    <button
                      type="button"
                      onClick={() => toggle(section.id)}
                      aria-expanded={open}
                      aria-controls={`sc-toc-${section.id}`}
                      className="flex size-6 shrink-0 cursor-pointer items-center justify-center text-[9px] text-muted-foreground hover:text-foreground"
                    >
                      <span className={`transition-transform ${open ? "rotate-90" : ""}`}>▶</span>
                    </button>
                  ) : (
                    <span className="size-6 shrink-0" />
                  )}
                  <a
                    href={`#${section.id}`}
                    onClick={() => {
                      setActiveSectionId(section.id);
                      setActiveItemId(null);
                      setExpanded((prev) =>
                        prev.has(section.id) ? prev : new Set(prev).add(section.id),
                      );
                    }}
                    aria-current={activeSection ? "location" : undefined}
                    className="min-w-0 flex-1 truncate py-1.5 font-bold"
                  >
                    {section.title}
                  </a>
                  {section.children.length > 0 ? (
                    <span className="mr-2 shrink-0 text-[9px] font-normal text-muted-foreground">
                      {section.children.length}
                    </span>
                  ) : null}
                </div>

                {open ? (
                  <ul
                    id={`sc-toc-${section.id}`}
                    className="mb-1 ml-[1.15rem] mt-0.5 space-y-0.5 border-l border-dashed border-[#e0e0e0] pl-1.5 dark:border-[#2a2d32]"
                  >
                    {section.children.map((child) => {
                      const active = activeItemId === child.id;
                      return (
                        <li key={child.id} data-toc-id={child.id}>
                          <a
                            href={`#${child.id}`}
                            onClick={() => {
                              setActiveSectionId(section.id);
                              setActiveItemId(child.id);
                            }}
                            aria-current={active ? "location" : undefined}
                            title={child.title}
                            className={`flex items-center rounded px-1.5 py-[3px] text-[10px] transition-colors ${
                              active
                                ? "bg-[#111214] font-semibold text-white dark:bg-[#d8ff00] dark:text-[#111214]"
                                : "text-muted-foreground hover:bg-[#ececec] hover:text-foreground dark:hover:bg-[#151d2b]"
                            }`}
                          >
                            <span className="truncate">{child.title}</span>
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
