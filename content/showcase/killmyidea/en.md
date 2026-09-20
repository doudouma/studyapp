---
slug: killmyidea
name: KillMyIdea
summary: A rapid startup idea validation tool evaluating pitches across 10 parallel criteria using TypeSafe's deterministic Jev model.
category: experiment
tags: [Idea Validation, Classification, Open Source, Parallel AI, Proof Of Concept]
publishedAt: 2026-09-20
updatedAt: 2026-09-20
author: u/stemonte
externalUrl: https://killmyidea.stemonte.io
facts:
  - key: models
    value: TypeSafe Jev
  - key: author
    value: stemonte
  - key: platforms
    value: Web
  - key: price
    value: Free (Open Source)
  - key: latency
    value: ~539ms
    highlight: true
  - key: output
    value: Quantitative 0–100 score (Non-generative)
sources:
  - title: r/SideProject — I built a side project to test TypeSafe's Jev model with no generative LLM that scores your project idea
    url: https://www.reddit.com/r/SideProject/comments/1wiw6tk/i_built_a_side_project_to_test_typesafes_jev/
    publisher: Reddit
  - title: KillMyIdea — source code
    url: https://github.com/monteduro/killmyidea
    publisher: GitHub
cover:
  src: /showcase/killmyidea.jpg
  video: https://packaged-media.redd.it/ed9in2cwe3qh1/pb/m2-res_1080p.mp4?m=DASHPlaylist.mpd&var=sgpssan&v=1&e=1789902000&s=9b90591471379ad12bcc5a8d693565dbfac60d52
  videoPoster: /showcase/killmyidea.jpg
---

## What it is

KillMyIdea is an open-source proof of concept designed to stress-test TypeSafe's non-generative Jev model. Instead of relying on a traditional conversational LLM that outputs conversational reasoning, it takes an idea pitch and runs roughly 10 targeted evaluation questions in parallel. In a fraction of a second, the system returns a composite numerical score from 0 to 100 along with granular diagnostic classifications (such as "SHIP IT" or "FIX IT").

## Core value proposition

- **Zero generative chatter**: Eliminates conversational fluff and prompt drift by using a deterministic model that outputs solely quantitative probabilities rather than text.
- **Sub-second parallel evaluation**: Runs all evaluation queries concurrently, delivering comprehensive multi-axis feedback in roughly 500 milliseconds instead of 30 to 60 seconds.
- **Weighted multi-factor rubrics**: Scores independent axes like Demand, Customer Clarity, and Buildability on fixed 0–4 scales, applying heavier weights to critical factors such as market need and real problems.
- **Goal-aware calibration**: Supports project goals (such as Open Source or Just for Fun) to prevent penalizing ideas that intentionally avoid monetization.

## What it can replace

| Target software | Feasibility | Verdict & use-case context |
| --- | --- | --- |
| Standard LLM validation prompts (ChatGPT / Claude) | Partial | Replaces slow 30–60 second generative answers with instant deterministic classification, though without qualitative explanations. |
| Manual idea-scoring spreadsheets | High | Replaces manual rubric scoring for rapid gut checks during hackathons or initial brainstorming sessions. |
| Human mentor pitch review | Low | Cannot replace deep market research, domain regulatory expertise, or contextual nuance. |

## Current realities and limitations

- **Evaluates the pitch, not the market**: The underlying model evaluates the descriptive phrasing of the pitch against calibrated linguistic rubrics; it does not query live market data or verify external reality.
- **Blind to domain regulations**: Specific barriers like regional compliance, licensing, or complex legal hurdles are not automatically factored in unless explicitly detailed in the prompt.
- **Lack of qualitative narrative**: Because the model returns only numbers and discrete levels, users receive no direct written explanations for why a specific metric received a low score.
- **Heuristic weighting**: The composite score is derived from an author-defined weighted average rather than an established venture capital benchmark.

## Verdict

> **Primary recommendation**
> Use KillMyIdea as a lightning-fast, objective sanity check to spot weak phrasing or poorly defined target audiences before drafting comprehensive proposals.

KillMyIdea proves that non-generative evaluation models like Jev can slash latency and eliminate non-deterministic variance in automated workflows. While it should not be treated as an authoritative market verdict, it serves as an effective first-pass triage filter for developers, founders, and agent pipelines.

## Development lifecycle and iteration loop

The project was implemented as an open-source web application ([killmyidea source code](https://github.com/monteduro/killmyidea?utm_source=gemini)) to experiment with direct access to TypeSafe's Jev model. Iterations on community feedback included adding a "Refine Idea" workflow and optional goal parameters to adjust scoring logic for non-commercial projects.

| Stage | Model used |
| --- | --- |
| Rubric formulation & question design | General LLM (GPT) with author refinement |
| Real-time parallel classification | TypeSafe Jev |
| Final score aggregation & thresholding | Client/server algorithmic weighting (TypeScript) |

## Metrics and monetization

- **Pricing**: Completely free to use.
- **Licensing**: Open source under an accessible public repository.
- **Performance**: Capable of evaluating 10 distinct rubrics concurrently within roughly 539 milliseconds.
- **Monetization**: No direct monetization; built as a technical demonstration and POC for developer feedback.

## Community reception and key debates

- **Deterministic predictability**: Developers praised Jev's parallel speed and non-generative nature, noting its potential as a deterministic guardrail for agentic architectures.
- **Scoring skepticism**: Commenters initially questioned whether scores differed meaningfully from pseudo-random numbers, leading the author to clarify the calibrated 0–4 rubric mechanics.
- **Data harvesting concerns**: Some users hesitated to submit proprietary startup ideas, prompting the author to highlight an explicit opt-out toggle that prevents pitch storage.
