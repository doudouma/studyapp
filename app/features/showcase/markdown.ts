import { marked } from "marked";
import { TONE_COLORS, type ShowcaseTone } from "@shared/types/showcase";
import { SHOWCASE_IMAGE_SIZES } from "@shared/showcase/image-sizes";

/**
 * 案例正文（Markdown）→ HTML
 *
 * 案例 MD 由我们自己维护（可信内容），所以直接交给 marked，不做 sanitize。
 * 正文约定：
 *   `## 标题`         → 分节（样式里加 `## ` 前缀）
 *   `- ` / `1. `      → 清单
 *   Markdown 表格     → 对照表（第二列写 High/Partial/Moderate/Low 会自动上档位色）
 *   `> **标签**`      → 结论/提示块（blockquote 渲染成左侧强调色块）
 */

marked.use({ gfm: true, breaks: false });

/**
 * 表格单元格若整格就是这些词，按档位上色；大小写不敏感。
 * 多语言：各语言译文里写对应词即可，档位色随语言切换保持成立。
 */
const TONE_BY_WORD: Record<string, ShowcaseTone> = {
  high: "good",
  partial: "warn",
  moderate: "neutral",
  low: "bad",
  // zh
  高: "good",
  部分: "warn",
  中等: "neutral",
  低: "bad",
  // es / pt
  alta: "good",
  parcial: "warn",
  moderada: "neutral",
  baja: "bad",
  // pt (低)
  baixa: "bad",
  // fr
  élevée: "good",
  partielle: "warn",
  modérée: "neutral",
  faible: "bad",
};

function toneSpan(tone: ShowcaseTone, inner: string): string {
  const c = TONE_COLORS[tone];
  return `<span class="sc-tone" style="--sc-tone:${c.light};--sc-tone-dark:${c.dark}">${inner}</span>`;
}

/**
 * 给对照表的档位单元格上色。
 * 只认「整格文本恰好是一个档位词」的单元格，避免误伤正文里的 High/Low。
 */
function applyTableTones(html: string): string {
  return html.replace(/<td(?:\s[^>]*)?>([\s\S]*?)<\/td>/g, (whole, inner: string) => {
    const text = inner.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim().toLowerCase();
    const tone = TONE_BY_WORD[text];
    if (!tone) return whole;
    return whole.replace(inner, toneSpan(tone, inner));
  });
}

/**
 * 给正文标题注入锚点 id，供左侧目录滚动定位：
 *   `## ` → sec-{n}，`### ` → sec-{n}-{m}（与 buildCaseToc 一致）
 */
function injectHeadingIds(html: string): string {
  let h2 = 0;
  let h3 = 0;
  return html.replace(/<h(2|3)>/g, (_match, level: string) => {
    if (level === "2") {
      h2 += 1;
      h3 = 0; // 每节重置小节计数，与 buildCaseToc 的 sec-{n}-{m} 对齐
      return `<h2 id="sec-${h2}">`;
    }
    h3 += 1;
    return `<h3 id="sec-${h2}-${h3}">`;
  });
}

/**
 * 给正文 <img> 注入加载属性与固有尺寸：
 *   第 1 张   eager + fetchpriority="high"（首屏正文图即 LCP 候选，与 SquareGrid 首卡一致）
 *   其余     loading="lazy" + decoding="async"（案例正文可含十余 MB 动图，
 *            全部 eager 会和 LCP 抢带宽）
 *   已知尺寸  width/height（浏览器自动据此算 aspect-ratio，解码前预留高度，消除 CLS；
 *            尺寸表由 scripts/gen-showcase-image-sizes.mjs 生成，新素材需重新生成）
 */
function enhanceImages(html: string): string {
  let first = true;
  return html.replace(/<img\b[^>]*>/g, (tag) => {
    const src = /src="([^"]+)"/.exec(tag)?.[1];
    const attrs: string[] = [];
    if (first) {
      attrs.push('fetchpriority="high"');
      first = false;
    } else {
      attrs.push('loading="lazy"', 'decoding="async"');
    }
    const size = src ? SHOWCASE_IMAGE_SIZES[src] : undefined;
    if (size) attrs.push(`width="${size.w}"`, `height="${size.h}"`);
    if (attrs.length === 0) return tag;
    // img 是 void 元素，去掉可选的 "/>" 斜杠后统一以 ">" 收尾
    return tag.replace(/\s*\/?>$/, ` ${attrs.join(" ")}>`);
  });
}

/** 渲染正文 Markdown。同一个 body 会被多次调用，结果缓存 */
const cache = new Map<string, string>();

export function renderCaseBody(markdown: string): string {
  const hit = cache.get(markdown);
  if (hit !== undefined) return hit;
  const html = enhanceImages(
    injectHeadingIds(applyTableTones(marked.parse(markdown, { async: false }) as string)),
  )
    // 包一层横向滚动容器，窄屏不压缩表格列宽
    .replace(/<table>/g, '<div class="sc-table-wrap"><table>')
    .replace(/<\/table>/g, "</table></div>");
  cache.set(markdown, html);
  return html;
}
