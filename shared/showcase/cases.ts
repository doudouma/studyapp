import type { ShowcaseCase } from "../types/showcase";

/**
 * 案例库数据（纯静态，手工维护）
 *
 * 新增案例：复制 SHOWCASE_CASES 里的对象，按同样结构填写英文内容。
 * 约定（tests/showcase.spec.ts 会断言）：
 * - slug 唯一、URL-safe（^[a-z0-9-]+$），一经发布不可更改——外链与引用都指向它
 * - summary / name / sections 非空
 * - sources 至少 1 条，url 必须 https
 * - externalUrl（若填）必须 https
 * - category 必须是 shared/types/showcase.ts 里 CATEGORIES 之一
 * - facts 的 key 在同一案例内不重复
 *
 * 可选字段：author / publishedAt / updatedAt（ISO yyyy-mm-dd，会影响 sitemap lastmod
 * 与 Article JSON-LD 的 datePublished）、cover（public/showcase/{slug}.webp）。
 */
export const SHOWCASE_CASES: ShowcaseCase[] = [
  {
    slug: "photon",
    name: "Photon",
    summary:
      "A vibe-coded, LLM-orchestrated lightweight Photoshop alternative — free, offline-capable, and cross-platform.",
    category: "tools",
    tags: ["AI-generated", "Desktop app", "Free", "Offline", "Vibe coding"],
    facts: [
      { key: "author", value: "u/AsejereDaDeje · r/vibecoding" },
      { key: "platforms", value: "macOS · Windows 11 · Linux (Flatpak)" },
      { key: "version", value: "v0.1.8 · early release" },
      { key: "models", value: "gpt astra 6 extra high" },
      { key: "day 1 users", value: "170", highlight: true },
      { key: "token cost", value: "~$2,000" },
      { key: "price", value: "Free · no paywall" },
      { key: "offline", value: "Yes" },
    ],
    sections: [
      {
        heading: "What it is",
        paragraphs: [
          "Photon is a lightweight image editor built entirely through LLM orchestration — the author describes the process as \"vibe coding\". It targets the everyday majority of Photoshop workflows rather than full professional feature parity, and ships natively for macOS, Windows 11 and Ubuntu.",
          "It is free to use with no premium tier, no paywall and no account requirement, and it keeps working offline.",
        ],
      },
      {
        heading: "Core value proposition",
        paragraphs: [
          "Photon Studio positions itself as a lightweight, zero-cloud desktop raster editor. Unlike web-based editors or cloud-reliant tools, it runs every operation — including machine-learning features such as subject detection and background removal — entirely on your local hardware.",
        ],
        blocks: [
          {
            type: "list",
            items: [
              "Native PSD compatibility: opens and writes Photoshop .psd documents while preserving core structures such as layer hierarchies, groups, masks and smart objects.",
              "Strict data isolation: zero network dependencies, zero registration, no cloud uploads.",
              "Cross-platform and accessible: macOS (Apple Silicon and Intel), Windows 11, and Linux via Flatpak.",
            ],
          },
        ],
      },
      {
        heading: "What it can replace",
        blocks: [
          {
            type: "table",
            columns: ["Target software", "Feasibility", "Verdict & use-case context"],
            rows: [
              [
                "Photopea",
                { text: "High", sub: "Primary alternative", tone: "good" },
                "Replaces Photopea for users seeking a desktop-native tool free of browser ads, network lag and third-party web trackers.",
              ],
              [
                "Adobe Photoshop",
                { text: "Partial", sub: "Low-tier tasks only", tone: "warn" },
                "Can replace basic PS tasks — asset slicing, UI inspection, quick retouches, background cutouts — but not complex workflows such as Actions, advanced CMYK prepress, complex plugins or GenFill.",
              ],
              [
                "GIMP",
                { text: "Moderate", sub: "UI-driven switching", tone: "neutral" },
                "Attractive for users who find GIMP's interface unintuitive and want Photoshop-standard keybindings and native layer-effect paradigms out of the box.",
              ],
              [
                "Affinity Photo",
                { text: "Low", sub: "Not a substitute", tone: "bad" },
                "Affinity remains vastly superior in RAW processing, non-destructive vector/raster hybrid workflows and GPU acceleration.",
              ],
            ],
          },
        ],
      },
      {
        heading: "Current realities and limitations",
        blocks: [
          {
            type: "list",
            items: [
              "Early-stage performance bottlenecks: at v0.1.8, compute-heavy operations such as the healing brush or complex liquify meshes show noticeable latency and occasional UI freezing next to mature C++ engines.",
              "Limited typographic and i18n support: international text rendering and non-Latin character input can be inconsistent or unsupported in this build.",
              "Distribution friction: downloads require submitting an email address to receive an installer link rather than offering a direct repository or direct-download URL.",
            ],
          },
        ],
      },
      {
        heading: "Verdict",
        blocks: [
          {
            type: "note",
            label: "Primary recommendation",
            tone: "neutral",
            text: "Best used today as a secure, offline PSD viewer and lightweight graphics utility — for developers and designers who need quick edits without loading a heavy creative suite.",
          },
        ],
      },
      {
        heading: "Development lifecycle and iteration loop",
        paragraphs: [
          "Deep research came first: an initial comprehensive breakdown of core Photoshop features and workflows, ingested with gpt. Those requirements then went into gpt astra 6 extra high to draft the system structure and execution stages.",
          "A human-in-the-loop review followed — the author inspected the generated roadmap, injected critical feedback and adjusted the technical boundaries before any code existed.",
          "The MVP generation produced a working but unstable first build. From there a rapid feedback cycle took over: manual usage, identify bugs or request changes, patch generation, re-verification. Patches came from fable and gpt6.",
          "After launch, users hit sign-in blocks caused by a shared server proxy IP capping everyone at 20 emails per hour. Codex produced the per-visitor rate-limit fix and redeployed in under 5 minutes.",
          "Which model did which job is the part of this case most worth copying: the expensive, long-context planning model runs once, while cheap fast models handle the tight patch loop.",
        ],
        blocks: [
          {
            type: "table",
            columns: ["Stage", "Model used"],
            rows: [
              ["Research & ingestion", "gpt"],
              ["Architecture & planning", "gpt astra 6 extra high"],
              ["Bug fixing & patch generation", "fable · gpt6"],
              ["Deployment hotfix", "Codex"],
            ],
          },
          {
            type: "note",
            label: "Cost profile",
            tone: "neutral",
            text: "Total token spend across the whole build: roughly $2,000 — planned once with the most expensive model, then iterated with cheaper ones.",
          },
        ],
      },
      {
        heading: "Metrics and monetization",
        paragraphs: [
          "The project reached 170 active users on launch day.",
          "Monetization is deliberately absent: completely free, with no premium tiers or paywalls. The creator stated that money is not a motivator following an earlier 7-figure exit.",
          "The roadmap focuses on user-driven quality-of-life additions — clipboard auto-sizing canvas, zoom presets, and non-distro Linux packaging such as Flatpak and AppImage — before potentially experimenting with standalone clones of complex tools like After Effects.",
        ],
      },
      {
        heading: "Community reception and key debates",
        paragraphs: [
          "Feasibility drew sizable skepticism: can a tool like this truly serve as a Photoshop replacement, or is it a basic graphic and word-art editor? The discussion highlights the 80/20 rule in creative software, where long-tail features vary wildly across professional workflows.",
          "Comparisons to established free tools dominated the thread — Photopea, GIMP, Krita and Affinity — with community consensus that solo-engineered web tools like Photopea remain the high-water mark for non-Adobe workflows.",
          "Most broadly, the project serves as a high-visibility test case for how conversational AI compresses software MVP prototyping from months into days at minimal capital.",
        ],
      },
    ],
    sources: [
      {
        title: "r/vibecoding — Photon project thread",
        url: "https://www.reddit.com/r/vibecoding/",
        publisher: "Reddit",
      },
      {
        title: "Photon — official site",
        url: "https://tenzen.studio/photon/",
        publisher: "tenzen.studio",
      },
    ],
    externalUrl: "https://tenzen.studio/photon/",
    author: "u/AsejereDaDeje",
    cover: {
      video: "https://tenzen.studio/assets/videos/photon_hero.mp4",
    },
  },
];
