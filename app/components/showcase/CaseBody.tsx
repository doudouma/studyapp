import { renderCaseBody } from "~/features/showcase/markdown";
import type { ShowcaseCase } from "@shared/types/showcase";

/**
 * 案例正文：Markdown → HTML 后整体渲染。
 * 样式在 app/styles/app.css 的 `.sc-md` 作用域里（标题前缀 `## `、表格、引用块等）。
 */
export function CaseBody({ item }: { item: ShowcaseCase }) {
  return (
    <div
      className="sc-md mt-5"
      dangerouslySetInnerHTML={{ __html: renderCaseBody(item.body) }}
    />
  );
}
