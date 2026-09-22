---
slug: threejs-architecture-effects
name: Three.js Architecture Effects
summary: Open agent skill generating self-assembling 3D classical architecture in Three.js with procedural PBR materials.
category: tools
tags: [Agent Skill, Three.js, Procedural Generation, Open Source]
publishedAt: 2026-09-22
updatedAt: 2026-09-22
author: Hailey
externalUrl: https://github.com/lhlGitHub/threejs-architecture-effects
facts:
  - key: author
    value: Hailey (lhlGitHub)
  - key: platforms
    value: Node.js 22.13+ · WebGL2 Browsers
  - key: stars
    value: "59"
    highlight: true
  - key: license
    value: MIT
  - key: runner support
    value: Cursor · Claude Code · Codex
  - key: primary stack
    value: TypeScript · React · Three.js · Vite
sources:
  - title: GitHub - lhlGitHub/threejs-architecture-effects
    url: https://github.com/lhlGitHub/threejs-architecture-effects
    publisher: GitHub
cover:
  src: /showcase/threejs-architecture-effects.png
  video: /showcase/threejs-architecture-effects.gif
  videoPoster: /showcase/threejs-architecture-effects.png
---

## What it is

[threejs-architecture-effects](https://github.com/lhlGitHub/threejs-architecture-effects?utm_source=gemini) is an open-source agent skill designed for AI coding assistants like Cursor, Claude Code, and Codex. It instructs AI agents to programmatically assemble real, orbitable 3D classical buildings in Three.js—such as Chinese clock towers or pavilions—brick by brick, complete with timber frames, dougong brackets, layered eaves, and close-up detail cameras without relying on pre-baked video renders or external 3D model assets.

## Core value proposition

The tool bridges the gap between static mesh imports and dynamic procedural web animations by turning architecture into an algorithmic timeline.

- **Solid procedural construction**: Creates actual Three.js geometric entities (brick, wood, plaster, tile, stone, bronze) directly in code rather than relying on paid 3D asset marketplaces.
- **Deterministic 0–1 timeline**: The entire building sequence is mapped to a normalized timeline, supporting seamless playback, pausing, scrubbing, and reversing.
- **Dynamic cinematic controls**: Built-in orbit controls, smooth zoom functionality, and dedicated camera angles for intricate details like eaves and stone lions.
- **Ready-to-run template**: Includes a scaffold script packaging a Vite, React, and Three.js environment that runs locally with standard npm commands.

## What it can replace

| Target software | Feasibility | Verdict & use-case context |
| --- | --- | --- |
| Handcrafted 3D Modeling (Blender/Maya) | Partial | Replaces manual assembly rigging for procedural architectural demos; cannot replace bespoke organic assets. |
| Pre-rendered 3D Exploded Video | High | Directly replaces pre-baked mp4 animation loops with lightweight, real-time interactive canvas scenes. |
| Traditional 3D Asset Marketplaces | Moderate | Eliminates the cost of purchasing structural prop assets for architectural prototypes by generating geometry procedurally. |
| Spline / Webflow 3D Embeds | Moderate | Offers deeper programmatic animation control for developers, though it requires code literacy rather than visual node editors. |

## Current realities and limitations

- **Procedural geometry constraints**: Restricted strictly to procedural math and meshes; complex sculptural forms remain simplified and unsuited for museum-grade historical fidelity.
- **Desktop performance bias**: Heavy procedural draw calls and real-time PBR shaders are optimized for modern desktop WebGL2 browsers and may struggle on low-end mobile devices.
- **No integrated video exporter**: Operates solely as an interactive web canvas and does not include built-in tooling to record or export high-resolution offline videos.
- **Developer-centric execution**: Requires a Node.js 22.13+ runtime, package manager installation, and command-line execution, limiting direct access for non-technical users.

## Verdict

> **Primary recommendation**
> A must-have tool for web developers, creative coders, and technical artists using AI agents to scaffold real-time 3D architectural visualizations without licensing stock 3D models.

## Development lifecycle and iteration loop

The skill was architected to guide AI coding assistants through strict engineering steps rather than allowing freeform generation, ensuring consistent alignment and deterministic assembly.

| Stage | Model used |
| --- | --- |
| Project Scaffolding & Agent Skill Definition | Cursor Agent |
| Procedural Assembly Shader & Timeline Architecture | Codex / Claude Code |
| README Demo Updates & Repository Polish | Cursor Agent |

## Metrics and monetization

The repository is fully open-source under the MIT license, with zero API key dependencies or paid service tiers. As an emerging open project, it has gathered 59 stars and 18 forks on GitHub within its initial commits.

## Community reception and key debates

Early adopters in the AI coding community appreciate the deterministic assembly approach, which avoids the floating-mesh pitfalls common to raw LLM-generated Three.js scenes. The primary technical conversation revolves around balancing runtime shader performance against procedural mesh complexity on mobile devices versus high-end desktop hardware.
