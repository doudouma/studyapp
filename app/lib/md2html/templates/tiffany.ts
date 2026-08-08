import type { MdTemplate } from "./types";

export const tiffany: MdTemplate = {
  id: "tiffany",
  emoji: "💎",
  nameZh: "Tiffany",
  nameEn: "Tiffany",
  descZh: "Tiffany 蓝 + 衬线大标题，奢侈品锐利直角",
  descEn: "Tiffany blue + serif headlines, luxury sharp edges",
  swatch: ["#FFFFFF", "#81D8D0", "#0A0A0A"],
  css: `
    .md-body { color: #0A0A0A; background: #fff; font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Noto Sans SC", Arial, sans-serif; line-height: 1.7; }
    .md-body h1, .md-body h2, .md-body h3 { font-family: "Didot", "Bodoni MT", "Playfair Display", "Songti SC", "Noto Serif SC", Georgia, serif; font-weight: 500; line-height: 1.2; color: #0A0A0A; letter-spacing: 0.005em; }
    .md-body h1 { font-size: 2.2em; }
    .md-body h1::after { content: ""; display: block; width: 48px; height: 1px; background: #81D8D0; margin-top: 0.5em; }
    .md-body h2 { font-size: 1.6em; }
    .md-body h3 { font-size: 1.2em; color: #767676; }
    .md-body em { font-style: italic; color: #81D8D0; }
    .md-body a { color: #0A0A0A; font-weight: 600; text-decoration: none; border-bottom: 1px solid #81D8D0; }
    .md-body a:hover { border-bottom-color: #0A0A0A; }
    .md-body strong { font-weight: 600; }
    .md-body blockquote { border-left: none; border-top: 1px solid #0A0A0A; border-bottom: 1px solid #0A0A0A; margin: 1.6em 0; padding: 0.8em 0.2em; color: #3A3A3A; font-style: italic; font-family: "Didot", "Playfair Display", "Songti SC", "Noto Serif SC", Georgia, serif; }
    .md-body code { background: #F4F4F4; color: #81D8D0; padding: 0.12em 0.4em; font-family: "SF Mono", "Menlo", monospace; font-size: 0.88em; }
    .md-body pre { border: 1px solid #E3E3E3; border-radius: 0; padding: 1em; overflow-x: auto; background: #F8F8F8; }
    .md-body pre code { background: none; color: #0A0A0A; padding: 0; }
    .md-body table { border-collapse: collapse; width: 100%; }
    .md-body th, .md-body td { border-bottom: 1px solid #E3E3E3; padding: 0.6em 0.8em; text-align: left; }
    .md-body th { border-bottom: 1px solid #0A0A0A; font-weight: 600; }
    .md-body hr { border: none; border-top: 1px solid #E3E3E3; margin: 2.5em 0; }
    .md-body img { max-width: 100%; }
    .md-body blockquote p { margin: 0.4em 0; }
    .md-body li::marker { color: #81D8D0; }
    .hljs { background: transparent; }
  `,
};
