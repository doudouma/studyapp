# shadcn 简约风格调整 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将"码上钉"前端从彩色渐变风格调整为 shadcn 默认中性色系 + 极简点阵装饰背景

**Architecture:** 纯 CSS + 组件层改动，不涉及功能逻辑。CSS 变量保持现有 shadcn neutral 色值不变，在 `app.css` 添加点阵背景装饰，在各组件中用 Lucide 图标替换 emoji，在 `index.tsx` 移除所有 gradient class

**Tech Stack:** Tailwind CSS v4, shadcn base-nova, Lucide React, Geist Variable

---

### Task 1: CSS 样式 — 添加极简点阵装饰背景 + 更新 theme-color

**Files:**
- Modify: `app/styles/app.css`
- Modify: `app/routes/__root.tsx`

- [ ] **Step 1: 在 app.css 中添加点阵装饰背景**

在 `app/styles/app.css` 中，于 `@layer base` 的 `body` 规则之后，添加点阵背景伪元素：

```css
@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
    position: relative;
  }
  body::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image: radial-gradient(circle, hsl(0 0% 0% / 0.04) 1px, transparent 1px);
    background-size: 24px 24px;
    pointer-events: none;
    z-index: -1;
  }
  html {
    @apply font-sans;
  }
}
```

- [ ] **Step 2: 更新根布局的 theme-color**

在 `app/routes/__root.tsx` 中，将 `theme-color` 从彩色改为中性色：

```diff
- { name: "theme-color", content: "#667eea" },
+ { name: "theme-color", content: "#ffffff" },
```

同时在 CSS 的 `.dark` 模式下也提供深色 theme-color。

```diff
+ // Dark mode theme-color is handled via a meta with media attribute
```

实际在 `__root.tsx` 中，改为：

```tsx
{ name: "theme-color", content: "#ffffff" },
{ name: "color-scheme", content: "light dark" },
```

- [ ] **Step 3: Commit**

```bash
git add app/styles/app.css app/routes/__root.tsx
git commit -m "style: add dot-grid background and update theme-color"
```

---

### Task 2: 首页布局 — 移除彩色渐变，调整标题和按钮样式

**Files:**
- Modify: `app/routes/index.tsx`

- [ ] **Step 1: 修改首页主容器的背景和标题样式**

将外面 main 元素的 gradient background 替换为纯色 background：

```diff
- <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#667eea] to-[#764ba2] p-8">
+ <main className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
```

更新 header 区域，移除白色文字和阴影：

```diff
- <header className="mb-8 text-center text-white">
-   <h1 className="text-4xl font-extrabold tracking-tight drop-shadow-lg">
+ <header className="mb-8 text-center">
+   <h1 className="text-3xl font-semibold tracking-tight text-foreground">
     码上钉
    </h1>
-   <p className="mt-2 text-lg opacity-90">
+   <p className="mt-2 text-muted-foreground">
      粘贴或拖拽 HTML，一键生成分享链接
    </p>
  </header>
```

- [ ] **Step 2: 添加 Lucide 图标到标题行**

在文件顶部添加图标导入，并在 header 中添加图标：

```diff
+ import { Code2 } from "lucide-react";

// ...

  <header className="mb-8 text-center">
+   <div className="mb-3 flex justify-center">
+     <div className="inline-flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
+       <Code2 className="size-6" />
+     </div>
+   </div>
    <h1 className="text-3xl font-semibold tracking-tight text-foreground">
      码上钉
    </h1>
```

- [ ] **Step 3: 修改 Tabs variant 为 line**

```diff
- <TabsList className="mb-6">
+ <TabsList variant="line" className="mb-6">
```

- [ ] **Step 4: 修改发布按钮去除渐变**

```diff
- <Button
-   className="w-full bg-gradient-to-r from-[#667eea] to-[#764ba2] hover:from-[#5a6fd6] hover:to-[#6a4292] text-white shadow-lg"
-   disabled={!canSubmit || loading}
-   onClick={handleSubmit}
- >
+ <Button
+   className="w-full"
+   disabled={!canSubmit || loading}
+   onClick={handleSubmit}
+ >
```

- [ ] **Step 5: 修改底部提示文字颜色**

```diff
- <p className="mt-6 text-sm text-white/70">
+ <p className="mt-6 text-sm text-muted-foreground">
```

- [ ] **Step 6: 修改成功页面背景**

```diff
  if (result) {
    return (
-     <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#667eea] to-[#764ba2] p-8">
+     <main className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
```

- [ ] **Step 7: Commit**

```bash
git add app/routes/index.tsx
git commit -m "style: simplify homepage layout with shadcn neutral palette"
```

---

### Task 3: DropZone 组件 — 使用 Lucide 图标替换 emoji

**Files:**
- Modify: `app/components/DropZone.tsx`

- [ ] **Step 1: 在 DropZone 中添加 Lucide 图标导入和替换**

文件顶部添加导入：

```diff
+ import { Upload, FileText, Archive, X } from "lucide-react";
```

文件选中状态：替换 emoji 图标：

```diff
  if (file) {
    return (
      <div className="flex items-center gap-4 rounded-xl border border-border bg-muted/30 p-5">
-       <span className="text-2xl">{file.name.endsWith(".zip") ? "📦" : "📄"}</span>
+       <div className="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
+         {file.name.endsWith(".zip") ? <Archive className="size-5" /> : <FileText className="size-5" />}
+       </div>
```

关闭按钮替换：

```diff
- <button ...>✕</button>
+ <button ...><X className="size-4" /></button>
```

空状态区域：替换 emoji 图标：

```diff
- <div className="text-4xl mb-3">📁</div>
+ <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
+   <Upload className="size-6" />
+ </div>
```

- [ ] **Step 2: Commit**

```bash
git add app/components/DropZone.tsx
git commit -m "style: replace emoji with Lucide icons in DropZone"
```

---

### Task 4: SuccessCard 组件 — 使用 Lucide 图标替换 emoji

**Files:**
- Modify: `app/components/SuccessCard.tsx`

- [ ] **Step 1: 在 SuccessCard 中添加 Lucide 图标导入和替换**

文件顶部添加导入：

```diff
+ import { CheckCircle2, Check, ExternalLink } from "lucide-react";
```

替换成功图标：

```diff
- <span className="text-5xl">✅</span>
+ <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
+   <CheckCircle2 className="size-8" />
+ </div>
```

替换复制成功后的图标 (在按钮文字中)：

```diff
- {copied ? "已复制 ✓" : "复制链接"}
+ {copied ? "已复制" : "复制链接"}
+ {/* ✓ is replaced by the general "copied" text */}
```

为"预览页面"链接添加 ExternalLink 图标：

```diff
+ import { ExternalLink } from "lucide-react";
// ...
- 预览页面 →
+ 预览页面 <ExternalLink className="ml-1 inline size-3.5" />
```

- [ ] **Step 2: Commit**

```bash
git add app/components/SuccessCard.tsx
git commit -m "style: replace emoji with Lucide icons in SuccessCard"
```

---

### Task 5: 验证 — 启动 dev server 确认视觉效果

**Files:**
- Run: dev server

- [ ] **Step 1: 启动 dev server**

```bash
npm run dev
```

- [ ] **Step 2: 检查首页**
  - 背景为浅色 + 点阵装饰
  - 标题使用 Lucide Code2 图标
  - 按钮为纯色 shadcn 风格
  - Tabs 为 line 变体

- [ ] **Step 3: 检查文件上传模式**
  - DropZone 使用 Lucide Upload 图标
  - 选中文件后显示 FileText/Archive 图标

- [ ] **Step 4: 检查发布成功页面**
  - 背景为浅色
  - 成功图标为 Lucide CheckCircle2
  - 预览链接有 ExternalLink 图标
