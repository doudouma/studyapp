# TanStack Start + Hono 全栈迁移 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Unify dev/prod architecture into single Hono-wrapped entry + fix SSR hydration (button grey issue)

**Architecture:** Hono as outer router, mounting existing API routes at root, falling back to TanStack Start SSR for all other routes. Fix React hydration by adding HTML document shell in `__root.tsx`.

**Tech Stack:** TanStack Start, Hono, React 19, Cloudflare Workers, Vite 7

---

### Task 1: Fix SSR — Add HTML document shell to __root.tsx

**Files:**
- Modify: `app/routes/__root.tsx`

- [ ] **Step 1: Import HeadContent and Scripts, add HTML shell**

Current `RootComponent` only renders `<Outlet />`, which causes React SSR to emit bare component content without `<html>`, `<head>`, `<body>`, client scripts, or meta tags. The page is static HTML with no hydration.

Replace the component:

```tsx
import { createRootRoute, Outlet, HeadContent, Scripts } from "@tanstack/react-router";
import "~/styles/app.css";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1.0",
      },
      {
        name: "description",
        content:
          "码上钉是一款免费的 HTML 在线托管工具。粘贴或拖拽 HTML/CSS/JS 代码，一键生成分享链接，24 小时自动销毁。",
      },
      { name: "robots", content: "index, follow" },
      { name: "theme-color", content: "#667eea" },
      { name: "color-scheme", content: "light" },
      { property: "og:type", content: "website" },
      { property: "og:title", content: "码上钉 - 免费 HTML 托管与分享工具" },
      {
        property: "og:description",
        content: "粘贴或拖拽 HTML/CSS/JS 代码，一键生成分享链接，24 小时自动销毁。",
      },
      { name: "twitter:card", content: "summary" },
      {
        name: "twitter:title",
        content: "码上钉 - 免费 HTML 托管与分享工具",
      },
      {
        name: "twitter:description",
        content: "粘贴或拖拽 HTML/CSS/JS 代码，一键生成分享链接，24 小时自动销毁。",
      },
    ],
    links: [
      { rel: "canonical", href: "https://studypage.app/" },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <html lang="zh-CN">
      <head>
        <HeadContent />
      </head>
      <body>
        <Outlet />
        <Scripts />
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Kill leftover dev servers and test SSR output**

```bash
# Kill any leftover processes
lsof -ti :3000 -ti :5173 -ti :5174 -ti :5175 2>/dev/null | xargs kill 2>/dev/null
# Start dev server
npm run dev
```

Wait for both frontend and API servers to start, then:

```bash
# Verify SSR output includes HTML document shell
curl -s http://localhost:5173 | head -5
```

Expected: output starts with `<!DOCTYPE html>` or `<html lang="zh-CN">`

- [ ] **Step 3: Verify hydration — check for script tags**

```bash
# Check that client scripts are present
curl -s http://localhost:5173 | grep -c '<script'
```

Expected: at least 1 `<script>` tag (TanStack Start hydration scripts)

- [ ] **Step 4: Test upload flow end-to-end**

```bash
# Direct API test (same origin, no proxy needed)
curl -s -X POST http://localhost:5173/api/upload -F "content=<h1>test</h1>"
```

Expected: `{"url":"/p/xxx","expiresAt":"..."}` response with 200

Then:
```bash
# Verify the page renders
curl -s http://localhost:5173/p/[id from above] | grep -c "安全提示"
```

Expected: 1 (the security banner is injected)

- [ ] **Step 5: Commit**

```bash
git add app/routes/__root.tsx
git commit -m "fix: add SSR document shell to enable React hydration"
```

---

### Task 2: Unify server — Wrap Hono as outer router in app/server.tsx

**Files:**
- Modify: `app/server.tsx`

- [ ] **Step 1: Replace manual URL routing with Hono outer router**

Current code manually checks `url.pathname.startsWith("/api/")` to decide whether to route to Hono or Start SSR. Replace with a Hono app that mounts the API and falls back to SSR.

New `app/server.tsx`:

```tsx
import { createStartHandler, defaultStreamHandler } from "@tanstack/react-start/server";
import api from "~/../server/api";
import { Hono } from "hono";

const startHandler = createStartHandler(defaultStreamHandler);

const app = new Hono();

// Mount all existing API routes (they define their own /api/*, /p/*, /robots.txt paths)
app.route("/", api);

// All other routes go to TanStack Start SSR
app.all("*", async (c) => {
  return startHandler(c.req.raw);
});

export default app;
```

- [ ] **Step 2: Kill dev servers, restart, and verify all routes work**

```bash
lsof -ti :3000 -ti :5173 -ti :5174 -ti :5175 2>/dev/null | xargs kill 2>/dev/null
# Start both servers (still need two processes for now, proxy will be removed in next task)
npm run dev
```

Verify each route:

```bash
# Home page loads with SSR
curl -s http://localhost:5173 | head -3

# API upload works  
curl -s -X POST http://localhost:5173/api/upload -F "content=<h1>test</h1>"

# Robots.txt works
curl -s http://localhost:5173/robots.txt
```

All three should return 200.

- [ ] **Step 3: Commit**

```bash
git add app/server.tsx
git commit -m "refactor: wrap Hono as outer router in app/server.tsx"
```

---

### Task 3: Remove dev proxy and simplify dev scripts

**Files:**
- Modify: `app.config.ts`
- Modify: `package.json`
- Delete: `server/dev.ts`

- [ ] **Step 1: Remove proxy from app.config.ts**

Remove the `server.proxy` block — Hono API now runs in-process:

```tsx
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "app"),
    },
  },
  plugins: [
    tanstackStart({
      srcDirectory: "app",
    }),
    tailwindcss(),
    react(),
  ],
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
```

- [ ] **Step 2: Simplify package.json scripts and remove unused deps**

```json
{
  "scripts": {
    "dev": "vite dev --config app.config.ts",
    "build": "vite build --config app.config.ts",
    "deploy": "npm run build && npx wrangler deploy",
    "preview": "vite preview --config app.config.ts",
    "cf:preview": "npx wrangler dev"
  },
  "dependencies": {
    "@aws-sdk/client-s3": "^3.800.0",
    "@base-ui/react": "^1.5.0",
    "@fontsource-variable/geist": "^5.2.9",
    "@radix-ui/react-slot": "^1.2.4",
    "@tailwindcss/vite": "^4.3.0",
    "@tanstack/react-router": "^1.170.8",
    "@tanstack/react-start": "^1.168.14",
    "autoprefixer": "^10.5.0",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "fflate": "^0.8.3",
    "hono": "^4.12.23",
    "lucide-react": "^1.17.0",
    "nanoid": "^5.1.11",
    "postcss": "^8.5.15",
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "shadcn": "^4.8.3",
    "tailwind-merge": "^3.6.0",
    "tailwindcss": "^4.3.0",
    "tailwindcss-animate": "^1.0.7",
    "tw-animate-css": "^1.4.0"
  },
  "devDependencies": {
    "@cloudflare/workers-types": "^4.20260531.1",
    "@tanstack/start-plugin-core": "^1.168.0",
    "@types/node": "^25.9.1",
    "@types/react": "^19.1.0",
    "@types/react-dom": "^19.1.0",
    "@vitejs/plugin-react": "^4.7.0",
    "typescript": "^5.8.0",
    "vite": "^7.3.3",
    "wrangler": "^4.95.0"
  }
}
```

Removed deps:
- `@hono/node-server` (no longer needed — Hono runs in Nitro/Vinxi)
- `concurrently` (no longer needed — single dev command)
- `tsx` (no longer needed — no standalone API server)

- [ ] **Step 3: Delete server/dev.ts**

```bash
rm server/dev.ts
```

- [ ] **Step 4: Full end-to-end test**

```bash
# Clean install (remove unused deps from lockfile)
npm prune

# Kill any running servers
lsof -ti :3000 -ti :5173 -ti :5174 -ti :5175 2>/dev/null | xargs kill 2>/dev/null

# Start dev server (single process now)
npm run dev
```

Wait for dev server to start, then:

```bash
# 1. Page loads with full HTML shell
curl -s http://localhost:5173 | head -3

# 2. API upload works
UPLOAD_RESULT=$(curl -s -X POST http://localhost:5173/api/upload -F "content=<h1>hello</h1>")
echo "$UPLOAD_RESULT"

# 3. Extracted page ID and verify
PAGE_ID=$(echo "$UPLOAD_RESULT" | grep -oP '"/p/\K[^"]+')
curl -s "http://localhost:5173/p/$PAGE_ID" | grep -c "hello"

# 4. Robots.txt
curl -s http://localhost:5173/robots.txt | grep -c "studypage"
```

All checks should pass.

- [ ] **Step 5: Run build to verify production build still works**

```bash
npm run build
```

Expected: Build succeeds with no errors, `dist/server/server.js` and `dist/client/` are generated.

- [ ] **Step 6: Commit**

```bash
git add app.config.ts package.json
git rm server/dev.ts
git commit -m "refactor: remove dev proxy, simplify to single dev command"
```

---

### Task 4: Final verification

**Files:**
- None (verification only)

- [ ] **Step 1: Verify commit history and file state**

```bash
git status
git log --oneline -5
```

Expected: Clean working tree, 3 commits (SSR shell fix, Hono wrapper, proxy removal)

- [ ] **Step 2: Full manual test checklist**

```bash
# Kill any running servers
lsof -ti :3000 -ti :5173 -ti :5174 -ti :5175 2>/dev/null | xargs kill 2>/dev/null

# Fresh start
npm run dev &
sleep 8

# Test all endpoints
echo "=== Homepage ==="
curl -s -o /dev/null -w "%{http_code}" http://localhost:5173
echo ""

echo "=== Upload ==="
UPLOAD=$(curl -s -X POST http://localhost:5173/api/upload -F "content=<h1>test</h1>")
echo "$UPLOAD"
PAGE_ID=$(echo "$UPLOAD" | grep -oP '"/p/\K[^"]+')

echo "=== Page render ==="
curl -s -o /dev/null -w "%{http_code}" "http://localhost:5173/p/$PAGE_ID"
echo ""

echo "=== Robots.txt ==="
curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/robots.txt
echo ""
```

All endpoints should return 200.

- [ ] **Step 3: Build verification**

```bash
npm run build
echo "Build exit code: $?"
ls -la dist/server/ dist/client/
```

Expected: Build succeeds, dist directories with content exist.
