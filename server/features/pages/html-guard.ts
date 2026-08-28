/**
 * 恶意 HTML 检测中间件
 * 拦截钓鱼网站、XSS 攻击等恶意内容
 */

const MALICIOUS_PATTERNS: { pattern: RegExp; label: string }[] = [
  { pattern: /<script[\s\S]*?<\/script>/gi, label: "script标签" },
  { pattern: /\son\w+\s*=\s*["']?[^"'>]+/gi, label: "事件处理器" },
  { pattern: /javascript:\s*[^\s"'>]+/gi, label: "javascript协议" },
  { pattern: /<iframe[\s\S]*?<\/iframe>/gi, label: "iframe嵌套" },
  { pattern: /<object[\s\S]*?<\/object>/gi, label: "object标签" },
  { pattern: /<embed[\s\S]*?>/gi, label: "embed标签" },
  { pattern: /eval\s*\(/gi, label: "eval调用" },
  { pattern: /document\.(cookie|write|location)/gi, label: "危险DOM操作" },
  { pattern: /expression\s*\(/gi, label: "CSS expression" },
  { pattern: /<meta[^>]+http-equiv[^>]+refresh/gi, label: "meta刷新重定向" },
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
}

/**
 * 检测 HTML 内容是否包含恶意代码
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

  // 有表单 + 多个钓鱼关键词 = 高风险
  const isPhishing = hasForm && phishingScore >= 2;

  return {
    safe: threats.length === 0 && !isPhishing,
    threats,
    phishingScore,
  };
}
