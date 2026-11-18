---
slug: papertrails
name: Papertrails
summary: One prompt, blind critics and a gold reference: how Shikhar built a paper world that unfolds forever in three.js.
category: experiment
tags: [Three.js, Papercraft, Fable 5.2, Opus 5.5, Blind critics, Browser game]
publishedAt: 2026-11-18
updatedAt: 2026-11-18
author: Shikhar (@xikhar)
externalUrl: https://xikhar.github.io/papertrails/
facts:
  - key: method
    value: One subagent per part · blind A/B critics
    highlight: true
  - key: models
    value: Fable 5.2 + Opus 5.5
  - key: stack
    value: three.js · Vite · MIT
  - key: source
    value: ~900 KB of JS · 50-plus modules
  - key: assets
    value: 19 MB of models, textures and audio
  - key: biomes
    value: 5 shipped · 15 explored · day and night
  - key: target
    value: 60 fps on a mid-range laptop
  - key: author
    value: Shikhar — making cool stuff with AI
  - key: reception
    value: 51K views · 1.4K likes · 85 replies
sources:
  - title: Shikhar on X — Papertrails launch
    url: https://x.com/xikhar/status/2122682962647122403
    publisher: X
  - title: Shikhar on X — the original prompt
    url: https://x.com/xikhar/status/2122682965247639606
    publisher: X
  - title: Shikhar on X — concept frames and measured references
    url: https://x.com/xikhar/status/2122682968074522767
    publisher: X
  - title: Shikhar on X — one subagent per part, blind critics
    url: https://x.com/xikhar/status/2122682971664916978
    publisher: X
  - title: Shikhar on X — style guides and 15 biome types
    url: https://x.com/xikhar/status/2122682974856794385
    publisher: X
  - title: Shikhar on X — one style reference, gold targets
    url: https://x.com/xikhar/status/2122682978350555581
    publisher: X
  - title: Shikhar on X — render, compare, critique, fix
    url: https://x.com/xikhar/status/2122682981664149762
    publisher: X
  - title: xikhar/papertrails — source, MIT
    url: https://github.com/xikhar/papertrails
    publisher: GitHub
  - title: Papertrails — play in the browser
    url: https://xikhar.github.io/papertrails/
    publisher: GitHub Pages
cover:
  src: /showcase/papertrails.jpg
---

## He wrote the brief before he saw the game

The most useful thing Shikhar posted is not the game. It is the prompt.

The shipped name is Papertrails; almost everything else in the original document survived into the build. It is reproduced in full below, word for word from the image he posted, because the rest of this piece is about what he did with it.

## The original prompt

Reproduced verbatim from the prompt image in his thread:

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

This is not "make a paper game." It is a list of things that can be checked. That distinction is the whole build.

## The agent had to build its own reference

He did not start with code. The agent generated concept frames with GPT Image and collected real pop-up photographs, then measured their colours, edges and lighting. The reference became a set of numbers before it became a style.

Then Shikhar made the call the agent could not: he picked one image as the concrete style reference. The agent took screenshots of the game and generated a gold-style target for every biome; the animals were designed the same way. From that point on, every render had something specific to fail against.

## One subagent per part, and a critic who cannot see which is which

The worker rules are the most personal part of the project. They read like a review protocol, not a wish: the agent works alone, asks no questions and logs assumptions. It turns the reference into a checklist with measurable targets, gives each component its own subagent and its own files, and keeps the project running. Every build goes to a separate harsh blind critic, A/B side by side against the reference in random order. The loop stops only when critics "can't reliably pick the original and are wowed." Fold motion, walking feel, sound and 60 fps on a mid-range laptop are judged too; anything that makes it worse is reverted; the log is append-only; his explicit instructions override the critics.

The repo still carries the ownership boundaries. Files begin with `OWNER: render agent`, `OWNER: fold agent`, `OWNER: wfc agent`; each agent kept its own configuration and tuning notes. The blind critics were separate from the builders, and they saw the two versions in random order, so they could not reward the one they had just made.

That is a different job from prompting. He designed a review process, then let it run without asking questions.

## Gold target, then five frames

He posted the same shot through every pass: first build, art pass, biome pass, gold pass, now, gold target. The first build is bright and sparse. The art pass replaces the placeholder trees with printed paper cut-outs. The biome pass fills the ground with props. The gold pass adds the village and the lantern light. The last frame is the target, not the game; the gap between "now" and "gold target" is what the loop was for.

Then the numbers. The camera pitch moved from 46° to 42° to match the lower three-quarter view of the reference. The follow distance went from 14.8 to 12.6 to 10.8, because the gold frame was about 1.5 times tighter. Saturation came down from 1.04 to 0.92; the blur radius from 19 to 12.5; animal density went from 1 to 1.5 because the gold image had about ten animals in the frame. These are not mood-board adjectives. They are measurements with a direction.

He also overrode the agent, and the code keeps the receipt. A companion cat that would have adopted the traveller is switched off with `/* user 2026-11-17: no companion */`; a follow behaviour is set to zero with `/* user 2026-11-17: animals never follow the traveller */`. The critics could compare renders. They could not decide whether a cat should follow you. That was his call.

## The map he ended up with

The style guides explored fifteen biome types. The map ships five: heartland at the origin, then desert to the east, snow to the west, blossom to the south and pinewood to the north, each with day and night. The origin is always the warm autumn farmland, and the four neighbours are fixed so every biome sits within about twelve tiles of the start.

The world is generated with wave function collapse, tiles rise on springs and fold back flat behind the traveller, animals graze, peck, scatter and perch, and Tab or E opens an atlas page that draws itself as you explore. The map keeps growing in every direction.

## What is actually in the repo

This is not a 54-second mock. The public repo is about 900 KB of JavaScript across more than fifty modules, plus GLB tile and traveller models and 19 MB of models, textures and audio. three.js is the only runtime dependency. The licence is MIT. The playable build is on GitHub Pages, with URL parameters for seed, quality, mute, night, life and animals. The video is a capture of that build.

## The part that is his

The models wrote the code. The standard is his. "Continue until critics can't reliably pick the original and are wowed" is not a prompt trick; it is a taste threshold, and he kept tightening it with numbers. The most personal artefacts in the repo are the comments that record his vetoes and the "fixer" notes that moved a value from one measured number to another.

If there is one thing to take from his build, it is the order: reference first, criteria second, code third, and a critic who does not know which version it is looking at. The paper world is the output. The loop is the method.
