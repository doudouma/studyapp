---
slug: kage
name: Kage
summary: An interactive five-chapter night walk through a Kyoto mountain temple, rendered live in Three.js with AI scene plates.
category: experiment
tags: [Threejs, WebGL, Generative Art, Interactive Storytelling]
publishedAt: 2026-09-20
updatedAt: 2026-09-20
author: MengTo
externalUrl: https://mengto.github.io/kage/
facts:
  - key: author
    value: Meng To
  - key: models
    value: GPT Image 2 · Claude
  - key: stack
    value: Three.js r149 · HTML · CSS · WebGL
  - key: stars
    value: 1600
    highlight: true
  - key: architecture
    value: Single-file static web application (no build step)
sources:
  - title: MengTo/kage GitHub Repository
    url: https://github.com/MengTo/kage
    publisher: GitHub
cover:
  src: /showcase/kage.jpg
---

## What it is

Kage is an interactive, browser-based five-chapter night walk through a stylized Kyoto mountain temple. Conceived and art-directed by Meng To alongside Claude, the project merges procedural 3D elements in Three.js with AI-generated 2D background scene plates and layered foreground cutouts, delivering an atmospheric narrative experience driven entirely by page scrolling.

## Core value proposition

The project demonstrates how generative image assets and procedural WebGL rendering can be blended without requiring heavyweight 3D asset pipelines or runtime build systems.

- **Zero-build static architecture**: Bundled in a standalone `index.html` file using vendored Three.js r149 without npm packages, bundlers, or remote runtime dependencies.
- **Hybrid 2D/3D depth layering**: Combines runtime procedural geometry (terrain, temple structures, torii gates, lanterns) with alpha-preserving WebP image cutouts and high-resolution background plates.
- **Scroll-synchronized choreography**: Ties WebGL camera translation, dynamic weather effects (fog, rain, drifting leaves), and lighting directly to scroll progress.
- **Cinematic post-processing**: Integrates a restrained bloom pipeline, vignette, dynamic depth-of-field blur, and responsive typography designed for both mobile and desktop screens.

## What it can replace

| Target software | Feasibility | Verdict & use-case context |
| --- | --- | --- |
| Traditional 3D game engines (Unity / Unreal WebGL exports) | Moderate | Practical for lightweight scrollytelling and portfolio showcases, but cannot replace complex interactive game physics or dynamic game logic. |
| Video-based scrollytelling sites | High | Vastly superior for bandwidth efficiency and responsive resolution scaling compared to pre-rendered full-screen video scrubbing. |
| Heavy Webpack/Vite 3D web boilerplate | High | Demonstrates that compelling commercial-grade creative coding can be authored and shipped as pure, zero-dependency static HTML/JS. |

## Current realities and limitations

- **Strictly narrative and linear**: Interaction is bound to scroll positioning and pointer trails without free-roam camera controls or branched narrative paths.
- **Asset generation inconsistency**: Layering static 2D generative plates with runtime 3D elements requires careful manual art direction to prevent perspective mismatches.
- **Restricted licensing**: While the underlying Three.js library remains MIT, the repository grants no public reuse or redistribution license for the original Kage code and visual assets.
- **Fixed procedural scope**: Scene geometry and architectural variations are procedurally generated for this specific walk rather than functioning as a general-purpose scene generator.

## Verdict

> **Primary recommendation**
> Kage is a benchmark study for web designers and creative technologists seeking to build high-fidelity interactive storytelling. It proves that combining AI image synthesis with targeted WebGL procedural rendering produces cinematic results while bypassing massive asset pipelines and complex build environments.

## Development lifecycle and iteration loop

The codebase was crafted through human-AI collaborative pairing between Meng To and Claude, relying on explicit prompts documented in `PROMPT.md` to define layout rules, motion language, and procedural scene parameters.

| Stage | Model used |
| --- | --- |
| Visual plate and cutout generation | GPT Image 2 |
| Code implementation and layout debugging | Claude |
| Art direction and composition | Meng To |

## Metrics and monetization

- **GitHub traction**: 1.6k stars and nearly 300 forks within its first month of release.
- **Distribution cost**: Zero server runtime costs; designed to be served directly from GitHub Pages or any static file host without backend infrastructure.
- **Commercial model**: Free public web experiment; serves as an open technical showcase and foundational study for modular web agent skills.

## Community reception and key debates

The project gained rapid attention across the creative coding and AI design communities for its polished aesthetics and lightweight technical footprint. Discussions frequently center on its no-build single-file philosophy, with developers praising the simplicity of running and reading the code directly via `python3 -m http.server`. Minor community discussions touch upon the proprietary license constraint on the source code, contrasting with the open ethos typical of web creative coding experiments.
