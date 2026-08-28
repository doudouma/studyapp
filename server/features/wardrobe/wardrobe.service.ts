import { createDb } from "../../db";
import { wardrobeItem, wardrobeOutfit } from "../../db/schema";
import type {
  UploadResponse,
  JobResponse,
  AnalyzeResponse,
  ExtractResponse,
  WardrobeItemDto,
  ItemsResponse,
  OutfitDto,
  OutfitsResponse,
  CreateOutfitResponse,
  AutoCreateOutfitResponse,
  OutfitDetailResponse,
  AnalyzedClothingItem,
} from "@shared/types/wardrobe";
import {
  createJob,
  getJob,
  updateJobStatus,
  getUserItems,
  getItem,
  createItem,
  updateItem,
  deleteItem,
  getUserOutfits,
  getOutfit,
  createOutfit,
  updateOutfitStatus,
  deleteOutfit,
  getItemsByIds,
} from "./wardrobe.repo";

/**
 * Wardrobe 业务逻辑层 (Service)
 * 承载业务规则与 DTO 转换，供 routes 与未来其他调用方复用
 */

// ==================== 常量 ====================

const VISION_MODEL = "@cf/meta/llama-3.2-11b-vision-instruct";
const IMAGE_MODEL = "@cf/black-forest-labs/flux-2-klein-4b";

const ANALYSIS_PROMPT = `Analyze this image and identify all clothing items.

For each clothing item, provide:
- name: specific clothing name
- part: category (upperbody, wholebody_up, lowerbody, accessories_up, shoes)
- color: hex color code
- secondaryColor: hex or null
- tags: array of descriptive tags
- boundingBox: {x, y, width, height} normalized to 0-1000

Return the result as a JSON object with an "items" array.`;

// 同意 Meta 许可证
let metaLicenseAgreed = false;
async function ensureMetaLicense(ai: Ai) {
  if (metaLicenseAgreed) return;
  try {
    await (ai as any).run(VISION_MODEL, { prompt: "agree" });
    metaLicenseAgreed = true;
  } catch {
    metaLicenseAgreed = true;
  }
}

// ==================== 工具函数 ====================

function formatItemDto(item: typeof wardrobeItem.$inferSelect): WardrobeItemDto {
  return {
    id: item.id,
    name: item.name,
    part: item.part as WardrobeItemDto["part"],
    color: item.color,
    secondaryColor: item.secondaryColor,
    tags: item.tags ? JSON.parse(item.tags) : [],
    image: item.imageUrl,
    thumbnail: item.thumbnailUrl || item.imageUrl,
    createdAt: item.createdAt.toISOString(),
  };
}

function formatOutfitDto(outfit: typeof wardrobeOutfit.$inferSelect): OutfitDto {
  return {
    id: outfit.id,
    name: outfit.name,
    occasion: outfit.occasion,
    itemIds: outfit.itemIds ? JSON.parse(outfit.itemIds) : [],
    imageUrl: outfit.imageUrl,
    status: outfit.status as OutfitDto["status"],
    createdAt: outfit.createdAt.toISOString(),
  };
}

// ==================== 从 Markdown 提取服装信息 ====================

function extractItemsFromMarkdown(content: string): AnalyzedClothingItem[] {
  const items: AnalyzedClothingItem[] = [];
  const lines = content.split("\n");
  let currentItem: AnalyzedClothingItem | null = null;

  const categoryMap: Record<string, string> = {
    shirt: "upperbody", blouse: "upperbody", top: "upperbody", "t-shirt": "upperbody",
    sweater: "upperbody", cardigan: "upperbody", hoodie: "upperbody", sweatshirt: "upperbody",
    dress: "wholebody_up", jumpsuit: "wholebody_up", romper: "wholebody_up",
    jacket: "wholebody_up", coat: "wholebody_up", blazer: "wholebody_up", vest: "wholebody_up",
    pants: "lowerbody", jeans: "lowerbody", trousers: "lowerbody", shorts: "lowerbody",
    skirt: "lowerbody", leggings: "lowerbody",
    shoes: "shoes", boots: "shoes", sneakers: "shoes", sandals: "shoes", heels: "shoes", slippers: "shoes",
    hat: "accessories_up", cap: "accessories_up", beanie: "accessories_up",
    bag: "accessories_up", purse: "accessories_up", backpack: "accessories_up",
    sunglasses: "accessories_up", glasses: "accessories_up", scarf: "accessories_up", belt: "accessories_up",
  };

  const colorMap: Record<string, string> = {
    white: "#FFFFFF", black: "#000000", red: "#FF0000", blue: "#0000FF", green: "#008000",
    yellow: "#FFFF00", purple: "#800080", orange: "#FFA500", pink: "#FFC0CB", brown: "#A52A2A",
    gray: "#808080", grey: "#808080", navy: "#000080", beige: "#F5F5DC", cream: "#FFFDD0",
    maroon: "#800000", olive: "#808000", teal: "#008080", cyan: "#00FFFF", magenta: "#FF00FF",
  };

  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    let detectedCategory: string | null = null;
    let detectedName: string | null = null;

    for (const [keyword, category] of Object.entries(categoryMap)) {
      if (lowerLine.includes(keyword)) {
        detectedCategory = category;
        const nameMatch = line.match(new RegExp(`([^.,]*${keyword}[^.,]*)`, "i"));
        if (nameMatch) {
          detectedName = nameMatch[1].replace(/[*#]/g, "").trim();
          detectedName = detectedName.replace(/^(a|an|the|this|that|these|those)\s+/i, "");
          detectedName = detectedName.charAt(0).toUpperCase() + detectedName.slice(1);
        } else {
          detectedName = keyword.charAt(0).toUpperCase() + keyword.slice(1);
        }
        break;
      }
    }

    if (detectedCategory && detectedName) {
      let color = "#808080";
      for (const [colorName, hex] of Object.entries(colorMap)) {
        if (lowerLine.includes(colorName)) {
          color = hex;
          break;
        }
      }

      const existingItem = items.find(
        (item) =>
          item.name.toLowerCase() === detectedName!.toLowerCase() ||
          (item.part === detectedCategory &&
            item.name.toLowerCase().includes(detectedName!.toLowerCase().split(" ")[0]))
      );

      if (!existingItem) {
        currentItem = {
          name: detectedName,
          part: detectedCategory as AnalyzedClothingItem["part"],
          color,
          secondaryColor: null,
          tags: [],
          boundingBox: { x: 0, y: 0, width: 1000, height: 1000 },
        };
        items.push(currentItem);
      }
    }

    if (currentItem) {
      const tagPatterns = [
        /pattern:\s*([^.,]+)/i,
        /style:\s*([^.,]+)/i,
        /material:\s*([^.,]+)/i,
        /design:\s*([^.,]+)/i,
        /floral/i, /striped/i, /plaid/i, /denim/i, /leather/i, /cotton/i, /silk/i, /wool/i,
        /casual/i, /formal/i, /sporty/i, /vintage/i, /modern/i,
      ];

      for (const pattern of tagPatterns) {
        const match = line.match(pattern);
        if (match) {
          const tag = (match[1] || match[0]).toLowerCase().trim();
          if (tag && !currentItem.tags.includes(tag) && currentItem.tags.length < 4) {
            currentItem.tags.push(tag);
          }
        }
      }
    }
  }

  if (items.length === 0) {
    if (content.toLowerCase().includes("shirt") || content.toLowerCase().includes("top")) {
      items.push({
        name: "Shirt", part: "upperbody", color: "#FFFFFF", secondaryColor: null,
        tags: [], boundingBox: { x: 0, y: 0, width: 1000, height: 1000 },
      });
    }
    if (content.toLowerCase().includes("pants") || content.toLowerCase().includes("jeans")) {
      items.push({
        name: "Pants", part: "lowerbody", color: "#0000FF", secondaryColor: null,
        tags: [], boundingBox: { x: 0, y: 0, width: 1000, height: 1000 },
      });
    }
    if (content.toLowerCase().includes("boots") || content.toLowerCase().includes("shoes")) {
      items.push({
        name: "Boots", part: "shoes", color: "#000000", secondaryColor: null,
        tags: [], boundingBox: { x: 0, y: 0, width: 1000, height: 1000 },
      });
    }
  }

  if (items.length === 0) {
    items.push({
      name: "Clothing Item", part: "upperbody", color: "#808080", secondaryColor: null,
      tags: [], boundingBox: { x: 0, y: 0, width: 1000, height: 1000 },
    });
  }

  return items;
}

// ==================== Outfit 图片生成 ====================

export async function generateOutfitImage(
  env: { AI?: Ai; BUCKET?: R2Bucket; D1?: D1Database },
  outfitId: string,
  prompt: string
): Promise<void> {
  const db = createDb(env.D1!);
  try {
    await updateOutfitStatus(env.D1!, outfitId, { status: "generating" });

    const form = new FormData();
    form.append("prompt", prompt);
    form.append("width", "1024");
    form.append("height", "1024");

    const formResponse = new Response(form);
    const formStream = formResponse.body;
    const formContentType = formResponse.headers.get("content-type") || "multipart/form-data";

    const response = await (env.AI as any).run(IMAGE_MODEL, {
      multipart: { body: formStream, contentType: formContentType },
    });

    let imageBuffer: ArrayBuffer;
    if (response instanceof ArrayBuffer) {
      imageBuffer = response;
    } else if (response instanceof Uint8Array) {
      imageBuffer = response.buffer as ArrayBuffer;
    } else if (response && typeof response === "object" && typeof response.image === "string") {
      const binary = atob(response.image);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      imageBuffer = bytes.buffer as ArrayBuffer;
    } else {
      throw new Error("Invalid response format");
    }

    const imageKey = `wardrobe/outfits/${outfitId}.png`;
    await env.BUCKET!.put(imageKey, imageBuffer, {
      httpMetadata: { contentType: "image/png" },
    });

    await updateOutfitStatus(env.D1!, outfitId, {
      status: "completed",
      imageUrl: `/api/wardrobe/assets/outfits/${outfitId}.png`,
    });
  } catch (error: any) {
    console.error("[outfit] Generation failed:", error.message);
    await updateOutfitStatus(env.D1!, outfitId, {
      status: "failed",
      error: error.message,
    });
  }
}

// ==================== Outfit 自动创建 ====================

function hexToRgb(hex: string | null): { red: number; green: number; blue: number } {
  if (!hex) return { red: 128, green: 128, blue: 128 };
  const clean = hex.replace("#", "");
  const value = parseInt(clean.length === 3 ? clean.split("").map((ch) => ch + ch).join("") : clean, 16);
  return { red: (value >> 16) & 255, green: (value >> 8) & 255, blue: value & 255 };
}

function colorDist(a: { red: number; green: number; blue: number }, b: { red: number; green: number; blue: number }) {
  return Math.sqrt((a.red - b.red) ** 2 + (a.green - b.green) ** 2 + (a.blue - b.blue) ** 2);
}

const NAMED_COLORS: [string, number, number, number][] = [
  ["black", 0, 0, 0], ["white", 255, 255, 255], ["grey", 128, 128, 128],
  ["navy", 0, 0, 128], ["blue", 0, 0, 255], ["teal", 0, 128, 128],
  ["green", 0, 128, 0], ["olive", 128, 128, 0], ["khaki", 195, 176, 145],
  ["brown", 139, 69, 19], ["camel", 193, 154, 107], ["beige", 245, 245, 220],
  ["cream", 255, 253, 208], ["maroon", 128, 0, 0], ["red", 255, 0, 0],
  ["burgundy", 144, 0, 32], ["coral", 255, 127, 80], ["pink", 255, 192, 203],
  ["purple", 128, 0, 128], ["violet", 238, 130, 238], ["lavender", 230, 230, 250],
  ["orange", 255, 165, 0], ["amber", 255, 191, 0], ["yellow", 255, 255, 0],
  ["gold", 255, 215, 0], ["cyan", 0, 255, 255], ["turquoise", 64, 224, 208],
];

function colorName(hex: string | null): string {
  if (!hex) return "neutral";
  const rgb = hexToRgb(hex);
  let best = "neutral";
  let bestScore = Infinity;
  for (const [label, r, g, b] of NAMED_COLORS) {
    const score = colorDist(rgb, { red: r, green: g, blue: b });
    if (score < bestScore) { bestScore = score; best = label; }
  }
  return best;
}

const STYLE_WORDS = ["Classic", "Minimal", "Urban", "Layered", "Chic", "Everyday"];
const OCCASIONS = ["casual", "smart-casual", "office", "weekend", "date night", "city walk"];
const SETTINGS = [
  "a quiet warm-stone courtyard with restrained greenery",
  "a minimal concrete studio with soft natural light",
  "soft daylight by a large window in an airy room",
  "a city rooftop at golden hour with clean lines",
  "a calm beige-toned street corner in morning light",
  "a park path with soft blurred foliage in the background",
];

function partLabel(part: string): string {
  const map: Record<string, string> = {
    upperbody: "top", wholebody_up: "jacket", lowerbody: "bottoms", shoes: "shoes", accessories_up: "accessory",
  };
  return map[part] || part;
}

function describeItem(item: { name: string; part: string; color: string | null }): string {
  return `${item.name} (${partLabel(item.part)}, ${colorName(item.color)})`;
}

// ==================== 业务函数 ====================

/** 上传图片并创建任务 */
export async function uploadImage(
  env: { BUCKET?: R2Bucket; D1?: D1Database },
  userId: string,
  file: File
): Promise<UploadResponse | { error: string }> {
  if (!env.BUCKET || !env.D1) return { error: "Service unavailable" };

  const jobId = crypto.randomUUID().slice(0, 10);
  const buffer = await file.arrayBuffer();

  const key = `wardrobe/${jobId}/original.png`;
  await env.BUCKET.put(key, buffer, {
    httpMetadata: { contentType: file.type || "image/png" },
  });

  const imageUrl = `/api/wardrobe/assets/${jobId}/original.png`;
  await createJob(env.D1, jobId, userId, imageUrl);

  return { jobId, imageUrl };
}

/** 获取任务状态 */
export async function getJobStatus(
  env: { D1?: D1Database },
  jobId: string,
  userId: string
): Promise<JobResponse | { error: string }> {
  if (!env.D1) return { error: "Service unavailable" };

  const job = await getJob(env.D1, jobId);
  if (!job || job.userId !== userId) return { error: "Job not found" };

  return {
    id: job.id,
    status: job.status as JobResponse["status"],
    originalImageUrl: job.originalImageUrl,
    analysisResult: job.analysisResult ? JSON.parse(job.analysisResult) : null,
    error: job.error,
  };
}

/** 分析图片 */
export async function analyzeImage(
  env: { AI?: Ai; BUCKET?: R2Bucket; D1?: D1Database },
  jobId: string,
  userId: string
): Promise<AnalyzeResponse | { error: string }> {
  if (!env.D1) return { error: "Service unavailable" };

  const job = await getJob(env.D1, jobId);
  if (!job || job.userId !== userId) return { error: "Job not found" };
  if (!env.AI) return { error: "AI not configured" };

  await updateJobStatus(env.D1, jobId, { status: "analyzing" });

  const maxRetries = 5;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await ensureMetaLicense(env.AI);

      const imageKey = `wardrobe/${jobId}/original.png`;
      const imageObject = await env.BUCKET!.get(imageKey);
      if (!imageObject) throw new Error("Image not found");

      const imageBuffer = await imageObject.arrayBuffer();
      const bytes = new Uint8Array(imageBuffer);
      let binary = "";
      const chunkSize = 8192;
      for (let i = 0; i < bytes.length; i += chunkSize) {
        const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
        binary += String.fromCharCode.apply(null, chunk as unknown as number[]);
      }
      const base64 = btoa(binary);
      const imageDataUrl = `data:image/png;base64,${base64}`;

      const aiPromise = env.AI.run(VISION_MODEL, {
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: ANALYSIS_PROMPT },
              { type: "image_url", image_url: { url: imageDataUrl } },
            ],
          },
        ],
      });
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("AI request timeout")), 120000)
      );
      const response = await Promise.race([aiPromise, timeoutPromise]);

      const content = (response as any).response || (response as any).choices?.[0]?.message?.content;
      if (!content) throw new Error("No response from AI model");

      let items: AnalyzedClothingItem[];
      try {
        const parsed = JSON.parse(content);
        items = parsed.items || [];
      } catch {
        const firstBrace = content.indexOf("{");
        const lastBrace = content.lastIndexOf("}");
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          const jsonStr = content.substring(firstBrace, lastBrace + 1);
          try {
            const parsed = JSON.parse(jsonStr);
            items = parsed.items || [];
          } catch {
            const allMatches = jsonStr.match(/\{[^{}]*\}/g);
            if (allMatches && allMatches.length > 0) {
              for (const match of allMatches) {
                try {
                  const parsed = JSON.parse(match);
                  if (parsed.items) { items = parsed.items; break; }
                } catch { /* continue */ }
              }
            }
            if (!items!) items = extractItemsFromMarkdown(content);
          }
        } else {
          items = extractItemsFromMarkdown(content);
        }
      }

      if (!Array.isArray(items)) throw new Error("Invalid items format in AI response");

      await updateJobStatus(env.D1, jobId, {
        status: "completed",
        analysisResult: JSON.stringify(items),
      });

      return { items };
    } catch (error: any) {
      lastError = error;
      if (
        error.message.includes("3040") ||
        error.message.includes("Capacity temporarily exceeded") ||
        error.message.includes("rate limit") ||
        error.message.includes("timeout") ||
        error.message.includes("Network connection lost") ||
        error.message.includes("network")
      ) {
        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, attempt * 10000));
          continue;
        }
      }
      break;
    }
  }

  const errorMessage = lastError?.message || "Analysis failed";
  await updateJobStatus(env.D1, jobId, { status: "failed", error: errorMessage });
  return { error: errorMessage };
}

/** 提取服装项并生成图片 */
export async function extractItem(
  env: { AI?: Ai; BUCKET?: R2Bucket; D1?: D1Database },
  jobId: string,
  itemIndex: number,
  userId: string
): Promise<ExtractResponse | { error: string }> {
  if (!env.D1) return { error: "Service unavailable" };

  const job = await getJob(env.D1, jobId);
  if (!job || job.userId !== userId) return { error: "Job not found" };
  if (!job.analysisResult) return { error: "No analysis result" };

  const items = JSON.parse(job.analysisResult);
  if (itemIndex < 0 || itemIndex >= items.length) return { error: "Invalid item index" };

  const item = items[itemIndex];

  const maxRetries = 5;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const imageUrl = `https://www.100mini.com/api/wardrobe/assets/${jobId}/original.png`;
      const imageResponse = await fetch(imageUrl, {
        cf: {
          image: {
            segment: "foreground",
            background: "#ffffff",
            format: "png",
            width: 512,
            height: 512,
            fit: "contain",
          },
        },
      });

      if (!imageResponse.ok) throw new Error(`Image processing failed: ${imageResponse.status}`);

      const imageBuffer = await imageResponse.arrayBuffer();
      const itemId = crypto.randomUUID().slice(0, 10);
      const itemImageKey = `wardrobe/items/${itemId}.png`;
      await env.BUCKET!.put(itemImageKey, imageBuffer, {
        httpMetadata: { contentType: "image/png" },
      });

      const itemImageUrl = `/api/wardrobe/assets/items/${itemId}.png`;

      await createItem(env.D1, {
        id: itemId,
        userId,
        name: item.name,
        part: item.part,
        color: item.color,
        secondaryColor: item.secondaryColor || null,
        tags: JSON.stringify(item.tags || []),
        imageUrl: itemImageUrl,
      });

      return {
        item: {
          id: itemId,
          name: item.name,
          part: item.part,
          color: item.color,
          secondaryColor: item.secondaryColor,
          tags: item.tags,
          image: itemImageUrl,
        },
      };
    } catch (error: any) {
      lastError = error;
      if (
        error.message.includes("3040") ||
        error.message.includes("Capacity temporarily exceeded") ||
        error.message.includes("rate limit") ||
        error.message.includes("timeout") ||
        error.message.includes("Network connection lost") ||
        error.message.includes("network")
      ) {
        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, attempt * 10000));
          continue;
        }
      }
      break;
    }
  }

  return { error: lastError?.message || "Image generation failed" };
}

/** 获取用户服装列表 */
export async function listItems(
  env: { D1?: D1Database },
  userId: string
): Promise<ItemsResponse> {
  if (!env.D1) return { items: [] };

  const items = await getUserItems(env.D1, userId);
  return { items: items.map(formatItemDto) };
}

/** 更新服装项 */
export async function updateWardrobeItem(
  env: { D1?: D1Database },
  itemId: string,
  userId: string,
  data: { name?: string; part?: string; color?: string; secondaryColor?: string | null; tags?: string[] }
): Promise<{ success: boolean } | { error: string }> {
  if (!env.D1) return { error: "Service unavailable" };

  const item = await getItem(env.D1, itemId);
  if (!item || item.userId !== userId) return { error: "Item not found" };

  const updates: Record<string, unknown> = {};
  if (data.name) updates.name = data.name;
  if (data.part) updates.part = data.part;
  if (data.color) updates.color = data.color;
  if (data.secondaryColor !== undefined) updates.secondaryColor = data.secondaryColor;
  if (data.tags) updates.tags = JSON.stringify(data.tags);

  await updateItem(env.D1, itemId, updates);
  return { success: true };
}

/** 删除服装项 */
export async function removeItem(
  env: { BUCKET?: R2Bucket; D1?: D1Database },
  itemId: string,
  userId: string
): Promise<{ success: boolean } | { error: string }> {
  if (!env.D1) return { error: "Service unavailable" };

  const item = await getItem(env.D1, itemId);
  if (!item || item.userId !== userId) return { error: "Item not found" };

  if (item.imageUrl && env.BUCKET) {
    const key = item.imageUrl.replace("/api/wardrobe/assets/", "wardrobe/");
    await env.BUCKET.delete(key);
  }

  await deleteItem(env.D1, itemId);
  return { success: true };
}

/** 获取用户 outfit 列表 */
export async function listOutfits(
  env: { D1?: D1Database },
  userId: string
): Promise<OutfitsResponse> {
  if (!env.D1) return { outfits: [] };

  const outfits = await getUserOutfits(env.D1, userId);
  return { outfits: outfits.map(formatOutfitDto) };
}

/** 创建 outfit */
export async function createWardrobeOutfit(
  env: { AI?: Ai; D1?: D1Database; BUCKET?: R2Bucket; executionCtx?: ExecutionContext },
  userId: string,
  data: { name: string; occasion?: string; itemIds: string[] }
): Promise<CreateOutfitResponse | { error: string }> {
  if (!env.D1) return { error: "Service unavailable" };
  if (data.itemIds.length < 2) return { error: "At least 2 items required" };

  const items = await getItemsByIds(env.D1, userId, data.itemIds);
  if (items.length !== data.itemIds.length) return { error: "Some items not found" };

  const outfitId = crypto.randomUUID().slice(0, 10);
  const itemDescriptions = items.map((item) => `${item.name} (${item.part}, ${item.color})`).join(", ");
  const prompt = `Create a stylish outfit combination photo featuring: ${itemDescriptions}. 
Professional fashion photography, clean white background, well-lit, high quality product styling.`;

  await createOutfit(env.D1, {
    id: outfitId,
    userId,
    name: data.name,
    occasion: data.occasion || null,
    itemIds: JSON.stringify(data.itemIds),
    status: "planned",
  });

  if (env.AI && env.executionCtx) {
    env.executionCtx.waitUntil(generateOutfitImage(env, outfitId, prompt));
  }

  return {
    outfit: {
      id: outfitId,
      name: data.name,
      occasion: data.occasion || null,
      itemIds: data.itemIds,
      status: "planned",
    },
  };
}

/** 自动创建 outfit */
export async function autoCreateOutfits(
  env: { AI?: Ai; D1?: D1Database; BUCKET?: R2Bucket; executionCtx?: ExecutionContext },
  userId: string,
  count: number
): Promise<AutoCreateOutfitResponse | { error: string }> {
  if (!env.D1) return { error: "Service unavailable" };

  const allItems = await getUserItems(env.D1, userId);
  if (allItems.length === 0) return { error: "Your wardrobe is empty. Import some clothes first." };

  const tops = allItems.filter((i) => i.part === "upperbody");
  const jackets = allItems.filter((i) => i.part === "wholebody_up");
  const bottoms = allItems.filter((i) => i.part === "lowerbody");
  const shoes = allItems.filter((i) => i.part === "shoes");
  const accessories = allItems.filter((i) => i.part === "accessories_up");

  if (tops.length === 0 || bottoms.length === 0) {
    return { error: "You need at least one top and one bottom to create outfits." };
  }

  const usage = new Map<string, number>();
  const bump = (id: string) => usage.set(id, (usage.get(id) || 0) + 1);
  const leastUsed = (pool: typeof allItems) =>
    pool.length === 0 ? null : [...pool].sort((a, b) => (usage.get(a.id) || 0) - (usage.get(b.id) || 0))[0];
  const harmonicPick = (pool: typeof allItems, ref: { red: number; green: number; blue: number }) => {
    if (pool.length === 0) return null;
    let best: (typeof allItems)[number] | null = null;
    let bestScore = Infinity;
    for (const item of pool) {
      const score = colorDist(ref, hexToRgb(item.color)) + (usage.get(item.id) || 0) * 60;
      if (score < bestScore) { bestScore = score; best = item; }
    }
    return best;
  };

  const maxCombos = Math.min(count, tops.length * bottoms.length);
  const combos: { top: typeof allItems[number]; bottom: typeof allItems[number]; jacket: typeof allItems[number] | null; shoes: typeof allItems[number] | null; accessory: typeof allItems[number] | null }[] = [];
  for (let i = 0; i < maxCombos; i++) {
    const top = leastUsed(tops)!;
    bump(top.id);
    const bottom = harmonicPick(bottoms, hexToRgb(top.color))!;
    bump(bottom.id);
    const jacket = harmonicPick(jackets, hexToRgb(top.color));
    if (jacket) bump(jacket.id);
    const shoe = leastUsed(shoes);
    if (shoe) bump(shoe.id);
    const accessory = leastUsed(accessories);
    if (accessory) bump(accessory.id);
    combos.push({ top, bottom, jacket, shoes: shoe, accessory });
  }

  const created: AutoCreateOutfitResponse["outfits"] = [];
  for (let i = 0; i < combos.length; i++) {
    const combo = combos[i];
    const outfitId = crypto.randomUUID().slice(0, 10);
    const topColor = colorName(combo.top.color);
    const bottomColor = colorName(combo.bottom.color);
    const name = `${topColor.charAt(0).toUpperCase() + topColor.slice(1)} & ${bottomColor.charAt(0).toUpperCase() + bottomColor.slice(1)} ${STYLE_WORDS[i % STYLE_WORDS.length]}`;
    const occasion = OCCASIONS[i % OCCASIONS.length];
    const itemIds = [combo.top, combo.bottom, combo.jacket, combo.shoes, combo.accessory]
      .filter((item): item is typeof allItems[number] => !!item)
      .map((item) => item.id);

    const setting = SETTINGS[i % SETTINGS.length];
    const prompt = `Full-body editorial fashion photo of a complete outfit: ${[
      describeItem(combo.top), describeItem(combo.bottom), combo.jacket ? describeItem(combo.jacket) : null,
      combo.shoes ? describeItem(combo.shoes) : null, combo.accessory ? describeItem(combo.accessory) : null,
    ].filter(Boolean).join(", ")}. Harmonious ${topColor} and ${bottomColor} tonal palette, one dominant piece. Natural layered look, ${setting}, clean composition, square 1:1, photorealistic, professional fashion photography.`;

    await createOutfit(env.D1, {
      id: outfitId,
      userId,
      name,
      occasion,
      itemIds: JSON.stringify(itemIds),
      status: "planned",
    });

    if (env.AI && env.executionCtx) {
      env.executionCtx.waitUntil(generateOutfitImage(env, outfitId, prompt));
    }

    created.push({ id: outfitId, name, occasion, itemIds, status: "planned" });
  }

  return { outfits: created };
}

/** 获取 outfit 详情 */
export async function getOutfitDetail(
  env: { D1?: D1Database },
  outfitId: string,
  userId: string
): Promise<OutfitDetailResponse | { error: string }> {
  if (!env.D1) return { error: "Service unavailable" };

  const outfit = await getOutfit(env.D1, outfitId);
  if (!outfit || outfit.userId !== userId) return { error: "Outfit not found" };

  const itemIds = outfit.itemIds ? JSON.parse(outfit.itemIds) : [];
  const items = itemIds.length > 0 ? await getItemsByIds(env.D1, userId, itemIds) : [];

  return {
    outfit: {
      ...formatOutfitDto(outfit),
      error: outfit.error,
      items: items.map((item) => ({
        id: item.id,
        name: item.name,
        part: item.part as OutfitDetailResponse["outfit"]["items"][number]["part"],
        color: item.color,
        image: item.imageUrl,
      })),
    },
  };
}

/** 删除 outfit */
export async function removeOutfit(
  env: { BUCKET?: R2Bucket; D1?: D1Database },
  outfitId: string,
  userId: string
): Promise<{ success: boolean } | { error: string }> {
  if (!env.D1) return { error: "Service unavailable" };

  const outfit = await getOutfit(env.D1, outfitId);
  if (!outfit || outfit.userId !== userId) return { error: "Outfit not found" };

  if (outfit.imageUrl && env.BUCKET) {
    const key = outfit.imageUrl.replace("/api/wardrobe/assets/", "wardrobe/");
    await env.BUCKET.delete(key);
  }

  await deleteOutfit(env.D1, outfitId);
  return { success: true };
}