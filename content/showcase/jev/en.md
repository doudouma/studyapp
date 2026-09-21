---
slug: jev
name: Jev
summary: TypeSafe AI's non-generative System One model returns typed, calibrated decisions in 70–500ms instead of prose — now open to everyone with a $5 credit.
category: ai
tags: [Decision Models, Non-generative AI, Structured Output, Model Routing, TypeSafe]
publishedAt: 2026-09-20
updatedAt: 2026-09-20
author: APPSO
externalUrl: https://console.typesafe.ai
facts:
  - key: maker
    value: TypeSafe AI
  - key: founder
    value: Diogo Almeida (ex-OpenAI)
  - key: latency
    value: 70–500ms
    highlight: true
  - key: price
    value: $0.042 / 1M input tokens (output free)
  - key: free credit
    value: $5 ≈ 120M tokens
  - key: funding
    value: $40M seed (DCVC)
sources:
  - title: TypeSafe AI Console
    url: https://console.typesafe.ai
    publisher: TypeSafe AI
  - title: gregpr07 on X — jev-ultrafast computer-use agent decision layer
    url: https://x.com/gregpr07/status/2100411066966749359
    publisher: X (formerly Twitter)
  - title: tamarajtran on X — near-instant token compression with Jev
    url: https://x.com/tamarajtran/status/2100694549362553153
    publisher: X (formerly Twitter)
  - title: mdlahfir on X — dynamic model routing by task complexity
    url: https://x.com/mdlahfir/status/2100314182201802811
    publisher: X (formerly Twitter)
cover:
  src: /showcase/jev.jpg
---

## What it is

Jev is a non-generative model from TypeSafe AI that refuses to write prose. Instead of a conversational LLM, it takes a program state plus one or more predefined questions and returns a typed answer: an option from a list, a score, or a probability between 0 and 1, each with a confidence rating. TypeSafe calls these outputs "calibrated decisions."

The company was co-founded by Diogo Almeida, a former OpenAI researcher who worked on ChatGPT and helped develop Reinforcement Learning from Human Feedback (RLHF). After two years in stealth, TypeSafe debuted on September 15 with a $40M seed round led by DCVC and Jev as its first model. Following a waitlist period, Jev is now open to all users, with a $5 credit (roughly 120 million tokens) for every registered account.

## Core value proposition

Jev trades free-form generation for strongly typed, parallel decisions:

- **Typed outputs, not text**: every response is a Choice (up to 255 options), a Score on a defined scale, or a Noul (a boolean assertion expressed as a probability), returned with full probability distributions and confidence scores. No JSON prompting and no output parser.
- **Parallel evaluation**: all questions in one request share the same input payload but are evaluated independently and concurrently.
- **Speed and cost**: TypeSafe reports 70–500ms end-to-end latency — 20 to 200 times faster than comparable LLMs — at $42 per billion input tokens ($0.042 per million), with output billed at zero.
- **No traditional hallucination**: because the answer space is defined up front, the model cannot invent details outside the predefined options, though it can still pick the wrong option.
- **Real-time decision layer**: in a public Ably Pong benchmark, Jev made 47 gameplay decisions in 12 seconds while Gemini, Claude, and GPT each managed only two to three in the same window.

## What it can replace

| Target software | Feasibility | Verdict & use-case context |
| --- | --- | --- |
| LLM classification and routing prompts | High | Replaces JSON-schema prompting with typed output at a fraction of the latency and cost; Vercel reported a 5–18x speedup over the ChatGPT Luna 5.6 safety classifier with higher accuracy. |
| Dedicated fine-tuned classifiers | Moderate | Competitive for many routing and scoring jobs, but teams lose control over the exact architecture and training data. |
| Dialogue, summarization, or open-ended generation | Low | Jev does not produce text; text entry in agent flows still needs a small generative model behind it. |

## Current realities and limitations

- **Decision-only, not reasoning**: Jev answers predefined questions; it does not explain itself or handle open-ended tasks.
- **Wrong answers are still possible**: constraining the output space prevents fabricated details, but selecting an incorrect option within the set remains a real risk.
- **The developer owns uncertainty**: as Earendil CTO Armin Ronacher noted, teams must decide what to do at a 50% probability versus a 95% one, moving hallucination management into application code.
- **Undisclosed architecture**: TypeSafe has not published Jev's exact model architecture, and observers speculate it adapts an open-source base model.
- **Capacity pressure**: demand after the public launch briefly exceeded capacity and caused API slowdowns.

## Verdict

> **Primary recommendation**
> Treat Jev as a fast, cheap decision primitive rather than a chatbot. For routing, scoring, moderation, and agent action selection it can collapse cost and latency by an order of magnitude — as long as the developer orchestrates explicit questions in code and defines clear thresholds for acting on a probability.

Cheaper inference changes how often it is worth calling a model at all. Jev's name comes from the Jevons Paradox — as a resource gets cheaper, total consumption rises — and the wager is that near-free inference pushes intelligence into countless micro-decisions that were previously not worth an LLM call.

## Development lifecycle and iteration loop

Jev is deployed by breaking a business decision into explicit questions and orchestrating them in application code, rather than hoping one prompt handles everything.

| Stage | Model / Tool used |
| --- | --- |
| Decision-space design (Choice / Score / Noul schemas) | Developer-authored question and option sets |
| Real-time decision inference | TypeSafe Jev |
| Orchestration, thresholds, and fallbacks | Application code (TypeScript / Python runners) |
| Free-text steps (e.g. typing a city name) | Small generative model called only when needed |

## Metrics and monetization

- **Funding and launch**: $40M seed led by DCVC, public debut on September 15.
- **Pricing**: $0.042 per million input tokens, output free; new accounts receive a $5 credit worth roughly 120 million tokens.
- **Reported outcomes**: Vercel reported a 5–18x speedup over ChatGPT Luna 5.6 for safety classification; Bryo AI found Jev 10–20x cheaper than Gemini for business email classification at slightly lower accuracy.
- **Early use**: one team curated a niche content feed by evaluating eight criteria across three days of posts in two seconds for $0.007; marketing analytics teams wired Jev into the Meta Ad Library to track ad lifecycles and grade creative scripts, reporting a 30x faster workflow for under $3 total.
- **Monetization**: usage-based token pricing; TypeSafe says it plans specialized models for different domains.

## Community reception and key debates

The launch triggered heavy discussion across the developer and AI design communities:

- **Model routing as the killer app**: Ronacher argued that predicting whether a query needs a frontier model is valuable but was cost-prohibitive with an LLM; Jev makes real-time intelligent routing economically viable.
- **Non-generative vs. generative**: developers praised the determinism and parallel speed, framing Jev as a guardrail layer for agentic architectures rather than a replacement for LLMs.
- **Who manages uncertainty**: the most cited trade-off is that constraining outputs pushes probability thresholds back onto the developer.
- **Positioning and hype**: Almeida said he does not consider TypeSafe a frontier lab — "the primary outputs of frontier labs are either fear or hype. I want our primary output to be intelligence."
