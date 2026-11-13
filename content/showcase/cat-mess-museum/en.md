---
slug: cat-mess-museum
name: Demolition Cat — From Rental Flat to Museum
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

## A cat, two prompts, one invoice

An orange cat is left alone in a flat with 90 seconds to wreck it: push over the furniture, smash the crockery, collect tins of cat food, spend the tins on upgrades that unlock nicer rooms. The first level is a cheap rental. The last one is a museum.

The game is the demo. The number worth reading is the invoice: two prompts, 17 model calls, $5.77, and not one line of code typed by hand. The model was Fusion Max 2.0 from Singapore's FUMO Lab, reached through an OpenAI-compatible endpoint, so the same loop runs from Cursor or Codex once you fill in a base URL and a key.

## The first prompt is a specification, not a wish

Most "make me a game" prompts fail because there is nothing to fail against. This one starts by asking for a design document, and the document is judged against CrazyGames' own evaluation criteria: sessions of at least 10 minutes, day-2 retention between 10% and 15%, playable within three seconds, everything generated in code so there is no asset to download.

That reframing does more work than the choice of model. A platform's review metrics are a free specification, and they force the loop the game needs — short runs, upgrades, daily tasks, a reason to come back — before any code exists. The document came out at roughly 27,000 characters; the build that followed was about 130 KB and ran on the first pass.

## Four rounds, sixteen of twenty

Four revision rounds followed. Twenty requirements were raised across them and 16 were confirmed; the author says the other four needed another pass. None of the fixes were typed by hand, which is the part worth noting: each round was a new prompt against the previous build, not a debugging session.

The final pass was art, and it is the one step that leaves the model. The placeholder cat became a Blender model: an orange tabby with 24 layers of fur.

## What the cost comparison actually measures

$5.77 for 17 calls. Priced at Claude Fable 5.1 or GPT-6 Astra rates, the same volume comes to about $14.92, so the ratio is 2.6×. Across 100 prototypes the difference is roughly $900.

The dollar figure is real — it is a measured bill, not an estimate. Two things sit underneath it. First, it depends on new-user trial credits and on the vendor's current promotional pricing, so it is the cost of this attempt today rather than a stable unit price. Second, the article carries a referral link to the model vendor, which makes the $14.92 comparison a vendor-side calculation rather than a neutral benchmark.

Still, the argument does not depend on the exact ratio. Solo developer anul agarwal made a Suika-style variation with ChatGPT in 2023 that reached 65M+ players and earned more than $25,000, and he is explicit that it took 120+ prototypes and the first 100 barely earned anything. If one attempt costs $5.77 instead of $15, that path stops being reserved for people with a budget. If it costs $5.77 and the first 100 still earn nothing, the cheaper loop buys you more attempts but not a better hit rate.

## Nothing here has shipped

The game is still on the author's machine. It has not been submitted to CrazyGames or to WeChat's mini-game platform, so it has no players, no ad impressions and no revenue.

What is left is the part that models cannot do for you: CrazyGames runs three review lines, WeChat mini-games come with filing requirements, and neither is a design problem. The author's own closing note is that most small games still will not land, however cheap the build was.

## What transfers

> The reusable asset here is not the game and not the model — it is the prompt order. Write the spec against the platform's metrics first, then bound the iteration to a fixed number of rounds so the cost per attempt stays known.

Everything else is conditional. The cost advantage assumes a cheap endpoint and a small, self-contained build. The art still needs a human and a tool that is not a language model. And the two prompts are published in full, which is the reason this belongs in the case library: you can run the workflow against your own idea instead of taking the conclusion on trust.
