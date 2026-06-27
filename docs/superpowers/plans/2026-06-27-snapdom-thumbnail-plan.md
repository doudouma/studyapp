# SnapDOM 缩略图生成实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 用户上传 HTML/ZIP 后，在客户端用 SnapDOM 自动生成缩略图并存入 R2，广场页面用 `<img>` 替代 `<iframe>` 展示预览。

**Architecture:** 上传成功后 → 隐藏同源 iframe 加载 `/p/{id}` → SnapDOM 截图 → WebP 上传到 R2 → 更新 DB 的 `preview_path` → 广场展示时条件渲染 `<img>` 或 `<iframe>` 降级。

**Tech Stack:** `@zumer/snapdom`, Cloudflare R2, D1, Hono, React 19

---

### Task 1: 安装依赖

**Files:**
- Modify: `package.json`

- [ ] **Step 1: 安装 @zumer/snapdom**

Run: `pnpm add @zumer/snapdom`

Expected: 依赖添加到 `package.json` 和 `pnpm-lock.yaml`

### Task 2: 新增缩略图上传/读取 API 端点

**Files:**
- Modify: `server/api.ts`

- [ ] **Step 1: 在 `server/api.ts` 中新增 POST /api/upload-thumbnail 端点**

在 `api.post("/api/upload", ...)` 后面（约第 487 行之后）添加：

```typescript
// Upload thumbnail for a page
api.post("/api/upload-thumbnail", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "未登录" }, 401);

  const body = await c.req.parseBody();
  const pageId = body.pageId as string;
  const thumbnail = body.thumbnail as File | null;

  if (!pageId || !thumbnail) {
    return c.json({ error: "缺少参数" }, 400);
  }

  // Validate image type
  if (!thumbnail.type.startsWith("image/")) {
    return c.json({ error: "仅支持图片文件" }, 400);
  }

  // Validate page ownership
  const db = createDb(c.env.D1);
  const existing = await db
    .select()
    .from(page)
    .where(and(eq(page.id, pageId), eq(page.userId, user.id)))
    .limit(1);
  if (existing.length === 0) {
    return c.json({ error: "页面不存在" }, 404);
  }

  // Upload thumbnail to R2
  const key = `thumbnails/${pageId}.webp`;
  const buffer = await thumbnail.arrayBuffer();

  if (c.env?.BUCKET) {
    await c.env.BUCKET.put(key, buffer, {
      httpMetadata: { contentType: "image/webp" },
    });
  } else {
    const { PutObjectCommand } = await import("@aws-sdk/client-s3");
    const r2 = await getR2();
    await r2.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: new Uint8Array(buffer),
        ContentType: "image/webp",
      })
    );
  }

  // Update DB
  await db.update(page).set({ previewPath: key }).where(eq(page.id, pageId));

  return c.json({ success: true, previewPath: key });
});
```

- [ ] **Step 2: 新增 GET /thumbnails/:id 端点**

在 `POST /api/upload-thumbnail` 端点之后添加：

```typescript
// Serve thumbnail
api.get("/thumbnails/:id", async (c) => {
  const id = c.req.param("id");
  if (!/^[a-zA-Z0-9_-]{7}$/.test(id)) {
    return c.json({ error: "invalid id" }, 404);
  }

  const key = `thumbnails/${id}.webp`;

  if (c.env?.BUCKET) {
    const obj = await c.env.BUCKET.get(key);
    if (!obj) return c.json({ error: "not found" }, 404);
    const headers = new Headers();
    headers.set("Content-Type", "image/webp");
    headers.set("Cache-Control", "public, max-age=86400");
    return new Response(obj.body, { headers });
  } else {
    try {
      const { GetObjectCommand } = await import("@aws-sdk/client-s3");
      const r2 = await getR2();
      const res = await r2.send(
        new GetObjectCommand({ Bucket: BUCKET, Key: key })
      );
      const headers = new Headers();
      headers.set("Content-Type", "image/webp");
      headers.set("Cache-Control", "public, max-age=86400");
      return new Response(res.Body as ReadableStream, { headers });
    } catch {
      return c.json({ error: "not found" }, 404);
    }
  }
});
```

- [ ] **Step 3: 验证编译通过**

```bash
pnpm run check-types
```

Expected: 类型检查通过，无报错

- [ ] **Step 4: Commit**

```bash
git add server/api.ts
git commit -m "feat: add thumbnail upload and serve endpoints"
```

### Task 3: API 返回 previewPath 字段

**Files:**
- Modify: `server/api.ts`

- [ ] **Step 1: 修改 `/api/square` 查询，返回 `previewPath`**

找到 `/api/square` 的 `select` 调用（约第 514-527 行），在 `select({...})` 中增加 `previewPath: page.previewPath`：

```typescript
const items = await db
  .select({
    id: page.id,
    title: page.title,
    category: page.category,
    tags: page.tags,
    viewCount: page.viewCount,
    sharedAt: page.sharedAt,
    previewPath: page.previewPath,   // ← 新增
    userName: user.name,
    userImage: user.image,
  })
  .from(page)
  .leftJoin(user, eq(page.userId, user.id))
  .where(eq(page.isSharedToSquare, true))
  .orderBy(desc(page.sharedAt));
```

- [ ] **Step 2: 修改 `/api/pages` 查询，返回 `previewPath`**

找到 `/api/pages` 的 `select` 调用（约第 323-334 行），增加 `previewPath: page.previewPath`：

```typescript
const pages = await db
  .select({
    id: page.id,
    title: page.title,
    category: page.category,
    isPermanent: page.isPermanent,
    viewCount: page.viewCount,
    createdAt: page.createdAt,
    expiresAt: page.expiresAt,
    previewPath: page.previewPath,   // ← 新增
  })
  .from(page)
  .where(eq(page.userId, user.id))
  .orderBy(desc(page.createdAt));
```

- [ ] **Step 3: 修改 `/api/upload` 响应，返回 `previewPath`**

找到上传响应（约第 479-486 行），在返回对象中增加 `previewPath: null`：

```typescript
return c.json({
  id,
  url: `/p/${id}`,
  expiresAt: expiresAt?.toISOString() ?? null,
  isPermanent,
  title,
  isSharedToSquare: shareToSquare,
  previewPath: null,  // ← 新增，缩略图稍后异步生成
});
```

- [ ] **Step 4: 类型检查**

```bash
pnpm run check-types
```

Expected: 通过

- [ ] **Step 5: Commit**

```bash
git add server/api.ts
git commit -m "feat: include previewPath in API responses"
```

### Task 4: 创建前端截图模块 upload-flow.ts

**Files:**
- Create: `app/lib/upload-flow.ts`

- [ ] **Step 1: 创建 upload-flow.ts 文件**

```typescript
import { snapdom } from "@zumer/snapdom";

const THUMBNAIL_WIDTH = 400;
const THUMBNAIL_SCALE = 2;
const QUALITY = 0.8;
const TIMEOUT_MS = 8000;

/**
 * Set up thumbnail capture after upload.
 * Creates a hidden iframe to render the page, captures with SnapDOM,
 * then uploads the WebP to the server.
 */
export async function captureAndUploadThumbnail(pageId: string) {
  const iframe = document.createElement("iframe");
  iframe.src = `/p/${pageId}`;
  iframe.style.display = "none";
  document.body.appendChild(iframe);

  const timeoutId = setTimeout(() => {
    cleanup(iframe);
  }, TIMEOUT_MS);

  return new Promise<void>((resolve) => {
    iframe.addEventListener("load", async () => {
      clearTimeout(timeoutId);

      // Wait a bit for styles/fonts to settle
      await delay(600);

      try {
        const doc = iframe.contentDocument;
        if (!doc || !doc.body) {
          resolve();
          return;
        }

        const blob = await snapdom.toWebp(doc.body, {
          width: THUMBNAIL_WIDTH,
          scale: THUMBNAIL_SCALE,
          quality: QUALITY,
        });

        await uploadThumbnail(pageId, blob);
      } catch {
        // Silently fail — thumbnail is optional
      } finally {
        cleanup(iframe);
        resolve();
      }
    });
  });
}

function cleanup(iframe: HTMLIFrameElement) {
  if (iframe.parentNode) {
    iframe.parentNode.removeChild(iframe);
  }
}

async function uploadThumbnail(pageId: string, blob: Blob) {
  const formData = new FormData();
  formData.append("pageId", pageId);
  formData.append("thumbnail", blob, `${pageId}.webp`);

  const res = await fetch("/api/upload-thumbnail", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    console.warn("Thumbnail upload failed:", await res.text());
  }
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
```

- [ ] **Step 2: 类型检查**

```bash
pnpm run check-types
```

Expected: 通过

- [ ] **Step 3: Commit**

```bash
git add app/lib/upload-flow.ts
git commit -m "feat: add client-side SnapDOM thumbnail capture module"
```

### Task 5: 在 SuccessCard 中集成缩略图生成

**Files:**
- Modify: `app/components/SuccessCard.tsx`
- Modify: `app/routes/index.tsx`

- [ ] **Step 1: 修改 SuccessCard，接受 pageId 并触发截图**

```typescript
import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { CheckCircle2, ExternalLink, ImageIcon } from "lucide-react";
import { captureAndUploadThumbnail } from "~/lib/upload-flow";

interface SuccessCardProps {
  url: string;
  expiresAt?: string;
  isPermanent?: boolean;
  pageId: string;           // ← 新增
  onReset: () => void;
}

export function SuccessCard({ url, expiresAt, isPermanent, pageId, onReset }: SuccessCardProps) {
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [thumbnailReady, setThumbnailReady] = useState(false);
  const [thumbnailFailed, setThumbnailFailed] = useState(false);
  const capturedRef = useRef(false);

  const fullUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${url}`
      : url;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement("input");
      input.value = fullUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  useEffect(() => {
    import("qrcode/lib/browser.js").then((QRCode) => {
      QRCode.toString(fullUrl, { type: "svg", width: 160, margin: 2 }).then(
        setQrDataUrl
      );
    });
  }, [fullUrl]);

  // Trigger thumbnail capture on mount (once)
  useEffect(() => {
    if (capturedRef.current) return;
    capturedRef.current = true;

    captureAndUploadThumbnail(pageId)
      .then(() => setThumbnailReady(true))
      .catch(() => setThumbnailFailed(true));
  }, [pageId]);

  const expiryDate = expiresAt ? new Date(expiresAt).toLocaleString("zh-CN", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }) : null;

  return (
    <Card className="w-full max-w-md text-center">
      <CardContent className="flex flex-col items-center gap-4 pt-8 pb-8">
        <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <CheckCircle2 className="size-8" />
        </div>
        <h2 className="text-xl font-bold text-foreground">发布成功！</h2>
        <p className="text-sm text-muted-foreground">
          {isPermanent ? "永久保留" : `将于 ${expiryDate} 后自动销毁`}
        </p>

        {/* Thumbnail status */}
        {!thumbnailReady && !thumbnailFailed && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="size-3 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
            正在生成缩略图...
          </div>
        )}
        {thumbnailReady && (
          <div className="flex items-center gap-1.5 text-xs text-green-600">
            <ImageIcon className="size-3.5" />
            缩略图已生成
          </div>
        )}
        {thumbnailFailed && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            缩略图生成失败，使用默认预览
          </div>
        )}

        {qrDataUrl && (
          <div className="size-40 rounded-xl border border-border bg-white flex items-center justify-center overflow-hidden">
            <div
              className="[&>svg]:block"
              dangerouslySetInnerHTML={{ __html: qrDataUrl }}
            />
          </div>
        )}

        <div className="flex w-full gap-2">
          <input
            className={cn(
              "flex-1 rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm font-mono text-foreground outline-none",
              "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            )}
            value={fullUrl}
            readOnly
            onClick={(e) => (e.target as HTMLInputElement).select()}
          />
          <Button onClick={handleCopy} className="shrink-0">
            {copied ? "已复制 ✓" : "复制链接"}
          </Button>
        </div>

        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
        >
          预览页面 <ExternalLink className="size-3.5" />
        </a>

        <Button variant="outline" onClick={onReset} className="mt-2">
          继续发布
        </Button>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: 修改 index.tsx 的 HandleSubmit，传递 pageId 给 SuccessCard**

找到 `if (result)` 渲染区域（约第 125-139 行），将 SuccessCard 调用增加 `pageId` 属性：

```typescript
if (result) {
  return (
    <div className="flex min-h-screen flex-col">
      <AppNav user={user} />
      <main className="flex flex-1 flex-col items-center justify-center p-8">
        <SuccessCard
          url={result.url}
          expiresAt={result.expiresAt || undefined}
          isPermanent={result.isPermanent}
          pageId={result.id!}       // ← 新增
          onReset={handleReset}
        />
      </main>
      <AppFooter />
    </div>
  );
}
```

- [ ] **Step 3: 类型检查**

```bash
pnpm run check-types
```

Expected: 通过

- [ ] **Step 4: Commit**

```bash
git add app/components/SuccessCard.tsx app/routes/index.tsx
git commit -m "feat: integrate SnapDOM thumbnail capture after upload"
```

### Task 6: 改造 SquareGrid 支持缩略图

**Files:**
- Modify: `app/components/SquareGrid.tsx`
- Modify: `app/routes/square.tsx`

- [ ] **Step 1: 修改 SquareItem 接口增加 previewPath**

```typescript
interface SquareItem {
  id: string;
  title: string;
  category: string;
  tags: string;
  viewCount: number;
  sharedAt: number;
  userName: string | null;
  userImage: string | null;
  previewPath: string | null;  // ← 新增
}
```

- [ ] **Step 2: 改造 iframe 区域为条件渲染**

将原先的 iframe 区域（约第 72-79 行）：

```typescript
<div className="relative" style={{ aspectRatio: "3/4" }}>
  <iframe
    src={`/p/${item.id}`}
    className="absolute inset-0 w-full h-full pointer-events-none"
    sandbox="allow-scripts"
    title={item.title}
    loading="lazy"
  />
  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4 z-10">
    <span className="flex items-center gap-2 text-sm font-medium text-white">
      <Eye className="size-4" />
      查看页面
    </span>
  </div>
</div>
```

替换为：

```typescript
<div className="relative overflow-hidden bg-muted" style={{ aspectRatio: "3/4" }}>
  {item.previewPath ? (
    <img
      src={`/thumbnails/${item.id}`}
      alt={item.title}
      className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      loading="lazy"
    />
  ) : (
    <iframe
      src={`/p/${item.id}`}
      className="absolute inset-0 w-full h-full pointer-events-none"
      sandbox="allow-scripts"
      title={item.title}
      loading="lazy"
    />
  )}
  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4 z-10">
    <span className="flex items-center gap-2 text-sm font-medium text-white">
      <Eye className="size-4" />
      查看页面
    </span>
  </div>
</div>
```

- [ ] **Step 3: 修改 square.tsx 的 SquareItem 接口**

```typescript
interface SquareItem {
  id: string;
  title: string;
  category: string;
  tags: string;
  viewCount: number;
  sharedAt: number;
  userName: string | null;
  userImage: string | null;
  previewPath: string | null;  // ← 新增
}
```

- [ ] **Step 4: 类型检查**

```bash
pnpm run check-types
```

Expected: 通过

- [ ] **Step 5: Commit**

```bash
git add app/components/SquareGrid.tsx app/routes/square.tsx
git commit -m "feat: show thumbnail images in SquareGrid with iframe fallback"
```

### Task 7: 删除页面时也删除缩略图

**Files:**
- Modify: `server/api.ts`

- [ ] **Step 1: 在删除页面 API 中同时删除缩略图**

找到 `DELETE /api/pages/:id`（约第 351 行）和 `DELETE /api/admin/pages/:id`（约第 290 行），在删除 HTML 文件后添加缩略图删除逻辑。

在 `DELETE /api/pages/:id` 中，`await putToStorage(c, `${pageId}.html`, "");` 之后添加：

```typescript
// Delete thumbnail if exists
if (c.env?.BUCKET) {
  await c.env.BUCKET.delete(`thumbnails/${pageId}.webp`);
}
```

在 `DELETE /api/admin/pages/:id` 中，同样在删除 HTML 后添加：

```typescript
// Delete thumbnail if exists
if (c.env?.BUCKET) {
  await c.env.BUCKET.delete(`thumbnails/${pageId}.webp`);
}
```

- [ ] **Step 2: 类型检查**

```bash
pnpm run check-types
```

Expected: 通过

- [ ] **Step 3: Commit**

```bash
git add server/api.ts
git commit -m "fix: delete thumbnail when page is deleted"
```

### Task 8: 集成验证 — 观察完整流程

- [ ] **Step 1: 启动开发服务器**

```bash
pnpm run dev
```

Expected: 服务器启动成功

- [ ] **Step 2: 登录后上传一个 HTML**

在浏览器中打开首页并登录，粘贴 HTML 代码并发布。

Expected:
1. 上传成功，显示 SuccessCard
2. 出现"正在生成缩略图..."加载提示
3. 几秒后变为"缩略图已生成" ✓
4. 广场页面卡片展示缩略图图片（而非 iframe）

- [ ] **Step 3: 验证缩略图 URL 可访问**

打开浏览器开发者工具，查看 `/thumbnails/{id}` 返回 WebP 图片（状态 200，Content-Type: image/webp）。

- [ ] **Step 4: 验证删除时缩略图同时被清理**

在"我的链接"中删除页面，确认 R2 中的 `thumbnails/{id}.webp` 也被删除。

### Task 9 （可选）: 缩略图状态持久化 — 刷新 SuccessCard 后展示

**这一步是为了让用户在 SuccessCard 页面刷新后，也能看到缩略图生成状态。如果用户不关心可以跳过。**

- [ ] **Step 1: 修改 `/api/me` 或上传响应返回已生成的 previewPath**

目前上传时 previewPath 为 null，因为截图是异步的。如果需要刷新后展示状态，要么获取预览页面数据（GET /api/pages 已有 previewPath），要么不作处理（当前方案不影响使用，因为广场页面会实时读取 previewPath）。
