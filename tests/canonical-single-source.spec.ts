import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

/**
 * canonical 只能有一个来源：`app/routes/__root.tsx` 里的 RootDocument。
 *
 * 路由在 `head()` 的 `links` 里再声明一条，页面就会出现两个
 * `<link rel="canonical">`，Google 会忽略重复声明（canonical 是建议不是指令）。
 * 这个坑在 2026-11 出现过一次：`/host-single-html`、`/temporary-link`、
 * `/make-html-file-into-website`、`/ai-tierlist-stats` 各有两条。
 *
 * 路由 `head().links` 的类型由 TanStack 提供（`AnyRouteMatch['links']` 实际是
 * `unknown`），没有收窄的余地，所以用源码扫描兜底。
 */

const ROUTES_DIR = path.resolve(process.cwd(), "app/routes");

function routeFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return routeFiles(full);
    return /\.tsx?$/.test(entry.name) ? [full] : [];
  });
}

/** 同时匹配对象写法 `rel: "canonical"` 与 JSX 写法 `rel="canonical"` */
const CANONICAL_RE = /rel\s*:\s*["']canonical["']|rel=["']canonical["']/;

describe("canonical 单一来源", () => {
  it("__root.tsx 之外的路由不得声明 canonical", () => {
    const offenders = routeFiles(ROUTES_DIR)
      .filter((file) => path.basename(file) !== "__root.tsx")
      .filter((file) => CANONICAL_RE.test(readFileSync(file, "utf8")))
      .map((file) => path.relative(process.cwd(), file));

    expect(offenders).toEqual([]);
  });

  it("__root.tsx 只渲染一条 canonical", () => {
    const source = readFileSync(path.join(ROUTES_DIR, "__root.tsx"), "utf8");
    // 只匹配真正渲染出的 JSX（`href={...}`），注释里提到标签名不算
    expect(source.match(/<link rel="canonical" href=\{/g) ?? []).toHaveLength(1);
  });
});
