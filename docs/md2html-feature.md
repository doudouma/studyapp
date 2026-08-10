# md2html 功能说明

## 概述

`/md2html` 页面：粘贴/导入 Markdown → 选品牌模板 → 浏览器端解析成精美单文件 HTML → 实时沙箱预览 → 一键导出或复用 `/api/upload` 拿链接落库。

纯前端确定性转换，**零新后端接口**，文件内容不出浏览器。

## 技术栈

| 依赖 | 用途 |
|---|---|
| `marked` | Markdown → HTML 解析（GFM / task-list） |
| `marked-highlight` | marked 与 highlight.js 桥接 |
| `highlight.js` (core) | `pre code` 代码着色，仅注册 7 种常用语言，懒加载 |
| `@zumer/snapdom` | 导出 PNG 时离屏 iframe 截图（动态 import） |

## 功能点

### 编辑器（左栏）

- textarea 直接粘贴/编辑 Markdown，默认填充中/英示例文档（随语言切换）
- 导入/拖入 `.md` / `.markdown` / `.txt` 文件（FileReader 读入），非法格式提示 `md2html.fileTypeError`
- 底部实时显示大小计数，`> 5MB`（`PUBLISH_LIMIT`）阻止提交并标红
- 标题自动提取：取首个 `#` 行作为默认标题（`extractTitle`），未命名则留空
- 支持从 any2md 页经 `sessionStorage`（`any2md.draft`）接力草稿并 toast 提示

### 模板系统

- 9 套品牌模板注册表（`app/lib/md2html/templates/`）：Apple / Spotify / IKEA / Starbucks / Tiffany / 可口可乐 / Linear / 小米 / Swiss
- 每套模板含 `swatch`（色板）+ `css`（完整覆盖 h1-h6、p、a、blockquote、code/pre、table、list、hr、img、task-list 等）
- 部分模板带多组 `variants` 色板，顶部选择器点击同模板即循环切换配色
- 模板 CSS 覆盖：中文字体优先栈、正文行距底色、标题层级、引用、代码块、表格、列表、分隔线等

### 渲染引擎（`app/lib/md2html/render.ts`）

- `renderMarkdown(md, templateId, variantIndex)` → 自包含单文件 HTML
- `marked` 解析 + `highlight.js` 对 `pre code` 着色，产物含 `<!DOCTYPE html>` + meta + 模板 CSS + `<body>` 骨架
- 按模板底色自动选择亮/暗两套 hljs 主题（`isLight` 亮度阈值判断）
- 解析异常降级为 `<pre>` 纯文本展示，不阻塞流程

### 实时预览（右栏）

- `MdPreview` 用 `<iframe sandbox="allow-scripts" srcDoc>` 沙箱渲染，阻断脚本执行
- 300ms 防抖自动渲染，渲染中显示 loading 遮罩

### 导出（`ExportMenu`）

- 下载 `.html`（`text/html;charset=utf-8`）
- 复制完整 HTML 到剪贴板
- 下载 `.png`：动态 import `@zumer/snapdom`，离屏 iframe 渲染后按内容高度截图导出
- 操作后底部 toast 提示成功/失败

### 发布

- 匿名用户直接 POST `/api/upload`：走 `tmp/` 前缀，7 天自动自毁
- 登录用户弹 Dialog：填标题 / 分类（general/chinese/math/english/physics/chemistry/history/biology/geography/other）/ 标签 / 是否分享到广场，永久存储
- 成功后复用 `SuccessCard` 展示链接与过期信息，可一键重置

### 其他

- 中英双语（i18n），示例文档与文案随语言切换
- 完整 SEO：title / description / keywords / OG / twitter / canonical

## 关键文件

| 文件 | 说明 |
|---|---|
| `app/routes/md2html.tsx` | 页面路由 + 全部交互逻辑 |
| `app/lib/md2html/render.ts` | 渲染引擎 |
| `app/lib/md2html/templates/index.ts` | 模板注册表 / 获取与 variant 切换 |
| `app/lib/md2html/templates/<brand>.ts` | 各品牌模板（swatch + css） |
| `app/components/md2html/TemplatePicker.tsx` | 模板/色板选择器 |
| `app/components/md2html/MdPreview.tsx` | iframe 沙箱预览 |
| `app/components/md2html/ExportMenu.tsx` | 导出菜单 |
