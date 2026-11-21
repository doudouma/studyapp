---
slug: code-film-studio
name: Code Film Studio
summary: 十三个开源仓库拼成一条能跑通的生产线：拆解参考片、选定风格、用代码渲染画面、合成特效，最后用 ffmpeg 出片。
category: resource
tags: [开源, AI 视频, Agent Skill, 动态设计, 清单, FFmpeg]
publishedAt: 2026-11-21
updatedAt: 2026-11-21
facts:
  - key: repositories
    value: 13 个 · 全部开源
  - key: stars
    value: 合计 63.4 万（2026-11-21）
    highlight: true
  - key: styles
    value: 99 种代码渲染风格（Lemo-Opuscar）
  - key: effects
    value: 244 个像素特效（PixelFX）· 308 个合成特效（EffectCraft）
  - key: prompts
    value: 703 条提示词 · 其中 418 条带在线重制
  - key: price
    value: 起步 0 美元 · 真正的成本是 token、显卡和 Remotion 商业授权
  - key: time
    value: 装好之后，一条 40 秒的片子约半天
  - key: requires
    value: Claude Code 或 Codex · Node 20+ · ffmpeg · Python 3.10+
sources:
  - title: JuneYaooo/rea-video — GitHub 仓库
    url: https://github.com/JuneYaooo/rea-video
    publisher: GitHub
  - title: lemomo-ai/lemo-opuscar — GitHub 仓库
    url: https://github.com/lemomo-ai/lemo-opuscar
    publisher: GitHub
  - title: heygen-com/hyperframes — GitHub 仓库
    url: https://github.com/heygen-com/hyperframes
    publisher: GitHub
  - title: storytold/effectcraft — GitHub 仓库
    url: https://github.com/storytold/effectcraft
    publisher: GitHub
  - title: Remotion 授权与价格
    url: https://www.remotion.dev/docs/license/pricing
    publisher: Remotion
  - title: GSAP 现已对所有人免费
    url: https://gsap.com/pricing/
    publisher: GSAP
cover:
  src: /showcase/code-film-studio.png
---

## 十三个仓库，其实是一条生产线

这份清单上周在 X 上转了两轮：十三个 GitHub 仓库，据说能把一个写代码的 agent 变成一整间电影工作室。99 种风格、244 个特效、703 条提示词，0 美元。

当清单看，它是一堆收藏链接。按"每个工具到底对画面做了什么"重排，它就是一条直线：先有东西告诉你参考片是怎么拍的，再有东西决定你的片子长什么样，然后是写画面的、加火花的、导出文件的。

下面就是这个顺序。文中每个数字都在 2026-11-21 对照过仓库、README 或作者自己的评测；每一条关于"好不好用"的判断，都来自真的拿它出过片的人。

![五个阶段，十三个仓库：拆解、定风格、渲染、合成、导出](/showcase/code-film-studio-pipeline.png)

*全文就按这五个阶段展开。下面每个仓库只归其中一步。*

## 这套东西真正给了你什么

- **一张参考片的地图，而不是它的复制品。** Rea-Video 把成片切成镜头，逐镜判断是实拍、AI 生成、3D、代码动效还是录屏，然后给拍摄方案、逐镜提示词，以及一份 agent 能继续往下做的 `VIDEO.md`。
- **一个不用自己发明的风格。** Lemo-Opuscar 把 99 种风格分成 15 类，每个都配一支用代码渲出来的样片。你靠眼睛挑，不靠形容词猜。
- **能 diff 的画面。** HyperFrames 把 HTML/CSS/JS 渲染成确定性的 MP4，Remotion 对 React 组件做同样的事。两者都会留下一个人类能改的工程文件——这是"AI 视频"和"能修好的 AI 视频"的区别。
- **已经调好的动效零件。** 文字和 DOM 交给 GSAP，真 3D 交给 three.js，像素打击交给 PixelFX，要合成器就上 EffectCraft，最后全部交给 ffmpeg。

## 它能替代什么

| 目标软件 | 可行性 | 判断与适用场景 |
| --- | --- | --- |
| Adobe After Effects | Partial | EffectCraft 复刻了 AE 的面板、快捷键和表达式，带了 308 个特效；但它自己的 README 写着 alpha，"目前不推荐用于生产客户项目"。做片头、字幕条、转场够用。 |
| Premiere Pro / DaVinci Resolve | Low | 这套里没有一个是时间线 NLE。Remotion 和 HyperFrames 是渲染器，ffmpeg 是命令行，剪辑本身还是你自己的活。 |
| AI 视频生成（Sora、Veo、Kling） | Low | 这些仓库不生成素材。Rea-Video 会告诉你哪几个镜头得用生成模型，并写好提示词——钱还是要付给模型。 |
| 手工用 Blender | Partial | Blender MCP 让 agent 直接调 `bpy`。程序化摆放、批量处理很强，美术方向基本不管。 |
| 素材库和版权图库 | Moderate | HyperFrames 打包了库存图、音乐、音效和 TTS；其余的工具都默认你自己带素材。 |
| Figma 到动效的交接 | Moderate | 代码渲染风格加 GSAP 能省掉大量设计后的动画工作，但没有一个仓库能干净地导入设计文件。 |

## 每个仓库到底在哪一步有用

| 仓库 | 所在层 | 什么时候用它 | 它做不到什么 |
| --- | --- | --- | --- |
| Rea-Video | 拆解 | 你找到一条想学的片子 | 替你把实拍镜头拍了 |
| Awesome Opus 5.5 Videos | 参考 | 需要被验证过的"提示词→动效"起点 | 给你故事或脚本 |
| Lemo-Opuscar | 风格 | 想要一个成品质感，但不想自己设计 | 在 Claude 系模型之外稳定工作 |
| EffectCraft | 合成 | 需要关键帧、表达式和 AE 肌肉记忆 | 撑过一次客户交付 |
| PixelFX | 特效 | 镜头是像素风或游戏预告 | 帮上实拍画面 |
| ComfyUI | 素材 | 需要生成的静帧、贴图或关键帧 | 在插件升级后保持稳定 |
| Remotion | 渲染 | 视频本身是个带数据的 React 组件 | 对三人以上的公司免费 |
| Remotion Skills | 渲染 | agent 老是把 Remotion 写错 | 代替你读文档 |
| HyperFrames | 渲染 | 你的 agent 写 HTML 比写 React 快 | 一遍就出 90 分的片子 |
| three.js | 3D | 需要粒子、体积光、真实材质 | 替你设计场景 |
| GSAP | 动效 | 文字要飞、要弹、要滑进来 | 驱动一个 3D 场景 |
| Blender MCP | 3D | 活是程序化建模或批量摆放 | 判断渲染好不好看 |
| FFmpeg | 导出 | 任何东西要变成一个文件 | 被跳过 |

## 现在还没解决的事

- **0 美元是起步价，不是总价。** Remotion 对个人和三人以下公司免费，超过就是每人每月 25 美元，或每次渲染 0.01 美元、月最低 100 美元。Lemo 一条片烧 30–60 分钟的 token。ComfyUI 软件免费，但它要显卡。Rea-Video 想要最高准确率，得配一个要付费的视觉模型。
- **免费合成器对自己的半成品状态很坦白。** EffectCraft 的 README 写着功能覆盖 91%、离专业生产大概 45%，macOS 是测试最充分的平台。有位用户做过对比：65 秒竖屏片，150MB 的 EffectCraft 导了约 12 分钟，同一台 64GB 机器上的 After Effects 直接内存不足崩了。
- **"一键出片"这个说法值得被点名。** 这套工具最火的一条批评说得很直白：别信 HyperFrames 或 Remotion 能自动给你剪出高质量视频。它们省掉的是剪辑软件，不是导演。
- **二次压缩过的素材会让判定崩掉。** Rea-Video 的离线工具在微信重压过的片子上是 88.6%，加上视觉模型是 99.6%；有一个开箱案例，离线判定说 35% 是 AI，agent 看过关键帧后实际是 97% 实拍。
- **上下文才是真正的预算。** 十三个一起装，agent 会被一堆理不清的 skill 淹没。一次三个，是能干活的上限。

## 结论

> **首要建议：** 先用三个——Rea-Video 学结构，HyperFrames 出画面，ffmpeg 收尾。等某个具体镜头真的需要了，再装下一个。

这份清单是真的，但它是一条生产线，不是一个装在盒子里的工作室。它省掉的是软件账单和半年的学习曲线；它省不掉的是决定有没有人看的那部分：一个值得抄的参考、一个配得上故事的风格，以及把片子重剪四遍的耐心。

## 一条 40 秒的片子，分几步

| 阶段 | 做什么 | 用时 |
| --- | --- | --- |
| 拆解 | Rea-Video 把参考片切镜，给节奏、字幕和拍摄方案 | 15 分钟 |
| 定风格 | 挑一个 Lemo 风格，或从 Awesome 里抄一条动效提示词 | 10 分钟 |
| 搭骨架 | HyperFrames 起 HTML 时间轴，来回改三轮 | 30 分钟 |
| 3D 与文字 | 主镜头用 three.js，标题用 GSAP | 1 小时 |
| 合成 | EffectCraft 或 PixelFX 补转场和打击感 | 20 分钟 |
| 素材 | ComfyUI 出关键帧和贴图 | 20 分钟 |
| 导出 | ffmpeg 拼接、响度、字幕、出母版 | 5 分钟 |

半天，只算熟练之后。最慢的是第一次安装：agent、Node、ffmpeg、Python，再加每个工具一个插件。

## 数据与成本

| 项目 | 花多少 |
| --- | --- |
| 十三个仓库 | 0 美元，Apache-2.0、MIT、GPL-3.0 混合 |
| Agent 订阅 | 每月 20–200 美元，看套餐和用量 |
| Lemo-Opuscar 一条片 | 30–60 分钟 agent 时间，token 用量不小 |
| Remotion 公司授权 | 每人每月 25 美元，或每次渲染 0.01 美元 |
| ComfyUI | 软件 0 元，显卡和电费是真的 |
| 可选的视频模型 | 按次计费，看你选哪家 |

十三个仓库合计约 63.4 万 star，最高的是 ComfyUI 14.78 万、three.js 11.9 万、HyperFrames 8.75 万。其中七个是 2026 年才建仓的——这套东西一年前还不存在。

## 社区反馈，和值得读的争论

夸得很具体，这是好信号。一位日本用户让 Opus 5.5 通过 MCP 驱动 EffectCraft，全程没碰软件界面，做出了一支歌词 MV，说卡点几乎完美，一周额度只用了 5%。另一位用户在同一台机器上把 EffectCraft 和 After Effects 对比后，仍然决定不把它放进客户项目——150MB 对 5.4GB，12 分钟对内存崩溃，结论是"大多数活够用了，交给工作还是有风险"。

质疑也很具体。流传最广的反面意见认为一键 AI 视频是幻觉，真正出片的人是在用 Claude + Remotion 走完整的脚本、分镜和剪辑流程。这和仓库自己的说法对得上：Rea-Video 反复强调素材版权，EffectCraft 自称 alpha，Remotion 老老实实放了一页授权价格，而不是假装对所有人免费。

还有一条安全提醒，任何这种清单都该带上。10 月出现过一个冒充 Blender MCP 的仓库，作者名和正版只差一个字母，issue 是抄的，插件一启用就从同账号的另一个仓库拉代码。正版是 `ahujasid/mcp-for-blender`。agent 推荐什么之前，先看作者和 commit 历史。

![同一个题材，十二种风格——代码渲染风格库实际能拉开多大差距](/showcase/code-film-studio-styles.png)
