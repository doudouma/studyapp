/// <reference types="@cloudflare/workers-types" />

/**
 * 服务端共享的 Hono Env 类型
 * 所有 feature 路由 (server/features/*) 与主 api.ts 统一使用
 */

export type AppBindings = {
  BUCKET?: R2Bucket;
  D1?: D1Database;
  AI?: Ai;
  /** 匿名 tmp 上传过期毫秒数，默认 7 天（7 * 24 * 60 * 60 * 1000） */
  TMP_EXPIRY_MS?: string;
};

export type AppVariables = {
  user: { id: string; name: string; email: string; image?: string; role?: string } | null;
  session: any;
};

export type AppEnv = {
  Bindings: AppBindings;
  Variables: AppVariables;
};
