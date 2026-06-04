# 码上钉 shadcn 简约风格调整设计

## 概述

将"码上钉"（StudyPage）前端界面从目前的彩色渐变风格调整为 shadcn 原生简约风格，使用中性色系，并加入极简几何装饰背景以增加质感。

## 设计目标

- **一致性**：全线采用 shadcn "base-nova" 默认中性色板，移除所有彩色渐变
- **简约性**：减少视觉噪音，突出核心功能（代码输入/文件上传 → 发布）
- **质感**：极简点阵装饰背景替代纯白背景，保持干净但不单调
- **图标统一**：所有 emoji 图标替换为 Lucide 图标

## 变更范围

### 1. CSS 样式 (`app/styles/app.css`)

- 添加极简点阵装饰背景（利用 `body::before` + `radial-gradient`）
- CSS 变量保持现有 shadcn neutral 色值不变

### 2. 首页布局 (`app/routes/index.tsx`)

| 变更项 | 当前 | 改为 |
|--------|------|------|
| 背景 | `bg-gradient-to-br from-[#667eea] to-[#764ba2]` | `bg-background` + 点阵装饰 |
| 标题文字颜色 | 白色 | `text-foreground` |
| h1 样式 | `text-4xl font-extrabold tracking-tight drop-shadow-lg` | `text-3xl font-semibold tracking-tight` |
| 描述文字颜色 | 白色 opacity-90 | `text-muted-foreground` |
| 发布按钮 | 渐变按钮 | shadcn `default` button |
| Tabs 变体 | `default` | `line`（更简约） |
| 底部提示文字 | 白色/70 | `text-muted-foreground` |
| 成功页面背景 | 同彩色渐变 | `bg-background` |

### 3. DropZone 组件 (`app/components/DropZone.tsx`)

- 替换 emoji 图标：📁 → `<Upload />`，📄 → `<FileText />`，📦 → `<Archive />`，✕ → `<X />`
- 样式微调：使用 shadcn 标准边框和圆角

### 4. SuccessCard 组件 (`app/components/SuccessCard.tsx`)

- 替换 emoji 图标：✅ → `<CheckCircle2 />`
- 复制按钮状态图标：✓ → `<Check />`

### 5. 根布局 (`app/routes/__root.tsx`)

- 更新 `theme-color` meta 为中性色

## 不变部分

- shadcn UI 组件文件（button.tsx, card.tsx, tabs.tsx 等）保持不变
- Geist Variable 字体保持不变
- 页面整体居中卡片布局保持不变
- 功能逻辑完全不变

## 实现计划

1. 编辑 `app/styles/app.css` 添加点阵背景
2. 编辑 `app/routes/__root.tsx` 更新 theme-color
3. 编辑 `app/routes/index.tsx` 移除 gradient，调整样式，引入 Lucide 图标
4. 编辑 `app/components/DropZone.tsx` 替换图标
5. 编辑 `app/components/SuccessCard.tsx` 替换图标
6. 启动 dev server 验证效果
