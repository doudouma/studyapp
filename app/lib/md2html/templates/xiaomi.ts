import type { MdTemplate } from "./types";

export const xiaomi: MdTemplate = {
  id: "xiaomi",
  emoji: "📱",
  nameZh: "Xiaomi",
  nameEn: "Xiaomi",
  descZh: "小米橙 + 超椭圆曲线 + 纯白画布，极客活力",
  descEn: "Xiaomi orange + superellipse curves + white canvas, vibrant",
  swatch: ["#FFFFFF", "#FF6900", "#0A0A0A"],
  css: `
    .md-body { color: #1A1A1A; background: #fff; font-family: "MiSans", "MiSans VF", "PingFang SC", "HarmonyOS Sans SC", "Noto Sans SC", "Microsoft YaHei", system-ui, sans-serif; line-height: 1.65; -webkit-font-smoothing: antialiased; }
    .md-body h1, .md-body h2, .md-body h3 { color: #0A0A0A; font-weight: 800; line-height: 1.12; letter-spacing: -0.015em; }
    .md-body h1 { font-size: 2.1em; }
    .md-body h1::after { content: ""; display: block; width: 48px; height: 5px; background: #FF6900; border-radius: 34% 34% 34% 34% / 34% 34% 34% 34%; margin-top: 0.45em; }
    .md-body h2 { font-size: 1.5em; }
    .md-body h3 { font-size: 1.15em; color: #6B6B6B; }
    .md-body a { color: #E65100; font-weight: 600; text-decoration: none; border-bottom: 2px solid #FF6900; }
    .md-body a:hover { border-bottom-color: #E65100; }
    .md-body strong { color: #FF6900; font-weight: 800; }
    .md-body blockquote { border-left: 4px solid #FF6900; background: #F5F5F5; border-radius: 8px; margin: 1.4em 0; padding: 0.8em 1.2em; color: #6B6B6B; }
    .md-body code { background: #F5F5F5; color: #E65100; padding: 0.12em 0.4em; border-radius: 6px; font-family: "SF Mono", "Menlo", monospace; font-size: 0.88em; }
    .md-body pre { background: #0A0A0A; border-radius: 12px; padding: 1em; overflow-x: auto; }
    .md-body pre code { background: none; color: #F5F5F5; padding: 0; }
    .md-body table { border-collapse: collapse; width: 100%; }
    .md-body th, .md-body td { border-bottom: 1px solid #E5E5E5; padding: 0.5em 0.8em; text-align: left; }
    .md-body th { background: #F5F5F5; font-weight: 700; }
    .md-body hr { border: none; border-top: 1px solid #E5E5E5; margin: 2em 0; }
    .md-body img { max-width: 100%; border-radius: 12px; }
    .md-body blockquote p { margin: 0.3em 0; }
    .md-body li::marker { color: #FF6900; }
    .hljs { background: transparent; }
  `,
};
