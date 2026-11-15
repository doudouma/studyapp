---
slug: crumb-colony
name: Crumb Colony
summary: One person, ¥30 and Claude Code: a WeChat mini game that went from ¥3.65 to ¥2,002 a day in three weeks.
category: experiment
tags: [WeChat mini game, Claude Code, Solo dev, Pixel art, Puzzle, Ad revenue]
publishedAt: 2026-11-15
updatedAt: 2026-11-15
author: 本山德彪 (@benshandebiao)
externalUrl: https://ants.pomodiary.com/
facts:
  - key: ad revenue
    value: ¥2,002 in a day · ¥2,730 over 7 days
    highlight: true
  - key: first ad day
    value: ¥3.65, ¥2,002 three weeks later
  - key: team
    value: 1 · individual account, no company
  - key: startup cost
    value: ¥30/year WeChat certification · no ISBN · no software copyright
  - key: models
    value: Claude Code — code, bot playtests, build uploads
  - key: port to WeChat
    value: Web build moved in about a week
  - key: review
    value: Rejected twice — both copy issues
  - key: discovery
    value: 57% of last week's revenue from WeChat search
sources:
  - title: 本山德彪 — "我用 Claude Code 做微信小游戏，从注册到开广告赚钱"
    url: https://x.com/benshandebiao/status/2121442979999297863
    publisher: X
  - title: Crumb Colony — play in the browser
    url: https://ants.pomodiary.com/
    publisher: Crumb Colony
cover:
  src: /showcase/crumb-colony.jpg
---

## One person, three weeks: ¥3.65 to ¥2,002

Three weeks ago, Crumb Colony's first day of ads brought in ¥3.65. On November 13, 2026, the game made ¥2,002.04 in a single day; ¥2,730.44 over the past seven.

One person built it: an individual WeChat account, no company, no paid acquisition, and all of the code written with Claude Code. The game itself is a color-sorting puzzle — each level is a pixel-art picture, you tap a color box, release a matching ant colony, and the ants eat the picture from the edge inward and carry it back to the nest. It runs as a WeChat mini game and in a browser. The author, 本山德彪, used to write code at Tencent and Meituan; now he builds products on his own. He wrote the whole path down as seven steps: eligibility, registration, building, review, opening the ad program, ad placement, and traffic.

What makes the piece worth reading is not "AI can make games." It is how one specific person got a small thing all the way through: where the money went, which step stalled, and which decisions he had to make himself.

## Do the paperwork math first: company, ISBN, filings

This is the part he gets asked about most, and his answers are concrete:

* **Anyone can do it**: he registered as an individual. No company needed.
* **No ISBN**: as long as the game only runs ads and has no in-app purchases.
* **Filings, yes — two of them**: mini-game filing first, then mini-program filing, both with face verification. A single-player build can go live before the filing finishes; that is how he shipped first.
* **No software copyright filing**: review, publishing and the ad program never asked for one.
* **The only real cost is certification**: ¥30/year for an individual, ¥300/year for a company. Tax is withheld by the platform at payout.
* **Single-player first**: leaderboards and friend battles would mean going online later, and going online means finishing the mini-program filing first.

Two decisions say a lot. He wanted to call it 蚂蚁搬家 ("ants moving house"), found the name taken, and settled on 蚂蚁搬画 ("ants moving paintings") — the name is also the search term players will use, so it has to be short and findable. And he chose single-player first rather than let a leaderboard drag the launch into a filing queue. The ¥30 certification paid for itself in the first week of ads.

## The AI writes the code; the human owns fun

His web build moved into WeChat in about a week. The AI's job list is specific:

* write code and fix bugs;
* write a handful of "bot players" that play every level inside the real game, estimate what share of players can win, retune when the difficulty is off, then test again;
* run the whole flow after every change — start, clear, fail, rewarded video, share — with more than a hundred checks that all have to pass;
* package and upload through the WeChat devtools command line, so a dev build shows up in the console by itself.

The human still clicks "submit for review" and "publish." That is the division he keeps coming back to: the AI can produce a verifiable output; the human makes the call.

Fun is where he spent most of his time. A single mechanic gets stale after a few dozen levels, so every chapter swaps in a new life scene plus one mechanic that exists only in that chapter — snow falls and covers the board in the winter chapter, firecrackers hang in the New Year chapter. His design rules read like product rules, not feature rules: alternate helping the player and making things hard; tie the mechanic to the scene; teach it with a card the first time it appears; when the player loses, show them how; make the explosions feel good and never let the ending drag.

## Difficulty is a sentence, not a number

Every level gets an "aha" line: the sentence the player will say once it clicks. If he cannot write that sentence, the level is leaning on luck or stacked difficulty, and it gets rebuilt.

Difficulty moves in waves: a hard level every few levels, followed by an easy one. Level one stays short; level two already asks for thinking. Bots test before launch, real players after — the dashboard showed many new players quitting before level five, so he shortened level one. Bot difficulty and human difficulty often disagree, and the live data is what settles it.

All of this lives in a written "level standards" document. The AI checks every new chapter against it before release, and one failed rule means the chapter does not ship. The game now has 440 levels across 22 chapters; that document is the only thing keeping the later chapters from turning into filler.

## Two rejections, neither about code

The review form asks for more material than the code: a self-audit report, main scene description, gameplay explanation, system design, game background and theme, plus at least three screenshots taken inside WeChat, with the capsule button and the game name visible in the frame.

He was sent back twice:

1. English text in the interface — the English name on the home screen, English subtitles in pop-ups — all changed to Chinese.
2. A home-screen title that was not tidy enough — reduced to exactly 蚂蚁搬画, character for character the registered name.

His takeaway is one sentence: wherever the name appears in the game, use the registered name, no English, no subtitle. Both fixes were trivial; what they cost was release time, not engineering.

## Ads only where the player is stuck

On November 13, rewarded video produced 90.6% of revenue and interstitials 1.9%. The average player chose to watch about seven rewarded videos that day. Interstitials got roughly as many impressions as banners and earned the least — players mostly close the game when one appears.

His three rules:

* **Put rewarded video where the player needs it**: stuck, out of items, wanting a hint. Not on the way into a level, before anything has gone wrong.
* **Do not give items away**: the more you hand out, the fewer videos anyone watches. Each item starts at one and is never refilled automatically.
* **Squeeze interstitials**: only when the player has stopped, like returning to the menu; never in the first 15 levels; never on "next" or "retry." Banners live at the bottom of the result screen and nowhere inside a level.

The ad design shapes the game in return. Ad-only revenue means rewarded video is the business, so the design has to leave room for moments where the player gets stuck and can be offered a way out — rewind the board, or try a different rescue.

## Traffic: one new-game seed and a name people search

He spent nothing on acquisition. What he used:

* **The new-game seed**: WeChat gives a new game one recommendation window within 90 days of first release. He opened it and users grew 10×. There is only one, so he recommends saving it until the game is polished.
* **Add to My Mini Programs**: players who arrive from a recommendation forget you the moment they leave. He built a guide card with an arrow pointing at the "···" in the top-right corner.
* **Share cards**: sharing a level drops the friend directly into that level, not level one.
* **A searchable name**: the dashboard breaks revenue down by source; 57% of last week's revenue came from search. A good name is how players find you.
* **A public build log**: he posts "day N of ads on my mini game" on X every day, turns the questions in the replies into articles for WeChat Official Accounts, Zhihu and Juejin, then records them in his own voice for channels, Bilibili and Douyin.

That last one is the flywheel: public revenue brings questions, questions become articles, articles bring search traffic and new players.

## Who this path is for

> **Primary recommendation**
> Copy the process, not the payday. Between ¥3.65 and ¥2,002 sit three weeks, 440 levels, two filings, two rejections and a written level standard. It suits someone who will build in public, grind through compliance, and treat the AI as an engineering crew rather than a wish machine; it does not suit anyone looking for passive income, or unwilling to replay levels on a phone until the difficulty feels right. If you start, follow his seven steps — but do two things first: check that the name is free, and ship the single-player build.

The same screenshot can be read two ways. One reading is encouragement — an individual can do this, and it costs ¥30 to start. The other is survivorship bias: nobody shared the ¥3.65 day. On the AI question, neither rejection mentioned the toolchain, but review standards and ad-program thresholds both move (his launch threshold was 500 visitors; it is 100 now), so a path that works today is not guaranteed to work the same way tomorrow. He does not dodge any of it: the revenue is public, the numbers are public, and even the mistaken call — a first level that was too long — made it into the article.
