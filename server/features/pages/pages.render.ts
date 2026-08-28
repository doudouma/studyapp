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
  baseHref?: string
): string {
  const baseTag = baseHref ? `<base href="${escapeHtml(baseHref)}">` : "";
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
  if (seoTags) result = result.replace(/<\/head\s*>/i, (m) => `${seoTags}${m}`);
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
