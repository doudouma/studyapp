---
summary: 一句 prompt、盲评循环和一张金色参考图：Shikhar 如何用 three.js 做出一个不断展开的纸艺世界。
tags: [Three.js, 纸艺, Fable 5.2, Opus 5.5, 盲评, 浏览器游戏]
facts:
  - key: method
    value: 每个部件一个 subagent · 盲评 A/B
    highlight: true
  - key: models
    value: Fable 5.2 + Opus 5.5
  - key: stack
    value: three.js · Vite · MIT
  - key: source
    value: 约 900 KB JS · 50 多个模块
  - key: assets
    value: 19 MB 模型、贴图与音频
  - key: biomes
    value: 上线 5 种 · 探索 15 种 · 昼夜
  - key: target
    value: 中端笔记本稳定 60 fps
  - key: author
    value: Shikhar — 用 AI 做酷东西
  - key: reception
    value: 5.1 万浏览 · 1400 赞 · 85 条回复
---

## 先写 brief，再看到游戏

Shikhar 发的东西里最有用的不是游戏，是那份 prompt。最后上线的名字是 Papertrails；那份文档里几乎其他东西都活了下来。下面按他贴出的图片逐字抄录全文，因为后面讲的都是他拿这份文档做了什么。

## 原始 prompt

逐字抄录自他 thread 里的 prompt 图片：

> **Build "Pop-up Atlas", a browser 3D walking toy, in Three.js.**
>
> **Reference**
> none yet. First generate 4-6 concept frames with imagegen (tilt-shift papercraft diorama, tiny paper traveller, terrain folding up out of an open book, warm lantern light). Collect photos of real pop-up books and papercraft dioramas. These become the target. Match their look and tactile paper feel exactly.
>
> **Details**
> small paper traveller walks across an endless open pop-up book. Terrain ahead folds up out of the flat page: hinged paper tiles (hills, trees, houses, bridges, rivers) rise on springs, overshoot and settle with a slight wobble. Wave function collapse picks tiles so neighbours always connect. Tiles behind fold back flat. Look: matte cardstock, limited warm palette, visible paper edges and fibre, layered cut-paper silhouettes, soft shadows between layers, high-angle tilt-shift camera with strong DOF blur, warm key light + cool fill. Every fold gets a soft paper "flap" sound with varied pitch. Controls: WASD or click to walk, smooth camera follow. No physical-looking UI, no external brand assets.
>
> **Tools**
> Blender (tile models with hinge pivots, traveller, fold animations, baked paper materials → glTF). Codex CLI imagegen (concept frames, paper textures, printed details). Web Audio procedural paper sounds (or samples if better).
>
> **How to work**
> autonomous, no questions; log assumptions. Study reference → checklist of components with measurable targets. One sub-agent per component, each owns its files, project stays running. Loop on every component: separate harsh blind critic, A/B side by side vs reference in random order, says which is better + fixes. Continue until critics can't reliably pick the original and are wowed. Also judge fold motion/spring feel, walking feel, sound, performance (steady 60 fps mid-range laptop). Revert anything that makes it worse. Append-only log. User's explicit instructions override critics.
>
> **Deliver**
> playable Vite build + run instructions, 30-second gameplay capture, final side-by-sides and scores.

这不是“做个纸艺游戏”，而是一张可以被检查的清单。区别就在这里。

## 让 agent 自己造参考

他没有从代码开始。agent 先用 GPT Image 生成概念图，再收集真实的立体书照片，然后测量它们的颜色、边缘和光线。参考在变成风格之前，先变成了一组数字。

接下来是 agent 做不了的决定：Shikhar 亲手挑了一张图作为具体的风格基准。agent 截取游戏画面，为每个 biome 生成一张“gold-style”目标图；动物也照同样方式设计。从这一刻起，每一次渲染都有一个明确的对象可以失败。

## 每个部件一个 subagent，评审不知道哪版是原版

他 prompt 里关于工作方式的规则，是整个项目最个人的部分。读起来不像愿望，更像一份评审协议：agent 自主工作、不提问、把假设记下来；先把参考整理成一份带可测目标的部件清单；每个部件一个 subagent，各自拥有自己的文件，项目始终保持可运行；每次 build 都交给一个独立的、严厉的盲评者，两版并排、随机排序、对着参考比；直到评审“can't reliably pick the original and are wowed”才停。翻折的动作、弹簧手感、行走手感、声音、以及中端笔记本稳定 60 fps 也要一起评；任何让结果变差的改动都要回退；日志只追加；用户的明确指令高于评审。

仓库里还留着这些分工边界。文件开头写着 `OWNER: render agent`、`OWNER: fold agent`、`OWNER: wfc agent`；每个 agent 管自己的配置和调参记录。盲评者是独立的，而且两版顺序随机——他们没法偏袒自己刚做出来的那一版。

这已经不是“写 prompt”了。他设计的是一个评审流程，然后让它在不提问的情况下自己跑。

## 金色目标，五帧

他把同一个机位按每一轮发了出来：first build、art pass、biome pass、gold pass、now、gold target。第一版又亮又空；art pass 把占位的树换成了印刷纸片；biome pass 把地面填满道具；gold pass 加进村庄和灯笼光。最后一张是目标，不是游戏；“now”和“gold target”之间的距离，就是这套循环存在的理由。

然后是数字。相机俯角从 46° 调到 42°，对齐参考图更低的三分之四视角。跟随距离从 14.8 到 12.6 再到 10.8，因为金色参考的取景紧了大约 1.5 倍。饱和度从 1.04 降到 0.92；模糊半径从 19 降到 12.5；动物密度从 1 提到 1.5，因为金色参考的一帧里大约有十只动物。这些不是情绪板上的形容词，是带方向的测量值。

他也会推翻 agent，代码里留着证据。一只本来会认领旅人的猫被关掉了，注释是 `/* user 2026-11-17: no companion */`；跟随行为被设成零，注释是 `/* user 2026-11-17: animals never follow the traveller */`。盲评能比较渲染，但决定不了猫该不该跟着你。那是他的判断。

## 最后留下的地图

风格探索里有十五种 biome，最后上线的是五种：原点是 heartland，东边沙漠、西边雪地、南边花林、北边松林，各自都有昼夜。原点永远是那片温暖的秋日农田，四个邻居的位置固定，所以每种 biome 都在出生点大约十二格以内。

世界用 wave function collapse 生成，地块沿弹簧升起、在旅人身后折回平面；动物会吃草、啄食、惊散、停在枝头；按 Tab 或 E 打开一张会随着探索自己画出来的地图册。地图朝每个方向不断生长。

## 仓库里到底有什么

这不是一个 54 秒的假视频。公开仓库里约有 900 KB JavaScript、五十多个模块，加上 GLB 地块与旅人模型，以及 19 MB 的模型、贴图和音频。运行时只依赖 three.js，许可证是 MIT。可玩版本挂在 GitHub Pages，URL 参数能改 seed、画质、静音、夜晚、生物和动物。那段视频就是这个版本的录屏。

## 属于他的那一部分

代码是模型写的，标准是他的。“Continue until critics can't reliably pick the original and are wowed”不是 prompt 技巧，是一个品味阈值，而且他一直在用数字把它收紧。仓库里最个人的东西，是那些记录他否决意见的注释，以及把某个值从一个测量数挪到另一个测量数的“fixer”记录。

如果只从他的 build 里拿走一件事，拿走顺序：先参考，再标准，再代码，最后是一个不知道自己在看哪一版的评审。纸艺世界是产物，循环才是方法。
