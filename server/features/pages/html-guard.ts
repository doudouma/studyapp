/**
 * 恶意 HTML 检测中间件
 * 规则检测 + AI 辅助检测（Cloudflare Workers AI）
 */

const MALICIOUS_PATTERNS: { pattern: RegExp; label: string }[] = [
  { pattern: /<iframe[\s\S]*?<\/iframe>/gi, label: "iframe嵌套" },
];

// 钓鱼关键词（出现在表单相关上下文中）
const PHISHING_KEYWORDS = [
  /password/i,
  /登录.*验证/i,
  /verify.*account/i,
  /confirm.*identity/i,
  /bank.*login/i,
  /paypal.*secure/i,
  /apple.*id.*verify/i,
];

export interface ThreatInfo {
  pattern: string;
  label: string;
  count: number;
}

export interface HtmlGuardResult {
  safe: boolean;
  threats: ThreatInfo[];
  phishingScore: number;
  aiVerdict?: string;
}

/**
 * 规则检测：iframe + 钓鱼表单关键词
 */
export function detectMaliciousHtml(html: string): HtmlGuardResult {
  const threats: ThreatInfo[] = [];

  for (const { pattern, label } of MALICIOUS_PATTERNS) {
    const matches = html.match(pattern);
    if (matches) {
      threats.push({ pattern: pattern.source, label, count: matches.length });
    }
  }

  // 钓鱼关键词检测（仅在包含表单时加分）
  let phishingScore = 0;
  const hasForm = /<form[\s>]/i.test(html);
  if (hasForm) {
    for (const kw of PHISHING_KEYWORDS) {
      if (kw.test(html)) phishingScore++;
    }
  }

  const isPhishing = hasForm && phishingScore >= 2;

  return {
    safe: threats.length === 0 && !isPhishing,
    threats,
    phishingScore,
  };
}

/**
 * AI 检测：调用 Cloudflare Workers AI (Llama Guard 3)
 * 截取前 4000 字符送检，避免超 token 限制
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
    // AI 服务不可用时放行，不阻塞正常上传
    return { safe: true, verdict: "ai unavailable" };
  }
}
