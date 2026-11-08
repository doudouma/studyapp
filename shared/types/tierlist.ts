/**
 * AI Tier List（AI 工具等级榜 / 社区投票）共享类型与常量
 *
 * 前后端唯一数据契约来源。主题工具池在这里只定义一次，同时服务三处：
 *  1. 建榜工具（TierListMaker）的主题预设池；
 *  2. 固定投票榜的榜单构成（0 票工具也要上榜）；
 *  3. 后端校验投票对象是否合法（防止往库里写任意 tool 字符串）。
 */

/** 工具分类 id —— 显示时由 `aiTierlist.cat.<id>` 翻译，故存 id 而非文案 */
export const TIER_CATS = [
  "chat",
  "image",
  "video",
  "code",
  "audio",
  "writing",
  "productivity",
  "search",
  "research",
  "other",
] as const;
export type TierCat = (typeof TIER_CATS)[number];

/** [工具名, 分类 id] */
export type TierToolEntry = [string, TierCat];

/** 建榜工具的 7 个主题（含通用任意榜 generic） */
export const TIERLIST_THEMES = [
  "generic",
  "image",
  "code",
  "chat",
  "video",
  "free",
  "research",
] as const;
export type TierlistTheme = (typeof TIERLIST_THEMES)[number];

/** 可投票的固定榜 = 除通用榜外的 6 个主题 */
export const TIERLIST_BOARDS = [
  "image",
  "code",
  "chat",
  "video",
  "free",
  "research",
] as const;
export type TierlistBoard = (typeof TIERLIST_BOARDS)[number];

export function isTierlistBoard(v: unknown): v is TierlistBoard {
  return typeof v === "string" && (TIERLIST_BOARDS as readonly string[]).includes(v);
}

export function isTierlistTheme(v: unknown): v is TierlistTheme {
  return typeof v === "string" && (TIERLIST_THEMES as readonly string[]).includes(v);
}

export function isTierToolEntry(v: unknown): v is TierToolEntry {
  return Array.isArray(v) && v.length === 2 && typeof v[0] === "string" && typeof v[1] === "string";
}

/** 每个主题的固定工具池（顺序即 0 票时的展示顺序） */
export const TIERLIST_TOOLS: Record<TierlistTheme, TierToolEntry[]> = {
  generic: [
    ["ChatGPT", "chat"], ["Claude", "chat"], ["Gemini", "chat"], ["Perplexity", "search"],
    ["DeepSeek", "chat"], ["Grok", "chat"], ["Copilot", "chat"], ["Kimi", "chat"],
    ["Midjourney", "image"], ["DALL·E", "image"], ["Stable Diffusion", "image"], ["Flux", "image"],
    ["Ideogram", "image"], ["Recraft", "image"], ["即梦", "image"], ["可灵", "video"],
    ["Runway", "video"], ["Pika", "video"], ["HeyGen", "video"], ["Opus Clip", "video"],
    ["Cursor", "code"], ["Windsurf", "code"], ["GitHub Copilot", "code"], ["Claude Code", "code"],
    ["v0", "code"], ["Bolt", "code"], ["Suno", "audio"], ["ElevenLabs", "audio"],
    ["Udio", "audio"], ["Notion AI", "productivity"], ["Gamma", "productivity"],
    ["NotebookLM", "productivity"], ["Rewind", "productivity"], ["Consensus", "search"],
    ["Elicit", "search"],
  ],
  image: [
    ["Midjourney", "image"], ["DALL·E 3", "image"], ["Stable Diffusion", "image"], ["SDXL", "image"],
    ["Flux", "image"], ["Ideogram", "image"], ["Recraft", "image"], ["即梦 Jimeng", "image"],
    ["Krea", "image"], ["Leonardo", "image"], ["Adobe Firefly", "image"], ["Playground", "image"],
    ["Fooocus", "image"], ["ComfyUI", "image"], ["Magnific", "image"], ["SeaArt", "image"],
  ],
  code: [
    ["Cursor", "code"], ["Windsurf", "code"], ["GitHub Copilot", "code"], ["Claude Code", "code"],
    ["v0", "code"], ["Bolt", "code"], ["Kilo Code", "code"], ["Codeium", "code"],
    ["Tabnine", "code"], ["JetBrains AI", "code"], ["Augment", "code"], ["Cline", "code"],
    ["Aider", "code"], ["Replit", "code"], ["Sourcegraph Cody", "code"], ["OpenAI Codex", "code"],
  ],
  chat: [
    ["ChatGPT", "chat"], ["Claude", "chat"], ["Gemini", "chat"], ["Perplexity", "chat"],
    ["DeepSeek", "chat"], ["Grok", "chat"], ["Kimi", "chat"], ["Copilot", "chat"],
    ["Meta AI", "chat"], ["Pi", "chat"], ["You.com", "chat"], ["Jenni AI", "writing"],
    ["Jasper", "writing"], ["Notion AI", "writing"], ["QuillBot", "writing"], ["Grammarly", "writing"],
  ],
  video: [
    ["Runway", "video"], ["Pika", "video"], ["可灵 Kling", "video"], ["HeyGen", "video"],
    ["Opus Clip", "video"], ["Luma Dream Machine", "video"], ["OpenAI Sora", "video"],
    ["Google Veo", "video"], ["Hailuo MiniMax", "video"], ["Synthesia", "video"],
    ["D-ID", "video"], ["Captions", "video"], ["Kaiber", "video"], ["Vidu", "video"],
    ["Luma", "video"],
  ],
  free: [
    ["DeepSeek", "chat"], ["ChatGPT (Free)", "chat"], ["Claude (Free)", "chat"],
    ["Perplexity (Free)", "search"], ["Krea (Open)", "image"], ["Stable Diffusion (Open)", "image"],
    ["Fooocus (Open)", "image"], ["ComfyUI (Open)", "image"], ["Ollama (Local)", "code"],
    ["Whisper (Open)", "audio"], ["Leonardo (Free)", "image"], ["Qwen (Open)", "chat"],
    ["Meta Llama (Open)", "chat"], ["Suno (Free)", "audio"], ["NotebookLM (Free)", "productivity"],
  ],
  research: [
    ["Perplexity", "search"], ["Consensus", "search"], ["Elicit", "search"], ["Scite", "search"],
    ["ScholarAI", "search"], ["ResearchRabbit", "search"], ["NotebookLM", "productivity"],
    ["ChatPDF", "productivity"], ["Semantic Scholar", "search"], ["Gemini", "chat"],
    ["Jenni AI", "writing"], ["Zotero AI", "productivity"], ["Inciteful", "search"],
    ["Explainpaper", "productivity"],
  ],
};

/** 等级档位数：0=S 1=A 2=B 3=C 4=D */
export const TIER_LEVELS = 5;

/** 档位下标 → 字母（跨语言稳定，界面直接显示字母） */
export const TIER_LEVEL_LABELS = ["S", "A", "B", "C", "D"] as const;

/** 聚合用的原始计数行（repo 产出） */
export interface TierlistTally {
  tool: string;
  tier: number;
  count: number;
}

/** 单个工具的投票结果 */
export interface TierlistToolResult {
  tool: string;
  cat: TierCat;
  /** 长度恒为 5，索引 = 档位（0=S…4=D） */
  votes: number[];
  total: number;
  /** 票数加权平均档位（0–4），0 票为 null */
  avgTier: number | null;
  /** 舍入后的流行等级（0–4），0 票为 null */
  rank: number | null;
  /** 当前登录用户对该工具的档位，未投票/未登录为 null */
  myTier: number | null;
}

/** GET /api/tierlist/:board 响应 */
export interface TierlistBoardResponse {
  board: TierlistBoard;
  results: TierlistToolResult[];
  /** 当前用户的全部投票 { tool: 档位 } */
  myVotes: Record<string, number>;
}

/** POST /api/tierlist/vote 请求体 */
export interface CastVoteRequest {
  board: string;
  tool: string;
  tier: number;
}

/** POST /api/tierlist/vote 响应体 */
export interface CastVoteResponse {
  success: boolean;
  tool: string;
  tier: number;
}
