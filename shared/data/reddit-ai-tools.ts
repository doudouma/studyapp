import type { TierCat } from "../types/tierlist";

/**
 * Reddit「AI 工具提及统计」数据（2026-11-09 采集）
 *
 * 口径：10 个 AI 相关 subreddit、过去 30 天、帖子标题+正文提及（不含评论）。
 * 每个工具按 Reddit 官方搜索页 sort=new 抓取，上限 5 页 × 25 条；
 * 达到上限的标 capped=true，日均按前 125 条的发布时间跨度估算。
 *
 * 单测/页面共用，修改数据时请同步更新 `REDDIT_STATS.asOf`。
 * 这是采样统计，不是 Reddit 后台全量数据；页面必须展示口径与限制。
 */

export type RedditVerdict = "top" | "strong" | "steady" | "watch";
export type StatLang = "en" | "zh" | "es" | "fr" | "pt";

export interface RedditTopPost {
  title: string;
  sub: string;
  score: number;
  url: string;
}

export interface RedditToolStat {
  tool: string;
  cat: TierCat;
  /** 30 天内采样到的帖子提及数 */
  mentions: number;
  /** 是否触达 125 条采样上限（真实总量 ≥ mentions） */
  capped: boolean;
  /** 估算日均提及（capped 时按前 125 条的时间跨度推算） */
  daily: number;
  verdict: RedditVerdict;
  /** 标题明确包含工具名的高赞帖；没有则为 null */
  topPost: RedditTopPost | null;
  /** 一句话社区评价（5 语言） */
  note: Record<StatLang, string>;
}

export const REDDIT_STATS = {
  asOf: "2026-11-09",
  windowDays: 30,
  sampleCap: 125,
  subs: [
    "ChatGPT",
    "ClaudeAI",
    "OpenAI",
    "LocalLLaMA",
    "StableDiffusion",
    "midjourney",
    "artificial",
    "singularity",
    "ChatGPTCoding",
    "cursor",
  ],
} as const;

export const REDDIT_TOOL_STATS: RedditToolStat[] = [
  {
    tool: "ChatGPT",
    cat: "chat",
    mentions: 125,
    capped: true,
    daily: 157.2,
    verdict: "top",
    topPost: {
      title: "ChatGPT leaked an internal prompt",
      sub: "ChatGPT",
      score: 5387,
      url: "https://www.reddit.com/r/ChatGPT/comments/1xo1r57/chatgpt_leaked_an_internal_prompt/",
    },
    note: {
      en: "The default for chat and writing: the largest volume, but discussion is spread across daily use and news.",
      zh: "对话与写作的默认选项，提及量最大，讨论多集中在日常用法与新闻。",
      es: "La opción por defecto para chat y escritura: el mayor volumen, con debate repartido entre uso diario y noticias.",
      fr: "Le choix par défaut pour le chat et l'écriture : le plus gros volume, mais les discussions se dispersent entre usage quotidien et actualité.",
      pt: "A opção padrão para chat e escrita: o maior volume, com discussões divididas entre uso diário e notícias.",
    },
  },
  {
    tool: "Claude",
    cat: "chat",
    mentions: 125,
    capped: true,
    daily: 146.6,
    verdict: "top",
    topPost: {
      title:
        "Developer uses Claude to overhaul his parents’ TV, removing ads and replacing its entire interface",
      sub: "singularity",
      score: 13405,
      url: "https://www.reddit.com/r/singularity/comments/1xfh36p/developer_uses_claude_to_overhaul_his_parents_tv/",
    },
    note: {
      en: "Highest engagement per post; long-form writing and coding earn the strongest word of mouth.",
      zh: "单帖互动最高，长文写作与编程口碑最集中。",
      es: "El mayor engagement por publicación; escritura larga y programación concentran el mejor boca a boca.",
      fr: "Le meilleur engagement par post ; l'écriture longue et le code concentrent le bouche-à-oreille le plus positif.",
      pt: "O maior engajamento por post; escrita longa e programação concentram o melhor boca a boca.",
    },
  },
  {
    tool: "Claude Code",
    cat: "code",
    mentions: 125,
    capped: true,
    daily: 58.1,
    verdict: "top",
    topPost: {
      title: "I replaced my Samsung TV’s home screen with Claude Code",
      sub: "ClaudeAI",
      score: 3074,
      url: "https://www.reddit.com/r/ClaudeAI/comments/1xbzlih/i_replaced_my_samsung_tvs_home_screen_with_claude/",
    },
    note: {
      en: "The most-discussed coding agent; posts skew toward real projects and workflows.",
      zh: "编程类讨论度第一，帖子多为真实项目与工作流展示。",
      es: "El agente de código más comentado; predominan proyectos y flujos de trabajo reales.",
      fr: "L'agent de code le plus discuté ; les posts portent surtout sur des projets et workflows réels.",
      pt: "O agente de código mais comentado; os posts são majoritariamente projetos e fluxos reais.",
    },
  },
  {
    tool: "Cursor",
    cat: "code",
    mentions: 125,
    capped: true,
    daily: 16.1,
    verdict: "strong",
    topPost: {
      title: "Cursor legacy Pro vs X Premium (KEEP YOUR LEGACY PLAN)",
      sub: "cursor",
      score: 201,
      url: "https://www.reddit.com/r/cursor/comments/1xmhb71/cursor_legacy_pro_vs_x_premium_keep_your_legacy/",
    },
    note: {
      en: "Clear second in IDE assistants; plan and pricing debates dominate the conversation.",
      zh: "IDE 助手里稳居第二，套餐与定价争议是主要话题。",
      es: "Claro segundo entre los asistentes de IDE; los debates sobre planes y precios dominan.",
      fr: "Deuxième net des assistants IDE ; les débats sur les offres et les prix dominent.",
      pt: "Claro segundo entre assistentes de IDE; debates sobre planos e preços dominam.",
    },
  },
  {
    tool: "Gemini",
    cat: "chat",
    mentions: 125,
    capped: true,
    daily: 14.6,
    verdict: "strong",
    topPost: {
      title:
        "Anthropic's growing restrictions are creating a new divide in the AI capabilities race",
      sub: "singularity",
      score: 1800,
      url: "https://www.reddit.com/r/singularity/comments/1xl6vk8/anthropics_growing_restrictions_are_creating_a/",
    },
    note: {
      en: "Steady volume, with sentiment shaped by model limits and positioning debates.",
      zh: "讨论量稳定，口碑受模型限制与产品定位争议影响。",
      es: "Volumen estable, con sentimiento marcado por los límites del modelo y su posicionamiento.",
      fr: "Volume stable, le sentiment étant marqué par les limites du modèle et son positionnement.",
      pt: "Volume estável, com sentimento moldado pelos limites do modelo e seu posicionamento.",
    },
  },
  {
    tool: "Midjourney",
    cat: "image",
    mentions: 125,
    capped: true,
    daily: 13.0,
    verdict: "strong",
    topPost: {
      title:
        "A few images from Midjourney V8. Still feels like the best sense of aesthetics of any image model",
      sub: "midjourney",
      score: 277,
      url: "https://www.reddit.com/r/midjourney/comments/1xoeh1l/a_few_images_from_midjourney_v8_still_feels_like/",
    },
    note: {
      en: "Aesthetics and output quality still win praise; discussion stays mostly in its own sub.",
      zh: "审美与出图质感仍被认可，讨论主要集中在自家版块。",
      es: "La estética y la calidad de imagen siguen recibiendo elogios; el debate se concentra en su propio sub.",
      fr: "L'esthétique et la qualité des images restent saluées ; les discussions restent dans son sub.",
      pt: "Estética e qualidade de imagem ainda recebem elogios; a discussão fica no próprio sub.",
    },
  },
  {
    tool: "DeepSeek",
    cat: "chat",
    mentions: 125,
    capped: true,
    daily: 12.9,
    verdict: "strong",
    topPost: {
      title: "deepseek-ai/DeepSeek-V4.1-Flash-1017 · Hugging Face",
      sub: "LocalLLaMA",
      score: 1171,
      url: "https://www.reddit.com/r/LocalLLaMA/comments/1x84po4/deepseekaideepseekv41flash1017_hugging_face/",
    },
    note: {
      en: "Strong open-weight and local-deployment buzz, led by r/LocalLLaMA.",
      zh: "开源权重与本地部署讨论热度高，主阵地是 r/LocalLLaMA。",
      es: "Fuerte interés por pesos abiertos y despliegue local, liderado por r/LocalLLaMA.",
      fr: "Fort engouement pour les poids ouverts et le déploiement local, mené par r/LocalLLaMA.",
      pt: "Forte interesse em pesos abertos e implantação local, liderado pelo r/LocalLLaMA.",
    },
  },
  {
    tool: "Flux",
    cat: "image",
    mentions: 125,
    capped: true,
    daily: 6.2,
    verdict: "strong",
    topPost: {
      title: "FLUX 3 Image Open Weights is released",
      sub: "StableDiffusion",
      score: 640,
      url: "https://www.reddit.com/r/StableDiffusion/comments/1x6oh9d/flux_3_image_open_weights_is_released/",
    },
    note: {
      en: "The centre of open-weight image discussion; releases regularly top the sub.",
      zh: "开源图像模型的讨论中心，版本更新常上热帖。",
      es: "El centro del debate sobre imagen de pesos abiertos; sus lanzamientos suelen destacar.",
      fr: "Le centre des discussions sur l'image open-weight ; ses sorties dominent régulièrement le sub.",
      pt: "O centro da discussão sobre imagem de pesos abertos; lançamentos costumam liderar o sub.",
    },
  },
  {
    tool: "Stable Diffusion",
    cat: "image",
    mentions: 125,
    capped: true,
    daily: 4.1,
    verdict: "steady",
    topPost: null,
    note: {
      en: "A mature ecosystem focused on tooling; less novelty heat than Flux.",
      zh: "生态成熟、讨论偏工具链，新增热度不及 Flux。",
      es: "Ecosistema maduro centrado en herramientas; menos novedad que Flux.",
      fr: "Un écosystème mature centré sur les outils ; moins de nouveauté que Flux.",
      pt: "Ecossistema maduro focado em ferramentas; menos novidade que o Flux.",
    },
  },
  {
    tool: "ElevenLabs",
    cat: "audio",
    mentions: 75,
    capped: false,
    daily: 2.5,
    verdict: "steady",
    topPost: {
      title: "Adobe, Office, Outlook, ElevenLabs: AI is cloning all of it in Rust",
      sub: "ClaudeAI",
      score: 2349,
      url: "https://www.reddit.com/r/ClaudeAI/comments/1x9dl1f/adobe_office_outlook_elevenlabs_ai_is_cloning_all/",
    },
    note: {
      en: "The most-mentioned audio tool, often appearing in dubbing and multimodal comparisons.",
      zh: "音频类提及第一，常出现在配音与多模态对比帖中。",
      es: "La herramienta de audio más mencionada, a menudo en doblaje y comparativas multimodales.",
      fr: "L'outil audio le plus mentionné, souvent dans le doublage et les comparaisons multimodales.",
      pt: "A ferramenta de áudio mais mencionada, frequentemente em dublagem e comparações multimodais.",
    },
  },
  {
    tool: "Perplexity",
    cat: "search",
    mentions: 66,
    capped: false,
    daily: 2.2,
    verdict: "steady",
    topPost: {
      title: "Perplexity open sources firecracker orchestrator for agent sandboxing",
      sub: "LocalLLaMA",
      score: 28,
      url: "https://www.reddit.com/r/LocalLLaMA/comments/1x9whcm/perplexity_open_sources_firecracker_orchestrator/",
    },
    note: {
      en: "A steady research/search niche with clear use cases and modest volume.",
      zh: "搜索/研究场景稳定有一席，讨论量不大但方向明确。",
      es: "Un nicho estable de investigación/búsqueda, con casos de uso claros y volumen moderado.",
      fr: "Une niche stable recherche/documentation, avec des usages clairs et un volume modéré.",
      pt: "Um nicho estável de pesquisa/busca, com casos de uso claros e volume moderado.",
    },
  },
  {
    tool: "Suno",
    cat: "audio",
    mentions: 63,
    capped: false,
    daily: 2.1,
    verdict: "steady",
    topPost: {
      title: "Made on DGX Spark locally with Mini Max H3. Human written, Suno generated",
      sub: "StableDiffusion",
      score: 9,
      url: "https://www.reddit.com/r/StableDiffusion/comments/1xdrkfa/made_on_dgx_spark_locally_with_mini_max_h3_human/",
    },
    note: {
      en: "A music-generation niche centred on track demos and copyright talk.",
      zh: "音乐生成垂类，讨论集中在作品展示与版权话题。",
      es: "Un nicho de generación musical centrado en demos y derechos de autor.",
      fr: "Une niche de génération musicale centrée sur les démos et le droit d'auteur.",
      pt: "Um nicho de geração musical centrado em demos e direitos autorais.",
    },
  },
  {
    tool: "Ideogram",
    cat: "image",
    mentions: 30,
    capped: false,
    daily: 1.0,
    verdict: "steady",
    topPost: {
      title: "Ideogram 4.5 Coming soon?",
      sub: "StableDiffusion",
      score: 48,
      url: "https://www.reddit.com/r/StableDiffusion/comments/1x7arra/ideogram_45_coming_soon/",
    },
    note: {
      en: "Known for text-in-image rendering, with modest overall volume.",
      zh: "文字排版能力被认可，整体讨论量偏低。",
      es: "Conocido por renderizar texto en imágenes, con volumen general modesto.",
      fr: "Reconnu pour le rendu de texte dans l'image, avec un volume global modeste.",
      pt: "Conhecido por renderizar texto em imagens, com volume geral modesto.",
    },
  },
  {
    tool: "Kling",
    cat: "video",
    mentions: 18,
    capped: false,
    daily: 0.6,
    verdict: "watch",
    topPost: null,
    note: {
      en: "Video generation mostly appears in image-sub comparisons; standalone talk is thin.",
      zh: "视频生成多出现在图像版块对比帖，独立讨论偏少。",
      es: "La generación de vídeo aparece sobre todo en comparativas de subs de imagen; el debate propio es escaso.",
      fr: "La génération vidéo apparaît surtout dans les comparatifs des subs image ; les discussions dédiées sont rares.",
      pt: "A geração de vídeo aparece principalmente em comparações de subs de imagem; a discussão própria é escassa.",
    },
  },
  {
    tool: "Runway",
    cat: "video",
    mentions: 17,
    capped: false,
    daily: 0.6,
    verdict: "watch",
    topPost: null,
    note: {
      en: "A pro video tool with limited day-to-day discussion in general AI subs.",
      zh: "专业视频工具，在综合 AI 社区日常讨论热度有限。",
      es: "Herramienta de vídeo profesional con poca discusión diaria en subs generales de IA.",
      fr: "Un outil vidéo pro avec peu de discussions quotidiennes dans les subs IA généralistes.",
      pt: "Ferramenta de vídeo profissional com pouca discussão diária em subs gerais de IA.",
    },
  },
  {
    tool: "Sora",
    cat: "video",
    mentions: 13,
    capped: false,
    daily: 0.4,
    verdict: "watch",
    topPost: {
      title: "Now that Sora is not available, what are you guys using?",
      sub: "ChatGPT",
      score: 12,
      url: "https://www.reddit.com/r/ChatGPT/comments/1xmwj8g/now_that_sora_is_not_available_what_are_you_guys/",
    },
    note: {
      en: "Hype has cooled since launch; last-30-day volume is low for a video tool.",
      zh: "热度较发布期回落，近 30 天讨论量在视频类偏低。",
      es: "El hype se ha enfriado desde el lanzamiento; el volumen de 30 días es bajo para vídeo.",
      fr: "L'engouement est retombé depuis le lancement ; le volume sur 30 jours est faible pour la vidéo.",
      pt: "O hype esfriou desde o lançamento; o volume de 30 dias é baixo para vídeo.",
    },
  },
  {
    tool: "GitHub Copilot",
    cat: "code",
    mentions: 13,
    capped: false,
    daily: 0.4,
    verdict: "watch",
    topPost: {
      title:
        "Job postings data: more hiring companies now name Claude Code than Cursor or Copilot",
      sub: "ClaudeAI",
      score: 2,
      url: "https://www.reddit.com/r/ClaudeAI/comments/1xpj4wz/job_postings_data_more_hiring_companies_now_name/",
    },
    note: {
      en: "Discussion has shifted to Claude Code and Cursor; mentions are mostly comparisons.",
      zh: "讨论度被 Claude Code / Cursor 抢走，提及多为对比。",
      es: "La discusión se ha desplazado a Claude Code y Cursor; las menciones son sobre todo comparativas.",
      fr: "Les discussions se sont déplacées vers Claude Code et Cursor ; les mentions sont surtout comparatives.",
      pt: "A discussão migrou para Claude Code e Cursor; as menções são majoritariamente comparativas.",
    },
  },
  {
    tool: "Windsurf",
    cat: "code",
    mentions: 6,
    capped: false,
    daily: 0.2,
    verdict: "watch",
    topPost: {
      title: "How do Windsurf or Cursor track the usage against the quota?",
      sub: "cursor",
      score: 6,
      url: "https://www.reddit.com/r/cursor/comments/1xicayx/how_do_windsurf_or_cursor_track_the_usage_against/",
    },
    note: {
      en: "Momentum has faded after the acquisition, with only scattered mentions.",
      zh: "收购后声量走低，近 30 天只有零星讨论。",
      es: "El impulso decayó tras la adquisición; solo hay menciones dispersas.",
      fr: "L'élan s'est essoufflé après l'acquisition ; les mentions sont éparses.",
      pt: "O impulso diminuiu após a aquisição; restam apenas menções dispersas.",
    },
  },
  {
    tool: "Gamma",
    cat: "productivity",
    mentions: 6,
    capped: false,
    daily: 0.2,
    verdict: "watch",
    topPost: null,
    note: {
      en: "A presentation niche that barely registers in general AI subs.",
      zh: "演示文稿垂类，在综合 AI 社区几乎不讨论。",
      es: "Un nicho de presentaciones que apenas aparece en subs generales de IA.",
      fr: "Une niche de présentations qui passe presque inaperçue dans les subs IA généralistes.",
      pt: "Um nicho de apresentações que quase não aparece em subs gerais de IA.",
    },
  },
  {
    tool: "NotebookLM",
    cat: "productivity",
    mentions: 5,
    capped: false,
    daily: 0.2,
    verdict: "steady",
    topPost: {
      title:
        "Same sources, same question, three LLMs: what Claude does differently from NotebookLM and ChatGPT",
      sub: "ClaudeAI",
      score: 2,
      url: "https://www.reddit.com/r/ClaudeAI/comments/1xa346y/same_sources_same_question_three_llms_what_claude/",
    },
    note: {
      en: "Low volume but concentrated in productivity threads, with positive sentiment.",
      zh: "提及少但集中在效率场景，口碑偏正面。",
      es: "Bajo volumen pero concentrado en productividad, con sentimiento positivo.",
      fr: "Faible volume mais concentré sur la productivité, avec un sentiment positif.",
      pt: "Baixo volume, mas concentrado em produtividade, com sentimento positivo.",
    },
  },
];
