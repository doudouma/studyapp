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
shared/             # 前后端共享代码（物理隔离，唯一数据契约来源）
  types/            # DTO 类型 + 共享常量 (如 square.ts)
app/                # 前端代码 (TanStack Start)
  routes/           # 页面路由 (文件路由)
  components/       # 跨页面共享的 React 组件
    ui/             # shadcn/ui 基础组件
  features/         # 按业务功能组织的前端模块
    square/api.ts   # 该功能的 Hono RPC 类型化客户端
  lib/              # 全局工具函数、auth client/context、i18n
  styles/           # 全局 CSS
server/             # 服务端代码 (Cloudflare Worker)
  api.ts            # Hono 入口：中间件 + 挂载各 feature 路由，导出 AppType
  types.ts          # 服务端共享 Env 类型 (AppBindings/AppVariables/AppEnv)
  features/         # 按业务功能组织的后端模块，内部三层：
    square/         #   *.repo.ts     数据访问 (Drizzle，不感知 HTTP)
                    #   *.service.ts  业务逻辑 + DTO 转换
                    #   *.routes.ts   HTTP 边界 (参数解析/认证/响应映射)
  auth.ts           # better-auth 服务端配置
  db/               # Drizzle schema + client
drizzle/            # Drizzle Kit 迁移产物
```

### 路径别名

| 别名 | 指向 | 规则 |
|---|---|---|
| `~/`, `@/` | `app/` | 前端内部 |
| `@shared/*` | `shared/*` | 前后端均可运行时引用 |
| `@server/*` | `server/*` | **仅允许 `import type`**（类型擦除后不影响客户端 bundle；运行时 import 会把服务端依赖打进前端） |

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

- API 路由按业务功能拆分到 `server/features/<feature>/<feature>.routes.ts`，由 `server/api.ts` 统一挂载 (`api.route("/", featureRoutes)`)
- `server/api.ts` 仍承载未迁移的遗留路由与全局中间件/onError，新功能一律建 feature 模块
- `app/server.tsx` 中创建根 Hono app，挂载 API 路由；非 API 请求 fallback 到 TanStack SSR handler
- `api.ts` 导出 `AppType`，供前端 `hc<AppType>` 生成端到端类型安全的 RPC 客户端

### 前后端数据流 (Hono RPC)

- 前端每个 feature 在 `app/features/<feature>/api.ts` 中封装 `hc<AppType>()` 调用，页面/组件只依赖该模块，不直接 fetch
- 类型链路：`*.routes.ts` handler 返回值 → `AppType` → 前端 `res.json()` 自动推导；DTO 定义在 `shared/types/`
- SSR loader 中 RPC fetch 需要绝对 URL：`app/server.tsx` 已把请求 origin 写入 `globalThis.__SSR_ORIGIN__`
- **遗留限制**：SSR 自取 API 是同 isolate 内 fetch 自身 origin；公开只读接口无影响，迁移需要鉴权的接口时必须按请求透传 cookie（不得依赖 `__SSR_ORIGIN__` 全局变量）

## 状态管理

- **无外部状态库**（无 React Query、Zustand）
- Auth 状态: React Context
- 页面数据: route `loader` + `useLoaderData()` (TanStack Router)，loader 内经 `app/features/<feature>/api.ts` 取数
- 表单/UI 状态: 本地 `useState`

## 样式约定

- Tailwind CSS v4 (`@tailwindcss/vite` 插件)
- 暗色模式: `.dark` class on `<html>`
- 工具函数: `cn()` (clsx + tailwind-merge)
- UI 组件: shadcn/ui, 使用 `@base-ui/react` 原语

## LCP 性能优化

### 关键改动

| 页面 | 问题 | 修复 | 文件 |
|---|---|---|---|
| 首页 + 广场 | SSR 因 `authLoading` 输出空 HTML | 移除 `authLoading` 阻塞，SSR 直出完整内容 | `app/routes/index.tsx:333` |
| 全局 | Inter 字体发现晚，需等 CSS 解析后才下载 | `<link rel="preload">` 提前发现字体 | `app/routes/__root.tsx:42` |
| 广场 | 首屏缩略图被 `loading="lazy"` 降级 | 前 8 张无 `loading`，第 1 张 `fetchpriority="high"` | `app/components/SquareGrid.tsx:54-55` |
| 广场 | 缩略图浏览器缓存仅 24h | 改为 `max-age=31536000, immutable`（1 年） | `server/api.ts:845` |

### 原则

- **永不阻塞渲染**：auth 状态异步更新，不阻止首屏 paint
- **字体**：`font-display: swap` 确保 fallback 字体即时渲染，preload 减少 FOUT 窗口
- **图片**：首屏可见图片不使用 `loading="lazy"`，第 1 张加 `fetchpriority="high"` 提示
- **缓存**：ID 不变的资源（缩略图）用 `immutable` 长期缓存

## 临时文件清理

匿名上传的文件存储在 R2 `tmp/` 前缀下，7 天后自动销毁。

### 三路清理机制

| 方式 | 触发 | 位置 | 说明 |
|---|---|---|---|
| **定时清理** | cron `0 3 * * *` (每天 3:00 UTC) | `app/server.tsx:98` → `server/api.ts:121` | 全量扫描 `tmp/` 前缀，检查对象 `uploaded` 时间，删除超过 7 天的对象 |
| **惰性清理** | 用户访问过期页面时 | `server/api.ts:1048` | 访问过期 `tmp/` 页面时触发，删除后返回 404 |
| **手动清理** | `POST /api/admin/cleanup-tmp` | `server/api.ts:418` | 管理员手动触发，用于验证 |

### 关键逻辑

| 函数 | 位置 | 说明 |
|---|---|---|
| `isExpiredByUploaded()` | `server/api.ts:115` | 判断 `uploaded` 是否超过 7 天，无上传时间视为过期 |
| `cleanupAnonymousUploads()` | `server/api.ts:121` | 全量遍历 R2 `tmp/` 前缀，分页删除 |
| `deleteTmpByBucketId()` | `server/api.ts:141` | 按 `tmp/{id}` 前缀删除，同时处理 `tmp/{id}.html` 和 `tmp/{id}/...` 两种格式 |

### 存储约定

- **匿名单文件 HTML**: `tmp/{id}.html` + `customMetadata: { createdAt: String(Date.now()) }`
- **匿名 ZIP 上传**: `tmp/{id}/index.html` + `tmp/{id}/{assets}`，统一 `createdAt`
- **已登录用户**: 无 `tmp/` 前缀，D1 有记录，走 `expiresAt` 字段过期

## 构建与部署

| 命令 | 说明 |
|---|---|
| `npm run dev` | 本地开发 (Vite + TanStack Start) |
| `npm run build` | 生产构建 |
| `npm run deploy` | 构建 + wrangler 部署 |
| `npm run cf:preview` | Wrangler 本地预览 Worker |

## wrangler.toml 注意事项

### `[triggers]` 必须放在文件末尾

TOML 中 `[triggers]` 是一个 section 表头，其后的所有键值对都会被嵌套进 `[triggers]` 下，导致 `assets` 和 `routes` 等顶级配置丢失。

**错误示例**（`assets` 和 `routes` 被错误嵌套）：
```toml
[triggers]
crons = ["0 3 * * *"]

assets = { ... }   # 实际变成 triggers.assets
routes = [ ... ]   # 实际变成 triggers.routes
```

**正确做法**：`[triggers]` 放在文件末尾：
```toml
# ... 所有其他配置 ...

[triggers]
crons = ["0 3 * * *"]
```

### 静态资源 (ASSETS binding)

- `wrangler.toml` 中声明 `assets = { directory = "dist/client", binding = "ASSETS" }`
- Worker 中需要添加中间件通过 `env.ASSETS.fetch(c.req.raw)` 托管静态资源，否则 `/assets/*` 会返回 404
- 路径：`app/server.tsx` → `app.use("/assets/*", ...)` 中间件

**重要：提交代码、部署等操作必须由用户确认后才执行，AI 不得自动执行。**

## 日志规则

### 日志表

| 表名 | 用途 | 保留期 |
|---|---|---|
| `upload_log` | 上传记录 | 90 天 |
| `scan_log` | 审核记录 | 90 天 |

### upload_log 字段

| 字段 | 类型 | 说明 |
|---|---|---|
| id | INTEGER | 自增主键 |
| user_id | TEXT | 用户ID（匿名为空） |
| page_id | TEXT | 页面ID |
| event | TEXT | upload / delete / cleanup |
| content_type | TEXT | html / zip / thumbnail |
| is_anonymous | INTEGER | 0=用户 1=匿名 |
| ip | TEXT | 来源IP |
| file_size | INTEGER | 文件大小（字节） |
| status | TEXT | success / blocked |
| created_at | INTEGER | 时间戳（毫秒） |

### scan_log 字段

| 字段 | 类型 | 说明 |
|---|---|---|
| id | INTEGER | 自增主键 |
| page_id | TEXT | 页面ID |
| status | TEXT | approved / blocked / error |
| reason | TEXT | regex / phishing / ai |
| threats | TEXT | 威胁详情 JSON |
| html_length | INTEGER | HTML 大小 |
| is_anonymous | INTEGER | 0=用户 1=匿名 |
| created_at | INTEGER | 时间戳（毫秒） |

### 日志写入时机

| 事件 | 表 | status |
|---|---|---|
| 上传成功 | upload_log | success |
| 审核不通过（正则） | upload_log + scan_log | blocked |
| 审核不通过（钓鱼） | upload_log + scan_log | blocked |
| 审核不通过（AI） | upload_log + scan_log | blocked |
| 审核通过 | scan_log | approved |
| 审核异常 | scan_log | error |
| 删除页面 | upload_log | - |
| 清理过期 | upload_log | - |

### 定时清理

- Cron: `0 3 * * *` (每天 UTC 3:00)
- 逻辑: `DELETE FROM upload_log/scan_log WHERE created_at < (now - 90天)`
- 位置: `app/server.tsx` → `cleanupExpiredUploadLogs()`
