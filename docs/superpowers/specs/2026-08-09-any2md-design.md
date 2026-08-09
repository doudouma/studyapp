# any2md 功能设计

## 背景

参考 `anydoc` 项目（Firecrawl 开源的 Rust 文档转换库），为 studyapp（100mini / 码上钉）新增 any2md 功能：把任意办公文档（Word/PowerPoint/Excel/OpenDocument/RTF/EPUB/CSV/PDF）在浏览器端转成 GitHub Flavored Markdown。

**零新接口、零服务器成本**。转换引擎用 `@firecrawl/anydoc-wasm` 在浏览器端 WASM 运行，文件始终不出本机；产物是 `.md` 文本，仅提供下载/复制/跳转 MD转HTML 继续加工，不落库。

## 核心流程

```
拖入/选择文件 → 浏览器端 WASM 转换 → Markdown 预览 → [下载 .md] [复制] [继续 MD转HTML]
```

## 1. 路由与导航

- 新建 `app/routes/any2md.tsx`（路由路径 `/any2md`），三段式布局。
- `HomeHeader.tsx`：桌面「免费工具」下拉菜单（`ToolsDropdown`）新增「Any转MD」链接（i18n key `nav.any2md`）。
- 页面需 `head()` 设置 title/meta，遵循现有路由模式。

## 2. 页面布局（三段式）

```
┌────────────────────────────────────────────┐
│ AppNav                                      │
├────────────────────────────────────────────┤
│ ① 拖拽/选择文件区（Dropzone）                │
├────────────────────────────────────────────┤
│ ② 结果栏：文件名 → 格式 → 字符数/耗时 →     │
│    [下载 .md] [复制] [继续 MD转HTML]        │
├────────────────────────────────────────────┤
│ ③ Markdown 渲染预览（marked 渲染）          │
└────────────────────────────────────────────┘
```

- **① Dropzone**：大虚线框，点击或拖入文件。支持扩展名 `.doc .docx .ppt .pptx .xls .xlsx .odt .ods .odp .rtf .epub .csv .pdf`。≤20MB 拦截（浏览器端 WASM 转换内存可控的上限）。WASM 引擎加载中时显示「正在加载转换引擎…」，加载失败显示错误 + 重试按钮。
- **② 结果栏**：转换成功后展示文件名、检测到的格式 badge、字符数与耗时，操作按钮：下载 .md / 复制全文 / 继续 MD转HTML。转换失败展示错误文案。
- **③ 预览**：用 `marked`（复用 md2html 的渲染依赖）把 Markdown 渲染为 HTML 展示。错误时不渲染预览，只展示错误信息。

## 3. WASM 转换引擎

新依赖：`@firecrawl/anydoc-wasm`（wasm 二进制 ~2.9MB）。

**仅客户端加载**，SSR 不打包服务器端：

- 页面 `useEffect` 中动态 `import()` 包并调用 `init()`，避免 SSR 构建负担与 Node 环境报错。
- 加载状态管理：`idle → loading → ready | error`，dropzone 展示对应状态。
- 转换调用是同步的（WASM 单线程，阻塞调用线程），大文件会卡主线程，20MB 上限缓解该问题。

API 封装（`app/lib/any2md/convert.ts`）：

```ts
async function ensureEngine(): Promise<void>   // 幂等 init
function toMarkdownFromFile(bytes: Uint8Array, name: string): {
  markdown: string; format: Format; ms: number;
}
```

转换逻辑：

```
format = formatFromBytes(bytes) ?? formatFromPath(name)  // CSV 等无签名格式靠扩展名
markdown = toMarkdownBytes(bytes, format)
```

## 4. 错误处理

`toMarkdownBytes` 抛出的 `Error.code` 映射 i18n 文案：

| code | 含义 | 文案示例 |
|---|---|---|
| `encrypted` | 加密或密码保护 | 文件已加密 |
| `unsupported` | 未知格式或无法转换（如纯图片 PDF） | 不支持的格式 |
| `malformed` | 结构损坏，无可提取内容 | 文件损坏 |
| `resourceLimit` | 超过安全限制 | 文件过大或过于复杂 |
| `missingPart` | 必需部件缺失 | 文件不完整 |

前端也拦截：空文件、>20MB、非支持扩展名。

## 5. 跳转 MD转HTML

- 转换成功后「继续 MD转HTML」按钮：Markdown 存入 `sessionStorage`（key `any2md.draft`），`navigate({ to: "/md2html" })`。
- 修改 `md2html.tsx`：挂载时检测 `sessionStorage` 草稿，有则载入编辑器并清空存储 + 显示 toast「已从 Any转MD 导入」。

## 6. 文件结构

```
app/
  lib/any2md/
    convert.ts           # ensureEngine + toMarkdownFromFile 封装
  components/any2md/
    FileDrop.tsx         # 拖拽/选择上传区（含引擎加载状态）
    ResultPanel.tsx      # 结果栏 + 下载/复制/跳转
    MdView.tsx           # marked 渲染预览
  routes/any2md.tsx      # 页面（三段式）
```

## 7. i18n

`app/lib/locales/zh.json` / `en.json` 各新增：

- `nav.any2md`：导航「Any转MD」
- `any2md.title` / `any2md.subtitle`
- `any2md.drop` / `any2md.dropHint`（拖拽提示、支持格式列表）
- `any2md.loading` / `any2md.loadFailed` / `any2md.retry`
- `any2md.sizeError`（>20MB）
- `any2md.converting` / `any2md.resultStats`（`{{chars}} chars · {{ms}} ms`）
- `any2md.download` / `any2md.copy` / `any2md.continueToMd2html`
- `any2md.error.*`（5 种转换错误 code）
- `md2html.importedFromAny2md`（草稿载入 toast）

## 8. 测试

- `npm run build` 通过，确认 `@firecrawl/anydoc-wasm` 的 wasm 资源在 Vite 下路径正确（`new URL(..., import.meta.url)` 模式）且 SSR 不打包。
- 手测：`docx` / `csv` / `rtf` 各转一次 → 预览正确 → 下载/复制成功 → 跳转 md2html 草稿载入。
- 异常路径：加密文件 / 纯图片 PDF / >20MB / 非支持格式，错误文案正确。
- 首次进入引擎加载态展示正常，加载完成后可转换。
