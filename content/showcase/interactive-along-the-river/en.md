---
slug: interactive-along-the-river
name: Interactive Along the River During the Qingming Festival
summary: An interactive 2D horizontal scroll bringing the Song Dynasty streetscape of Along the River During the Qingming Festival to life.
category: experiment
tags: [Canvas-2d, AI-assisted, Interactive-art, Cultural-heritage]
publishedAt: 2026-09-19
updatedAt: 2026-09-19
author: Xian0063
externalUrl: https://xianxie6.github.io/qingming-riverside/
facts:
  - key: author
    value: Xian | 弦 (@Xian0063)
  - key: platforms
    value: Web (Browser)
  - key: tech stack
    value: Canvas 2D · HTML · CSS · JavaScript
  - key: models
    value: Codex
  - key: characters
    value: 141
    highlight: true
  - key: world width
    value: 6,516 units across 3 districts
  - key: tests
    value: 48 automated tests
  - key: backend
    value: None (Pure client-side)
sources:
  - title: "Xian | 弦 on X: 我把《清明上河图》做成了可以互动的横向交互插画"
    url: https://x.com/Xian0063/status/2101027083023699978
    publisher: X (formerly Twitter)
  - title: Interactive Along the River During the Qingming Festival — live demo
    url: https://xianxie6.github.io/qingming-riverside/
    publisher: GitHub Pages
cover:
  src: /showcase/interactive-along-the-river.jpg
---

## What it is

Interactive Along the River During the Qingming Festival is a client-side horizontal web experience developed by Xian | 弦. Rather than slicing or panning the static historical painting, the project reconstructs an entire walking streetscape of the Song Dynasty using AI-generated assets, dynamic layered rendering, and browser-native Canvas 2D. Users navigate a central avatar through three bustling urban districts, encountering autonomous townsfolk, triggered narrative events, changing weather, and boat operations along the river.

## Core value proposition

The project converts a passive, bird's-eye panoramic scroll into an interactive ground-level living world:

- **Traversable 2D multi-layer world**: Renders 141 dynamic on-shore characters, layered shopfront interiors, bridges, and waterways across 6,516 world units without relying on heavy 3D runtimes.
- **Contextual environmental physics**: Footwear placement calculates against bridge heights and transparent sprite contours, preventing visual floating and floor clipping during movement.
- **Narrative event sequencing**: Hand-offs between NPCs—such as tea delivery, cloth hand-overs, and market bargaining—share single-instance item rendering to prevent duplicate prop visual bugs.
- **Interactive boat maneuvering ("Passing the Rainbow Bridge")**: Users drag towlines with variable tension feedback to help barges clear the bridge arch, unlocking collectible illustration drafts.

## What it can replace

| Target software | Feasibility | Verdict & use-case context |
| --- | --- | --- |
| Static Digital Museum Pan/Zoom Viewers | High | Replaces passive zoom-and-pan image viewers with interactive, playable historical immersion for cultural exhibits. |
| WebGL / Three.js Heavy 3D Recreations | Moderate | Replaces complex 3D modeling workflows when visual fidelity depends on authentic 2D ink lines and low-overhead layering. |
| Narrative Historical Educational Games | Low | Cannot fully replace full-fledged narrative games due to absence of backend persistence, inventory systems, or branching dialog. |

## Current realities and limitations

- **Purely client-side state**: Built without a backend service, meaning user progress, earned illustrations, and custom interaction states do not sync across devices or sessions.
- **Early performance drops before optimization**: Heavy density of unculled on-screen characters originally caused frame rates to plunge to 25 FPS before viewport culling and update frequency throttling were introduced.
- **Occasional sprite sorting edge cases**: Strict 2D layer ordering required targeted manual fixes to prevent characters from clipping into furniture or detaching from bridge railings.
- **No full 3D depth**: Because the camera relies on orthographic 2D projection, users cannot turn down branching side alleys or explore depth behind street-facing facades.

## Verdict

> **Primary recommendation**
> An inspiring benchmark for digital heritage preservation and vibe coding. It proves that combining AI visual synthesis with Canvas 2D layering can turn classical art into responsive, interactive playgrounds without the overhead of heavy 3D engines.

## Development lifecycle and iteration loop

The author started with functional experience goals rather than finalized art bibles, prompting Codex with core rules: horizontal scroll format, navigable streetscapes, independent NPC behaviors, and Song-era themes. After Codex generated a cohesive baseline art template featuring muted ink washes and low-saturation earth tones, the remaining environment expanded across three continuous zones.

| Stage | Model / Tool used | Key focus & output |
| --- | --- | --- |
| Visual Rule Definition & Concept Base | Generative AI & Codex | Established perspective shift from bird's-eye to orthogonal street facades; produced base architectural tiles. |
| Core Engine & Layering Architecture | Codex (Canvas 2D / JS) | Separated world into 7 discrete render planes (background, shop interiors, foreground props, walkers, water, weather, UI). |
| Collision & Locomotion Tuning | Codex | Added dual-foot bridge height detection and alpha-mask foot placement calculation. |
| Performance Refactoring & Testing | Codex | Implemented viewport frustum culling, sprite pre-scaling, and built 48 automated test suites for bridge/weather logic. |

## Metrics and monetization

- **User Reach**: Gained over 3,400 views and dozens of reposts/bookmarks within hours of posting on X.
- **Monetization**: Free web experiment with no monetization, paywalls, or backend dependencies.
- **Scale**: Spans 3 major urban districts (6,516 coordinate units), featuring 141 individual NPCs and 7 scripted trade and life encounters.
- **Rendering Performance**: Optimized from an initial 25 FPS bottleneck up to a smooth ~55 FPS on standard browser runtimes.

## Community reception and key debates

Initial reactions on social platforms praised the shift from static digital museum archives to lively, explorable gamification. Discussion among web developers centered on the choice of Canvas 2D over Three.js, with developers commending the lightweight architecture and fast mobile loading times. Others noted the clever balance of AI-assisted asset consistency, remarking that the generated art maintained the atmospheric restraint of Northern Song paintings without feeling like a generic AI collage.
