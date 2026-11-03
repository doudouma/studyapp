# 下一步要做的 AI Books 免费工具

按 free-tools 框架，基于现有资产（84 本书、30 门免费课、30 本免费电子书、21 个补充资源、学习路径计算器）评估后，建议按下面顺序做。

## 候选工具评分（1–5）

| 工具 | 需求 | 受众匹配 | 差异 | 产品路径 | 可行性 | 维护 | 外链 | 分享 | 总分 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| AI Project Idea Generator | 4 | 4 | 4 | 5 | 5 | 4 | 4 | 5 | **35** |
| AI Career Path Explorer | 4 | 5 | 3 | 3 | 4 | 3 | 4 | 4 | **30** |
| AI Book Recommender | 5 | 4 | 3 | 2 | 5 | 4 | 3 | 3 | **29** |
| AI Skills Self-Assessment | 4 | 4 | 3 | 2 | 4 | 4 | 4 | 4 | **29** |
| AI Study Plan Generator | 4 | 3 | 2 | 2 | 5 | 4 | 2 | 3 | 25（与计算器重叠） |
| Book vs Course Comparator | 3 | 4 | 3 | 2 | 4 | 3 | 2 | 2 | 23 |
| AI Book Price Tracker | 4 | 4 | 3 | 1 | 2 | 1 | 2 | 2 | 19（维护/API 成本高） |
| AI Book Club Kit | 2 | 2 | 3 | 1 | 3 | 2 | 1 | 2 | 16 |

## 推荐 Top 3

### 1. AI Project Idea Generator（优先做）

**为什么**：唯一同时满足「AI 学习人群 + 100mini 产品」的工具。输出的是「可以发布的小项目」，天然接到 `/host-single-html`。

- **URL**：`/ai-project-ideas`
- **输入**：技能水平、兴趣方向（business/design/writing/engineering）、可用时间、想做的产物类型
- **输出**：3 个项目提案（范围、技术栈、验收标准）+ 每个项目的 1 本书 + 1 门免费课 + 「Publish it with 100mini」CTA
- **数据**：20–30 个手工项目模板，映射到现有书/课；不需要 AI API，确定性生成
- **SEO**：`AI project ideas`、`beginner AI projects`、`AI portfolio projects`、`things to build with AI`
- **分享**：hash 保存答案，复制链接；可选「发我 4 周构建清单」邮件捕获
- **Schema**：`WebApplication` + `FAQPage`
- **指标**：完成率、复制/分享率、`/host-single-html` 点击、注册转化

### 2. AI Career Path Explorer

- **URL**：`/ai-career-path` 或 `/ai-career-path/{role}`
- **角色**：ML Engineer、AI Product Manager、AI Designer、AI Writer、AI Ops
- **输入**：当前背景、目标角色、每周时间
- **输出**：技能差距 + 3 阶段计划 + 每阶段书/课 + 项目建议
- **SEO**：`how to become an AI product manager`、`AI career path`、`AI skills roadmap`
- **风险**：内容量大，适合在第 1 个工具验证后再做；角色页需独立文案，避免 doorway

### 3. AI Book Recommender（嵌入现有页，不单独建页）

- **位置**：直接嵌在 `/ai-books` 顶部或侧栏，不新建 URL，避免与学习路径计算器/书单页 cannibalization
- **输入**：3 个问题（目标、水平、时间）
- **输出**：1 本书 + 1 门免费课 + 一句「为什么是这本」
- **SEO 价值**：提升 `/ai-books` 的互动与停留，不新增薄页面
- **分享**：hash 链接

## 暂缓

- **AI Book Price Tracker**：需要 Amazon API/定时任务，维护成本高，且产品路径弱
- **AI Book Club Kit**：搜索需求低，内容生成成本高
- **另一个学习计划生成器**：与现有 `/ai-books/learning-path` 重叠

## 4–6 周执行节奏

1. **第 1–2 周**：AI Project Idea Generator MVP（20 个模板 + 结果页 + CTA）
2. **第 3 周**：接入 `/freetool`、Tools 下拉、sitemap、llms.txt；加分享/hash
3. **第 4 周**：上线并观察完成率、CTA 点击、注册；不急着做第 2 个
4. **第 5–6 周**：根据数据决定做 Career Path Explorer，还是先给 Book Recommender 做嵌入版

核心原则：一次只推一个工具，先验证「使用 → 分享 → 发布项目」这条链路，再扩第二个。
