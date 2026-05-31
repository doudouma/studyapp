# TanStack Start + Hono 全栈迁移设计

## 背景

项目当前架构 dev/prod 不一致：
- **开发模式**：Vite 前端 (5173) + Hono API (3000) 两个独立进程，通过 proxy 连接
- **生产模式**：Cloudflare Workers 单入口（`app/server.tsx` 中 URL 路径判断分别路由）

另外 SSR 输出的 HTML 缺少文档骨架（`<html>`、`<head>`、`<HeadContent />`、`<Scripts />`），导致 React 无法水合，页面纯静态，按钮永远灰色不可交互。

## 目标架构

单一入口，dev/prod 一致：

```
请求 → Hono App (外层路由器)
        ├── /api/* → Hono handler (文件上传)
        ├── /p/* → Hono handler (页面托管)
        ├── /robots.txt → Hono handler
        └── /* → TanStack Start SSR
```

## 改动清单

### 1. app/routes/__root.tsx — 添加 SSR 文档骨架

当前 `RootComponent` 只渲染 `<Outlet />`，缺乏 HTML 文档必需要素。

**原因**：TanStack Router SSR 模式下，组件树需要包含 `<HeadContent />`（渲染路由 `head()` 中的 meta/title/link）和 `<Scripts />`（注入水合脚本和序列化数据）。没有这些组件，React 不会发出流式 HTML 文档。

**改动**：添加 `<html>`、`<head>`、`<body>`、`<HeadContent />`、`<Scripts />`。

### 2. app/server.tsx — Hono 包裹 TanStack Start SSR

当前通过手动 `url.pathname.startsWith()` 判断路由。改为 Hono 作为外层路由器，API 路由直接走 Hono，其他路由兜底到 Start SSR。

**改动**：创建 Hono app，`app.route("/", api)` 挂载现有 API，`app.all("*")` 兜底到 Start SSR handler。

### 3. app.config.ts — 移除 proxy 配置

移除 `server.proxy`，因为 Hono API 和前端 SSR 在同一个进程中运行。

### 4. package.json — 简化开发脚本

- `dev` 脚本从 `concurrently` 改为单个 `vite dev --config app.config.ts`
- 移除 `concurrently`、`@hono/node-server`、`tsx` 依赖

### 5. server/dev.ts — 删除

不再需要独立的 Hono node server。

## 不变部分

- `server/api.ts` — Hono API 路由代码不动（已处理 `c.env.BUCKET` 降级到 S3 SDK）
- `wrangler.toml` — 入口不变 `dist/server/server.js`
- 前端 UI、样式、路由配置不变
- 数据存储（R2/S3）、已有分享链接不受影响

## 验证方式

1. `npm run dev` → 单进程启动，无 proxy
2. 首页加载完整 HTML（含 `<html><head>`），交互正常
3. 粘贴 HTML → 发布按钮可点击 → 上传成功
4. 访问 `/p/xxx` → 展示托管页面
5. `npm run build && npx wrangler dev` → Cloudflare Workers 正常
