export interface MdTemplate {
  id: string;
  emoji: string;
  nameZh: string;
  nameEn: string;
  descZh: string;
  descEn: string;
  swatch: string[];
  css: string;
}

export const MD_TEMPLATES: MdTemplate[] = [
  {
    id: "kami",
    emoji: "📜",
    nameZh: "Kami 羊皮纸",
    nameEn: "Kami Parchment",
    descZh: "暖羊皮纸底 + 墨蓝点缀，知性编辑风",
    descEn: "Warm parchment + ink-blue accent, editorial",
    swatch: ["#f5f4ed", "#1B365D", "#1f1d18"],
    css: `
      .md-body { color: #1f1d18; background: #f5f4ed; font-family: "Georgia", "Noto Serif SC", serif; line-height: 1.55; }
      .md-body h1, .md-body h2, .md-body h3 { font-weight: 600; line-height: 1.25; color: #1B365D; }
      .md-body a { color: #1B365D; text-decoration: underline; text-underline-offset: 3px; }
      .md-body blockquote { border-left: 3px solid #1B365D; background: #efeee5; margin: 1.2em 0; padding: 0.6em 1.2em; color: #6b665b; }
      .md-body code { background: #efeee5; padding: 0.15em 0.4em; border-radius: 4px; font-family: "SF Mono", "Menlo", monospace; font-size: 0.9em; }
      .md-body pre { background: #efece2; border: 1px solid #d4d1c5; padding: 1em; overflow-x: auto; border-radius: 6px; }
      .md-body pre code { background: none; padding: 0; }
      .md-body table { border-collapse: collapse; width: 100%; }
      .md-body th, .md-body td { border: 1px solid #d4d1c5; padding: 0.5em 0.8em; text-align: left; }
      .md-body th { background: #efeee5; }
      .md-body hr { border: none; border-top: 1px solid #d4d1c5; margin: 2em 0; }
      .md-body img { max-width: 100%; border-radius: 6px; }
      .md-body blockquote p { margin: 0.3em 0; }
      .hljs { background: transparent; }
    `,
  },
  {
    id: "swiss",
    emoji: "◻️",
    nameZh: "瑞士国际",
    nameEn: "Swiss International",
    descZh: "单一克莱因蓝 + 无衬线网格，冷理性",
    descEn: "Klein blue accent + sans-serif grid, rational",
    swatch: ["#ffffff", "#002FA7", "#e5e5e5"],
    css: `
      .md-body { color: #111; background: #fff; font-family: "Inter", "Helvetica Neue", "Noto Sans SC", sans-serif; line-height: 1.5; }
      .md-body h1, .md-body h2, .md-body h3 { font-weight: 700; line-height: 1.15; letter-spacing: -0.02em; }
      .md-body h1 { border-bottom: 3px solid #002FA7; padding-bottom: 0.3em; }
      .md-body a { color: #002FA7; text-decoration: none; border-bottom: 2px solid #002FA7; }
      .md-body blockquote { border-left: 4px solid #002FA7; margin: 1.2em 0; padding: 0.4em 1.2em; background: #f4f6ff; }
      .md-body code { background: #f0f0f0; padding: 0.15em 0.4em; border-radius: 3px; font-family: "SF Mono", "Menlo", monospace; font-size: 0.9em; }
      .md-body pre { background: #fafafa; border: 1px solid #e5e5e5; padding: 1em; overflow-x: auto; border-radius: 4px; }
      .md-body pre code { background: none; padding: 0; }
      .md-body table { border-collapse: collapse; width: 100%; }
      .md-body th, .md-body td { border: 1px solid #e5e5e5; padding: 0.5em 0.8em; text-align: left; }
      .md-body th { background: #fafafa; }
      .md-body hr { border: none; border-top: 2px solid #e5e5e5; margin: 2em 0; }
      .hljs { background: transparent; }
    `,
  },
  {
    id: "editorial",
    emoji: "📰",
    nameZh: "杂志社论",
    nameEn: "Editorial Magazine",
    descZh: "超大衬线标题 + 报章奶油底，长文大气",
    descEn: "Oversized serif headline + newsprint cream, long-form",
    swatch: ["#faf7f0", "#1a1a1a", "#b3402a"],
    css: `
      .md-body { color: #1a1a1a; background: #faf7f0; font-family: "Playfair Display", "Georgia", "Noto Serif SC", serif; line-height: 1.6; }
      .md-body h1, .md-body h2 { font-size: 2.2em; font-weight: 800; line-height: 1.1; }
      .md-body h1::after { content: ""; display: block; width: 60px; border-bottom: 3px solid #b3402a; margin-top: 0.4em; }
      .md-body a { color: #b3402a; text-decoration: underline; }
      .md-body blockquote { border-left: 4px solid #b3402a; margin: 1.5em 0; padding: 0.5em 1.5em; font-style: italic; color: #555; }
      .md-body code { background: #efeade; padding: 0.15em 0.4em; border-radius: 3px; font-family: "SF Mono", "Menlo", monospace; }
      .md-body pre { background: #f1ece0; border: 1px solid #e0d9c8; padding: 1em; overflow-x: auto; border-radius: 4px; }
      .md-body pre code { background: none; padding: 0; }
      .md-body table { border-collapse: collapse; width: 100%; }
      .md-body th, .md-body td { border: 1px solid #e0d9c8; padding: 0.5em 0.8em; text-align: left; }
      .md-body th { background: #f1ece0; }
      .md-body hr { border: none; border-top: 1px solid #e0d9c8; margin: 2.5em 0; }
      .hljs { background: transparent; }
    `,
  },
  {
    id: "soft",
    emoji: "🌸",
    nameZh: "暖纸柔",
    nameEn: "Soft & Warm",
    descZh: "暖色系 + 软阴影 + 圆角，亲切圆润",
    descEn: "Warm tones + soft shadows + rounded, friendly",
    swatch: ["#fffbf5", "#ff8fa3", "#5c5c5c"],
    css: `
      .md-body { color: #4a4a4a; background: #fffbf5; font-family: "Inter", "PingFang SC", "Noto Sans SC", sans-serif; line-height: 1.7; }
      .md-body h1, .md-body h2, .md-body h3 { color: #333; font-weight: 700; line-height: 1.25; }
      .md-body a { color: #e85d75; text-decoration: none; border-bottom: 1px dashed #e85d75; }
      .md-body blockquote { border-radius: 12px; background: #fff0f3; border-left: none; padding: 1em 1.4em; color: #666; }
      .md-body code { background: #fff0f3; color: #c0392b; padding: 0.15em 0.4em; border-radius: 6px; font-family: "SF Mono", "Menlo", monospace; font-size: 0.9em; }
      .md-body pre { background: #fff5f0; border-radius: 12px; padding: 1em; overflow-x: auto; box-shadow: 0 2px 12px rgba(232, 93, 117, 0.08); }
      .md-body pre code { background: none; padding: 0; color: #4a4a4a; }
      .md-body table { border-collapse: collapse; width: 100%; border-radius: 12px; overflow: hidden; }
      .md-body th, .md-body td { border: 1px solid #ffe3e9; padding: 0.6em 0.9em; text-align: left; }
      .md-body th { background: #fff0f3; }
      .md-body hr { border: none; height: 4px; border-radius: 2px; background: linear-gradient(90deg, #ffd6de, transparent); margin: 2em 0; }
      .hljs { background: transparent; }
    `,
  },
  {
    id: "minimal",
    emoji: "⚪",
    nameZh: "极简白",
    nameEn: "Minimal White",
    descZh: "纯白底 + 细线分隔 + 克制排版",
    descEn: "Pure white + hairline dividers + restrained type",
    swatch: ["#ffffff", "#888888", "#111111"],
    css: `
      .md-body { color: #111; background: #fff; font-family: "Inter", "Noto Sans SC", sans-serif; line-height: 1.7; }
      .md-body h1, .md-body h2, .md-body h3 { font-weight: 600; line-height: 1.2; letter-spacing: -0.01em; }
      .md-body a { color: #111; text-decoration: underline; text-decoration-color: #bbb; text-underline-offset: 3px; }
      .md-body blockquote { border-left: 1px solid #ddd; margin: 1.5em 0; padding: 0.3em 1.4em; color: #777; }
      .md-body code { background: #f6f6f6; padding: 0.15em 0.4em; border-radius: 3px; font-family: "SF Mono", "Menlo", monospace; font-size: 0.9em; }
      .md-body pre { background: #fafafa; border: 1px solid #eee; padding: 1em; overflow-x: auto; border-radius: 6px; }
      .md-body pre code { background: none; padding: 0; }
      .md-body table { border-collapse: collapse; width: 100%; }
      .md-body th, .md-body td { border-bottom: 1px solid #eee; padding: 0.6em 0.8em; text-align: left; }
      .md-body th { border-bottom: 1px solid #ddd; font-weight: 600; }
      .md-body hr { border: none; border-top: 1px solid #eee; margin: 2.5em 0; }
      .hljs { background: transparent; }
    `,
  },
  {
    id: "dark",
    emoji: "🌙",
    nameZh: "暗夜阅读",
    nameEn: "Night Reading",
    descZh: "深底亮字 + 暗色代码块，夜间笔记",
    descEn: "Dark bg + light text + dark code blocks, night notes",
    swatch: ["#1a1d24", "#7aa2f7", "#c8ccd4"],
    css: `
      .md-body { color: #c8ccd4; background: #1a1d24; font-family: "Inter", "Noto Sans SC", sans-serif; line-height: 1.65; }
      .md-body h1, .md-body h2, .md-body h3 { color: #e8eaf0; font-weight: 700; line-height: 1.25; }
      .md-body a { color: #7aa2f7; text-decoration: none; border-bottom: 1px solid #7aa2f7; }
      .md-body blockquote { border-left: 3px solid #3b4261; margin: 1.2em 0; padding: 0.4em 1.2em; color: #9aa0ac; background: #20242e; }
      .md-body code { background: #232733; padding: 0.15em 0.4em; border-radius: 4px; color: #d291f2; font-family: "SF Mono", "Menlo", monospace; font-size: 0.9em; }
      .md-body pre { background: #13161c; border: 1px solid #2a2f3a; padding: 1em; overflow-x: auto; border-radius: 8px; }
      .md-body pre code { background: none; padding: 0; color: #c8ccd4; }
      .md-body table { border-collapse: collapse; width: 100%; }
      .md-body th, .md-body td { border: 1px solid #2a2f3a; padding: 0.5em 0.8em; text-align: left; }
      .md-body th { background: #20242e; }
      .md-body hr { border: none; border-top: 1px solid #2a2f3a; margin: 2em 0; }
      .md-body img { border-radius: 8px; }
      .hljs { background: transparent; }
    `,
  },
];

export function getTemplate(id: string): MdTemplate {
  return MD_TEMPLATES.find((t) => t.id === id) ?? MD_TEMPLATES[0];
}
