import { apiClient, rpcErrorMessage } from "~/features/api-client";
import type {
  AdminUsersResponse,
  AdminPagesResponse,
  MembershipDuration,
} from "@shared/types/admin";

/**
 * Admin 功能的类型化 API 客户端 (Hono RPC)
 * 页面/组件只依赖此模块，不直接 fetch
 */

/** 分页获取用户列表（含会员状态） */
export async function fetchAdminUsers(page = 1, pageSize = 10): Promise<AdminUsersResponse> {
  const res = await apiClient().api.admin.users.$get({
    query: { page: String(page), pageSize: String(pageSize) },
  });
  if (!res.ok) {
    throw new Error((await rpcErrorMessage(res)) || "加载失败");
  }
  return res.json();
}

/** 分页获取页面列表（含作者信息，可选 scope=square） */
export async function fetchAdminPages(
  page = 1,
  pageSize = 10,
  scope: "all" | "square" = "all"
): Promise<AdminPagesResponse> {
  const res = await apiClient().api.admin.pages.$get({
    query: { page: String(page), pageSize: String(pageSize), scope },
  });
  if (!res.ok) {
    throw new Error((await rpcErrorMessage(res)) || "加载失败");
  }
  return res.json();
}

/** 设置用户会员时长 */
export async function setMembership(
  userId: string,
  durationMonths: MembershipDuration
): Promise<{ ok: boolean; error?: string }> {
  const client = apiClient().api.admin.users[":id"].membership;
  const arg = { param: { id: userId }, json: { durationMonths } };
  const res = await client.$post(arg);
  if (!res.ok) return { ok: false, error: await rpcErrorMessage(res) };
  return { ok: true };
}

/** 取消用户会员 */
export async function cancelMembership(
  userId: string
): Promise<{ ok: boolean; error?: string }> {
  const res = await apiClient().api.admin.users[":id"].membership.$delete({
    param: { id: userId },
  });
  if (!res.ok) return { ok: false, error: await rpcErrorMessage(res) };
  return { ok: true };
}

/** 删除任意页面（管理员权限） */
export async function deleteAdminPage(
  pageId: string
): Promise<{ ok: boolean; error?: string }> {
  const res = await apiClient().api.admin.pages[":id"].$delete({
    param: { id: pageId },
  });
  if (!res.ok) return { ok: false, error: await rpcErrorMessage(res) };
  return { ok: true };
}

/** 手动触发匿名 tmp 文件清理 */
export async function cleanupTmp(): Promise<{ ok: boolean; error?: string; deleted?: number }> {
  const res = await apiClient().api.admin["cleanup-tmp"].$post({});
  const json = await res.json();
  if (!res.ok) return { ok: false, error: (json as { error?: string }).error };
  return { ok: true, deleted: (json as { deleted?: number }).deleted };
}
