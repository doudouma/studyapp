/// <reference types="@cloudflare/workers-types" />
import { createStartHandler, defaultStreamHandler } from "@tanstack/react-start/server";
import api from "~/../server/api";
import { cleanupAnonymousUploads } from "~/../server/features/pages/pages.storage";
import { createAuth } from "~/../server/auth";
import { Hono } from "hono";
import { cors } from "hono/cors";
import i18n from "~/lib/i18n";
import {
  parseLangFromPath,
  stripLangPrefix,
  DEFAULT_LANG,
  type Lang,
} from "~/lib/seo";

type Bindings = {
  BUCKET?: R2Bucket;
  D1?: D1Database;
  AI?: Ai;
  BETTER_AUTH_URL?: string;
  BETTER_AUTH_SECRET?: string;
  BETTER_AUTH_API_KEY?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
};

// In Vite dev mode, c.env is undefined — use getPlatformProxy for local D1/R2
// Note: `wrangler` is NOT available in production Workers, so this must
// use a dynamic import with a variable to prevent esbuild from bundling it
let devProxy: any = null;
const WRANGLER_MODULE = "wrangler";
async function getDevBindings() {
  if (!devProxy) {
    const mod = await import(WRANGLER_MODULE);
    devProxy = await mod.getPlatformProxy();
  }
  return devProxy;
}

const startHandler = createStartHandler(defaultStreamHandler);

const app = new Hono<{ Bindings: Bindings; Variables: { user: any; session: any } }>();

// Inject local Cloudflare bindings in dev mode
app.use("*", async (c, next) => {
  if (!c.env?.D1) {
    try {
      const proxy = await getDevBindings();
      c.env = { ...c.env, D1: proxy.env.D1, BUCKET: proxy.env.BUCKET, AI: proxy.env.AI } as any;
      (globalThis as any).__CF_ENV__ = { D1: proxy.env.D1, BUCKET: proxy.env.BUCKET, AI: proxy.env.AI };
    } catch (err) {
      console.warn("Local bindings not available:", (err as Error).message);
    }
  } else {
    (globalThis as any).__CF_ENV__ = { D1: c.env.D1, BUCKET: c.env.BUCKET, AI: c.env.AI };
  }
  return next();
});

// CORS for auth endpoints
app.use("/api/auth/*", cors({
  origin: ["https://www.100mini.com", "http://localhost:3000", "http://localhost:5173", "http://localhost:5174"],
  credentials: true,
}));

// Cache auth instances by baseURL
const authCache = new Map<string, ReturnType<typeof createAuth>>();
function getAuth(env: any, requestURL?: string) {
  const baseURL = requestURL ? new URL(requestURL).origin : (env?.BETTER_AUTH_URL || "");
  if (!authCache.has(baseURL)) {
    authCache.set(baseURL, createAuth(env, requestURL));
  }
  return authCache.get(baseURL)!;
}

// Better Auth handler (only if D1 is available)
app.all("/api/auth/*", async (c) => {
  const auth = getAuth(c.env ?? {}, c.req.url);
  if (!auth) {
    return c.json({ error: "auth not available" }, 503);
  }
  return auth.handler(c.req.raw);
});

// Auth session middleware for all /api/* routes
app.use("/api/*", async (c, next) => {
  // Skip auth routes (already handled above)
  if (c.req.path.startsWith("/api/auth")) return next();

  const auth = getAuth(c.env ?? {}, c.req.url);
  if (!auth) {
    c.set("user", null);
    c.set("session", null);
    return next();
  }
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  c.set("user", session?.user ?? null);
  c.set("session", session?.session ?? null);
  return next();
});

// Mount all existing API routes (they define their own /api/*, /p/*, /robots.txt paths)
app.route("/", api);

// All other routes go to TanStack Start SSR.
//
// URL-based i18n: the language is encoded in the path prefix (/zh/..., /es/...,
// etc.). en (default) has no prefix and lives at root. Here we:
//   1. Detect the language from the URL.
//   2. Switch the i18n instance so SSR renders the right language.
//   3. Strip the prefix and forward the stripped path to the SSR handler, so the
//      flat TanStack route tree (/ , /square, ...) matches regardless of lang.
//
// Non-app routes (user pages /p/*, API /api/*, robots, sitemaps, thumbnails)
// are registered above via `app.route("/", api)` at root only. Any language-
// prefixed request for them is 301-redirected to the canonical root URL so they
// aren't duplicated across language prefixes.
app.all("*", async (c) => {
  const url = new URL(c.req.url);

  // SSR 期间 route loader 通过 Hono RPC 客户端自取 /api/*（fetch 需要绝对 URL）。
  // 注：同 isolate 并发请求会互相覆盖，对公开只读接口无影响；
  // 迁移需要鉴权的 SSR 接口时须改为按请求透传 cookie。
  (globalThis as any).__SSR_ORIGIN__ = url.origin;

  // Migration: English was previously the prefixed language (/en/...). It is
  // now the default served at root with no prefix. 301-redirect legacy /en URLs
  // so old bookmarks/links and any previously-indexed pages resolve to the
  // canonical root URL.
  if (url.pathname === "/en" || url.pathname.startsWith("/en/")) {
    const rest = url.pathname.slice("/en".length) || "/";
    return c.redirect(rest + url.search, 301);
  }

  const lang = parseLangFromPath(url.pathname) as Lang;
  i18n.changeLanguage(lang);

  if (lang === DEFAULT_LANG) {
    return startHandler(c.req.raw);
  }

  const basePath = stripLangPrefix(url.pathname);
  const rootOnly =
    basePath.startsWith("/p/") ||
    basePath.startsWith("/api/") ||
    basePath.startsWith("/thumbnails/") ||
    basePath === "/robots.txt" ||
    basePath.startsWith("/sitemap");
  if (rootOnly) {
    return c.redirect(basePath + url.search, 301);
  }

  const rewritten = new URL(basePath + url.search + url.hash, url.origin);
  const res = await startHandler(new Request(rewritten, c.req.raw));

  // The SSR router uses basepath "/" (we stripped the prefix above), so any
  // redirect it emits (e.g. search-param normalization like /square → /square?q=)
  // lacks the language prefix and would drop the user back to the default
  // language. Re-add the prefix to internal redirect Location headers so
  // language is preserved across server-side redirects.
  if (
    lang !== DEFAULT_LANG &&
    res.status >= 300 &&
    res.status < 400
  ) {
    const loc = res.headers.get("location");
    if (loc && loc.startsWith("/") && loc !== `/${lang}` && !loc.startsWith(`/${lang}/`)) {
      const newRes = new Response(res.body, res);
      newRes.headers.set("location", `/${lang}${loc}`);
      return newRes;
    }
  }
  return res;
});

// Cron trigger: cleanup expired anonymous uploads daily (3 AM UTC)
export async function scheduled(_event: ScheduledEvent, env: Bindings, _ctx: ExecutionContext) {
  if (!env.BUCKET) return;
  try {
    const count = await cleanupAnonymousUploads(env.BUCKET);
    console.log(`[cron] cleaned up ${count} expired anonymous upload(s)`);
  } catch (err) {
    console.error("[cron] cleanup failed:", err);
  }
}

export default app;
