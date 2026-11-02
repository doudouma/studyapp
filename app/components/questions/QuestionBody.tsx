import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { renderQuestionBody } from "~/features/questions/markdown";
import type { QuestionArticle } from "@shared/types/questions";

const COPIED_MS = 1600;

async function copyText(text: string) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return;
    }
  } catch {
    // fall through to the legacy path
  }
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand("copy");
  } finally {
    textarea.remove();
  }
}

/**
 * 正文渲染。与案例库共用 `.sc-md` 样式。
 *
 * 代码块复制按钮和题目深链 `#` 都用**事件委托**挂在外层容器上：
 * `dangerouslySetInnerHTML` 在语言切换/水合时可能被整体替换，直接绑在
 * 子节点上的监听器会丢失；委托 + MutationObserver 可以稳定工作。
 */
export function QuestionBody({ article }: { article: QuestionArticle }) {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const copyLabel = t("showcase.copy");
    const copiedLabel = t("showcase.copied");
    const linkCopyLabel = t("questions.copyLink");
    const linkCopiedLabel = t("questions.copiedLink");
    const timers = new Map<HTMLElement, number>();

    const scheduleReset = (el: HTMLElement, reset: () => void) => {
      const previous = timers.get(el);
      if (previous) window.clearTimeout(previous);
      timers.set(el, window.setTimeout(reset, COPIED_MS));
    };

    /** 给新插入的 DOM 补上复制按钮和本地化 aria-label */
    const decorate = () => {
      for (const pre of Array.from(root.querySelectorAll("pre"))) {
        if (pre.parentElement?.classList.contains("sc-pre")) continue;
        const wrap = document.createElement("div");
        wrap.className = "sc-pre";
        pre.replaceWith(wrap);
        wrap.appendChild(pre);

        const button = document.createElement("button");
        button.type = "button";
        button.className = "sc-copy";
        button.textContent = copyLabel;
        button.setAttribute("aria-label", copyLabel);
        wrap.appendChild(button);
      }

      for (const anchor of Array.from(root.querySelectorAll<HTMLAnchorElement>("a.qs-anchor"))) {
        if (anchor.dataset.copied) continue;
        anchor.setAttribute("aria-label", linkCopyLabel);
        anchor.setAttribute("title", linkCopyLabel);
      }
    };

    const onClick = async (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      const anchor = target.closest<HTMLAnchorElement>("a.qs-anchor");
      if (anchor && root.contains(anchor)) {
        event.preventDefault();
        const id = anchor.getAttribute("href")?.replace(/^#/, "") ?? "";
        if (!id) return;
        const canonical =
          document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href ??
          window.location.href.split("#")[0];
        await copyText(`${canonical}#${id}`);
        anchor.dataset.copied = "true";
        anchor.textContent = "✓";
        anchor.setAttribute("aria-label", linkCopiedLabel);
        anchor.setAttribute("title", linkCopiedLabel);
        scheduleReset(anchor, () => {
          delete anchor.dataset.copied;
          anchor.textContent = "#";
          anchor.setAttribute("aria-label", linkCopyLabel);
          anchor.setAttribute("title", linkCopyLabel);
        });
        return;
      }

      const button = target.closest<HTMLButtonElement>("button.sc-copy");
      if (button && root.contains(button)) {
        event.preventDefault();
        const pre = button.parentElement?.querySelector("pre");
        if (!pre) return;
        await copyText(pre.textContent ?? "");
        button.dataset.copied = "true";
        button.textContent = copiedLabel;
        scheduleReset(button, () => {
          delete button.dataset.copied;
          button.textContent = copyLabel;
        });
      }
    };

    root.addEventListener("click", onClick);
    const observer = new MutationObserver(() => decorate());
    observer.observe(root, { childList: true, subtree: true });
    decorate();

    return () => {
      observer.disconnect();
      root.removeEventListener("click", onClick);
      for (const timer of timers.values()) window.clearTimeout(timer);
    };
  }, [t, article.body]);

  return (
    <div
      ref={ref}
      className="sc-md qs-md mt-5"
      dangerouslySetInnerHTML={{ __html: renderQuestionBody(article.body) }}
    />
  );
}
