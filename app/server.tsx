/// <reference types="@cloudflare/workers-types" />
import { createStartHandler, defaultStreamHandler } from "@tanstack/react-start/server";
import api, { cleanupAnonymousUploads } from "~/../server/api";
import { createAuth } from "~/../server/auth";
import { Hono } from "hono";
import { cors } from "hono/cors";
import i18n from "~/lib/i18n";
import { parseAcceptLanguage } from "~/lib/locale";

type Bindings = {
  BUCKET?: R2Bucket;
  D1?: D1Database;
  BETTER_AUTH_URL?: string;
  BETTER_AUTH_SECRET?: string;
  BETTER_AUTH_API_KEY?: string;
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
      c.env = { ...c.env, D1: proxy.env.D1, BUCKET: proxy.env.BUCKET } as any;
      (globalThis as any).__CF_ENV__ = { D1: proxy.env.D1, BUCKET: proxy.env.BUCKET };
    } catch (err) {
      console.warn("Local bindings not available:", (err as Error).message);
    }
  } else {
    (globalThis as any).__CF_ENV__ = { D1: c.env.D1, BUCKET: c.env.BUCKET };
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

// All other routes go to TanStack Start SSR
app.all("*", (c) => {
  i18n.changeLanguage(parseAcceptLanguage(c.req.header("Accept-Language")));
  return startHandler(c.req.raw);
});

// Cron trigger: cleanup expired anonymous uploads every hour
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
