---
slug: fable52-fps-repro
name: Fable 5.2 FPS Repro
summary: One prompt, forty minutes and Fable 5.2 produces a 131 KB single-file 3D shooter — then the same workflow is split into audio, materials and modelling experiments, each costed separately. Fully unattended: the AI screenshots its own work in a browser, renders its own audio offline to check for clipping, and the four experiments come to about $39.6.
category: experiment
tags: [Fable 5.2, Claude Code, Three.js, WebAudio, Game Dev, Prompt Engineering]
publishedAt: 2026-11-12
updatedAt: 2026-11-12
author: WquGuru
externalUrl: https://github.com/wquguru/fable52-fps-repro
facts:
  - key: one prompt
    value: One prompt → a 131 KB single-file FPS (three drone waves, 18 synthesized sounds)
    highlight: true
  - key: experiments
    value: 4 separate experiments · 5 runs · all single-file HTML
  - key: time
    value: 16.6 / 23.9 / 28.7 / 40.8 minutes
  - key: cost
    value: About $39.6 for all four · run 04 costs $15.96 ($60.57 without caching)
  - key: stack
    value: Claude Code headless · Fable 5.2 · agent-browser · OfflineAudioContext
  - key: license
    value: MIT · 55 stars
sources:
  - title: Fable 5.2 from modelling to a full FPS game (reposted by WaytoAGI)
    url: https://waytoagi.feishu.cn/wiki/WhlCwkIkpi0Y3ik2NHXcB46enUc
    publisher: WaytoAGI / WquGuru
  - title: wquguru/fable52-fps-repro — GitHub (MIT)
    url: https://github.com/wquguru/fable52-fps-repro
    publisher: GitHub
  - title: Play online
    url: https://wquguru.github.io/fable52-fps-repro/
    publisher: GitHub Pages
  - title: Original post (X)
    url: https://x.com/wquguru/status/2120382704
    publisher: WquGuru
cover:
  src: /showcase/fable52-cover.jpg
---

## One prompt, forty minutes, one shooter

On 9 November 2026, Anthropic's Felix Rieseberg showed a browser shooter called Saltline on X, generated from a single prompt by Fable 5.2: 8 hours of running, 445 million input tokens, roughly $550. Two days later, WquGuru reproduced it with the prompt Felix published — **40.8 minutes, 73 rounds, 6.61 million input tokens, about $15.96** — and the model produced a game of its own called SUBLEVEL 07: a damp underground substation corridor, real-time reflections on the floor, a carbine with a red-dot sight, and three waves of hovering drones.

He didn't stop at one run. The tutorial splits the workflow into four experiments that can be costed separately: audio first, then materials, then modelling, and only then the original one-liner set loose in an empty folder. Every experiment is **pure code, loading no external images, models or audio files**.

![SUBLEVEL 07 in play: an underground substation corridor, a carbine, and the first of three drone waves](/showcase/fable52-cover.jpg)

## The cast: four tools and one command

The kit is small:

* **Claude Code** — runs the whole thing headless from the command line, handling file I/O, cache settings and a budget cap
* **Fable 5.2** — writes the WebAudio synthesis code, the Three.js shaders, the vertex-built models and the game logic
* **agent-browser** — lets the AI open its own page in your local Chrome, screenshot it, read console errors and confirm WebGL is on a real GPU
* **OfflineAudioContext** — the browser's offline audio renderer, so an AI that cannot hear anything can still render the audio, check peaks, clipping and silent stretches

In one sentence: start Claude Code from the command line with Fable 5.2, pass it a single brief plus a self-checking system prompt, and let it write code, screenshot its own output in a browser and render audio offline — without any interruption until it hands over a single HTML file.

In practice that's two files: `builder_system.md` holds the extra system prompt (allowing agent-browser, requiring self-checks, restricting output to the target directory), and `prompt.md` holds this run's brief. Then:

```
claude -p "$(cat prompt.md)" \
  --model claude-fable-5-2 \
  --permission-mode auto \
  --append-system-prompt "$(cat builder_system.md)" \
  --max-budget-usd 12
```

## First, 16.6 minutes to prove the loop

Don't start with the full FPS. Start with the smallest possible audio console to prove that the unattended command-line loop works; this run came to $4.66. Three steps:

1. **Set up (2 minutes)** — Claude Code 2.1.242 or newer (the author used 2.1.322), plus Chrome and agent-browser on the machine
2. **Create two files (2 minutes)** — `builder_system.md` and `prompt.md` in an empty folder
3. **Write the system prompt (1 minute)** — tell the AI to screenshot and check audio itself, then run the command

What came back was more than asked for: a console with waveform, spectrogram and spectrum panels, live peak / RMS / voice counts, and 14 sound buttons covering indoor and outdoor rifle shots, the three stages of a reload, a shell casing, three footsteps (concrete, metal, puddle), a bullet passing by, a ricochet, rain, distant thunder and about 30 seconds of score. It also added a "firefight demo" button that chains every sound together — and every trigger draws a new random seed, so pressing the same button twice doesn't sound identical.

![The SALTLINE audio console: waveform, spectrogram, spectrum and 14 code-synthesised game sounds](/showcase/fable52-audio.jpg)

## Experiment 01: synthesising game audio in pure code

Why test audio first? Because it is where "the AI can't hear" shows up most sharply: a screenshot can check a picture, but not a sound.

This run took 16.6 minutes over 16 rounds: 1.17 million input tokens, 88.6% cache hit rate, 78k output tokens — $4.66, against $12.47 with no caching. The single-file HTML is 56 KB.

Following the system prompt, it rendered the audio offline with OfflineAudioContext to check for clipping and silence, and its own report says "not listened to by a human ear". That line matters: **self-checks verify technical properties, not whether something sounds good**.

## Experiment 02: procedural materials for a rainy dock

No image textures at all, and only one library from a CDN (Three.js); everything else is generated in code: wet concrete with real-time puddle reflections, painted containers rusting at the edges (even the stencilled box numbers are drawn), galvanised steel cabinets, black rubber tyres, wooden pallets, an aged brass nameplate.

23.9 minutes, 25 rounds, 2.46 million input tokens, 83.8% cache hit, $8.56, and 55 KB of output. It used agent-browser to screenshot its own page and confirmed WebGL was running on the Apple M2 Pro's real GPU rather than a software renderer. Its self-reported flaws: some shallow potholes read as puddles, and the distant container stacks are flat colour blocks.

![The rainy-dock material study: reflective wet ground, rusting containers and procedurally painted box numbers](/showcase/fable52-materials.jpg)

## Experiment 03: building a crane, a ship and a rifle from code

The third test is hard-surface modelling with no model files — geometry only, assembled in Three.js:

1. **A ship-to-shore crane** — trusses, machinery house, driver's cab, eight hoist cables, a 40-foot spreader, plus a loading animation
2. **A 215-metre container ship** — bulbous bow, twelve container bays, a bridge
3. **A first-person assault rifle** — rail, muzzle brake, ejection port, magazine, red-dot sight

28.7 minutes, 19 rounds, 2.05 million input tokens, 76.1% cache hit, $10.38, 69 KB of output. It also added a "dock panorama" tab nobody asked for, stitching the three scenes together: about 1.85 million triangles, running at roughly 120 fps on the M2 Pro. Its own listed flaw is just as honest: the first-person view has no arms.

![The model viewer: crane, ship, rifle and dock panorama, assembled from raw geometry](/showcase/fable52-models.jpg)

## Experiment 04: one prompt, a complete FPS

With the three modules validated, the author moved to a clean, empty folder and used Felix's original prompt — minus the opening "You know, you should also", plus one line about single-file HTML, CDN only, no external files — to see what a single run would produce.

This one used 1-hour caching: 40.8 minutes, 73 rounds, 6.61 million input tokens, 90.9% cache hit, 193k output tokens. At list price that's $60.57; with caching it came to $15.96. The 90.9% lands right inside the 90–95% band he had estimated from the original post's numbers.

What the model built was SUBLEVEL 07, 131 KB in one file:

* **Scene and rendering** — a damp underground substation corridor with stencilled numbers on the pillars, procedural materials, real-time floor reflections, AO, bloom and a filmic grade, with three quality tiers
* **Weapons and combat** — a carbine with red-dot sight, reload, recoil, muzzle flash and shell ejection; three waves of hovering drones (the second in a red warning-light area); 18 sounds synthesised in code
* **Automated playthrough** — before delivering, it wrote its own script that cleared all three waves, verified the win and death states, and confirmed a clean console

Its own listed flaws: the forearms and gloves are crude, and only the floor reflects.

![SUBLEVEL 07: muzzle flash, ejected casings and a firefight in the warning-light area](/showcase/fable52-fps.jpg)

## The bill: caching turns $60 into $16

All figures were measured on 2026-11-10 with Claude Code 2.1.322 and the `claude-fable-5-2` model. The author ran on a subscription, so the amounts are Claude Code's own estimate at official API prices, which he re-computed line by line with a script; each experiment was run once.

| Experiment | Time | Rounds | Input tokens | Cache hit | Cost | No caching |
| --- | --- | --- | --- | --- | --- | --- |
| 01 audio console (5-min cache) | 16.6 min | 16 | 1.17M | 88.6% | $4.66 | $12.47 |
| 01 audio console (1-hour cache) | 18.8 min | 16 | 1.29M | 78.6% | $6.97 | $13.98 |
| 02 materials | 23.9 min | 25 | 2.46M | 83.8% | $8.56 | $24.24 |
| 03 modelling | 28.7 min | 19 | 2.05M | 76.1% | $10.38 | $21.96 |
| 04 one-prompt FPS | 40.8 min | 73 | 6.61M | 90.9% | $15.96 | $60.57 |

The four experiments come to about $39.6, or roughly $47 including the control run and smoke tests. The key is that the model doesn't emit the whole game at once; it re-reads the project and edits it over dozens of rounds. Cache reads cost 0.025× the base input price, and as long as the gap between rounds is only a few seconds the cache keeps renewing — that is how run 04 went from $60.57 to $15.96.

## One accident: why the first three say SALTLINE

This is a pitfall the author hit himself, and the most memorable lesson in the whole piece.

Experiments 01–03 were run in a folder in his creative library whose **name contained `saltline`**, and that directory also held an unrelated `AGENTS.md` writing guide that gets auto-loaded. So Fable 5.2 picked `SALTLINE` out of the folder name and put it on the interface — which is why the audio console, the materials page and the model viewer all carry the word.

For experiment 04 he moved to an empty folder with no `CLAUDE.md` or `AGENTS.md` at all, and the model named its work itself: **SUBLEVEL 07**.

## Run it yourself

The repo is MIT-licensed and contains all four demos, the original prompts, the run scripts and the per-run billing data; all four pure-code demos are playable from the project page:

* Repository: `https://github.com/wquguru/fable52-fps-repro`
* Play online: `https://wquguru.github.io/fable52-fps-repro/`
* How to run: `scripts/run.sh 01-audio prompts/01-audio.md 5m 12` (the last argument is the per-run budget cap in dollars)

## Attribution

Compiled from "Fable 5.2 from modelling to a full FPS game", reposted in the WaytoAGI knowledge base; the original author is WquGuru (X [@wquguru](https://x.com/wquguru)) and the post is dated 2026-11-11. The project repo, wquguru/fable52-fps-repro, is MIT-licensed. Inspiration came from Anthropic's Felix Rieseberg making Saltline with Fable 5.2; these demos are not Saltline and contain none of its code. Screenshots come from the original tutorial and the repository and remain the author's property; all figures are taken from his measured billing.
