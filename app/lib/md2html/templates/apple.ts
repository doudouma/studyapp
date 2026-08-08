import type { MdTemplate } from "./types";

export const apple: MdTemplate = {
  id: "apple",
  emoji: "🍎",
  nameZh: "Apple",
  nameEn: "Apple",
  descZh: "白画布 + 渐变彩虹标题 + 胶囊按钮，极简科技",
  descEn: "White canvas + gradient hero + pill buttons, minimal tech",
  swatch: ["#FFFFFF", "#0071E3", "#1D1D1F"],
  css: `
    .md-body { color: #1D1D1F; background: #fff; font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", "PingFang SC", "Noto Sans SC", "Microsoft YaHei", Arial, sans-serif; line-height: 1.55; -webkit-font-smoothing: antialiased; }
    .md-body h1, .md-body h2, .md-body h3 { color: #1D1D1F; font-weight: 700; line-height: 1.12; letter-spacing: -0.02em; }
    .md-body h1 { font-size: 2.2em; }
    .md-body h1::after { content: ""; display: block; width: 64px; height: 4px; border-radius: 980px; background: linear-gradient(92deg, #0090FF 0%, #BF5AF2 34%, #FF375F 66%, #FF9F0A 100%); margin-top: 0.5em; }
    .md-body h2 { font-size: 1.6em; }
    .md-body h3 { font-size: 1.2em; color: #6E6E73; }
    .md-body a { color: #0066CC; text-decoration: none; border-bottom: 1px solid rgba(0, 102, 204, 0.4); }
    .md-body a:hover { border-bottom-color: #0066CC; }
    .md-body strong { font-weight: 700; }
    .md-body blockquote { border-left: none; border-radius: 18px; background: #F5F5F7; margin: 1.4em 0; padding: 1em 1.4em; color: #6E6E73; }
    .md-body code { background: #F5F5F7; color: #C7254E; padding: 0.15em 0.4em; border-radius: 6px; font-family: "SF Mono", "Menlo", monospace; font-size: 0.9em; }
    .md-body pre { background: #F5F5F7; border-radius: 12px; padding: 1em; overflow-x: auto; }
    .md-body pre code { background: none; color: #1D1D1F; padding: 0; }
    .md-body table { border-collapse: collapse; width: 100%; }
    .md-body th, .md-body td { border: 1px solid #D2D2D7; padding: 0.5em 0.8em; text-align: left; }
    .md-body th { background: #F5F5F7; font-weight: 600; }
    .md-body hr { border: none; border-top: 1px solid #D2D2D7; margin: 2em 0; }
    .md-body img { max-width: 100%; border-radius: 12px; }
    .md-body blockquote p { margin: 0.3em 0; }
    .md-body li::marker { color: #0071E3; }
    .hljs { background: transparent; }
  `,
  variants: [
    {
      swatch: ["#1D1D1F", "#0071E3", "#FFFFFF"],
      css: `
        .md-body { color: #FFFFFF; background: #1D1D1F; font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", "PingFang SC", "Noto Sans SC", "Microsoft YaHei", Arial, sans-serif; line-height: 1.55; -webkit-font-smoothing: antialiased; }
        .md-body h1, .md-body h2, .md-body h3 { color: #FFFFFF; font-weight: 700; line-height: 1.12; letter-spacing: -0.02em; }
        .md-body h1 { font-size: 2.2em; }
        .md-body h1::after { content: ""; display: block; width: 64px; height: 4px; border-radius: 980px; background: linear-gradient(92deg, #0A84FF 0%, #BF5AF2 34%, #FF375F 66%, #FFD60A 100%); margin-top: 0.5em; }
        .md-body h2 { font-size: 1.6em; }
        .md-body h3 { font-size: 1.2em; color: #A1A1A6; }
        .md-body a { color: #0A84FF; text-decoration: none; border-bottom: 1px solid rgba(10, 132, 255, 0.5); }
        .md-body a:hover { border-bottom-color: #0A84FF; }
        .md-body strong { font-weight: 700; color: #FFFFFF; }
        .md-body blockquote { border-left: none; border-radius: 18px; background: #2C2C2E; margin: 1.4em 0; padding: 1em 1.4em; color: #A1A1A6; }
        .md-body code { background: #2C2C2E; color: #FF6B6B; padding: 0.15em 0.4em; border-radius: 6px; font-family: "SF Mono", "Menlo", monospace; font-size: 0.9em; }
        .md-body pre { background: #2C2C2E; border-radius: 12px; padding: 1em; overflow-x: auto; }
        .md-body pre code { background: none; color: #FFFFFF; padding: 0; }
        .md-body table { border-collapse: collapse; width: 100%; }
        .md-body th, .md-body td { border: 1px solid #48484A; padding: 0.5em 0.8em; text-align: left; }
        .md-body th { background: #2C2C2E; font-weight: 600; }
        .md-body hr { border: none; border-top: 1px solid #48484A; margin: 2em 0; }
        .md-body img { max-width: 100%; border-radius: 12px; }
        .md-body blockquote p { margin: 0.3em 0; }
        .md-body li::marker { color: #0A84FF; }
        .hljs { background: transparent; }
      `,
    },
  ],
};
