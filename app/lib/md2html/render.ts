import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";
import hljs from "highlight.js/lib/core";
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import bash from "highlight.js/lib/languages/bash";
import json from "highlight.js/lib/languages/json";
import css from "highlight.js/lib/languages/css";
import xml from "highlight.js/lib/languages/xml";
import python from "highlight.js/lib/languages/python";
import { getTemplate, getVariant } from "./templates";

hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("bash", bash);
hljs.registerLanguage("json", json);
hljs.registerLanguage("css", css);
hljs.registerLanguage("xml", xml);
hljs.registerLanguage("html", xml);
hljs.registerLanguage("python", python);

const marked = new Marked(
  markedHighlight({
    langPrefix: "hljs language-",
    highlight(code, lang) {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return hljs.highlight(code, { language: lang }).value;
        } catch {
          return code;
        }
      }
      return code;
    },
  }),
);

function extractTitle(md: string): string {
  const match = md.match(/^\s*#\s+(.+)/m);
  return match ? match[1].trim() : "未命名";
}

function isLight(bg: string): boolean {
  const hex = bg.replace("#", "");
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) return true;
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return 0.299 * r + 0.587 * g + 0.114 * b > 150;
}

function hljsTheme(bg: string): string {
  if (isLight(bg)) {
    return `
      .hljs-comment, .hljs-quote { color: #6E6E73; }
      .hljs-keyword, .hljs-selector-tag, .hljs-literal { color: #AF1435; }
      .hljs-string, .hljs-regexp, .hljs-addition { color: #2C7A4B; }
      .hljs-number, .hljs-meta { color: #B2400A; }
      .hljs-title, .hljs-section, .hljs-function { color: #0058BE; }
      .hljs-attr, .hljs-attribute, .hljs-variable { color: #8E2DE2; }
      .hljs-built_in, .hljs-type, .hljs-class .hljs-title { color: #0058BE; }
      .hljs-emphasis { font-style: italic; }
      .hljs-strong { font-weight: 700; }
      .hljs-deletion { color: #C0392B; }
    `;
  }
  return `
    .hljs-comment, .hljs-quote { color: #7A7E85; }
    .hljs-keyword, .hljs-selector-tag, .hljs-literal { color: #FF7A93; }
    .hljs-string, .hljs-regexp, .hljs-addition { color: #7BD88F; }
    .hljs-number, .hljs-meta { color: #FFB86C; }
    .hljs-title, .hljs-section, .hljs-function { color: #82AAFF; }
    .hljs-attr, .hljs-attribute, .hljs-variable { color: #C792EA; }
    .hljs-built_in, .hljs-type, .hljs-class .hljs-title { color: #82AAFF; }
    .hljs-emphasis { font-style: italic; }
    .hljs-strong { font-weight: 700; }
    .hljs-deletion { color: #FF6B6B; }
  `;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function renderMarkdown(
  md: string,
  templateId: string,
  variantIndex = 0,
): Promise<string> {
  const template = getTemplate(templateId);
  const variant = getVariant(template, variantIndex);
  const bodyHtml = await marked.parse(md);
  const title = extractTitle(md);
  const lang = typeof document !== "undefined" && document.documentElement.lang || "zh-CN";

  return `<!DOCTYPE html>
<html lang="${escapeHtml(lang)}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(title)}</title>
<style>
  body { margin: 0; background: ${variant.swatch[0]}; }
  .md-shell { max-width: 720px; margin: 0 auto; padding: 48px 24px; }
  .md-body ul { padding-left: 1.6em; }
  .md-body ol { padding-left: 1.6em; }
  .md-body li.task-list-item { list-style: none; margin-left: -1.6em; }
  .md-body li.task-list-item input[type="checkbox"] { margin-right: 0.5em; }
  .md-body kbd { display: inline-block; padding: 0.15em 0.45em; border: 1px solid; border-bottom-width: 2px; border-radius: 4px; font-family: "SF Mono", "Menlo", monospace; font-size: 0.85em; }
  .md-body .hljs { background: transparent; }
  .md-body pre code.hljs { background: transparent; }
${variant.css}
${hljsTheme(variant.swatch[0])}
</style>
</head>
<body>
<main class="md-shell">
  <article class="md-body">
${bodyHtml}
  </article>
</main>
</body>
</html>`;
}

export { extractTitle };
