import { createStartHandler, defaultStreamHandler } from "@tanstack/react-start/server";
import api from "~/../server/api";
import { createAuth } from "~/../server/auth";
import { Hono } from "hono";
import { cors } from "hono/cors";

type Bindings = {
  BUCKET: R2Bucket;
  D1: D1Database;
  BETTER_AUTH_URL: string;
  BETTER_AUTH_SECRET: string;
};

const startHandler = createStartHandler(defaultStreamHandler);

const app = new Hono<{ Bindings: Bindings; Variables: { user: any; session: any } }>();

// CORS for auth endpoints
app.use("/api/auth/*", cors({
  origin: ["https://www.100mini.com", "http://localhost:3000", "http://localhost:5173"],
  credentials: true,
}));

// Better Auth handler
app.all("/api/auth/*", async (c) => {
  const auth = createAuth(c.env as any);
  return auth.handler(c.req.raw);
});

// Auth session middleware for all /api/* routes
app.use("/api/*", async (c, next) => {
  // Skip auth routes (already handled above)
  if (c.req.path.startsWith("/api/auth")) return next();

  const auth = createAuth(c.env as any);
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  c.set("user", session?.user ?? null);
  c.set("session", session?.session ?? null);
  return next();
});

// Mount all existing API routes (they define their own /api/*, /p/*, /robots.txt paths)
app.route("/", api);

// All other routes go to TanStack Start SSR
app.all("*", (c) => startHandler(c.req.raw));

export default app;
