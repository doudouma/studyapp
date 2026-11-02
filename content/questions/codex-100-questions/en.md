---
title: 100 Questions About Codex
summary: From fundamentals and first-run mechanics to pitfalls, advanced workflows, real-world scenarios, and the limits of the tool — 100 questions that build a complete picture of Codex.
tags: [Codex, AI Agent, Productivity, Topic Guide]
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
    value: Codex / AI Agents
  - key: Source
    value: The 100 Questions Series
  - key: Updated
    value: 2026-11-01
---

## Preface

This is a "100 questions" guide: a way to break a large subject into questions, then read it through one question at a time.

Codex is OpenAI's AI agent, and it works very differently from a chat assistant. This guide starts with what it is, moves through setup, pitfalls, advanced workflows and real-world scenarios, then ends with its limits and what to make of it.


> **How to read**
>
> You do not need to start at question 1. Skim the contents in the left menu, jump to what you need, then fill in the surrounding context.

> This is an edited translation: the contents keep all 100 questions; the body contains the answers that have been edited so far. Some passages are still being checked against the original OCR.

**Quick answers**

- Codex is an execution agent: it reads files, runs commands, checks results and iterates. It is not a faster chat window.
- Start with a dedicated project folder and request-approval permissions; do not open full access on day one.
- Use plan mode for any task that touches multiple files, then review the diff before accepting it.
- Commit before changes and stop looping tasks early. Those two habits prevent most lost work and wasted quota.
- Define the acceptance test before you start. That is the real dividing line between smooth and painful Codex use.



## 1. Fundamentals and positioning

### 1. What exactly is Codex?

Codex is OpenAI's AI agent for software work. Unlike a chat model that only suggests code, it can read files, edit them, run commands, check the result and iterate until the task is verifiably done.

### 2. What forms does Codex come in, and which should ordinary users choose?

Codex comes as a desktop app, a command-line interface, an IDE plugin and a cloud version. The desktop app is the friendliest: visual diffs, multiple projects and a built-in browser. Developers who live in a terminal may prefer the CLI; teams with GitHub repositories may use the cloud version. Start with the desktop app.

### 3. How is it different from asking ChatGPT for code?

ChatGPT explains the problem and pastes code; you still have to run and verify it. Codex turns the request into actions — read these files, change that function, install this dependency, run these tests — executes them and checks the result. That execution loop is the real difference.

### 4. Desktop versus command-line Codex?

The desktop app has a GUI, visual diffs, previews and a built-in browser. The CLI is lighter and faster and fits shell scripts, Git and automation, but it assumes terminal literacy. Use the desktop app for general work and the CLI for scripted workflows.

### 5. Can I use Codex without a code repository?

Yes. Codex works on a project folder, not a Git repository. Cloud Codex is most natural with GitHub, but the desktop app can open any local folder and work there.

### 6. Do I need a paid membership?

The free tier is only enough to try it; a couple of real tasks will exhaust it. ChatGPT Plus is the usual entry point. Heavy users may want Pro or extra credits. If budget is tight, Codex can also be connected to third-party models, with compatibility and support trade-offs.

### 7. Can Codex touch other files on my computer?

Only inside the sandbox you grant. With project-folder permission it can read and write that folder but not the rest of the disk. Full access is dangerous and should be reserved for cases where you understand the risk. "Computer use" is the feature that can cross that boundary.

### 8. Is it a chat tool or a programming tool?

It has a chat shell but behaves like a tool: it changes files, runs code, operates apps and delivers a verifiable result. Treat it as an execution layer you direct, not as a chatbot you chat with.

### 9. Why do some people love Codex and others hate it?

Mostly expectations. People who treat it like a faster ChatGPT expect instant perfect answers and get half-finished work. People who write clear tasks, break work down, watch the run and verify the diff get stable results. Model versions also fluctuate.

### 10. Is Codex better for greenfield projects or existing code?

Existing code is easier: the project provides anchors for structure, conventions and dependencies. Greenfield work forces Codex to guess architecture and style, so specify the stack, structure and acceptance criteria up front.

### 11. What do ordinary users most overestimate?

Autonomy. Codex looks autonomous, but it is guessing when the brief is vague. The more you leave unspecified, the more rounds it burns and the further the result drifts. Clear tasks and checkpoints matter more than raw model strength.

### 12. What work should not be given to Codex?

Work you cannot describe or verify, subjective judgement, and anything high-risk or irreversible: payments, bank accounts, production databases, deleting important files. It is also a poor fit when you cannot tell whether the output is correct.

### 13. Can non-programmers use Codex?

Yes — that is one of its main advantages over a CLI. You describe the outcome, Codex executes, and you inspect the result. You still need to write a clear brief, define acceptance criteria, and know when to stop it.

### 14. What should I settle before using Codex?

How you will know the job is done. If you can verify the result, Codex is easy to use: accept it or tell it what is wrong. If you cannot, you will either accept blindly or check every line. Define the acceptance test first.

### 15. Will Codex replace my manual work?

It replaces repetitive execution, not judgement. Deciding what to delegate, writing the brief, checking the result and choosing the next step remain yours. The more capable the agent, the more your judgement matters.

## 2. First run and core mechanics

### 16. Where should I start the first time I use Codex?

Install it, sign in, say hello and confirm it runs. Do not start with a large task. The first goal is simply to prove that the installation, login and runtime work.

### 17. Which login method should I use: ChatGPT account or API key?

Most people should use a ChatGPT account; usage follows the subscription and you do not have to manage API billing. An API key is for automation and third-party model gateways: it is metered, more transparent and easier to overspend on if a task goes off the rails.

### 18. What is a project, and why create one first?

A Codex project is a working folder you designate. Codex's reads and writes are confined to it, artifacts stay in one place, and the work is traceable. Chatting without a project is how you get missing files, scattered outputs and confusing command errors.

### 19. Which project folder should I choose, and what are the pitfalls?

Create a clean folder dedicated to Codex, then use subfolders per project. Prefer an English path without spaces. Avoid drive roots, the desktop, downloads, system folders and folders holding important personal files. Do not point Codex at a folder another editor is actively using.

### 20. How should I choose among the three sandbox permission levels?

Request approval, auto-review and full access. Start with request approval: Codex asks before running commands. Auto-review lets the system approve safe operations. Full access is for people who understand the risk; do not start there.

### 21. What is the difference between the reasoning levels?

Low, medium and high. Match the level to the task: low for wording and styling, medium for ordinary features and bugs, high for architecture, hard bugs and complex refactors. Turning everything to maximum wastes time and quota.

### 22. What is plan mode, and when should I use it?

In plan mode Codex proposes a plan — steps, files, risks — before touching anything. Use it for multi-file work, new features, refactors and complex bugs. Type `/plan`, or ask for a plan first, then approve execution.

### 23. What is the sidebar for, and why does it matter?

The sidebar is Codex's work area: diffs, generated files, search results, page previews, PDF previews and the built-in browser. The chat is where you give instructions; the sidebar is where the work is delivered. Watch it.

### 24. What is a diff, and why review it every time?

A diff shows what changed: green additions, red deletions. Review it after every task to confirm the change matches the request. You can also comment on a line to iterate on just that spot. Reviewing diffs is the minimum safety habit.

### 25. What is a thread, and how many can a project have?

A thread is one task conversation inside a project. A project can have many. Use separate threads for separate tasks so context stays focused, and return to an existing thread when continuing the same piece of work.

### 26. How can I tell how long a task will take?

There is no reliable estimate. Simple edits finish in seconds or minutes; multi-file work can take much longer. Watch the action log. If a task is taking far longer than expected, set a limit and inspect what it is doing.

### 27. What should I do if a task goes quiet?

Check the action log. Repeated similar operations, the same error, or no updates at all means it is stuck or looping. Stop it, ask for a summary of the failure, then restate the task or narrow its scope.

### 28. Where do I see the results when a task finishes?

The project folder is the source of truth: every file Codex changed or generated lands there. The sidebar shows diffs and previews, and the chat gives a summary. Check the folder and the diff, not just the summary.

### 29. How does the five-hour rolling window work?

Usage is calculated over a rolling five-hour window, not reset on the hour. Heavy tasks consume much more than light ones, and there is also a weekly cap. You cannot control exactly when the quota runs out, so plan large tasks around it.

### 30. How do I check how much quota I have left?

Open the usage area in Codex settings. Check before starting anything large. Codex does not reliably warn you in advance; the next request simply fails when the quota is gone.

### 31. Is there a big difference between Plus and Pro quotas?

Yes, but most people do not need Pro. Pro is much larger and much more expensive. Try Plus for a week or two and see whether you hit the cap often. Occasional overage is better handled with extra credits than a permanent upgrade.

### 32. Does a task stop immediately when the quota runs out?

Usually it finishes the current round, then the next request fails. A background task can keep consuming until you notice. Check the quota before long runs, split the work, and do not run several heavy tasks at once.

### 33. Can I use Codex on my phone?

The real Codex runs on your computer. The mobile app can start or continue cloud tasks, answer Codex's questions and let you approve the next step, but it cannot touch your local files. It is useful for supervising long tasks while you are away.

### 34. Does a task keep running after I close Codex?

It depends on the mode. Local tasks stop when you fully quit the app; minimizing to the tray or menu bar keeps them running. Cloud tasks continue on OpenAI's servers. To stop local work, quit from the tray or menu bar, not just the window.

### 35. Are Codex credits worth buying?

They are worth it if you only occasionally exceed your plan. If you buy credits every month, upgrade to Pro instead: it is cheaper than repeated top-ups and avoids the stop-start experience. Watch the "I paid, so I can splurge" effect.

## 3. Pitfalls and anti-patterns

### 36. Why does Codex suddenly start going in circles?

The agent retries variations of the same approach without realizing it is repeating itself. Stop it early: ask for a summary of the failure, then change the approach, narrow the task or take over. Do not let it loop and burn quota.

### 37. Why do I get half-finished work after thirty minutes?

Long contexts dilute attention, the definition of done may be unclear, and the model can declare victory early. Write the acceptance criteria into the task, split long runs into smaller pieces, and inspect the diff instead of trusting the summary.

### 38. I explained it clearly — why does Codex still miss instructions?

Attention is uneven across long instruction lists. Put critical items first and last, keep lists short, repeat the constraints that matter, and use a checklist. Then verify each item against the diff.

### 39. Why does Codex break good code while making a small change?

It may refactor, rename or delete things it thinks are unnecessary. Forbid deleting files it did not create, ask for the smallest possible change, and review every diff. Revert anything unrelated to the task.

### 40. Why does a simple request turn into a huge change?

Codex defaults to production-grade patterns: components, abstractions, new dependencies. Say "the simplest solution, no new dependencies, no new modules, nothing outside this request" and ask why each change is needed.

### 41. Are background tasks secretly burning my quota?

Yes, if they are still running. A minimized app or a cloud task keeps consuming. Stop the task or fully quit the app when you are not using it, and do not leave several heavy tasks running in parallel.

### 42. I closed the window — why is the quota still dropping?

Closing the window is not quitting. Codex minimizes to the system tray or menu bar and keeps running. Quit it explicitly from the tray or menu bar, especially when a long task is still active.

### 43. Why did a task disappear without a result?

Check whether it failed, was stopped, or is still running in the background. Look at the action log and the project folder. Do not assume a missing result means success.

### 44. Why does the same task produce a completely different result?

Generation is stochastic, and the context or model version may differ. Save the output and commit it; do not expect an exact replay. If you need repeatability, capture the result and the brief that produced it.

### 45. Why doesn't Codex's solution match my project?

It lacks context. Use project mode, let it read the repository, point it at the relevant files and conventions, and run the result in your environment. Code that looks right outside your project may not run inside it.

### 46. Codex says it fixed everything — why does it still fail?

It may not have actually run anything. Make it run in your project, paste real errors back into the thread, and verify the result yourself. Never accept "it should work" as done.

### 47. What signals mean I should stop a task?

Loops, a rapidly growing number of changed files, mass deletions, unexplained new dependencies or config changes, no progress, or a summary that does not match the diff. Stop and ask for an explanation.

### 48. Should I retry a failed task or change the brief?

Retry transient failures such as network errors. If the same task fails repeatedly, change the task: split it, clarify it, or check whether it exceeds what the agent can do. Blind retries mostly waste quota.

### 49. Why does splitting a large task sometimes make it worse?

Wrong boundaries create hidden coupling, and separate runs lose the shared context. Split by coupling, give each subtask the overall picture, plan the split with Codex first, and verify after each piece.

### 50. How do I stop one task from eating the whole week's quota?

Estimate the cost, set a time limit, watch the log, split large work, use low reasoning for small tasks, plan before executing, monitor the quota, and quit background tasks. Do not hand over a task and walk away.

### 51. Who fails most often with Codex?

People who treat it as a black box, skip version control, never review diffs, write vague briefs and let it run unattended. Commit before changes, review the result, and use worktree mode for larger edits.

## 4. Advanced: Skills, MCP, plugins, automation, computer use

### 52. What is the difference between a Skill, MCP and a plugin?

A Skill is a reusable workflow written as a Markdown file. A plugin adds a capability or connector to Codex. MCP connects Codex to external tools and data. Learn the built-in features and plugins first, then Skills for repeatable workflows, then MCP when you need outside data.

### 53. How do I find and install a useful plugin?

Open the plugin page and install only what you need. Start from the task, not from the catalogue. Once installed, call a plugin with `@` and pick it from the list.

### 54. How do I create my own Skill?

Run the workflow once until you are happy with the result, then ask Codex to turn it into a Skill. Alternatively, use skill-creator and describe the steps in natural language. A Skill is just a Markdown file: when to use it, the goal, the steps and the output.

### 55. How should I write a Skill so it triggers automatically?

The description decides whether Codex matches the task to the Skill. Put the common use case and trigger words first, be specific about inputs and outputs, and avoid vague labels like "data analysis". Explicit `$skill-name` invocation remains the fallback.

### 56. When do I actually need MCP?

When Codex needs external data or tools: GitHub, Notion, Feishu, a database, a SaaS API. For local files, simple pages, slides or PDFs, the built-in features and plugins are enough. MCP is an adapter, not a badge of sophistication.

### 57. Should I write an AGENTS.md?

Yes. It tells Codex who you are, what the project is, which conventions to follow and what it must not do. Let Codex draft it, then refine it. Keep it short, current and committed to Git.

### 58. How do task intervention and task queuing work?

New instructions normally queue behind the current task. Use steering when you want Codex to change direction immediately, and use the queue when the new instruction can wait. Know which one you are using before you send it.

### 59. What is automation good for?

Recurring summaries, periodic checks and continuing a long-running thread. Automations do not inherit the active chat's model or reasoning settings, so set them explicitly; otherwise a seven-minute task can turn into forty minutes.

### 60. What is computer use, and is it safe?

Computer use lets Codex see the screen and operate graphical apps, even ones without an API. It is powerful and risky. Require your confirmation for anything that sends, submits, deletes or pays, and keep the scope as narrow as possible.

### 61. Which of the three browser modes should I use?

Use the in-app browser for localhost, layout checks and isolated previews. Use the Chrome extension when the task needs your logged-in session. Use Playwright when you need programmatic, repeatable browser control. Confirm before any risky action.

### 62. When should I use worktree mode?

Use a worktree for larger changes, experiments and parallel work. It isolates the task from your main checkout and makes it easier to discard or merge the result.

### 63. How do I choose between multiple previews or solutions?

Compare them against the same acceptance criteria and pick the smallest change with the lowest risk. Do not accept a bigger diff just because it looks more impressive.

### 64. What is the difference between goal mode and a normal task?

In goal mode you give Codex a verifiable success criterion and it keeps iterating until the criterion is met. It fits migrations, bug fixes, performance work and refactors. It does not fit vague requests, subjective work or tasks without a clear finish line.

### 65. How do durable threads and pinning work?

A durable thread keeps context across sessions, so you do not have to re-explain the project every time. Use it for ongoing work and pin the threads you return to most often.

### 66. What is the most reliable way to set up shared memory?

Keep it small, structured and current. Store project facts, conventions, decisions and known pitfalls. Review it regularly, and do not let stale notes become permanent instructions.

### 67. Why is voice input worth using?

Speaking is often faster than typing a long brief, especially for brainstorming and describing intent. Check the transcription before sending, and keep important constraints written down.

### 68. What belongs in an advanced AGENTS.md?

Commands, architecture, conventions, forbidden actions, acceptance checks, known pitfalls and the files to read first. Keep it concise; a long document that nobody maintains is worse than a short one that is accurate.

### 69. How do I make Codex explain its approach before editing?

Ask for a plan or a diff-first proposal, use plan mode, and require a short design note for risky changes. Approve the approach before letting it touch files.

### 70. How do I make Codex remember my project's conventions?

Put them in AGENTS.md, point to example files, and ask Codex to follow existing patterns rather than invent new ones. Update the document whenever a convention changes.

### 71. Which small habits most improve stability?

Plan first, review every diff, commit before changes, keep one task per thread, write acceptance criteria, stop early when something drifts, and keep AGENTS.md current. None of these is exotic; they compound.

## 5. Real-world scenarios

### 72. What should my first practice task be?

Pick something small, non-critical and verifiable: a simple page, a script, a small analysis. The goal is to practice the collaboration loop, not to test the model's limits.

### 73. How should I brief Codex for a web page?

Give the background, the goal, the constraints and the acceptance criteria. Generate a visual mockup first, then implement. Use the in-app browser to check the result, and test the mobile layout.

### 74. How do I use Codex for presentations?

Install the Presentations plugin, provide the source material, and specify the audience, style, sections and page count. Treat the first output as an 80% draft. If you make slides often, turn your style into a Skill.

### 75. Is Codex reliable for video?

Yes, with the right plugins, such as HyperFrames or Remotion. Video is a pipeline — script, assets, voice, subtitles, editing — not a single prompt. Build the workflow once and save it as a Skill.

### 76. How do I use Codex with PDFs and documents?

This is a strong fit: clear input, verifiable output. Provide the files, specify the structure and output format, and check the result. Use document tooling or MCP when the source lives in an external service.

### 77. How do I use Codex for data analysis and reconciliation?

Say where the data lives, which fields must match, what counts as an anomaly, and what should happen when one is found. Use MCP or a CLI for external sources, then turn the rules into a Skill and schedule it.

### 78. Can Codex help me clean up my computer?

It is good at finding candidates and bad at deciding what is safe to delete. Use project-level permissions, make it list the files first, back up important data, and confirm every deletion yourself.

### 79. How do I use Codex for writing and content?

It is strong at research, outlines, drafts, covers and repurposing. Give it a style guide, audience and source material. Expect a draft to edit, not a final piece. Automate topic monitoring when you write regularly.

### 80. How should I use Codex for a side project?

Use it for scaffolding, repetitive work, small features and tests. Keep architecture, product decisions and final review yourself. Commit often, and do not hand over the whole product at once.

### 81. What is the most effective way to hand a bug to Codex?

Provide reproduction steps, expected behavior, actual behavior, logs and the files involved. Ask for the smallest fix, then verify it. If it cannot reproduce the bug, fix the reproduction information first.

### 82. How should I split a new feature for Codex?

Split by user-visible behavior, define the interfaces and acceptance tests, plan first, and review each slice. Avoid one giant task that changes the data model, the UI and the tests all at once.

### 83. Is it safe to let Codex refactor an old project?

It can work, but it is risky. Require tests, make one refactor per task, review the diff, and commit before each step. Never let it refactor and add features in the same run.

### 84. How do I hand test writing to Codex?

Describe the behavior and edge cases, ask for tests first, and run them. Do not let it rewrite tests just to make them pass; the tests are the specification.

### 85. Is Codex good at code review?

It is useful for a consistent first pass. Ask for a prioritized list of problems, then decide what to fix. Never let it merge automatically; the decision stays with you.

### 86. Can a team use Codex together?

Yes, but each person uses their own account and their own working copy. Share AGENTS.md and Skills through Git, and be careful with sensitive data. Do not treat one folder as a shared multi-user workspace.

### 87. How do I set up a semi-automated long project?

Use a task list, a supervisor and frequent commits. Define checkpoints, budget the quota, and keep a human in the loop. "One prompt and then sleep" is not a workflow; it is a gamble.

## 6. Limits, alternatives and reflection

### 88. When should I stop using Codex?

When the task is a simple question, a subjective judgement, a vague idea, a high-risk irreversible action, or something you cannot verify. A tool is useful only within its boundary.

### 89. Are there alternatives to Plus?

Yes. You can connect Codex to third-party models through a gateway, which is cheaper but unofficial, or use other agents. Choose by budget, compatibility and how much risk you accept.

### 90. Codex or Claude Code?

They occupy a similar space. Claude Code is terminal-first and strong on complex codebases; Codex is friendlier, has a GUI, and handles non-code tasks. Many heavy users keep both and switch by task.

### 91. I already use Cursor — do I still need Codex?

They are complementary. Use Cursor for in-editor assistance and Codex for delegated tasks and delivery. If your work includes non-code tasks, Codex adds range that Cursor does not cover.

### 92. Will Codex quotas keep growing?

The trend is looser, but agent work is expensive and cannot be unlimited. Competition and cheaper inference help. Do not build habits that depend on unlimited quota; use it deliberately.

### 93. Why does Codex keep looking more like an operating system?

It manages files, installs plugins, schedules tasks, remembers preferences and controls other apps. OpenAI sees most computer work as code-adjacent, so extending the agent is natural. The trade-off is convenience versus dependency.

### 94. Will Codex be replaced soon?

The form will persist in the short term because it solves a real need. Long term, stronger and cheaper models may embed agents into the operating system and the browser. Keep your skills tool-agnostic.

### 95. Do ordinary people really need an AI agent?

If you have a concrete problem and can verify the result, yes. If you cannot judge the output, the value is limited. The new skill is describing the problem, checking the result and iterating.

### 96. How risky is handing an entire project to AI?

High. It lacks global understanding, may refactor unrelated code, and you cannot verify everything at once. Change in small slices, review each one, and keep version control.

### 97. Will heavy Codex use make me regress?

Only if you outsource all thinking. Collaboration — setting direction, verifying, learning — improves judgement. Define "can code" by the ability to ship and solve problems, not by typing every line yourself.

### 98. How can free users make the most of it?

Reserve Codex for tasks that need execution. Use cheap or third-party models for the rest, match the reasoning level to the task, plan first, stop early, and save every good result.

### 99. When should I go back to writing code manually?

When you need deep understanding, extreme precision, core security or business logic, or when you are learning. Codex is a sparring partner in those cases, not a substitute.

### 100. What should I review after using Codex for a while?

Can you explain what Codex did and why? If not, you are outsourcing rather than collaborating. Build your own brief templates, update AGENTS.md and Skills, record recurring failures, and review how you spend quota. The long-term gain is the ability to collaborate with AI.

