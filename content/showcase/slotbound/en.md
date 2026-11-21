---
slug: slotbound
name: Slotbound
summary: An indie game made with Codex by a developer who says he cannot code — 50,000 copies in 48 hours, and the twelve months of demo-building the viral posts left out.
category: ai
tags: [AI Game, Steam, Indie Dev, Codex, Love2D, Case Study]
publishedAt: 2026-11-21
updatedAt: 2026-11-21
author: KLeo (KKLeoAI)
externalUrl: https://mp.weixin.qq.com/s/j94CGt0uD6od2sna1V1hpQ
facts:
  - key: sales
    value: 50,000 copies in the first 48 hours (developer-reported)
    highlight: true
  - key: gross
    value: $356K before Steam's cut, tax and refunds
  - key: wishlists
    value: 100,000+ before launch · 50K by late July
  - key: peak
    value: 15,000+ concurrent players on 15 Nov (SteamDB)
  - key: stack
    value: Love2D · VS Code + Codex · Claude / Gemini · Nano Banana / PixelLab
  - key: art
    value: Partly generated, partly bought packs, partly hand-drawn for release
  - key: timeline
    value: Build from 2025-10 · demo 2026-07-10 · launch 2026-11-13 UTC
  - key: caveat
    value: Sales and revenue are self-disclosed, not audited
sources:
  - title: 一个不会写代码的人，48小时卖出5万份游戏：AI造富故事，最容易被看漏的真相
    url: https://mp.weixin.qq.com/s/j94CGt0uD6od2sna1V1hpQ
    publisher: KLeo / KKLeoAI
cover:
  src: /showcase/slotbound-cover.png
---

## I went looking for the missing arithmetic

The first time this crossed my feed, my reaction was the same as yours: someone has rounded this up.

A Korean developer who says he cannot write code. A game built with AI. 50,000 copies in 48 hours on Steam, $356,000 gross, which the reposts turned into 470 million won. The tidy version adds two monthly AI subscriptions worth 30,000 won each, no other costs, no marketing, and art plus code entirely by AI.

So I went back through the developer's public posts and the Steam announcements. The sales number holds up. The arithmetic around it does not.

![Slotbound's Steam capsule art](/showcase/slotbound-capsule.jpg)

*Developer and publisher: Optima Arch. Released on Steam 13 November 2026 (UTC).*

Here is what is actually on the record. The 50,000 and the $356K come from the developer's own message on 15 November — gross revenue, before Steam's cut, taxes, refunds and development costs. The 100,000 wishlists were announced at the end of September, before launch. SteamDB recorded more than 15,000 concurrent players on 15 November, which is the part marketing cannot fake: people were playing, not just buying.

What is not on the record is the cost claim. "Two $30 subscriptions, no extra tokens, no other spending" has no first-hand source I could find. Telling a good story does not require inventing its bookkeeping.

## The game is a slot machine that builds an army

Before the AI angle, the design deserves attention, because the sales are downstream of it.

The pitch fits in one sentence, which is rarer than it sounds: what if a slot machine recruited your army? You pull a 3 × 3 reel, it lands on warriors, mages and other units. You merge the weak ones upward, attach items and modifiers, and then watch the formation survive the next wave.

Two familiar pleasures are wired together. The spin is random reward: every pull is a small wait for a surprise. The merge is controlled growth: even a bad roll can be rescued by choices. Lose, and you blame the loadout you built two rounds ago. Win, and you want to see whether a more absurd combination also works. That is the same engine running under Vampire Survivors and half the genre.

The important part for this story: none of that required AI. The loop would work if a human had typed every line.

## What the AI actually wrote

In a May post the developer said the demo's code was entirely AI-generated, and that he could not write a line of code himself. People quote that sentence a lot. They quote the next part much less.

![Four buckets: engineering, thinking, art, and the decisions that stayed human](/showcase/slotbound-split.png)

| Bucket | Who did it | What it covered |
| --- | --- | --- |
| Engineering | Codex in VS Code | The demo and most of the release code, on Love2D |
| Thinking | Claude, Gemini | System design discussions, stuck points, second opinions |
| Art | Nano Banana, PixelLab | Some scenes and pixel assets, alongside purchased packs |
| Decisions | The developer | Difficulty, readability, reward feel, what to cut |

So "all the art is AI" is false as stated. He has said publicly that some units came from bought asset packs, and that the release build added a good amount of hand-drawn art. The engine is Love2D, not a no-code tool. And the split above is his own description of his workflow, not a complete cost sheet.

The habit he described when asked about prompting is the most transferable thing in the whole interview: do not hand the model one enormous vague task. Do one feature at a time, state the constraints and the relevant files, test the output immediately, and when it drifts, tell it exactly what broke and what must not change.

That is not a prompt trick. It is how a careful engineer talks to a junior developer.

## The work AI could not take

Ask any model to write a slot machine and it will produce a working slot machine. What it will not tell you is that level three is too hard, that the merge button is hidden behind the tooltip, that a reward arrives half a second too late to feel good, or that a mechanic you are proud of should be deleted entirely.

The developer said something close to this when the demo launched: AI let him make the game, but whether it is fun, balanced and legible is still his call.

That sentence is the whole case, honestly. The code was outsourced. The taste was not.

## "No marketing" is the most misleading line

The viral version says he did no marketing beyond one social post. He did say he skipped traditional marketing. Then you look at the dates.

![Timeline from first build to launch](/showcase/slotbound-timeline.png)

He started in October 2025. A playable build went to itch.io at the end of June 2026. The Steam demo opened on 10 July. After that came bug fixes, UI passes, difficulty tuning and gameplay updates. Wishlists hit 50,000 in late July and 100,000 by the end of September. The launch itself slipped because of Steam's build review, and he wrote a long post about the exposure he was afraid of losing.

Nothing about that is a single post. A demo is not a store-page decoration for a systems game; it is the most honest advertisement the genre has. Watching a clip tells you it looks neat. Playing thirty minutes tells you whether you will miss it.

No paid acquisition is not the same as no user acquisition.

## What I would copy, in order

**One: a loop you can explain in a sentence.** "A slot machine that builds your army" needs no tutorial. If your idea requires three minutes of setup before the fun starts, the problem is the idea, not the marketing.

**Two: use AI to make validation cheap, not to make the game big.** Build the smallest complete loop — you can win, you can lose, something reacts — then extend it. Do not ask for 300 levels on day one.

**Three: put it in front of strangers early.** Your own enjoyment is a starting point, not evidence. Someone opening it, someone playing a second run, someone sharing it without being asked: those are the signals worth spending another month on.

## Verdict

> **Primary recommendation:** treat Slotbound as proof that a non-coder can now reach the market, not as proof that the market is easy. Copy the order — loop, cheap prototype, public demo — and ignore the cost fairy tale.

The achievement is real and bigger than the memes suggest: someone without a programming background shipped a commercially viable game in about thirteen months. The correction is smaller but matters: he did not skip the year, the demo, the patches or the taste. He skipped the syntax.

That distinction is the difference between "anyone can do this by Friday" and "anyone can now start".

## What this story does not prove

- **One game, one genre, one launch.** A slot-machine roguelite is a proven, legible, cheap-to-prototype genre. A narrative game or a 3D action game would not map onto this timeline.
- **The numbers are self-reported.** $356K gross is not net, and none of it is audited. Steam's cut, regional pricing, refunds and taxes all come out of that figure.
- **Survivorship bias is doing a lot of work.** For every Slotbound there are hundreds of AI-assisted games that launched to silence. You are reading about the one that worked.
- **"Cannot write code" is not "cannot think technically".** He directed an engine, an architecture and a toolchain. That is a skill, just not a syntax skill.
- **The tool list is not a recipe.** Codex plus Claude plus Nano Banana produced this game because of what he asked them for. The same stack with a vague brief produces a prototype nobody plays.
- **AI does not solve discovery.** The demo, the updates and the wishlist funnel did the marketing. That work is still yours.
