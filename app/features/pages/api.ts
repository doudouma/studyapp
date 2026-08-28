import { apiClient, rpcErrorMessage } from "~/features/api-client";
import type { PagesListResponse, PageContentResponse } from "@shared/types/pages";

/**
 * Pages 功能的类型化 API 客户端 (Hono RPC)
 * 页面/组件只依赖此模块，不直接 fetch
 */

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
  const arg = { param: { id: pageId }, form: formData };
  const res = await client.$patch(arg);
  if (!res.ok) return { ok: false, error: await rpcErrorMessage(res) };
  return { ok: true };
}

/** 上传新页面（匿名 = 7 天临时；登录 = 永久）。调用方负责组装 FormData */
export async function uploadPage(formData: FormData) {
  const res = await apiClient().api.upload.$post({ form: formData });
  const json = await res.json();
  if (!res.ok) {
    return { ok: false as const, error: (json as { error?: string }).error };
  }
  return { ok: true as const, data: json };
}

/** 上传页面缩略图（SnapDOM WebP）。调用方负责组装 FormData */
export async function uploadPageThumbnail(formData: FormData): Promise<{ ok: boolean; error?: string }> {
  const res = await apiClient().api["upload-thumbnail"].$post({ form: formData });
  if (!res.ok) return { ok: false, error: await rpcErrorMessage(res) };
  return { ok: true };
}
