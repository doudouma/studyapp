---
slug: cat-mess-museum
name: 猫咪拆家：从出租屋拆到博物馆
summary: A playable 3D web game built from two prompts and zero hand-written code — $5.77 of model calls, four revision rounds, no engine.
category: experiment
tags: [AI-generated, Web game, 3D, Prompt-only, Cost breakdown]
author: AYi (@AYi_AInotes)
publishedAt: 2026-11-13
updatedAt: 2026-11-13
cover:
  src: /showcase/cat-mess-museum.jpg
facts:
  - key: author
    value: AYi (@AYi_AInotes)
  - key: platforms
    value: Web (CrazyGames target) · WeChat mini-game
  - key: models
    value: Fusion Max 2.0 (FUMO Lab)
  - key: cost
    value: $5.77 · 17 calls
    highlight: true
  - key: same volume elsewhere
    value: ~$14.92 on Claude Fable 5.1 / GPT-6 Astra
  - key: codebase
    value: 130 KB first build · 0 lines hand-edited
  - key: revisions
    value: 4 rounds · 16 of 20 requirements accepted
  - key: status
    value: Playable locally · not yet submitted
sources:
  - title: AYi on X — a $5.77 3D cat game, prompts open-sourced
    url: https://x.com/AYi_AInotes/status/2120865290703552993
    publisher: X
  - title: My AI-generated game earned $25,000 — the prototype benchmark
    url: https://medium.com/humanai/my-ai-generated-game-earned-25-000-here-is-how-it-happened-ea5612d91464
    publisher: Medium
---

## What it is

《猫咪拆家：从出租屋拆到博物馆》 is a 3D browser game in which you play an orange cat left alone in the house. Each run lasts 90 seconds: knock over furniture, smash things, collect cat-food cans, then spend the cans on stat upgrades that unlock progressively grander venues, from a rented flat up to a museum.

What makes it a case rather than a product listing is how it was made. The author wrote no game code. The whole thing came from two prompts against Fusion Max 2.0, a model from Singapore's FUMO Lab, called 17 times for a total of $5.77.

## Core value proposition

The point of the experiment is the cost of one attempt, not the game itself.

- Design-first prompting: the first prompt asks for a complete Markdown design document aimed at CrazyGames' evaluation criteria — sessions of at least 10 minutes, day-2 retention of 10–15%, a 3-second time-to-play — instead of "make me a game". The platform's metrics are the spec.
- A measurable bill per attempt: $5.77 across 17 calls, against roughly $14.92 for the same volume on Claude Fable 5.1 or GPT-6 Astra. Across 100 prototypes that gap is about $900, which is the whole argument, because most prototypes earn nothing.
- One endpoint for the entire loop: design document, a 130 KB first build, four revision rounds and the art pass all came from the same model. It speaks the OpenAI Chat Completions API, so Cursor or Codex can drive it with a base URL and a key.

## What it can replace

| Target software | Feasibility | Verdict & use-case context |
| --- | --- | --- |
| Unity / Godot prototype loop | Partial | For a 90-second-session web game with no custom engine tech, two prompts plus four revision rounds covered what a grey-box prototype stage would normally cost. It is not a substitute for production engineering: no hand-tuned physics, no build pipeline, no platform SDK work. |
| Paid frontier-model coding | Moderate | When the deliverable is one self-contained HTML/JS game, a cheaper endpoint handled design, code and iteration together. Work that needs long context across a real repository still pulls you back to a frontier model. |
| Commissioned 3D mini-game | Low | A commissioned build brings art direction, QA and store submission. This produced a playable build, not a shipped title. |
| No-code game builders | Moderate | Builders hand you templates and hosting; this hands you code you own, at a lower cost per attempt once you are past the first prototype. |

## Current realities and limitations

- Not shipped. The game still lives on the author's machine and has not been submitted to CrazyGames or to WeChat's mini-game platform.
- Four rounds did not close everything. Of 20 requirements raised across those rounds, 16 were confirmed; the remaining four needed another pass.
- $5.77 is a measured invoice for 17 calls, not a unit price. Reproducing it depends on new-user trial credits and on the model's current promotional pricing.
- The hard part moved rather than disappeared. CrazyGames runs three review lines, WeChat mini-games need filing paperwork, and the author's own closing note is that most small games still will not land.

## Verdict

> **Primary recommendation**
>
> Treat this as a cost model for a prototyping habit, not as evidence that the game will earn. The transferable part is the prompt structure — write the design document against the platform's own metrics, then bound the fixes to four rounds — and the number that matters is $5.77 per attempt, because it decides how many attempts you can afford.

## Development lifecycle and iteration loop

1. **Design document.** One prompt, about 27,000 characters, reverse-engineered from CrazyGames' evaluation criteria rather than from game-design theory.
2. **First build.** Roughly 130 KB of working code, with no manual edits.
3. **Four revision rounds.** 20 requirements raised, 16 confirmed. The author states not a single line was fixed by hand between rounds.
4. **Art pass.** The default primitive cat was swapped for a Blender-modelled orange cat with 24 fur layers.
5. **Not done yet.** Submission, platform QA and the WeChat filing process.

| Stage | Model used |
| --- | --- |
| Game design document | Fusion Max 2.0 |
| First playable build | Fusion Max 2.0 |
| Four revision rounds | Fusion Max 2.0 |
| 3D character art | Blender (external) |

> **Cost profile**
>
> $5.77 across 17 calls. Priced at Claude Fable 5.1 or GPT-6 Astra rates the same volume comes to about $14.92 — 2.6×.

## Metrics and monetization

No revenue yet. The game has no players, no ad impressions and no tipping income because it has not been submitted anywhere.

Monetization is the platform default rather than a design decision: CrazyGames pays on ad impressions once a title clears its review lines, and WeChat mini-games take tips through the open platform.

The benchmark the article opens with is a Suika-style variation built by solo developer anul agarwal with ChatGPT in 2023: 65M+ players and more than $25,000 in revenue, out of 120+ prototypes of which the first 100 barely earned anything.

## Community reception and key debates

The post drew roughly 300 likes and 16 reposts in its first day, so the discussion is small. It is also mostly not about the game.

- **Cheap attempts make volume viable.** If one attempt costs $5.77 instead of $15, the 120-prototype path stops being something only well-funded studios can afford.
- **Volume is not the bottleneck.** anul agarwal's own numbers say the first 100 prototypes earned almost nothing, so a cheaper loop shortens the cycle without telling you which idea will work.
- **The comparison has a commercial edge.** The article ships with a referral link to the model vendor, which makes the $14.92 figure worth reading as a vendor-adjacent claim rather than a neutral benchmark.

Both prompts are published in full, which is the reason this belongs in the case library: the workflow can be checked against your own project instead of taken on trust.
