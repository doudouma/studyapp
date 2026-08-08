import type { MdTemplate } from "./types";

export const cola: MdTemplate = {
  id: "cola",
  emoji: "🥤",
  nameZh: "Coca-Cola",
  nameEn: "Coca-Cola",
  descZh: "可乐红 + 复古手写点缀 + 奶油底，经典怀旧",
  descEn: "Coke red + retro script accents + cream base, classic retro",
  swatch: ["#F3EDE4", "#F40009", "#1A1A1A"],
  css: `
    .md-body { color: #1A1A1A; background: #F3EDE4; font-family: "Helvetica Neue", "Helvetica", "Arial Narrow", Arial, "PingFang SC", "Noto Sans SC", "Microsoft YaHei", sans-serif; line-height: 1.6; }
    .md-body h1, .md-body h2, .md-body h3 { color: #F40009; font-weight: 800; line-height: 1.12; letter-spacing: -0.005em; }
    .md-body h1 { font-size: 2.2em; }
    .md-body h1::before { content: "✦ "; font-family: "Snell Roundhand", "Brush Script MT", cursive; }
    .md-body h2 { font-size: 1.55em; }
    .md-body h3 { font-size: 1.15em; color: #1A1A1A; }
    .md-body a { color: #C00007; font-weight: 700; text-decoration: underline; text-decoration-thickness: 2px; text-underline-offset: 3px; }
    .md-body strong { color: #F40009; font-weight: 800; }
    .md-body blockquote { border-top: 3px solid #F40009; border-bottom: 1px solid #F40009; background: #fff; margin: 1.5em 0; padding: 0.8em 1.2em; color: #5A5A5A; }
    .md-body code { background: #fff; color: #C00007; border: 1px solid #E7DFCE; padding: 0.12em 0.4em; border-radius: 4px; font-family: "SF Mono", "Menlo", monospace; font-size: 0.88em; }
    .md-body pre { background: #fff; border: 2px solid #F40009; padding: 1em; overflow-x: auto; }
    .md-body pre code { background: none; color: #1A1A1A; border: none; padding: 0; }
    .md-body table { border-collapse: collapse; width: 100%; }
    .md-body th, .md-body td { border-bottom: 1px solid #E7DFCE; padding: 0.5em 0.8em; text-align: left; }
    .md-body th { border-bottom: 2px solid #F40009; font-weight: 800; color: #F40009; }
    .md-body hr { border: none; border-top: 2px solid #F40009; margin: 2em 0; }
    .md-body img { max-width: 100%; border-radius: 6px; }
    .md-body blockquote p { margin: 0.3em 0; }
    .md-body li::marker { color: #F40009; }
    .hljs { background: transparent; }
  `,
  variants: [
    {
      swatch: ["#F40009", "#FFFFFF", "#1A1A1A"],
      css: `
        .md-body { color: #FFFFFF; background: #F40009; font-family: "Helvetica Neue", "Helvetica", "Arial Narrow", Arial, "PingFang SC", "Noto Sans SC", "Microsoft YaHei", sans-serif; line-height: 1.6; }
        .md-body h1, .md-body h2, .md-body h3 { color: #FFFFFF; font-weight: 800; line-height: 1.12; letter-spacing: -0.005em; }
        .md-body h1 { font-size: 2.2em; }
        .md-body h1::before { content: "✦ "; font-family: "Snell Roundhand", "Brush Script MT", cursive; }
        .md-body h2 { font-size: 1.55em; }
        .md-body h3 { font-size: 1.15em; color: #FFD9DA; }
        .md-body a { color: #FFFFFF; font-weight: 800; text-decoration: underline; text-decoration-thickness: 2px; text-underline-offset: 3px; }
        .md-body strong { color: #FFFFFF; font-weight: 800; text-decoration: underline; text-decoration-color: rgba(255,255,255,0.6); text-underline-offset: 3px; }
        .md-body blockquote { border-top: 3px solid #FFFFFF; border-bottom: 1px solid #FFFFFF; background: rgba(255, 255, 255, 0.16); margin: 1.5em 0; padding: 0.8em 1.2em; color: #FFD9DA; }
        .md-body code { background: #FFFFFF; color: #C00007; border: 1px solid rgba(255, 255, 255, 0.6); padding: 0.12em 0.4em; border-radius: 4px; font-family: "SF Mono", "Menlo", monospace; font-size: 0.88em; }
        .md-body pre { background: rgba(255, 255, 255, 0.16); border: 2px solid #FFFFFF; padding: 1em; overflow-x: auto; }
        .md-body pre code { background: none; color: #FFFFFF; border: none; padding: 0; }
        .md-body table { border-collapse: collapse; width: 100%; }
        .md-body th, .md-body td { border-bottom: 1px solid rgba(255, 255, 255, 0.45); padding: 0.5em 0.8em; text-align: left; }
        .md-body th { border-bottom: 2px solid #FFFFFF; font-weight: 800; color: #FFFFFF; }
        .md-body hr { border: none; border-top: 2px solid #FFFFFF; margin: 2em 0; }
        .md-body img { max-width: 100%; border-radius: 6px; }
        .md-body blockquote p { margin: 0.3em 0; }
        .md-body li::marker { color: #FFFFFF; }
        .hljs { background: transparent; }
      `,
    },
  ],
};
