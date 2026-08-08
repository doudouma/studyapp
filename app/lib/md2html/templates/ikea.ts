import type { MdTemplate } from "./types";

export const ikea: MdTemplate = {
  id: "ikea",
  emoji: "🛋️",
  nameZh: "IKEA",
  nameEn: "IKEA",
  descZh: "宜家蓝 + 黄色马克笔高亮，说明书式的直白",
  descEn: "IKEA blue + yellow highlighter, flat-pack clarity",
  swatch: ["#FFFFFF", "#0051BA", "#FFDB00"],
  css: `
    .md-body { color: #111111; background: #fff; font-family: "IKEA Noto Sans", "Noto Sans SC", Verdana, Tahoma, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif; line-height: 1.65; }
    .md-body h1, .md-body h2, .md-body h3 { color: #0051BA; font-weight: 900; line-height: 1.15; }
    .md-body h1 { font-size: 2em; }
    .md-body h1::after { content: ""; display: block; width: 56px; border-bottom: 3px solid #0051BA; margin-top: 0.4em; }
    .md-body h2 { font-size: 1.5em; }
    .md-body h3 { font-size: 1.15em; color: #111; }
    .md-body strong { color: #0051BA; font-weight: 700; }
    .md-body a { color: #0051BA; font-weight: 600; text-decoration: underline; text-decoration-thickness: 2px; text-decoration-color: #FFDB00; text-underline-offset: 3px; }
    .md-body blockquote { border-left: 4px solid #FFDB00; background: rgba(255, 219, 0, 0.15); margin: 1.4em 0; padding: 0.8em 1.2em; color: #666666; }
    .md-body code { background: #0051BA; color: #fff; padding: 0.12em 0.4em; border-radius: 3px; font-family: "SF Mono", "Menlo", monospace; font-size: 0.88em; }
    .md-body pre { background: #F0F0F0; border-top: 2px dashed #0051BA; padding: 1em; overflow-x: auto; }
    .md-body pre code { background: none; color: #111; padding: 0; }
    .md-body table { border-collapse: collapse; width: 100%; }
    .md-body th, .md-body td { border: 1px solid #DDDDDD; padding: 0.5em 0.8em; text-align: left; }
    .md-body th { background: #0051BA; color: #fff; font-weight: 700; }
    .md-body hr { border: none; border-top: 2px dashed #0051BA; margin: 2em 0; }
    .md-body img { max-width: 100%; }
    .md-body blockquote p { margin: 0.3em 0; }
    .hljs { background: transparent; }
  `,
  variants: [
    {
      swatch: ["#0051BA", "#FFDB00", "#FFFFFF"],
      css: `
        .md-body { color: #FFFFFF; background: #0051BA; font-family: "IKEA Noto Sans", "Noto Sans SC", Verdana, Tahoma, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif; line-height: 1.65; }
        .md-body h1, .md-body h2, .md-body h3 { color: #FFDB00; font-weight: 900; line-height: 1.15; }
        .md-body h1 { font-size: 2em; }
        .md-body h1::after { content: ""; display: block; width: 56px; border-bottom: 3px solid #FFDB00; margin-top: 0.4em; }
        .md-body h2 { font-size: 1.5em; }
        .md-body h3 { font-size: 1.15em; color: #FFDB00; }
        .md-body strong { color: #FFDB00; font-weight: 800; }
        .md-body a { color: #FFDB00; font-weight: 700; text-decoration: underline; text-decoration-thickness: 2px; text-underline-offset: 3px; }
        .md-body blockquote { border-left: 4px solid #FFDB00; background: rgba(255, 219, 0, 0.18); margin: 1.4em 0; padding: 0.8em 1.2em; color: #E6EEFF; }
        .md-body code { background: #FFDB00; color: #0051BA; padding: 0.12em 0.4em; border-radius: 3px; font-family: "SF Mono", "Menlo", monospace; font-size: 0.88em; }
        .md-body pre { background: #003A85; border-top: 2px dashed #FFDB00; padding: 1em; overflow-x: auto; }
        .md-body pre code { background: none; color: #FFFFFF; padding: 0; }
        .md-body table { border-collapse: collapse; width: 100%; }
        .md-body th, .md-body td { border: 1px solid rgba(255, 255, 255, 0.4); padding: 0.5em 0.8em; text-align: left; }
        .md-body th { background: #003A85; color: #FFDB00; font-weight: 800; }
        .md-body hr { border: none; border-top: 2px dashed #FFDB00; margin: 2em 0; }
        .md-body img { max-width: 100%; }
        .md-body blockquote p { margin: 0.3em 0; }
        .hljs { background: transparent; }
      `,
    },
  ],
};
