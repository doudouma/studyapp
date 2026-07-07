# 广场首访卡顿排查

## 现象

首次进入 `/square` 页面有明显卡顿/延迟，后续访问正常。

## 根因

**Worker 冷启动 + D1 cold query 叠加，并非代码逻辑 bug。**

- `/square` 是唯一在 SSR loader 中触发 D1 查询的页面（`createServerFn` → `SELECT ... FROM page LEFT JOIN user WHERE isSharedToSquare=true ORDER BY sharedAt DESC LIMIT 13`）
- 首次访问时：Worker 冷编译 JS bundle → Hono middleware 执行 → TanStack Start SSR 调用 route loader → D1 首次建立连接并执行查询 → React SSR 渲染 → stream HTML
- D1 的 LEFT JOIN + ORDER BY 在 cold query 场景下延迟明显
- 后续访问（Worker 热 + D1 连接池保留）则正常

## 为什么不可能是 iframe / 缩略图问题

- `PreviewCell` 使用 `<img src="/thumbnails/{id}">` 展示缩略图，iframe 仅作为 `onError` 降级机制
- 缩略图由 SnapDOM 在客户端生成：400×600 WebP, quality 0.5，文件体积较小
- 每个 `<img>` 带有 `loading="lazy"`
- `/thumbnails/:id` 响应设了 `Cache-Control: public, max-age=86400`

## 与其他页面对比

| 页面 | 路由 loader | D1 查询 | SSR 缓存 |
|---|---|---|---|
| `/` (首页) | 无 | 无 | 无 |
| `/square` | `createServerFn` → D1 (LEFT JOIN + LIMIT) | 有 | 无 |
| `/p/{id}` (独立页) | 直接读取 R2 | 无 (或单条查询) | 无 |

## 优化方向

### 方案 A：边缘缓存 SSR 响应（推荐）

在 `server.tsx` 中对 `/square` 路径设置 Cache-Control：

```ts
app.use("/square", async (c, next) => {
  await next();
  if (c.res.status === 200) {
    c.res.headers.set("Cache-Control", "public, s-maxage=5, stale-while-revalidate=600");
  }
});
```

- 冷启动时直接返回 CDN 缓存（最大 5 秒陈旧）
- `stale-while-revalidate` 确保后台异步刷新
- 增删改延迟约 5 秒

### 方案 B：缓存 D1 查询结果

用 Cloudflare Cache API 或 KV 缓存 `fetchSquareData` 返回数据，设置短 TTL，增删改时清除对应缓存 key。

### 方案 C：D1 查询优化

给 D1 表加复合索引 `(isSharedToSquare, sharedAt DESC)` 减少 cold query 耗时。

## 相关文件

- `app/routes/square.tsx` — 路由定义、`fetchSquareData` server function、`SquarePage` 组件
- `app/components/SquareGrid.tsx` — `SquareGrid` + `PreviewCell` 组件
- `app/server.tsx` — Hono + TanStack Start SSR handler
- `server/api.ts:816` — `/thumbnails/:id` 缩略图服务
- `app/lib/upload-flow.ts` — SnapDOM 缩略图生成
