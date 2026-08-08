import type { MdTemplate } from "./types";

export const swiss: MdTemplate = {
  id: "swiss",
  emoji: "🔷",
  nameZh: "Swiss IKB",
  nameEn: "Swiss IKB",
  descZh: "克莱因蓝底 + 白字 + 超大黑体，高对比理性网格",
  descEn: "Klein blue bg + white text + oversized bold, high-contrast grid",
  swatch: ["#002FA7", "#ffffff", "#fafaf8"],
  css: `
    .md-body { color: #ffffff; background: #002FA7; font-family: "Inter Tight", "Inter", "Noto Sans SC", system-ui, sans-serif; line-height: 1.6; -webkit-font-smoothing: antialiased; }
    .md-body h1, .md-body h2, .md-body h3 { color: #ffffff; font-weight: 900; line-height: 1.05; letter-spacing: -0.02em; }
    .md-body h1 { font-size: 2.4em; }
    .md-body h1::after { content: ""; display: block; width: 60px; height: 6px; background: #fafaf8; margin-top: 0.4em; }
    .md-body h2 { font-size: 1.7em; }
    .md-body h3 { font-size: 1.2em; color: #fafaf8; }
    .md-body a { color: #ffffff; font-weight: 700; text-decoration: none; border-bottom: 2px solid #ffffff; }
    .md-body a:hover { border-bottom-color: #fafaf8; color: #fafaf8; }
    .md-body strong { color: #ffffff; font-weight: 800; text-decoration: underline; text-decoration-thickness: 2px; text-decoration-color: #fafaf8; text-underline-offset: 3px; }
    .md-body blockquote { border-left: 4px solid #fafaf8; background: #001f7a; margin: 1.4em 0; padding: 0.8em 1.2em; color: #dbe4ff; }
    .md-body code { background: #001f7a; color: #ffffff; border: 1px solid #ffffff; padding: 0.12em 0.4em; border-radius: 2px; font-family: "JetBrains Mono", ui-monospace, monospace; font-size: 0.88em; }
    .md-body pre { background: #001f7a; border: 1px solid #ffffff; border-radius: 4px; padding: 1em; overflow-x: auto; }
    .md-body pre code { background: none; color: #ffffff; border: none; padding: 0; }
    .md-body table { border-collapse: collapse; width: 100%; }
    .md-body th, .md-body td { border-bottom: 1px solid rgba(255, 255, 255, 0.5); padding: 0.5em 0.8em; text-align: left; }
    .md-body th { border-bottom: 3px solid #ffffff; font-weight: 800; color: #ffffff; background: rgba(255, 255, 255, 0.12); }
    .md-body hr { border: none; border-top: 2px solid #ffffff; margin: 2.2em 0; }
    .md-body img { max-width: 100%; }
    .md-body blockquote p { margin: 0.3em 0; }
    .md-body li::marker { color: #fafaf8; }
    .hljs { background: transparent; }
  `,
};
