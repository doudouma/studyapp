import type { MdTemplate } from "./types";

export const spotify: MdTemplate = {
  id: "spotify",
  emoji: "🎵",
  nameZh: "Spotify",
  nameEn: "Spotify",
  descZh: "黑场 + 品牌绿高亮 + 方形卡片，音乐能量",
  descEn: "Black field + brand-green accents + square cards, musical energy",
  swatch: ["#121212", "#1DB954", "#FFFFFF"],
  css: `
    .md-body { color: #FFFFFF; background: #121212; font-family: "Circular Std", "Avenir Next", "Montserrat", "Nunito", "PingFang SC", "Noto Sans SC", "Microsoft YaHei", system-ui, sans-serif; line-height: 1.6; -webkit-font-smoothing: antialiased; }
    .md-body h1, .md-body h2, .md-body h3 { color: #FFFFFF; font-weight: 800; line-height: 1.12; letter-spacing: -0.01em; }
    .md-body h1 { font-size: 2.2em; }
    .md-body h1::after { content: ""; display: block; width: 44px; height: 4px; border-radius: 2px; background: #1DB954; margin-top: 0.5em; }
    .md-body h2 { font-size: 1.55em; }
    .md-body h3 { font-size: 1.15em; color: #B3B3B3; }
    .md-body a { color: #1ED760; text-decoration: none; border-bottom: 1px solid rgba(30, 215, 96, 0.5); }
    .md-body a:hover { border-bottom-color: #1ED760; }
    .md-body strong { color: #1ED760; font-weight: 700; }
    .md-body blockquote { border-left: 3px solid #1DB954; background: #181818; border-radius: 8px; margin: 1.4em 0; padding: 1em 1.3em; color: #B3B3B3; }
    .md-body code { background: #181818; color: #1ED760; padding: 0.15em 0.4em; border-radius: 4px; font-family: "SF Mono", "Menlo", monospace; font-size: 0.9em; }
    .md-body pre { background: #000; border: 1px solid #282828; border-radius: 8px; padding: 1em; overflow-x: auto; }
    .md-body pre code { background: none; color: #FFFFFF; padding: 0; }
    .md-body table { border-collapse: collapse; width: 100%; }
    .md-body th, .md-body td { border: 1px solid #282828; padding: 0.5em 0.8em; text-align: left; }
    .md-body th { background: #181818; font-weight: 700; }
    .md-body hr { border: none; height: 2px; background: #282828; border-radius: 1px; margin: 2em 0; }
    .md-body img { max-width: 100%; border-radius: 8px; }
    .md-body blockquote p { margin: 0.3em 0; }
    .md-body li::marker { color: #1DB954; }
    .hljs { background: transparent; }
  `,
};
