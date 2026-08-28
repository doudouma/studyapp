/**
 * 恶意 HTML 检测 + 净化中间件
 * sanitize-html 净化 + 钓鱼关键词检测 + PhishDestroy 域名检查 + AI 辅助检测
 */
import sanitizeHtml from "sanitize-html";

const PHISH_DESTROY_API = "https://api.destroy.tools/v1/check";

// sanitize-html 配置：保留正常标签，剥离 iframe/object/embed/applet
const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat([
    "img", "video", "source", "svg", "path", "circle", "line", "polyline",
    "rect", "polygon", "defs", "use", "g", "clipPath", "mask",
    "details", "summary", "mark", "kbd", "sub", "sup", "small",
    "figure", "figcaption", "picture", "dialog", "template", "slot",
  ]),
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    "*": ["class", "id", "style", "role", "aria-*", "data-*", "tabindex"],
    "a": ["href", "target", "rel", "download"],
    "img": ["src", "alt", "width", "height", "loading", "fetchpriority"],
    "video": ["src", "controls", "autoplay", "muted", "loop", "poster"],
    "source": ["src", "type", "media"],
    "input": ["type", "name", "value", "placeholder", "checked", "disabled", "required"],
    "select": ["name", "value", "disabled"],
    "option": ["value", "selected", "disabled"],
    "textarea": ["name", "placeholder", "rows", "cols", "disabled"],
    "button": ["type", "disabled"],
    "form": ["action", "method", "enctype", "target"],
    "label": ["for"],
  },
  exclusiveFilter: (frame) => {
    return ["iframe", "object", "embed", "applet"].includes(frame.tag);
  },
};

// 明确禁止的标签（sanitize-html 会自动丢弃）
const BLOCKED_TAGS = ["iframe", "object", "embed", "applet"];

export interface ThreatInfo {
  label: string;
  count: number;
}

export interface HtmlGuardResult {
  safe: boolean;
  threats: ThreatInfo[];
  sanitizedHtml?: string;
  domainThreats?: { domain: string; severity: string; score: number; keywords: string[] }[];
}

/**
 * 检测并净化 HTML 内容
 * 1. sanitize-html 剥离 iframe/object/embed 等危险标签
 * 2. 钓鱼关键词检测（表单 + 多关键词 = 高风险）
 */
export function detectAndSanitizeHtml(html: string): HtmlGuardResult {
  const threats: ThreatInfo[] = [];

  // 检测被剥离的危险标签
  for (const tag of BLOCKED_TAGS) {
    const regex = new RegExp(`<${tag}[\\s>][\\s\\S]*?<\\/${tag}>|<${tag}[\\s/>]`, "gi");
    const matches = html.match(regex);
    if (matches) {
      threats.push({ label: tag, count: matches.length });
    }
  }

  // 净化 HTML：剥离危险标签，保留其余内容
  const sanitizedHtml = sanitizeHtml(html, {
    ...SANITIZE_OPTIONS,
    disallowedTagsMode: "discard",
  });

  return {
    safe: threats.length === 0,
    threats,
    sanitizedHtml,
  };
}

/**
 * 从 HTML 中提取所有外部域名（form action、a href、img src 等）
 */
export function extractDomains(html: string): string[] {
  const urlPattern = /(?:href|src|action)\s*=\s*["']?(https?:\/\/[^"'\s>]+)/gi;
  const domains = new Set<string>();
  let match: RegExpExecArray | null;
  while ((match = urlPattern.exec(html)) !== null) {
    try {
      const url = new URL(match[1]);
      // 排除 localhost 和内网地址
      if (!url.hostname.match(/^(localhost|127\.|192\.|10\.|172\.)/)) {
        domains.add(url.hostname);
      }
    } catch {}
  }
  return [...domains];
}

/**
 * PhishDestroy API 检查域名是否为钓鱼站点
 * 免费、无需 API key
 */
export async function checkDomainsWithPhishDestroy(
  domains: string[],
): Promise<{ safe: boolean; threats: { domain: string; severity: string; score: number; keywords: string[] }[] }> {
  const threats: { domain: string; severity: string; score: number; keywords: string[] }[] = [];

  // 并发检查所有域名，单个失败不阻塞
  const results = await Promise.allSettled(
    domains.map(async (domain) => {
      const res = await fetch(`${PHISH_DESTROY_API}?domain=${encodeURIComponent(domain)}`, {
        headers: { Accept: "application/json" },
      });
      if (!res.ok) return null;
      const data = await res.json() as any;
      if (data.threat && data.risk_score >= 40) {
        return {
          domain,
          severity: data.severity,
          score: data.risk_score,
          keywords: data.matched_keywords || [],
        };
      }
      return null;
    }),
  );

  for (const r of results) {
    if (r.status === "fulfilled" && r.value) {
      threats.push(r.value);
    }
  }

  return { safe: threats.length === 0, threats };
}

/**
 * AI 检测：调用 Cloudflare Workers AI (Llama Guard 3)
 * 截取前 2000 字符送检，避免超 token 限制
 */
export async function detectWithAi(
  ai: Ai,
  html: string,
): Promise<{ safe: boolean; verdict: string }> {
  try {
    const snippet = html.slice(0, 2000);
    const response = await ai.run("@cf/meta/llama-guard-3-8b", {
      messages: [
        {
          role: "user",
          content: `Analyze this HTML content for safety. Is it a phishing page, login credential theft, or malicious content? Reply with "safe" or "unsafe" followed by a brief reason.\n\n${snippet}`,
        },
      ],
    });

    const result = (response as any).response ?? JSON.stringify(response);
    const isUnsafe = result.toLowerCase().includes("unsafe");

    return {
      safe: !isUnsafe,
      verdict: result,
    };
  } catch {
    return { safe: true, verdict: "ai unavailable" };
  }
}
