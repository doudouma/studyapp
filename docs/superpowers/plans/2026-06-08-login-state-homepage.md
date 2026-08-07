# 登录状态首页改造 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 根据登录状态自动切换首页布局 — 未登录保持简约风格，已登录展示带有导航栏、丰富表单、统计区和页脚的全套布局。

**Architecture:** 在 `index.tsx` 顶层添加 auth 状态，条件渲染两套布局。提取 3 个新组件（HomeHeader、StatsSection、AppFooter）复用。Upload 表单的核心逻辑保持不变，只根据登录状态增删部分表单字段。

**Tech Stack:** React 19 + TanStack Router + shadcn/ui + Tailwind CSS + better-auth

---

### Task 1: 创建 HomeHeader 组件（已登录导航栏）

**Files:**
- Create: `app/components/HomeHeader.tsx`

- [ ] **Step 1: 创建 HomeHeader 组件**

```tsx
import { useState, useRef, useEffect } from "react";
import { Code2, Search, Bell, Settings, LogOut } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { authClient } from "~/lib/auth-client";

interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
}

interface HomeHeaderProps {
  user: User;
}

export function HomeHeader({ user }: HomeHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const avatarFallback = user.name?.charAt(0).toUpperCase() || "U";

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setMenuOpen(false);
    await authClient.signOut();
    window.location.reload();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <nav className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        {/* Left: Logo + Nav links */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Code2 className="size-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">100mini</span>
          </div>
          <div className="hidden items-center gap-4 md:flex">
            <a
              href="/"
              className="text-sm font-semibold text-primary border-b-2 border-primary pb-0.5"
            >
              首页
            </a>
            <a
              href="#my-pages"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              我的链接
            </a>
          </div>
        </div>

        {/* Right: Search + Icons + Avatar */}
        <div className="flex items-center gap-3">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-9 w-48 bg-muted pl-9 text-sm lg:w-64"
              placeholder="搜索页面..."
            />
          </div>
          <Button variant="ghost" size="icon" className="size-9">
            <Bell className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" className="size-9">
            <Settings className="size-4" />
          </Button>
          <div className="relative" ref={menuRef}>
            <button
              className="flex size-8 items-center justify-center rounded-full bg-primary font-bold text-xs text-primary-foreground cursor-pointer overflow-hidden"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name}
                  className="size-full object-cover"
                />
              ) : (
                avatarFallback
              )}
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-10 z-50 w-44 rounded-lg border border-border bg-popover shadow-lg">
                <div className="px-3 py-2 text-sm text-muted-foreground border-b">
                  {user.name}
                </div>
                <button
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors rounded-b-lg"
                  onClick={handleLogout}
                >
                  <LogOut className="size-4" />
                  退出登录
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
```

- [ ] **Step 2: 检查 index.tsx 是否已导入 dropdown-menu**（如未导入，无需操作，task 4 会处理）

---

### Task 2: 创建 StatsSection 组件（统计区）

**Files:**
- Create: `app/components/StatsSection.tsx`

- [ ] **Step 1: 创建 StatsSection 组件**

```tsx
import { Bolt, Lock, QrCode } from "lucide-react";

const stats = [
  {
    icon: Bolt,
    title: "即时预览",
    description: "粘贴即预览，高保真渲染",
  },
  {
    icon: Lock,
    title: "加密存储",
    description: "内容安全加密，隐私有保障",
  },
  {
    icon: QrCode,
    title: "一键分享",
    description: "生成链接或二维码，方便传播",
  },
];

export function StatsSection() {
  return (
    <section className="w-full bg-muted/50 py-12">
      <div className="mx-auto max-w-5xl px-6">
        <div className="grid gap-8 md:grid-cols-3">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.title}
                className="flex flex-col items-center text-center"
              >
                <div className="mb-3 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="size-6" />
                </div>
                <h4 className="text-base font-semibold">{stat.title}</h4>
                <p className="mt-1 text-sm text-muted-foreground">
                  {stat.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
```

---

### Task 3: 创建 AppFooter 组件（页脚）

**Files:**
- Create: `app/components/AppFooter.tsx`

- [ ] **Step 1: 创建 AppFooter 组件**

```tsx
import { Code2 } from "lucide-react";

const footerLinks = [
  { label: "隐私政策", href: "#" },
  { label: "服务条款", href: "#" },
  { label: "帮助中心", href: "#" },
  { label: "联系我们", href: "#" },
];

export function AppFooter() {
  return (
    <footer className="w-full border-t border-border bg-background">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-6 py-8 md:flex-row">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Code2 className="size-4 text-primary" />
            <span className="text-sm font-bold text-primary">100mini</span>
          </div>
          <p className="text-xs text-muted-foreground">
            &copy; 2024 100mini. All rights reserved.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-6">
          {footerLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
```

---

### Task 4: 修改 index.tsx — 加入登录状态判断与条件渲染

**Files:**
- Modify: `app/routes/index.tsx`

- [ ] **Step 1: 导入新组件和 authClient**

在现有 imports 末尾添加：

```tsx
import { HomeHeader } from "~/components/HomeHeader";
import { StatsSection } from "~/components/StatsSection";
import { AppFooter } from "~/components/AppFooter";
import { authClient } from "~/lib/auth-client";
```

- [ ] **Step 2: 在 HomePage 函数开头添加 auth 状态**

```tsx
function HomePage() {
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    authClient.getSession().then((session: any) => {
      setUser(session?.data?.user ?? null);
      setAuthLoading(false);
    });
  }, []);

  // ... existing state (mode, htmlContent, file, etc.)
```

注意：添加 `useEffect` 导入（如果尚未导入），检查现有代码已有 `useState`。

- [ ] **Step 3: 在 `if (result)` 块之前添加 authLoading guard**

```tsx
if (authLoading) return null;
```

放在 `if (result)` 块之前，确保 auth 加载完成前不渲染。

- [ ] **Step 4: 替换 return 为条件渲染**

将整个 return 语句替换为：

```tsx
if (result) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <SuccessCard
        url={result.url}
        expiresAt={result.expiresAt || undefined}
        isPermanent={result.isPermanent}
        onReset={handleReset}
      />
    </main>
  );
}

if (!user) {
  // ========== 未登录状态 — 保持现有简约设计 ==========
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="fixed top-4 right-4 z-50">
        <AuthBar />
      </div>

      <header className="mb-8 text-center">
        <div className="mb-3 flex justify-center">
          <div className="inline-flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
            <Code2 className="size-6" />
          </div>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          码上钉
        </h1>
        <p className="mt-2 text-muted-foreground">
          粘贴或拖拽 HTML，一键生成分享链接
        </p>
      </header>

      <UserCenter />

      <Card className="w-full max-w-xl">
        <CardContent className="p-6">
          <Tabs
            value={mode}
            onValueChange={(v) => {
              setMode(v as TabMode);
              if (v === "paste") setFile(null);
              if (v === "drop") setHtmlContent("");
            }}
          >
            <TabsList variant="line" className="mb-6">
              <TabsTrigger value="paste">粘贴代码</TabsTrigger>
              <TabsTrigger value="drop">上传文件</TabsTrigger>
            </TabsList>

            <TabsContent value="paste">
              <textarea
                className="w-full min-h-[300px] rounded-lg border border-border bg-background p-4 text-sm font-mono outline-none resize-y leading-relaxed focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                placeholder="在此粘贴你的 HTML/CSS/JS 代码..."
                value={htmlContent}
                onChange={(e) => setHtmlContent(e.target.value)}
                spellCheck={false}
              />
            </TabsContent>

            <TabsContent value="drop">
              <DropZone file={file} onFileSelect={setFile} />
            </TabsContent>
          </Tabs>

          <div className="mt-2 mb-2 flex justify-end">
            <span
              className={`text-xs ${
                contentSize > 5 * 1024 * 1024
                  ? "text-destructive"
                  : "text-muted-foreground"
              }`}
            >
              {formatSize(contentSize)} / 5 MB
            </span>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <Button
            className="w-full"
            disabled={!canSubmit || loading}
            onClick={handleSubmit}
          >
            {loading ? "发布中..." : "发布"}
          </Button>
        </CardContent>
      </Card>

      <p className="mt-6 text-sm text-muted-foreground">
        匿名上传 · 7天后自动销毁 · 单文件最大 5MB
      </p>
    </main>
  );
}

// ========== 已登录状态 — 丰富布局 ==========
return (
  <div className="flex min-h-screen flex-col">
    <HomeHeader user={user} />

    <main className="flex-1">
      <section className="mx-auto max-w-5xl px-6 pt-12 pb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          一键分享你的 HTML
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          粘贴代码或上传文件，30 秒生成分享链接
        </p>
      </section>

      <section className="mx-auto max-w-2xl px-6 pb-8">
        <Card>
          <CardContent className="p-6">
            <Tabs
              value={mode}
              onValueChange={(v) => {
                setMode(v as TabMode);
                if (v === "paste") setFile(null);
                if (v === "drop") setHtmlContent("");
              }}
            >
              <TabsList variant="line" className="mb-6">
                <TabsTrigger value="paste">粘贴代码</TabsTrigger>
                <TabsTrigger value="drop">上传文件</TabsTrigger>
              </TabsList>

              <TabsContent value="paste">
                <textarea
                  className="w-full min-h-[300px] rounded-lg border border-border bg-background p-4 text-sm font-mono outline-none resize-y leading-relaxed focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  placeholder="在此粘贴你的 HTML/CSS/JS 代码..."
                  value={htmlContent}
                  onChange={(e) => setHtmlContent(e.target.value)}
                  spellCheck={false}
                />
              </TabsContent>

              <TabsContent value="drop">
                <DropZone file={file} onFileSelect={setFile} />
              </TabsContent>
            </Tabs>

            <div className="mt-2 mb-2 flex justify-end">
              <span
                className={`text-xs ${
                  contentSize > 5 * 1024 * 1024
                    ? "text-destructive"
                    : "text-muted-foreground"
                }`}
              >
                {formatSize(contentSize)} / 5 MB
              </span>
            </div>

            {/* 已登录额外字段：标题 */}
            <div className="mb-3">
              <label className="text-sm font-medium text-foreground">
                标题 <span className="font-normal text-muted-foreground">(可选)</span>
              </label>
              <Input
                className="mt-1"
                placeholder="输入页面标题..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* 已登录额外字段：类型 */}
            <div className="mb-3">
              <label className="text-sm font-medium text-foreground">类型</label>
              <select
                className="mt-1 flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="general">通用</option>
                <option value="notes">笔记</option>
                <option value="slides">课件</option>
                <option value="tool">工具</option>
                <option value="other">其他</option>
              </select>
            </div>

            {error && (
              <div className="mb-4 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <Button
              className="w-full gap-2"
              disabled={!canSubmit || loading}
              onClick={handleSubmit}
            >
              {loading ? "发布中..." : "发布并分享"}
            </Button>
          </CardContent>
        </Card>
      </section>

      <section id="my-pages" className="mx-auto max-w-2xl px-6 pb-8">
        <UserCenter />
      </section>

      <StatsSection />
    </main>

    <AppFooter />
  </div>
);
```

- [ ] **Step 5: 清理不再需要的导入**

检查不再需要的 `AuthBar` 导入是否仍被使用 — 在未登录分支中仍在使用 `AuthBar`，所以保留。

- [ ] **Step 6: 运行 TypeScript 检查**

Run: `npx tsc --noEmit`
Expected: 无类型错误

- [ ] **Step 7: 运行 dev server 确认**

Run: `npm run dev`
Expected: 本地可访问，切换登录/未登录看到不同的布局

- [ ] **Step 8: 提交**

```bash
git add app/components/HomeHeader.tsx app/components/StatsSection.tsx app/components/AppFooter.tsx app/routes/index.tsx
git commit -m "feat: add login-state homepage with rich logged-in layout"
```
