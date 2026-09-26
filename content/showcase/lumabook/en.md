---
slug: lumabook
name: Lumabook
summary: A reading app where book scenes come alive in motion as you read — starting with Sherlock Holmes, and 816 upvotes on r/SideProject.
category: tools
tags: [Reading, AI-generated, Animated Illustrations, Aphantasia, Education, Lofi Aesthetic]
publishedAt: 2026-09-26
updatedAt: 2026-09-26
author: u/yahska111
externalUrl: https://lumabook.ai/
facts:
  - key: author
    value: u/yahska111
  - key: traction
    value: 816 upvotes · 173 comments on r/SideProject
    highlight: true
  - key: first book
    value: The Adventures of Sherlock Holmes · public domain
  - key: approach
    value: Scenes in motion as you read · not static illustrations
  - key: known issue
    value: AI consistency drift (faces, clothes, locations)
  - key: roadmap
    value: Inline scrolling shipped · narration mode suggested
sources:
  - title: Lumabook — official site
    url: https://lumabook.ai/
    publisher: lumabook.ai
  - title: r/SideProject — project subreddit
    url: https://www.reddit.com/r/SideProject/
    publisher: Reddit
cover:
  src: /showcase/lumabook.jpg
---

## What it is

Lumabook is a reading app with a simple premise: you read a book normally, at your own pace, but scenes from the story come alive alongside the text — not static AI illustrations, actual motion. Built by u/yahska111 as a side project, it launched on r/SideProject with *The Adventures of Sherlock Holmes* as its first title, chosen because it is public domain and has an instantly recognizable atmosphere. The app is live at [lumabook.ai](https://lumabook.ai/), and the author is unusually candid about the open question at its heart: do visuals like this make reading more immersive, or just a distraction?

## Core value proposition

* **Motion, not stills**: The differentiator against the flood of AI-illustrated books is animated scenes that live alongside the text while you keep your own reading pace.
* **Consistency as the core engineering fight**: The author openly treats character/clothing/location drift — generative AI's sloppiest failure — as the central problem to solve.
* **Public-domain-first content**: Sherlock Holmes brings a recognizable atmosphere with zero licensing risk.
* **A genuine open design question**: The launch invites debate instead of pretending the answer is settled — and the community's answers shaped the roadmap within days.

## What it can replace

| Target software | Feasibility | Verdict & use-case context |
| --- | --- | --- |
| Static AI-illustrated ebooks | High | Motion is the entire pitch; stills are the floor it is trying to beat. |
| Ambient/lofi visual background apps | Moderate | Several readers compared the subdued black-and-white scenes to relaxing lo-fi loops. |
| Traditional illustrated editions | Moderate | Scenes animate, but there is no artist's coherent hand — consistency still drifts. |
| Audiobook read-along apps | Low | Narration pairing was suggested by the community, not built yet. |

## Current realities and limitations

* **The core question is open**: The author's own launch question — immersive or distracting — got a split answer, with readers noting moving visuals pull focus like movie subtitles you cannot watch and read at once.
* **AI consistency drift**: Faces change, clothes change, locations contradict the text; the fix (persistent character sheets, layered vectors) is discussed but not proven.
* **One book**: Only Sherlock Holmes exists so far; the catalog question ("which book next?") is literally the post's call to action.
* **Branding headwind**: Community advice included rebranding away from the `.ai` domain to avoid pushback from traditional readers and literary communities.

## Verdict

> **Primary recommendation**
> Try the Sherlock chapter and watch your own eyes: if they keep drifting to the moving scene instead of the words, the concept is not for you — yet. The strongest signal from the launch is the audience it found: readers with aphantasia and reluctant young readers, for whom "the pictures are provided" is not a distraction but a lifeline. That is a real market hiding inside a novelty demo.

## Development lifecycle and iteration loop

A solo side project that used its launch thread as a focus group:

| Stage | Tooling | Focus |
| --- | --- | --- |
| Content | Public-domain catalog | Sherlock Holmes first: recognizable atmosphere, no licensing |
| Visual pipeline | Generative motion, consistency-first | Fighting face/clothing/location drift; character sheets and layered vectors under discussion |
| UX iteration | Reddit feedback, fast | Inline scrolling with the text already built; fullscreen, static toggles, chapter-break reveals queued |
| Positioning | Open question to readers | Immersion vs. distraction as the product's defining debate |

## Metrics and monetization

* **Traction**: 816 upvotes and 173 comments on r/SideProject.
* **Monetization**: Not mentioned — the project is at feedback-seeking stage.
* **Signal quality**: The thread produced a concrete UX backlog (inline scroll shipped; fullscreen, toggles, narration mode requested) rather than empty praise.

## Community reception and key debates

The launch thread turned into the product's design review:

* **The subtitle problem**: The sharpest critique likened simultaneous reading and watching to reading movie subtitles — you focus on one at a time; the counterpoint was the subdued, lo-fi-like art that sits quietly in the background.
* **Aphantasia and young readers**: The most durable consensus — people who do not visualize while reading found genuine value, and education/children's books emerged as the strongest use case.
* **Consistency engineering**: Persistent character sheets and layered vector animation were proposed as the path past generative drift.
* **Branding debate**: A vocal minority advised dropping the `.ai` domain before courting literary communities that arrive pre-skeptical.
