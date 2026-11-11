---
slug: lemo-opuscar
name: Lemo-Opuscar
summary: 一个开源的 Claude Code Skill，把用 Opus 5.5 写代码做出来的视频整理成 66 种现成风格——每个风格都是一份可复用的提示词，外加一支全代码导演、作画、配乐的样片。
category: tools
tags: [Claude Code, Skill, AI 视频, 动态设计, 开源, Opus 5.5]
publishedAt: 2026-11-11
updatedAt: 2026-11-11
author: Lemomo
externalUrl: https://github.com/lemomo-ai/lemo-opuscar
facts:
  - key: styles
    value: 66 种现成风格 · 11 类（文章发布时 59 种）
    highlight: true
  - key: stars
    value: 14.5K（2026-11-10）
  - key: license
    value: MIT · 免费开源
  - key: how it's made
    value: 画面与配乐全由 Opus 5.5 写代码生成 · 配音 TTS · 不用视频模型
  - key: runtime
    value: 一支片约 30–60 分钟 · token 用量不小
  - key: requires
    value: Node 20+ · ffmpeg · Python 3.11+
  - key: install
    value: Claude Code 插件（lemolab marketplace）
sources:
  - title: 这个Skill，让你轻松做59种视频风格，助你涨粉上万
    url: https://mp.weixin.qq.com/s/Yc129owSJnJkk7wvxNpNBw
    publisher: HalfAI
  - title: lemomo-ai/lemo-opuscar — GitHub 仓库
    url: https://github.com/lemomo-ai/lemo-opuscar
    publisher: GitHub
cover:
  src: /showcase/lemo-opuscar.jpg
---

## 它把用 Opus 5.5 做的视频整理成了风格库

各平台最近都在扶持代码视频，靠这类视频一个月涨到上万粉、播放几百万的账号不止一个。做法其实不神秘：一个 Claude Opus 5.5，加一个选题，就能开始。HalfAI 的这篇文章要分享的，是让这件事变简单的那个 Skill——Lemo-Opuscar。

它最强大的地方不是「能做视频」，而是把市面用 Opus 5.5 做出来的视频内容，整理成了一种一种的现成风格。你不用再从头让 AI 构思风格——装上 Skill，说要做哪一种，把选题和素材扔给它，就能生成这种风格的视频。

仓库里的每一支样片，画面和配乐全是 Claude 写代码做出来的，配音用 TTS 合成：没用视频生成模型，也没用素材库画面。每个风格是一份可复用的提示词，外加一支完全用代码导演、作画、配乐的短片。下面这些动图，都是 HalfAI 把仓库拉下来实际跑出来、截出来的。

![LEMO OPUSCAR 风格图鉴海报：59 种风格 · 11 类 · 56 分钟样片](/showcase/lemo-style-guide.jpg)

## 风格图鉴：11 类挨个看

### 剪辑与纪实 · 8 种

给它真实素材，它把素材拼成新闻的画面。字幕新闻很多新闻自媒体在用，静音也能看懂；实时倒计时分屏适合火箭发射报道，格子从 1 开到 9、倒数到点火；体育战术板能把画面冻住、画线、分屏，每个球员的位置和轨迹都很清楚；电视新闻包装则是一整套电视台片头，拿来做日报、早报都行。这一类里还有 1920 年代的新闻影片、延时交响、视觉调查和构成主义蒙太奇——视觉调查详细介绍某一个物品或事件，很适合科普。

![字幕新闻｜美国一年死掉 130 万箱蜜蜂，总数却涨了 6%](/showcase/lemo-captioned-news.gif)

![实时倒计时分屏｜阿尔忒弥斯二号发射的最后一分钟](/showcase/lemo-countdown.gif)

![体育战术板｜冻住画面、画线、分屏](/showcase/lemo-tactics.gif)

![电视新闻包装｜一周四条 AI 新闻，一整套电视台包装](/showcase/lemo-tv-package.gif)

### 实证影像 · 8 种

用地图、卫星地图或 3D 建模介绍地点、拆解产品，而且每个数字都有出处——这是这一类和普通信息图的区别。

![卫星简报｜卫星照着地图去找咸海，找到的是沙漠](/showcase/lemo-satellite.gif)

![产品拆解｜开源键盘的一半，逐层拆开](/showcase/lemo-teardown.gif)

### 手绘与绘画 · 7 种

各种手绘、水彩笔刷、中国水墨，以及油画厚涂、一笔画之类的风格，比较适合讲解类视频。

![中国水墨｜侠客踏水过江，一剑断流](/showcase/lemo-ink.gif)

### 东方传统 · 4 种

皮影戏、浮世绘、红色窗花剪纸、纸雕灯影，都是有亚洲特色、比较风格化的内容。

![皮影戏｜十日炙烤大地，后羿张弓射日](/showcase/lemo-shadowplay.gif)

### 印刷与版画 · 5 种

孔版印刷、木刻版画、铜版画这类偏风格化的印刷质感。

![木刻版画｜村子用一整个冬天铸一口钟](/showcase/lemo-woodcut.gif)

### 图形与排版 · 7 种

有意思的排版风格，比如瑞士动态排版：网格、一个信号色，动作全卡在节拍上。

![瑞士动态排版｜五条规则做一张海报](/showcase/lemo-swiss-type.gif)

### 信息与发布 · 5 种

产品介绍、数据叙事、录屏内容，用来做产品发布。

![数据叙事｜一百个夏天的全球气温，一支铅笔画出来](/showcase/lemo-data-story.gif)

### 卡通与动画 · 4 种

30 年代的橡皮管卡通、80 年代的赛璐璐动画，还有科幻情景喜剧卡通。

![1930s 橡皮管卡通｜一只咖啡杯的厨房大冒险](/showcase/lemo-rubberhose.gif)

### 游戏 · 4 种

16-bit 像素 RPG、微游戏快闪、综艺节奏扁平——偏游戏、比较可爱、比较动态的风格。

![16-bit 像素 RPG｜最后一个存档点](/showcase/lemo-pixel-rpg.gif)

### 电影与时代 · 2 种

1920 年代的默片，还有后室这种新怪谈风格——你可以把素材全部转成这种风格。

![1920s 默片｜面包师追一只逃跑的面包](/showcase/lemo-silent.gif)

![后室 / 新怪谈｜1996 年的一盘夜班录像带](/showcase/lemo-backrooms.gif)

### 材质与 3D · 5 种

积木玩具、纸片立体书、移轴微缩这类 3D 质感。

![积木玩具｜用零件拼出一枚火箭](/showcase/lemo-bricks.gif)

## 为什么值得收藏

文章作者的原话：「说真的，我真的是第一次看到有这样一个仓库」。它的价值不在提示词本身，而在解决一个具体的问题——有些人知道自己想要哪种感觉，但脑子里没有这个风格的名字、没有这个概念。有了按名字索引的风格库，就不用再从零开始让 AI 构思。

## 改成你自己的风格

仓库最近更新的玩法：把自己的品牌色、logo、IP 和账号调性放进去，把现成风格改成你自己的。比如仓库作者把瑞士动态排版改成了「材质网格」——留下网格、节拍和字体，换成陶土、塑料、绒布、玻璃和铬的实物。

![改完的风格：材质网格（底子是瑞士动态排版）](/showcase/lemo-material-grid.gif)

改的过程是一问一答的：一个问题一个问题问你，每题给几个选项、推荐的排第一；先出一张风格图给你看，再做一支 15 到 30 秒的 demo 片，你满意了才存成自己的风格，以后直接叫名字就能用。

## 安装与使用

完全免费开源。它装在 Claude Code 里用，终端跑两行命令（HalfAI 实测装上了）：

```
claude plugin marketplace add lemomo-ai/lemo-opuscar
claude plugin install lemo-opuscar@lemolab
```

![实测安装：marketplace add + plugin install 两步装好](/showcase/lemo-install.jpg)

然后直接说要什么片，风格用中文名就行。README 里的示例：

```
用油画厚涂风格做一支 30 秒的片子，讲我家那只每天在窗台等我下班的橘猫。
```

还没想好做什么也没关系：输入 `/lemo-opuscar:lemo-opuscar` 直接启动，它会先问你这次想做什么——用库里的风格做片、把风格改成你自己的，或者用你存过的风格。

## 开始之前

三个前提，文章里写得很直接：

* **风格绑定 Opus 5.5。** 风格都是按 Claude Opus 5.5 调出来的，换别的模型效果不保证。
* **时间与 token 都不小。** 一支片 agent 大约要做 30 到 60 分钟，token 用量不小。
* **环境有要求。** 电脑上要有 Node 20+、ffmpeg 和 Python 3.11+。

## 结论

> **把它当风格索引，别当视频生成器。**
> 它的真正产品是「风格的名字 + 可复用的提示词 + 一支全代码样片」，视频只是样片的表现形式。挑风格的正确姿势是先看样片——11 类里每类的感觉差异比名字大得多。动手前记三件事：只保证 Opus 5.5、一支片 30–60 分钟、token 消耗不小。

## 署名

整理自 HalfAI 的文章《这个Skill，让你轻松做59种视频风格，助你涨粉上万》与 lemomo-ai/lemo-opuscar 仓库（MIT）。文中动图与截图来自文章作者实测运行仓库，版权归 HalfAI 与 Lemomo；时效数据（66 种风格、14.5K stars）核对于 2026-11-10 的仓库状态，文章发布时为 59 种风格、6.3K stars。
