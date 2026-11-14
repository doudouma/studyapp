# 100mini Hosting — Chrome Extension

> Ship AI-generated HTML pages in one click. No server, no CLI, no sign-up.

## Overview

100mini Hosting is the fastest way to **share AI-generated HTML pages** — from ChatGPT, Cursor, Claude, Gemini, or any AI tool. Paste the code or drag a file, and get a public URL in seconds. No server, no CLI, no sign-up required.

Think of it as **instant hosting for AI output**: your AI writes the HTML, 100mini hosts it.

## Key Features

| Feature | Detail |
|---------|--------|
| **AI-ready** | Paste AI-generated HTML directly — ChatGPT, Cursor, Claude, Gemini |
| **One-click upload** | Paste HTML or drag `.html` / `.zip` files |
| **Anonymous mode** | No login needed — upload and share instantly |
| **7d auto-destroy** | Anonymous pages expire after 7 days, auto-cleaned |
| **Expiry & burn** | Signed in: set an expiry (1h/1d/7d/30d/custom), cap views (1/3/5/10/∞), or make a one-time burn-after-reading link — free |
| **Permanent storage** | Sign in to keep pages forever |
| **Share to Square** | Publish to the 100mini learning community |
| **Category & tags** | Organize pages by subject (Math, English, Science, etc.) |
| **5 MB limit** | Supports single HTML files and ZIP archives |

## How It Works

1. **Generate** — Ask any AI (ChatGPT, Cursor, Claude, Gemini) to create an HTML page
2. **Copy** the code into the 100mini extension popup, or drag the `.html` / `.zip` file in
3. Click **Upload & Host**
4. **Share** the link instantly — in your class group chat, on social media, or embed anywhere

## Perfect For

- **AI-generated learning tools** — flashcards, quizzes, study games, interactive diagrams
- **Prototyping** — share AI-generated UI mockups and interactive prototypes
- **Classroom materials** — teachers: generate interactive exercises with AI and share with students
- **Code sharing** — demos, playgrounds, single-page tools
- **Social content** — create interactive posts, landing pages, and micro-sites with AI

## Permissions

Keep this list in sync with `manifest.json` — Chrome Web Store review rejects any permission that isn't actually used (violation code "Purple Potassium").

The extension declares **no** optional permissions and **no** host access beyond its own API. Everything happens in the popup.

| Declared | Used by | Why it's required |
|---|---|---|
| `host_permissions: https://100mini.com/*` | `popup/popup.js` (`fetch` to `/api/me` and `/api/upload`) | Sign-in check and upload. The server only sets CORS on `/api/auth/*`, so this host permission is what lets the popup call the rest of the API. “My Pages” opens `100mini.com/links` in a normal tab, which needs no permission |

Notes on what is intentionally **not** declared:

- `activeTab` was declared in 1.0.5 but never used, which caused the store rejection. Nothing here consumes it: `chrome.tabs.create()` needs no permission.
- `contextMenus`, `storage` and the `<all_urls>` content script were removed with the "host this page" right-click feature. Do not bring them back unless that feature returns with real code behind it.

### Local development

`popup/popup.js` hardcodes `API_BASE = 'https://100mini.com'`, and `host_permissions` only covers that origin. The server mounts CORS on `/api/auth/*` alone (`app/server.tsx`), so every other API call depends on the extension having a host permission for that origin — without it the request fails as an opaque CORS error, `checkAuth()` silently falls back to "logged out", and uploads only surface `Upload failed`.

To test against a local server, change `API_BASE` **and** temporarily add the matching host permission:

```json
"host_permissions": [
  "https://100mini.com/*",
  "http://localhost:3000/*"
]
```

Revert both before committing. Keep `localhost` entries out of the published manifest — they are unused by the shipped code and count as excessive permissions at review time.

## Links

- **Website**: https://100mini.com
- **Square**: https://100mini.com/square
- **Privacy**: https://100mini.com/privacy

---

## Promo Card

A 440×280 promotional card is available at [`promo-card.html`](./promo-card.html) — open in browser or screenshot for use in store listings, social media, or pitch decks.
