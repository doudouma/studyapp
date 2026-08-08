import type { MdTemplate } from "./types";

export const linear: MdTemplate = {
  id: "linear",
  emoji: "📐",
  nameZh: "Linear",
  nameEn: "Linear",
  descZh: "暗紫场 + 发丝线 + 渐变标题，工程极客风",
  descEn: "Dark violet + hairlines + gradient title, engineer geek",
  swatch: ["#08090A", "#5E6AD2", "#F7F8F8"],
  css: `
    .md-body { color: #F7F8F8; background: #08090A; font-family: "Inter", system-ui, -apple-system, "Segoe UI", "PingFang SC", "Noto Sans SC", "Microsoft YaHei", sans-serif; line-height: 1.65; -webkit-font-smoothing: antialiased; }
    .md-body h1, .md-body h2, .md-body h3 { color: #F7F8F8; font-weight: 700; line-height: 1.1; letter-spacing: -0.025em; }
    .md-body h1 { font-size: 2.2em; }
    .md-body h1 { background: linear-gradient(180deg, #FFFFFF 25%, rgba(255, 255, 255, 0.5) 100%); -webkit-background-clip: text; background-clip: text; color: transparent; -webkit-text-fill-color: transparent; }
    .md-body h2 { font-size: 1.5em; color: #F7F8F8; }
    .md-body h3 { font-size: 1.1em; color: #8A8F98; }
    .md-body a { color: #828FFF; text-decoration: none; border-bottom: 1px solid rgba(130, 143, 255, 0.5); }
    .md-body a:hover { border-bottom-color: #828FFF; }
    .md-body strong { color: #828FFF; font-weight: 700; }
    .md-body code { background: rgba(255, 255, 255, 0.06); color: #828FFF; padding: 0.12em 0.4em; border-radius: 5px; font-family: "SF Mono", "Cascadia Code", "JetBrains Mono", Menlo, Consolas, monospace; font-size: 0.88em; }
    .md-body pre { background: #0F1012; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 1em; overflow-x: auto; }
    .md-body pre code { background: none; color: #F7F8F8; padding: 0; }
    .md-body table { border-collapse: collapse; width: 100%; }
    .md-body th, .md-body td { border: 1px solid rgba(255, 255, 255, 0.08); padding: 0.5em 0.8em; text-align: left; }
    .md-body th { background: rgba(255, 255, 255, 0.04); color: #8A8F98; font-weight: 600; }
    .md-body hr { border: none; border-top: 1px solid rgba(255, 255, 255, 0.08); margin: 2em 0; }
    .md-body img { max-width: 100%; border-radius: 8px; }
    .md-body blockquote { border-left: 2px solid #5E6AD2; background: rgba(94, 106, 210, 0.06); margin: 1.4em 0; padding: 0.8em 1.2em; color: #8A8F98; }
    .md-body blockquote p { margin: 0.3em 0; }
    .md-body li::marker { color: #5E6AD2; }
    .hljs { background: transparent; }
  `,
  variants: [
    {
      swatch: ["#FFFFFF", "#5E6AD2", "#08090A"],
      css: `
        .md-body { color: #08090A; background: #FFFFFF; font-family: "Inter", system-ui, -apple-system, "Segoe UI", "PingFang SC", "Noto Sans SC", "Microsoft YaHei", sans-serif; line-height: 1.65; -webkit-font-smoothing: antialiased; }
        .md-body h1, .md-body h2, .md-body h3 { color: #08090A; font-weight: 700; line-height: 1.1; letter-spacing: -0.025em; }
        .md-body h1 { font-size: 2.2em; }
        .md-body h1::after { content: ""; display: block; width: 48px; height: 3px; border-radius: 2px; background: #5E6AD2; margin-top: 0.45em; }
        .md-body h2 { font-size: 1.5em; color: #08090A; }
        .md-body h3 { font-size: 1.1em; color: #62666D; }
        .md-body a { color: #5E6AD2; text-decoration: none; border-bottom: 1px solid rgba(94, 106, 210, 0.5); }
        .md-body a:hover { border-bottom-color: #5E6AD2; }
        .md-body strong { color: #5E6AD2; font-weight: 700; }
        .md-body code { background: #F4F4F6; color: #5E6AD2; padding: 0.12em 0.4em; border-radius: 5px; font-family: "SF Mono", "Cascadia Code", "JetBrains Mono", Menlo, Consolas, monospace; font-size: 0.88em; }
        .md-body pre { background: #F9F9FB; border: 1px solid #E4E4E9; border-radius: 8px; padding: 1em; overflow-x: auto; }
        .md-body pre code { background: none; color: #08090A; padding: 0; }
        .md-body table { border-collapse: collapse; width: 100%; }
        .md-body th, .md-body td { border: 1px solid #E4E4E9; padding: 0.5em 0.8em; text-align: left; }
        .md-body th { background: #F4F4F6; color: #62666D; font-weight: 600; }
        .md-body hr { border: none; border-top: 1px solid #E4E4E9; margin: 2em 0; }
        .md-body img { max-width: 100%; border-radius: 8px; }
        .md-body blockquote { border-left: 2px solid #5E6AD2; background: #F0F1FF; margin: 1.4em 0; padding: 0.8em 1.2em; color: #62666D; }
        .md-body blockquote p { margin: 0.3em 0; }
        .md-body li::marker { color: #5E6AD2; }
        .hljs { background: transparent; }
      `,
    },
  ],
};
