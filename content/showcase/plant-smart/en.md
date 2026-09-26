---
slug: plant-smart
name: Plant Smart
summary: A free, ad-free database of pet-toxic plants with severity, symptoms and reverse lookup — open API, curated from ASPCA and iNaturalist.
category: resource
tags: [Pet Safety, Plant Database, Open API, Open Data, No Ads]
publishedAt: 2026-09-26
updatedAt: 2026-09-26
author: u/WilhelmCodes
externalUrl: https://plantsm.art
facts:
  - key: author
    value: u/WilhelmCodes
  - key: price
    value: Free · ad-free · no account
    highlight: true
  - key: lookup
    value: By plant name or by symptoms (reverse lookup)
  - key: data sources
    value: ASPCA · iNaturalist · verified, non-AI curated
  - key: api
    value: Open API · open data with attributions
  - key: age
    value: 3.5 years old, freshly redesigned
sources:
  - title: Plant Smart — official site
    url: https://plantsm.art
    publisher: plantsm.art
  - title: r/InternetIsBeautiful — project thread
    url: https://www.reddit.com/r/InternetIsBeautiful/
    publisher: Reddit
cover:
  src: /showcase/plant-smart.jpg
---

## What it is

Plant Smart is a free database of pet-toxic plants built by u/WilhelmCodes to end the classic houseplant-owner panic: you see a nice plant, you have pets, and suddenly you are ten tabs deep in conflicting, ad-stuffed pages trying to work out if it will hurt them. Built 3.5 years ago and recently given a fresh coat of paint, it lives at [plantsm.art](https://plantsm.art) and was shared on r/InternetIsBeautiful to gauge interest.

## Core value proposition

* **Search by plant, common or scientific name**: See severity, which animals it affects, and what symptoms to look for — one query instead of ten tabs.
* **Reverse lookup by symptoms**: If your pet is already showing symptoms, search by those and narrow down the culprit plant.
* **Free, ad-free, slop-free**: No account needed, no ads, and every collated entry is curated from verified sources with attributions — explicitly non-AI-generated data.
* **Open API**: The dataset is open and the API is there to build on, so the data outlives the site.

## What it can replace

| Target software | Feasibility | Verdict & use-case context |
| --- | --- | --- |
| Ten-tab googling of pet plant safety | High | One curated database answers severity, affected animals and symptoms in a single query. |
| SEO content farms on pet toxicity | High | "Slop-free" by design: non-AI data curated from verified sources like ASPCA and iNaturalist. |
| Commercial plant-identifier apps | Moderate | Purpose-built for pet toxicity rather than photo-ID; you must already know the plant's name. |
| Veterinary poison control | Low | A guide, not a diagnosis tool — an emergency always goes to a vet first. |

## Current realities and limitations

* **No photo identification**: Lookup works by plant name (common or scientific), so you need to know what the plant is called before you can check it.
* **English only for now**: Internationalization with localized common names is on the roadmap but not shipped.
* **A guide, not a vet**: Severity and symptom data inform decisions; they cannot replace professional advice when an animal has actually eaten something.
* **Dataset still being scrubbed**: The author is actively cleaning entries for accuracy and pulling in new open reputable sources, so details can change.

## Verdict

> **Primary recommendation**
> Bookmark it if you share a home with pets and plants. The reverse symptom lookup is the killer feature — that is the moment of panic where ten-tab googling actually hurts — and the open API makes it a clean foundation for anyone building pet-safety tools. It is a reference utility done right: free, ad-free, sourced, and improving in public.

## Development lifecycle and iteration loop

A long-lived solo project that used its Reddit debut as a concentrated feedback round:

| Stage | Tooling | Focus |
| --- | --- | --- |
| Initial build | Solo development, 3.5 years ago | Core toxic-plant database, search and severity data |
| Redesign | "Fresh coat of paint" | Modernized UI that prompted the public launch |
| Community iteration | Reddit feedback, implemented within days | Location filtering by continent/country, common + scientific names index, safe-plants gallery with iNaturalist photos |
| Data curation | Verified open sources (ASPCA, iNaturalist) | Non-AI dataset with a public attributions page; ongoing accuracy scrub |

## Metrics and monetization

* **Monetization**: None visible — completely free, no ads, no account required.
* **Openness**: Open API plus open data with all sources listed on the attributions page.
* **Traction**: Shared on r/InternetIsBeautiful to gauge interest; the author implemented most community suggestions in two edit rounds and is enriching the dataset with new reputable sources.

## Community reception and key debates

The thread landed well, and more unusually, the feedback loop closed almost immediately:

* **Suggestions became features**: Location filtering by continent and country, an expanded common + scientific names index, and a safe-plants gallery with reference photos from iNaturalist were all shipped after the launch thread.
* **Data provenance as trust**: The author's confirmation that all data is non-AI generated and curated from verified sources (ASPCA, iNaturalist) resonated with a community wary of content-farm answers.
* **Localization demand**: Localized common names were identified as the next major need — the roadmap now includes multi-language support.
