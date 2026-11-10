import { describe, it, expect } from "vitest";
import {
  REDDIT_STATS,
  REDDIT_TOOL_STATS,
  type RedditVerdict,
} from "../shared/data/reddit-ai-tools";
import { TIER_CATS } from "../shared/types/tierlist";

const LANGS = ["en", "zh", "es", "fr", "pt"] as const;
const VERDICTS: RedditVerdict[] = ["top", "strong", "steady", "watch"];

describe("Reddit 统计数据集", () => {
  it("包含 20 款工具且名称唯一", () => {
    expect(REDDIT_TOOL_STATS).toHaveLength(20);
    const names = new Set(REDDIT_TOOL_STATS.map((t) => t.tool));
    expect(names.size).toBe(20);
  });

  it("分类都在 Tier List 白名单内", () => {
    for (const item of REDDIT_TOOL_STATS) {
      expect(TIER_CATS).toContain(item.cat);
    }
  });

  it("达到采样上限的工具 mentions 恒为 125，未达上限的低于 125", () => {
    for (const item of REDDIT_TOOL_STATS) {
      if (item.capped) expect(item.mentions).toBe(REDDIT_STATS.sampleCap);
      else expect(item.mentions).toBeLessThan(REDDIT_STATS.sampleCap);
    }
  });

  it("日均、提及量为正数，verdict 合法", () => {
    for (const item of REDDIT_TOOL_STATS) {
      expect(item.daily).toBeGreaterThan(0);
      expect(item.mentions).toBeGreaterThan(0);
      expect(VERDICTS).toContain(item.verdict);
    }
  });

  it("每款工具都有 5 种语言的非空评价", () => {
    for (const item of REDDIT_TOOL_STATS) {
      for (const lang of LANGS) {
        expect(item.note[lang]?.trim().length ?? 0).toBeGreaterThan(10);
      }
    }
  });

  it("最高赞帖链接指向 reddit.com 且字段完整", () => {
    for (const item of REDDIT_TOOL_STATS) {
      if (!item.topPost) continue;
      expect(item.topPost.url.startsWith("https://www.reddit.com/")).toBe(true);
      expect(item.topPost.sub.length).toBeGreaterThan(0);
      expect(item.topPost.score).toBeGreaterThan(0);
      expect(item.topPost.title.trim().length).toBeGreaterThan(0);
    }
  });

  it("口径元数据完整", () => {
    expect(REDDIT_STATS.asOf).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(REDDIT_STATS.windowDays).toBe(30);
    expect(REDDIT_STATS.subs.length).toBe(10);
  });
});
