# Wardrobe 功能实现计划

## 概述

参考 [wardrobe-main](https://github.com/tandpfun/wardrobe) 项目，在 studyapp 中实现 AI 驱动的服装检测和管理功能，使用 Cloudflare AI 替代 OpenAI。

## 技术架构

| 组件 | wardrobe-main | studyapp 实现 |
|------|---------------|---------------|
| AI 视觉分析 | OpenAI Responses API | `@cf/meta/llama-3.2-11b-vision-instruct` |
| AI 图像生成 | OpenAI Images Edits API | `@cf/black-forest-labs/flux-2-dev` |
| 数据存储 | 本地 JSON 文件 | Cloudflare D1 + R2 |
| 图像处理 | Sharp (Node.js) | 浏览器端 Canvas + R2 存储 |
| 前端框架 | React JSX | React + TypeScript + shadcn/ui |

## 实现步骤

### 第一阶段：配置和基础设施

#### 1.1 配置 Cloudflare AI

**文件**: `wrangler.toml`

```toml
[ai]
binding = "AI"
```

**文件**: `server/api.ts` - 更新类型定义

```typescript
type Bindings = {
  BUCKET?: R2Bucket;
  D1?: D1Database;
  AI?: Ai;  // 添加 AI 类型
};
```

#### 1.2 创建数据库表

**文件**: `server/db/schema.ts`

```typescript
export const wardrobeItem = sqliteTable("wardrobe_item", {
  id: text("id").primaryKey().$defaultFn(() => nanoid(10)),
  userId: text("user_id").notNull().references(() => user.id),
  name: text("name").notNull(),
  part: text("part").notNull(), // upperbody, wholebody_up, lowerbody, accessories_up, shoes
  color: text("color").notNull(),
  secondaryColor: text("secondary_color"),
  tags: text("tags"), // JSON array string
  imageUrl: text("image_url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const wardrobeJob = sqliteTable("wardrobe_job", {
  id: text("id").primaryKey().$defaultFn(() => nanoid(10)),
  userId: text("user_id").notNull().references(() => user.id),
  status: text("status").notNull().default("pending"), // pending, analyzing, generating, completed, failed
  originalImageUrl: text("original_image_url"),
  analysisResult: text("analysis_result"), // JSON string
  error: text("error"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
});
```

#### 1.3 创建数据库迁移

**文件**: `drizzle/0005_wardrobe.sql`

```sql
CREATE TABLE IF NOT EXISTS wardrobe_item (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES user(id),
  name TEXT NOT NULL,
  part TEXT NOT NULL,
  color TEXT NOT NULL,
  secondary_color TEXT,
  tags TEXT,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  created_at INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS wardrobe_job (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES user(id),
  status TEXT NOT NULL DEFAULT 'pending',
  original_image_url TEXT,
  analysis_result TEXT,
  error TEXT,
  created_at INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_wardrobe_item_user ON wardrobe_item(user_id);
CREATE INDEX idx_wardrobe_job_user ON wardrobe_job(user_id);
CREATE INDEX idx_wardrobe_job_status ON wardrobe_job(status);
```

### 第二阶段：后端 API 实现

#### 2.1 API 端点设计

**文件**: `server/api.ts`

```typescript
// Wardrobe API 路由组
api.post("/api/wardrobe/upload", async (c) => {
  // 1. 验证用户登录
  // 2. 接收图片文件 (multipart/form-data)
  // 3. 生成唯一任务 ID
  // 4. 将原始图片存入 R2 (wardrobe/{jobId}/original.png)
  // 5. 创建 wardrobe_job 记录
  // 6. 返回任务 ID
});

api.get("/api/wardrobe/jobs/:id", async (c) => {
  // 1. 获取任务状态
  // 2. 返回任务详情和分析结果
});

api.post("/api/wardrobe/jobs/:id/analyze", async (c) => {
  // 1. 从 R2 读取原始图片
  // 2. 调用 Llama Vision 分析图片
  // 3. 解析返回的 JSON 数据
  // 4. 更新任务状态和分析结果
  // 5. 返回分析结果
});

api.post("/api/wardrobe/jobs/:id/extract/:itemIndex", async (c) => {
  // 1. 获取分析结果中的特定服装项
  // 2. 使用 Canvas 裁剪原图 (基于边界框)
  // 3. 调用 FLUX 生成增强图片
  // 4. 将生成的图片存入 R2
  // 5. 创建 wardrobe_item 记录
  // 6. 返回服装项信息
});

api.get("/api/wardrobe/items", async (c) => {
  // 1. 获取用户的服装列表
  // 2. 支持分页和筛选
  // 3. 返回服装项列表
});

api.put("/api/wardrobe/items/:id", async (c) => {
  // 1. 更新服装信息 (名称、分类、标签等)
  // 2. 返回更新后的服装项
});

api.delete("/api/wardrobe/items/:id", async (c) => {
  // 1. 删除服装项
  // 2. 删除 R2 中的图片
  // 3. 返回删除成功
});
```

#### 2.2 AI 分析实现

**文件**: `server/wardrobe-ai.ts`

```typescript
// AI 模型配置
const VISION_MODEL = "@cf/meta/llama-3.2-11b-vision-instruct";
const IMAGE_MODEL = "@cf/black-forest-labs/flux-2-dev";

// 视觉分析提示词
const ANALYSIS_PROMPT = `Analyze this image and identify all clothing items. For each item, provide:
1. Name: A concise specific name (e.g., "Navy Blue Cardigan", "White Cotton T-Shirt")
2. Category: One of [upperbody, wholebody_up, lowerbody, accessories_up, shoes]
3. Primary color: Hex color code (e.g., #1a237e)
4. Secondary color: Hex color code if applicable, otherwise null
5. Tags: 1-4 descriptive lowercase tags (e.g., ["cotton", "casual", "v-neck"])
6. Bounding box: Coordinates normalized to 1000x1000 image
   - x: left edge (0-999)
   - y: top edge (0-999)
   - width: box width (1-1000)
   - height: box height (1-1000)

Return ONLY valid JSON with this exact structure:
{
  "items": [
    {
      "name": "string",
      "part": "string",
      "color": "#hex",
      "secondaryColor": "#hex or null",
      "tags": ["string"],
      "boundingBox": { "x": 0, "y": 0, "width": 1000, "height": 1000 }
    }
  ]
}

If no clothing items are found, return: {"items": []}`;

// 图像生成提示词
function buildGenerationPrompt(item: {
  name: string;
  part: string;
  color: string;
  tags: string[];
}): string {
  return `Generate a professional product photograph of a ${item.name}.
Category: ${item.part}
Color: ${item.color}
Features: ${item.tags.join(", ")}

Style requirements:
- Clean, neutral white or light gray background
- Professional studio lighting with soft shadows
- High quality e-commerce product photography
- Garment displayed flat or on invisible mannequin
- Accurate colors, textures, and details
- No text, watermarks, or branding
- Focus on the garment only`;
}

// 调用视觉分析
async function analyzeImage(env: { AI: Ai }, imageBuffer: ArrayBuffer): Promise<any[]> {
  const base64 = arrayBufferToBase64(imageBuffer);
  const imageDataUrl = `data:image/png;base64,${base64}`;

  const response = await env.AI.run(VISION_MODEL, {
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: ANALYSIS_PROMPT },
          { type: "image_url", image_url: { url: imageDataUrl } },
        ],
      },
    ],
    // Cloudflare AI 支持 JSON 模式
    response_format: { type: "json_object" },
  });

  // 解析响应
  const content = response.response || response.choices?.[0]?.message?.content;
  if (!content) throw new Error("No response from AI model");

  try {
    const parsed = JSON.parse(content);
    return parsed.items || [];
  } catch (e) {
    // 如果 JSON 解析失败，尝试从文本中提取 JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed.items || [];
    }
    throw new Error("Failed to parse AI response");
  }
}

// 调用图像生成
async function generateImage(env: { AI: Ai }, prompt: string): Promise<ArrayBuffer> {
  const response = await env.AI.run(IMAGE_MODEL, {
    prompt,
    num_steps: 20,
    guidance_scale: 7.5,
    width: 1024,
    height: 1024,
  });

  // Cloudflare AI 返回 base64 编码的图像
  if (response.image) {
    return base64ToArrayBuffer(response.image);
  }
  throw new Error("No image generated");
}
```

#### 2.3 图像处理工具函数

**文件**: `server/wardrobe-image.ts`

```typescript
// 在 Cloudflare Workers 中，我们不能使用 Sharp
// 需要使用浏览器端 Canvas 或 Cloudflare Image Resizing

// 边界框裁剪提示 (发送到前端)
export function getCropInstructions(boundingBox: {
  x: number;
  y: number;
  width: number;
  height: number;
}, imageWidth: number, imageHeight: number) {
  const padding = 0.08; // 8% padding
  const boxWidth = boundingBox.width / 1000;
  const boxHeight = boundingBox.height / 1000;
  const boxX = boundingBox.x / 1000;
  const boxY = boundingBox.y / 1000;

  const paddedX = Math.max(0, boxX - padding);
  const paddedY = Math.max(0, boxY - padding);
  const paddedWidth = Math.min(1 - paddedX, boxWidth + padding * 2);
  const paddedHeight = Math.min(1 - paddedY, boxHeight + padding * 2);

  return {
    x: Math.round(paddedX * imageWidth),
    y: Math.round(paddedY * imageHeight),
    width: Math.round(paddedWidth * imageWidth),
    height: Math.round(paddedHeight * imageHeight),
  };
}

// 前端 Canvas 裁剪函数 (在客户端执行)
export const CLIENT_CROP_FUNCTION = `
async function cropImage(imageUrl, cropArea) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = cropArea.width;
      canvas.height = cropArea.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(
        img,
        cropArea.x, cropArea.y, cropArea.width, cropArea.height,
        0, 0, cropArea.width, cropArea.height
      );
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to crop image'));
      }, 'image/png');
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageUrl;
  });
}
`;
```

### 第三阶段：前端实现

#### 3.1 路由文件

**文件**: `app/routes/wardrobe.tsx`

```typescript
import { useState, useEffect, useCallback } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "~/lib/auth-context";
import { AppNav } from "~/components/HomeHeader";
import { AppFooter } from "~/components/AppFooter";
import { UploadZone } from "~/components/wardrobe/UploadZone";
import { GarmentGrid } from "~/components/wardrobe/GarmentGrid";
import { ImportFlow } from "~/components/wardrobe/ImportFlow";

export const Route = createFileRoute("/wardrobe")({
  head: () => ({
    meta: [
      { title: "AI Wardrobe - 100mini" },
      { name: "description", content: "AI-powered clothing detection and organization" },
    ],
  }),
  component: WardrobePage,
});

function WardrobePage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [items, setItems] = useState([]);
  const [activeJob, setActiveJob] = useState(null);
  const [loading, setLoading] = useState(false);

  // 加载用户的服装列表
  useEffect(() => {
    if (user) {
      loadItems();
    }
  }, [user]);

  const loadItems = async () => {
    try {
      const response = await fetch("/api/wardrobe/items");
      if (response.ok) {
        const data = await response.json();
        setItems(data.items || []);
      }
    } catch (error) {
      console.error("Failed to load items:", error);
    }
  };

  const handleUpload = async (file: File) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/wardrobe/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setActiveJob(data.jobId);
        // 开始分析
        await analyzeJob(data.jobId);
      }
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeJob = async (jobId: string) => {
    try {
      const response = await fetch(`/api/wardrobe/jobs/${jobId}/analyze`, {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        // 更新任务状态
        setActiveJob({ ...activeJob, analysis: data.items });
      }
    } catch (error) {
      console.error("Analysis failed:", error);
    }
  };

  const handleExtract = async (jobId: string, itemIndex: number) => {
    try {
      const response = await fetch(`/api/wardrobe/jobs/${jobId}/extract/${itemIndex}`, {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        // 添加到服装列表
        setItems((prev) => [data.item, ...prev]);
        // 刷新任务状态
        setActiveJob(null);
      }
    } catch (error) {
      console.error("Extraction failed:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <AppNav />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">AI Wardrobe</h1>

        {/* 上传区域 */}
        <UploadZone onUpload={handleUpload} loading={loading} />

        {/* 导入流程 */}
        {activeJob && (
          <ImportFlow
            job={activeJob}
            onExtract={handleExtract}
            onClose={() => setActiveJob(null)}
          />
        )}

        {/* 服装画廊 */}
        <GarmentGrid items={items} />
      </main>
      <AppFooter />
    </div>
  );
}
```

#### 3.2 组件实现

**文件**: `app/components/wardrobe/UploadZone.tsx`

```typescript
import { useCallback, useState } from "react";
import { Upload, Image, Loader2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

interface UploadZoneProps {
  onUpload: (file: File) => Promise<void>;
  loading?: boolean;
}

export function UploadZone({ onUpload, loading }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) {
        onUpload(file);
      }
    },
    [onUpload]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onUpload(file);
      }
    },
    [onUpload]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      const items = e.clipboardData.items;
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) {
            onUpload(file);
            break;
          }
        }
      }
    },
    [onUpload]
  );

  return (
    <div
      className={cn(
        "border-2 border-dashed rounded-lg p-12 text-center transition-colors",
        isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25",
        loading && "opacity-50 pointer-events-none"
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onPaste={handlePaste}
      tabIndex={0}
    >
      {loading ? (
        <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin" />
      ) : (
        <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
      )}
      <p className="text-lg font-medium mb-2">
        {loading ? "Processing..." : "Drop, paste, or click to upload"}
      </p>
      <p className="text-sm text-muted-foreground mb-4">
        Upload a photo of clothing items to detect and organize
      </p>
      <Button variant="outline" disabled={loading}>
        <Image className="h-4 w-4 mr-2" />
        Choose Image
        <input
          type="file"
          accept="image/*"
          className="absolute inset-0 opacity-0 cursor-pointer"
          onChange={handleFileSelect}
          disabled={loading}
        />
      </Button>
    </div>
  );
}
```

**文件**: `app/components/wardrobe/ImportFlow.tsx`

```typescript
import { useState, useEffect } from "react";
import { Check, X, Loader2, RefreshCw } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";

interface ImportFlowProps {
  job: {
    id: string;
    status: string;
    analysis?: Array<{
      name: string;
      part: string;
      color: string;
      secondaryColor?: string;
      tags: string[];
      boundingBox: { x: number; y: number; width: number; height: number };
    }>;
  };
  onExtract: (jobId: string, itemIndex: number) => Promise<void>;
  onClose: () => void;
}

const PART_LABELS: Record<string, string> = {
  upperbody: "Tops",
  wholebody_up: "Jackets",
  lowerbody: "Bottoms",
  accessories_up: "Accessories",
  shoes: "Shoes",
};

export function ImportFlow({ job, onExtract, onClose }: ImportFlowProps) {
  const [extracting, setExtracting] = useState<number | null>(null);

  const handleExtract = async (index: number) => {
    setExtracting(index);
    try {
      await onExtract(job.id, index);
    } finally {
      setExtracting(null);
    }
  };

  if (!job.analysis || job.analysis.length === 0) {
    return (
      <Card className="mt-8">
        <CardContent className="p-6">
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Analyzing image...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Detected Clothing Items</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Found {job.analysis.length} items. Click "Extract" to add to your wardrobe.
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {job.analysis.map((item, index) => (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-medium">{item.name}</h3>
                    <Badge variant="secondary" className="mt-1">
                      {PART_LABELS[item.part] || item.part}
                    </Badge>
                  </div>
                  <div
                    className="w-8 h-8 rounded-full border-2 border-muted"
                    style={{ backgroundColor: item.color }}
                    title={item.color}
                  />
                </div>

                {item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {item.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => handleExtract(index)}
                  disabled={extracting === index}
                >
                  {extracting === index ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Extracting...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Extract
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
```

**文件**: `app/components/wardrobe/GarmentGrid.tsx`

```typescript
import { useState } from "react";
import { Edit2, Trash2, Tag } from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";

interface GarmentItem {
  id: string;
  name: string;
  part: string;
  color: string;
  secondaryColor?: string;
  tags: string[];
  imageUrl: string;
  thumbnailUrl?: string;
}

interface GarmentGridProps {
  items: GarmentItem[];
  onUpdate?: (id: string, updates: Partial<GarmentItem>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

const PART_LABELS: Record<string, string> = {
  upperbody: "Tops",
  wholebody_up: "Jackets",
  lowerbody: "Bottoms",
  accessories_up: "Accessories",
  shoes: "Shoes",
};

export function GarmentGrid({ items, onUpdate, onDelete }: GarmentGridProps) {
  const [editingItem, setEditingItem] = useState<GarmentItem | null>(null);
  const [editName, setEditName] = useState("");
  const [editPart, setEditPart] = useState("");
  const [editTags, setEditTags] = useState("");

  const handleEdit = (item: GarmentItem) => {
    setEditingItem(item);
    setEditName(item.name);
    setEditPart(item.part);
    setEditTags(item.tags.join(", "));
  };

  const handleSave = async () => {
    if (!editingItem || !onUpdate) return;

    await onUpdate(editingItem.id, {
      name: editName,
      part: editPart,
      tags: editTags.split(",").map((t) => t.trim()).filter(Boolean),
    });
    setEditingItem(null);
  };

  const handleDelete = async (id: string) => {
    if (!onDelete) return;
    if (confirm("Are you sure you want to delete this item?")) {
      await onDelete(id);
    }
  };

  if (items.length === 0) {
    return (
      <div className="mt-8 text-center py-12 text-muted-foreground">
        <Tag className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p className="text-lg">No clothing items yet</p>
        <p className="text-sm">Upload a photo to get started</p>
      </div>
    );
  }

  return (
    <>
      <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {items.map((item) => (
          <Card key={item.id} className="group overflow-hidden">
            <div className="aspect-square relative">
              <img
                src={item.thumbnailUrl || item.imageUrl}
                alt={item.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-8 w-8"
                  onClick={() => handleEdit(item)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="destructive"
                  className="h-8 w-8"
                  onClick={() => handleDelete(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <CardContent className="p-3">
              <h3 className="font-medium text-sm truncate">{item.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {PART_LABELS[item.part] || item.part}
                </Badge>
                <div
                  className="w-4 h-4 rounded-full border"
                  style={{ backgroundColor: item.color }}
                  title={item.color}
                />
              </div>
              {item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {item.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {item.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{item.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Clothing Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Item name"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Category</label>
              <select
                value={editPart}
                onChange={(e) => setEditPart(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                {Object.entries(PART_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Tags (comma-separated)</label>
              <Input
                value={editTags}
                onChange={(e) => setEditTags(e.target.value)}
                placeholder="tag1, tag2, tag3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingItem(null)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
```

### 第四阶段：测试和验证

#### 4.1 测试计划

1. **单元测试**
   - AI 提示词解析测试
   - 边界框计算测试
   - 数据验证测试

2. **集成测试**
   - 图片上传流程
   - AI 分析流程
   - 图像生成流程
   - 服装管理 CRUD

3. **端到端测试**
   - 完整导入流程
   - 画廊展示和编辑
   - 错误处理和恢复

#### 4.2 性能优化

1. **图片优化**
   - 上传前压缩
   - 生成缩略图
   - 使用 R2 缓存

2. **AI 调用优化**
   - 批量处理
   - 结果缓存
   - 错误重试

3. **前端优化**
   - 虚拟滚动
   - 懒加载图片
   - 状态管理优化

## 实施顺序

1. ✅ 配置 Cloudflare AI binding
2. ✅ 创建数据库表和迁移
3. ✅ 实现后端 API
4. ✅ 实现前端路由和组件
5. ✅ 集成 AI 分析功能
6. ✅ 实现图像生成功能
7. ✅ 测试和优化
8. ✅ 部署和验证

## 注意事项

1. **内存限制**: Cloudflare Workers 有 128MB 内存限制，大图片需要在前端处理
2. **超时限制**: Workers 有 CPU 时间限制，AI 调用可能需要异步处理
3. **成本控制**: Cloudflare AI 按 Neurons 计费，需要监控使用量
4. **错误处理**: AI 模型可能返回意外结果，需要健壮的错误处理
5. **用户体验**: 提供清晰的进度指示和错误反馈
