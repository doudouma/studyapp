import { apiClient } from "~/features/api-client";
import type {
  UploadResponse,
  JobResponse,
  AnalyzeResponse,
  ExtractResponse,
  ItemsResponse,
  UpdateItemRequest,
  OutfitsResponse,
  CreateOutfitRequest,
  CreateOutfitResponse,
  AutoCreateOutfitRequest,
  AutoCreateOutfitResponse,
  OutfitDetailResponse,
} from "@shared/types/wardrobe";

/**
 * Wardrobe 功能的类型化 API 客户端 (Hono RPC)
 * 页面/组件只依赖此模块，不直接 fetch
 */

/** 上传图片并创建任务 */
export async function uploadWardrobeImage(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("image", file);
  const res = await apiClient().api.wardrobe.upload.$post({ form: formData });
  if (!res.ok) throw new Error("Upload failed");
  return (await res.json()) as UploadResponse;
}

/** 获取任务状态 */
export async function fetchJobStatus(jobId: string): Promise<JobResponse> {
  const res = await apiClient().api.wardrobe.jobs[":id"].$get({ param: { id: jobId } });
  if (!res.ok) throw new Error("Job not found");
  return (await res.json()) as JobResponse;
}

/** 分析图片 */
export async function analyzeWardrobeImage(jobId: string): Promise<AnalyzeResponse> {
  const res = await apiClient().api.wardrobe.jobs[":id"].analyze.$post({ param: { id: jobId } });
  if (!res.ok) throw new Error("Analysis failed");
  return (await res.json()) as AnalyzeResponse;
}

/** 提取服装项并生成图片 */
export async function extractWardrobeItem(jobId: string, itemIndex: number): Promise<ExtractResponse> {
  const res = await apiClient().api.wardrobe.jobs[":id"].extract[":itemIndex"].$post({
    param: { id: jobId, itemIndex: String(itemIndex) },
  });
  if (!res.ok) throw new Error("Extraction failed");
  return (await res.json()) as ExtractResponse;
}

/** 获取用户服装列表 */
export async function fetchWardrobeItems(): Promise<ItemsResponse> {
  const res = await apiClient().api.wardrobe.items.$get();
  if (!res.ok) return { items: [] };
  return (await res.json()) as ItemsResponse;
}

/** 更新服装项 */
export async function updateWardrobeItem(
  itemId: string,
  data: UpdateItemRequest
): Promise<{ success: boolean }> {
  const res = await fetch(`/api/wardrobe/items/${itemId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Update failed");
  return res.json();
}

/** 删除服装项 */
export async function deleteWardrobeItem(itemId: string): Promise<{ success: boolean }> {
  const res = await apiClient().api.wardrobe.items[":id"].$delete({ param: { id: itemId } });
  if (!res.ok) throw new Error("Delete failed");
  return (await res.json()) as { success: boolean };
}

/** 获取用户 outfit 列表 */
export async function fetchWardrobeOutfits(): Promise<OutfitsResponse> {
  const res = await apiClient().api.wardrobe.outfits.$get();
  if (!res.ok) return { outfits: [] };
  return (await res.json()) as OutfitsResponse;
}

/** 创建 outfit */
export async function createWardrobeOutfit(
  data: CreateOutfitRequest
): Promise<CreateOutfitResponse> {
  const res = await apiClient().api.wardrobe.outfits.$post({ json: data });
  if (!res.ok) throw new Error("Create outfit failed");
  return (await res.json()) as CreateOutfitResponse;
}

/** 自动创建 outfit */
export async function autoCreateWardrobeOutfits(
  data?: AutoCreateOutfitRequest
): Promise<AutoCreateOutfitResponse> {
  const res = await apiClient().api.wardrobe.outfits.auto.$post({ json: data || {} });
  if (!res.ok) throw new Error("Auto create outfits failed");
  return (await res.json()) as AutoCreateOutfitResponse;
}

/** 获取 outfit 详情 */
export async function fetchOutfitDetail(outfitId: string): Promise<OutfitDetailResponse> {
  const res = await apiClient().api.wardrobe.outfits[":id"].$get({ param: { id: outfitId } });
  if (!res.ok) throw new Error("Outfit not found");
  return (await res.json()) as OutfitDetailResponse;
}

/** 删除 outfit */
export async function deleteWardrobeOutfit(outfitId: string): Promise<{ success: boolean }> {
  const res = await apiClient().api.wardrobe.outfits[":id"].$delete({ param: { id: outfitId } });
  if (!res.ok) throw new Error("Delete outfit failed");
  return (await res.json()) as { success: boolean };
}