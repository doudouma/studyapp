---
title: Overseas GEO Whitepaper in 100 Questions: A Generative Engine Optimization Guide for Global Brands
summary: The Overseas GEO Whitepaper's evidence, reorganized into 100 questions — how five AI platforms pick sources, citation drift and sampling statistics, the five-can framework, per-platform measurement, and a 90-day rollout. Every figure comes from the source paper.
tags: [GEO, Generative Engine Optimization, Global Marketing, SEO, AI Search]
author: 100mini Editorial
publishedAt: 2026-11-08
updatedAt: 2026-11-08
questionCount: 100
chapterCount: 8
facts:
  - key: Author
    value: 100mini Editorial
  - key: Questions
    value: 100
    highlight: true
  - key: Chapters
    value: 8
  - key: Platforms
    value: Google AIO / AI Mode · Gemini · ChatGPT · Perplexity · Claude
  - key: Data
    value: 10.046M answers (2026-06 to 09)
  - key: As of
    value: 2026-10-26
---

## Preface

> **Source**: derived and reorganized from the *Overseas GEO Whitepaper* (Yao Jingang, Qiao Xiangyang, Ren Qiang, Tim of Dageno AI, et al.; jointly published by Liekan Technology, Chang'an Street Knowledge, Zhiyuan GEO, Dageno and Jingbao Think Tank; data as of 2026-10-26). Restructured as question and short answer for easier retrieval and citation.
>
> **On the numbers**: every figure below is a snapshot from the source paper, including Dageno AI's analysis of 10.046 million answers and citations of public research. Values change over time; when citing external studies we keep the original authors and year so a single experiment is never mistaken for a general law.

> **One-line answer:** GEO still rests on SEO. The increment is off-site brand evidence and per-platform measurement. Make crawlable, understandable and trustworthy first; treat citable and recommendable as build-and-measure. Acceptance must be statistical — a fixed prompt set, 7–8 samples per question at minimum, reported intervals, and a control group.

**The 100 questions at a glance**

| Chapter | Topic | Questions |
| --- | --- | ---: |
| 1 | What GEO is — and where it stops | 12 |
| 2 | How AI selects sources | 12 |
| 3 | How the five platforms differ | 14 |
| 4 | Evidence: what was disproved, what held | 12 |
| 5 | Empirical findings | 14 |
| 6 | The five-can framework | 12 |
| 7 | Measurement, sampling and attribution | 14 |
| 8 | Rollout, cases and compliance | 10 |

## 1. What GEO is — and where it stops

### 1. What is GEO, and how does it relate to SEO?

GEO (Generative Engine Optimization) is the practice of getting a brand into AI answers. Its foundation is still SEO: crawlable, understandable and trustworthy have not changed. The increment is off-site brand evidence and per-platform measurement.

### 2. Why does GEO matter in 2026?

AI is already a primary information gateway: Google AI Overviews has over 2.5 billion monthly users, AI Mode over 1 billion, Gemini's app 950 million, and ChatGPT 1.2 billion weekly users. Meanwhile, on result pages with an AI summary, the click-through rate on traditional links roughly halves, from about 15% to 8%.

### 3. Will GEO replace SEO?

No. Google's official guidance in May 2026 states that "optimizing for AI search is still SEO" and explicitly says llms.txt, a "GEO schema" and chopping content into fragments are not required.

### 4. What is zero-click, and how big is the effect?

Users read the answer on the result page and never click. With an AI summary, traditional click-through falls from 15% to 8%. But among visits influenced by AI, only 8.8% come directly from an AI platform; more than half arrive through a later search.

### 5. Why is AI traffic so hard to attribute?

Visits from mobile apps, in-app browsers and copied links carry no referrer and land in "direct". Direct clicks from AI platforms are only 8.8% of AI-influenced visits. So watch brand search volume and direct sessions, and add a self-reported "how did you hear about us" question to forms.

### 6. Does llms.txt help?

Not for search or AI citations — Google says it does not use it. Its purpose is helping browser agents understand site structure. Documentation sites can ship it cheaply; everyone else need not prioritize it.

### 7. Do I need a special "GEO schema" or to fragment my content?

Neither. Google's guidance says both are unnecessary. What is needed: descriptive headings, short paragraphs, clear definitions, lists, comparison tables and useful FAQs — not unnatural fragmentation.

### 8. Where is the real increment in GEO?

Not in on-page tricks, but in off-site brand evidence and per-platform measurement. 69%–92% of AI search citations are third-party earned media, and brand mention volume correlates with AI Overviews visibility at 0.664, while backlink count correlates at just 0.218.

### 9. Which companies should start with GEO?

B2B software and technical categories first — company sites account for over 70% of sources there, with long buying cycles and heavy comparison. Local services and strong e-commerce categories should first fix retail product pages and review coverage.

### 10. How long does GEO take to show results?

Crawlability and rendering fixes usually show within weeks; off-site brand evidence and awareness take months. The whitepaper's plan is 90 days: 30 days for a baseline, 30 for content and off-site, 30 for re-measurement.

### 11. How does GEO relate to PR and content marketing?

They overlap heavily. GEO's off-site half — media, reviews, communities, video — is what PR and content budgets already do. GEO re-ranks and re-measures that work by one criterion: does it enter AI answers?

### 12. What is the biggest risk of skipping GEO?

Not a ranking drop — absence. Brand visibility is lowest at the awareness stage (73% on ChatGPT), while 93%–97% of decision-stage answers recommend a brand. Skipping GEO hands the decision moment to competitors.

## 2. How AI selects sources

### 13. What steps does AI go through to answer a category question?

Seven: query understanding and rewriting → search trigger → candidate recall → re-ranking → answer generation → citation attribution → absorption into model knowledge. The first three decide whether you appear at all; the last four decide how you are described.

### 14. What is grounding?

Putting retrieved page content into the model's context so the answer is based on those passages rather than purely on parametric memory. Whether a brand can be cited depends on being retrieved and entering that context.

### 15. When does AI answer without searching?

When the question is simple, common knowledge, or the model is confident. 45% of Gemini answers and 35% of AI Mode answers recommend a brand without citing any source — pure parametric knowledge at work.

### 16. What is query fan-out?

A user question is split into several sub-questions searched in parallel. That is why a topic needs definitions, comparisons, use cases, costs, risks and steps — not just one page title.

### 17. What kind of pages does AI retrieval prefer?

Relevance first, then the passage's position in the context window. Explicit prices, dates and specs help; statistics, quotations and authoritative sources are the three most effective rewrites in GEO-bench.

### 18. Does keyword stuffing still work?

It hurts. In GEO-bench, keyword stuffing pushed visibility below the baseline, and the same happened on Perplexity.

### 19. Can a low-ranking page still win?

Yes, and it gains more. After applying the "cite sources" rewrite, the document ranked fifth gained 115.1% visibility, while the top-ranked one lost 30.3%.

### 20. Statistics, quotations or sources — which works best?

It depends on the field: legal and government content benefits from data and citations, history and social content from quotations; combining fluency edits with added data performed best overall.

### 21. Why is the same question answered differently each time?

Retrieval is live and stochastic. Across repeated runs, 9%–28% of citation decisions change; URLs for the same question churn 62%–93% per week, with a half-life of about one day.

### 22. Does a high citation rate mean the answer is correct?

No. In a 2023 study of four engines, only 51.5% of sentences were fully supported by their citations; in a 40-day trace of AI Overviews in 2026, about 11% of atomic facts were insufficiently supported.

### 23. How often does AI cite trustworthy sources?

Across assistants and topics, the share of credible sources ranges from 71.4% to 86.3%. Being cited is only step one; whether the answer is right must be measured separately.

### 24. Can hidden page instructions (prompt injection) boost rankings?

In experiments, yes — indirect prompt injection lifted targets about three positions on Perplexity's Sonar API on average (Pfrommer et al., EMNLP 2024). It is black hat: in May 2026 Google added "attempting to manipulate generative AI answers" to its spam policies.

## 3. How the five platforms differ

### 25. Why does GEO have to be done per platform?

The five platforms are five source ecosystems: pairwise citation-domain overlap is below 0.25, and the overlap between Google organic, AI Overviews and Gemini cited URLs is only 0.11–0.18.

### 26. What sources do Google AI Overviews and AI Mode favor?

YouTube and Reddit carry the most weight: YouTube is 17.6% of AI Mode's non-company sources and 14.4% of AI Overview's, and nearly half of third-party citations from both entries flow to just ten domains (CR10 37%–56%).

### 27. Which crawler must be allowed for Gemini citations?

Googlebot — and do not block Google-Extended, which also controls Gemini's app grounding citations. Blocking it removes you from Gemini citations too.

### 28. What does Gemini's "recommendation without a source" mean?

45% of its answers recommend a brand without citing anything, which means those answers come from parametric knowledge. Win them through entity work — a consistent brand name and category position, encyclopedia entries and authoritative coverage — not page tweaks.

### 29. What is ChatGPT's retrieval foundation?

Third-party search providers plus partner content. OAI-SearchBot decides citations, GPTBot is the training switch, and user-triggered ChatGPT-User may not respect robots.txt.

### 30. Which sources does ChatGPT favor?

Wikipedia, news media, professional reviews and Reddit. It differs sharply from Google: YouTube is 31% of Perplexity citations but under 2% on ChatGPT.

### 31. Should OAI-SearchBot and GPTBot be decided separately?

Yes. The first affects search citations, the second only affects training and long-term brand knowledge. Blocking the training bot will not hurt citations immediately, but it weakens what the model knows about you.

### 32. What is distinctive about Perplexity's sources?

It runs its own index and shows sources on every answer, so citation exposure is valuable. YouTube, G2/Gartner and Yelp/TripAdvisor are its key sources.

### 33. What is the difference between PerplexityBot and Perplexity-User?

The first decides whether you can be retrieved and cited; the second fetches your page when a user opens it and generally ignores robots.txt.

### 34. What does Claude use for retrieval?

Brave Search (since 2025) plus Claude-SearchBot. ClaudeBot is the training crawler, and Claude-User respects robots.txt.

### 35. What happens if I block Claude-User?

You directly reduce your chances of being cited — Claude's user-triggered fetches respect robots.txt, unlike some other platforms. Claude visibility depends entirely on organic retrieval and model knowledge, with no paid shortcut.

### 36. Why does doing well on one platform not carry over?

In a five-engine sample only 2.7% of domains were cited by all five engines. No single body of content automatically covers every platform.

### 37. Which platform depends most on video?

Perplexity and the Google entries. YouTube is 31% of Perplexity citations but under 2% on ChatGPT, so video investment should be judged platform by platform.

### 38. What should e-commerce brands watch with Copilot?

Copilot's e-commerce sources are 12.8% of its citations, four to six times other platforms. Complete product pages and Q&A on Amazon and Walmart, and connect Bing Webmaster Tools and IndexNow.

## 4. Evidence: what was disproved, what held

### 39. Which paper founded GEO?

Aggarwal et al., "GEO: Generative Engine Optimization" (KDD 2024). It built GEO-bench with 10,000 queries: the top five Google results were given to GPT-3.5 to generate an answer, then one document was rewritten to observe visibility change.

### 40. Is "GEO lifts visibility by 40%" trustworthy?

Only with three caveats: it was a single position-weighted word-count metric rising from 19.3 to 27.2; only one of five documents already in context was rewritten; and the model was GPT-3.5 from 2023. It proves content form influences which source a model uses — not that you will be retrieved or get traffic.

### 41. Why do most replications fail?

In C-SEO Bench (about 1,900 queries, 16,360 documents), only 3 of 54 method-by-domain combinations were significantly positive, and none in question answering. The more people adopt a method, the smaller its gain.

### 42. What is SAGEO Arena's most important finding?

Rewriting body text alone lowered top-20 recall by about 9%, post-rerank top-10 by 16% and final citations by 6%. Sacrificing relevance to be cited can make a page harder to retrieve.

### 43. Which factors are repeatedly validated?

Topical relevance and the passage's position in the context are the best predictors of citation. Explicit prices and recent dates help consistently. Format alone has weak effect.

### 44. How reliable are AI citations?

In the 2023 four-engine study, only 51.5% of sentences were fully supported and 74.5% of citations truly supported the claim. In the 2026 40-day AI Overviews trace, about 11% of atomic facts were insufficiently supported.

### 45. Do black-hat methods actually work?

They work but should not be used: indirect prompt injection lifted targets about three positions on Perplexity's Sonar API, and preference manipulation raised a fictional camera's recommendation rate from 34.0% to 59.4% (Nestaas et al., ICLR 2025). Platforms are hardening, and the brand carries the risk.

### 46. What do large industry studies conclude?

Off-site brand signals correlate most strongly with visibility: brand mention volume correlates with AI Overviews visibility at 0.664, while backlink count is only 0.218.

### 47. What share of AI citations is earned media?

69%–92% are third-party reports, reviews and community content rather than the brand's own pages. That is why being recommendable is harder — and more important — than being citable.

### 48. How are evidence levels ranked?

Randomized field experiments > real-engine observations across multiple dates and rewrites > tests with hand-supplied URLs > fixed-context or model-scored experiments. Check the level before believing a case study.

### 49. Why do single-site studies overstate results?

Without subtracting overall platform growth, effects can be overstated more than threefold. Evaluation needs a control group, or interrupted time series and difference-in-differences to net out the baseline.

### 50. What is the biggest evidence gap in GEO?

Whether, once retrieved, any technique reliably improves impressions, traffic and conversion across platforms. Nothing has been proven stable — which is exactly why you build and measure.

## 5. Empirical findings

### 51. Is the brand website AI's biggest source?

Yes. Company sites account for 37.5%–58.2% of source links across platforms, and their share rose on four platforms from June to September.

### 52. Which category leans most on the company site?

B2B technical categories, above 70%, because specs, prices and credentials have their authoritative version on the company site, which AI retrieval cannot avoid.

### 53. How low is source overlap between platforms?

Pairwise Jaccard similarity of domains is only 0.05–0.20, all below 0.25. Nearly half of the Google entries' third-party citations go to ten domains, while ChatGPT's top ten domains total just 11%.

### 54. Why are Google's sources so concentrated?

It is built on the Google index and the YouTube ecosystem: YouTube alone is 14%–18% of non-company citations, and CR10 across both entries is 37%–56%.

### 55. How much does brand visibility differ by funnel stage?

93%–97% at the decision stage versus 73%–87% at awareness. Institutional sources fall from 10.4% of awareness answers to 3.8% of decision answers.

### 56. How far apart are "cited" and "recommended"?

Only about a quarter of brands on cited pages make it into the answer. Gemini recommends a brand without any source in 45 of every 100 answers; AI Mode does so in 35.

### 57. Do sourced and unsourced answers show similar brand visibility?

Almost identical, both around 88%. So build both searchable pages and model-level entity knowledge — neither alone is enough.

### 58. How fast does citation drift happen?

URLs for the same question churn 62%–93% per week, with a half-life of about one day. SISTRIX observed about 85% at the URL level and Yotpo 70%–81%, broadly consistent.

### 59. What stays relatively stable amid drift?

The hierarchy of brands and source types. Manage a rolling 28-day presence rate rather than chasing a single URL's rank.

### 60. How low is same-question consistency?

Repeating on the same platform and day, the probability of an identical brand list (including order) is only 4%–6% on ChatGPT, Gemini and Copilot; overall consistency ranges from 4% to 44%.

### 61. Why is 2–3 samples untrustworthy?

With 2–3 repetitions, the 95% interval for brand visibility spans 60–70 percentage points. Reaching ±15 points for a single question takes roughly 40 samples.

### 62. Which platform changes are random?

ChatGPT and Gemini mostly fluctuate randomly; AI Mode shows marked cross-week drift, so it needs weekly monitoring and fresh content.

### 63. How strongly do mentions correlate with visibility?

Brand mention volume correlates with AI Overviews visibility at 0.664 versus 0.218 for backlinks — being mentioned off-site matters more than being linked.

### 64. Does this data agree with external research?

Directionally yes for YouTube weight, citation drift and same-question consistency; company-site share diverges (38%–58% here versus 12.9% in Zhen et al.'s Chinese-interface study), likely due to market, category and how "company site" is defined.

## 6. The five-can framework

### 65. What is the "five-can" framework?

Crawlable, understandable, trustworthy, citable, recommendable — in that order. The first three overlap heavily with SEO and have the strongest evidence, so do them first; the last two are GEO's increment, potentially higher return but weaker evidence, so build and measure.

### 66. What does crawlability require?

Three layers of settings — robots.txt, CDN and WAF — plus sitemaps and redirects, and server logs showing whether AI crawlers actually arrived and how often they errored.

### 67. Is it true that Cloudflare blocks AI crawlers by default?

Yes. Since 1 July 2025, Cloudflare blocks AI crawlers by default for hosted sites and introduced pay-per-crawl. Many sites unknowingly block search-oriented AI crawlers and must audit all three layers.

### 68. Do AI crawlers execute JavaScript?

Mainstream ones do not: GPTBot, ClaudeBot and PerplexityBot all skip it; only Gemini and Applebot, which run on Googlebot infrastructure, render. About 30% of ChatGPT and Claude fetches hit a 404.

### 69. Must core content be server-rendered?

Yes. Otherwise AI crawlers see an empty shell. Also maintain sitemaps, redirects and status codes, and use server logs to verify whether AI came at all.

### 70. Understandable: how should content be structured?

Write headings as questions or conclusions, keep one idea per section, make subjects explicit (no dangling "it"), use tables for specs and numbered lists for steps, and put key information in text rather than only in images or PDFs.

### 71. What does entity consistency cover?

Brand name, product names, founders, founding date and headquarters must match across the company site, Wikipedia, business registries and social accounts; Organization structured data must match page content.

### 72. How do you build trustworthiness?

Publish author bios, credentials and reviewers; publish real company information and contact details; release original data, tests, screenshots and first-hand cases; explain methods, cite primary sources, and show published and updated dates.

### 73. Citable: how should a section open?

Lead with the conclusion and the key number, then explain. Skip "as ... continues to develop" preambles, because models often extract the first sentence.

### 74. Citable: how do you raise evidence density?

Add verifiable statistics, expert quotations and authoritative sources, plus explicit prices, dates and specs. Data must be real and checkable — inventing it is black hat.

### 75. Recommendable: how do you choose off-site channels?

By platform and category: B2B uses G2, Gartner Peer Insights and industry media; consumer goods use marketplace reviews and Trustpilot; local services use Google Business Profile and Yelp; video and community mean participating authentically as the official account on Reddit and YouTube.

### 76. What is the language strategy for global brands?

Claude leans to English sources; GPT and Perplexity lean to local-language sources. Authoritative English coverage and target-market local-language content are both required, with a separate prompt set and baseline per market.

## 7. Measurement, sampling and attribution

### 77. Why can't GEO be signed off with "a screenshot"?

Because answers are stochastic: with 2–3 repetitions the visibility interval spans 60–70 percentage points. A single screenshot cannot separate real change from noise.

### 78. What layers does the metric system have?

Four: discoverable (crawler coverage and error rate) → cited (mention rate, citation rate, share of voice, first-position rate) → absorbed and accurate (fact accuracy, sentiment) → business outcome (AI-referred sessions and conversions, AI impressions, brand search volume).

### 79. What is the difference between mention rate and citation rate?

Mention rate = answers naming the brand ÷ valid answers; citation rate = answers citing the brand's own domain ÷ valid answers. Being cited is not being recommended, so report them separately.

### 80. How is share of voice calculated?

Brand mentions ÷ mentions of all brands in the category. That is why the prompt set must include main competitors, or SoV cannot be computed.

### 81. Why measure fact accuracy separately?

Because citation rate is not accuracy: about 11% of atomic facts are insufficiently supported, so a cited brand can still be described wrongly.

### 82. How should the prompt set be designed?

Layer by intent (category awareness, recommendation, comparison, decision detail, brand, problem solving), write 3–5 phrasings per information need including conversational and keyword forms, split by market and language, and keep it fixed long-term with small quarterly updates.

### 83. Why should the prompt set focus on non-recommendation questions?

Because being recognized and being recommended are different: recognition in recommendation scenarios runs at 99.4%, while recommendation in category questions is only 3.32%. Testing only brand terms badly overstates performance.

### 84. How many samples per question?

Start at 7–8 per question and sample across multiple date windows; report 95% intervals and run a statistical test before declaring change.

### 85. Should empty results be kept?

Yes. Answers with no search trigger, no citation, or an error are results too. Dropping them systematically overstates visibility.

### 86. How do you prove optimization actually worked?

Use a control: change only some pages and leave others untouched, or apply interrupted time series or difference-in-differences to net out platform growth. Single-site studies without controls overstate effects more than threefold.

### 87. Can GA4 identify AI traffic?

Partly. Since May 2026 GA4's default channel group includes "AI Assistant", automatically recognizing referrals from ChatGPT, Gemini, Claude and others. The full list is unpublished, so use a custom channel group to add Perplexity and similar platforms.

### 88. Why does AI referral traffic look so small?

Because only 8.8% of AI-influenced visits come directly from an AI platform; more than half arrive later through search. Visits from mobile apps, in-app browsers and copied links also land in "direct".

### 89. How do you close the attribution blind spot?

Watch brand search volume and direct sessions together, add a self-reported "how did you hear about us" field, and cross-check against AI crawler activity in server logs.

### 90. What belongs in an auditable GEO report?

Per-platform, per-funnel visibility baselines with intervals; the sampling rules and prompt-set version; fact accuracy; crawler coverage and error rate; AI referral traffic and brand search volume; and the period's controlled-experiment conclusions.

## 8. Rollout, cases and compliance

### 91. How should the 90 days be sequenced?

Days 1–30 build the baseline, 31–60 add content and off-site work, 61–90 re-measure and iterate, ending with a quarterly report and next-stage plan.

### 92. What exactly happens in the first 30 days?

Select about 100 questions by funnel and intent, sample 5–10 times on each of the five platforms, connect server logs to verify AI crawler access, inventory and fix company fact pages, and extract each platform's high-frequency cited domains from monitoring data.

### 93. How do you fill out the content matrix?

Cover awareness, consideration and decision: prioritize company fact pages, comparison pages and sub-question content, and produce 5–10 answer-style videos for the Google entries.

### 94. How do you make answer-style videos?

One question per video, title written as the question, with captions and chapters. Also earn third-party creator reviews, since YouTube carries the highest citation weight in the Google entries and Perplexity.

### 95. Are there positive cases to learn from?

Yes. Vercel saw ChatGPT-driven signups rise from 1% to about 10% in half a year; Ahrefs turned 0.5% of traffic into 12.1% of signups; Tally converted community reputation into AI recommendations; Convert's GEO project lifted LLM visibility from 31% to 55% in 60 days.

### 96. What do the negative cases teach?

Chegg lost traffic and revenue fast once its answers were replaced by AI summaries; Penske Media exposed platform dependency. Owned traffic and direct user relationships remain the floor.

### 97. What are the black-hat methods and their risks?

Buying mentions, manufacturing fake discussions, review manipulation, paying for citations, hiding instructions in pages, and cloaking for crawlers. Google has added "attempting to manipulate generative AI answers" to its spam policies; demotion and reputational risk land on the brand.

### 98. What do you do when AI describes the brand wrongly?

First make the facts authoritative and crawlable on your own site, then use model feedback channels and authoritative third-party sources. Track fact accuracy as a standing metric instead of watching impressions alone.

### 99. How should content licensing and crawler policy be set?

Allow search and citation crawlers (Googlebot, OAI-SearchBot, PerplexityBot, Claude-SearchBot); decide training crawlers (GPTBot, ClaudeBot) by content asset value; remember Google-Extended also controls Gemini's grounding citations.

### 100. What compliance issues matter for global brands?

The EU AI Act's Article 50 requires labeling AI-generated content; the US FTC's fake-review rule governs reviews and endorsements; Google's spam policies add another layer. The white-hat red line: do not buy, do not fake, do not hide, do not cloak.
