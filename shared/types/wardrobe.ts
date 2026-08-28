/**
 * Wardrobe (衣柜) 功能的共享类型与常量
 * 前后端唯一数据契约来源，禁止在前端或后端重复定义同名字段
 */

/** 上传限制 */
export const WARDROBE_MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const WARDROBE_ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

/** 服装部位类型 */
export type ClothingPart = "upperbody" | "wholebody_up" | "lowerbody" | "accessories_up" | "shoes";

/** 任务状态 */
export type JobStatus = "pending" | "analyzing" | "generating" | "completed" | "failed";

/** Outfit 状态 */
export type OutfitStatus = "planned" | "generating" | "completed" | "failed";

/** AI 分析结果中的服装项 */
export interface AnalyzedClothingItem {
  name: string;
  part: ClothingPart;
  color: string;
  secondaryColor: string | null;
  tags: string[];
  boundingBox: { x: number; y: number; width: number; height: number };
}

/** 上传响应 */
export interface UploadResponse {
  jobId: string;
  imageUrl: string;
}

/** 任务状态响应 */
export interface JobResponse {
  id: string;
  status: JobStatus;
  originalImageUrl: string | null;
  analysisResult: AnalyzedClothingItem[] | null;
  error: string | null;
}

/** 分析响应 */
export interface AnalyzeResponse {
  items: AnalyzedClothingItem[];
}

/** 提取服装项响应 */
export interface ExtractResponse {
  item: {
    id: string;
    name: string;
    part: ClothingPart;
    color: string;
    secondaryColor: string | null;
    tags: string[];
    image: string;
  };
}

/** 服装项 DTO */
export interface WardrobeItemDto {
  id: string;
  name: string;
  part: ClothingPart;
  color: string;
  secondaryColor: string | null;
  tags: string[];
  image: string;
  thumbnail: string;
  createdAt: string;
}

/** 服装列表响应 */
export interface ItemsResponse {
  items: WardrobeItemDto[];
}

/** 更新服装项请求 */
export interface UpdateItemRequest {
  name?: string;
  part?: ClothingPart;
  color?: string;
  secondaryColor?: string | null;
  tags?: string[];
}

/** Outfit DTO */
export interface OutfitDto {
  id: string;
  name: string;
  occasion: string | null;
  itemIds: string[];
  imageUrl: string | null;
  status: OutfitStatus;
  createdAt: string;
}

/** Outfit 列表响应 */
export interface OutfitsResponse {
  outfits: OutfitDto[];
}

/** 创建 Outfit 请求 */
export interface CreateOutfitRequest {
  name: string;
  occasion?: string;
  itemIds: string[];
}

/** 创建 Outfit 响应 */
export interface CreateOutfitResponse {
  outfit: {
    id: string;
    name: string;
    occasion: string | null;
    itemIds: string[];
    status: OutfitStatus;
  };
}

/** 自动创建 Outfit 请求 */
export interface AutoCreateOutfitRequest {
  count?: number;
}

/** 自动创建 Outfit 响应 */
export interface AutoCreateOutfitResponse {
  outfits: {
    id: string;
    name: string;
    occasion: string | null;
    itemIds: string[];
    status: OutfitStatus;
  }[];
}

/** Outfit 详情响应 */
export interface OutfitDetailResponse {
  outfit: OutfitDto & {
    error: string | null;
    items: {
      id: string;
      name: string;
      part: ClothingPart;
      color: string;
      image: string;
    }[];
  };
}