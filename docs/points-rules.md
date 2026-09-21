# 积分规则

## 基本规则

| 参数 | 值 | 说明 |
|------|-----|------|
| 免费链接数 | 5 个 | 每个用户默认可永久保留 5 个链接，无需积分 |
| 每个额外链接成本 | 10 积分 | 超过免费额度后，每发布 1 个链接扣除 10 积分 |
| 新用户初始积分 | 50 分 | 注册即赠，可额外创建 5 个链接 |
| 会员 | 不限量 | 有效会员不受积分和链接数限制 |
| 免费尺寸 | 5 MB | 内容不超过 5MB 不产生尺寸费（匿名上限也是 5MB） |
| 每个尺寸块 | 10 积分 | 登录用户超出 5MB 后，每 5MB（不足一块按一块）扣 10 积分 |
| 最大尺寸 | 50 MB | 登录用户上传上限，超出直接 413 |

## 核心机制

**花 10 积分 = 发布 1 个链接 + 永久增加 1 个最大链接数**

- 每次花 10 积分发布链接时，`linksLimitBonus` +1
- 最大链接数 = 5（免费）+ `linksLimitBonus`
- 删除链接不会减少最大链接数（bonus 只增不减）

## 计算公式

```
最大链接数 = 5（免费） + linksLimitBonus（已购买的额外配额）
尺寸费（积分） = ceil(max(0, 计费尺寸 - 5MB) / 5MB) * 10
计费尺寸 = max(原始字节, ZIP 解压总和)
本次总费用 = 配额费（0 或 10） + 尺寸费   # 二者叠加，互不替代
```

示例（新用户 50 积分）：
- 发布 5 个免费链接 → bonus=0，最大链接数=5
- 再花 10 积分发布第 6 个 → bonus=1，最大链接数=6
- 再花 10 积分发布第 7 个 → bonus=2，最大链接数=7
- ...以此类推，50 积分可发布 10 个链接，bonus=5
- 删除其中 2 个链接 → pageCount=8，但最大链接数仍为 10

## 发布流程

```
用户点击发布
  ↓
计算 配额费（超免费链接数 = 10，否则 0）
计算 尺寸费（内容超过 5MB 后每 5MB = 10，否则 0）
  ↓
总费用 = 0？ → 是 → 直接发布（免费）
  ↓ 否
points >= 总费用？ → 否 → 返回 403「积分不足」
  ↓ 是
弹出确认对话框「将扣除 N 积分」
  ↓ 用户确认
后端：创建链接 → 扣除配额费（linksLimitBonus +1）+ 扣除尺寸费 → 返回成功
前端：refreshAuth() 刷新积分显示
```

> 匿名用户：上限 5MB，不涉及积分；登录用户：上限 50MB，超出部分按尺寸块扣分。

## 关键文件

| 文件 | 作用 |
|------|------|
| `shared/types/pages.ts` | 常量：`FREE_PERMANENT_LIMIT=5`, `POINTS_PER_UPLOAD=10`, `DEFAULT_POINTS=50`, `FREE_CONTENT_SIZE=5MB`, `MAX_USER_CONTENT_SIZE=50MB`, `POINTS_PER_SIZE_BLOCK=10`；`computeSizeFeePoints()` 纯函数 |
| `server/db/schema.ts` | user 表：`points`（积分）、`links_limit_bonus`（永久链接配额奖励） |
| `server/features/pages/pages.repo.ts` | `deductPointsAndAddBonus()`（配额费）、`deductPoints()`（尺寸费，不加 bonus） |
| `server/features/pages/pages.service.ts` | `createUpload()` / `updateOwnPage()` — 上限、配额费 + 尺寸费校验与扣费 |
| `app/lib/auth-context.tsx` | `refreshAuth()` — 刷新积分状态 |
| `app/routes/index.tsx` | 上限提示、尺寸费报价、确认对话框 |
| `app/components/DropZone.tsx` | `maxBytes` 上限（匿名 5MB / 登录 50MB） |

## 积分扣除时机

积分仅在以下条件**全部满足**时扣除：
1. 用户已登录
2. 页面**成功创建 / 文件成功替换**后才扣分（失败不扣分）
3. 满足以下任一计费条件：
   - **配额费**：非会员且已有 ≥ 5 个链接（超出免费额度），扣 10 积分并 `linksLimitBonus +1`
   - **尺寸费**：内容超过 5MB，按块扣分（仅扣积分，不影响链接额度）
   - 两者可叠加（总额 = 配额费 + 尺寸费），需 `points >= 总额`

## 管理员操作

管理员可通过管理后台（`/admin`）直接设置用户积分：
- `POST /api/admin/users/:id/points` — 设置绝对积分值
