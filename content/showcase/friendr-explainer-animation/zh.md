---
summary: "一次完全自主运行的 Claude Code：自己写剧本、做素材、配音配乐、写 Canvas 动画并渲染成片，一支 30–60 秒产品解说视频只花了约 $4。"
tags: [AI 生成, 视频制作, Claude Code, Canvas 动画, 自主智能体, 语音合成]
facts:
  - key: models
    value: Claude Code (Opus 5.5) · OpenRouter TTS · 外部审查模型
  - key: token cost
    value: OpenRouter 约 $4 · Claude Pro 会话额度约 30%
    highlight: true
  - key: runtime
    value: 1.5–2 小时，全程无人值守
  - key: output
    value: 剧本 · 分镜 · 拼贴素材 · 配音 · Canvas 动画 · MP4
  - key: spend cap
    value: $10 OpenRouter 预算上限
  - key: style
    value: 手绘拼贴风，30–60 秒
---

## 它是什么

Dio-V 把社区里一段热门提示词稍作调整，指向自己的个人小项目 Friendr.nl，交给 Claude Code (Opus 5.5) 全权处理：预算是 $10 的 OpenRouter 额度，指令只有一条——做出制作水准尽可能高的 30–60 秒手绘拼贴风产品解说视频，并全程自主运行。大约 1.5–2 小时后，这次会话交付了一支成品 MP4：剧本、美术、配音、音乐、动画全部到位。

## 核心价值主张

* **真正的端到端自主**：一句提示词产出了剧本、分镜概念、拼贴风素材、配音、背景音乐、音效、动画代码和最终渲染——期间作者人不在电脑前。
* **代码优先的动效设计**：动画是纯 JavaScript Canvas 代码，每一帧都是确定性、可编辑、可 diff 的，而不是锁死在视频软件时间线里。
* **帧级音画同步**：智能体把动画帧与生成的配音节奏精确对齐——这恰恰是人类剪辑师耗时最多的一步。
* **内置自我审查**：运行过程中调用外部模型审查初稿，再根据反馈自行修正，最后才渲染成片。

## 它可能替代谁

| 目标方案 | 可行性 | 结论与适用场景 |
| --- | --- | --- |
| 解说视频制作公司 | 中等 | 能覆盖简单产品故事的概念、配音、配乐与动效；品牌级美术指导仍需人工。 |
| After Effects / 动效设计流程 | 部分 | Canvas 代码可自动化简单的拼贴动画，但复杂缓动、3D 与合成仍力不能及。 |
| 模板化视频工具 | 高 | 同样成本下原创度远超素材库模板；所有素材都是为具体产品定制生成的。 |
| 外包配音 + 购买音乐授权 | 高 | TTS 与生成的音频能覆盖短片的旁白与配乐需求，边际成本接近零。 |

## 当前现实与局限

* **配音是 TTS**：语气、重音与情绪受制于语音合成模型的水准；真人旁白的感染力仍然更强。
* **没有创意总监在环内**：作者刻意离开了电脑，剧本基调、幽默感与节奏完全由模型决定——真正的品牌视频应该在动画开始前让人把一道剧本关。
* **拼贴风既是优点也是上限**：手绘拼贴美学能很好地掩盖 AI 动作的瑕疵，但清晰的产品 UI 演示仍需要录屏或专业动效。
* **单次运行的预算风险**：自主运行会把全部预算押在一个创意方向上，没有办法低成本地生成两个方案再择优。

## 结论

> **首要建议**
> 约 $4、零人工工时就能得到一支成品级、看得下去的产品解说视频，这是一个全新的价格锚点。把这套模式当作产品叙事的初稿生成器：先让它自主跑一遍，再把人力投入到真正增值的环节——剧本把关、品牌语感与最终打磨。它还替代不了精心设计的品牌视频，但在单次迭代的成本上无可匹敌。

## 开发历程与迭代闭环

整个过程是一次性的 Claude Code 自主会话，配了一把 OpenRouter 密钥用于调用辅助模型，总耗时约 1.5–2 小时：

| 阶段 | 使用的模型 / 工具 | 重点 |
| --- | --- | --- |
| 策划 | Claude Code (Opus 5.5) | 阅读产品 FAQ，撰写剧本与分镜概念 |
| 素材生产 | Claude Code + OpenRouter TTS | 拼贴风素材、配音、背景音乐、音效 |
| 动画 | Claude Code | 纯 JavaScript Canvas 动画，帧与配音节奏对齐 |
| 审查 | 外部模型（经 OpenRouter） | 审查初稿；智能体自行修复指出的问题 |
| 渲染 | Claude Code | 导出最终 MP4 |

## 这次运行背后的完整 Prompt

作者发布的提示词原文（把 Friendr.nl 换成你自己的产品即可）：

```text
Create a pure javascript animation. 30s-60s whimsical hand drawn collage style with appropriate audio on Friendr.nl.

Entire video should be as high of a production value as possible. Please spend your time on this, it's very important. People should understand what Friendr.nl is for and after seeing the video will want to create an event to try it out. Read the FAQ first.

Use high quality text-to-speech model for generation. You can find open router API key in .env file

You can use any tools you can find access to and resources on the internet. You create the script, the assets, the animation, concept, everything.

I have to go away from my computer so please work autonomously until done. Quality is paramount. Production value should be on professional level.

One more thing: max OpenRouter spend is $10
```

## 数据与变现

* **成本**：OpenRouter API 花费约 $4（上限 $10），外加约 30% 的 Claude Code Pro 会话额度。
* **耗时**：1.5–2 小时完全自主运行，无任何人工干预。
* **分发**：作为社区展示帖发布在 r/ClaudeAI；Friendr.nl 本身是作者的个人副业项目。
