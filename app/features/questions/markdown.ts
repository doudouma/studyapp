import { renderCaseBody } from "~/features/showcase/markdown";
import { isQuestionPreface } from "~/features/questions/toc";

const cache = new Map<string, string>();

/**
 * 「100 个问题」正文 Markdown → HTML。
 *
 * 复用案例库的渲染器（表格、引用块、`## ` 前缀等样式一致），
 * 额外给每个 h2/h3 注入稳定 id，供目录锚点跳转：
 *   - h2：chapter-{n}，跳过「写在前面」
 *   - h3：q-{题号}
 */
export function renderQuestionBody(markdown: string): string {
  const hit = cache.get(markdown);
  if (hit !== undefined) return hit;

  let chapter = 0;
  let fallback = 0;
  const html = renderCaseBody(markdown).replace(
    /<h([23])([^>]*)>([\s\S]*?)<\/h\1>/g,
    (whole, level: string, attrs: string, inner: string) => {
      const text = inner.replace(/<[^>]*>/g, "").trim();
      let id: string;
      if (level === "2") {
        id = isQuestionPreface(text) ? "preface" : `chapter-${++chapter}`;
        return `<h2 id="${id}"${attrs}>${inner}</h2>`;
      }
      const m = /^(\d+)\./.exec(text);
      id = m ? `q-${m[1]}` : `q-x-${++fallback}`;
      return `<h3 id="${id}"${attrs}>${inner}<a class="qs-anchor" href="#${id}" aria-label="Copy link">#</a></h3>`;
    },
  );

  cache.set(markdown, html);
  return html;
}
