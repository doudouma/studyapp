import type { MdTemplate } from "./types";

export const starbucks: MdTemplate = {
  id: "starbucks",
  emoji: "☕",
  nameZh: "Starbucks",
  nameEn: "Starbucks",
  descZh: "店绿 + 奶咖底 + 衬线斜体点缀，暖调典雅",
  descEn: "Store green + cream base + serif italic accents, warm elegant",
  swatch: ["#F2F0EB", "#00704A", "#1E3932"],
  css: `
    .md-body { color: #1E3932; background: #F2F0EB; font-family: "SoDo Sans", "Lato", "Helvetica Neue", "Segoe UI", "PingFang SC", "Noto Sans SC", Arial, sans-serif; line-height: 1.65; }
    .md-body h1, .md-body h2, .md-body h3 { color: #1E3932; font-weight: 800; line-height: 1.15; }
    .md-body h1 { font-size: 2.1em; }
    .md-body h1::before { content: "☕"; margin-right: 0.15em; }
    .md-body h2 { font-size: 1.55em; }
    .md-body h3 { font-size: 1.15em; color: #00704A; }
    .md-body em { font-family: "Lander", "Playfair Display", "Songti SC", "Noto Serif SC", Georgia, serif; font-style: italic; color: #00704A; }
    .md-body a { color: #00704A; font-weight: 600; text-decoration: underline; text-underline-offset: 3px; }
    .md-body strong { color: #00704A; font-weight: 700; }
    .md-body blockquote { border-top: 2px solid #00704A; background: #D4E9E2; margin: 1.4em 0; padding: 0.8em 1.2em; color: #1E3932; }
    .md-body code { background: #D4E9E2; color: #1E3932; padding: 0.15em 0.4em; border-radius: 4px; font-family: "SF Mono", "Menlo", monospace; font-size: 0.9em; }
    .md-body pre { background: #fff; border-top: 2px solid #00704A; padding: 1em; overflow-x: auto; }
    .md-body pre code { background: none; color: #1E3932; padding: 0; }
    .md-body table { border-collapse: collapse; width: 100%; }
    .md-body th, .md-body td { border-bottom: 1px solid #B8C9C2; padding: 0.5em 0.8em; text-align: left; }
    .md-body th { background: #D4E9E2; font-weight: 700; }
    .md-body hr { border: none; border-top: 1px solid #B8C9C2; margin: 2em 0; }
    .md-body img { max-width: 100%; border-radius: 8px; }
    .md-body blockquote p { margin: 0.3em 0; }
    .hljs { background: transparent; }
  `,
  variants: [
    {
      swatch: ["#1E3932", "#D4E9E2", "#F2F0EB"],
      css: `
        .md-body { color: #F2F0EB; background: #1E3932; font-family: "SoDo Sans", "Lato", "Helvetica Neue", "Segoe UI", "PingFang SC", "Noto Sans SC", Arial, sans-serif; line-height: 1.65; }
        .md-body h1, .md-body h2, .md-body h3 { color: #F2F0EB; font-weight: 800; line-height: 1.15; }
        .md-body h1 { font-size: 2.1em; }
        .md-body h1::before { content: "☕"; margin-right: 0.15em; }
        .md-body h2 { font-size: 1.55em; }
        .md-body h3 { font-size: 1.15em; color: #D4E9E2; }
        .md-body em { font-family: "Lander", "Playfair Display", "Songti SC", "Noto Serif SC", Georgia, serif; font-style: italic; color: #D4E9E2; }
        .md-body a { color: #D4E9E2; font-weight: 600; text-decoration: underline; text-underline-offset: 3px; }
        .md-body strong { color: #D4E9E2; font-weight: 700; }
        .md-body blockquote { border-top: 2px solid #D4E9E2; background: rgba(212, 233, 226, 0.14); margin: 1.4em 0; padding: 0.8em 1.2em; color: #F2F0EB; }
        .md-body code { background: rgba(212, 233, 226, 0.14); color: #D4E9E2; padding: 0.15em 0.4em; border-radius: 4px; font-family: "SF Mono", "Menlo", monospace; font-size: 0.9em; }
        .md-body pre { background: #142922; border-top: 2px solid #D4E9E2; padding: 1em; overflow-x: auto; }
        .md-body pre code { background: none; color: #F2F0EB; padding: 0; }
        .md-body table { border-collapse: collapse; width: 100%; }
        .md-body th, .md-body td { border-bottom: 1px solid rgba(212, 233, 226, 0.35); padding: 0.5em 0.8em; text-align: left; }
        .md-body th { background: rgba(212, 233, 226, 0.14); font-weight: 700; }
        .md-body hr { border: none; border-top: 1px solid rgba(212, 233, 226, 0.35); margin: 2em 0; }
        .md-body img { max-width: 100%; border-radius: 8px; }
        .md-body blockquote p { margin: 0.3em 0; }
        .hljs { background: transparent; }
      `,
    },
  ],
};
