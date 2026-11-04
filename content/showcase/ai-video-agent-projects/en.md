---
slug: ai-video-agent-projects
name: 369 AI Video Projects for Coding Agents
summary: A curated map of 369 open-source video and auto-editing projects built for Claude Code, Codex and other coding agents, filtered by output, agent-readiness and docs.
category: resource
tags: [AI Video, Open Source, Claude Code, Codex, Agent Skills, Remotion]
publishedAt: 2026-10-27
updatedAt: 2026-10-27
author: 刘老板 (@leo_xiaolei)
externalUrl: https://waytoagi.feishu.cn/wiki/Te14wRPAJiVpJ1k4O9pcpgX3nHg
facts:
  - key: projects
    value: "369"
    highlight: true
  - key: author
    value: "@leo_xiaolei"
  - key: platform
    value: X / Feishu
  - key: language
    value: Chinese
  - key: focus
    value: AI video & auto-editing
  - key: data
    value: GitHub API snapshot 2026-10-27
sources:
  - title: 我评估了 369 个 Claude/CodeX AI 视频与自动化剪辑开源项目
    url: https://waytoagi.feishu.cn/wiki/Te14wRPAJiVpJ1k4O9pcpgX3nHg
    publisher: WaytoAGI
    date: 2026-10-27
  - title: Original thread by @leo_xiaolei
    url: https://x.com/leo_xiaolei/status/2115032723375218763
    publisher: X
    date: 2026-10-27
cover:
  src: /showcase/ai-video-agent-projects.jpg
---

## What it is

A Chinese-language survey of 369 open-source repositories that let coding agents such as Claude Code and Codex generate video, edit footage automatically, or render motion graphics from code. The author deliberately ignores the usual "GitHub stars filter", because stars do not track real production value: some repositories with only a handful of stars solve a very specific pain point better than heavily starred ones.

The list is a map, not a benchmark. Each entry points to a repository, a Skill, a plugin or an MCP server, and the article groups them by workflow so you can pick a starting point instead of cloning 369 repos.

## How the list is filtered

Three rules decide what gets in:

1. **It must produce video or motion.** Pure 3D web scenes are excluded; the output must be a code-rendered film, clip or prompt set that an agent can reproduce.
2. **It must be built for agents.** Skills, plugins, MCP servers, or toolkits explicitly designed for Claude Code, Codex and similar coding agents.
3. **It must have a complete README.** Without documentation the practical value cannot be verified.

All star counts and repository data are a GitHub API snapshot from 2026-10-27, so treat them as a point-in-time signal rather than a current ranking.

## The four standout frameworks

| Project | Stars | What it does |
| --- | --- | --- |
| lemo-opuscar | 8,322 | A visual style engine with 59 code-rendered video styles tuned for Claude Opus 5.5. The "OPUSCAR 98" sample runs 6m31s and shows 98 styles without calling a video-generation model. |
| huashu-art-motion | 5,418 | An art-animation Skill combining 36 art styles, 9 narration grammars and 8 parameterized clips. Strong for brand-consistent explainers without a talking head. |
| huashu-motion | 1,766 | Automates commercial product launch films: read product info, propose three directions, write the film, then score music with ABC notation. Its browser-based visual editing lets you click a frame and describe the fix. |
| sweety-handdraw-video | 903 | A Codex-friendly hand-drawn explainer pipeline: topic or article in, script, storyboard and illustrations out, then local rendering with frame-level alignment and VoxCPM 2 voice synthesis. |

## Other clusters worth knowing

- **Automatic editing and human-in-the-loop:** browser-use/video-use cuts raw footage from word-level transcripts and handles subtitles plus FFmpeg color work. OpenChatCut and BaoCut add manual timeline tweaks after the machine pass.
- **Low-star frontier experiments:** fragua (11 stars) runs locally with FFmpeg and no API key for vertical de-silencing and burned-in subtitles. cutloupe (0 stars) exposes an MCP plus a visual timeline and sends real rendered frames back to the model through a `look` command.
- **Code-to-video prompts and shot cards:** awesome-opus5-5-videos collects 703 Opus 5.5 prompts. video-shotcraft ships 152 structured shot recipes and 209 motion previews for Remotion commercial work.
- **Motion reverse engineering:** lovisdotio/motion2code rebuilds an existing motion video as inline SVG and GSAP timelines, so you can compare frame by frame with the original.
- **Explainers, presenters and music videos:** Raven reads a repository's Git history and generates a two-minute hand-drawn explainer; stickman-video-director targets faceless stickman science channels; lanshu-create-ai-presenter-video stays vendor-neutral for authorized presenter images; digital-human-koubo turns one image plus text into lip-synced video through Renoise MCP and Grok Video; PDoomVideo publishes a complete music-video source base.

## Current limitations

- **It is a survey, not a test.** The author read repositories and READMEs; there is no head-to-head output quality benchmark.
- **Stars are stale by design.** The snapshot is from one day, and fast-moving agent projects can change weekly.
- **Chinese-first.** The analysis and selection commentary are in Chinese, even though most linked repositories are in English.
- **Link rot and maintenance risk.** A curated list of 369 repos will inevitably include abandoned or renamed projects; check the README, license and last commit before adopting one.
- **Scope bias.** The list focuses on video and motion for coding agents, so general video editors, pure 3D web work and non-agent tools are intentionally missing.

## Verdict

> **Primary recommendation**
> Use this as a shortlist generator, not a leaderboard. Start from the four standout frameworks if you need a proven workflow, then mine the low-star section for a specific gap your pipeline has.

The most useful part is the filter itself: output must be video, the tool must be agent-callable, and the README must be complete. That is a better selection heuristic than star count for anyone building an AI video pipeline with Claude Code or Codex. Verify each repository's current state before committing to it.

## Attribution

This case links to a WaytoAGI Feishu repost. The original thread was published by 刘老板 (@leo_xiaolei) on X on 2026-10-27; copyright remains with the original author, and the original link is the authoritative source.
