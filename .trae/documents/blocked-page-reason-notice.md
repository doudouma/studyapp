# 用户侧告知 Block 原因

## Context

上传的 HTML 页面被后台安全扫描（regex / 钓鱼 / AI）block 后会被静默删除（[pages.service.ts:501-555](server/features/pages/pages.service.ts)），访问 `/p/{id}` 只看到通用 404「页面不存在或已过期」。用户（上传者与分享接收者）无从得知页面是被下架的、更不知道原因。

目标：访问被 block 的 URL 时，显示「页面因违规已下架」+ 原因（**类别 + 简要细节**，已与用户确认）：
- regex → 显示命中的被禁标签名（如 iframe、object）
- phishing → 仅类别文案，不展示域名/关键词细节
- ai → 仅类别文案，不展示 verdict 原文

## 现状关键发现

- `scan_log` 表在 AGENTS.md 日志规则中已约定、admin 清理逻辑（`deleteOldScanLogs`）和 i18n 文案已存在，但 **表和写入从未实现** —— 本次补齐
- `insertUploadLog` 位于 `server/features/admin/upload-log.repo.ts`，被 pages feature 跨模块引用，scan_log 的 repo 函数放同一文件
- `serveUserPage` 主 HTML miss 分支在 [pages.service.ts:670-672](server/features/pages/pages.service.ts)，404 页由 [pages.render.ts notFoundHtml](server/features/pages/pages.render.ts) 渲染（5 语言、内联样式、noindex）

## 实施步骤

### 1. D1 迁移：新建 scan_log 表

- 新建 `drizzle/0011_scan_log.sql`（仿 `0008_user_points.sql` 风格），字段按 AGENTS.md 约定：
  `id INTEGER PK AUTOINCREMENT, page_id TEXT NOT NULL, status TEXT NOT NULL (approved/blocked/error), reason TEXT (regex/phishing/ai), threats TEXT (JSON), html_length INTEGER, is_anonymous INTEGER, created_at INTEGER (毫秒)`
  + 索引 `idx_scan_log_page ON scan_log(page_id)`、`idx_scan_log_time ON scan_log(created_at)`
- [server/db/schema.ts](server/db/schema.ts) 末尾追加 `scanLog` 表定义（仿 `uploadLog`，:160-175），保持 Drizzle schema 同步

### 2. Repo：`server/features/admin/upload-log.repo.ts`

- `insertScanLog(d1, entry)`：仿 `insertUploadLog`（:33-52），raw SQL 插入、吞错只记 `log.error`
- `getLatestBlockedScan(d1, pageId): Promise<{ reason: string; labels: string[] } | null>`
  - `SELECT reason, threats FROM scan_log WHERE page_id = ? AND status = 'blocked' ORDER BY created_at DESC LIMIT 1`
  - reason 为 `regex` 时解析 threats JSON 提取 `label` 数组；其他 reason 返回空 labels（不向用户暴露细节）

### 3. 扫描时写入 scan_log：`pages.service.ts scanHtmlInBackground`

4 个决策点各加一条 `insertScanLog(ctx.d1, {...})`（先写日志、再 `deletePageById`）：

| 决策点 | status | reason | threats |
|---|---|---|---|
| 正则不通过 (:514) | blocked | regex | `JSON.stringify(guard.threats)` |
| 钓鱼不通过 (:527) | blocked | phishing | `JSON.stringify(domainCheck.threats)` |
| AI 不通过 (:540) | blocked | ai | `JSON.stringify({ verdict })` |
| 审核通过 (:550) | approved | null | null |
| 审核异常 (:553) | error | null | `JSON.stringify({ error: String(e) })` |

所有条目带 `pageId / htmlLength / isAnonymous / createdAt: Date.now()`，`if (ctx.d1)` 守卫与现有 upload_log 写法一致。

### 4. 渲染 blocked 页：`pages.render.ts`

新增 `blockedHtml(lang: Lang, detail?: { reason: string; labels: string[] })`，仿 `notFoundHtml`（:62-108）：

- 5 语言文案（en/zh/es/pt/fr），结构：`title / headline / detail / back`
  - headline: 「该页面因违反内容规范已被下架」
  - detail 按 reason：
    - regex → 「检测到被禁止的代码：iframe、object …」（labels 为空则用通用句）
    - phishing → 「页面包含疑似钓鱼/欺诈内容」
    - ai → 「页面内容未通过 AI 安全审核」
  - `<meta name="robots" content="noindex">`，样式复用 notFoundHtml 的内联风格（含警示色点缀）

### 5. 服务侧拦截：`pages.service.ts serveUserPage`

主 HTML miss 分支（:670-672）改为：

```ts
if (!obj) {
  if (env.d1) {
    try {
      const blocked = await getLatestBlockedScan(env.d1, id);
      if (blocked) {
        return new Response(blockedHtml(lang, blocked), { status: 410, headers: htmlHeaders() });
      }
    } catch { /* 查询失败回退 404 */ }
  }
  return new Response(notFoundHtml(lang), { status: 404, headers: htmlHeaders() });
}
```

- HTTP 状态用 **410 Gone**（语义准确、利于爬虫去索引），notFoundHtml 各分支保持 404 不动
- 资产子路径 miss、tmp 过期、D1 过期等分支不改动
- scan_log 保留 90 天，到期后该 URL 回落为普通 404（可接受，沿用现有清理）

### 6. 测试

- 扩展 [tests/scan-html-bg.spec.ts](tests/scan-html-bg.spec.ts)：
  - regex/phishing/ai block 时写入 scan_log（status=blocked、reason、threats JSON 正确）且仍删除页面
  - approved / error 路径写入对应 scan_log 条目
- 新增 serve 侧用例：D1 有 blocked 记录 + R2 无对象 → 返回 410 且 HTML 含原因文案；无记录 → 404
- 迁移同步到本地 dev D1 后跑 `npm run test:unit`

## 验证

1. `npx vitest run tests/scan-html-bg.spec.ts` 及全量 `npm run test:unit`
2. 本地 `npm run dev`：上传含 `<iframe>` 的 HTML → 等后台扫描完成 → 访问 `/p/{id}` 应显示 410 下架页并列出 iframe 标签；上传正常页面 → 访问正常
3. 生产上线顺序（**需用户确认后执行**）：先对 remote D1 执行 `0011_scan_log.sql`，再 `npm run deploy`
