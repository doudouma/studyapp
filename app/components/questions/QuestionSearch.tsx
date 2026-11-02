import { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { TERMINAL_FONT } from "~/components/showcase/TerminalWindow";
import type { QuestionTocChapter } from "~/features/questions/toc";
import {
  buildQuestionSearchIndex,
  searchQuestions,
  type QuestionSearchItem,
} from "~/features/questions/search";

/**
 * 文内搜索：搜索 100 道题的标题和正文。
 * 快捷键：/ 或 Cmd/Ctrl+K 聚焦；↑/↓ 选择，Enter 跳转，Esc 关闭。
 */
export function QuestionSearch({
  toc,
  markdown,
  onSelect,
}: {
  toc: QuestionTocChapter[];
  markdown: string;
  onSelect: (id: string) => void;
}) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const blurTimer = useRef<number | undefined>(undefined);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const items = useMemo(() => buildQuestionSearchIndex(toc, markdown), [toc, markdown]);
  const results = useMemo(() => searchQuestions(items, query), [items, query]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);


  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing =
        !!target &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
      if (typing) return;
      if (event.key === "/" || ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k")) {
        event.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const select = (item: QuestionSearchItem) => {
    setOpen(false);
    setQuery("");
    onSelect(item.id);
    const el = document.getElementById(item.id);
    if (!el) return;
    window.history.replaceState(null, "", `#${item.id}`);
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const onInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((index) => Math.min(index + 1, Math.max(0, results.length - 1)));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter") {
      const item = results[activeIndex];
      if (item) {
        event.preventDefault();
        select(item);
      }
    } else if (event.key === "Escape") {
      setOpen(false);
      setQuery("");
      inputRef.current?.blur();
    }
  };

  const showResults = open && query.trim().length > 0;

  return (
    <div
      className="relative mt-4"
      style={{ fontFamily: TERMINAL_FONT }}
      onFocus={() => {
        window.clearTimeout(blurTimer.current);
        setOpen(true);
      }}
      onBlur={() => {
        blurTimer.current = window.setTimeout(() => setOpen(false), 120);
      }}
    >
      <div className="flex items-center gap-2 rounded-lg border border-[#cfcfcf] bg-white px-3 py-2 dark:border-[#243244] dark:bg-[#0f1720]">
        <Search aria-hidden className="size-3.5 shrink-0 text-muted-foreground" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onKeyDown={onInputKeyDown}
          placeholder={t("questions.searchInArticle")}
          aria-label={t("questions.searchInArticle")}
          role="combobox"
          aria-expanded={showResults}
          aria-controls="qs-search-results"
          aria-activedescendant={
            showResults && results[activeIndex] ? `qs-search-option-${activeIndex}` : undefined
          }
          className="min-w-0 flex-1 bg-transparent text-[11px] outline-none placeholder:text-muted-foreground/70"
        />
        <kbd className="hidden shrink-0 rounded border border-[#d8d8d8] px-1.5 py-0.5 text-[9px] text-muted-foreground sm:inline-block dark:border-[#2c3a4b]">
          /
        </kbd>
      </div>

      {showResults ? (
        <div
          id="qs-search-results"
          role="listbox"
          className="absolute inset-x-0 top-full z-30 mt-1 max-h-72 overflow-y-auto rounded-lg border border-[#cfcfcf] bg-white shadow-lg dark:border-[#243244] dark:bg-[#0f1720]"
        >
          {results.length > 0 ? (
            results.map((item, index) => (
              <button
                key={item.id}
                id={`qs-search-option-${index}`}
                type="button"
                role="option"
                aria-selected={index === activeIndex}
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => select(item)}
                className={`flex w-full items-start gap-2 px-3 py-2 text-left transition-colors ${
                  index === activeIndex
                    ? "bg-[#006c49]/10 text-[#006c49] dark:bg-[#4edea3]/10 dark:text-[#4edea3]"
                    : "hover:bg-[#f3f3f3] dark:hover:bg-[#151d2b]"
                }`}
              >
                <span className="mt-0.5 w-7 shrink-0 text-right text-[10px] font-bold tabular-nums text-muted-foreground">
                  {item.number ?? index + 1}.
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[11px] font-semibold">
                    {item.title.replace(/^\d+\.\s*/, "")}
                  </span>
                  <span className="mt-0.5 block truncate text-[9.5px] text-muted-foreground">
                    {item.chapter}
                  </span>
                </span>
              </button>
            ))
          ) : (
            <p className="px-3 py-4 text-center text-[10px] text-muted-foreground">
              {t("questions.searchNoResults")}
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
