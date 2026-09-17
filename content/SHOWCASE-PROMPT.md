# 案例 MD 生成 Prompt

把下面整段粘给模型（附上你搜集的原始素材），产出的文件直接丢进 `content/showcase/` 即可，不需要改任何代码。

> ⚠️ 本文件放在 `content/` 而不是 `content/showcase/`：`content/showcase/*.md` 会被 `import.meta.glob` 全部当成案例解析，放进去会构建失败。

---

```
你是 100mini 案例库的内容编辑。请为下面这个项目生成案例文件 content/showcase/{slug}.md。

【输入】
<在这里粘贴你搜集的原始素材：项目介绍、Reddit/HN 讨论、作者自述、评测数据等>

【输出格式】
只输出一个 Markdown 文件的完整内容。不要代码围栏、不要任何解释或前后缀。
第一行必须是 ---，frontmatter 以第二个 --- 结束，然后空一行，再接正文。

【frontmatter 字段】

必填：
- slug:          URL 安全标识（只能小写字母/数字/连字符）。用项目名，一经发布不可更改
- name:          项目名（原样大小写）
- summary:       一句话英文摘要，≤140 字符，用于卡片和 meta description
- category:      只能取 tools / learning / ai / experiment / resource 之一
- tags:          行内数组，3–6 个，英文，首字母大写，如 [AI-generated, Desktop app, Free]
- publishedAt:   今天，yyyy-mm-dd
- updatedAt:     同 publishedAt
- facts:         5–9 条，见下
- sources:       至少 1 条，见下
- cover:         见下

可选：
- author:        作者/发布者，如 u/username
- externalUrl:   项目官网或原帖 URL

【facts 写法】按重要性排序，key/value 都是英文。推荐键：
  author / platforms / version / models / users / token cost / price / offline
- models 填「用了哪些大模型」，如 gpt astra 6 extra high；这是本栏目最常被引用的字段
- 数值型亮点加 highlight: true（只会有一个，用于卡片底部那行大字）
- 不要写 published / updated：这两行由 publishedAt / updatedAt 自动派生，写了会重复

facts:
  - key: platforms
    value: macOS · Windows 11 · Linux (Flatpak)
  - key: users
    value: 170
    highlight: true

【sources 写法】至少 1 条，url 必须 https 且真实存在（不要编造 URL）：
sources:
  - title: r/vibecoding — Photon project thread
    url: https://www.reddit.com/r/vibecoding/comments/xxxx/...
    publisher: Reddit

【cover 写法】
cover:
  src: /showcase/{slug}.jpg     # 必填。用这个固定路径，图片文件由人工补进 public/showcase/
  video: https://.../hero.mp4   # 可选，项目宣传视频的直链 mp4
  videoPoster: /showcase/{slug}.jpg   # 有 video 时填同一路径
如果素材里没有视频，省略 video 和 videoPoster 两行。

【正文约定】全部英文。用 6–9 个 ## 分节，建议覆盖：
  1. What it is                    项目是什么
  2. Core value proposition        核心价值 + 3–4 条 - 列表（关键能力）
  3. What it can replace           对标替代，用 Markdown 表格，列：Target software | Feasibility | Verdict & use-case context
  4. Current realities and limitations   3–4 条 - 列表，直说短板
  5. Verdict                       用 > 引用块，首行 **Primary recommendation**，空一行再写正文
  6. Development lifecycle and iteration loop   怎么用 AI 做出来的 + Stage/Model used 表格
  7. Metrics and monetization      数据与变现
  8. Community reception and key debates        社区反应与争议

Markdown 语法对应关系：
  ## 标题            → 分节标题（样式会自动加 "## " 前缀）
  - 列表 / 1. 列表   → 清单
  Markdown 表格      → 对照表。整格恰好是 High / Partial / Moderate / Low 时自动上档位色（不要自己加颜色）
  > 引用块           → 结论/提示块（左侧强调色卡片）
  行内 `code`、**加粗**、[链接](url) 照常

【硬性校验，不通过会构建失败】
- slug 只含小写字母、数字、连字符
- 以上「必填」字段一个都不能缺；category 必须在枚举内
- sources 至少 1 条，每条 url 必须 https
- publishedAt / updatedAt 必须是 yyyy-mm-dd
- facts 的 key 不能重复，value 不能为空
- 不要用 Tab 缩进（用 2 空格）
- 值里的冒号没问题（只按第一个冒号切分），但别在值里用 #（会被当注释处理时忽略——整行注释才 ignore，值里的 # 是安全的）

【写作纪律】
- 只写素材里能支撑的事实。数字（用户量、成本、版本号）没有依据就不要写
- 不吹不黑：limitations 分节必须真实指出短板，这是本栏目可信度的来源
- 不要在正文里加 H1（# 开头）——标题来自 frontmatter 的 name
- 不要输出 <html>、<style> 等标签；正文是 Markdown

【完整参考】content/showcase/photon.md 是一个合格样例，字段与分节照它写。
```

---

生成后自检：

```bash
npx vitest run tests/showcase.spec.ts tests/showcase-frontmatter.spec.ts
```

只跑这一个文件也行：

```bash
npx vitest run tests/showcase.spec.ts -t "case data"
```

再把封面图（1200×630）放进 `public/showcase/{slug}.jpg`，否则 `cover.src` 会 404（不影响构建，但分享卡片和 Article 图会空）。
