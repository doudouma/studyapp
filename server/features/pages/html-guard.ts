/**
 * 恶意 HTML 检测 + 净化中间件
 * 正则净化 + PhishDestroy 域名检查 + AI 辅助检测
 */

const PHISH_DESTROY_API = "https://api.destroy.tools/v1/check";

// 需要剥离的危险标签
const BLOCKED_TAGS = ["iframe", "object", "embed", "applet"];

// 正则：匹配开标签、闭标签、自闭合标签
function buildTagRegex(tag: string): RegExp {
  return new RegExp(`<${tag}[\\s>][\\s\\S]*?<\\/${tag}>|<${tag}[\\s/>]`, "gi");
}

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
 * 正则剥离 iframe/object/embed/applet 标签
 */
export function detectAndSanitizeHtml(html: string): HtmlGuardResult {
  const threats: ThreatInfo[] = [];
  let sanitizedHtml = html;

  // 检测并剥离危险标签
  for (const tag of BLOCKED_TAGS) {
    const regex = buildTagRegex(tag);
    const matches = sanitizedHtml.match(regex);
    if (matches) {
      threats.push({ label: tag, count: matches.length });
      sanitizedHtml = sanitizedHtml.replace(regex, "");
    }
  }

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

  const results = await Promise.allSettled(
    domains.map(async (domain) => {
      // 加超时：外部服务慢/不可达时不能阻塞整个上传请求（超时按“安全”处理）
      const res = await fetch(`${PHISH_DESTROY_API}?domain=${encodeURIComponent(domain)}`, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(5000),
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
    // 超时保护：AI 推理慢时不阻塞整个上传（超时按“安全”处理）
    const response = await Promise.race([
      ai.run("@cf/meta/llama-guard-3-8b", {
        messages: [
          {
            role: "user",
            content: `Analyze this HTML content for safety. Is it a phishing page, login credential theft, or malicious content? Reply with "safe" or "unsafe" followed by a brief reason.\n\n${snippet}`,
          },
        ],
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("ai timeout")), 8000)
      ),
    ]);

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
