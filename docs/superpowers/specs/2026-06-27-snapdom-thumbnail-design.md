# SnapDOM 缩略图生成方案

## 概述

在用户上传 HTML/ZIP 后，使用 SnapDOM（`@zumer/snapdom`）在客户端自动截图，生成 WebP 缩略图，存储到 R2，用于广场卡片预览展示，替代当前的 iframe 加载方案。

## 目标

- 上传后自动生成缩略图，无需用户额外操作
- 广场页面用 `<img>` 替代 `<iframe>`，大幅提升页面性能
- 缩略图失败时优雅降级回 iframe

## 架构

```
用户上传 HTML → 存入 R2 → 创建 DB 记录
    → 隐藏同源 iframe 渲染 /p/{id}
    → SnapDOM 截图 → WebP → POST /api/upload-thumbnail
    → 存入 R2 (thumbnails/{id}.webp) → 更新 DB preview_path → 完成

广场展示: 有缩略图 → <img> / 无缩略图 → <iframe> 降级
```

## 详细设计

### 1. 新增 API 端点

#### POST /api/upload-thumbnail

- 认证: 必需（登录用户）
- Content-Type: multipart/form-data
- Body: `{ pageId, thumbnail: File (WebP) }`
- 后端逻辑:
  1. 验证用户身份，确认 pageId 属于该用户
  2. 验证文件类型为 image/webp（Content-Type 检查）
  3. 保存到 R2: `thumbnails/${pageId}.webp`
  4. 更新 D1: `UPDATE page SET preview_path = ? WHERE id = ?`
  5. 响应: `{ success: true, previewPath: "thumbnails/{id}.webp" }`

#### GET /thumbnails/:id

- 从 R2 读取 `thumbnails/${id}.webp`
- 设置响应头 `Content-Type: image/webp` 和 `Cache-Control: public, max-age=86400`

### 2. 前端截图流程（upload-flow.ts）

在 `app/routes/index.tsx` 上传成功后触发，新建一个 `uploadFlow` 模块:

```
1. 上传成功，获得 pageId
2. 创建隐藏 iframe: <iframe src="/p/{id}" style="display:none" />
3. 监听 load 事件 + 600ms 延时确保渲染完成
4. SnapDOM 捕获:
   snapdom.toWebp(iframe.contentDocument.body, {
     width: 400,
     scale: 2,
     quality: 0.8,
     type: 'webp',
   })
5. Blob → File → FormData → POST /api/upload-thumbnail
6. 清理隐藏 iframe
7. 超时 8s / 失败 → 静默跳过（preview_path 保持 null）
```

### 3. 存储设计

**R2 bucket 结构**:
```
BUCKET:
├── {id}.html              # 已有的页面 HTML
└── thumbnails/
    └── {id}.webp          # 缩略图
```

**数据库**: 使用已有字段 `page.preview_path`，值为 `"thumbnails/{id}.webp"`

### 4. 缩略图规格

- 格式: WebP（质量 0.8）
- 尺寸: `{ width: 400, scale: 2 }` → 800px 宽的原图
- 展示: 通过 CSS 控制 `<img>` 展示尺寸，支持 Retina 屏

### 5. 前端组件变更

#### SquareGrid.tsx
```tsx
// 条件渲染
{item.previewPath ? (
  <img src={`/thumbnails/${item.id}`} loading="lazy"
       className="w-full h-40 object-cover rounded-t-lg" />
) : (
  <iframe src={`/p/${item.id}`} className="w-full h-40 ..." />
)}
```

#### SquareGrid 加载动画: 缩略图使用 `loading="lazy"` 配合 fade-in 过渡

### 6. 涉及文件

| 文件 | 变更 |
|------|------|
| `package.json` | 新增 `@zumer/snapdom` 依赖 |
| `server/api.ts` | 新增 `POST /api/upload-thumbnail`、`GET /thumbnails/:id` |
| `app/routes/index.tsx` | 上传成功后触发截图流程 |
| `app/lib/upload-flow.ts` | **新建** — 封装 SnapDOM 截图逻辑 |
| `app/components/SquareGrid.tsx` | iframe → 条件渲染 img |
| `app/components/SuccessCard.tsx` | 集成隐藏 iframe + 截图启动 |
| `server/r2.ts` | 确保已有 `uploadBuffer` 兼容方式写入 R2 |

### 7. 错误处理与降级

| 场景 | 行为 |
|------|------|
| iframe 加载超时 (>8s) | 跳过截图，preview_path=null |
| SnapDOM 截图失败 | catch 异常，静默跳过 |
| 缩略图上传 4xx/5xx | 日志记录，不阻塞用户 |
| 用户上传后立刻关闭页面 | 截图不执行，后续 iframe 降级 |
| 广场无缩略图 | 自动使用 iframe 展示 |

### 8. 非功能需求

- 截图过程完全不阻塞用户操作
- 不添加额外显式 UI 元素（截图提示仅在成功时轻量展示）
- 广场页面性能提升: N 个 iframe → N 个 img（首屏加载时间预计减少 60%+）
- 缩略图设置 `Cache-Control: max-age=86400`，CDN 缓存 1 天

## 不做的事情

- 不上传图片/PDF 等多类型文件（保持现有 HTML/ZIP 限定）
- 不为已有页面回溯生成缩略图（仅新上传的页面生成）
- 不使用外部截图服务（如 Puppeteer/URL2PNG）
- 不修改数据库 schema（使用已有的 `preview_path` 字段）
- 不修改用户管理后台
