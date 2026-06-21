---
name: unified-navigation-design
description: 未登录状态添加一致导航条，移除我的页面 (UserCenter)
---

# Unified Navigation & Remove UserCenter

## Goal
- 未登录状态拥有与已登录状态一致的导航条（精简版）
- 移除所有状态下的「我的页面」（UserCenter）组件

## Changes

### 1. AppNav 统一导航组件
将 `HomeHeader.tsx` 改造为 `AppNav.tsx`，根据 `user` 是否为空切换两种模式：

**未登录模式（user === null）：**
- 左侧：Logo + 品牌名 "100mini"
- 右侧：登录/注册按钮（点击弹出 AuthBar 中的 Dialog）

**已登录模式（user 存在）：**
- 左侧：Logo + 品牌名 "100mini" + 首页链接
- 右侧：搜索框 + 通知图标 + 设置图标 + 用户头像菜单
- **移除**「我的链接」导航项（因 UserCenter 已移除）

两者共享相同的容器样式：sticky top-0、z-50、w-full、border-b、背景毛玻璃。

### 2. 移除 UserCenter
- 从 `index.tsx` 的未登录渲染分支移除 `<UserCenter />`
- 从 `index.tsx` 的已登录渲染分支移除 `<UserCenter />` 及 `#my-pages` section
- 因为 `UserCenter` 不再被任何地方引用，可删除 `app/components/UserCenter.tsx`

### 3. 更新 AuthBar 集成
- 未登录模式下，导航条右侧的登录按钮需要复用 AuthBar 的 Dialog
- 方法：将 `AuthBar` 的 Dialog 逻辑提取或直接复用，将 `open`/`setOpen` 提升到 `AppNav` 或直接在 `AppNav` 中渲染 `AuthBar` 的按钮

### 4. index.tsx 清理
- 替换顶部 `AuthBar` 浮窗为 `AppNav` 导航条
- 移除 authLoading 状态下的空白占位
- 未登录和已登录共享 `AppNav`，布局统一为全屏 flex column

## Files
| File | Action |
|------|--------|
| `app/components/HomeHeader.tsx` | 改造为 AppNav，支持 auth-aware 模式 |
| `app/routes/index.tsx` | 移除 UserCenter，替换 AuthBar 为 AppNav |
| `app/components/UserCenter.tsx` | 删除 |
| `app/components/AuthBar.tsx` | 复用其 Dialog 逻辑 |
