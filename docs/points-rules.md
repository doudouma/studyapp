# 积分规则

## 基本规则

| 参数 | 值 | 说明 |
|------|-----|------|
| 免费链接数 | 5 个 | 每个用户默认可永久保留 5 个链接，无需积分 |
| 每个额外链接成本 | 10 积分 | 超过免费额度后，每发布 1 个链接扣除 10 积分 |
| 新用户初始积分 | 50 分 | 注册即赠，可额外创建 5 个链接 |
| 会员 | 不限量 | 有效会员不受积分和链接数限制 |

## 核心机制

**花 10 积分 = 发布 1 个链接 + 永久增加 1 个最大链接数**

- 每次花 10 积分发布链接时，`linksLimitBonus` +1
- 最大链接数 = 5（免费）+ `linksLimitBonus`
- 删除链接不会减少最大链接数（bonus 只增不减）

## 计算公式

```
最大链接数 = 5（免费） + linksLimitBonus（已购买的额外配额）
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
pageCount < 5？ → 是 → 直接发布（免费）
  ↓ 否
points >= 10？ → 否 → 返回 403「积分不足」
  ↓ 是
弹出确认对话框「将扣除 10 积分」
  ↓ 用户确认
后端：创建链接 → 扣除 10 积分 + linksLimitBonus +1 → 返回成功
前端：refreshAuth() 刷新积分显示
```

## 关键文件

| 文件 | 作用 |
|------|------|
| `shared/types/pages.ts` | 常量定义：`FREE_PERMANENT_LIMIT=5`, `POINTS_PER_UPLOAD=10`, `DEFAULT_POINTS=50` |
| `server/db/schema.ts` | user 表：`points`（积分）、`links_limit_bonus`（永久链接配额奖励） |
| `server/features/pages/pages.repo.ts` | `deductPointsAndAddBonus()` — 原子 SQL 扣分 + 增加 bonus |
| `server/features/pages/pages.service.ts` | `createUpload()` — 配额检查 + 扣分逻辑；`getMeInfo()` — 计算 limit |
| `app/lib/auth-context.tsx` | `refreshAuth()` — 刷新积分状态 |
| `app/routes/index.tsx` | 确认对话框 + 发布逻辑 |

## 积分扣除时机

积分仅在以下条件**全部满足**时扣除：
1. 用户已登录
2. 用户非会员
3. 用户已有 ≥ 5 个链接（超出免费额度）
4. 用户当前积分 ≥ 10
5. 页面**成功创建**后才扣分（失败不扣分）

扣除积分的同时，`linksLimitBonus` +1，永久增加最大链接数。

## 管理员操作

管理员可通过管理后台（`/admin`）直接设置用户积分：
- `POST /api/admin/users/:id/points` — 设置绝对积分值
