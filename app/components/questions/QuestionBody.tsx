import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { renderQuestionBody } from "~/features/questions/markdown";
import type { QuestionArticle } from "@shared/types/questions";

const COPIED_MS = 1600;

/**
 * 正文渲染。与案例库共用 `.sc-md` 样式；代码块挂载后注入复制按钮，
 * SSR/无 JS 时仍是可读可选中的纯文本。
 */
export function QuestionBody({ article }: { article: QuestionArticle }) {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const copyLabel = t("showcase.copy");
    const copiedLabel = t("showcase.copied");
    const cleanups: Array<() => void> = [];

    for (const pre of Array.from(root.querySelectorAll("pre"))) {
      const wrap = document.createElement("div");
      wrap.className = "sc-pre";
      pre.replaceWith(wrap);
      wrap.appendChild(pre);

      const button = document.createElement("button");
      button.type = "button";
      button.className = "sc-copy";
      button.textContent = copyLabel;

      let timer: number | undefined;
      const onClick = async () => {
        try {
          await navigator.clipboard.writeText(pre.textContent ?? "");
        } catch {
          const range = document.createRange();
          range.selectNodeContents(pre);
          const selection = window.getSelection();
          selection?.removeAllRanges();
          selection?.addRange(range);
          return;
        }
        button.dataset.copied = "true";
        button.textContent = copiedLabel;
        window.clearTimeout(timer);
        timer = window.setTimeout(() => {
          delete button.dataset.copied;
          button.textContent = copyLabel;
        }, COPIED_MS);
      };

      button.addEventListener("click", onClick);
      wrap.appendChild(button);

      cleanups.push(() => {
        window.clearTimeout(timer);
        button.removeEventListener("click", onClick);
        wrap.parentNode?.insertBefore(pre, wrap);
        wrap.remove();
      });
    }

    return () => cleanups.forEach((fn) => fn());
  }, [t, article.body]);

  return (
    <div
      ref={ref}
      className="sc-md qs-md mt-5"
      dangerouslySetInnerHTML={{ __html: renderQuestionBody(article.body) }}
    />
  );
}
