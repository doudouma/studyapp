# 超级管理员与会员体系设计

**日期：** 2026-06-21
**状态：** 设计稿 v1

## 概述

为 100mini（码上钉）平台增加超级管理员角色和会员（VIP）管理体系。超级管理员可以在独立后台管理所有用户，并为用户设置带过期时间的会员身份。

## 数据库设计

### user 表（现有表，增加一列）

| 列 | 类型 | 约束 | 说明 |
|---|---|---|---|
| `role` | `text` | NOT NULL, DEFAULT `'user'` | `'user'` 或 `'admin'` |

Better Auth 管理的 user 表仅增加 role 字段以最小化冲突。管理员通过在数据库中直接设置 `role = 'admin'` 来创建。

### membership 表（新建）

```ts
export const membership = sqliteTable("membership", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" })
    .unique(),                         // 一个用户只有一条会员记录
  adminId: text("admin_id")           // 哪个管理员设置的（审计用）
    .references(() => user.id, { onDelete: "set null" }),
  startedAt: integer("started_at", { mode: "timestamp" }).notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});
```

**会员有效性判断：** `membership.expires_at > now()` 即为有效会员。

## API 设计

### requireAdmin 中间件

在现有 session 中间件基础上，增加管理接口的保护层，检查 `user.role === 'admin'`。

### 管理端点

| 方法 | 路径 | 说明 |
|---|---|---|
| `GET` | `/api/admin/users` | 获取所有用户列表（含会员状态），支持分页 |
| `POST` | `/api/admin/users/:id/membership` | 设置/更新用户的会员身份 |
| `DELETE` | `/api/admin/users/:id/membership` | 取消用户的会员身份 |

#### `GET /api/admin/users`

```
Query: ?page=1&pageSize=20
```

返回：
```json
{
  "users": [
    {
      "id": "...",
      "name": "张三",
      "email": "zhangsan@example.com",
      "role": "user",
      "createdAt": 1718000000,
      "membership": {
        "expiresAt": 1730000000,
        "isActive": true
      }
    }
  ],
  "total": 50,
  "page": 1,
  "pageSize": 20
}
```

#### `POST /api/admin/users/:id/membership`

```json
{
  "durationMonths": 3
}
```

- `durationMonths` 支持：`1`, `3`, `6`, `12`
- 服务端根据**当前时间**增加对应月数计算新的 `expiresAt`
- 已有会员记录时**重置**过期时间（从当前时间重新计算，而非累加）
- 记录执行操作的 `adminId`
- 首次设置时 `startedAt` 为当前时间；续期时 `startedAt` 不变

#### `DELETE /api/admin/users/:id/membership`

- 删除该用户的 membership 记录
- 返回成功状态

## 前端设计

### 路由

| 路径 | 说明 |
|---|---|
| `/admin` | 管理后台首页（管理员专用） |

非管理员访问重定向到首页。

### 导航栏入口

管理员用户的导航栏右侧增加"管理后台"链接（仅管理员可见）。

### 页面结构

**用户列表表格：**

| 列 | 数据来源 | 展示 |
|---|---|---|
| 用户 | `user.name` + `user.email` | 昵称 + 邮箱 |
| 注册时间 | `user.createdAt` | 日期格式化 |
| 角色 | `user.role` | 标签："管理员" / "用户" |
| 会员状态 | `membership` | 绿色标签"有效会员" / 灰色标签"非会员" / 红色标签"已过期" |
| 过期时间 | `membership.expiresAt` | 日期或"-" |
| 操作 | — | 按钮：「设置会员」/「取消会员」|

**设置会员弹窗：**

- 标题：为用户 XXX 设置会员
- 时长选项（按钮组）：1个月 | 3个月 | 6个月 | 12个月
- 操作按钮：确认 / 取消
- 成功后刷新列表

**取消会员确认弹窗：**

- 确认文案：确定取消 XXX 的会员资格？
- 操作按钮：确认取消 / 返回

### 分页

用户列表每页 20 条，底部分页控件。

## 管理员创建方式

首次管理员通过手动 SQL 在数据库中设置：

```sql
UPDATE user SET role = 'admin' WHERE email = 'admin@example.com';
```

后续可在管理后台中将其他用户提升为管理员（后续迭代）。

## 不包含的范围（后续扩展）

- 会员特权逻辑（上传额度、文件大小限制等）
- 管理员邀请码注册
- 会员操作日志
- 批量设置会员
- 会员到期通知
