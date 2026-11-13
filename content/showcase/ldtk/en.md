---
slug: ldtk
name: LDtk
summary: The 2D level editor that Dead Cells' lead designer built after leaving the studio — free, MIT-licensed, and deliberately limited.
category: tools
tags: [Open source, Game dev, Level editor, Desktop app, Free]
author: Sébastien Benard (deepnight)
publishedAt: 2026-11-13
updatedAt: 2026-11-13
externalUrl: https://ldtk.io
cover:
  src: /showcase/ldtk.jpg
facts:
  - key: author
    value: Sébastien Benard (deepnight)
  - key: license
    value: MIT · every feature unlocked
  - key: platforms
    value: Windows · macOS · Linux
  - key: downloads
    value: 670,000+ across versions
    highlight: true
  - key: github
    value: 4.9k stars · 323 forks
  - key: version
    value: v1.5.3 · last commit Nov 2026
  - key: built with
    value: Haxe + Electron
  - key: price
    value: Free · optional paid copy on itch.io / Steam
sources:
  - title: 死亡细胞主设计师出走后，把二十年功力做成了免费开源关卡编辑器
    url: https://mp.weixin.qq.com/s/aUmu4DQ1Xw_M_naoh37VHQ
    publisher: WeChat
  - title: LDtk — official site
    url: https://ldtk.io
    publisher: Deepnight Games
  - title: deepnight/ldtk on GitHub
    url: https://github.com/deepnight/ldtk
    publisher: GitHub
---

## A designer's free editor

Sébastien Benard spent years as lead designer on Dead Cells at Motion Twin. The first big thing he shipped after leaving was not a game. It was a level editor, given away under the MIT licence: LDtk, short for Level Designer Toolkit.

The pitch on the official site is unusually blunt for a tool page — "a 2D level editor by the lead designer of Dead Cells, fast, free, open source" — and then a line underneath that reads like it was written for other game developers rather than for buyers: made for game developers, by a game developer.

Six years on, the numbers are not hobby-project numbers. Around 4.9k stars, more than 670,000 downloads across all versions, and shipped indie titles using it in production.

## Do less, but do it right

Every tool of this kind dies the same way: features accumulate until nobody can find the one you need. Tiled, the old standby, is still the example people bring up when they complain about interface weight.

LDtk goes the other direction, and states it as a design principle: do less, but do it right. It is 2D only. It targets platformers and top-down games specifically, and the site says sorry, plainly, to anyone who wants isometric or fake-3D. The feature list is not short, but every item on it is something a level designer touches daily. Nothing is there to demo how clever the engine is.

That restraint comes from having shipped real games. Nuclear Blaze, Benard's own title, was built entirely in LDtk — the editor existed first, then the game proved whether it held up in a commercial project.

## Three calls for solo devs

Most people using LDtk are not studios. They are one person or three, with no tools programmer, no budget and no time. Three features are shaped around exactly that:

**Export so simple it embarrasses you.** Every new editor creates the same awkward moment: you now have to write an importer for your own engine. LDtk outputs a few PNGs per level plus a small JSON file, and the documentation is short enough to read in one sitting.

![The world view — levels arranged as rooms, connected the way the final game will connect them](/showcase/ldtk-1.jpg)

**Auto-render rules for the boring part.** Tiling a 2D level by hand means picking the right edge variant for every grass corner. LDtk lets you define the rules visually and generates the seams itself. The author's framing: let LDtk do the boring work.

**World mode.** Levels stop being separate images and become rooms inside a world, laid out as grid-vania, linear or free. Drag to reorganise the map, scroll to switch between world and level. If the structure looks familiar, it is the same problem Dead Cells had to solve.

## Free, paid copy optional

LDtk is free with no feature gate. There is no pro tier, no export watermark, no limit on how many levels a project can hold.

You can still pay: itch.io and Steam both sell it, and the site asks you to buy a copy or become a long-term sponsor if you want to support the work. What you get is byte-for-byte the same software. It is the "pay if you feel like it" model, and it only works when the tool is good enough that people feel like it.

![Entity definitions: fields, enums, defaults and how each entity shows up in the editor](/showcase/ldtk-2.jpg)

## One person, 7,374 commits

The commit history tells you the shape of the project. Thousands of commits over five-plus years, dozens of releases, and a codebase that is still moving — the last push was in November 2026.

It is Haxe running on Electron, the same language family as Dead Cells, which is less a coincidence than a reminder that people build tools with what they already know.

The part worth reading is the backup section on the homepage. It says, in effect: we know bad things happen, LDtk keeps strong backups and can recover unsaved changes after a crash — it should not crash, but the world is not perfect. That is a specific attitude toward other people's work, and it is the kind of thing you only write after losing work yourself.

![LDtk 1.5 splash — the release that added the current logo and the world-layout tooling](/showcase/ldtk-3.jpg)

## Why it belongs here

LDtk is not an AI product, and this library is not only about AI products. It belongs here because it is the other half of the same question: what does one experienced person, with modern tooling and no company behind them, ship now?

The answer here is a tool that removes a cost for everyone else. A decent level editor is months of work that a solo developer cannot afford to build and cannot afford to skip. LDtk makes that cost zero, and keeps shipping.
