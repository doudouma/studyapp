# 上传页面支持自定义地址（/p/自定义名），扣 10 积分

## Context

当前上传页面的地址是 `/p/{nanoid(7)}` 随机 ID（`createUpload` 生成，`serveUserPage` 只匹配 7 位 ID）。用户希望上传时可以自定义地址（如 `/p/my-page`），且自定义需扣积分。

已与用户确认的规则：
- URL 形式：`/p/自定义名`（保持 /p 前缀，R2 存储仍用原 nanoid id 作 key，slug 仅是别名映射）
- 价格：**10 积分/次**（新常量 `POINTS_PER_CUSTOM_SLUG = 10`）
- 会员与非会员**一样扣积分**
- 仅登录用户可用（匿名无积分体系；匿名请求带 customSlug 直接忽略）

## 实现步骤

### 1. shared/types/pages.ts — 常量 + 校验 + 费用模型

- 新增 `POINTS_PER_CUSTOM_SLUG = 10`
- 新增 slug 规则常量与纯函数（前后端共用，保证前端实时校验与服务端一致）：
  - `CUSTOM_SLUG_MIN = 3`、`CUSTOM_SLUG_MAX = 30`
  - 格式：`^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$`（小写字母/数字/连字符，首尾必须字母数字）
  - `RESERVED_SLUGS`：顶层路由保留字（md2html、any2md、freetool、showcase、square、rhythm、pomodoro、petsafe、petbadge、papercut、view、idphoto、wardrobe、admin、links、terms、privacy、cookie、contact）+ 系统路径（api、auth、assets、p、thumbnails、tmp、sitemap、robots）+ 语言前缀（zh、en、es、pt、fr）
  - `validateCustomSlug(slug): "ok" | "length" | "invalid" | "reserved"`
- 扩展费用模型：
  - `UploadFeeContext` 增加 `customSlug?: boolean`
  - `UploadFeeBreakdown` 增加 `slugFee`
  - `computeUploadFees`：`slugFee = customSlug ? POINTS_PER_CUSTOM_SLUG : 0`（匿名恒为 0），计入 totalFee 与 affordable

### 2. 数据库 — page 表加 slug 列

- [server/db/schema.ts](server/db/schema.ts) `page` 表新增 `slug: text("slug")`（可空；SQLite 唯一索引允许多个 NULL，存量页面不受影响）
- 运行 `npx drizzle-kit generate` 生成迁移 SQL（`ALTER TABLE page ADD COLUMN slug TEXT` + `CREATE UNIQUE INDEX`）

### 3. server/features/pages/pages.repo.ts — slug 查询

- `getPageIdBySlug(d1, slug)`：按 slug 查 id，不存在返回 null
- `slugExists(d1, slug)`：可用性检查用

### 4. server/features/pages/pages.service.ts — 核心逻辑

**createUpload**（[pages.service.ts:331](server/features/pages/pages.service.ts#L331)）：
- `CreateUploadInput` 增加 `customSlug?: string`
- 仅登录用户处理：trim + 小写化 → `validateCustomSlug` 不通过抛 400（带原因）；`slugExists` 已占用抛 409
- 费用计算传入 `customSlug: !!slug`，积分不足错误信息中体现自定义地址费
- `insertPageRecord` 增加 slug 字段；捕获 UNIQUE 约束冲突（check 与 insert 之间的并发竞态）转为 409 "地址已被占用"
- 落库成功后 `deductPoints(d1, user.id, fees.slugFee)`（复用现有扣分函数 [pages.repo.ts:55](server/features/pages/pages.repo.ts#L55)）
- 返回 `url: slug ? \`/p/${slug}\` : \`/p/${id}\``

**serveUserPage**（[pages.service.ts:632](server/features/pages/pages.service.ts#L632)）：
- 现有正则 `^([a-zA-Z0-9_-]{7})(?:\/(.*))?$` 只认 7 位 ID。重构：将"按 id 服务"逻辑抽为内部辅助函数，解析顺序：
  1. 首段匹配 7 位 ID 形态 → 先按现有逻辑尝试（兼容存量页面与匿名 tmp 页面——匿名页无 D1 记录）
  2. 若未命中（404）→ 用 `getPageIdBySlug` 尝试 slug 解析 → 用解析出的真实 id 走同一服务逻辑（HTML、资产、SEO 注入、浏览量都正常工作）
  3. 非 7 位形态 → 直接 slug 解析，失败返回 404

### 5. server/features/pages/pages.routes.ts — 路由

- `POST /api/upload`：从 body 读取 `customSlug` 传入 `createUpload`（[pages.routes.ts:186](server/features/pages/pages.routes.ts#L186)）
- 新增 `GET /api/slug/available?slug=xxx`：返回 `{ available, reason? }`（reason: invalid/reserved/taken/length），供前端实时校验

### 6. 前端 — 表单 + API 客户端

**app/features/pages/api.ts**：新增 `checkSlugAvailable(slug)`（Hono RPC，自动获得类型）

**app/routes/index.tsx**（上传表单，登录用户可见）：
- 新增 slug 输入框（置于标题下方），输入自动小写化，前缀展示 `域名/p/`
- 防抖 400ms 调用可用性检查，状态提示：可用/已占用/格式错误/保留字
- `computeUploadFees` 传入 `customSlug`，费用展示与积分确认弹窗（totalFee）自动包含 slug 费用，无需额外改动确认流程
- `canSubmit`：slug 非空时必须为 available 状态才可提交
- FormData 追加 `customSlug`；`handleReset` 清空

**i18n（5 个语言文件）**：app/lib/locales/{zh,en,es,pt,fr}.json 增加 `home.form.slug*` 相关键（label、placeholder、checking、available、taken、invalid、reserved、feeHint），文案按各语言原生书写

### 7. 测试

- tests/points.spec.ts：`computeUploadFees` 新增 slugFee 用例（登录带/不带 slug、匿名、积分不足）
- tests/pages-upload.spec.ts：createUpload slug 用例（成功落库+扣 10 分+url 返回 /p/{slug}、格式非法 400、保留字 400、已占用 409、匿名忽略 slug）；serveUserPage 按 slug 访问 HTML 与资产用例

## 不在本次范围

- 已有页面后续修改/删除 slug（当前仅上传时设置）
- "我的页面"列表展示 slug

## 验证

1. `npx drizzle-kit generate` 生成迁移后：`npx wrangler d1 migrations apply studypage --local`（本地），远程部署前需用户确认执行远程迁移
2. `npx vitest run tests/points.spec.ts tests/pages-upload.spec.ts` 单测通过
3. `npm run dev` 手动验证：登录 → 上传时填自定义地址 → 观察可用性提示与积分扣减（50 → 40）→ 访问 `/p/自定义名` 正常渲染；用原 `/p/{id}` 访问仍正常；未填 slug 走原流程；匿名上传无 slug 输入框
4. 保留字/已占用/非法格式输入均被拦截

## 部署提醒（需用户确认后执行）

- 远程 D1 迁移必须在 `npm run deploy` 之前应用：`npx wrangler d1 migrations apply studypage --remote`，否则线上写入 slug 列会静默失败
