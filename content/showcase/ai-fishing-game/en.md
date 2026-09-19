---
slug: ai-fishing-game
name: AI Fishing Game
summary: A low-poly 3D fishing game prototype created entirely with Claude Code, Godot, and Blender MCP orchestration.
category: experiment
tags: [Game Development, Claude Code, Godot Engine, Blender MCP, Low Poly]
publishedAt: 2026-09-19
updatedAt: 2026-09-19
author: u/RUSuper
externalUrl: https://www.reddit.com/r/ClaudeAI/comments/1vrjryf/week_3_of_making_my_fishing_game_entirely_with_ai/
facts:
  - key: author
    value: u/RUSuper
  - key: platforms
    value: Windows · macOS
  - key: engine
    value: Godot 4.7.1
  - key: models
    value: Claude (Ultracode) · ChatGPT (OpenAI Playground) · Codex
  - key: token cost
    value: $200/mo Claude Max Plan + $20/mo ChatGPT
    highlight: true
  - key: pipeline
    value: Blender MCP · Godot MCP · Multi-Session Orchestration
sources:
  - title: r/ClaudeAI — Week 3 of making my fishing game entirely with AI
    url: https://www.reddit.com/r/ClaudeAI/comments/1vrjryf/week_3_of_making_my_fishing_game_entirely_with_ai/
    publisher: Reddit
  - title: Claude Artifact 1 — before/after workflow images
    url: https://claude.ai/code/artifact/1c9c24a7-129f-4ccb-b453-d7aed9e5c412
    publisher: Claude
  - title: Claude Artifact 2 — before/after workflow images
    url: https://claude.ai/code/artifact/2c524964-0cf4-43f6-bd4d-9fdffe04806e
    publisher: Claude
cover:
  src: /showcase/ai-fishing-game.jpg
  video: https://v.redd.it/n1pkgaojl3kh1/CMAF_1080.mp4
  videoPoster: /showcase/ai-fishing-game.jpg
---

## What it is

The AI Fishing Game project is a solo game development experiment by developer u/RUSuper, aiming to build a full low-poly fishing and sailing game in Godot entirely through AI assistance. Built over several weeks using Claude (primarily on the Max plan with Ultracode) alongside ChatGPT, the project demonstrates an end-to-end multi-agent pipeline spanning 2D reference art, automated low-poly 3D modeling in Blender via Model Context Protocol (MCP), and custom GLSL water shaders integrated into Godot 4.7.1.

## Core value proposition

The workflow proves that a single creator acting purely as an art director can produce a coherent 3D game environment by orchestrating modular AI sessions:

* **Scripted procedural 3D modeling**: Replaces raw mesh generation tools with a dedicated Claude session connected to Blender via MCP, ensuring models remain editable, low-poly, and stylistically uniform.
* **Strict provenance tracking**: Enforces a decision log explicitly tagging choices as either user-dictated or AI-suggested, eliminating hallucinations where synthetic ideas morph into phantom requirements.
* **Blind visual grading**: Evaluates visual overhauls using in-game camera perspectives scored against pre-established criteria (8/10 threshold) and blind comparisons to eliminate novelty bias.
* **Multi-session agent federation**: Utilizes a master chat session that issues discrete tasks to specialized sub-sessions (modelling, integration, shaders, UI) and manages handoffs between them.

## What it can replace

| Target software | Feasibility | Verdict & use-case context |
| --- | --- | --- |
| Manual low-poly 3D modeling | Moderate | Claude via Blender MCP scripts simple props, docks, and boats well; complex rigged characters still require dedicated tools. |
| Traditional shader authoring | High | Claude reliably crafts complex water shaders, wave dynamics, and daytime color transitions directly in Godot. |
| Generative 3D mesh platforms (e.g., Rodin) | High | Scripted low-poly assets produce cleaner topology and smaller file footprints than direct generative mesh outputs. |
| Human UI mock-up workflows | Moderate | Rapidly drafts themed inventory layouts and nautical field guides, though manual spatial polish remains essential. |

## Current realities and limitations

* **Heavy token consumption and rate limits**: Running deep iterations hits the ceilings of Claude's $200/month plan within days, requiring fallback bridges to secondary models like Codex.
* **Environmental nonsense and clipping**: Without constant manual oversight, generative layouts produce illogical geometry like inaccessible walled-off docks, houses nested inside cliffs, and levitating NPCs.
* **Engine thermal throttling**: Complex shader passes and editor simulations push unoptimized mobile hardware (such as MacBooks) to high temperatures and frame drops.
* **Lack of gameplay depth**: While ambient navigation and procedural water shaders look polished from afar, quest mechanics and progression remain bare-bones placeholders.

## Verdict

> **Primary recommendation**
> This project is a benchmark case study for multi-agent game orchestration. It proves that combining scripted MCP tools with strict human-in-the-loop art direction outperforms blind end-to-end generation, offering a viable blueprint for solo indie developers willing to trade manual coding for rigorous system moderation.

## Development lifecycle and iteration loop

The workflow evolved from basic prompt typing into a modular multi-session pipeline governed by an overarching director session.

| Stage | Model / Tool used | Focus |
| --- | --- | --- |
| 2D Reference & UI Mockup | ChatGPT / Playground | Concept art generation for harbor structures, fish field guides, and refit screens |
| 3D Geometry Generation | Claude (Ultracode) + Blender MCP | Scripted creation of low-poly boats, buildings, and props |
| Integration & Shaders | Claude Code + Godot MCP | Water rendering, day/night cycles, scale matching, and coastline placement |
| Polish & Overflow Coding | OpenAI Codex | Bug fixing and script cleanup during weekly Claude rate-limit cooldowns |

## Metrics and monetization

* **Token & Subscription Cost**: $200/month on Claude Max plan, supplemented by a $20/month ChatGPT subscription for concept art and Codex fallback.
* **Current Distribution**: Non-commercial passion project currently in prototype phase; public demo planned once the starting quest loop is finalized.
* **Community Engagement**: Gained over 2,700 upvotes and 240+ comments within the r/ClaudeAI community.

## Community reception and key debates

The thread drew widespread interest from indie developers while highlighting recurring AI game development tensions:

* **Aesthetic praise vs. logical breakdown**: Commenters heavily praised the atmospheric, *Dredge*-like visual presentation, but seasoned designers quickly flagged immersion-breaking inconsistencies, such as blocked-off staircases and crowded building placements.
* **The "Decision Log" validation**: Fellow developers widely praised the practice of logging whether an idea came from the user or the model as essential hygiene against AI prompt creep.
* **Creation as recreation**: Community members debated whether solo AI game development is commercially viable or primarily a new, deeply engaging creative hobby comparable to assembling Lego sets.
