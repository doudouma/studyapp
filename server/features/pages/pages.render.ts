import { getBcp47, isLang, DEFAULT_LANG, type Lang } from "../../../app/lib/lang";

/**
 * Pages 呈现层
 * 用户页面 HTML 的 SEO 注入与 404 页面渲染，不感知 HTTP 框架细节
 */

export function escapeHtml(str: string): string {
  return str.replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[c] || c));
}

export function injectBanner(
  html: string,
  meta?: { title?: string; description?: string; url?: string },
  baseHref?: string,
  noindex = false
): string {
  const baseTag = baseHref ? `<base href="${escapeHtml(baseHref)}">` : "";
  // Anonymous tmp uploads are ephemeral (auto-destroyed after 7 days) and are
  // never shared to the Square, so they are excluded from the sitemap. Keep them
  // out of the index too, otherwise a stream of thin, short-lived pages drags
  // down site-wide quality signals. Indexed pages are the curated, shared ones.
  const robotsTag = noindex
    ? `<meta name="robots" content="noindex, nofollow">`
    : "";
  const seoTags = meta ? `
    <meta property="og:type" content="website">
    <meta property="og:title" content="${escapeHtml(meta.title || "学习页面")} | 100mini">
    <meta property="og:description" content="${escapeHtml(meta.description || "来自 100mini 的学习页面")}">
    <meta property="og:url" content="${escapeHtml(meta.url || "")}">
    <meta name="twitter:card" content="summary">
    <meta name="twitter:title" content="${escapeHtml(meta.title || "学习页面")} | 100mini">
    <meta name="twitter:description" content="${escapeHtml(meta.description || "来自 100mini 的学习页面")}">
    <link rel="canonical" href="${escapeHtml(meta.url || "")}">
  ` : "";

  let result = html;
  if (baseTag) result = result.replace(/<head\b[^>]*>/i, (m) => `${m}${baseTag}`);
  const tailTags = robotsTag + seoTags;
  if (tailTags) result = result.replace(/<\/head\s*>/i, (m) => `${tailTags}${m}`);
  return result;
}

/**
 * Pick the best language from an Accept-Language header, falling back to the
 * default lang. /p/* pages are served at root (no URL prefix), so the header
 * is the only signal for localizing the 404 page.
 */
export function detectLangFromHeader(acceptLanguage: string | undefined): Lang {
  if (!acceptLanguage) return DEFAULT_LANG;
  const parts = acceptLanguage
    .split(",")
    .map((part) => {
      const [tag, qStr] = part.trim().split(";");
      const q = qStr ? parseFloat(qStr.replace(/^q=/, "")) : 1;
      return { base: tag.toLowerCase().split("-")[0], q: Number.isNaN(q) ? 0 : q };
    })
    .sort((a, b) => b.q - a.q);
  for (const { base } of parts) {
    if (isLang(base)) return base;
  }
  return DEFAULT_LANG;
}

export function notFoundHtml(lang: Lang = DEFAULT_LANG): string {
  const strings: Record<Lang, { title: string; desc: string; message: string; back: string }> = {
    en: {
      title: "404 - Page not found | 100mini",
      desc: "This page does not exist or has expired (auto-destroyed after 7 days). Return to the 100mini homepage to create a new share link.",
      message: "Page not found or expired (auto-destroyed after 7 days)",
      back: "Back to Home",
    },
    zh: {
      title: "404 - 页面不存在 | 100mini",
      desc: "该页面不存在或已过期（7天自动销毁）。返回100mini首页创建新的分享链接。",
      message: "页面不存在或已过期（7天自动销毁）",
      back: "返回首页",
    },
    es: {
      title: "404 - Página no encontrada | 100mini",
      desc: "Esta página no existe o ha caducado (se elimina automáticamente después de 7 días). Vuelve a la página de inicio de 100mini para crear un nuevo enlace para compartir.",
      message: "Página no encontrada o caducada (se elimina automáticamente después de 7 días)",
      back: "Volver al inicio",
    },
    pt: {
      title: "404 - Página não encontrada | 100mini",
      desc: "Esta página não existe ou expirou (destruída automaticamente após 7 dias). Volte à página inicial da 100mini para criar um novo link de compartilhamento.",
      message: "Página não encontrada ou expirada (destruída automaticamente após 7 dias)",
      back: "Voltar ao Início",
    },
    fr: {
      title: "404 - Page introuvable | 100mini",
      desc: "Cette page n'existe pas ou a expiré (supprimée automatiquement après 7 jours). Revenez à l'accueil de 100mini pour créer un nouveau lien de partage.",
      message: "Page introuvable ou expirée (supprimée automatiquement après 7 jours)",
      back: "Retour à l'accueil",
    },
  };
  const s = strings[lang] ?? strings[DEFAULT_LANG];
  return `<!DOCTYPE html>
<html lang="${getBcp47(lang)}">
<head><meta charset="utf-8"><meta name="robots" content="noindex"><title>${s.title}</title>
<meta name="description" content="${s.desc}">
<style>body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;font-family:system-ui,sans-serif;background:#f5f5f5}</style>
</head>
<body>
<div style="text-align:center">
<h1 style="font-size:2rem;margin-bottom:0.5rem">404</h1>
<p style="color:#666">${s.message}</p>
<a href="/" style="display:inline-block;margin-top:1rem;padding:0.5rem 1.5rem;background:#667eea;color:#fff;text-decoration:none;border-radius:8px">${s.back}</a>
</div>
</body></html>`;
}

/**
 * 到期/限次/一次性链接焚毁后访问 /p/{id} 的「化为数字灰烬」趣味页（非 404）。
 * reason: views=看完了次数，expired=到期，manual=手动焚毁。
 */
export function burnedHtml(lang: Lang = DEFAULT_LANG, reason?: string): string {
  const strings: Record<Lang, { title: string; desc: string; headline: string; byViews: string; byExpired: string; generic: string; sub: string; back: string }> = {
    en: {
      title: "Gone to digital ashes | 100mini",
      desc: "This link has burned to digital ashes.",
      headline: "This page has turned to digital ashes",
      byViews: "A burn-after-reading link — it has been viewed up.",
      byExpired: "The link expired and drifted away.",
      generic: "The link has been burned.",
      sub: "Want to keep something? Head home and make a new link.",
      back: "Back to Home",
    },
    zh: {
      title: "已化为数字灰烬 | 100mini",
      desc: "该链接已化为数字灰烬。",
      headline: "这一页，已化为数字灰烬",
      byViews: "一次性链接，已经被看完了。",
      byExpired: "链接已到期，随风而散。",
      generic: "链接已被焚毁。",
      sub: "想留下点什么？回首页再造一个链接。",
      back: "返回首页",
    },
    es: {
      title: "Reducido a cenizas digitales | 100mini",
      desc: "Este enlace se ha reducido a cenizas digitales.",
      headline: "Esta página se ha convertido en cenizas digitales",
      byViews: "Enlace de un solo uso: ya se ha visto por completo.",
      byExpired: "El enlace caducó y se desvaneció.",
      generic: "El enlace ha sido quemado.",
      sub: "¿Quieres conservar algo? Vuelve al inicio y crea un nuevo enlace.",
      back: "Volver al inicio",
    },
    pt: {
      title: "Reduzido a cinzas digitais | 100mini",
      desc: "Este link foi reduzido a cinzas digitais.",
      headline: "Esta página virou cinzas digitais",
      byViews: "Link de uso único: já foi totalmente visualizado.",
      byExpired: "O link expirou e se dissipou.",
      generic: "O link foi queimado.",
      sub: "Quer guardar algo? Volte ao início e crie um novo link.",
      back: "Voltar ao Início",
    },
    fr: {
      title: "Réduit en cendres numériques | 100mini",
      desc: "Ce lien a été réduit en cendres numériques.",
      headline: "Cette page s'est réduite en cendres numériques",
      byViews: "Lien à usage unique : il a été entièrement consulté.",
      byExpired: "Le lien a expiré et s'est envolé.",
      generic: "Le lien a été brûlé.",
      sub: "Envie de garder quelque chose ? Retournez à l'accueil créer un nouveau lien.",
      back: "Retour à l'accueil",
    },
  };
  const s = strings[lang] ?? strings[DEFAULT_LANG];
  const message = reason === "views" ? s.byViews : reason === "expired" ? s.byExpired : s.generic;

  return `<!DOCTYPE html>
<html lang="${getBcp47(lang)}">
<head><meta charset="utf-8"><meta name="robots" content="noindex"><title>${s.title}</title>
<meta name="description" content="${s.desc}">
<style>
:root{color-scheme:dark}
*{box-sizing:border-box}
body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;font-family:system-ui,-apple-system,sans-serif;background:radial-gradient(120% 120% at 50% 0%,#2a1a12 0%,#120c0a 55%,#0b0706 100%);color:#f4ece4;overflow:hidden}
.ash{position:fixed;inset:0;pointer-events:none;overflow:hidden}
.ash i{position:absolute;bottom:-10vh;width:6px;height:6px;border-radius:50%;background:radial-gradient(circle,#ffb347,#ff6a00 60%,transparent 70%);opacity:.55;animation:rise linear infinite}
@keyframes rise{0%{transform:translateY(0) scale(1);opacity:0}10%{opacity:.6}100%{transform:translateY(-115vh) scale(.3);opacity:0}}
.card{position:relative;text-align:center;max-width:34rem;padding:0 1.5rem;z-index:1}
.flame{font-size:3rem;line-height:1;margin-bottom:.75rem;filter:drop-shadow(0 0 18px rgba(255,120,0,.6))}
h1{font-size:1.6rem;margin:0 0 .75rem;letter-spacing:.02em}
p{color:#c9b7a8;margin:.35rem 0}
.sub{margin-top:1.25rem;font-size:.95rem;color:#9c8b7d}
a{display:inline-block;margin-top:1.5rem;padding:.6rem 1.6rem;background:linear-gradient(135deg,#ff8a00,#ff5100);color:#1a0d05;font-weight:700;text-decoration:none;border-radius:999px}
@media (prefers-reduced-motion:reduce){.ash i{animation:none;opacity:.2}}
</style>
</head>
<body>
<div class="ash" aria-hidden="true">${Array.from({ length: 12 }, (_, i) => `<i style="left:${(i * 8.3 + 4).toFixed(1)}%;animation-duration:${(6 + (i % 5)).toFixed(1)}s;animation-delay:${(i * 0.7).toFixed(1)}s"></i>`).join("")}</div>
<div class="card">
<div class="flame" aria-hidden="true">🔥</div>
<h1>${s.headline}</h1>
<p>${message}</p>
<p class="sub">${s.sub}</p>
<a href="/">${s.back}</a>
</div>
</body></html>`;
}

/** 常见爬虫/预览/命令行 UA 特征；命中则不计入访问次数（避免一次性链接被误焚） */
const CRAWLER_UA_RE =
  /bot|crawler|spider|crawl|slurp|facebookexternalhit|twitterbot|slackbot|telegrambot|whatsapp|discordbot|linkedinbot|pinterest|embedly|outbrain|googlebot|bingbot|yandex|baiduspider|duckduckbot|applebot|petalbot|bytespider|semrush|ahrefs|mj12bot|dotbot|python-requests|python-urllib|curl\/|wget|headlesschrome|phantomjs|lighthouse|pingdom|uptimerobot|google-inspectiontool|chrome-lighthouse/i;

/**
 * 是否为「不应计入访问次数」的请求：预取/预览请求，或缺失 UA / 命中爬虫特征的 UA。
 * 浏览器导航始终携带 UA，缺失 UA 视为非真人访问更安全。
 */
export function isLikelyCrawler(userAgent: string | undefined, isPrefetch?: boolean): boolean {
  if (isPrefetch) return true;
  if (!userAgent) return true;
  return CRAWLER_UA_RE.test(userAgent);
}

/**
 * 页面因违反内容规范被下架后访问 /p/{id} 的提示页。
 * detail.reason: regex=含被禁代码 / phishing=钓鱼内容 / ai=AI 审核未通过；
 * labels 仅 regex 类别提供（命中的被禁标签名）。
 */
export function blockedHtml(
  lang: Lang = DEFAULT_LANG,
  detail?: { reason: string; labels: string[] }
): string {
  const strings: Record<Lang, { title: string; desc: string; headline: string; badge: string; back: string }> = {
    en: {
      title: "410 - Page removed | 100mini",
      desc: "This page has been taken down for violating our content policy.",
      headline: "This page has been taken down for violating our content policy.",
      badge: "Removed",
      back: "Back to Home",
    },
    zh: {
      title: "410 - 页面已下架 | 100mini",
      desc: "该页面因违反内容规范已被下架。",
      headline: "该页面因违反内容规范已被下架",
      badge: "已下架",
      back: "返回首页",
    },
    es: {
      title: "410 - Página retirada | 100mini",
      desc: "Esta página ha sido retirada por violar nuestra política de contenido.",
      headline: "Esta página ha sido retirada por violar nuestra política de contenido",
      badge: "Retirada",
      back: "Volver al inicio",
    },
    pt: {
      title: "410 - Página removida | 100mini",
      desc: "Esta página foi removida por violar nossa política de conteúdo.",
      headline: "Esta página foi removida por violar nossa política de conteúdo",
      badge: "Removida",
      back: "Voltar ao Início",
    },
    fr: {
      title: "410 - Page retirée | 100mini",
      desc: "Cette page a été retirée pour violation de notre politique de contenu.",
      headline: "Cette page a été retirée pour violation de notre politique de contenu",
      badge: "Retirée",
      back: "Retour à l'accueil",
    },
  };
  const s = strings[lang] ?? strings[DEFAULT_LANG];

  const reasonStrings: Record<Lang, { regex: string; regexList: string; phishing: string; ai: string }> = {
    en: {
      regex: "Prohibited code elements were detected",
      regexList: "Detected prohibited code:",
      phishing: "The page contained suspected phishing or fraudulent content",
      ai: "The page content did not pass AI safety review",
    },
    zh: {
      regex: "检测到被禁止的代码",
      regexList: "检测到被禁止的代码：",
      phishing: "页面包含疑似钓鱼/欺诈内容",
      ai: "页面内容未通过 AI 安全审核",
    },
    es: {
      regex: "Se detectaron elementos de código prohibidos",
      regexList: "Código prohibido detectado:",
      phishing: "La página contenía contenido sospechoso de phishing o fraude",
      ai: "El contenido de la página no pasó la revisión de seguridad por IA",
    },
    pt: {
      regex: "Elementos de código proibidos foram detectados",
      regexList: "Código proibido detectado:",
      phishing: "A página continha conteúdo suspeito de phishing ou fraude",
      ai: "O conteúdo da página não passou na revisão de segurança por IA",
    },
    fr: {
      regex: "Des éléments de code interdits ont été détectés",
      regexList: "Code interdit détecté :",
      phishing: "La page contenait un contenu suspecté de phishing ou de fraude",
      ai: "Le contenu de la page n'a pas passé la revue de sécurité par IA",
    },
  };
  const r = reasonStrings[lang] ?? reasonStrings[DEFAULT_LANG];

  let reasonText = "";
  if (detail) {
    if (detail.reason === "regex") {
      reasonText = detail.labels.length > 0
        ? `${escapeHtml(r.regexList)} ${escapeHtml(detail.labels.map(escapeHtml).join(", "))}`
        : escapeHtml(r.regex);
    } else if (detail.reason === "phishing") {
      reasonText = escapeHtml(r.phishing);
    } else if (detail.reason === "ai") {
      reasonText = escapeHtml(r.ai);
    }
  }

  return `<!DOCTYPE html>
<html lang="${getBcp47(lang)}">
<head><meta charset="utf-8"><meta name="robots" content="noindex"><title>${s.title}</title>
<meta name="description" content="${s.desc}">
<style>body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;font-family:system-ui,sans-serif;background:#f5f5f5}</style>
</head>
<body>
<div style="text-align:center;max-width:32rem;padding:0 1.5rem">
<span style="display:inline-block;padding:0.25rem 0.75rem;border-radius:9999px;background:#fee2e2;color:#b91c1c;font-size:0.875rem;font-weight:600">${s.badge}</span>
<h1 style="font-size:1.5rem;margin:1rem 0 0.5rem">410</h1>
<p style="color:#374151;margin:0">${s.headline}</p>
${reasonText ? `<p style="color:#b91c1c;font-size:0.9rem;margin:0.75rem 0 0">${reasonText}</p>` : ""}
<a href="/" style="display:inline-block;margin-top:1.5rem;padding:0.5rem 1.5rem;background:#667eea;color:#fff;text-decoration:none;border-radius:8px">${s.back}</a>
</div>
</body></html>`;
}
