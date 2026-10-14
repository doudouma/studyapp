#!/usr/bin/env node

/**
 * 100mini Upload CLI
 *
 * Publish HTML/ZIP pages to 100mini as shareable links.
 * Two modes:
 *   - Anonymous: no token, 5 uploads/day/IP, 7-day expiry
 *   - Authenticated (--token / MINI_TOKEN): permanent pages by default, no daily cap,
 *     and optional lifetime control (--expire / --max-views / --one-time)
 *
 * Zero dependencies. Requires Node.js >= 18 (fetch, FormData, Blob).
 */

import { readFileSync, statSync } from "node:fs";
import { basename } from "node:path";

// ── Defaults ────────────────────────────────────────────────────────────────

const BASE_URL_DEFAULT = "https://www.100mini.com";
const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_EXT = [".html", ".htm", ".zip"];

// Lifetime options (authenticated uploads only)
const VALID_EXPIRY = ["permanent", "1h", "1d", "7d", "30d", "custom"];
const MIN_EXPIRY_MS = 60 * 1000;                 // 1 minute
const MAX_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000;  // 30 days

/** Parse a duration like "45m", "12h", "5d" into milliseconds; null if invalid. */
function parseDurationMs(str) {
  const m = /^(\d+)\s*(m|h|d)$/i.exec(String(str).trim());
  if (!m) return null;
  const n = Number(m[1]);
  const unit = m[2].toLowerCase();
  const mult = unit === "m" ? 60_000 : unit === "h" ? 3_600_000 : 86_400_000;
  return n * mult;
}

// ── Argument parsing ────────────────────────────────────────────────────────

function parseArgs(argv) {
  const args = argv.slice(2);
  const opts = {};
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "-h" || a === "--help") {
      opts.help = true;
    } else if (a === "--quiet") {
      opts.quiet = true;
    } else if (a === "--anonymous") {
      opts.anonymous = true;
    } else if (a === "--one-time") {
      opts["one-time"] = true;
    } else if (a.startsWith("--") && i + 1 < args.length) {
      const key = a.slice(2);
      opts[key] = args[++i];
    } else if (!a.startsWith("--")) {
      // positional — treat as file if no --file yet
      if (!opts.file) opts.file = a;
    }
  }
  return opts;
}

function printHelp() {
  const usage = `
Usage: node upload.mjs [options]

Modes:
  (default)       Anonymous upload — 5/day/IP, 7-day expiry
  --token <key>   Authenticated upload — permanent, no daily cap
  --anonymous     Force anonymous even if MINI_TOKEN env is set

Input (exactly one required):
  --file <path>   .html / .htm / .zip file
  --content <str> HTML string
  (stdin)         pipe HTML via stdin

Options:
  --title <str>   page title (required for authenticated uploads)
  --tags <a,b>    comma-separated tags
  --category <s>  category (default: general)
  --base-url <u>  upload target (default: https://www.100mini.com)
  --quiet         print only the final URL
  -h, --help      show this help

Lifetime options (authenticated uploads only; free, no points):
  --expire <p>         permanent | 1h | 1d | 7d | 30d | custom (default: permanent)
  --expire-custom <d>  duration for --expire custom: <n>m/h/d (e.g. 45m, 12h, 5d; max 30d)
  --max-views <n>      max opens before burning: a positive integer or inf (default: inf)
  --one-time           burn-after-reading link (shorthand for --max-views 1)

Environment:
  MINI_TOKEN      default API key (overridden by --token; ignored with --anonymous)

Examples:
  node upload.mjs --file page.html
  node upload.mjs --content "<h1>hi</h1>" --quiet
  node upload.mjs --token 100m_xxxx --file app.zip --title "My App"
  node upload.mjs --token 100m_xxxx --file quiz.html --title "Quiz" --one-time
  node upload.mjs --token 100m_xxxx --file notes.html --title "Notes" --expire 1d
  node upload.mjs --token 100m_xxxx --file draft.html --title "Draft" --expire custom --expire-custom 12h
  cat page.html | node upload.mjs --anonymous
`.trim();
  console.error(usage);
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function err(code, msg) {
  console.error(msg);
  process.exit(code);
}

function hasStdin() {
  return !process.stdin.isTTY;
}

async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf-8");
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const opts = parseArgs(process.argv);

  if (opts.help) {
    printHelp();
    process.exit(0);
  }

  // Resolve token: --token > MINI_TOKEN env > none
  const token =
    opts.anonymous
      ? null
      : opts.token || process.env.MINI_TOKEN || null;

  // Resolve lifetime options (expiry / max views / one-time)
  let expiryPreset; // undefined = not requested, else preset string
  let expiryCustomMs = null;

  if (opts["one-time"] && opts["max-views"] !== undefined && Number(opts["max-views"]) !== 1) {
    err(2, `--one-time conflicts with --max-views ${opts["max-views"]} (one-time means max views = 1).`);
  }

  let maxViews; // undefined = not requested, null = ∞, number = limit
  if (opts["one-time"]) {
    maxViews = 1;
  } else if (opts["max-views"] !== undefined) {
    const raw = String(opts["max-views"]).trim().toLowerCase();
    if (["inf", "infinity", "∞", "unlimited"].includes(raw)) {
      maxViews = null;
    } else {
      const n = Number(raw);
      if (!Number.isFinite(n) || n < 1) {
        err(2, `Invalid --max-views "${opts["max-views"]}". Use a positive integer or "inf".`);
      }
      maxViews = Math.floor(n);
    }
  }

  if (opts.expire !== undefined) {
    const p = String(opts.expire).trim();
    if (!VALID_EXPIRY.includes(p)) {
      err(2, `Invalid --expire "${opts.expire}". Use one of: ${VALID_EXPIRY.join(", ")}.`);
    }
    expiryPreset = p;
    if (p === "custom") {
      if (opts["expire-custom"] === undefined) {
        err(2, "--expire custom requires --expire-custom <duration> (e.g. 45m, 12h, 5d).");
      }
      const ms = parseDurationMs(opts["expire-custom"]);
      if (ms === null || ms < MIN_EXPIRY_MS || ms > MAX_EXPIRY_MS) {
        err(2, `Invalid --expire-custom "${opts["expire-custom"]}". Use <n>m/h/d within 1 minute–30 days (e.g. 45m, 12h, 5d).`);
      }
      expiryCustomMs = ms;
    }
  } else if (opts["expire-custom"] !== undefined) {
    err(2, "--expire-custom requires --expire custom.");
  }

  const usesLifetimeFlags = expiryPreset !== undefined || maxViews !== undefined;
  if (!token && usesLifetimeFlags) {
    process.stderr.write(
      "Note: --expire / --max-views / --one-time apply to authenticated uploads only; ignored in anonymous mode.\n"
    );
  }

  // Resolve input
  let inputMode = null; // "file" | "content" | "stdin"
  let fileBytes = null;
  let filename = null;
  let contentStr = null;

  if (opts.file) {
    inputMode = "file";
    const filePath = opts.file;
    try {
      const st = statSync(filePath);
      if (!st.isFile()) err(2, `Not a file: ${filePath}`);
      if (st.size > MAX_SIZE) err(2, `File too large (${(st.size / 1024 / 1024).toFixed(1)}MB > 5MB limit)`);
      const ext = filePath.toLowerCase().match(/\.(\w+)$/)?.[0];
      if (!ext || !ALLOWED_EXT.includes(ext)) {
        err(2, `Unsupported file type "${ext}". Allowed: ${ALLOWED_EXT.join(", ")}`);
      }
      filename = basename(filePath);
      fileBytes = readFileSync(filePath);
    } catch (e) {
      err(2, `Cannot read file: ${e.message}`);
    }
  } else if (opts.content) {
    inputMode = "content";
    contentStr = opts.content;
    const size = Buffer.byteLength(contentStr, "utf-8");
    if (size > MAX_SIZE) err(2, `Content too large (${(size / 1024 / 1024).toFixed(1)}MB > 5MB limit)`);
  } else if (hasStdin()) {
    inputMode = "stdin";
    contentStr = await readStdin();
    if (!contentStr.trim()) err(2, "No input from stdin");
    const size = Buffer.byteLength(contentStr, "utf-8");
    if (size > MAX_SIZE) err(2, `Content too large (${(size / 1024 / 1024).toFixed(1)}MB > 5MB limit)`);
  } else {
    err(2, "No input. Provide --file, --content, or pipe via stdin. Use -h for help.");
  }

  // Build FormData
  const formData = new FormData();

  if (inputMode === "file") {
    const blob = new Blob([fileBytes]);
    formData.append("file", blob, filename);
  } else {
    formData.append("content", contentStr);
  }

  if (opts.title) formData.append("title", opts.title);
  if (opts.category) formData.append("category", opts.category);
  if (opts.tags) formData.append("tags", opts.tags);

  // Lifetime options (authenticated only; server ignores them for anonymous)
  if (token && usesLifetimeFlags) {
    formData.append("expiryPreset", expiryPreset ?? "permanent");
    if (expiryPreset === "custom" && expiryCustomMs != null) {
      formData.append("expiryCustomMs", String(expiryCustomMs));
    }
    if (maxViews !== undefined) {
      formData.append("maxViews", maxViews == null ? "inf" : String(maxViews));
    }
  }

  const baseUrl = (opts["base-url"] || BASE_URL_DEFAULT).replace(/\/+$/, "");

  // Build headers
  const headers = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Upload
  let res;
  try {
    res = await fetch(`${baseUrl}/api/upload`, {
      method: "POST",
      headers,
      body: formData,
    });
  } catch (e) {
    err(1, `Network error: ${e.message}`);
  }

  let json;
  try {
    json = await res.json();
  } catch {
    err(1, `Invalid response from server (status ${res.status})`);
  }

  if (!res.ok) {
    err(1, json.error || `Upload failed (HTTP ${res.status})`);
  }

  // Output
  if (opts.quiet) {
    console.log(`${baseUrl}${json.url}`);
  } else {
    console.log(JSON.stringify(json, null, 2));
    process.stderr.write(`\nPage: ${baseUrl}${json.url}\n`);
  }
}

main();
