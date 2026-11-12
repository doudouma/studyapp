---
slug: fable52-fps-repro
name: Fable 5.2 FPS 复现
summary: 用一句提示词让 Fable 5.2 在 40 分钟里写出一个 131 KB 的单文件 3D 射击游戏，并把它拆成音效、材质、建模三个独立实验分别核算：全程无人值守，AI 自己开浏览器截图自检、自己用离线音频接口查削波，四次实验折算成本约 39.6 美元。
category: experiment
tags: [Fable 5.2, Claude Code, Three.js, WebAudio, 游戏开发, 提示词工程]
publishedAt: 2026-11-12
updatedAt: 2026-11-12
author: WquGuru
externalUrl: https://github.com/wquguru/fable52-fps-repro
facts:
  - key: one prompt
    value: 一句提示词 → 131 KB 单文件 FPS（三波无人机 / 18 个合成音效）
    highlight: true
  - key: experiments
    value: 4 个独立实验 · 5 次运行 · 全部单文件 HTML
  - key: time
    value: 16.6 / 23.9 / 28.7 / 40.8 分钟
  - key: cost
    value: 四个实验合计约 $39.6 · 04 单次 $15.96（不走缓存 $60.57）
  - key: stack
    value: Claude Code headless · Fable 5.2 · agent-browser · OfflineAudioContext
  - key: license
    value: MIT · 55 stars
sources:
  - title: Fable 5.2 从建模到 FPS 游戏完整教程（WaytoAGI 转载）
    url: https://waytoagi.feishu.cn/wiki/WhlCwkIkpi0Y3ik2NHXcB46enUc
    publisher: WaytoAGI / WquGuru
  - title: wquguru/fable52-fps-repro — GitHub（MIT）
    url: https://github.com/wquguru/fable52-fps-repro
    publisher: GitHub
  - title: 在线试玩
    url: https://wquguru.github.io/fable52-fps-repro/
    publisher: GitHub Pages
  - title: 原帖（X）
    url: https://x.com/wquguru/status/2120382704
    publisher: WquGuru
cover:
  src: /showcase/fable52-cover.jpg
---

## 一句话、四十分钟、一个射击游戏

2026 年 11 月 9 日，Anthropic 的 Felix Rieseberg 在 X 上展示了一个用 Fable 5.2 一句话生成的浏览器射击游戏 Saltline：跑了 8 小时、4.45 亿输入 token、折算约 550 美元。两天后，WquGuru 用他公开的那句提示词复现了一次——**40.8 分钟、73 轮、661 万输入 token、折算 15.96 美元**，模型自己做出了一款叫 SUBLEVEL 07 的游戏：潮湿的地下变电站走廊、实时反射的地面、带红点瞄具的卡宾枪、三波悬浮无人机。

他没有只跑这一次。整篇教程把它拆成四个可以分别核算的实验：先单独考音效，再单独考材质，再单独考建模，最后才用原版那句话放模型自由发挥。每一个实验都是**纯代码生成，不加载任何外部图片、模型或音频文件**。

![SUBLEVEL 07 实机画面：地下变电站走廊、卡宾枪与三波无人机的第一波](/showcase/fable52-cover.jpg)

## 工具分工：四个角色、一条命令

这套实验用到的工具很精简：

* **Claude Code** —— 在命令行 headless 模式下自动跑完全程，管理文件读写、缓存设置和预算上限
* **Fable 5.2** —— 写 WebAudio 音频合成代码、Three.js 着色器、顶点建模和游戏逻辑
* **agent-browser** —— 让 AI 在本机 Chrome 里打开自己写的网页、截图自检、看控制台报错、确认 WebGL 跑在真 GPU 上
* **OfflineAudioContext** —— 浏览器离线音频渲染接口，让听不见声音的 AI 能把音频渲染出来，检查峰值、削波和静音段

顺序可以压成一句话：用一条命令行启动 Claude Code 调用 Fable 5.2，传入单次需求与自检系统提示词，让它自己写代码、用浏览器截图调画面、用离线音频接口查声音，中途不插话，直到交出单文件 HTML。

实际操作上只有两个文件：`builder_system.md` 放附加的系统提示词（允许它调用 agent-browser、要求自检、规定产物只写到指定目录），`prompt.md` 放这一次的具体需求。然后：

```
claude -p "$(cat prompt.md)" \
  --model claude-fable-5-2 \
  --permission-mode auto \
  --append-system-prompt "$(cat builder_system.md)" \
  --max-budget-usd 12
```

## 先花 16.6 分钟跑通最小闭环

第一次试不用一上来就跑完整的 FPS。先用最小的音效台把命令行无人值守的流程跑通，折算成本 4.66 美元。三步：

1. **准备环境（2 分钟）** —— Claude Code 升到 2.1.242 以上（作者用的是 2.1.322），本机装好 Chrome 和 agent-browser
2. **新建两个文件（2 分钟）** —— 空文件夹里建 `builder_system.md` 和 `prompt.md`
3. **写入系统提示词（1 分钟）** —— 让 AI 自己截图、查音频，然后跑那条命令

跑出来的东西比提示词要求的多：界面有波形、声谱、频谱三块显示，峰值 / RMS / 音源数实时刷新；14 个声音按钮覆盖步枪室内外、换弹三段、弹壳落地、三种脚步、子弹掠过、跳弹、雨、远雷和一段约 30 秒的配乐；它还自己加了一个「交火演示」按钮，一次把所有声音串起来。每次触发换随机种子——所以同一个按钮按两次，枪声不完全一样。

![SALTLINE 音效台：波形、声谱、频谱，14 个纯代码合成的游戏音效](/showcase/fable52-audio.jpg)

## 板块一：纯代码合成游戏音效台

为什么不加载外部音频文件、全靠振荡器、噪声和滤波器把声音算出来值得单独测？因为它是最能暴露「AI 听不见」这块短板的地方：画面可以截图检查，声音不行。

这一步跑了 16.6 分钟、16 轮，输入 117 万 token，缓存命中率 88.6%，输出 7.8 万 token——折算 4.66 美元，不走缓存要 12.47 美元。生成的单文件 HTML 56 KB。

它按系统提示词的要求，自己用 OfflineAudioContext 离线渲染检查了削波和静音，并在汇报里写明「未经人耳试听」。这句话很重要：**自检能验证的是技术指标，不是好不好听**。

## 板块二：程序化生成雨夜码头材质

第二步不加载任何图片贴图，只允许从 CDN 引入 Three.js 一个库，其余全部在代码里生成：湿混凝土的积水实时反射、刷漆后生锈的瓦楞集装箱（连喷涂箱号都是画上去的）、镀锌钢配电柜、黑色橡胶轮胎、木托盘、带做旧痕迹的黄铜铭牌。

这一步跑了 23.9 分钟、25 轮，输入 246 万 token，缓存命中率 83.8%，折算 8.56 美元，产物 55 KB。它用 agent-browser 打开页面截图自检，还确认了 WebGL 跑在 Apple M2 Pro 的真 GPU 上而不是软件渲染。汇报里它自己列出的缺点是：部分小坑被误判成积水、远景的箱堆是平涂色块。

![雨夜码头材质研究：湿地面反射、生锈集装箱与程序化喷涂的箱号](/showcase/fable52-materials.jpg)

## 板块三：纯代码建模岸桥、货船与步枪

第三步测的是纯代码硬表面建模：不加载任何模型文件，用几何体在 Three.js 里拼出三样东西——

1. **岸桥起重机**：桁架、机房、司机室、8 根起升钢缆、40 英尺吊具，还带装卸动画
2. **215 米集装箱货船**：球鼻艏、12 个贝位的集装箱、驾驶台
3. **第一人称突击步枪**：导轨、制退器、抛壳窗、弹匣、红点瞄具

耗时 28.7 分钟、19 轮，输入 205 万 token，缓存命中率 76.1%，折算 10.38 美元，产物 69 KB。它还在提示词之外自己加了个「码头全景」标签，把三个场景拼到一起——约 185 万三角面，在 M2 Pro 上跑在 120fps 左右。它自己列的缺点也很诚实：第一人称没有手臂。

![模型浏览器：岸桥、货船、步枪与码头全景，纯几何体拼装](/showcase/fable52-models.jpg)

## 板块四：一句话提示词，跑出完整 FPS

前面三个模块验证完，作者把工作目录换成一个干净的空文件夹，只用 Felix 原版那句提示词——去掉开头的 "You know, you should also"，加了一句「单文件 HTML、只用 CDN、不加载外部文件」的环境说明——看看跑一次会做出什么。

这一轮开的是 1 小时缓存：连续跑了 40.8 分钟、73 轮，输入 661 万 token，缓存命中率 90.9%，输出 19.3 万 token。按原价要 60.57 美元，命中缓存后折算 15.96 美元。90.9% 这个数字，正好落在他按原帖数据倒推的 90%–95% 区间里。

模型自己做出的是 SUBLEVEL 07，131 KB 单文件：

* **场景与渲染** —— 潮湿的地下变电站走廊，柱子上有喷涂编号，程序化材质、地面实时反射、AO、bloom、胶片调色，支持三档画质
* **武器与战斗** —— 卡宾枪带红点瞄具、换弹、后坐力、枪口火光和抛壳，三波悬浮无人机（第二波在红色警示灯区域交火），18 个代码合成的音效
* **自动打通测试** —— 交稿前，它自己写了脚本打通全部三波敌人、验证胜利和死亡结算、确认控制台无报错

它自己列出的缺点是：前臂和手套比较简陋、反射只做了地面。

![SUBLEVEL 07：枪口火光、抛壳与警示灯区域交火](/showcase/fable52-fps.jpg)

## 账单：缓存把 60 美元压到 16 美元

所有数据于 2026-11-10 在 Claude Code 2.1.322 下实测，模型为 `claude-fable-5-2`。作者用的是订阅额度，表里的金额是 Claude Code 按官方 API 单价自动折算的，他又用脚本逐项重算核对过；每个实验只跑了一次。

| 实验 | 耗时 | 轮数 | 输入 token | 缓存命中 | 折算成本 | 不走缓存 |
| --- | --- | --- | --- | --- | --- | --- |
| 01 音效台（5 分钟缓存） | 16.6 分钟 | 16 | 117 万 | 88.6% | $4.66 | $12.47 |
| 01 音效台（1 小时缓存对照） | 18.8 分钟 | 16 | 129 万 | 78.6% | $6.97 | $13.98 |
| 02 材质 | 23.9 分钟 | 25 | 246 万 | 83.8% | $8.56 | $24.24 |
| 03 建模 | 28.7 分钟 | 19 | 205 万 | 76.1% | $10.38 | $21.96 |
| 04 一句话 FPS | 40.8 分钟 | 73 | 661 万 | 90.9% | $15.96 | $60.57 |

四个实验合计约 39.6 美元，算上对照组和冒烟测试约 47 美元。关键在于：模型不是一次吐出整个游戏，而是几十轮反复重读工程再修改；缓存命中的单价只有基础输入价的 0.025 倍，只要每轮间隔只有几秒，缓存就一直续上——这就是 04 从 60.57 压到 15.96 的原因。

## 一个意外：为什么前三块写着 SALTLINE

这是作者自己踩的坑，也是整篇里最值得记住的一课。

实验 01–03 是在他创作库里一个**名字带 `saltline` 的文件夹**下跑的，而那个目录里还有一个与游戏无关的写作规范 `AGENTS.md`，会被自动加载。于是 Fable 5.2 直接从文件夹名里取了 `SALTLINE` 打在界面上——所以音效台、材质页、模型浏览器全都有 SALTLINE 字样。

到了实验 04，他把目录换成一个没有任何 `CLAUDE.md` 或 `AGENTS.md` 的空文件夹，模型就自己起了个新名字：**SUBLEVEL 07**。

## 自己跑一遍

仓库是 MIT 协议，四个实验的成品、提示词原文、运行脚本、逐次账单数据都在里面；首页可以分别点开四个纯代码演示在线试玩：

* 仓库：`https://github.com/wquguru/fable52-fps-repro`
* 在线试玩：`https://wquguru.github.io/fable52-fps-repro/`
* 跑法：`scripts/run.sh 01-audio prompts/01-audio.md 5m 12`（最后一个参数是单次预算上限，美元）

## 署名

本文整理自 WaytoAGI 知识库转载的《Fable 5.2 从建模到 FPS 游戏完整教程》，原作者 WquGuru（X [@wquguru](https://x.com/wquguru)），原帖发布于 2026-11-11；项目仓库 wquguru/fable52-fps-repro 以 MIT 授权。灵感来自 Anthropic 的 Felix Rieseberg 用 Fable 5.2 做出的 Saltline，本仓库作品并非 Saltline，也不包含其代码。文中截图来自原教程与仓库，版权归原作者所有；数据均引自作者的实测账单。
