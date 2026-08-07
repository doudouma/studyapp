import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createDb } from "./db";
import * as schema from "./db/schema";

export function createAuth(env: {
  D1?: D1Database;
  BETTER_AUTH_URL?: string;
  BETTER_AUTH_SECRET?: string;
  BETTER_AUTH_API_KEY?: string;
}, requestURL?: string) {
  if (!env.D1) {
    return null;
  }

  const db = createDb(env.D1);

  // Use request origin in dev, env var in production
  const baseURL = requestURL
    ? new URL(requestURL).origin
    : env.BETTER_AUTH_URL || "http://localhost:5174";

  return betterAuth({
    database: drizzleAdapter(db, {
      provider: "sqlite",
      schema,
    }),
    baseURL,
    secret: env.BETTER_AUTH_SECRET || "dev-secret",
    basePath: "/api/auth",
    appName: "100mini",
    socialProviders: {},
    emailAndPassword: {
      enabled: true,
      autoSignIn: true,
    },
    user: {
      additionalFields: {
        role: {
          type: "string",
          required: false,
          defaultValue: "user",
          input: false,
        },
      },
    },
  });
}