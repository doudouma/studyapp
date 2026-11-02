---
title: 100 Questions About Context Engineering
summary: From context rot and attention budgets to window assembly, compaction and caching, instruction design, cost accounting and quality evaluation — 100 questions on how to make context engineering work in practice.
tags: [Context Engineering, AI Agents, LLM, Prompting, Topic Guide]
author: 100mini Editorial
publishedAt: 2026-11-02
updatedAt: 2026-11-02
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
    value: Context Engineering / context windows
  - key: For
    value: AI engineers / agent developers / product and data teams
  - key: Updated
    value: 2026-11-02
---

## Preface

This is a "100 questions" guide: a way to split a large topic into questions, then read it one question at a time.

Context engineering is not about writing a better sentence of prompt. It is about deciding, before every inference, which small set of tokens should be assembled from documents, tools, memory and history to maximize the chance of success. It is also a cost discipline: every token in the window both dilutes attention and adds to the bill.

The guide follows six stages: why a fuller window gets dumber, what deserves to enter the window, how long sessions avoid a bad ending, how instructions survive, where the money goes, and how to verify quality.

**Quick answers**

- A window is a workbench, not a warehouse: the right tokens beat more tokens.
- Get correctness and completeness right before optimizing size; wrong beats missing, missing beats noisy.
- Cap instead of rewriting, clear instead of forcing compaction; caches hate prefix changes.
- Put critical constraints in project files, not only in conversation history.
- A technique has no universal value, only "did it improve your eval set?"

> Compiled from Context Engineering source material and public references, restructured and edited for this site.

> This is an edited edition: some source passages were truncated by OCR, so the body favors an actionable question list with concise answers.

## 1. Why a Bigger Window Gets Dumber

### 1. Why does filling the window make a model dumber?

It is context rot: the more tokens in the window, the worse the model becomes at retrieving information accurately. A controlled study across 18 models found the same direction — none held its score as input grew.

The cause is the attention budget. Transformers relate every token pair, so n tokens create n² relationships; a fuller window spreads the budget thinner. Degradation is gradual rather than a cliff, but retrieval precision and long-range reasoning quietly slip.

### 2. The needle test is perfect, so why do real tasks still fail?

Because "needle in a haystack" tests vocabulary matching, not semantic understanding. Real tasks often share no keywords between question and answer, and the model must distinguish relevant-but-unhelpful material.

Test three things: can it find the fact, can it find it when the question is paraphrased, and can it still find it with distractors. Testing only the first overestimates the model.

### 3. Why is information in the middle most likely to be forgotten?

Attention follows a U-shape: strong at the start (primacy), strong at the end (recency), weak in the middle. In multi-document experiments, a key fact placed in the middle of 20–30 documents scored below the closed-book baseline with no documents at all.

So put long documents first and the question last; beyond roughly 20 documents, adding more yields very little.

### 4. Why does placement matter more than merely being in the window?

Information that is present but buried is not much better than information that is absent. With the same needle and length, changing semantic similarity, distractors and haystack structure moves the score substantially.

Do three things: segment with headings or XML tags; give instructions, background and tool docs separate sections; use representative examples instead of edge-case lists.

### 5. Why does a longer chat get messier, usually beyond repair?

Models jump to conclusions early, then keep circling a possibly wrong conclusion as new information arrives. Across models, splitting a task into multiple turns dropped performance by 39% on average, and strong models fell too.

If you see two of three signals — contradicting itself, repeating a failed action, ignoring new instructions — stop patching. Write confirmed conclusions to a file and restart in a fresh window.

### 6. Why can shuffled context outperform coherent context?

A counterintuitive but reproducible result: randomly shuffling the haystack improved needle retrieval across 18 models and many lengths. Coherent prose has its own flow, so an inserted needle feels out of place; shuffled text has no flow to violate.

Do not ship shuffled prompts, but take the three positive levers: reduce volume, increase needle-question similarity, and cut distractors.

### 7. How do I tell the four context failures apart: poisoning, distraction, confusion and clash?

Poisoning is a hallucination entering the window and being cited repeatedly. Distraction is a long window making the model replay history instead of acting. Confusion is extra material steering the answer wrong. Clash is old and new information contradicting each other.

Triage from the most confirmable: look for poisoning, then clashes, then remove material to see if confusion clears, and only then blame sheer length.

### 8. Why is attention a budget that shrinks with every token?

Every added token dilutes the attention relationships among all tokens. Double the input and the number of pairwise relationships quadruples — that is the mathematical shape of diminishing returns.

Manage it with two rules: add one thing by deleting another; and put a fixed cap on resident items such as system prompts and tool definitions.

### 9. How do I tell whether the model or the context made the agent dumb?

In engineering practice, most failures are context failures. Run three checks: manually reorder the context and see if performance returns; verify the instructions were actually loaded; compare against the classic context-failure symptoms.

Only if all three are clean should you suspect the model. Otherwise a model swap just gives you another model that the same context can drag down.

### 10. How can the model report how much window is left?

Newer Claude APIs inject a token budget and remaining-budget reminder automatically — context awareness. The model can then plan around the real remaining space instead of guessing when to stop.

For quantitative data, read the usage fields rather than parsing those tags. If your harness compacts automatically, tell the model so it does not stop early.

### 11. How do I measure the usable window of my model by hand?

Use at least five length levels, from a few thousand tokens up to near the advertised limit, changing only length while holding task difficulty constant. Make needles semantic rather than literal, and test both single-needle and multi-needle cases.

Measure the entry point you actually use: API and subscription layers can differ from the marketing page.

### 12. Why does the same model behave like a different model in a different host?

The model is fixed, but the host decides what is assembled before each inference, how history is truncated, and which tools are attached. The same underlying model can perform very differently in Cursor and Claude Code.

Before blaming the model, inspect the host's assembly list: system prompt size, tool count, history truncation, and whether project rules are loaded.

### 13. What are the gaps between an advertised 1M window and a usable one?

Four layers: nominal window, capacity, retrievability, and reasoning range. Buying the window only gets you the first layer; task success usually depends on the last two.

Each layer is smaller than the one before. Check docs and token counting for capacity; measure retrievability and reasoning on your own documents.

### 14. Is prompt engineering dead, or is that just anxiety marketing?

It is not dead; it was absorbed. Prompt engineering remains a subset of context engineering: writing a good single-turn instruction is always useful, but it is not enough for multi-turn, multi-tool, long sessions.

The "dead" narrative is mostly conflict marketing for a new term. Do not pick a side; fix whichever layer your failures point to.

### 15. Why is context engineering engineering rather than a rebrand?

Because it has real-world failure modes to fight. LLM failures resemble physical engineering more than software engineering: tolerances, uncertainty, and materials whose strength is not fully known.

You can call it engineering when you can state your current failure rate, the before/after numbers of a change, and why it works. Until then, you are still casting spells.

### 16. How did one tweet make context engineering explode?

The path was short: Tobi Lütke said he preferred the term, Karpathy amplified it and listed task description, examples, RAG, tools, state, history and compaction, then Hacker News and Simon Willison gave it a sticky public definition.

The term is a container; the real cargo is that seven-item list, which maps onto the six chapters here.

## 2. What Deserves to Enter the Window

### 17. Why is "the smallest set of high-signal tokens" the only universal principle?

Other techniques have boundaries: retrieval fits knowledge outside the window, memory fits cross-session work, compaction fits sessions that are too long. Only "small and high-signal" holds everywhere.

Both qualifiers matter: high-signal means every token contributes to reasoning; smallest means contribution alone is not enough — it must be worth the space. A 200K window full of 190K irrelevant tokens loses to 20K of relevant ones.

### 18. Why does retrieving before answering beat stuffing everything in?

Stuffing encourages laziness: once the pile is in the window, the model stops hunting. Just-in-time retrieval keeps only lightweight identifiers — paths, queries, links — and reads the content when needed.

The practical pattern is hybrid: preload stable static knowledge, and let the agent fetch dynamic details on demand.

### 19. Why is RAG not dead — only lazy RAG is?

What died is the shallow implementation: random chunks, vector top-5, stuff into the prompt, pray. The core of retrieval — giving the right information at the right time — is still needed.

Long context did not end it. Enterprise knowledge is scattered, stale, permissioned, versioned and contradictory; a bigger window only gives you more places to put things, not an answer to what belongs there. Fix chunking, keep BM25, add rerank, build an eval set.

### 20. How detailed should a system prompt be?

The scale is "right altitude": too low and brittle hard-coded logic breaks on edge cases; too high and the model gets no concrete signal and guesses. The sweet spot is specific enough to guide behavior, abstract enough to leave room for heuristics.

A workable structure is Identity, Instructions, Examples, Context. Start with the smallest prompt, then add one rule per observed failure.

### 21. How should few-shot examples be given so they are not wasted?

Start with 3–5, chosen to be relevant, diverse and representative of standard cases, wrapped in `<example>` tags and separated from instructions. Examples are behavioral anchors, not documentation.

Examples are stable content: put them in the cached prefix and marginal cost drops sharply. Scatter them mid-prompt and change them every turn, and you pay full price every time.

### 22. In what order should multiple documents be fed into the window?

Long documents at the top, the question at the end. In complex multi-document tasks, moving the query later can improve quality by up to about 30% — an upper bound, not a guarantee.

Wrap each document in `<document>` with source metadata; for long-document tasks, have the model quote relevant passages first, then answer from those quotes.

### 23. What should stay in the window and what should go to files?

What this turn's reasoning needs stays; "might be useful later" goes to disk. Files are the persistence layer, the window is the workbench.

Write research notes, plans and progress to files; before ending a session, put key decisions into project files so the next session can resume from them.

### 24. How do I choose among the many memory systems?

There is no leaderboard, only scenario fit. Temporal knowledge graphs fit facts that change and need time-travel; OS-style tiering fits long-running stateful agents; SQL profiles are cheap and auditable; verbatim storage plus metadata filtering often matches or beats extraction.

A clear 2026 shift is anti-extraction: not every memory write deserves a model call.

### 25. When is installing a memory system a waste of money?

Three signals: the task never crosses sessions; what you need fits on one page; and the built-in project rules and auto memory are not even used yet.

Lightweight options often suffice, such as a NOTES.md the agent maintains, or one line in project rules telling it to reread the plan after compaction.

### 26. Why are CLAUDE.md and auto memory separate channels?

The boundary is authorship: CLAUDE.md is what you write for the model; auto memory is what the model writes for itself. The former holds reviewed instructions and rules; the latter holds lessons and preferences learned from corrections.

Separating them keeps both auditable: your rules cannot be silently rewritten, and the model's guesses cannot masquerade as your decisions.

### 27. How should tool definitions be written so they do not blow up the window?

Tool definitions occupy the window every turn and do not disappear when history is compacted. First merge overlapping tools and keep intermediate outputs out of the window.

Then add response formats, pagination, scoping, filtering and truncation. Never let a single tool response dump unbounded output into the window.

### 28. MCP tools overflow the window — how do I move them out of the main conversation?

Three paths: give a subagent its own tool allowlist so dirty work stays in its window; turn tool definitions into files loaded on demand; and consolidate before relocating.

The point is not "use fewer MCP servers" but "do not keep dozens of tool definitions resident in the main conversation." Many teams lack consolidation, not tools.

### 29. Search returns a pile of near-misses — how do I fix "on-topic but not answering"?

These are distractors: topically related but not answering the question. They are not neutral noise; they actively interfere, and the harm grows with input length.

Fix in three steps: check whether chunking split the answer apart; add hybrid retrieval and keep BM25; add rerank to narrow top-30 down to the top-5 that actually answer.

### 30. How do I set a window budget so everything enters by allowance?

Use four tiers: fixed (system constraints and current goal), trimmable (retrieved background and old tool results), collapsible (early history), and staged (tools, schemas and examples needed only for this phase).

Run one assembly pass each turn: load constraints, extract goal, retrieve evidence, recall memory, choose tools, compress history, rank by relevance, truncate to the token budget.

### 31. With the right context, can an ordinary model really win?

The right context is what lets an ordinary model compete, but it does not guarantee a win. Context solves "knowing"; it does not solve "verifying."

With complete order, warranty, ticket and tool context, a mid-tier model can indeed produce a replacement plan. But polished answers with fundamental errors still occur, so an evaluation and verification layer is mandatory.

### 32. Why does anyone saying "RAG is dead" reveal themselves?

Because the claim usually assumes enterprise knowledge is one clean document that fits in the window. People who have run production know knowledge is scattered, stale, permissioned, versioned and contradictory; the fix is selection, not capacity.

Bad RAG is worse than no RAG because it creates an illusion of grounding. What should die is the shallow implementation, not retrieval.

### 33. A whole library or 2,000 precise tokens — which is better?

The part of the window actually participating in the current inference is the working set. Whether the model has 200K or 1M, the working set fills with stale tool results at the same rate; a bigger window only moves the wall farther away.

Keep the library outside the window and put only the current task's slice inside. The test is still: remove this token and does this turn's reasoning suffer?

### 34. Why is wrong context scarier than no context?

Because wrong information beats missing information, and missing beats noise. A model can write fluent, confident prose from bad context; fluency and factual grounding are different mechanisms.

The worse failure is pseudo-completion: a fluent, on-topic, polite answer that quietly ignores a constraint you set ten turns ago. The last assembly step must always ask what a wrong placement would cost.

## 3. How Long Sessions Avoid a Bad Ending

### 35. When does compaction trigger, and who decides?

Claude Code compacts at the model context limit by default — for Sonnet 5's 1M window, around 967K tokens. You can move it earlier, between 100K and 1M, with `/autocompact` or an environment variable.

The API path is separate: server-side compaction uses a beta parameter, defaults to about 150K tokens and can be set as low as 50K. Do not mix the two sets of numbers.

### 36. Why is compaction inherently lossy, and why does it drop what matters most?

Summarizers keep the main idea and discard the rest. In one experiment, all 3/3 main task facts survived while 0/3 obscure appendix numbers vanished. A rule like "must call the live API, never read the cache" looks like chatter to a summarizer.

The discipline is simple: anything you cannot afford to lose must not wait in the conversation for summarization. Put it in a project file or name it explicitly in the compaction instruction.

### 37. Why does more compaction make a session sicker?

Each pass sends the whole conversation through a lossy pipeline; details in the previous summary are lost again. Loss multiplies rather than adds, and a lower-quality window produces a worse next summary.

In testing, a compaction preset scored 38% on memory probes versus 92% for doing nothing. Compaction is first aid, not a cure; if two rounds still leave the session confused, restart.

### 38. When is "do nothing" actually better than compaction?

When your cache price is low and the session is still manageable, keeping the full history can be cheaper than any rewrite, because rewriting the prefix invalidates the cache discount.

This is not universal: raise the cache price or lengthen the session and the conclusion flips. Check your own cache price and turn count before deciding.

### 39. How do I keep a long session from reaching catastrophic compaction?

Do not wait for 95% usage. The fuller the window, the more cramped the summarization call, the shorter and more broken the summary — and the model may develop "context anxiety" near the limit.

Practical lines cluster around 40–75% usage: compact early, compact with focus, or use `/autocompact 500k` to move the automatic line lower.

### 40. /compact, /clear, or a new window — which one?

Use `/compact` for continuity, `/clear` for a clean restart, and "handoff file + new window" for switching tasks. A session polluted by wrong assumptions is cheaper to clear than to rescue.

The red line: `/clear` permanently deletes history. Before pressing it, make sure everything worth keeping has left the window.

### 41. How do I write a targeted compaction instruction that keeps what I need?

After `/compact`, say in plain language what to keep and what to drop, naming specific nouns. "Keep the 401 error fix steps and conclusion" beats "keep the error-fixing process."

Do not make the instruction too thin: format conventions, key constraints and next steps all need naming. Automatic compaction guesses at general importance; you cannot afford to guess.

### 42. After compaction the plan's name remains but its content is gone — how do I prevent that?

A common wound: the plan filename stays in context, its content does not, and the model never thinks to read it. Metadata present, body lost — the classic shape of a compaction injury.

Three defenses: put critical constraints in the project-root CLAUDE.md; make the first post-compaction instruction reread the plan; or use a SessionStart hook to inject the content automatically.

### 43. How should a session handoff document be written for seamless continuation?

Five sections, none empty: session intent, changed files, key decisions, active goals, next step. A structured template acts like a required checklist, leaving much less room for silent loss than free-form narrative.

The only acceptance test: someone who was not in the session — including the next model instance — can start work from it without asking for background.

### 44. Can compaction, clearing and memory run together?

Yes; they divide labor like an operating system. Clearing handles old tool results inside the window, compaction handles the whole window, and memory handles cross-session state. Each treats a different kind of growth.

Add the memory tool to the clearing exclusion list, or freshly written memories may be wiped. Space their trigger lines apart so they do not all fire at once.

### 45. Tool output floods the window — how do I cap it without breaking the cache?

Distinguish capping from summarizing. A cap shortens the prefix without changing bytes, so the cache still hits; a summary rewrites the prefix, invalidates the cache, and makes you repay full price for the tokens you saved.

So shrink context, do not rewrite it. When clearing old tool results, clear enough at once for the cache rebuild to be worth it.

### 46. The session is slow and expensive — how do I check whether the context is rotten?

Check the bill first. `/context` shows what is in the window, `/usage` shows where money and limits go, `/cost` shows the session total.

If the numbers look normal but behavior starts looping, contradicting itself or ignoring instructions, the context is rotten. Use question 48 to choose rescue versus restart.

### 47. Compaction is stuck on an error — what is the first self-rescue step?

Do not fight it. Press Ctrl+C, restart the process, `/resume` the session, then `/compact`. The sequence works because it discards the client's growing bad state.

If a newer version still fails, open a new issue with the version number. The root cause is usually that the compaction request itself can no longer fit the whole session.

### 48. How do I decide whether to rescue a session or restart it?

Ask three questions: Is the error transient — does exit and re-enter fix it? Did you get a summary but `/context` did not drop — that is fake success, no rescue. Have you written pending decisions to a file — then restart costs nothing.

A session polluted by wrong assumptions is cheaper to restart than to rescue. Sessions are consumables; do not get attached.

### 49. How should external memory be implemented — SQLite files or a vector database?

Most teams do not need a vector database. Start with the built-in memory tool: the model calls view, create, replace, insert, delete and rename against a file backend you control, which is readable, diffable and versionable.

If you truly have massive cross-session history, add SQLite plus vector recall. Treat the window as memory and files as disk, paging in only what you need.

### 50. With concurrent agents, how do I isolate context so they do not pollute each other?

Put work inside subagent windows: independent context, independent system prompt, independent tool allowlist. Keep large file reads in the subagent and return only conclusions to the main window.

Isolating windows is not enough; isolate task descriptions too. Every subagent needs the goal, output format, available tools and task boundary, or it will duplicate work or go the wrong way.

### 51. A compaction bug took eight months to fix — what happened?

The error was a loop: the prompt said "context low, run /compact," but compaction replied "conversation too long." Users self-rescued by exiting, re-entering, resuming and compacting again. The official fix was announced more than once, regressed, and only v2.1.85 truly handled oversized compaction requests.

The lesson: the first crime scene is the issue tracker, self-rescue precedes fixes, and "fixed" must be anchored to a version number, not a changelog line.

### 52. Why is fake compaction success worse than a crash?

A hard failure shows an error, so you know to turn back. Fake success returns a "minimal handover summary" with no error while the window never shrinks, and the session stays stuck at the limit.

The only defense is to inspect the goods: after compaction, check `/context`. If the number did not drop, treat it as fake success and restart from a written handoff.

### 53. How did one compaction mistake make real accounts wrong by 12x?

The rule was written down: positions must come from the live API, never the cache. After compaction the model forgot it, took a shortcut through a three-day-old cache file, and reported BTC holdings off by 12x.

The point is not the 12x but that "the file exists" does not mean "the rule is in the window." Put money and data constraints in the project-root file, and make the model restate them after compaction.

### 54. What external tools grew around sessions that compaction cannot save?

Three patterns: clean before compacting, cutting duplicate reads and huge tool outputs; intercept at 65% usage and force a structured handoff into a new window; and move context into a SQLite-plus-vector proxy layer.

None are certified, but three ideas are free to borrow: a usage warning line, a structured handoff file, and switching windows instead of gambling on compaction.

## 4. How to Write Instructions That Are Not Ignored

### 55. How many lines should CLAUDE.md have, and what happens if it is longer?

Keep a single file under 200 lines. Going over does not error, but the file consumes more context and compliance drops; above 4 MiB, Claude Code skips it entirely.

Splitting into `@import` does not help — imported files still enter the window in full. Move scoped rules into `.claude/rules/` with a `paths` header, or delete what the model can infer from code.

### 56. Why are rules written in CLAUDE.md often ignored?

Two common causes: CLAUDE.md is injected as a user message after the system prompt, not inside it, so strict compliance is not guaranteed; and conflicting old and new rules let the model pick one arbitrarily.

Run `/context` to confirm the file appears under Memory files, then turn vague rules into verifiable actions. Rules that must fire at fixed moments belong in hooks or permissions, not prose.

### 57. CLAUDE.md, rules, AGENTS.md — which one wins?

There is no automatic hard hierarchy. They are all context: root CLAUDE.md has the broadest influence, rules with `paths` load only for matching files, and AGENTS.md is a cross-tool convention whose use depends on the host.

On conflict, more specific scope and a more explicit instruction usually win, but conflict itself lowers compliance. Keep one source of truth and put hard constraints in hooks or permissions.

### 58. Where should key instructions go in a long context so they are not diluted?

Long documents at the top, the question at the end. Attention is highest at the start and end and weakest in the middle; the more material, the more an instruction in the middle is diluted.

Partition multi-document input with tags and sources, and have the model quote before answering. Also ration the material: beyond about twenty documents, additional input yields little.

### 59. Which words in a system prompt are waste, and which are gold?

Two extremes waste space: dozens of lines of if-else that break on unseen edge cases, and a vague "you are a helpful assistant" that gives the model nothing to decide with.

Gold is pitfall records, design rationale, and any convention that differs from default behavior. Directory structures and dependency lists the model can infer from code are noise.

### 60. Why subtract from old prompts after a model upgrade?

Newer models follow instructions better, so old workarounds turn from insurance into noise: prefill, threatening capitalization, over-detailed steps and repeated self-checks all consume attention and can make the model act when it should ask.

Delete rather than rewrite: remove ineffective threats and self-checks, keep domain constraints, acceptance criteria and genuinely useful examples.

### 61. Prefill is banned — what do I use for format control now?

Use Structured Outputs to constrain the schema, or define a tool with enum fields so "output" becomes a tool call. To remove preambles, simply say so in the system prompt.

For continuing a truncated answer, put the truncated text in the user message and state where it stopped. To avoid refusals, make the request clear instead of relying on a prefilled opening.

### 62. Where should the cache breakpoint go to save money every turn?

Put it on the last block that stays identical across requests. If any block before it changes, the prefix hash changes and the next turn recomputes everything.

The classic anti-pattern is a timestamp: put a second-precision time at the top of the system prompt and it changes every second, so you always pay full price.

### 63. Why does changing one tool definition invalidate the whole cache?

Caches are judged by layered prefixes: tools → system → messages. A change invalidates that layer and every layer after it. Tool definitions are first, so one changed word blows up all three.

Treat tool definitions as build artifacts: freeze them during a session. If you must change them, accept "change once, blow up once, refill once," preferably between sessions.

### 64. How should multi-turn prompts be arranged to maximize cache benefit?

Put static content first in tools → system → messages order. Put per-request values such as timestamps, random IDs and today's date at the end of the message stream.

Keep history append-only: do not edit old messages, and add mid-conversation instructions as a system message rather than changing the top-level system field. Check the cache fields in usage each turn.

### 65. How do I choose examples that earn back their token cost?

Three criteria: relevant to real use cases, diverse enough to cover boundaries without teaching false patterns, and structured with `<example>` tags separated from instructions.

If unsure, ask the model to score candidates for relevance and diversity, then finalize by hand. Examples are stable content, so put them in the cached prefix.

### 66. How do I build a multi-window workflow, and why is it better than forcing one window?

Split the work: the first window builds scaffolding, tests and init scripts; later windows follow the checklist. When context clears, prefer a fresh window over forcing compaction.

The mature version is three stages: research produces a document, plan produces an implementation plan, and implement follows the plan. Humans review only the two documents at the gates.

### 67. Why is "show the prompt to a colleague" the best test?

Because when you write and read your own prompt, your brain fills in missing context. A colleague has no such cache; wherever they get stuck is where the prompt is missing something.

Before handing it over, check three things: are output format and constraints concrete; are dependent steps numbered; and when asking for extra behavior, is the reason stated?

### 68. Why does telling a model what not to do usually fail?

A prohibition says where not to go but not where to go, so the model guesses around the forbidden zone. For stable formatting, state the positive target: instead of "no markdown," say "answer in flowing prose paragraphs."

Another trick is style matching: a prompt full of markdown lists tends to produce markdown output. Write the prompt in the style you want back.

### 69. Why can a carefully tuned context lose to no tuning at all?

Because several "obviously reasonable" middleware layers can cancel each other out. In one test, a three-layer cleanup-and-summary preset scored 58% on memory recall, then 38% on retest, at twice the cost of doing nothing.

Do not rely on vibes; run evals. Use the same tasks and data, compare your preset against full history, score only the planted probes, and then look at the cost curve.

### 70. Why does a one-sentence instruction often beat a long rulebook?

The thicker the rules, the thinner the attention each rule receives. If one sentence can do the job, do not write a paragraph; specific and concise are not opposites — verbosity is the enemy.

The skeleton: role, concrete action, deliverable, verifiable criterion, one-line reason. Complex multi-step workflows can stay long, but every line must do work.

### 71. Is "context is the model's memory" correct?

Not quite. The full original metaphor is working memory. Context is immediate, limited and lost when power goes out; memory is external storage, compiled into context only at request time.

Claude Code's dual channels and Letta's memory blocks both show that memory and context are two layers and should not be conflated.

### 72. Why did Tobi put "can you load context" into performance reviews?

Because loading context is the step most often skipped at work: try twice, see no result, fall back to the old method, and never ask whether the prompt was wrong, the context insufficient, or the second attempt never happened.

Putting AI usage and context skill into performance and peer review makes it an organizational requirement rather than a personal craft. But this is a management narrative, not measured data — cite it accordingly.

## 5. Where Context Burns Money

### 73. Why does caching change the price but not the window occupancy?

Caching is like a CPU cache line: it speeds up retrieval but does not save a byte of memory. The cached prefix still occupies the window, attention is still divided, and compaction still triggers near the limit.

Keep two ledgers: occupancy in `/context`, spending in `/usage`. The discount exists on the bill, not in the window.

### 74. Why does every turn in a multi-turn chat repay the whole history?

Models have no memory, so every request resends the full session. You send two words — "continue" — and the turn is still billed on the entire history.

By the 50th tool call, history alone can exceed 150K tokens; 50 turns amount to paying for 1,275 single-turn inputs. Caching lowers the unit price but cannot change that compounding shape.

### 75. How do I estimate my monthly context spend?

Three anchors: enterprise deployments average about $13 per active day, $150–250 per month; at Sonnet's $3 per million tokens, a 150K context costs about $0.45 per turn and 30K about $0.09; filling a 1M window once ranges from $0.14 to $10.

Monthly bill ≈ active turns per day × input tokens per turn × input price × cache discount. Healthy hit rates price reads at about one tenth; if the rate is unstable, keep a 30–50% margin.

### 76. How do I calculate and control the multi-agent context bill?

Chat is 1x, a single agent about 4x, multi-agent about 15x; agent teams in plan mode run about 7x. Every teammate carries its own window and burns its own tokens.

Control levers: tier effort by task complexity; cap thinking tokens; keep teams small and shut teammates down immediately when done.

### 77. Where do I check KV-cache hit rate, and how do I improve it?

Claude Code's stats line reports request count, cache share of input, misses and cache warmth. On the API, read `cache_read_input_tokens`, `cache_creation_input_tokens` and `input_tokens` from usage.

Hit rate is cache reads divided by the sum of all three. Improve it by stabilizing the prefix — freeze tool definitions, move timestamps to the end, keep history append-only — not by cutting tokens.

### 78. When should I give the cache a one-hour TTL?

If the default five minutes is enough, do not upgrade. A one-hour TTL starts paying off when the gap is over five minutes but the next request is reliably within an hour.

Pricing: five-minute cache writes cost 1.25x input, one-hour writes 2x, and reads 0.1x. When mixing, place the one-hour segment before the five-minute segment.

### 79. How do I pre-warm the cache at startup to improve first response?

Send a request with `max_tokens: 0`, so the API reads the prompt and writes the cache at the breakpoint, then returns immediately without generating output.

Put the breakpoint on the last block shared with real requests; match thinking and effort settings; use an explicit breakpoint, not automatic caching. Pre-warming may itself incur a cache-write charge.

### 80. When is a million-token window affordable, and when is it a trap?

One-off large-document feeding is worth it: fill once, ask, leave, and pay only for that fill. But first-token latency is visible — about 22 seconds at 100K tokens and 76 seconds beyond 800K.

Do not make 1M the default for frequent sessions: carrying a full history every turn compounds latency and cost, and once occupancy passes half, you are choosing between retrieval and compaction.

### 81. How does code execution turn a 150K-token job into 2K?

Tool definitions become files in a filesystem; the agent lists the directory and reads only what it needs. Data flows script-to-script inside a sandbox, so intermediate results never enter the model.

Two savings: tool manuals are no longer fully loaded, and intermediate outputs no longer pass through the model. The cost is sandbox isolation, resource limits and monitoring.

### 82. Why can the cheapest run be the one sending the most tokens?

Because of caching. Sending nearly 300K tokens per turn with a 97% hit rate can cost $0.0063 per turn; aggressive trimming looks smaller but breaks the cache discount and costs more.

This depends on a low cache price and a specific workload — not a universal law. When the cache price rises, the conclusion flips. The robust saving is capping, not rewriting.

### 83. Why does summarizing history cost 50% more than not summarizing?

The tokens saved do not cover the cache discount destroyed. Full history costs $0.11 per turn versus $0.24 for the summary preset, while memory probes score 92% versus 38% — more expensive and more forgetful.

Caching requires resending the prior context unchanged. Summarizing rewrites the prefix, so everything previously discounted is repaid at full price.

### 84. Filling a million-token window: what is the spread between cheapest and priciest?

As of June 2026, 71x: about $0.14 at the low end and $10 at the high end. The gap comes mainly from model price structure, not capability tier.

This table prices one fill, not one month. Monthly cost still multiplies by hit rate and turn count.

### 85. Why does pressing compact burn thousands of tokens and ten-plus seconds?

Because compaction is itself a full inference request: it reads the whole session and generates a summary. A 150K window produces 3,000–5,000 output tokens and 5–15 seconds of wall-clock delay.

Output is billed at the output price, often several times the input price, and compaction rewrites the prefix, forcing a full cache rebuild. If continuity is unnecessary, `/clear` is cheaper.

### 86. Why does twice the work cost seven times more, and is it worth it?

Multi-agent is buying compute for success rate; token usage itself explains about 80% of outcome variance. Claude Code agent teams in plan mode cost about 7x tokens.

Judge by two questions: can the output be independently accepted, and must parallel branches share decisions? If they must share, a single thread with good context is safer; only independently acceptable, truly parallel work earns the 15x.

### 87. Why did my window quietly shrink after a model upgrade?

Because the tokenizer changed. From Opus 4.7 onward, the same text can count up to 35% more tokens; the window size did not move, but the counter did.

Run `/context` on upgrade day, count the same history on old and new models, and restate your budget and rate limits using the new numbers.

### 88. To save money, should I cut context first or switch models?

In order: check cache hit rate and fix layout/breakpoints first, which is free; if hit rate is healthy and cache price is below about $0.55 per million tokens, cut context first; if unit price is simply too high, switch models; if the model cannot change, add external memory or code execution.

Change one variable at a time and measure after each.

## 6. How to Know If Context Is Good

### 89. Why is there still no accepted benchmark for context quality?

Because "good" has not been defined for this craft. Failures are silent: compaction drops details whose importance only appears later, so nothing looks wrong at the moment.

Probes can measure retention but not utilization, and existing benchmarks cannot capture the chained degradation of dozens of lossy compactions in production. With no public answer, you must be your own standard.

### 90. How do I plant probes to find when an agent starts forgetting?

Five steps: plant a checkable fact in turn zero; push the conversation past the compaction point with real questions; ask a question that requires that fact; discard the run if compaction never triggered; and have a judge score blind to the configuration.

Plant specifics like "300 milliseconds," not vague preferences like "the user likes brevity." In testing, zero compactions scored perfectly; after five or six, only three of ten probes survived.

### 91. Which metrics reveal whether compaction is good or just looks good?

Compression ratio lies: three systems all landed at 98–99% compression while quality scores ranged from 3.35 to 3.70, with the most aggressive system last.

Watch six dimensions: accuracy, context awareness, footprint, completeness, continuity and instruction following. Footprint — remembering which files were read or changed — is the weakest and the best alarm.

### 92. How do I build context monitoring for my own workload?

Three pieces: record total context tokens each turn, summing uncached, cache-read and cache-write tokens rather than trusting `input_tokens` alone; log compaction and clearing events with thresholds and summary lengths; and keep a cache/cost statistics line.

With these, you can answer "which turn started getting dumb" and "where did the money go."

### 93. Twenty or thirty real trajectories — how do I start a minimal eval?

Start with 20–50 real tasks; early changes have large effects, so a few cases are enough to see them. The loop: collect trajectories, define verifiable scoring, store a baseline, change one variable, and keep a holdout set.

Do not write reference answers yourself; extract atomic points from real human handling so the judge can score reliably.

### 94. How do I score a context assembly quickly?

Ask four questions: is there a wrong version (correctness); are all prerequisites present (completeness); how much is noise (size); can someone continue mid-task (trajectory)?

Order matters more than the checklist: correctness dominates, wrong beats missing, missing beats noisy. Never cut correctness first just to save tokens.

### 95. Why do 97% say it matters but only 4% actually do it?

The gap is infrastructure, not agreement. 97% say context matters, but only 4% reach the maturity stage where knowledge compounds; only 42% say they can accurately measure production readiness.

Evaluation, monitoring and governance are where the 97% becomes 4%. Whoever builds that layer first captures the advantage.

### 96. Overall quality is 97 — why does it still silently forget?

Because overall quality measures whether the reply looks good: prose, relevance and format are all present, while the forgotten fact is not on the rubric. In testing, blind quality scores were 97–99% while memory probes were 58%.

Acceptance must score only the probes. Overall quality is a dashboard, not a gate. The question is: can the fact planted in turn zero still be retrieved in turn eleven?

### 97. Why is observability the biggest gap in context engineering?

Because vendors say context matters but rarely give you a window into the window. `/context` shows static occupancy but not the dynamic message area that matters most.

Worse, the instrumentation itself can lie: one issue reported `/context` showing 1,553.9% occupancy. The fix is to export traces to OpenTelemetry and make the agent emit hypotheses and evidence in structured form.

### 98. Is "fewer than 5% of teams have evals" credible?

The number is not credible, but the phenomenon probably is. It comes from one anonymous practitioner's account, with no sample size and no auditable method.

Use the three-step citation test: who said it, what corroborates it, and what is the scope. The industry report's 42% readiness-measurement figure points the same way. Treat it as testimony, not statistics.

### 99. I learned a pile of techniques — how do I know which one works for my scenario?

Techniques have no universal truth, only "did it raise your eval score." Do not tune by vibe; let the eval decide.

Build an eval set from past incidents and existing tests, run an eval matrix over candidate assemblies, change one variable at a time, and keep only what improves the score.

### 100. Will context engineering go out of style like prompt engineering?

Half of it will. Specific techniques have a shelf life: breakpoint placement, thresholds and which instructions to bold all depreciate with each model upgrade.

The other half does not: evaluation does not expire — the stronger the model, the scarcer good judgment about quality; and hard problems do not expire — models understand complex context well but still struggle to generate equally complex long outputs.
