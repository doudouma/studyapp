---
slug: forge-fighter
name: fighter
summary: A 32 KB pixel-art fighter jet with no 3D engine and no polygons — stacked sprites, three cameras, and a Remix button.
category: experiment
tags: [Sprite stacking, Pixel art, Fable 5.2, Forge, Browser game, Remixable]
publishedAt: 2026-11-17
updatedAt: 2026-11-17
author: Dash (@creativedash)
externalUrl: https://remix.ui8.ai/fly
facts:
  - key: code
    value: 32 KB
    highlight: true
  - key: rendering
    value: Sprite stacking · 2D canvas, no polygons
  - key: model
    value: Fable 5.2 (reported)
  - key: assets
    value: 32 files · 3.18 MB of art and audio
  - key: cameras
    value: Overhead · chase · cockpit (Space)
  - key: weapons
    value: Cannon (right-click) · missiles (M) · enemy jets
  - key: made with
    value: Forge by UI8 · public, remixable
  - key: reception
    value: 1.9M views · 26K likes · 553 replies
  - key: author
    value: Dash — builder and designer at UI8
sources:
  - title: Dash on X — "No 3D engine, no polygons, 32 KB of code."
    url: https://x.com/creativedash/status/2122000830895386680
    publisher: X
  - title: fighter · Forge — playable fragment and control panel
    url: https://forge.ui8.ai/share/frag_1eb8944c-57b1-42ca-a909-5c2d7e517c24
    publisher: Forge
  - title: Pavian on X — the Korean post that pushed it to 1.9M views
    url: https://x.com/meta_pavy/status/2122241297482408234
    publisher: X
  - title: Gorden Sun on X — "Fable 5.2 did it almost in one shot"
    url: https://x.com/Gorden_Sun/status/2122249419001336235
    publisher: X
  - title: bdvd on X — "It needs mobile controls, can't change the view"
    url: https://x.com/bdvd_25/status/2122020695269843042
    publisher: X
  - title: Pepehu Kekbar on X — turned the demo into a Grok-built roguelite
    url: https://x.com/PKekbar/status/2122171913040785684
    publisher: X
  - title: Ayzek on X — "Did you publish the code openly?"
    url: https://x.com/ayzekdiolar/status/2122033714058432826
    publisher: X
  - title: Mimicry on X — "Isn't this obviously 3D?"
    url: https://x.com/mimicry_ryu/status/2122377578149503249
    publisher: X
  - title: Creators Toolbox — Forge demo writeup
    url: https://creatorstoolbox.com/@scout/post/n_3km3ykmt6b8m4
    publisher: Creators Toolbox
cover:
  src: /showcase/forge-fighter.jpg
---

## The whole pitch is one sentence

Dash's launch post is a link and a line: "No 3D engine, no polygons, 32 KB of code." No thread, no build log, no benchmark. The link opens on a fighter jet skimming a chain of pixel islands, and within a day and a half the post had passed 1.9 million views and 26,000 likes. The 553 replies read like a room arguing about whether the video is real.

It is real, and it is playable. The Forge share page runs the demo in the browser, next to a control panel with ten groups of settings. The author's own description is short: "Pixel-art fighter jet built by sprite stacking, over stacked islands. Space cycles overhead, chase and cockpit views; click rolls, hold fires the thrusters; fly from the wavetops to high altitude."

## What you actually fly

The pointer steers. Click rolls the jet, holding the button lights the thrusters, and Space cuts between overhead, chase and cockpit. Right-click fires the cannon, M launches missiles, and enemy jets stay in the frame so you can lock on. Dive into the ground and the plane crashes; the camera follows the pilot out instead of fading to a menu.

That last detail is why the demo reads as a small game rather than a shader test. The panel exposes the rest: crash on or off, cannon and missile reload timers, up to five enemy jets, dodge slow motion, wingmen, a world seed, time of day, cloud density, island coverage, jet shadow, wake and spray at sea level, wingtip trails, thruster flame style, explosion shake, film grain, and body, accent and canopy colours. A "stack-up intro" assembles the jet slice by slice before the first take-off. Thirty sound files cover the engine, wind, cannon, missiles, ejection, splash and radio chatter.

## Depth without polygons

Sprite stacking is old and stubbornly effective. Instead of a mesh, the jet is a stack of flat pixel-art slices, each one a frame from a four-view spritesheet. Rotate the stack and the object turns; move the camera and the slices slide past each other just enough to sell the volume. There is no polygon to transform and no 3D engine to load. The main scene draws into a 2D canvas.

The islands and clouds are stacks too, which is where the argument starts. Pavian, the Korean researcher whose post carried the demo to a much larger audience, called it "that early-90s Super Famicom feeling, built dot by dot" and said AI had raised the craft to a level "the manual labour was too heavy for anyone to attempt." Others looked at the clouds and called the bluff the other way: stacked slices are voxels, whatever the tweet says.

## What people said

The replies are more useful than the like count.

- **@bdvd_25** (219 likes): "It needs mobile controls, can't change the view!" The most-liked reply is a bug report, and a fair one. The control panel has a touch-button setting, but changing views still assumes a keyboard.
- **@PKekbar** (77 likes) did not wait for an update. He fed the demo to Grok, added guns, a skill tree, light-gate weapon pickups and a roguelite loop between levels, then published a playable link. The fighter became a genre in an afternoon.
- **@ayzekdiolar** (Turkish, 70 likes): "Did you publish the code openly? It turned out really well." The polite version of the question half the quote tweets were asking.
- **@mimicry_ryu** (Chinese): "Isn't this obviously 3D? Look at the clouds and the terrain — they're all voxels." He is right about the pixels and wrong about the engine, which is the most interesting place to be right.
- **@Gorden_Sun** (Chinese): "Fable 5.2 did it almost in one shot. The result is too good — peers, figure something out and catch up." This is where the model claim comes from: a third-party demo watcher, not Dash.
- **@meta_pavy** (Korean, 2.2K likes): "No 3D, no polygons, a 32 KB flight simulator stacked purely from stripes... AI can lift this to work people would not do by hand." He had to post the playable link underneath because readers assumed it was a render. That assumption is the review.

## Where the one-liner stops

- **32 KB is the code, not the download.** Forge's public record lists 32 assets at 3.18 MB, including two large spritesheets and thirty audio files. The scene loads fast; it is not a 32 KB page.
- **It is public, not open source.** The preview serves the app's modules and Remix copies the fragment into a Forge workspace, but there is no repository or licence attached. Ayzek's question is still unanswered in the thread.
- **Mobile is the weak spot.** Touch buttons are a setting, yet the top reply is a phone user who could not change the view. The demo was built keyboard-first and it shows.
- **"No 3D" is an argument about the engine, not about what you see.** The stacks are voxels in all but name; the demo wins the technical point and loses the perceptual one.

## Ten minutes, then hit Remix

> **Worth ten minutes**
> Open it on a laptop, switch to cockpit view, and skim the water until the wake starts. The trick is decades old; the finish is what changed. Then press Remix — the fragment is public, and Forge's free plan covers three projects — if you want to see how much of the "one prompt" story survives contact with the control panel.

The jet is not really the story. The story is that a 32 KB demo is now finished enough, down to the ejection close-up and the radio chatter, that 26,000 people hit like before they asked which engine it uses.
