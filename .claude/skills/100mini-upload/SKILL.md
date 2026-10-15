---
name: 100mini-upload
description: Use when publishing, sharing, uploading, or hosting an HTML page (single-file HTML or a static site as HTML/CSS/JS or .zip) as a shareable link, or when the user asks to "post to 100mini" / "share link" / "upload to 100mini" / "publish learning page". Use to upload from the command line without a browser or login.
---

# 100mini Upload

Publish HTML pages to 100mini (https://100mini.com) as a shareable link. Two modes:
- **Anonymous**: no login, no key. 5 uploads/day/IP, 5MB, pages auto-destroy after 7 days.
- **Authenticated** (`--token`): permanent by default, no daily cap, 50MB, full metadata (title/tags/custom slug/share-to-square), subject to the same points policy as the web UI. Also supports optional lifetime control: an expiry (`--expire`), a max view count (`--max-views`), or a one-time burn-after-reading link (`--one-time`) — all free and quota-exempt.

## When to Use

- User asks to publish/share/upload an HTML page or make a shareable link for one
- You built an HTML page (learning page) and need a URL to share
- User wants to "upload to 100mini", "publish learning page", "share link", "post to 100mini"
- User wants a one-time / burn-after-reading link (`--one-time`), an expiring link (`--expire`), a view-limited link (`--max-views`), or a custom short address (`--slug`)
- Any script or automation needs temporary static hosting
- Agent needs to upload pages on behalf of a logged-in user (use `--token`)

When NOT to use: page must persist longer than 7 days or be managed (delete/edit/track views) — use authenticated mode with a token.

## Install

1. Copy the script into your project:
   ```bash
   cp <skill_dir>/scripts/upload.mjs scripts/upload.mjs
   ```
2. No dependencies. Requires Node.js ≥ 18 (uses built-in `fetch`, `FormData`, `Blob`).

## Usage

```bash
# --- Anonymous mode (default) ---
node scripts/upload.mjs --file page.html
node scripts/upload.mjs --content "<h1>hi</h1>"
cat page.html | node scripts/upload.mjs

# --- Authenticated mode (permanent pages) ---
node scripts/upload.mjs --token 100m_xxxxxxxxxxxxxxxx --file page.html
node scripts/upload.mjs --token 100m_xxxx --file app.zip --title "My App"

# --- Lifetime control (authenticated; free, no points) ---
node scripts/upload.mjs --token 100m_xxxx --file quiz.html --title "Quiz" --one-time
node scripts/upload.mjs --token 100m_xxxx --file notes.html --title "Notes" --expire 1d
node scripts/upload.mjs --token 100m_xxxx --file draft.html --title "Draft" --expire custom --expire-custom 12h
node scripts/upload.mjs --token 100m_xxxx --file demo.html --title "Demo" --max-views 5

# --- Custom address + share to Square (authenticated) ---
node scripts/upload.mjs --token 100m_xxxx --file page.html --title "Home" --slug my-home
node scripts/upload.mjs --token 100m_xxxx --file page.html --title "Home" --share-to-square

# --- Env var fallback ---
export MINI_TOKEN=100m_xxx
node scripts/upload.mjs --file page.html        # uses env token
node scripts/upload.mjs --anonymous --file page.html  # force anonymous even if env set

# --- Common ---
node scripts/upload.mjs --file page.html --quiet  # print URL only
```

### Options

| Option | Description | Default |
|---|---|---|
| `--file <path>` | `.html`/`.htm`/`.zip` file path (zip assets uploaded as a site) | — |
| `--content <html>` | HTML string | — |
| `--title <title>` | page title (required for authenticated uploads) | — |
| `--tags <a,b>` | comma-separated tags | — |
| `--category <cat>` | category | `general` |
| `--slug <s>` | custom address `/p/<slug>` (authenticated only; costs 10 points) | — |
| `--share-to-square` | share to the Learning Square (permanent + unlimited views only) | `false` |
| `--expire <preset>` | lifetime: `permanent`/`1h`/`1d`/`7d`/`30d`/`custom` (authenticated only) | `permanent` |
| `--expire-custom <dur>` | duration for `--expire custom`, e.g. `45m`/`12h`/`5d` (1 min–30 d) | — |
| `--max-views <n>` | max opens before the page burns: positive integer (≤1000) or `inf` (authenticated only) | `inf` |
| `--one-time` | burn-after-reading link (shorthand for `--max-views 1`) | `false` |
| `--base-url <url>` | upload target | `https://100mini.com` |
| `--token <key>` | API key for authenticated upload (see below) | — |
| `--anonymous` | force anonymous mode even if `MINI_TOKEN` env is set | `false` |
| `--quiet` | print only the final URL | `false` |
| `-h, --help` | show help | — |

Provide exactly one of `--file`, `--content`, or stdin.

> **Always use the apex host** `https://100mini.com`. The `www.100mini.com` host 301-redirects to the apex, and a 301 downgrades a POST to GET in `fetch`, so uploads to `www.` fail with HTTP 404. The CLI defaults to the apex; only override `--base-url` to target another deployment.

### Authenticated mode rules

- `--title` is **required** for authenticated uploads (server rejects blank titles).
- Pages are **permanent by default** (no 7-day expiry).
- No daily upload cap (anonymous limit is 5/day/IP).
- Size limit is **50MB** authenticated vs **5MB** anonymous.
- Points policy (mirrors `shared/types/pages.ts`): free permanent quota = 5 + any `linksLimitBonus`; beyond that each permanent upload costs 10 points. `--slug` costs 10 points. Content over 5MB costs 10 points per 5MB block. Members are exempt from quota but still pay size/slug fees.
- **Lifetime options are free and quota-exempt**: `--expire`, `--max-views`, and `--one-time` do not cost points and do not consume the permanent-page quota. A page with an expiry or a view limit is *not* permanent (stored as non-permanent).
- **Limited links cannot be shared to the Square**: when an expiry or `--max-views` is set, the page is excluded from the Square (the web UI hides the option; the server also enforces it). Only truly permanent, unlimited-view pages can be shared.
- **Authenticated-only flags are ignored in anonymous mode** (a note is printed to stderr).
- **`--slug`** must be lowercase letters/digits/hyphens, 3–50 chars, and not a reserved route; collisions return exit 1.
- Crawlers and link-preview/QR prefetch requests are **not** counted as views, so a one-time link isn't consumed by a messaging-app preview.

## Getting an API Token

Tokens are generated via the 100mini web UI (no CLI login):

1. Log in at https://100mini.com
2. Go to **My Pages** (`/links`)
3. Open the **API Keys** section
4. Enter a name (e.g. "cli-agent") → click **Generate**
5. Copy the key (`100m_...`) — it is shown **once only**

### Using the token

Option A — pass directly:
```bash
node scripts/upload.mjs --token 100m_xxxxxx --file page.html
```

Option B — set as env var (recommended for repeated use):
```bash
export MINI_TOKEN=100m_xxxxxx
node scripts/upload.mjs --file page.html
```

Option C — save in a `.env` file and source before running:
```bash
echo 'MINI_TOKEN=100m_xxxxxx' >> .env
source .env && node scripts/upload.mjs --file page.html
```

The token can be revoked at any time from the web UI. Once revoked, authenticated uploads fail with exit 1 and a server error message.

## Output

Success — exit 0, JSON (or URL only with `--quiet`):

```json
{
  "id": "AbC1234",
  "url": "/p/AbC1234",
  "expiresAt": null,
  "isPermanent": true,
  "title": "My Page",
  "isSharedToSquare": false,
  "previewPath": null,
  "maxViews": null,
  "isOneTime": false
}
```

- `url` uses `/p/<slug>` when `--slug` was given, otherwise `/p/<id>`.
- Authenticated mode (no lifetime flags): `expiresAt` is `null` and `isPermanent` is `true`.
- Authenticated with an expiry: `expiresAt` is a future Unix ms timestamp and `isPermanent` is `false`.
- Authenticated with `--max-views`/`--one-time`: `maxViews` is the limit (or `null` for ∞), `isOneTime` is `true` when the limit is 1. `isPermanent` is `false` because the page can burn.
- Anonymous mode: `expiresAt` is a future Unix ms timestamp and `isPermanent` is `false`.

Final shareable page: `https://100mini.com/p/<id-or-slug>` (or `--base-url`).

Failures — errors on stderr:
- exit 2: bad arguments (no input, wrong extension, oversize, bad lifetime flags)
- exit 1: upload failed (server rejection, network error, invalid/expired token)

## Common Mistakes

- **Using `www.100mini.com`**: the 301 redirect turns the POST into a GET → HTTP 404. Use the apex `https://100mini.com` (the default).
- **No input:** must pass `--file`, `--content`, or pipe stdin, otherwise exit 2.
- **ZIP needs an entry file:** the archive must contain `index.html` (or another `.html` at its root).
- **Size limit:** 5MB anonymous, 50MB authenticated (single file or unzipped total).
- **Anonymous 7-day expiry:** anonymous pages are deleted automatically; use `--token` for permanent hosting.
- **Authenticated-only flags:** `--expire`/`--max-views`/`--one-time`/`--slug`/`--share-to-square` are ignored without a token — pass `--token`.
- **Missing title:** authenticated uploads require `--title`; blank title returns exit 1 with "title is required".
- **Invalid token:** returns exit 1 with `Invalid or expired API key`; check token hasn't been revoked.
- **Points exhausted:** if a paid action (permanent over quota / slug / oversize) exceeds your points, returns exit 1 with "insufficient points"; top up via the web UI.
- **Bad lifetime flags:** an unknown `--expire` preset, `--expire custom` without `--expire-custom`, a malformed `--expire-custom` (use `<n>m/h/d`, e.g. `45m`), or `--one-time` together with `--max-views` other than 1 all exit 2 before any network call.
- **`--expire-custom` range:** must be between 1 minute and 30 days; the server also rejects out-of-range values.
- **`--slug` collisions/reserved:** reserved routes (e.g. `square`, `links`, `api`) or already-taken slugs are rejected by the server.
- **Server error messages may be in Chinese** (e.g. "仅支持 .html 或 .zip 文件", "该自定义地址已被占用", "到期时间无效", "匿名上传已达今日上限（5次/天）"); relay them to the user verbatim or paraphrase.

## Rate Limits

| Mode | Daily limit | Size | Storage | Points |
|---|---|---|---|---|
| Anonymous | 5 uploads/IP/day | 5MB | 7-day temp (`tmp/` prefix); lifetime flags ignored | — |
| Authenticated · permanent | unlimited | 50MB | permanent | quota + size + slug fees (see above) |
| Authenticated · expiring / view-limited / one-time | unlimited | 50MB | burns on expiry or last view | free (no quota; slug/size fees still apply) |

## Related

- Web pages that create these links: https://100mini.com (paste HTML) and https://100mini.com/burn-after-reading-link
- My Pages / API keys: https://100mini.com/links
