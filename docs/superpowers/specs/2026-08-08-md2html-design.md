# md2html 功能设计

## 背景

参考 `html-anything` 项目的交互模式（粘贴内容 → 选模板 → 渲染 HTML → 一键导出/拿链接），为 studyapp（100mini / 码上钉）新增 md2html 功能。差异点：html-anything 靠本地 AI agent 生成 HTML，而 studyapp 纯 Cloudflare Workers 无本地 agent，故采用**浏览器端确定性转换**：粘贴 `.md` → 选预设模板 → 浏览器端 `marked` 解析 + 套模板 CSS → 生成完整 HTML → 复用现有 `/api/upload` 落库拿链接。

**零新接口**。渲染产物是完整 HTML，直接走现有上传链路，安全 Banner 注入、R2 存储、7 天 tmp 清理、登录用户永久存储 + 广场分享全部免费复用。

## 核心流程

```
粘贴/拖入 .md → 选 1/6 模板 → iframe 实时预览 → 「生成链接」→ POST /api/upload → SuccessCard
```

## 1. 路由与导航

- 新建 `app/routes/md2html.tsx`（路由路径 `/md2html`），三栏布局。
- `HomeHeader.tsx`：未登录 / 已登录两处导航各增加「MD转HTML」链接（i18n key `nav.md2html`）。
- 页面需 `head()` 设置 title/meta，遵循现有路由模式。

## 2. 页面布局（三栏）

```
┌──────────────────────────────────────────────┐
│ AppNav                                        │
├───────────────┬──────────────┬────────────────┤
│  Markdown 编辑器 │  模板选择器(6)  │  iframe 实时预览 │
│  (粘贴/拖入.md) │  (卡片+色板)   │  (srcdoc 沙箱)  │
├───────────────┴──────────────┴────────────────┤
│  「生成链接」→ POST /api/upload → SuccessCard   │
└──────────────────────────────────────────────┘
```

- 编辑器：textarea，支持粘贴文本、拖入/选择 `.md`/`.markdown`/`.txt` 文件（FileReader 读入）。显示字符/大小计数，>5MB 阻止提交。
- 模板选择器：6 张卡片，显示 emoji + 名称 + 风格描述 + 色板 swatch，选中态高亮。
- 预览：`<iframe sandbox="allow-scripts" srcdoc={html}>` 实时渲染，输入 debounce ~300ms。
- 底部「生成链接」按钮：构建完整 HTML → `POST /api/upload` → 成功展示 `SuccessCard`（复用现有组件）。
- 登录用户生成时显示标题/分类/标签/发广场输入（复用首页 UploadForm 逻辑）；标题自动从首个 `# ` 一级标题提取，允许手动覆盖。
- 响应式：移动端三栏纵向堆叠（编辑器 → 模板 → 预览），桌面端三栏。

## 3. 六个预设模板

每套模板 = 独立 CSS 主题（字体栈、配色、排版、代码高亮配色）。模板元信息 + CSS 存于模板注册表。

| 模板 id | 名称 | emoji | 风格 | 特征 |
|---|---|---|---|---|
| `kami` | Kami 羊皮纸 | 📜 | 知性编辑 | 暖羊皮纸底 `#f5f4ed` + 墨蓝 `#1B365D` accent + 衬线 |
| `swiss` | 瑞士国际 | ◻️ | 冷理性 | 单一饱和色 `#002FA7` + Inter 无衬线 + 网格留白 |
| `editorial` | 杂志社论 | 📰 | 长文大气 | 超大衬线标题 + 报章奶油底 + 双栏感 |
| `soft` | 暖纸柔 | 🌸 | 亲切圆润 | 暖色系 + 软阴影 + 圆角 + 宽松行距 |
| `minimal` | 极简白 | ⚪ | 纯净 | 纯白底 + 细线分隔 + 极简排版 |
| `dark` | 暗夜阅读 | 🌙 | 夜间笔记 | 深底 + 亮字 + 暗色代码块 |

每个模板 CSS 需覆盖：body 字体/行距/底色、h1-h6、p、a、strong/em、blockquote、code/inline-code、pre（代码块）、table、ul/ol、hr、img、task-list、link。中文优先字体栈（Noto Sans/Serif SC），遵循项目 AGENTS.md 字体约定。

## 4. 文件结构

```
app/
  lib/md2html/
    templates.ts     # 模板注册表：id/名称/emoji/描述/色板/CSS
    render.ts        # renderMarkdown(md, templateId) → 完整 HTML 字符串
  components/md2html/
    TemplatePicker.tsx   # 模板卡片选择器
    MdPreview.tsx        # 沙箱 iframe 预览
  routes/md2html.tsx     # 页面（编辑器 + 选择器 + 预览 + 上传）
```

- `templates.ts` 导出 `MD_TEMPLATES` 数组 + `getTemplate(id)`。
- `render.ts` 内部：`marked`（含 GFM/task-list）解析 → `highlight.js` 对 `pre code` 着色 → 包入模板 HTML 骨架（`<!DOCTYPE html>` + `<head>` meta + 模板 CSS + `<body>`）。代码高亮在**浏览器端**做，产物是自包含单文件 HTML。
- `MdPreview.tsx`：`srcdoc` + `sandbox="allow-scripts"`，不可用 `src`（无持久页面）。

## 5. 新依赖

- `marked`（Markdown → HTML）
- `marked-highlight`（marked 与 highlight.js 桥接）
- `highlight.js`（代码块语法高亮）

浏览器端动态 import，避免 SSR 构建负担。若 esbuild/Vite 对 Node 专有子路径报错，用 `highlight.js/lib/core` + 按需注册常用语言（bash/json/typescript/javascript/css/xml）精简体积。

## 6. i18n

`app/lib/locales/zh.json` / `en.json` 各新增：

- `nav.md2html`：首页导航「MD转HTML」
- `md2html.title` / `md2html.subtitle`
- `md2html.editor` / `md2html.editorPlaceholder`
- `md2html.template` / `md2html.preview`
- `md2html.generate` / `md2html.generating`
- 模板名称/描述可走 `md2html.tpl.kami` 等 key，或在模板注册表内嵌双语对象。

## 7. 错误处理

- 空内容：生成按钮禁用。
- >5MB：阻止提交，size 计数标红。
- 非 `.md/.markdown/.txt` 文件：提示仅支持这些格式。
- marked 解析异常：降级为 `<pre>` 纯文本展示，不阻塞上传。
- `/api/upload` 失败：内联报错（复用 `t("common.errorRetry")` 风格）。

## 8. 测试

- 构建通过：`npm run build`（确认 marked/highlight.js 在 Cloudflare Workers + Vite 下可打包）。
- 手测：粘贴示例 md → 依次选 6 模板 → 预览渲染正确 → 生成链接 → 打开 `/p/{id}` 确认安全 Banner + 模板样式完整。
- 匿名上传：链接 7 天有效，出现在 R2 `tmp/`。
- 登录上传：标题/分类/标签/广场分享正常，缩略图生成正常。
