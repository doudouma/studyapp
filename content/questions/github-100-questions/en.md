---
title: 100 Questions About GitHub
summary: From whether to learn it and zero-code first steps to common pitfalls, finding and running projects, portfolios and open-source contributions — 100 questions that explain how ordinary people should use GitHub.
tags: [GitHub, Git, Open Source, Portfolio, Topic Guide]
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
    value: GitHub / Git / open-source collaboration
  - key: For
    value: Non-technical people / students / job seekers / creators
  - key: Updated
    value: 2026-11-01
---

## Preface

This is a "100 questions" guide: a way to break a large subject into questions, then read it one question at a time.

GitHub is not only a code repository for programmers. It can store work, host a portfolio, serve a static site, support open-source collaboration, manage writing and even run scheduled tasks with Actions. The guide follows six stages: deciding whether to learn it, starting without the command line, avoiding the painful pitfalls, finding and running projects, storing and showing your work, and deciding how far to go.

**Quick answers**

- GitHub is worth learning, but treat it as a durable workspace for storing, showing and collaborating — not as a pile of Git commands.
- On day one, use the web UI or GitHub Desktop and complete one real commit before touching the command line.
- Read the README before running a project; if it is too technical, ask AI to explain it.
- Never commit keys, passwords or ID numbers. If one is committed, revoke and rotate it first.
- Decide whether you need storage, a portfolio, collaboration or automation. Different goals need different depth.

> Compiled from GitHub documentation and public material, structured and lightly completed for this site.

> This is an edited edition: some source passages were truncated by OCR, so the body focuses on an actionable question list with concise answers.

## 1. Should I learn it? Is it too late?

### 1. AI is so strong. Is learning GitHub still meaningful if I don't code?

Yes. AI can generate code, but GitHub is where work is stored, reviewed, versioned, shared and shown. It is the collaboration and evidence layer, not just a code editor.

### 2. People say GitHub is for programmers. What is in it for ordinary people?

It is a place to store files safely, publish a portfolio, host a static site, follow projects, learn from open source and collaborate on writing or research. The value is broader than code.

### 3. People call GitHub a second résumé. Has anyone really got an offer from a profile?

Yes, but the profile matters because it shows evidence: projects, contributions, consistency and communication. A profile alone does not guarantee an offer; it makes your claims checkable.

### 4. I am starting late. Am I too far behind to catch up?

No. Most people never start. A small, consistent public record beats a perfect profile that never exists. Start with one real project and let it grow.

### 5. My company doesn't require it and my school didn't teach it. Why spend the time?

Because it is a durable place for your work and a shared language for collaboration. It also forces you to organise, document and publish, which improves the work itself.

### 6. Other profiles look impressive. Will I look foolish as a beginner?

Only if you pretend to be an expert. A clear README, a small working project and honest notes look better than an empty profile or copied work.

### 7. People say GitHub is addictive. Who ends up collecting and never using?

People who treat stars and bookmarks as the goal. Use GitHub to run, fork or contribute to something, not only to collect links.

### 8. If I only use AI tools, what key ability will I lack?

The ability to version, review, collaborate and publish. AI can write code, but without a repository you lose history, reproducibility, review and shared context.

### 9. Does learning GitHub mean memorising a pile of Git commands?

No. You can start with the web UI or GitHub Desktop. Learn the handful of commands you actually need later: status, add, commit, push, pull.

### 10. There are so many free resources. How is GitHub different from Bilibili or a MOOC?

Courses teach; GitHub is where real projects live and where you can inspect, run and contribute to them. It is a working environment, not a video library.

### 11. For a portfolio, why is GitHub better than a PPT résumé?

A repository can be opened, run and inspected. It shows the work, the history and the documentation, while a slide deck only describes it.

### 12. Everyone says learn it, but I fear wasting time. How do I decide?

If you need to store work, show evidence, collaborate or publish a site, it is worth it. If you only need to ask AI questions, you can delay it.

### 13. GitHub has free AI models. What does that have to do with me?

Many AI projects publish models, demos and APIs on GitHub. You can try them, run them locally or connect them to your own tools.

### 14. What concrete benefits can a non-technical person get from GitHub?

A safe archive, a public portfolio, a free static site, a way to follow and run tools, and a path into open-source contribution without writing much code.

## 2. Zero-code day one: how to use it without the command line

### 15. A repository is full of English buttons. Which ones should I look at first on day one?

Look at the file list, README, the green Code button, Issues and Releases. Those cover reading, downloading, running and asking questions.

### 16. Can I upload something using only the web page, without Git or commands?

Yes. Create a repository, use "Add file" or drag files into the browser, write a commit message and save. That is a real commit.

### 17. What does the green Code button do, and why does it confuse beginners?

It offers download options: clone with HTTPS or SSH, open with GitHub Desktop, or download a ZIP. For a first look, Download ZIP is the simplest.

### 18. Star, Watch and Fork: what is the difference, and can I break something?

Star is a bookmark, Watch sends notifications and Fork copies a repository to your account. None of them changes the original project, so you cannot break it by clicking.

### 19. People say "Fork first, then change". Is Fork a copy or a link?

It is a copy under your account, with a link back to the original. You can change your fork without affecting the source, then open a pull request to propose changes.

### 20. I want someone else's project under my account. Clone or Fork?

Fork if you want your own GitHub copy and a path to contribute back. Clone if you only want a local copy to run or inspect.

### 21. Can I edit code online by pressing a key, without installing anything?

Yes. Press `.` on a repository page to open github.dev, a browser editor. It is useful for small edits and reading code, not for heavy development.

### 22. Can I skip configuring Git name and email? What happens if I do?

Do not skip it. Commits use that identity, and GitHub matches contributions to your account. Set the same email you use for GitHub.

### 23. SSH keys keep failing with "permission denied". Which step is wrong?

Usually the public key. Copy the whole `.pub` file, from `ssh-` to the end, into GitHub. Never share the private key. Test with `ssh -T git@github.com`.

### 24. GitHub is slow in China. Are there ways to speed it up without a VPN?

Try a maintained hosts file such as GitHub520, a mirror domain, or a proxy configured in Git. Avoid untrusted mirrors for private repositories.

### 25. I did not receive the GitHub verification email. What else can I do?

Check spam, confirm the address, resend from Settings → Emails, and avoid temporary email providers. If it still fails, use another reliable mailbox.

### 26. Before my first commit, should I use GitHub Desktop or the command line?

Use GitHub Desktop or the web UI on day one. Learn the command line when you need speed, scripting or batch work.

### 27. Why does everyone say read the README first? What happens if I don't?

The README explains what the project is, how to install it, how to run it and what to watch out for. Skipping it usually means downloading the wrong version or missing a required step.

### 28. I want to save a project I like. Is Star or a custom list better?

Star for a quick bookmark. Use a custom list when you have many projects and need categories. Add a note about why you saved it.

### 29. Branches sound advanced. Do I need them on day one?

No. On day one you can work on the main branch. Learn branches when you start changing someone else's project or trying two ideas at once.

### 30. I want to upload a local folder for the first time. What is the minimum set of commands?

`git init`, `git add .`, `git commit -m "first commit"`, `git remote add origin <url>`, `git push -u origin main`. If that is too much, use GitHub Desktop.

### 31. What are Issues, Pull requests and Actions for?

Issues track bugs, ideas and questions. Pull requests propose changes. Actions run automated tasks such as tests or deployments. On day one you mostly read them.

### 32. Can I switch GitHub to Chinese? Will that make English tutorials harder to follow?

GitHub has limited UI localisation. You can use browser translation, but keep key terms in English so tutorials and documentation still make sense.

### 33. What is the difference between a repository and a project?

A repository is the storage and history of files. A "project" is a broader working effort; GitHub Projects is a planning board that links issues and pull requests.

### 34. Does editing a file on the web count as a commit? How is it different from a local commit?

Yes, it creates a commit on the server. A local commit happens on your machine first and is pushed later; the result is the same history, but the workflow differs.

## 3. Why do I hit pitfalls immediately?

### 35. Push says password authentication was removed. Why doesn't my password work?

GitHub no longer accepts account passwords over HTTPS. Use a personal access token, SSH, or GitHub Desktop, which handles authentication for you.

### 36. I accidentally committed a key, password or ID number. How do I erase it completely?

Revoke and rotate the secret first. Then remove it from history with a tool such as git-filter-repo or BFG, force-push, and tell anyone who may have access. A new commit alone does not remove it from history.

### 37. My .gitignore was wrong and junk files were uploaded. How do I recover?

Add the files to `.gitignore`, remove them from the index with `git rm --cached`, commit, and push. If they contain secrets, rotate them and clean history.

### 38. My commit messages are all "fix" and "update". Is there a way to make them useful?

Use a short imperative summary and a body explaining why. For history you have not pushed, you can amend or squash; after pushing, prefer clear new commits.

### 39. I want to undo my last commit. Reset, revert or checkout?

Use `revert` for a public commit you want to undo safely. Use `reset` only for local history you have not shared. `checkout` is for switching files or branches, not for rewriting history.

### 40. A merge produced a wall of `<<<<<<<` markers. What are they?

They mark conflicting versions of the same lines. Edit the file to keep the correct content, delete the markers, then add and commit the resolution.

### 41. Should `git add` add one file or the whole directory? How do I undo a mistake?

Add only what belongs in the commit. If you added too much, use `git restore --staged <file>` to unstage it. Review `git status` before committing.

### 42. Why do I need commit after add? What does staging actually do?

Staging selects what goes into the next commit. It lets you review and separate changes, so one commit contains one coherent change instead of everything on disk.

### 43. What do the red and green files in `git status` mean?

Red means untracked or modified but not staged. Green means staged and ready to commit. Read the labels; they tell you what the next commit will include.

### 44. I committed a mistake and don't want an undo record. Is there a clean way?

For an unpushed commit, amend it or reset and recommit. For a pushed commit, do not rewrite public history; make a corrective commit or coordinate with the team.

### 45. Two people changed the same file and my changes were overwritten. How do I prevent that?

Pull before you start, work on a branch, commit often, and open a pull request. Resolve conflicts explicitly instead of force-pushing over someone else.

### 46. I follow a tutorial but get stuck on the first push. What are the three common breakpoints?

Authentication, the remote URL, and the branch name. Check the token or SSH key, confirm `git remote -v`, and push to the branch that actually exists.

### 47. Pull says "unrelated histories". What does that mean?

The local and remote repositories do not share a commit ancestor. Merge with `--allow-unrelated-histories` only when you are sure, or start from a clean clone.

### 48. Push is rejected, pull creates conflicts, and I am stuck in a loop. How do I break it?

Fetch first, inspect the divergence, then merge or rebase deliberately. If the branch is a personal one, reset to the remote and reapply your changes; never force-push a shared branch.

### 49. I cloned an empty directory even though the web page has files. Why?

You may have cloned the wrong branch, the wrong URL, or a repository whose files are in a submodule or release. Check the default branch and the repository URL.

### 50. A repository says 404 or access denied. Was I blocked, or is the link wrong?

Check the URL, whether the repository is private, and whether you are logged in. A private repository returns 404 to users without access.

### 51. I deleted .git, lost a branch or edited the wrong branch. How do I recover?

Check the reflog and remote branches first. If `.git` is gone, clone again and recover uncommitted files from backups or the editor's local history.

## 4. How do I find good projects, judge them and run them?

### 52. I want a usable tool. How do I search GitHub better than a general search engine?

Search by problem, not by name. Use GitHub's search, filter by language, stars and recent updates, and read the README of the top few results.

### 53. Why does adding "awesome" to a search find treasure lists?

"Awesome" lists are curated collections of links on a topic. They save you from scanning random repositories and often point to the most useful projects.

### 54. Is star count enough to judge a project? What else should I check?

No. Check recent commits, open issues, maintainer activity, documentation, licence and whether the project solves your problem.

### 55. How do I tell whether a project is alive or abandoned?

Look at the latest commit, release and issue activity. A project with no updates for a year and unanswered issues is usually abandoned.

### 56. The README is too technical. Is there a fast reading method for ordinary users?

Read the first section, the install steps, the usage example and the troubleshooting section. Skip the architecture details unless you plan to modify it.

### 57. I want to run a project. Which README section should I read first?

Start with requirements and installation, then usage. Check the supported operating system and versions before installing anything.

### 58. What are `npm install` and `pip install`? I am afraid to run them.

They install a project's dependencies. They are normal, but run them in a project folder you trust, ideally in a virtual environment or container.

### 59. The install command fails on my computer. What is usually wrong?

The wrong runtime version, a missing system dependency, a path issue or a permission problem. Read the first error and compare your environment with the requirements.

### 60. Can I replace github with deepwiki in the URL to get plain-language docs?

Some repositories have generated documentation on DeepWiki, but not all. It can help you understand a project, but verify important details against the source.

### 61. I don't understand the code. Is it reliable to paste the README into AI and ask for an explanation?

It is useful for orientation, but AI can miss details or hallucinate. Use it to form questions, then check the README and source.

### 62. A project downloads at 20 KB/s. Besides waiting, how can I speed it up?

Use a download mirror, a proxy configured for Git, or download a release ZIP instead of cloning the full history.

### 63. The project asks for an API key. Where do I get one, and is it safe?

Get it from the official provider, never from a random repository. Keep it in an environment variable, never commit it, and set spending limits.

### 64. Can I try a project in the browser or on my phone without setting up a local environment?

Sometimes. Look for a demo, a hosted version, GitHub Pages or a cloud notebook. If none exists, a local or container setup is usually required.

### 65. The project throws a wall of red errors. Is it the project or my setup?

Check whether the error is about a missing runtime or package (your setup) or a logic traceback (the project or an unsupported scenario). Search the project's Issues for the same error.

### 66. Releases or downloading the code: which should an ordinary user choose?

Choose Releases for a ready-to-use package. Download the source only if you want to read, modify or build it.

### 67. I don't want to touch code. How do I pick a ready-to-use version?

Look at the Releases assets, choose the build for your operating system, and prefer a recent version with clear instructions.

### 68. How do I tell whether an AI project is hype or actually useful?

Check whether the README has real install and usage steps, whether the project is actively updated, and whether Issues show real usage or just "it doesn't run".

### 69. I collect good projects but never open them. How do I build a use-it-now habit?

Pick one project you need today, follow its README one step, and either use it or delete it from your list. A small saved list with notes beats a huge unopened collection.

## 5. How do I store my work, show it, and contribute to open source?

### 70. What should my first repository contain? Does an empty repository look bad?

Put a real note, a study log or a small practice project in it. An empty repository looks worse than a simple, honest one. Start with something and improve it.

### 71. How do I write a README that is easy to understand without design skills?

Use a simple structure: project name, one-line description, features, installation, usage and contact. GitHub renders Markdown; preview before saving.

### 72. Markdown has so much syntax. Which parts do I need for a README?

Learn headings, bold, lists, links, images and code blocks. That covers almost every README you will write.

### 73. I want to upload code but fear it is too bad. How do I package my first repository?

Do not worry about being laughed at. A clear README, working instructions and an honest scope are enough. Everyone starts somewhere.

### 74. What is GitHub Pages, and how do I turn a repository into a homepage or résumé?

Pages is free static hosting. Put an `index.html` in a repository, enable Pages in Settings, and your site appears at `username.github.io/repo`.

### 75. Do I need a server and domain for a Pages site? Is it enough for ordinary people?

No. Pages includes hosting and a `github.io` domain. It supports static sites only, which is enough for a résumé, portfolio or documentation.

### 76. How do I make my homepage rank when a recruiter searches my name?

Put the link in your résumé, social profiles and email signature. Keep repositories documented and active; search ranking follows real, findable content.

### 77. How do I make my GitHub profile look polished with dynamic stats or templates in ten minutes?

Search for a profile README template, copy it, replace the placeholders and commit. Dynamic cards read your public activity, so keep contributing.

### 78. I want to help an open-source project but cannot code. What can I contribute?

Documentation, translations, clearer steps, bug reports, design, tutorials and answering new users' questions. Maintainers need these as much as code.

### 79. Do typo fixes and documentation count as contributions? Do authors welcome them?

Yes. Documentation contributions are among the easiest to accept and are often explicitly thanked. Start there to learn the PR workflow.

### 80. Is the "good first issue" label for beginners? How do I use it?

Yes. It marks tasks chosen for newcomers. Read the issue, ask clarifying questions, follow the contribution guide and keep the change small.

### 81. I want to report a bug or suggest an improvement. How do I write an Issue that is not ignored?

Give a clear title, reproduction steps, expected and actual behaviour, versions and logs. Search existing issues first and keep one issue per problem.

### 82. What is a Pull Request, and how is it different from editing files directly?

A PR proposes changes from your branch or fork to the target repository. It adds review, discussion and CI before merge, instead of writing directly to the main branch.

### 83. My first PR was rejected. Does that mean I am not good enough?

No. Rejection is normal: the change may be out of scope, need tests, or conflict with the maintainer's plan. Read the feedback and iterate.

### 84. What is the difference between Discussions and Issues? Where should I talk?

Issues are for actionable bugs and tasks. Discussions are for open-ended questions, ideas and community conversation. Follow the project's guidance.

### 85. Can I use GitHub to manage writing, notes and research? How is it better than a cloud drive?

Yes. You get version history, diffs, issues, collaboration and plain-text portability. It is better for structured, evolving work than for large binary files.

### 86. GitHub Actions can run tasks automatically. What can ordinary people use it for?

Scheduled backups, publishing a static site, running tests, generating reports and syncing content. Start with a template and keep permissions narrow.

### 87. Can Copilot CLI help me operate GitHub without writing code?

Yes. It suggests and explains commands in natural language, and asks for confirmation before running them. It is useful when you cannot remember the exact command.

### 88. Can I use GitHub + jsDelivr as a free image host and CDN for my blog?

Yes, with caveats: the repository must be public, do not upload private images, and keep the repository small. It is fine for occasional blog images, not for unlimited storage.

### 89. Can people actually make money from GitHub Sponsors?

Some maintainers do, and GitHub takes no cut. It requires a project with real users and sustained contributions. Treat it as support for ongoing work, not a shortcut to monetisation.

## 6. Where to go next, or where to stop

### 90. After the basics, should I learn branch management or collaboration first?

Choose by goal. Releases for publishing, Pages for showing, Actions for automation, and collaboration for working with others. Branches are the foundation of collaboration; learn them in a real PR.

### 91. What does Code Review actually review, and how do newcomers avoid nitpicking?

It reviews logic, edge cases, bugs, performance, naming and clarity. Keep PRs small, respond to comments, and treat review as free coaching rather than a personal attack.

### 92. Can Projects boards work as project management? How is it better than Excel?

Yes. Projects boards link issues and pull requests, show status, owners, dates and priority. The data stays in Issues/PRs, so you do not maintain two copies.

### 93. Actions for automated builds and deployment sound advanced. Should a beginner touch them now?

Yes, but start with templates. Use them for scheduled backups or auto-publishing a site. Learn the internals only when you have a real automation need.

### 94. What pain points do Actions "variables" and "cache" solve?

Variables avoid repeating the same value across workflows. Cache avoids reinstalling dependencies every run. Use them to make automation faster and easier to maintain.

### 95. Which keyboard shortcuts and command-palette tricks should I learn on day one?

Learn `?` for shortcuts, `G` navigation, `t` for file search, `y` for a permanent link and `.` for the web editor. The command palette is the fallback when you forget a shortcut.

### 96. What does pressing "y" to create a permanent link do, and why not share the current URL?

A normal file URL points to a branch, which changes. Pressing `y` replaces the branch with a commit ID, so the link stays stable. Use it when sharing code in discussions.

### 97. Can hover cards show me what a link is without opening it?

Yes, in GitHub Docs. Hover or press Alt/Option + Up on a link to preview the article, then press Enter to follow or Esc to close.

### 98. How do I set Copilot CLI aliases, and how much typing do they save?

Use `gh copilot alias` to generate aliases such as `ghcs` for suggest and `ghce` for explain. Add the generated eval line to your shell config; do not hand-write a plain alias.

### 99. How much is "enough"? Which deep areas can ordinary people skip?

Enough means you can store work, read a README, run a project, open a PR and publish a page. You can skip advanced Git internals, complex Actions and monorepo tooling unless your work needs them.

### 100. What can't GitHub solve, and where is a specialised tool better?

GitHub is not a cloud drive, a real-time document editor, a design tool or a full project-management suite. Use it for versioned, text-based, collaborative work; use specialised tools for large media, real-time editing and complex planning.

