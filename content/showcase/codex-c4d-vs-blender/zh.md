---
slug: codex-c4d-vs-blender
name: Codex 控制 C4D 与 Blender
summary: 同一句提示词、同一张参考图，分别经 Codex 送进 Blender 和 Cinema 4D：建模型 21 分 09 秒对 22 分 44 秒，最后是渲染器决定了胜负。
category: experiment
tags: [Blender, Cinema 4D, Codex, MCP, 三维建模, 硬表面]
publishedAt: 2026-11-21
updatedAt: 2026-11-21
author: 老鹰（老鹰aic4d）
externalUrl: https://mp.weixin.qq.com/s/WN9I3PKOepLKkLhbSVEqmw
facts:
  - key: model
    value: GPT-6.2 Astra · Codex · 推理档位 Ultra
  - key: setup
    value: MCP 接入 Blender 5.2.3 与 Cinema 4D 2027.0.0
  - key: input
    value: 同一句提示词 · 同一张 600×600 参考图
  - key: build time
    value: Blender 21 分 09 秒 · C4D 22 分 44 秒
    highlight: true
  - key: render
    value: Blender 用免费的 Cycles · 15 秒动画约 40 分钟
  - key: c4d render
    value: 一张都没出成——测试时没有配置合适的渲染器
  - key: verdict
    value: 建模打平 · Blender 赢在收尾
  - key: sample
    value: 一个产品、一次运行、一台机器
sources:
  - title: Codex控制C4D和Blender到底哪个好？渲染品质如何？
    url: https://mp.weixin.qq.com/s/WN9I3PKOepLKkLhbSVEqmw
    publisher: 老鹰aic4d
  - title: Blender — 免费开源的三维创作套件
    url: https://www.blender.org/
    publisher: Blender Foundation
  - title: Maxon Cinema 4D
    url: https://www.maxon.net/en/cinema-4d
    publisher: Maxon
cover:
  src: /showcase/codex-c4d-blender-cover.png
---

## 同一件事，我跑了两遍

本来是录教程时顺手做的对比。想给学员看看新的 Codex 在三维视口里到底能干什么，最诚实的做法就是给两个软件同一份作业，然后坐在旁边看。

提示词一样，参考图一样——一张 600 × 600 的 Hublot Big Bang，镂空机芯。Codex 通过 MCP 分别接进 Blender 5.2.3 和 Cinema 4D 2027.0.0，两边都是 GPT-6.2 Astra，推理档位开到 Ultra。档位拉满是有原因的：机械结构这种活，模型一没耐心就开始糊弄。

这点比听起来重要。它不是在生成一张图，而是在写 Python，调 `bpy` 和 C4D 的接口，自己看视口，一个零件一个零件往上加。表圈什么时候出现的、螺丝什么时候拧上去的、夹板什么时候搭起来的，我都看得见。

![参考图：一张 600×600 的产品照，原样发给两个软件](/showcase/codex-c4d-blender-reference.jpg)

*除了提示词之外唯一的输入。两边看到的是同一个文件。*

## 21 分 09 秒，对 22 分 44 秒

| | Blender 5.2.3 | Cinema 4D 2027.0.0 |
| --- | --- | --- |
| 建模型耗时 | 21 分 09 秒 | 22 分 44 秒 |
| 表壳、指针、机芯 | 都做出来了 | 都做出来了 |
| 检查视口 | 08:16 | 08:07 |
| 渲染器 | Cycles，免费自带 | 没有合适的 |
| 成品图 | 有 | 试渲中止 |

差 1 分 35 秒，在这个量级上等于没差。真正的差别不在时间：两个软件都交出了一只认得出来的表，机芯也是通的，第一眼你很难说哪只是哪只。

![左：Blender 5.2.3 视口。右：Cinema 4D 2027.0.0，退出摄像机并放大](/showcase/codex-c4d-blender-viewport.jpg)

*agent 交活之后的两个视口。C4D 那边退出了摄像机、推近到机芯；Blender 还停在整表构图。*

## 各自做对了什么

Cinema 4D 让我意外的是里面。退出摄像机、往里推，齿轮、镂空指针、六点钟位置的陀飞轮全都在，是分开的零件，不是贴图装出来的。

Blender 赢在外面。表圈刻度更干净，螺丝老老实实坐在沉孔里，六边形橡胶纹和红色壳件在近距离下边缘也没塌。

如果只比模型，这一轮基本是平手——这也是最容易被拿去做标题的结论。真正的分岔发生在下一步。

## 决定胜负的是渲染器

这次测试里，Cinema 4D 没有配置合适的渲染器。我起了个试渲，等了一会儿，关掉了。这是我这台机器的准备问题，不是 C4D 渲染能力的判决——Redshift、Octane 都摆在那儿——但那天晚上发生的就是这件事，所以这篇文章里没有 C4D 的成品图。

Blender 这边有 Cycles，免费，装好就在。金属边缘、拉丝表面、机芯里那些细结构，只有渲完这一遍才真正看得清。模型从来不是瓶颈，收尾才是。

![两张 Cycles 成片：正面机芯，和陀飞轮微距](/showcase/codex-c4d-blender-cycles.jpg)

*同一个场景在 Cycles 里渲两遍。微距那张是分水岭——模型撑不撑得住，一看就知道，它撑住了。*

## 动画这一步，AI 的短板露出来了

我要的是 15 秒：齿轮转起来，几个机位，剪到一起。这 15 秒 Cycles 跑了将近 40 分钟。

齿轮转得没问题。出问题的是导演的部分：从表冠转到机芯特写时，镜头的缓入缓出调得不对，进得太急，出得太软。这种地方，动画师十秒钟就能修好，模型自己完全看不出来。

一个镜头就把现在的分工说清楚了：它能建、能打光，但它还感觉不到一次剪辑。

## 同一个 Blender，差一个模型

那天上午我已经用 Sol 做过一版，也是在 Blender 里。单独看那张图我是喜欢的，表圈上的金属高光很漂亮。两张并排一放，差距就不含蓄了。

![左：上午用 Sol 做的版本。右：GPT-6.2 Astra Ultra。同一个软件，同一份作业](/showcase/codex-c4d-blender-models.jpg)

*同一个软件，同一张参考图。差的是模型和推理预算，不是软件。*

新的这版零件更多、材质过渡更干净，螺丝看起来是螺丝，不是一个个凸起。模型之间到底改了什么我说不准，但体现出来的东西很清楚：耐心。

## 结论

> **首要建议：** 这种硬表面产品活，现在就把 Codex 挂在 Blender 上；Cinema 4D 留给那些你本来就有 Redshift 或 Octane 流水线的镜头。

建模这个问题已经可以不用再争了：机械类产品，Codex 到了能用的程度，不是演示。布光和渲染，我认为到了人类设计师的中高级水平——前提是临摹。给它一张参考图，它能抄得非常漂亮；不给参考、让它自己做美术方向，我不认为还是这个结果。

真正决定我那晚的是渲染器。Blender 能收工，是因为 Cycles 本来就在那儿。C4D 配好渲染器、再多花半小时准备，大概率也能收工。这不是软件的缺陷，这是"免费且已经装好"在晚上十一点值多少钱。

## 这次测试证明不了什么

- **一个产品，一次运行。** 手表是最友好的题：硬表面、重复零件、单一主体、参考图把细节全给全了。有机建模、布料、角色、场景是另外几场仗。
- **没有检查拓扑。** 我是用眼睛和成片判断的，没有去看网格。模型可以看着对，改起来要命。
- **C4D 没得到公平的渲染机会。** 没配 Redshift 或 Octane，对比就只能停在视口，这点我不打算含糊过去。
- **时间是这台机器和这个网络的时间。** 21 分钟只对这台机器、这套 MCP、这个档位成立。你的队列、显卡和服务商负载都会改这个数。
- **模型会变。** 相隔一周的两次运行已经不一样了。任何 benchmark 都只是移动靶上的一帧。
- **成本不是零。** Blender 免费，C4D 是订阅，Ultra 档位跑一次二十分钟以上的工具调用也不免费。

## 花了什么

| 项目 | 实际 |
| --- | --- |
| Blender | 0 元，Cycles 自带 |
| Cinema 4D | 订阅制，渲染器实际上另算 |
| Agent | Codex 的 Ultra 档位，二十多分钟工具调用，token 不少 |
| 机器时间 | 15 秒成片，Cycles 跑掉约 40 分钟 |

真正决定这次对比的账单不是授权费。是你为了搞明白"渲染器根本没装"而多花的那一个小时——把 MCP 接进第二个软件的那个小时。
