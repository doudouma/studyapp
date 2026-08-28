import { hc } from "hono/client";
import type { AppType } from "@server/api";

/**
 * 全局 Hono RPC 客户端工厂（端到端类型来自 server/api.ts 的 AppType）
 *
 * - 浏览器端：以 window.location.origin 为基址
 * - SSR (route loader)：fetch 需要绝对 URL，server.tsx 已在 startHandler 前
 *   将当前请求 origin 写入 globalThis.__SSR_ORIGIN__
 *   （注意：并发请求可能互相覆盖 origin，对公开只读接口无影响；
 *   未来迁移需要鉴权的 SSR 接口时，需改为按请求透传 cookie）
 */
function resolveBaseUrl(): string {
  if (typeof window !== "undefined") return window.location.origin;
  const ssrOrigin = (globalThis as any).__SSR_ORIGIN__;
  return typeof ssrOrigin === "string" && ssrOrigin ? ssrOrigin : "http://localhost:5173";
}

export function apiClient() {
  return hc<AppType>(resolveBaseUrl());
}

/** 从 RPC 错误响应中提取 { error } 消息（结构化类型，兼容原生 Response 与 Hono ClientResponse） */
export async function rpcErrorMessage(
  res: { ok: boolean; json(): Promise<unknown> }
): Promise<string | undefined> {
  try {
    const body = (await res.json()) as { error?: string };
    return body.error;
  } catch {
    return undefined;
  }
}
