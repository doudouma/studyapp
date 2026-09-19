---
slug: stfu-app
name: S.T.F.U
summary: An open-source Windows tray app that listens for late-night screams and interrupts loud gamers to keep households quiet.
category: tools
tags: [Audio Monitoring, Desktop App, Open Source, Parental Control, Built With Claude]
publishedAt: 2026-09-19
updatedAt: 2026-09-19
author: u/omricn
externalUrl: https://www.reddit.com/r/ClaudeCode/comments/1vsk86i/my_son_screams_while_gaming_at_midnight_im_a/
facts:
  - key: author
    value: u/omricn
  - key: platforms
    value: Windows
  - key: version
    value: v1.1.0
    highlight: true
  - key: price
    value: Free (Open Source)
  - key: offline
    value: 100% Local (No Audio Stored)
sources:
  - title: r/ClaudeCode — My son screams while gaming at midnight. I'm a developer, so I did what developers do - I over-engineered a solution
    url: https://www.reddit.com/r/ClaudeCode/comments/1vsk86i/my_son_screams_while_gaming_at_midnight_im_a/
    publisher: Reddit
  - title: S.T.F.U — Free and open source (GitHub releases)
    url: https://github.com/omricn/stfu/releases/latest
    publisher: GitHub
cover:
  src: /showcase/stfu-app.jpg
---

## What it is

[S.T.F.U](https://github.com/omricn/stfu/releases/latest?utm_source=gemini) (Sound Trigger Focus Utility) is an open-source Windows system tray utility designed to curb involuntary midnight screaming from headphone-wearing gamers. Created by developer u/omricn using Claude Code, the app continuously monitors microphone input locally, differentiates normal conversational speech from full-volume shouting via custom calibration, and enforces immediate desktop interruptions whenever volume thresholds are breached.

## Core value proposition

The tool replaces verbal nagging or blunt network cutoffs with an immediate, deterministic, and mutually agreed-upon feedback loop:

- **Adaptive 3-step calibration**: On first launch, the app prompts the user to stay quiet, speak normally, and shout, establishing an accurate baseline dynamic range.
- **Escalating tiered penalties**: The first yell minimizes the active game, triggers a sound effect, and displays an un-spammable full-screen popup with a moving close button requiring 4 clicks; subsequent offenses immediately dump the user to the desktop for 10 seconds.
- **PIN-protected settings and auditing**: Threshold adjustments, scheduling, and power toggles require a parent-configured PIN, backed by an incident chart tracking every trigger event.
- **Privacy-first local processing**: Computes RMS loudness every 20ms and discards audio buffers instantly without recording, storing, or transmitting telemetry.
- **Scheduled off-hours**: Added in v1.1.0, allowing parents to define specific active windows so normal daytime play remains unhindered.

## What it can replace

| Target software | Feasibility | Verdict & use-case context |
| --- | --- | --- |
| Commercial parental control suites | Moderate | Better for targeted noise enforcement without intrusive spying or subscription costs. |
| Router-level packet drops / Wi-Fi cutoffs | High | Far more surgical; prevents lag-induced rage while keeping internet access intact for quiet tasks. |
| Noise-gate plugins / Virtual audio cables | Low | Virtual audio cables simply clip or mute Discord outgoing voice rather than punishing the physical shouting itself. |
| Hardware sound level meters | Partial | Eliminates physical wall-mounted alert lights in favor of direct OS-level gameplay interruption. |

## Current realities and limitations

- **Circumvention vulnerabilities**: As pointed out by community members, users can mute hardware mic switches before yelling or game calibration by artificially blowing into the mic.
- **OS exclusivity**: Currently restricted to Windows desktop environments; does not support gaming consoles like PlayStation or Xbox.
- **Behavioral symptom vs. root cause**: The developer acknowledges it teaches players to shout more quietly rather than addressing broader late-night emotional self-regulation.
- **Disruption to cooperative team sessions**: Minimizing games or booting players to the desktop in competitive multiplayer titles (e.g., ranked matches) penalizes teammates as well.

## Verdict

> **Primary recommendation**
> [S.T.F.U](https://github.com/omricn/stfu/releases/latest?utm_source=gemini) is an ingenious, delightfully petty utility that works best when treated as an upfront "social contract" rather than stealth spyware. If your household suffers from headphone-induced midnight outbursts during vacation gaming marathons, it delivers instant Pavlovian feedback with zero data privacy compromises.

## Development lifecycle and iteration loop

The developer built the utility with Claude Code to rapidly turn an annoying household friction point into a shippable utility within an evening. Community feedback immediately drove the release cadence.

| Stage | Model / Tool used | Focus |
| --- | --- | --- |
| Initial architecture & UI | Claude Code | Windows tray harness, 20ms audio loudness polling, dynamic button placement |
| Release v1.0.0 | Claude Code | PIN-locked control panel, trigger history visualizer, calibration wizard |
| Patch v1.1.0 | Claude Code | Integration of scheduled active/passive monitoring timeframes based on Reddit suggestions |

## Metrics and monetization

- **Pricing**: 100% free and open-source under a public GitHub repository.
- **Adoption**: Garnered over 3,600 upvotes and 700+ comments within weeks of publication on Reddit.
- **Monetization**: None; distributed purely as a community utility and developer showcase.

## Community reception and key debates

The post sparked intense debates across parenting philosophy and AI writing styles:

- **Engineering vs. traditional parenting**: Commenters split sharply between praising the solution as "heroic, compassionate parenting through natural consequences" versus criticizing it as a "digital shock collar" for parents hesitant to confiscate consoles.
- **Alternative troll tactics**: Veteran sysadmins and parents shared legacy retaliation tactics, including configuring access points to randomly drop 30% of console packets or revoking router leases at midnight.
- **Detection of AI writing tropes**: Multiple commenters noted the post's reliance on quintessential Claude stylistic markers—most notably the phrase "load-bearing," sparking a meta-discussion on whether developers now naturally write in the cadence of the LLMs they collaborate with.
