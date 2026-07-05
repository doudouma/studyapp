# 100mini 项目约定

## 技术栈

| 层 | 技术 |
|---|---|
| 前端框架 | React 19 + TypeScript |
| 元框架 | TanStack Start (SSR on Cloudflare Workers) |
| 路由 | TanStack Router (文件路由 `app/routes/`) |
| API | Hono v4 (`server/api.ts`) |
| ORM | Drizzle ORM + Drizzle Kit |
| 数据库 | Cloudflare D1 (SQLite) |
| Auth | better-auth v1 + HTTP-only cookie |
| 文件存储 | Cloudflare R2 |
| 样式 | Tailwind CSS v4 + shadcn/ui (base-nova) |
| 图标 | lucide-react |
| 构建 | Vite v7 + esbuild |
| 部署 | `wrangler deploy` → Cloudflare Workers |

## 项目结构

```
app/               # 前端代码 (TanStack Start)
  routes/           # 页面路由 (文件路由)
  components/       # React 组件
    ui/             # shadcn/ui 基础组件
  lib/              # 工具函数、auth client/context
  styles/           # 全局 CSS
server/             # 服务端代码 (Cloudflare Worker)
  api.ts            # 所有 API 路由 (Hono)
  auth.ts           # better-auth 服务端配置
  db/               # Drizzle schema + client
drizzle/            # Drizzle Kit 迁移产物
```

## Auth 流程

- **AuthProvider** (`app/lib/auth-context.tsx`) 在 `__root.tsx` 包裹全局
- 初始化时调用 `authClient.getSession()` 获取用户 session，同时请求 `/api/me` 获取 membership 状态
- Auth context 提供: `{ user, authLoading, refreshAuth, isMember, membershipExpiresAt }`
- 组件通过 `useAuth()` 消费，不再单独请求 `/api/me`
- 登录/注册/登出使用 `authClient.signIn.email()` / `signUp.email()` / `signOut()`
- Session 由 HTTP-only cookie 管理，无需前端手动存 token

### API 认证中间件

所有 `/api/*` 请求（除 `/api/auth/*`）经过 session 中间件，自动从 cookie 解析 user/session 并注入 Hono context (`c.get("user")`)。

## API 模式

- 所有 API 路由集中定义在 `server/api.ts`，导出 Hono 实例
- `app/server.tsx` 中创建根 Hono app，挂载 API 路由
- 非 API 请求 fallback 到 TanStack SSR handler

## 状态管理

- **无外部状态库**（无 React Query、Zustand）
- Auth 状态: React Context
- 页面数据: `createServerFn()` + `useLoaderData()` (TanStack Router)
- 表单/UI 状态: 本地 `useState`

## 样式约定

- Tailwind CSS v4 (`@tailwindcss/vite` 插件)
- 暗色模式: `.dark` class on `<html>`
- 工具函数: `cn()` (clsx + tailwind-merge)
- UI 组件: shadcn/ui, 使用 `@base-ui/react` 原语

## 构建与部署

| 命令 | 说明 |
|---|---|
| `npm run dev` | 本地开发 (Vite + TanStack Start) |
| `npm run build` | 生产构建 |
| `npm run deploy` | 构建 + wrangler 部署 |
| `npm run cf:preview` | Wrangler 本地预览 Worker |
