---
summary: "一份面向 Claude Code / Codex 等编程 Agent 的 369 个 AI 视频与自动化剪辑开源项目清单，按产出、Agent 可用性和文档完整度筛选。"
tags: [AI 视频, 开源, Claude Code, Codex, Agent Skill, Remotion]
facts:
  - key: projects
    value: "369"
    highlight: true
  - key: author
    value: "@leo_xiaolei"
  - key: platform
    value: X / 飞书
  - key: language
    value: 中文
  - key: focus
    value: AI 视频与自动化剪辑
  - key: data
    value: GitHub API 快照 2026-10-27
---

## 它是什么

这是一份中文长文，系统整理了 369 个能让 Claude Code、Codex 等编程 Agent 生成视频、自动剪辑或从代码渲染动效的开源仓库。作者刻意打破了「GitHub 高星滤镜」：星数并不能代表真实生产力，一些只有个位数 Star 的新项目，反而在解决非常具体、刁钻的行业痛点。

它的价值不在于给出一份排行榜，而在于把 369 个仓库按工作流分组，让你不必逐个克隆就能找到合适的起点。

## 收录标准

作者只保留三条底线：

1. **必须围绕视频或动效产出。** 纯 3D 网页不收录；必须是代码渲染出画面，并且能交给 Agent 重做的成片或提示词。
2. **必须专供 Agent 调用。** 包括 Skill、插件、MCP，或明确为 Claude Code、Codex 等 Agent 打造的工具包。
3. **必须有完整的 README。** 没有说明文档的项目，无法验证其实际业务价值。

文中所有星数与项目数据均基于 2026 年 10 月 27 日的 GitHub API 快照，应视为当时信号，而不是实时排名。

## 四大当红框架

| 项目 | 星数 | 它做什么 |
| --- | --- | --- |
| lemo-opuscar | 8,322 | 一套开箱即用的视觉风格引擎，内置 59 种针对 Claude Opus 5.5 调优的代码影片风格。代表作「OPUSCAR 98」长达 6 分 31 秒，一次性展示 98 种风格，全程不调用 AI 视频生成模型。 |
| huashu-art-motion | 5,418 | 花叔开源的艺术动画 Skill，整合 36 种艺术风格、9 种解说语法和 8 种参数化片段，适合做品牌辨识度高的无口播动画或高级讲解片。 |
| huashu-motion | 1,766 | 面向商业产品发布片的自动化流程：读取产品信息、给出三个方向、写出整片，再用 ABC 记谱法配乐。浏览器内可视化修改是杀手锏——按 C 键点中任意一帧即可描述修改意见。 |
| sweety-handdraw-video | 903 | 对 CodeX 友好的手绘口播流水线：输入主题或文章，自动生成口播稿、分镜与插画，再由本地渲染引擎完成描线、上色、手写笔顺和帧级对齐，并集成 VoxCPM 2 语音合成。 |

## 其他值得关注的场景

- **自动剪辑与人机协同：** browser-use/video-use 基于逐词转录自动下刀，剔除语气词与停顿，并完成字幕和 FFmpeg 调色；OpenChatCut 与 BaoCut 负责机器剪完后的人工时间线微调。
- **低星前沿探索：** fragua（11 星）在本地用 FFmpeg 完成竖屏去静音和烧录字幕，无需 API Key；cutloupe（0 星）提供 MCP 与可视化时间线，通过 `look` 命令把真实渲染帧送回模型。
- **代码直出成片与结构化镜头卡：** awesome-opus5-5-videos 收录 703 条 Opus 5.5 代码成片提示词；video-shotcraft 为 Remotion 商业片提供 152 张结构化镜头配方卡和 209 个动效预览。
- **动效逆向工程：** lovisdotio/motion2code 把现有动效视频逆向重建为内联 SVG 与 GSAP 时间线，支持精确定位到任意帧与原片对照。
- **知识讲解、数字人与音乐 MV：** Raven 读取 GitHub 提交历史生成两分钟手绘讲解动画；stickman-video-director 专为不露脸火柴人科普频道设计；lanshu-create-ai-presenter-video 坚持供应商中立，用已有授权图生成合规数字人；digital-human-koubo 用单图加文本经 Renoise MCP 调取 Grok Video 做口型；PDoomVideo 公开完整 MV 源代码。

## 当前局限

- **这是调研，不是横评。** 作者阅读了仓库与 README，但没有对成片质量做统一基准测试。
- **星数天然会过期。** 数据只是单日快照，Agent 项目迭代很快，几周后可能已变化。
- **中文优先。** 分析与筛选逻辑以中文撰写，尽管多数被收录仓库本身是英文项目。
- **链接与维护风险。** 369 个仓库里必然有被放弃或改名的项目，采用前应检查 README、许可证和最近提交。
- **范围偏窄。** 清单只关注面向编程 Agent 的视频与动效，通用视频剪辑器、纯 3D 网页和非 Agent 工具被有意排除。

## 结论

> **首要建议**
> 把它当作候选清单生成器，而不是排行榜。需要成熟工作流时，从四大框架入手；如果管线里有具体缺口，再去低星区淘解决该问题的项目。

最有价值的其实是筛选标准本身：产出必须是视频、工具必须能被 Agent 调用、README 必须完整。对正在用 Claude Code 或 Codex 搭建 AI 视频管线的人来说，这比星数更可靠。采用任何仓库前，仍应核实其当前状态。

## 来源与版权

本案例链接的是 WaytoAGI 飞书转载页。原文由刘老板（@leo_xiaolei）于 2026-10-27 发布在 X；版权归原作者所有，原文链接为准。
