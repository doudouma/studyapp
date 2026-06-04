import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createDb } from "./db";
import * as schema from "./db/schema";

export function createAuth(env: {
  D1: D1Database;
  BETTER_AUTH_URL: string;
  BETTER_AUTH_SECRET: string;
}) {
  const db = createDb(env.D1);

  return betterAuth({
    database: drizzleAdapter(db, {
      provider: "sqlite",
      schema,
    }),
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    basePath: "/api/auth",
    appName: "100mini",
    socialProviders: {},
    // Email & password auth for Phase 2 (simpler than WeChat)
    emailAndPassword: {
      enabled: true,
      autoSignIn: true,
    },
  });
}
