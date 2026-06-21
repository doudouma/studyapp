# 超级管理员与会员体系 — 实施方案

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 100mini 平台增加超级管理员角色和会员（VIP）管理体系，包含管理后台页面和 API。

**Architecture:** 在现有 user 表新增 role 字段标记管理员，新建 membership 表存储会员信息。后端在 Hono 路由中新增 requireAdmin 中间件保护管理接口。前端新建 `/admin` 路由，管理员可在其中查看所有用户并设置会员过期时间。

**Tech Stack:** Cloudflare D1 + Drizzle ORM + Better Auth + Hono + TanStack Start + React

---

## 文件结构

| 文件 | 操作 | 职责 |
|---|---|---|
| `server/db/schema.ts` | 修改 | user 表加 role 列，新增 membership 表 |
| `drizzle/0003_admin_membership.sql` | 新建 | 数据库迁移 SQL |
| `server/auth.ts` | 修改 | Better Auth 配置增加 role 字段声明 |
| `server/api.ts` | 修改 | 新增 requireAdmin 中间件和管理 API |
| `app/components/HomeHeader.tsx` | 修改 | User 接口增加 role，导航栏增加管理入口 |
| `app/routes/admin.tsx` | 新建 | 管理后台页面 |

### Task 1: 数据库 — user 表加 role 列 + membership 表

**Files:**
- Modify: `server/db/schema.ts`
- Create: `drizzle/0003_admin_membership.sql`

- [ ] **Step 1: 在 schema.ts 的 user 表中添加 role 列**

```typescript
// server/db/schema.ts — user 表新增 role 列（在第 6-13 行的 user 定义中）
export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" }).notNull().default(false),
  image: text("image"),
  role: text("role").notNull().default("user"),       // ← 新增
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});
```

- [ ] **Step 2: 在 schema.ts 中添加 membership 表**

在 `page` 表定义之后（第 69 行之后），添加 membership 表定义：

```typescript
// server/db/schema.ts — 在 page 表之后添加
export const membership = sqliteTable("membership", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" })
    .unique(),
  adminId: text("admin_id").references(() => user.id, { onDelete: "set null" }),
  startedAt: integer("started_at", { mode: "timestamp" }).notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});
```

- [ ] **Step 3: 创建迁移 SQL 文件**

```sql
-- drizzle/0003_admin_membership.sql
CREATE TABLE IF NOT EXISTS "membership" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL,
  "admin_id" text,
  "started_at" integer NOT NULL,
  "expires_at" integer NOT NULL,
  "created_at" integer NOT NULL,
  "updated_at" integer NOT NULL,
  FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE cascade,
  FOREIGN KEY ("admin_id") REFERENCES "user"("id") ON DELETE set null
);

CREATE UNIQUE INDEX IF NOT EXISTS "membership_user_id_unique" ON "membership" ("user_id");

ALTER TABLE "user" ADD COLUMN "role" text DEFAULT 'user' NOT NULL;
```

- [ ] **Step 4: 运行迁移**

```bash
npx wrangler d1 migrations apply studypage-db --local  # 本地开发
```

> 注意：如果使用 `drizzle-kit generate` 替代手动创建 migration，运行 `npx drizzle-kit generate` 后检查生成的 migration 文件是否与上述一致，并确保 `drizzle/` 下的 `meta/_journal.json` 同步更新。

### Task 2: Better Auth — 配置 role 字段

**Files:**
- Modify: `server/auth.ts`

- [ ] **Step 1: 在 betterAuth 配置中添加 additionalFields**

Better Auth 默认只返回已知字段。在 `user` 配置中声明 `role` 字段，使其出现在 API 响应中：

```typescript
// server/auth.ts — 在 betterAuth({...}) 中添加 user 配置
export function createAuth(env: ..., requestURL?: string) {
  // ... existing code ...

  return betterAuth({
    database: drizzleAdapter(db, {
      provider: "sqlite",
      schema,
    }),
    baseURL,
    secret: env.BETTER_AUTH_SECRET || "dev-secret",
    basePath: "/api/auth",
    appName: "100mini",
    socialProviders: {},
    emailAndPassword: {
      enabled: true,
      autoSignIn: true,
    },
    // ↓↓↓ 新增 ↓↓↓
    user: {
      additionalFields: {
        role: {
          type: "string",
          required: false,
          defaultValue: "user",
          input: false,      // 不允许注册时设置
        },
      },
    },
    // ↑↑↑ 新增 ↑↑↑
  });
}
```

### Task 3: 后端 — requireAdmin 中间件 + 管理 API

**Files:**
- Modify: `server/api.ts`

- [ ] **Step 1: 导入 membership 表**

在现有导入后添加 membership 表导入：

```typescript
// server/api.ts — 在第 7 行添加 membership
import { page, user, membership } from "./db/schema";
```

- [ ] **Step 2: 更新 Variables 类型，添加 role**

```typescript
// server/api.ts — Variables 类型
type Variables = {
  user: { id: string; name: string; email: string; image?: string; role?: string } | null;
  session: any;
};
```

- [ ] **Step 3: 添加 requireAdmin 中间件**

在 `api.onError` 之后、`FREE_PERMANENT_LIMIT` 之前（第 21-23 行附近）添加：

```typescript
// 管理员中间件
const requireAdmin = (c: any, next: any) => {
  const user = c.get("user");
  if (!user || user.role !== "admin") {
    return c.json({ error: "无权访问" }, 403);
  }
  return next();
};
```

- [ ] **Step 4: 添加 GET /api/admin/users 端点**

在 `/api/me` 端点之后添加（第 101 行之后）：

```typescript
// Admin: List all users (with membership status)
api.get("/api/admin/users", requireAdmin, async (c) => {
  if (!c.env.D1) return c.json({ error: "database unavailable" }, 503);

  const db = createDb(c.env.D1);
  const page = parseInt(c.req.query("page") || "1", 10);
  const pageSize = parseInt(c.req.query("pageSize") || "20", 10);
  const offset = (page - 1) * pageSize;

  // Total count
  const [totalResult] = await db.select({ count: count() }).from(user);
  const total = totalResult?.count ?? 0;

  // Users with membership (left join)
  const users = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      membershipId: membership.id,
      membershipStartedAt: membership.startedAt,
      membershipExpiresAt: membership.expiresAt,
    })
    .from(user)
    .leftJoin(membership, eq(membership.userId, user.id))
    .orderBy(desc(user.createdAt))
    .limit(pageSize)
    .offset(offset);

  const now = Date.now();
  const result = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    createdAt: u.createdAt,
    membership: u.membershipId
      ? {
          expiresAt: u.membershipExpiresAt,
          isActive: u.membershipExpiresAt && u.membershipExpiresAt > now ? true : false,
          startedAt: u.membershipStartedAt,
        }
      : null,
  }));

  return c.json({ users: result, total, page, pageSize });
});
```

- [ ] **Step 5: 添加 POST /api/admin/users/:id/membership 端点**

```typescript
// Admin: Set user membership
api.post("/api/admin/users/:id/membership", requireAdmin, async (c) => {
  if (!c.env.D1) return c.json({ error: "database unavailable" }, 503);

  const admin = c.get("user");
  const userId = c.req.param("id");
  const body = await c.req.json();
  const durationMonths = body.durationMonths;

  if (![1, 3, 6, 12].includes(durationMonths)) {
    return c.json({ error: "时长仅支持 1、3、6、12 个月" }, 400);
  }

  const db = createDb(c.env.D1);

  // Check user exists
  const [existingUser] = await db.select().from(user).where(eq(user.id, userId)).limit(1);
  if (!existingUser) {
    return c.json({ error: "用户不存在" }, 404);
  }

  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setMonth(expiresAt.getMonth() + durationMonths);

  // Upsert membership (INSERT OR REPLACE via unique constraint)
  const existingMembership = await db
    .select()
    .from(membership)
    .where(eq(membership.userId, userId))
    .limit(1);

  if (existingMembership.length > 0) {
    await db
      .update(membership)
      .set({
        expiresAt,
        adminId: admin!.id,
        updatedAt: now,
      })
      .where(eq(membership.userId, userId));
  } else {
    await db.insert(membership).values({
      id: nanoid(7),
      userId,
      adminId: admin!.id,
      startedAt: now,
      expiresAt,
      createdAt: now,
      updatedAt: now,
    });
  }

  return c.json({ success: true, expiresAt: expiresAt.getTime() });
});
```

- [ ] **Step 6: 添加 DELETE /api/admin/users/:id/membership 端点**

```typescript
// Admin: Remove user membership
api.delete("/api/admin/users/:id/membership", requireAdmin, async (c) => {
  if (!c.env.D1) return c.json({ error: "database unavailable" }, 503);

  const userId = c.req.param("id");
  const db = createDb(c.env.D1);

  const existing = await db
    .select()
    .from(membership)
    .where(eq(membership.userId, userId))
    .limit(1);

  if (existing.length === 0) {
    return c.json({ error: "该用户不是会员" }, 404);
  }

  await db.delete(membership).where(eq(membership.userId, userId));

  return c.json({ success: true, message: "会员已取消" });
});
```

### Task 4: 前端导航栏 — 添加管理入口

**Files:**
- Modify: `app/components/HomeHeader.tsx`

- [ ] **Step 1: User 接口增加 role 字段**

```typescript
// HomeHeader.tsx — 第 20-25 行的 User 接口
interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  role?: string;   // ← 新增
}
```

- [ ] **Step 2: 已登录模式的导航栏增加"管理后台"按钮**

在 `NavLink href="/links">我的链接</NavLink>` 之后（第 223 行附近），添加管理员专属的导航链接：

```tsx
{/* 第 220-224 行附近 */}
<div className="hidden items-center gap-4 md:flex">
  <NavLink href="/">首页</NavLink>
  <NavLink href="/square">广场</NavLink>
  <NavLink href="/links">我的链接</NavLink>
  {user.role === "admin" && (
    <NavLink href="/admin">管理后台</NavLink>
  )}
</div>
```

- [ ] **Step 3: 用户下拉菜单中也添加管理入口（可选）**

在下拉菜单的退出登录按钮之前（第 261-268 行附近）：

```tsx
{user.role === "admin" && (
  <Link
    to="/admin"
    className="flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-muted"
    onClick={() => setMenuOpen(false)}
  >
    <Settings className="size-4" />
    管理后台
  </Link>
)}
{/* 原有的退出登录按钮 */}
```

### Task 5: 前端 — 管理后台页面

**Files:**
- Create: `app/routes/admin.tsx`

- [ ] **Step 1: 创建 admin 路由页面**

```tsx
import { useState, useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Shield, Settings } from "lucide-react";
import { AppNav } from "~/components/HomeHeader";
import { AppFooter } from "~/components/AppFooter";
import { Button } from "~/components/ui/button";
import { authClient } from "~/lib/auth-client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "~/components/ui/dialog";

export const Route = createFileRoute("/admin")({
  head: () => ({
    title: "管理后台 - 100mini",
    meta: [
      { name: "description", content: "管理员后台，管理用户和会员" },
    ],
  }),
  component: AdminPage,
});

interface MembershipInfo {
  expiresAt: number;
  isActive: boolean;
  startedAt: number;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: number;
  membership: MembershipInfo | null;
}

interface AdminUsersResponse {
  users: UserData[];
  total: number;
  page: number;
  pageSize: number;
}

type DurationOption = 1 | 3 | 6 | 12;

function AdminPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [users, setUsers] = useState<UserData[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Membership dialog state
  const [membershipUser, setMembershipUser] = useState<UserData | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<DurationOption>(3);
  const [dialogLoading, setDialogLoading] = useState(false);

  // Cancel dialog state
  const [cancelUser, setCancelUser] = useState<UserData | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  const pageSize = 20;

  // Check auth and admin role
  useEffect(() => {
    authClient.getSession().then((session: any) => {
      const currentUser = session?.data?.user ?? null;
      setUser(currentUser);
      setAuthLoading(false);
      if (!currentUser || currentUser.role !== "admin") {
        navigate({ to: "/" });
      }
    });
  }, []);

  const fetchUsers = async (p: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users?page=${p}&pageSize=${pageSize}`);
      if (!res.ok) throw new Error((await res.json()).error || "加载失败");
      const data: AdminUsersResponse = await res.json();
      setUsers(data.users);
      setTotal(data.total);
      setPage(data.page);
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user?.role === "admin") {
      fetchUsers(1);
    }
  }, [authLoading]);

  const handleSetMembership = async () => {
    if (!membershipUser) return;
    setDialogLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${membershipUser.id}/membership`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ durationMonths: selectedDuration }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "操作失败");
      setMembershipUser(null);
      fetchUsers(page);
    } catch (err) {
      alert(err instanceof Error ? err.message : "操作失败");
    } finally {
      setDialogLoading(false);
    }
  };

  const handleCancelMembership = async () => {
    if (!cancelUser) return;
    setCancelLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${cancelUser.id}/membership`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error((await res.json()).error || "操作失败");
      setCancelUser(null);
      fetchUsers(page);
    } catch (err) {
      alert(err instanceof Error ? err.message : "操作失败");
    } finally {
      setCancelLoading(false);
    }
  };

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const totalPages = Math.ceil(total / pageSize);

  if (authLoading) return null;

  // Not admin — redirect (handled in useEffect, show nothing while redirecting)
  if (!user || user.role !== "admin") return null;

  return (
    <div className="flex min-h-screen flex-col">
      <AppNav user={user} />

      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-6 pt-10 pb-12">
          {/* Header */}
          <div className="mb-8 flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Shield className="size-6 text-primary" />
                <h1 className="text-2xl font-bold text-foreground">管理后台</h1>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                管理所有用户和会员身份
              </p>
            </div>
          </div>

          {/* User Table */}
          {loading ? (
            <div className="rounded-xl border border-border bg-card p-12">
              <p className="text-center text-muted-foreground">加载中...</p>
            </div>
          ) : error ? (
            <div className="rounded-xl border border-border bg-card p-12 text-center">
              <p className="text-destructive">{error}</p>
              <button
                className="mt-4 text-sm text-primary hover:underline"
                onClick={() => fetchUsers(page)}
              >
                重试
              </button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">用户</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">邮箱</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden sm:table-cell">注册时间</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">角色</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">会员状态</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">过期时间</th>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                        <td className="px-4 py-3 font-medium">{u.name}</td>
                        <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{u.email}</td>
                        <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{formatDate(u.createdAt)}</td>
                        <td className="px-4 py-3">
                          <span className={u.role === "admin" ? "text-primary font-semibold" : "text-muted-foreground"}>
                            {u.role === "admin" ? "管理员" : "用户"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {u.membership?.isActive ? (
                            <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                              有效会员
                            </span>
                          ) : u.membership && !u.membership.isActive ? (
                            <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900/30 dark:text-red-400">
                              已过期
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                              非会员
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                          {u.membership?.expiresAt ? formatDate(u.membership.expiresAt) : "-"}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {u.membership?.isActive ? (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => setCancelUser(u)}
                            >
                              取消会员
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => { setMembershipUser(u); setSelectedDuration(3); }}
                            >
                              设置会员
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                          暂无用户数据
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => fetchUsers(page - 1)}
                  >
                    上一页
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {page} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => fetchUsers(page + 1)}
                  >
                    下一页
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Set Membership Dialog */}
      <Dialog open={!!membershipUser} onOpenChange={(open) => !open && setMembershipUser(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>设置会员</DialogTitle>
            <DialogDescription>
              为用户 "{membershipUser?.name}" 设置会员身份
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">选择会员时长：</p>
            <div className="flex gap-2">
              {([1, 3, 6, 12] as DurationOption[]).map((m) => (
                <Button
                  key={m}
                  variant={selectedDuration === m ? "default" : "outline"}
                  size="sm"
                  className="flex-1"
                  onClick={() => setSelectedDuration(m)}
                >
                  {m}个月
                </Button>
              ))}
            </div>
            <Button
              className="w-full"
              disabled={dialogLoading}
              onClick={handleSetMembership}
            >
              {dialogLoading ? "设置中..." : "确认设置"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cancel Membership Confirmation Dialog */}
      <Dialog open={!!cancelUser} onOpenChange={(open) => !open && setCancelUser(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>取消会员</DialogTitle>
            <DialogDescription>
              确定取消 "{cancelUser?.name}" 的会员资格？
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" onClick={() => setCancelUser(null)}>
              返回
            </Button>
            <Button
              variant="destructive"
              disabled={cancelLoading}
              onClick={handleCancelMembership}
            >
              {cancelLoading ? "取消中..." : "确认取消"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AppFooter />
    </div>
  );
}
```

- [ ] **Step 2: 运行路由生成**

TanStack Router 使用文件路由，创建 `app/routes/admin.tsx` 后需要重新生成路由树：

```bash
npx @tanstack/react-router-cli generate
```

（或通过 `npx tanstack-router-generate`，取决于具体安装方式）

### Task 6: 初始化管理员

设置第一个管理员账号，需要先注册一个普通账号，然后通过 D1 SQL 将其提升为管理员：

- [ ] **Step 1: 注册管理员账号**

在应用前端使用邮箱注册一个账号（如 `admin@example.com`）。

- [ ] **Step 2: 通过 D1 SQL 提升为管理员**

```bash
# 本地开发
npx wrangler d1 execute studypage-db --local --command "UPDATE user SET role = 'admin' WHERE email = 'admin@example.com';"

# 生产环境
npx wrangler d1 execute studypage-db --remote --command "UPDATE user SET role = 'admin' WHERE email = 'admin@example.com';"
```

- [ ] **Step 3: 验证**

重启 dev server 后，管理员登录可见导航栏的"管理后台"链接，进入后可查看用户列表并设置会员。

---

## 验证清单

- [ ] 管理员登录后导航栏显示"管理后台"
- [ ] 普通用户看不到"管理后台"
- [ ] 非管理员访问 `/admin` 自动跳转首页
- [ ] 管理员进入后台能看到所有用户列表
- [ ] 点击"设置会员"弹窗可选 1/3/6/12 个月
- [ ] 设置成功后用户状态变为"有效会员"并显示过期时间
- [ ] 点击"取消会员"确认后会员被取消
- [ ] 分页正常工作
