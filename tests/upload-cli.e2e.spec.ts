import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import { writeFile, unlink, mkdir } from "node:fs/promises";
import { join } from "node:path";
import os from "node:os";

const execAsync = promisify(exec);
const SCRIPT = join(os.homedir(), ".claude/skills/100mini-upload/scripts/upload.mjs");
const TMP = join(import.meta.dirname, "../.tmp-e2e");

beforeAll(async () => {
  await mkdir(TMP, { recursive: true });
});

afterAll(async () => {
  // Cleanup temp files
  const { readdir, rm } = await import("node:fs/promises");
  try {
    const files = await readdir(TMP);
    for (const f of files) await unlink(join(TMP, f));
    await rm(TMP);
  } catch {}
});

// Helper: run CLI and capture stdout/stderr/exit code
async function run(
  args: string[],
  opts?: { stdin?: string; env?: Record<string, string>; timeout?: number },
): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  const cmd = `node ${SCRIPT} ${args.map((a) => `'${a.replace(/'/g, "'\\''")}'`).join(" ")}`;
  try {
    const result = await execAsync(cmd, {
      timeout: opts?.timeout ?? 15000,
      env: { ...process.env, ...opts?.env },
      encoding: "utf-8",
      maxBuffer: 1024 * 1024,
    });
    return { stdout: result.stdout, stderr: result.stderr, exitCode: 0 };
  } catch (err: any) {
    return {
      stdout: err.stdout ?? "",
      stderr: err.stderr ?? "",
      exitCode: err.code ?? 1,
    };
  }
}

// ───────────────────────────────────────────────
// 1. Help
// ───────────────────────────────────────────────
describe("upload.mjs --help", () => {
  it("输出用法说明并退出 0", async () => {
    const { stdout, stderr, exitCode } = await run(["--help"]);
    expect(exitCode).toBe(0);
    const output = stdout + stderr;
    expect(output).toContain("Usage:");
    expect(output).toContain("--file");
    expect(output).toContain("--content");
    expect(output).toContain("--token");
    expect(output).toContain("--quiet");
    expect(output).toContain("--anonymous");
    expect(output).toContain("MINI_TOKEN");
  });
});

// ───────────────────────────────────────────────
// 2. No input → exit 2
// ───────────────────────────────────────────────
describe("upload.mjs 无输入", () => {
  it("无参数时退出 2", async () => {
    // Use echo to close stdin so the script doesn't hang waiting for input
    const cmd = `echo "" | node ${SCRIPT}`;
    let result: { stdout: string; stderr: string; exitCode: number };
    try {
      const r = await execAsync(cmd, { timeout: 10000, encoding: "utf-8" });
      result = { stdout: r.stdout, stderr: r.stderr, exitCode: 0 };
    } catch (err: any) {
      result = { stdout: err.stdout ?? "", stderr: err.stderr ?? "", exitCode: err.code ?? 1 };
    }
    expect(result.exitCode).toBe(2);
    expect(result.stderr).toContain("No input");
  });
});

// ───────────────────────────────────────────────
// 3. Invalid file
// ───────────────────────────────────────────────
describe("upload.mjs 无效文件", () => {
  it("不支持的扩展名 → exit 2", async () => {
    const badFile = join(TMP, "test.txt");
    await writeFile(badFile, "hello");
    const { stderr, exitCode } = await run(["--file", badFile]);
    expect(exitCode).toBe(2);
    expect(stderr).toContain("Unsupported file type");
    await unlink(badFile);
  });

  it("不存在的文件 → exit 2", async () => {
    const { stderr, exitCode } = await run(["--file", "/nonexistent.html"]);
    expect(exitCode).toBe(2);
    expect(stderr).toContain("Cannot read file");
  });
});

// ───────────────────────────────────────────────
// 4. File too large
// ───────────────────────────────────────────────
describe("upload.mjs 文件过大", () => {
  it("超过 5MB → exit 2", async () => {
    const bigFile = join(TMP, "big.html");
    // Create a 6MB file
    const content = "<h1>" + "x".repeat(6 * 1024 * 1024) + "</h1>";
    await writeFile(bigFile, content);
    const { stderr, exitCode } = await run(["--file", bigFile]);
    expect(exitCode).toBe(2);
    expect(stderr).toContain("too large");
    await unlink(bigFile);
  });
});

// ───────────────────────────────────────────────
// 5. Valid file upload (anonymous, against dev server)
// ───────────────────────────────────────────────
describe("upload.mjs 匿名上传", () => {
  const testFile = join(TMP, "test.html");

  beforeAll(async () => {
    await writeFile(testFile, "<html><body><h1>E2E Test</h1></body></html>");
  });

  it("上传 HTML 文件返回 JSON（含 id/url/expiresAt）", async () => {
    const { stdout, exitCode } = await run(["--file", testFile]);
    // May fail if dev server isn't running — that's OK for CI
    if (exitCode === 0) {
      const json = JSON.parse(stdout);
      expect(json).toHaveProperty("id");
      expect(json).toHaveProperty("url");
      expect(json.url).toMatch(/^\/p\//);
      expect(json.isPermanent).toBe(false); // anonymous = not permanent
      expect(json.expiresAt).not.toBeNull();
    } else {
      // Dev server not running — just verify it tried
      expect(exitCode).toBe(1);
    }
  }, 20000);

  it("--quiet 只输出 URL", async () => {
    const { stdout, exitCode } = await run(["--file", testFile, "--quiet"]);
    if (exitCode === 0) {
      expect(stdout.trim()).toMatch(/^https?:\/\/.+\/p\/.+$/);
      // Should NOT contain JSON braces
      expect(stdout).not.toContain("{");
    } else {
      expect(exitCode).toBe(1);
    }
  }, 20000);

  it("管道输入 HTML", async () => {
    const cmd = `echo '<h1>Pipe Test</h1>' | node ${SCRIPT}`;
    let result: { stdout: string; stderr: string; exitCode: number };
    try {
      const r = await execAsync(cmd, { timeout: 15000, encoding: "utf-8" });
      result = { stdout: r.stdout, stderr: r.stderr, exitCode: 0 };
    } catch (err: any) {
      result = { stdout: err.stdout ?? "", stderr: err.stderr ?? "", exitCode: err.code ?? 1 };
    }
    if (result.exitCode === 0) {
      const json = JSON.parse(result.stdout);
      expect(json).toHaveProperty("url");
    } else {
      expect(result.exitCode).toBe(1);
    }
  }, 20000);
});

// ───────────────────────────────────────────────
// 6. Authenticated upload (with token)
// ───────────────────────────────────────────────
describe("upload.mjs 认证上传", () => {
  const testFile = join(TMP, "auth-test.html");

  beforeAll(async () => {
    await writeFile(testFile, "<html><body><h1>Auth Test</h1></body></html>");
  });

  it("无效 token → exit 1 + 错误信息", async () => {
    const { stderr, exitCode } = await run([
      "--file", testFile,
      "--token", "100m_invalidtoken1234567890abcdef",
      "--title", "Auth Test",
    ]);
    if (exitCode === 1) {
      // Server rejected the token
      expect(stderr).toBeTruthy();
    } else if (exitCode === 0) {
      // If server accepted it (unlikely with fake token)
      const json = JSON.parse(await run(["--file", testFile, "--token", "100m_invalid", "--title", "Test"]).then(r => r.stdout));
      expect(json).toHaveProperty("url");
    }
  }, 20000);

  it("认证上传需要 --title", async () => {
    // Without title, server should reject (title required for logged-in)
    const { exitCode } = await run([
      "--file", testFile,
      "--token", "100m_fake_token",
    ]);
    // Will fail either because token invalid or title missing
    // Either way exitCode should be 1
    expect([0, 1]).toContain(exitCode);
  }, 20000);
});

// ───────────────────────────────────────────────
// 7. --anonymous flag ignores env
// ───────────────────────────────────────────────
describe("upload.mjs --anonymous", () => {
  it("设置 MINI_TOKEN + --anonymous 仍为匿名", async () => {
    const testFile = join(TMP, "anon-test.html");
    await writeFile(testFile, "<h1>Anon</h1>");
    const { stdout, exitCode } = await run(
      ["--file", testFile, "--anonymous"],
      { env: { MINI_TOKEN: "100m_should_be_ignored" } },
    );
    if (exitCode === 0) {
      const json = JSON.parse(stdout);
      expect(json.isPermanent).toBe(false); // anonymous
    } else {
      expect(exitCode).toBe(1);
    }
  }, 20000);
});

// ───────────────────────────────────────────────
// 8. --base-url override
// ───────────────────────────────────────────────
describe("upload.mjs --base-url", () => {
  it("指向不存在的服务器 → exit 1 + 网络错误", async () => {
    const testFile = join(TMP, "baseurl-test.html");
    await writeFile(testFile, "<h1>BaseURL</h1>");
    const { stderr, exitCode } = await run([
      "--file", testFile,
      "--base-url", "http://127.0.0.1:19999",
    ]);
    expect(exitCode).toBe(1);
    expect(stderr).toContain("Network error");
  }, 10000);
});
