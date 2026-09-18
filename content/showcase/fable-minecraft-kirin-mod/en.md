---
slug: fable-minecraft-kirin-mod
name: Fable 5.1 Kirin Minecraft Mod
summary: A custom Minecraft Fabric mod built autonomously by Fable 5.1 from YouTube clips, featuring 3D Blender models and particle FX.
category: experiment
tags: [AI-generated, Minecraft, Game mod, Anthropic, Blender]
publishedAt: 2026-09-18
updatedAt: 2026-09-18
author: u/Fun-Meaning-6474
externalUrl: https://www.reddit.com/r/ClaudeAI/comments/1w5ftqe/fable_51_made_a_minecraft_mod_for_20/
cover:
  src: /showcase/fable-minecraft-kirin-mod.jpg
  video: https://packaged-media.redd.it/at970bo8z4nh1/pb/m2-res_1080p.mp4?m=DASHPlaylist.mpd&c=wh_ben_en&var=sgpssan&v=1&e=1789732800&s=a89f0a73766010a5d5e5c319c8bbfa9fc7ac50a3
  videoPoster: /showcase/fable-minecraft-kirin-mod.jpg
facts:
  - key: models
    value: Anthropic Fable 5.1
  - key: token cost
    value: $20.54
    highlight: true
  - key: version
    value: Fabric 1.21.1
  - key: platforms
    value: Minecraft (Java Edition)
  - key: price
    value: Free (Open-source on GitHub)
  - key: tools used
    value: atomic.chat · Blender MCP Bridge
sources:
  - title: r/ClaudeAI — Fable 5.1 made a Minecraft mod for $20
    url: https://www.reddit.com/r/ClaudeAI/comments/1w5ftqe/fable_51_made_a_minecraft_mod_for_20/
    publisher: Reddit
  - title: MinecraftKirinGunMod — GitHub repository
    url: https://github.com/AtomicChatRepo/MinecraftKirinGunMod
    publisher: GitHub
---

## What it is

The project is a custom Minecraft Fabric mod created almost entirely by an autonomous AI agent running Anthropic's Fable 5.1. Prompted by referencing two YouTube links — an anime clip of Sasuke's Kirin lightning dragon from *Naruto* and gameplay footage of an orbital railgun mod — the AI synthesized both concepts into a working in-game railgun weapon that summons a massive lightning dragon strike upon impact.

## Core value proposition

- **Multi-modal frame analysis**: the agent extracted visual references directly from YouTube videos by ingesting frame-by-frame snapshot feeds.
- **Cross-software tool control**: integrated via a Blender MCP (Model Context Protocol) bridge to model and texture both the weapon and the dragon entity without manual 3D sculpting.
- **Visual feedback iteration**: bug fixes were handled purely by feeding recorded gameplay clips of errors back into the agent rather than writing manual code revisions.
- **End-to-end mod scaffolding**: generated standard Fabric 1.21.1 Java code, asset structures, entity logic, and terrain impact effects in roughly an hour.

## What it can replace

| Target software | Feasibility | Verdict & use-case context |
| --- | --- | --- |
| Manual Blockbench / Blender modeling | Moderate | High capability for rapid entity prototyping and basic rigging, though fine polygon optimization still favors humans. |
| Traditional Fabric mod scaffolding | High | Replaces boilerplate Java coding, registration, and initial entity mechanics setup for standalone item mods. |
| Dedicated VFX / particle scripting | Partial | Suitable for standard area-of-effect destruction and particle bursts; complex custom shader pipelines still need manual tuning. |

## Current realities and limitations

- **Unstructured code output**: code reviews by community members noted chaotic naming conventions and a difficult-to-maintain structure despite functioning gameplay.
- **Token overhead on video input**: analyzing raw video frames consumed approximately 383.6k output tokens and cost over $20 in API usage for a single small mod.
- **Platform dependency**: relies heavily on custom MCP integrations like the Blender bridge and an external orchestrator (`atomic.chat`) to coordinate multi-tool execution.
- **Originality debates**: several mechanics bear strong similarities to existing open-source railgun and lightning mods, raising questions about training-data memorization.

## Verdict

> **Primary recommendation**
>
> A groundbreaking showcase of multimodal agentic workflows where video clips serve directly as visual design specs, drastically lowering the barrier to entry for game modding despite high token costs and unpolished source code.

## Development lifecycle and iteration loop

The author provided two YouTube URLs along with a high-level prompt instructing the agent to combine the weapon mechanic with the lightning dragon aesthetic. Execution was managed using Fable 5.1 in agent mode inside `atomic.chat`.

During the initial pass, Fable parsed the video frames, generated 3D meshes in Blender via MCP, wrote the Fabric mod logic, and compiled the package. When playtesting revealed that the dragon spawned upside down and lacked impact punch, the author simply sent screen-recorded footage back. Fable corrected the orientation, doubled the entity size, and generated custom terrain craters, debris, and fire effects in a single revision cycle.

| Stage | Model / Tool used | Output |
| --- | --- | --- |
| Video Extraction | Browser snapshot extension | Frame-by-frame visual references |
| 3D Modeling & Texturing | Fable 5.1 + Blender MCP Bridge | Dragon entity and railgun 3D assets |
| Mod Logic & Compilation | Fable 5.1 | Fabric 1.21.1 Java codebase |
| QA & Visual Refinement | Fable 5.1 (Vision critique) | Orientation fixes, crater physics, debris FX |

## Metrics and monetization

- **Token usage**: ~383.6k output tokens across initial build and refinement loops.
- **API cost**: $20.54 total Anthropic API spend.
- **Time investment**: ~1 hour from initial prompt to play-tested build.
- **Monetization model**: released 100% free and open-source on GitHub, though community members highlighted short-form video ad revenue as a viable path to recoup creation costs.

## Community reception and key debates

The thread sparked significant attention in r/ClaudeAI, receiving thousands of upvotes for demonstrating end-to-end multimodal agent execution. While some users balked at spending $20 on API tokens for an ephemeral game mod, modders noted that producing custom rigged models, textures, and Java code typically requires days of manual labor.

Key discussions centered on the visual iteration loop — specifically how the model parsed gameplay screen recordings to fix 3D orientation without code-level instructions — alongside debates over whether the underlying mechanics were genuinely synthesized or largely regurgitated from pre-existing open-source mods.
