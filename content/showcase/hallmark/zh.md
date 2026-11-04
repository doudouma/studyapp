---
summary: "面向 Claude Code、Codex、Cursor 与 OpenCode 的反 AI 味设计 Skill：从 50 个主题中发牌，在真实浏览器里渲染，并检查那些让页面看起来像机器生成的破绽。"
tags: [Agent Skill, 设计, Claude Code, Codex, Cursor, 反 AI 味, 开源]
facts:
  - key: 作者
    value: Together AI
  - key: Stars
    value: 47.3K
    highlight: true
  - key: 主题
    value: "50"
  - key: 图片
    value: 755 张（Wikimedia Commons）
  - key: Agent
    value: Claude Code、Codex、Cursor、OpenCode
  - key: 许可证
    value: MIT
---

## 它是什么

Hallmark 是一个插进编程 Agent 的设计 Skill，专门拒绝生成「一眼 AI」的页面。它以 Skill 形式支持 Claude Code、Codex CLI、Cursor 和 OpenCode，由 Together AI 制作。它不靠一句「做得好看点」，而是从 50 个主题里发三张牌，围绕访客要做的事搭页面，在真实浏览器里渲染，再按已知的 AI 破绽逐项检查。

## 它针对的问题

模型总会收敛到同一套视觉习惯：每个标题上方都加一个 eyebrow，全大写加字距的标签，标题里有一个彩色词，整页空框或只有照片，首屏放不下 hero，每页结尾都塞邮件订阅，以及一个点了「谢谢」却什么都没提交的表单。Hallmark 把这些当成缺陷，并拦住其中最严重的一类。

## 一次构建怎么跑

1. 预检读取项目（字体、配色、框架、锁定的 `design.md`），并一次性询问素材：照片、截图、真实数字。不编造内容。
2. `scripts/theme.mjs deal` 给出三个匹配提示词且通过日志的主题；`draw` 按页面任务发牌出结构。
3. 先单独构建 hero，渲染并冷眼评审，之后才做其余部分。
4. `scripts/sloplint.mjs --render` 在八种宽度下检查页面，然后由子 Agent 用全新视角再审一遍。

每个页面都是自包含的 HTML 和 CSS，并在第一行 CSS 注释里记下这次构建所做的决定。

## v2 新增

- **50 个主题。** 每个主题是一种材质（纸张、字体、颜色、表面、组件与纹理），配一张成品页截图；一次构建只读一个。
- **从任务出发。** 预订页能预订，商店能卖货，订阅页能订阅：动作放在该品类该在的位置，页面也以它收尾。
- **Custom。** 说「custom」后，Hallmark 只根据你的提示词设计，但仍受同一套规则和检查约束。
- **你的真实产品。** 指向一个 URL、开发服务器或 App，它会自己截图。
- **真实照片。** 755 张开放许可照片，按主题挑选，并在页面上署名。
- **重设计与审计。** `/hallmark redesign <path>` 在保留内容与接线的前提下重做页面；`/hallmark audit <path>` 只报告不改。

## 三道闸

检查分三档：

- **Floor** 永远不能发布：对比度、焦点、减少动效、编造事实、手机布局崩坏。
- **Reflex** 是模型最容易掉进去的默认套路；有理由的构建可以留痕后推翻其中一条。
- **Finish** 是工艺细节，不阻塞发布。

## 当前局限

- 它是 Skill，不是页面生成器：需要受支持的 Agent 环境与 Node 18+。
- 浏览器检查（`sloplint --render`、截图）还需要 `puppeteer-core` 和 Chrome；没有时只跑静态检查。
- 主题是材质而不是方案，所以同一主题下两个提示词会得到两个不同页面；一致性来自材质，而不是固定模板。
- 50 个主题和照片库是策展观点，不是通用设计系统。
- 星数与功能是某一时点的快照，仓库迭代很快。

## 结论

> **首要建议**
> 当 Agent 反复产出同一种通用落地页时，用 Hallmark。真正有用的是分档闸门和浏览器 lint：它们把「看起来像 AI 做的」变成模型会挂掉的检查清单。

对已经在用 Claude Code、Codex、Cursor 或 OpenCode、又想要一层可复现品味而不想引入完整设计系统的开发者，Hallmark 很合适。如果你需要完整组件库或可视化编辑器，它就没那么对口。

## 来源与版权

由 Together AI 制作。源码与安装说明见 [github.com/Nutlope/hallmark](https://github.com/Nutlope/hallmark)；主题画廊见 [usehallmark.com](https://www.usehallmark.com/)。MIT 许可。
