---
slug: motion-prompt
name: Motion Prompt
summary: 一份给 AI 用的「名字」库：192 个动效、镜头、UI、落地页与摄影手法的名字，每个都配一段会动的样片、一句话含义、示例问法和精确到毫秒的 motion spec；MIT 开源，中英日西五语，还能装成 Agent Skill 直接挑完发给 AI。
category: resource
tags: [动效设计, 提示词库, Canvas, 设计系统, 开源, 多语言]
publishedAt: 2026-11-11
updatedAt: 2026-11-11
author: Shohei Ohtaki
externalUrl: https://showheyohtaki.github.io/motion-prompt/
facts:
  - key: names
    value: 192 个 · 8 个 pack
    highlight: true
  - key: languages
    value: 英 / 日 / 西 / 简体中文 / 繁體中文
  - key: each name
    value: 会动的样片 + 一句话含义 + 示例问法 + motion spec
  - key: license
    value: MIT · 1.9K stars · 187 forks
  - key: install
    value: npx skills add showheyohtaki/motion-prompt
  - key: author
    value: Shohei Ohtaki（株式会社デイトラ）
sources:
  - title: Motion Prompt — gallery
    url: https://showheyohtaki.github.io/motion-prompt/
    publisher: Shohei Ohtaki
  - title: showheyohtaki/motion-prompt — GitHub（MIT）
    url: https://github.com/showheyohtaki/motion-prompt
    publisher: GitHub
cover:
  src: /showcase/motion-prompt-cover.jpg
---

## 卡住人的不是想象力，是名字

作者 Shohei Ohtaki 先是在 X 上发了几条短视频，把动效和镜头运动的名字一个个标出来。几天后评论涌进来，其中一条大意是：**拦住我的不是想象力，是我不知道这种运动叫什么。**

这条评论成了这个项目的起点。如果熟悉各个领域的人，用各种语言，把「和 AI 协作所需要的那套共同语言」铺成一份可以随时翻阅的库，会非常有用——于是他做了 Motion Prompt：不是让你复制某一种风格，而是一座名字的图书馆。

首页的标题写得很直接：**For the creative directors who direct AI.**（写给指挥 AI 的创意总监们）。

## 一个名字长什么样

点开任何一个编号，打开的是一张完整的「词条」：

- 一段 4.7 秒循环的**动效样片**（不是视频，是实时绘制的 Canvas）
- 一句话的**含义**（"A shape turns smoothly into another"）
- **How to ask an AI**：一句可以直接粘贴给模型的示例问法
- **Motion spec**：把这段动效拆成可以照做的步骤——时长、缓动曲线、位移量、边界条件，精确到毫秒和像素
- **Copy prompt / Copy code**：提示词和参考实现都能一键拿走

以 #012「Shape morph」为例，它的 spec 会告诉你：四个形状各 1.175 秒，每一段先停住、再用 0.58 秒变到下一个形状；轮廓由 240 个点表示，同序号的点做线性插值；进度用 backOut（s = 1.6）所以会轻微过冲；颜色在蓝→珊瑚→黄→薄荷之间用二次缓动混合。这样的描述，AI 读完基本能 1:1 复现，人读完也能判断要不要用。

![#012 Shape morph 的详情：样片、含义、示例问法、motion spec 与复制按钮](/showcase/motion-prompt-detail.jpg)

## 八个 pack，192 个名字

八个 pack 各 24 个名字，按编号顺排：

* **001–024 motion**：动态图形——Pop-in、Stagger、Burst、Line draw、Mask reveal、Typewriter、Count-up、Kinetic typography、Easing、Overshoot、Squash & stretch、Shape morph、Particles、Parallax……按「入场与文字 / 运动细节 / 转场与强调」分组
* **025–048 camera**：镜头运动——Pan、Tilt、Dolly in、Zoom in、Tracking shot、Orbit、Crane up、Dolly zoom（Vertigo）、Rack focus……
* **049–072 ui**：UI 组件名——Modal dialog、Drawer、Bottom sheet、Accordion、Dropdown、Tooltip、Popover、Toast notification、Tabs……每个都用一只光标演示怎么触发
* **073–096 lp**：落地页与网页效果——Parallax scrolling、Fade-in on scroll、Sticky header、Pinning、Horizontal scroll、Scroll snap、Scroll progress bar、Hover lift……
* **097–120 photo**：摄影布光与风格——Backlighting、Rim light、Silhouette、Split lighting、Rembrandt lighting、Butterfly lighting……
* **121–144 motion2 / 145–168 lp2 / 169–192 camera2**：三个 pack 的第二弹

值得留意的是 UI 和 LP 两个 pack 的呈现方式：每一个都画成一张小小的线框页面——UI 是安静的米白底、细线框加一只指针；LP 是一台桌面上的浏览器窗口，滚动、吸附、粘性头部都在那个窗口里真的发生。你看到的不是示意图，是效果本身。

![motion pack：深蓝底、四色，每个名字配一段实时动效](/showcase/motion-prompt-motion.jpg)

![camera pack：浅灰底、单一蓝色，用人物和建筑标出镜头怎么走](/showcase/motion-prompt-camera.jpg)

![ui pack：暖白底、线框加光标，演示每个组件的触发方式](/showcase/motion-prompt-ui.jpg)

![lp pack：浏览器窗口里的滚动、吸附与悬停效果](/showcase/motion-prompt-lp.jpg)

## 挑好，直接发给 AI

这份库有三种用法，作者把第一种做成了 Agent Skill：

在终端里跑一行 `npx skills add showheyohtaki/motion-prompt`，之后对 AI 说「打开 motion-prompt 库」，画廊就在浏览器里打开。看到一个想要的，按卡片上的 **Pick**；挑够了，在底部写一句备注（比如「用在片头标题」），按 **Copy picks** 或 **Send to AI**，编号、名字、spec 和备注就一起交给模型了。

第二种用法不需要安装：查到自己想要的那个效果的名字，直接把名字写进提示词。「用 mask reveal 从下往上带出标题，0.6 秒，每行稍微错开」——这句话对编码 AI、视频生成模型、或者对一个真人设计师都成立。

第三种用法是给别的领域再造一份：仓库里附了「翻译」「做你自己的领域」「生成一页速查图」三套提示词，以及渲染视频的脚本；已经有两个完整的示例。

![挑了几个之后：底部的托盘、备注栏和 Copy picks](/showcase/motion-prompt-pick.jpg)

## 每个名字背后是一份能跑的实现

这是它和「灵感合集」最大的区别：每个样片都是一个真实可运行的实现，而且刻意做得可搬运。

源码里的约定是：**一个元素就是一个函数** `cells[i](ctx, w, h, u)`——`ctx` 是 Canvas 2D 上下文，`w`/`h` 是卡片尺寸，`u` 是这一循环里的时间（秒）。画面只取决于 `u`，函数不读时钟、也不用随机数，所以实时播放和逐帧渲染得到的是同一帧。颜色、尺寸、循环长度和公共函数收在每个 pack 的 kit 里，元素只依赖自己 pack 的 kit；没有任何外部库。

这份约定也体现在对外接口上：`api/v1/` 下是静态文件——`catalog.json`（全部 192 条的元数据）、`{ja,en}/catalog.tsv`（索引）、`e/{id}.txt`（单条的说明加完整代码）、`p/{id}.txt`（可直接粘贴的提示词）、`kit/{pack}.js`（该 pack 的公共代码）。Agent Skill 的 CLI 只做 GET 请求，不读取你的项目，也不会把任何东西上传；`pick` 只在本机 `127.0.0.1` 开一个临时监听，接收你在画廊里挑的编号和备注。

## 每个 pack 一种画风，这是故意的

motion 是深蓝加四色；camera 是浅灰加一个蓝；ui 是暖白、黑和一个蓝；lp 是浅灰桌面上的一扇浏览器窗口，朱红作强调色；photo 没有统一配色——每张卡用它自己场景的颜色，效果淡入再淡出，方便前后比较。

作者在 README 里说得很清楚：一个 pack 必须立住的是**名字**，不是统一的美术风格。所以同一份库里，五个 pack 看起来像五个独立的小产品，只有名字和 spec 的写法是一致的。

![photo pack：每张卡一个场景，各自配色，效果淡入淡出以便比较](/showcase/motion-prompt-photo.jpg)

## 五种语言，和它对人的照顾

每个名字的名称、含义、示例问法都有英文、日文、西班牙文、简体中文、繁体中文五个版本（西语、繁中、简中的翻译由社区贡献者起步）。画廊界面本身是英文和日文，另有深夜模式和「Pause」按钮——一按，满屏动效全部停下，这对容易晕动的人很重要。

手机上是单列布局，一次只看一两个名字，反而比桌面更适合「找词」这件事。

![手机上的单列布局](/showcase/motion-prompt-mobile.jpg)

## 结论

> **它把「审美」翻译成了「词汇」。**
> 大多数人和 AI 协作卡住的地方，不是不会描述，是不知道那件事有名字。这份库把 192 个名字、它们的样子、怎么说、以及怎么精确复现，摆在同一个页面上，并且用 MIT 授权让这些都能被搬走——搬进你的提示词、你的视频项目、你自己的领域。

## 署名

Motion Prompt 由 Shohei Ohtaki（株式会社デイトラ，X [@showheyohtaki](https://x.com/showheyohtaki)）制作，画廊在 showheyohtaki.github.io/motion-prompt，代码在 GitHub 以 MIT 授权（使用元素代码时保留首行的署名）。西班牙语、繁体中文、简体中文的翻译分别起步于 @herberthcr、@daddydanielt、@xhonye；「画廊 + Agent Skill」的形式参考了 Lucian UX/UI Prompt。本文截图为实测画廊所得（桌面 1280×900、移动 390×844），样片与卡面版权归作者所有。
