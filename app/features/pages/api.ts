import { apiClient, rpcErrorMessage } from "~/features/api-client";
import type { PagesListResponse, PageContentResponse } from "@shared/types/pages";

/**
 * Pages 功能的类型化 API 客户端 (Hono RPC)
 * 页面/组件只依赖此模块，不直接 fetch
 */

/**
 * Hono RPC 客户端的 { form } 期望纯对象而非 FormData 实例：
 * 其内部用 Object.entries(args.form) 遍历，而 FormData 的字段并非自身可枚举属性，
 * Object.entries(formData) 会得到空数组，导致所有字段丢失、服务端收到空 body
 * （表现为「标题不能为空」/ 内容为空）。这里把 FormData 转为纯对象再传给 RPC 客户端。
 */
function formDataToObject(fd: FormData): Record<string, string | File | File[]> {
  const obj: Record<string, string | File | File[]> = {};
  fd.forEach((value, key) => {
    if (key in obj) {
      const existing = obj[key];
      if (Array.isArray(existing)) existing.push(value as File);
      else obj[key] = [existing as File, value as File];
    } else {
      obj[key] = value;
    }
  });
  return obj;
}

/** 获取当前用户信息与配额（未登录返回匿名态） */
export async function fetchMe() {
  const res = await apiClient().api.me.$get();
  return res.json();
}

/** 分页获取我的页面列表 */
export async function fetchMyPages(page = 1, pageSize = 10): Promise<PagesListResponse> {
  const res = await apiClient().api.pages.$get({
    query: { page: String(page), pageSize: String(pageSize) },
  });
  if (!res.ok) {
    throw new Error((await rpcErrorMessage(res)) || "加载失败");
  }
  return res.json();
}

/** 删除我的页面 */
export async function deleteMyPage(pageId: string): Promise<{ ok: boolean; error?: string }> {
  const res = await apiClient().api.pages[":id"].$delete({ param: { id: pageId } });
  if (!res.ok) return { ok: false, error: await rpcErrorMessage(res) };
  return { ok: true };
}

/** 读取我的页面 HTML 内容 */
export async function fetchPageContent(pageId: string): Promise<PageContentResponse> {
  const res = await apiClient().api.pages[":id"].content.$get({ param: { id: pageId } });
  if (!res.ok) throw new Error((await rpcErrorMessage(res)) || "加载失败");
  return res.json();
}

/** 更新页面元数据（可选带 HTML 内容），JSON 方式 */
export async function updatePageMeta(
  pageId: string,
  body: { title?: string; category?: string; tags?: string; content?: string }
): Promise<{ ok: boolean; error?: string }> {
  const client = apiClient().api.pages[":id"];
  // 先赋值再传参：PATCH 路由动态解析 body，RPC 输入类型未包含 json，
  // 变量传参绕开对象字面量的多余属性检查，响应类型仍保持端到端推导
  const arg = { param: { id: pageId }, json: body };
  const res = await client.$patch(arg);
  if (!res.ok) return { ok: false, error: await rpcErrorMessage(res) };
  return { ok: true };
}

/** 以文件替换页面内容（multipart：.html 或 .zip） */
export async function updatePageFile(pageId: string, formData: FormData): Promise<{ ok: boolean; error?: string }> {
  const client = apiClient().api.pages[":id"];
  const arg = { param: { id: pageId }, form: formDataToObject(formData) };
  const res = await client.$patch(arg);
  if (!res.ok) return { ok: false, error: await rpcErrorMessage(res) };
  return { ok: true };
}

/** 上传新页面（匿名 = 7 天临时；登录 = 永久）。调用方负责组装 FormData */
export async function uploadPage(formData: FormData) {
  const res = await apiClient().api.upload.$post({ form: formDataToObject(formData) });
  const json = await res.json();
  if (!res.ok) {
    return { ok: false as const, error: (json as { error?: string }).error };
  }
  return { ok: true as const, data: json };
}

/** 上传页面缩略图（SnapDOM WebP）。调用方负责组装 FormData */
export async function uploadPageThumbnail(formData: FormData): Promise<{ ok: boolean; error?: string }> {
  const res = await apiClient().api["upload-thumbnail"].$post({ form: formDataToObject(formData) });
  if (!res.ok) return { ok: false, error: await rpcErrorMessage(res) };
  return { ok: true };
}

// --- API Key management ---

export interface ApiKeyInfo {
  id: string;
  name: string;
  prefix: string;
  createdAt: string; // ISO from JSON
  lastUsedAt: string | null;
}

export interface CreatedApiKey extends ApiKeyInfo {
  key: string;
}

/** Create a new API key (raw key shown once). */
export async function createApiKey(name: string): Promise<{ ok: boolean; data?: CreatedApiKey; error?: string }> {
  const res = await apiClient().api.me["api-keys"].$post({ json: { name } });
  if (!res.ok) return { ok: false, error: await rpcErrorMessage(res) };
  return { ok: true, data: await res.json() };
}

/** List all active API keys for the current user. */
export async function listApiKeys(): Promise<{ ok: boolean; keys?: ApiKeyInfo[]; error?: string }> {
  const res = await apiClient().api.me["api-keys"].$get();
  if (!res.ok) return { ok: false, error: await rpcErrorMessage(res) };
  return { ok: true, ...(await res.json()) };
}

/** Revoke an API key. */
export async function revokeApiKey(keyId: string): Promise<{ ok: boolean; error?: string }> {
  const res = await apiClient().api.me["api-keys"][":id"].$delete({ param: { id: keyId } });
  if (!res.ok) return { ok: false, error: await rpcErrorMessage(res) };
  return { ok: true };
}
