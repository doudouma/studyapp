import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { renderCaseBody } from "~/features/showcase/markdown";
import type { ShowcaseCase } from "@shared/types/showcase";

/** “已复制”反馈的停留时长 */
const COPIED_MS = 1600;

/**
 * 案例正文：Markdown → HTML 后整体渲染。
 * 样式在 app/styles/app.css 的 `.sc-md` 作用域里（标题前缀 `## `、表格、引用块等）。
 *
 * 代码块（提示词）在挂载后包一层 `.sc-pre` 并注入复制按钮：正文 HTML 由
 * `dangerouslySetInnerHTML` 渲染，按钮是纯交互增强，不进 HTML 字符串，
 * 这样 SSR/无 JS 时提示词文本照常可读可选中。
 */
export function CaseBody({ item }: { item: ShowcaseCase }) {
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
      button.setAttribute("aria-label", copyLabel);

      let timer: number | undefined;
      const onClick = async () => {
        try {
          await navigator.clipboard.writeText(pre.textContent ?? "");
        } catch {
          // 剪贴板不可用（非安全上下文/权限被拒）：退化为选中文本，用户可手动复制
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
        // 还原 DOM，保证 effect 重跑（切换案例/语言、StrictMode）时不会叠加按钮
        wrap.parentNode?.insertBefore(pre, wrap);
        wrap.remove();
      });
    }

    return () => cleanups.forEach((fn) => fn());
  }, [t, item.body]);

  return (
    <div
      ref={ref}
      className="sc-md mt-5"
      dangerouslySetInnerHTML={{ __html: renderCaseBody(item.body) }}
    />
  );
}
