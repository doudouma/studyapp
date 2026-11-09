import { describe, it, expect } from "vitest";
import {
  DEFAULT_PAGE_TITLE,
  INDEX_MIN_AGE_MS,
  isIndexablePage,
  selectIndexableSharedPages,
  type PageIndexabilityFacts,
  type SharedPageCandidate,
} from "../server/features/pages/pages.quality";

/**
 * 可索引质量门槛契约：
 * 只有「登录用户 + 主动分享 + 永久不限次 + 有真实标题 + 过冷却期」的 UGC 页面
 * 才允许进 sitemap / 被收录；其余页面照常可访问但 noindex。
 */

const NOW = Date.UTC(2026, 10, 9, 12, 0, 0);
const OLD = new Date(NOW - INDEX_MIN_AGE_MS - 60_000);

const good: PageIndexabilityFacts = {
  state: "active",
  isSharedToSquare: true,
  userId: "user_1",
  title: "Photosynthesis study notes",
  maxViews: null,
  expiresAt: null,
  createdAt: OLD,
};

const withFacts = (patch: Partial<PageIndexabilityFacts>): PageIndexabilityFacts => ({
  ...good,
  ...patch,
});

describe("isIndexablePage", () => {
  it("满足全部门槛的分享页可收录", () => {
    expect(isIndexablePage(good, NOW)).toBe(true);
  });

  it("匿名页面（无 userId）不收录", () => {
    expect(isIndexablePage(withFacts({ userId: null }), NOW)).toBe(false);
  });

  it("未分享到广场的页面不收录", () => {
    expect(isIndexablePage(withFacts({ isSharedToSquare: false }), NOW)).toBe(false);
  });

  it("已焚毁 / 非 active 页面不收录", () => {
    expect(isIndexablePage(withFacts({ state: "burned" }), NOW)).toBe(false);
  });

  it("限次 / 一次性页面不收录（最终会 410）", () => {
    expect(isIndexablePage(withFacts({ maxViews: 1 }), NOW)).toBe(false);
    expect(isIndexablePage(withFacts({ maxViews: 100 }), NOW)).toBe(false);
  });

  it("会到期的页面不收录（最终会 410）", () => {
    expect(
      isIndexablePage(withFacts({ expiresAt: new Date(NOW + 86_400_000) }), NOW),
    ).toBe(false);
  });

  it("标题为空 / 只有空白 / 仍是默认占位时不收录", () => {
    expect(isIndexablePage(withFacts({ title: "" }), NOW)).toBe(false);
    expect(isIndexablePage(withFacts({ title: "   " }), NOW)).toBe(false);
    expect(isIndexablePage(withFacts({ title: DEFAULT_PAGE_TITLE }), NOW)).toBe(false);
  });

  it("刚创建、还在审核冷却期内的页面不收录", () => {
    expect(
      isIndexablePage(withFacts({ createdAt: new Date(NOW - 60_000) }), NOW),
    ).toBe(false);
  });

  it("冷却期边界：刚好满 24 小时即可收录", () => {
    expect(
      isIndexablePage(withFacts({ createdAt: new Date(NOW - INDEX_MIN_AGE_MS) }), NOW),
    ).toBe(true);
  });

  it("缺少创建时间时保守判定为不可收录", () => {
    expect(isIndexablePage(withFacts({ createdAt: null }), NOW)).toBe(false);
    expect(isIndexablePage(withFacts({ createdAt: undefined }), NOW)).toBe(false);
  });

  it("兼容数字时间戳（sitemap 侧可能不是 Date）", () => {
    expect(isIndexablePage(withFacts({ createdAt: OLD.getTime() }), NOW)).toBe(true);
    expect(isIndexablePage(withFacts({ expiresAt: NOW + 1000 }), NOW)).toBe(false);
  });
});

describe("selectIndexableSharedPages", () => {
  const row = (id: string, patch: Partial<SharedPageCandidate> = {}): SharedPageCandidate => ({
    ...good,
    id,
    sharedAt: OLD,
    ...patch,
  });

  it("只保留过门槛的页面", () => {
    const rows = [
      row("ok1"),
      row("new", { createdAt: new Date(NOW - 60_000) }),
      row("anon", { userId: null }),
      row("ok2"),
    ];
    expect(selectIndexableSharedPages(rows, NOW).map((r) => r.id)).toEqual(["ok1", "ok2"]);
  });

  it("同一 contentHash 只保留一条（去重薄内容/门页）", () => {
    const rows = [
      row("a", { contentHash: "same" }),
      row("b", { contentHash: "same" }),
      row("c", { contentHash: "other" }),
    ];
    expect(selectIndexableSharedPages(rows, NOW).map((r) => r.id)).toEqual(["a", "c"]);
  });

  it("没有 contentHash 的页面不做去重", () => {
    const rows = [row("a"), row("b")];
    expect(selectIndexableSharedPages(rows, NOW)).toHaveLength(2);
  });

  it("跳过 sharedAt 缺失的脏数据", () => {
    const rows = [row("a", { sharedAt: null }), row("b")];
    expect(selectIndexableSharedPages(rows, NOW).map((r) => r.id)).toEqual(["b"]);
  });

  it("按 limit 截断", () => {
    const rows = [row("a"), row("b"), row("c")];
    expect(selectIndexableSharedPages(rows, NOW, 2).map((r) => r.id)).toEqual(["a", "b"]);
  });
});
