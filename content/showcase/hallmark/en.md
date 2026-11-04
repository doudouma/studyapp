---
slug: hallmark
name: Hallmark
summary: An anti-AI-slop design skill for Claude Code, Codex, Cursor and OpenCode that deals from 50 themes, renders pages in a real browser and lints the tells that make them look machine-made.
category: tools
tags: [Agent Skill, Design, Claude Code, Codex, Cursor, Anti-AI-Slop, Open Source]
publishedAt: 2026-11-04
updatedAt: 2026-11-04
author: Together AI (Nutlope)
externalUrl: https://www.usehallmark.com/
facts:
  - key: maker
    value: Together AI
  - key: stars
    value: 47.3K
    highlight: true
  - key: themes
    value: "50"
  - key: photos
    value: 755 (Wikimedia Commons)
  - key: agents
    value: Claude Code, Codex, Cursor, OpenCode
  - key: license
    value: MIT
sources:
  - title: Nutlope/hallmark — GitHub
    url: https://github.com/Nutlope/hallmark
    publisher: GitHub
  - title: Hallmark — design taste for coding agents
    url: https://www.usehallmark.com/
    publisher: Together AI
cover:
  src: /showcase/hallmark.png
---

## What it is

Hallmark is a design skill that plugs into coding agents and refuses to produce pages that look AI-generated. It ships as a Skill for Claude Code, Codex CLI, Cursor and OpenCode, and is made by Together AI. Instead of asking a model to "make it pretty", it deals three themes from a catalog of 50, builds the page around the visitor's job, renders it in a real browser and lints the result against known AI tells.

## The problem it targets

Models converge on the same visual habits: an eyebrow above every heading, tracked-capital labels, one colored word in a headline, grids of empty frames or nothing but photos, a hero that misses the first screen, an email sign-up at the end of every page, and a form that says thanks without sending anything. Hallmark treats these as defects and blocks the worst ones.

## How a build runs

1. Pre-flight reads the project (fonts, palette, framework, a locked `design.md`) and asks once for material: photos, screenshots, real numbers. Nothing is invented.
2. `scripts/theme.mjs deal` offers three themes that fit the prompt and clear the log; `draw` deals the page's anatomy from its job.
3. The hero is built alone, rendered and reviewed cold before the rest of the page exists.
4. `scripts/sloplint.mjs --render` checks the page at eight widths, then a subagent reviews it with fresh eyes.

Each page is self-contained HTML and CSS, stamped in its first CSS comment with the decisions it took.

## What's new in v2

- **50 themes.** Each is a material (paper, type, color, surfaces, its own components and texture) with a picture of a finished page, and a build reads exactly one.
- **Built from the job.** A booking page books, a shop sells, a newsletter subscribes: the action sits where the category puts it, and the page ends on it.
- **Custom.** Say "custom" and Hallmark designs from your prompt alone, under the same rules and checks.
- **Your real product.** Point it at a URL, a dev server or an app and it captures the screenshots itself.
- **Real photographs.** 755 openly licensed photos, picked per subject and credited on the page.
- **Redesign and audit.** `/hallmark redesign <path>` rebuilds a page and keeps its content and wiring; `/hallmark audit <path>` only reports.

## The gates

The checks come in tiers:

- **Floor** never ships: contrast, focus, reduced motion, invented facts, a broken phone layout.
- **Reflex** gates are the defaults a model falls into; a build with a reason may overrule one on the record.
- **Finish** checks are craft detail that never blocks a ship.

## Current limitations

- It is a Skill, not a page builder: you need a supported agent harness and Node 18 or later.
- Browser checks (`sloplint --render`, screenshots) also need `puppeteer-core` and Chrome; without them only the static checks run.
- Themes are materials, not plans, so two prompts in one theme produce two different pages; consistency comes from the material, not a fixed template.
- The 50-theme catalog and the photo library are curated opinions, not a universal design system.
- Star count and feature set are a point-in-time snapshot; the repository moves quickly.

## Verdict

> **Primary recommendation**
> Use Hallmark when an agent keeps producing the same generic landing page. The tiered gates and the browser lint are the useful part: they turn "looks AI-generated" into a checklist the model can fail.

Hallmark is a strong fit for developers who already use Claude Code, Codex, Cursor or OpenCode and want a repeatable taste layer without adopting a full design system. It is less useful if you need a complete component library or a visual editor.

## Attribution

Made by Together AI. Source and install instructions at [github.com/Nutlope/hallmark](https://github.com/Nutlope/hallmark); theme gallery at [usehallmark.com](https://www.usehallmark.com/). MIT licensed.
