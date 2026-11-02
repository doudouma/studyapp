---
title: 100 Questions About Jev
summary: From System One and the Choice/Score/Noul primitives to API access, calibration, shadow mode, limits, open-source alternatives and rollout order — 100 questions on how to use a judgement model like Jev.
tags: [Jev, System One, Judgement Model, AI Agents, Topic Guide]
author: 100mini Editorial
publishedAt: 2026-11-01
updatedAt: 2026-11-01
questionCount: 100
chapterCount: 6
facts:
  - key: Author
    value: 100mini Editorial
  - key: Questions
    value: 100
    highlight: true
  - key: Chapters
    value: 6
  - key: Topic
    value: Jev / System One judgement models
  - key: For
    value: AI engineers / product / data / agent builders
  - key: Updated
    value: 2026-11-01
---

## Preface

This is a "100 questions" guide: a way to break a large subject into questions, then read it one question at a time.

Jev represents a new kind of model: instead of generating free text, it compresses judgement into a single function call that returns a typed answer and a calibrated probability. It is cheap, fast and deterministic, but its boundaries are clear: it is weak at generation, explanation, counting, arithmetic and multi-hop reasoning. The guide follows six stages: understand what it is, connect it, break problems apart, avoid the pitfalls, calibrate it, and decide where it belongs.

**Quick answers**

- Treat Jev as a judgement layer, not a general-purpose model.
- Tasks must be enumerable, verifiable and calibratable; leave generation, explanation and long-chain reasoning to an LLM.
- Run a baseline, shadow mode and your own calibration set before a small traffic switch.
- Set thresholds by business risk, and keep human review and rollback for high-risk actions.
- Verify vendor numbers and community benchmarks against the original source.

> Compiled from Jev documentation and public material, structured and lightly completed for this site.

> This is an edited edition: some source passages were truncated by OCR, so the body focuses on an actionable question list with concise answers.

## 1. A model that only answers multiple-choice questions

### 1. Why does Jev, a model that generates no text, dare to call itself frontier intelligence?

Because it turns judgement into typed output for System One tasks: it reads a state and returns a choice plus a calibrated probability, without generating free text. "Frontier" is scoped to that kind of fast decision task, not to general generation or reasoning.

### 2. Is the name System One borrowed correctly or just hype?

It borrows the "fast, intuitive judgement" idea, not the strict cognitive-science definition. It emphasises low-latency decisions; do not read it as having all of human System One.

### 3. The vendor says zero hallucination. Why is the community arguing?

Zero hallucination means it does not generate free text and its output is restricted to predefined options, so it cannot invent a paragraph. It can still pick the wrong option, be badly calibrated, or misunderstand the input.

### 4. It was immediately called the "shut-up model". Is that unfair?

Not really. It only answers multiple-choice questions, does not explain, and does not chat; the output is a closed set of answers. If you want reasons and follow-ups, you still need an LLM.

### 5. Does the "undergraduate homework" mock hold up?

Partly: its task range is narrow, and many questions can be handled by simple rules or small models. Its engineering value is the uniform API for classification, scoring and gating with calibrated probabilities, not how hard the questions are.

### 6. What exactly does the widely saved manifesto promise?

It promises a new model category: no text generation, only verifiable judgements, fast, cheap and structurally deterministic. It does not promise general intelligence or that every answer is correct.

### 7. How do I decide whether my pipeline needs Jev?

Look for repeated classification, routing, scoring or gating where the answers are enumerable and verifiable. If the task needs generation, explanation or multi-step reasoning, do not switch yet.

### 8. Which judgements should go to Jev, and which must stay with an LLM?

Enumerable, stable, calibratable judgements go to Jev; open-ended generation, complex reasoning and anything needing explanation or fallback stay with an LLM.

### 9. How much can I save by moving classification calls over for a year?

It depends on volume and the old model's price. Jev charges only for input tokens and makes output free, so common classification and routing tasks get much cheaper; include retries, fallback and human review in the calculation.

### 10. Which limitations does the vendor admit before I start?

It is weak at counting, arithmetic, vision, multi-hop reasoning and explanation, and does not guarantee any single answer is correct. Read the official limitations page against your task.

### 11. Is it just a traditional classifier in new clothing?

Not the same thing. A traditional classifier needs labels and feature engineering; Jev uses natural-language states and options plus RLCD calibration, and its interface feels like a single function call. The task shape is still classification-like.

### 12. Why is RLHF blamed for automation arriving slowly?

RLHF depends on human preference labels, which are expensive, slow and hard to cover for every niche judgement. Jev tries to use automatically generated feedback for calibration, making "train a model for every small judgement" cheaper.

### 13. What is the one objective where RLCD differs from RLHF and RLVR?

RLHF aligns to human preferences, RLVR uses verifiable rewards, and RLCD emphasises automatically constructed contrast/calibration signals for judgement models. The goal is trustworthy probabilities, not more human-sounding text.

### 14. What is the idea behind putting frontier intelligence into one function call?

Package model capability as a stable API: state and candidates in, typed decision and probability out. Callers do not manage prompts, parsing or retries; they call judgement like a normal function.

## 2. Connect your first decision in five minutes

### 15. What is the fastest path to a first Jev decision in five minutes?

Register, get a key, and send one minimal request with the official SDK: one state, one question, a few options. Inspect the response shape and probability before wiring it into your product.

### 16. What do a Jev request and response look like?

The request carries the state, the question/options or scoring dimensions; the response returns the typed selection, probability and confidence information. Check the official SDK and docs for exact fields.

### 17. How do I choose between the Python and JS SDKs?

Follow your server language. Python fits data and backend scripts; JS/TS fits Node and frontend tooling. Do not change stacks just for an SDK.

### 18. What are the five access paths for?

Roughly: raw API, official SDKs, Claude Code/agent integration, one-click bundles/mirrors, and self-hosted/open alternatives. Production should prefer the official API/SDK; one-click bundles are for experiments, with source and security caveats.

### 19. What is the easiest way to connect from mainland China?

Prefer officially supported access. If direct connections are unstable, use a compliant proxy or mirror, but do not hand your key to an untrusted relay. You own the stability and privacy risk of a mirror.

### 20. Jev charges only for input tokens. What does that mean for my usage?

Output is free, so long states and long candidate lists become the main cost. Shorter states and tighter candidate sets save more than repeated retries.

### 21. How do I use the 250k tokens/second rate limit without hitting the wall?

Batch and parallelise, back off on 429s, and monitor token rate. Never hammer it with infinite retries; split large requests into controlled batches.

### 22. How do I let Claude Code call Jev directly?

Wrap Jev as a tool/function or an MCP/CLI endpoint so Claude Code can call it for classification, routing and scoring. Define input/output and failure fallback first.

### 23. How many steps from registration to a key?

Register, verify, create a key, and set quota and permissions. Production also needs key rotation, environment variables and access logs.

### 24. Can I touch the no-signup one-click bundle or mirror sites?

They are fine for local experiments, but do not process sensitive data in production. Unknown bundles and mirrors carry supply-chain and privacy risk.

### 25. What version strategy sits behind the default `jev-latest`?

`latest` follows the vendor's default and is convenient but may change silently. Pin an explicit version in production and run regression/calibration tests before upgrading.

### 26. What does five SDK releases in twelve days tell me?

The product is iterating quickly and behaviour may change. Do not treat early versions as stable infrastructure; keep tests and rollback.

### 27. What should I record after the first requests?

Latency, input tokens, cost, probability distribution, error rate and human review outcomes. Without a baseline you cannot judge whether switching was worth it.

### 28. Is putting three questions in one call marketing or a real saving?

If the questions share the same state and candidate set, batching saves tokens and round trips. If they are unrelated, parsing and error handling cost more than the saving.

## 3. Break judgement into atomic questions

### 29. How do I choose between Choice, Score and Noul?

Choice selects one from an enumerated set; Score rates an object; Noul tests whether a condition holds or is present. Match the primitive to the task instead of forcing everything into one.

### 30. Should the state be a string or an object?

Use a structured object when possible: fields stay clear and reusable. Use a string only for natural-language context, and strip irrelevant information either way.

### 31. How do I split a compound judgement into atomic questions Jev can take?

Split into independent, enumerable sub-judgements, then decide which run in parallel and which in sequence. Every sub-question needs clear options and acceptance criteria.

### 32. What if my options exceed Jev's 255 limit?

Narrow in two stages: a coarse first pass reduces the candidate set, then a final choice runs on the small set. Do not stuff every candidate into one call.

### 33. How do I write Score levels that do not wobble?

Give each level an observable anchor, such as "clearly violating / suspected / irrelevant", plus boundary examples. Vague descriptions produce unstable scores.

### 34. When is it worth adding a few examples to a question?

When options are easily confused, the business definition is unusual, or the team disagrees on level boundaries. A few high-quality examples help; too many become another prompt-engineering project.

### 35. Which of the four official modes should I learn first?

Start with the single mode closest to your task, prove it on real work, then look at the others. Do not combine all four from day one.

### 36. How does speculative fan-out give me a free judgement?

Evaluate several candidates or branches in one request so the parallel sampler returns multiple judgements at once. It works when they share state and you can afford one call.

### 37. How should the confidence traffic-light thresholds follow risk?

Raise the threshold and require human review for high-risk actions; relax it for low-risk ones. Thresholds must be calibrated on your own data, not copied from someone else.

### 38. How do I set weights for a composite score without playing favourites?

Derive weights from business goals and historical data, not intuition. Start with a simple weighted baseline, then adjust using calibration and error analysis.

### 39. How do I lift retrieval top-1 from 5% to 18% with reranking?

Use Jev to score relevance/quality of candidates, fuse that with the original retrieval score, and rerank the small candidate set. The gain comes from a better judgement signal, not magic.

### 40. How do I stop fabricated citations in citation checking?

Turn "does this passage really support the claim" into a choice/scoring task and keep the source span. If there is no source or it cannot be verified, mark it "to confirm".

### 41. How do I map function-call parameters to multiple-choice questions?

Break parameters into enums, types and required fields; use Choice for values and Noul for presence. For complex parameters, validate structure first, then let the model judge semantics.

### 42. How do I narrow thousands of candidates to one in two stages?

Use cheap rules or vector retrieval to cut to dozens, then use Jev for fine scoring or selection. Do not try to do it in one step.

### 43. Why should date extraction be read-only rather than computed?

Date extraction is locating and normalising text, not arithmetic. Let the model read the date span, then parse and validate it with deterministic code.

### 44. Can the same question phrased differently produce a very different result?

Yes. Option wording, order and state phrasing all affect probability. Fix the phrasing for critical tasks and test robustness to wording.

### 45. In the Norwegian test, is Score the only task type Jev wins?

Such tests usually have small samples and show relative performance on one language/task, not that Score is universally stronger. Re-test on your own language and data.

### 46. The vendor says no context rot but also admits rot. Which is it?

The vendor means it does not generate text or accumulate long conversations, so classic LLM context rot does not apply. But noisy input or ambiguous options can still degrade judgement.

### 47. Why does Noul have no independent confidence?

Noul is closer to a boolean/existence judgement with a small output space, and the vendor does not attach a separate calibrated probability. Use Choice/Score or extra calibration when you need confidence.

### 48. Why not send question numbers to the model?

To prevent the model from treating the number as a semantic clue and to reduce position/order bias. Numbers stay on the caller side for mapping results.

## 4. Pitfalls the vendor admits

### 49. Which nine pitfalls are on the vendor's own limitations page?

Broadly: counting, arithmetic, vision, multi-hop reasoning, adversarial text, cross-request thresholds, missing explanations, calibration drift and language/domain generalisation. Check each against your own scenario.

### 50. Why do two task types give conflicting answers on the same ticket?

Choice and Score phrase the question differently, so the model sees different cues. Use one primitive and one wording for critical tasks; when they conflict, human review wins.

### 51. Why can't Jev count objects or do arithmetic?

It does not execute step-by-step computation or keep counting state; numbers are more like semantic tokens than operands. Leave counting and arithmetic to deterministic code.

### 52. How was it knocked off its pedestal in a few moves of gomoku?

A board needs long-horizon search and exact counting; Jev makes local judgements, not search. It can answer "is this move good?", not play a full game by itself.

### 53. Why was the Pokémon playthrough found to rely on map navigation?

The demo likely mixed memory, maps, scripts and model judgement, so viewers thought the model explored on its own. Once separated, much of it is engineering pipeline, not one model's ability.

### 54. How did a 400-doodle blind test expose that it cannot see?

A text-only model has no vision, so doodle recognition is close to random. Use a vision model for multimodal tasks; do not expect Jev to see.

### 55. When does Jev's confidence formula mislead you?

When the input distribution differs from calibration data, option boundaries are fuzzy, or adversarial text appears, probabilities become overconfident. Calibrate thresholds per scenario.

### 56. Why can't a Jev threshold be moved across requests?

Each task has a different class distribution and risk profile; calibration is a property of the model plus the data. A 0.8 on task A is not a 0.8 on task B.

### 57. Why can adversarial text still move its answer?

It still reads natural language, so crafted wording, negation and inducement affect judgement. High-risk scenarios need input cleaning, rule guards and human review.

### 58. What must I test before using it in Chinese?

Chinese option wording, domain terms, negation, long states, numbers/units, and a calibration set that matches your traffic. English performance does not transfer automatically.

### 59. Why do double negation and multi-hop reasoning fail?

It is strong at single-step, closed-option judgements; double negation and multi-hop need composition, which is outside System One's strength. Split into single steps or use an LLM.

### 60. Is zero type error the same as a correct answer?

No. Zero type error only guarantees the output matches the schema, not that it is semantically right. A valid type with the wrong answer can still happen.

### 61. Why is "no explanation" a real weakness when it gets something wrong?

It returns only the result and probability, not the reason. Debugging, auditing and explaining to users require extra logs, rules or an LLM fallback.

### 62. What does a high public score and a weak sealed score tell me?

That the public set may be overfit or differently distributed. Validate on your own sealed set/shadow traffic before shipping; do not ship on leaderboard rank alone.

### 63. Why doesn't a probability distribution that sums to one mean it is reliable?

Normalisation is a mathematical constraint, not calibration. The model can assign 0.9 to a wrong answer; what matters is calibration error and your business threshold.

### 64. Why must numbers in Chinese tutorials be traced back to the source?

Second-hand tutorials may misquote, go stale or take things out of context. Prices, latency and accuracy claims should go back to the official docs or original evaluation.

## 5. Calibrate before you ship

### 65. Why can a higher-F1 model be less useful?

F1 is a single-threshold aggregate; the business may care more about precision, low false positives or calibration. A high F1 with untrustworthy probabilities is still hard to use.

### 66. How do I read ECE and Brier?

ECE measures the gap between predicted probability and observed frequency across buckets; Brier is the mean squared error of probabilistic predictions. Compute both on your business distribution, not just one.

### 67. Why run a GBT baseline before switching models?

Gradient-boosted trees are strong on tabular/structured tasks. A baseline tells you whether Jev adds value; without it, switching is just a feeling.

### 68. How do I run shadow mode properly?

Let Jev judge real traffic in the background without affecting production, and record differences from the LLM/human, cost and latency before deciding to switch.

### 69. What exactly do I verify when calibrating on my own data?

Bucket reliability, ECE/Brier, precision/recall at the threshold, and bias across sub-groups. Do not rely on overall accuracy alone.

### 70. How do I tell whether a result is capability or convenience?

Check whether the gain comes from better judgement, not a shorter API or easier deployment. Capability gains must reproduce on blind/sealed sets.

### 71. How many samples are enough?

It depends on the number of classes and error tolerance; rare classes need more samples. Give every key bucket enough positives and negatives, and report confidence intervals.

### 72. What should the threshold follow?

The cost of mistakes and your human-review capacity. High-risk actions should go to humans more often; low-risk ones can be relaxed.

### 73. How do I keep a one-click fallback to the LLM after launch?

Keep a switch and dual logs; route to the LLM or a human on timeout, low confidence or anomalies; ensure fallback does not break the upstream contract.

### 74. Is it true that stricter wording makes calibration worse?

Sometimes. Overly legalistic or long options drift from the training distribution and reduce stability. Use natural business language and test on your own data.

### 75. Why is the vendor's reference answer being questioned?

If the reference answers are ambiguous or wrong, the score is not credible. The community reproduces, samples and challenges the labelling.

### 76. How was the "900× lower judge variance" measured?

It is a comparison at the evaluation-method level: repeated LLM judging has much lower variance than human judging. Read the original setup and sample size for the exact number.

### 77. Why can a constant "always unqualified" classifier look good?

With extreme class imbalance, a constant classifier can look decent on accuracy/F1 while having no discrimination. Look at precision/recall, calibration and business cost.

### 78. Why does answering the same way every time not mean it is right?

Determinism means the output is stable, not correct. Stable wrong answers are more dangerous because you are more likely to trust them.

### 79. Why is calibration a property of model plus data, not the model alone?

The same model has different calibration on different distributions and option sets. Thresholds and probabilities must be bound to a specific task and data.

### 80. Can I average several runs as a calibration substitute?

It reduces variance but does not fix systematic bias. Ensembling is an engineering technique, not a replacement for calibration.

## 6. Where to use it and where not to

### 81. How do I build two-way guardrails for content moderation?

Use Jev for fast blocking/routing of high-risk content while keeping an LLM or human reviewer on both sides: false positives and false negatives both need a fallback.

### 82. How do I route support tickets by intent?

Make the intents an enum, use Choice for classification and route low-confidence cases to humans; use Score for priority. Validate routing accuracy in shadow mode first.

### 83. How do I add a pre-execution gate for dangerous agent actions?

Before deleting, paying or sending, use Jev to judge the action and context; require human confirmation for high risk and allow low risk through.

### 84. How do I do structured extraction with zero character errors?

Let the model locate/classify, and use deterministic parsers for the actual strings. Do not let it freely generate critical fields.

### 85. How do I compress context by deleting only conversational waste?

Turn each conversation segment into a keep/delete/confirm choice and preserve decisions, facts and constraints; have an LLM review the compressed result.

### 86. Can I write semantic conditions directly in database queries?

Convert natural-language conditions into structured filters/enums, but do not let the model generate and execute SQL directly. Keep semantic judgement separate from database operations.

### 87. How much faster is browser automation with Jev navigation?

If page elements and actions are enumerable, Jev can pick the next step quickly; page changes, visual grounding and exception handling still need a browser tool for fallback.

### 88. Which hills do the five open-source alternatives occupy?

Common buckets: local small models, embedding/rerankers, traditional classifiers, rule engines and LLM routing frameworks. Each fits a different part of the stack.

### 89. What budget and team conditions justify training my own?

You need stable data, clear labels, continuous iteration and ML engineering. Otherwise validate with an API or open model first.

### 90. Is an open-source alternative free, and who owns the risk?

No. The model may be free, but deployment, labelling, tuning, monitoring and incident ownership are yours. You save licence fees, not total cost.

### 91. What signals that my pipeline is simply a bad fit for Jev?

The task needs generation/explanation, long-horizon reasoning, vision or exact counting, or the options cannot be enumerated and acceptance is unclear. Do not switch yet.

### 92. Where do the "193 points, 6× faster, 444× cheaper" numbers come from?

They are vendor/benchmark comparisons on specific tasks, baselines and billing assumptions, not a universal promise. Check the task, hardware, model version and pricing.

### 93. How was the "25× faster" myth punctured?

The community reproduced it and found differences in baselines, caching, batching or task difficulty. The real end-to-end gap was smaller than the marketing claim.

### 94. What does a 3,000-star replica in two days tell me?

There is real demand, and the idea itself is not the moat. Replicas are fast; data, calibration and engineering are the hard part.

### 95. Will OpenAI and friends swallow it whole?

Big labs may absorb similar capabilities into existing models/APIs, but specialised judgement models still have room on cost, latency and determinism. It depends on whether it compounds data and scenarios.

### 96. Is the moat an architectural secret or a data factory?

More likely a data factory: continuously generating high-quality contrast/calibration data, covering long-tail scenarios and hardening the pipeline. A single architecture is easy to copy.

### 97. What does the 27,000-star computer-use framework have to do with it?

Agent/computer-use frameworks are the demand side: they need cheap, fast, verifiable judgement layers. A model like Jev can become one component inside them.

### 98. How do I check the "3% annual TFP growth over five years" claim?

Check the TFP definition, measurement, sample period and source. A macro-growth forecast is not proof of product capability; do not mistake a vision for a measured result.

### 99. Will decision models be the next forgotten classifier?

Possibly. If it cannot keep proving incremental value in real business workflows, it will become an ordinary component in the infrastructure, like many classifiers before it.

### 100. In my first month with Jev, what order should I follow?

Pick one high-frequency, enumerable, verifiable judgement task; run a GBT/LLM baseline; validate calibration and cost in shadow mode; switch a small traffic slice; keep fallback and rollback; then extend to a second task.

