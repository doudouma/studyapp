---
slug: tesana-muranyi-rpg-prototype
name: Tesana Muranyi-3 RPG Prototype
summary: A third-person 3D fantasy action demo vibe coded in two days using Tesana's muranyi-3 model across 39 prompts.
category: experiment
tags: [Vibe Coding, Game Dev, AI Prototype, RPG]
publishedAt: 2026-09-17
updatedAt: 2026-09-17
author: u/sharkymcstevenson2
externalUrl: https://www.reddit.com/r/vibecoding/comments/1ts9psb/vibe_coded_this_game_in_2_days_insane_how_far/
cover:
  src: /showcase/tesana-muranyi-rpg-prototype.jpg
  video: https://v.redd.it/fywogwdnxb4h1/CMAF_1080.m3u8
  videoPoster: /showcase/tesana-muranyi-rpg-prototype.jpg
facts:
  - key: models
    value: muranyi-3
  - key: token cost
    value: $90
    highlight: true
  - key: prompts
    value: 39
  - key: development time
    value: 2 days
  - key: engine
    value: Tesana (Godot-based wrapper)
  - key: genre
    value: Third-person 3D Fantasy / MOBA
sources:
  - title: r/vibecoding — Vibe coded this game in 2 days - insane how far we’ve come
    url: https://www.reddit.com/r/vibecoding/comments/1ts9psb/vibe_coded_this_game_in_2_days_insane_how_far/
    publisher: Reddit
  - title: Introducing Muranyi-3
    url: https://tesana.ai/en/blog/introducing-muranyi-3
    publisher: Tesana AI
---

## What it is

Tesana Muranyi-3 RPG Prototype is an experimental 3D third-person fantasy project generated via iterative natural-language prompting. Built using the [muranyi-3](https://tesana.ai/en/blog/introducing-muranyi-3) model on the Tesana platform, the build showcases a hooded wizard navigating an open mountainous environment with basic movement controls, UI hotbars, and placeholder spell casting effects.

## Core value proposition

The project demonstrates rapid concept-to-render capability for interactive 3D scenes without manual scripting or direct scene-tree authoring:

- **Prompt-driven character controller**: Establishes third-person decoupled camera tracking and omnidirectional movement from simple English descriptions.
- **Natural language scene generation**: Translates high-level environment concepts into textured terrains and landmark backdrops.
- **In-model interface setup**: Generates action hotbars and basic spell icons directly via prompt instructions.
- **Integrated visual effects generation**: Produces directional magic beams, frost impacts, and projectile trajectories matched to character casting states.

## What it can replace

| Target software | Feasibility | Verdict & use-case context |
| --- | --- | --- |
| Unreal Engine 5 Starter Templates | Partial | Suitable for instant visual mockups, but lacks the robust physics, networking, and production tooling of UE5. |
| Unity Third-Person Starter Assets | Partial | Replaces quick whitebox controller setups, though code maintainability remains unverified. |
| Traditional Game Jams (48h) | Moderate | Viable for throwing together non-playable aesthetic prototypes, but falls short on mechanic depth. |

## Current realities and limitations

- **No playable game loop**: The demo consists solely of character mobility and triggerable animations; core combat mechanics, enemy AI, inventory systems, and progression are absent.
- **High cost-to-output ratio**: Reaching a basic interactive scene consumed $90 across 39 iterations, making it far more expensive than using standard free starter asset packs.
- **Opaque engine architecture**: Commenters noted the system appears to function as a thin generative wrapper over Godot, raising concerns about project portability and long-term code maintainability.
- **Scalability and bug-fixing bottlenecks**: Lacking fine-grained structural access makes debugging complex mechanics like desync, hit registration, and state management impractical once project size grows.

## Verdict

> **Primary recommendation**
>
> Useful solely as a visual proof-of-concept for testing text-to-world generative models, but unsuitable for production-bound game engineering.

## Development lifecycle and iteration loop

The project was constructed over a 2-day period using a sequential prompting structure:

| Stage | Model used | Output |
| --- | --- | --- |
| Planning & Foundation | muranyi-3 | Established world geometry, mountainous open terrain, and distant landmarks across 3–4 planning prompts. |
| Character & Camera Rig | muranyi-3 | Configured the third-person wizard model, decoupled orbit camera, and directional locomotion. |
| Action Hotbar & UI | muranyi-3 | Added a 4-slot MOBA-style ability bar with one-handed and two-handed casting states. |
| Spell VFX & Impacts | muranyi-3 | Layered arcane beams, fire projectiles, and frost impact particle effects. |

## Metrics and monetization

- **Token expenditure**: $90 incurred over 39 prompts.
- **Production time**: 2 days of iteration.
- **Monetization**: None; the build is an unreleased internal prototype with no public demo or code repository currently provided.

## Community reception and key debates

The r/vibecoding community reacted with strong skepticism regarding value, authenticity, and technical substance:

- **Cost controversy**: Users pointed out that spending $90 to assemble standard character movement and pre-made environmental meshes compares poorly to spending zero dollars using established engine templates in Unity, Unreal, or Godot.
- **Astroturfing accusations**: Several community members flagged the post as an undisclosed promotion for the [Tesana platform](https://tesana.ai/en/blog/introducing-muranyi-3), noting repeated promotional posts and evasive replies regarding the underlying engine.
- **The "prototype vs. game" divide**: Commenters emphasized that walking across a terrain asset does not constitute a game, underscoring the massive gap between generative asset assembly and functional systems like collision fidelity, damage calculations, and network replication.
