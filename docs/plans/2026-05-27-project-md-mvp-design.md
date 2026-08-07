# 码上钉 (StudyPage) MVP — Design Document

**Date**: 2026-05-27
**Status**: Approved
**Scope**: Phase 1 MVP — Upload + Render only

## 1. Overview

A lightweight static HTML hosting tool for education. Users paste or drag-drop HTML code, get a shareable short link that renders the page with a security banner. Pages auto-expire after 7 days.

**Tech Stack**: TanStack Start (React) + Hono + Vercel + Cloudflare R2

## 2. Architecture

```
User Browser                    Vercel (TanStack Start + Hono)          Cloudflare R2
     |                                  |                                    |
     |-- GET / (home page) -----------> |                                    |
     |<-- Render form UI (SSR/CSR) ---- |                                    |
     |                                  |                                    |
     |-- POST /api/upload ------------> |                                    |
     |   (HTML content + filename)      |-- PUT object (id.html) ----------> |
     |                                  |   with 7d lifecycle rule          |
     |<-- { url: "/p/abc123" } -------- |                                    |
     |                                  |                                    |
     |-- GET /p/abc13 ----------------> |                                    |
     |                                  |-- GET object (abc123.html) ------> |
     |                                  |<-- raw HTML bytes ---------------- |
     |<-- HTML + security banner ------ |  (inject banner, set CSP header)   |
```

**Key decisions:**
- No database in MVP — R2 object keys serve as the ID system
- R2 lifecycle rule handles 7d auto-deletion (zero maintenance)
- Hono handles upload + serve; TanStack Start handles the home page UI
- `nanoid(7)` generates short random IDs

## 3. API Design

### `POST /api/upload`

**Request** (multipart/form-data):
- `content`: string (HTML code from paste mode)
- `file`: File (.html or .zip from drag-drop mode)
- `filename`: string (optional display name)

**Response**:
```json
{
  "url": "/p/a8xk3m",
  "expiresAt": "2026-05-28T14:00:00Z"
}
```

**Logic**:
1. Accept either raw HTML string or file upload (multipart)
2. Validate total size ≤ 5MB
3. Generate ID: `nanoid(7)`
4. For zip: extract `index.html` using `fflate`
5. Upload to R2 as `{id}.html`
6. Return shareable URL + expiry timestamp

**Errors**:
- `413` — file too large (>5MB)
- `400` — empty content or invalid file type

### `GET /p/:id`

**Response**: raw HTML with:
1. Security banner prepended (fixed-position div)
2. CSP header: `Content-Security-Policy: form-action 'none';`

**Errors**:
- `404` — page not found or expired

## 4. Frontend UI

### Home Page (`/`)

Single page with two modes via tabs:

**Paste Mode**:
- Large `<textarea>` for HTML/CSS/JS code
- Optional filename input (defaults to "untitled")
- File size indicator (live, e.g. "1.2 MB / 5 MB")
- "发布" (Publish) button

**Drag-Drop Mode**:
- Dropzone accepting `.html` and `.zip` files
- Shows filename + size after drop
- Same publish button

**Shared States**:
- Loading: spinner on publish button
- Success: shareable URL with copy button
- Error: toast for validation failures

### Render Page (`/p/:id`)

- Handled by Hono (not a TanStack route)
- Returns raw HTML from R2 with security banner prepended
- No surrounding UI chrome — standalone page

### Security Banner

```html
<div style="position:fixed;top:0;left:0;right:0;z-index:99999;
  background:rgba(255,200,0,0.95);color:#333;padding:8px 16px;
  font-size:13px;text-align:center;font-family:system-ui;">
  ⚠️ 安全提示：本页面由用户临时托管，请勿输入密码或任何敏感信息。
</div>
```

## 5. Project Structure

```
studyapp/
├── app/
│   ├── routes/
│   │   ├── __root.tsx
│   │   └── index.tsx
│   ├── components/
│   │   ├── UploadForm.tsx
│   │   ├── DropZone.tsx
│   │   └── SuccessCard.tsx
│   └── styles/
│       └── app.css
├── server/
│   ├── api.ts
│   └── r2.ts
├── public/
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## 6. Deployment

- **Platform**: Vercel (TanStack Start has a Vercel adapter)
- **Environment variables**: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`
- **R2 bucket**: lifecycle rule configured via Cloudflare dashboard (7d object expiry)
- **Zip handling**: `fflate` library for extracting index.html from zip files

## 7. Error Handling

| Scenario | Response |
|----------|----------|
| Upload > 5MB | `413 Payload Too Large` + user-friendly message |
| Invalid file type | Client-side rejection before upload |
| R2 errors | `500` with generic message, log details server-side |
| Missing/expired ID | `404` with "page expired or not found" page |
