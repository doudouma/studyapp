import { describe, it, expect } from "vitest";
import {
  buildBoardResults,
  isTierLevel,
  isToolOnBoard,
} from "../server/features/tierlist/tierlist.service";
import {
  TIERLIST_TOOLS,
  TIER_LEVELS,
  isTierlistBoard,
} from "@shared/types/tierlist";

describe("投票档位校验", () => {
  it("只接受 0–4 的整数档位", () => {
    for (let i = 0; i < TIER_LEVELS; i += 1) expect(isTierLevel(i)).toBe(true);
    expect(isTierLevel(-1)).toBe(false);
    expect(isTierLevel(5)).toBe(false);
    expect(isTierLevel(1.5)).toBe(false);
    expect(isTierLevel("0")).toBe(false);
    expect(isTierLevel(null)).toBe(false);
    expect(isTierLevel(NaN)).toBe(false);
  });
});

describe("固定榜白名单", () => {
  it("只放行 6 个可投票主题", () => {
    expect(isTierlistBoard("image")).toBe(true);
    expect(isTierlistBoard("research")).toBe(true);
    expect(isTierlistBoard("generic")).toBe(false); // 通用榜不参与投票
    expect(isTierlistBoard("bogus")).toBe(false);
    expect(isTierlistBoard(42)).toBe(false);
  });

  it("只接受该主题榜里真实存在的工具名", () => {
    expect(isToolOnBoard("image", "Midjourney")).toBe(true);
    // Cursor 存在于编程榜，但不在图像榜 —— 不能跨榜塞票
    expect(isToolOnBoard("image", "Cursor")).toBe(false);
    expect(isToolOnBoard("code", "Cursor")).toBe(true);
    expect(isToolOnBoard("image", "DROPPED_TABLE")).toBe(false);
    expect(isToolOnBoard("image", "")).toBe(false);
    expect(isToolOnBoard("image", 7)).toBe(false);
  });
});

describe("榜单聚合 buildBoardResults", () => {
  it("固定榜 0 票工具也上榜，且不编造名次", () => {
    const { board, results, myVotes } = buildBoardResults("image", [], {});
    expect(board).toBe("image");
    expect(results).toHaveLength(TIERLIST_TOOLS.image.length);
    expect(myVotes).toEqual({});
    for (const r of results) {
      expect(r.total).toBe(0);
      expect(r.votes).toEqual([0, 0, 0, 0, 0]);
      expect(r.avgTier).toBeNull();
      expect(r.rank).toBeNull();
      expect(r.myTier).toBeNull();
    }
  });

  it("按票数加权平均四舍五入得出流行等级", () => {
    const { results } = buildBoardResults(
      "image",
      [
        // Midjourney: S×2 + D×1 → 加权均值 (0*2 + 4*1)/3 = 1.33 → 1 (A)
        { tool: "Midjourney", tier: 0, count: 2 },
        { tool: "Midjourney", tier: 4, count: 1 },
        // Krea: 全是 B → 均值 2 → 2 (B)
        { tool: "Krea", tier: 2, count: 5 },
        // Sora 不在图像榜 → 必须被丢弃
        { tool: "OpenAI Sora", tier: 0, count: 99 },
        // 非法档位行 → 忽略
        { tool: "Flux", tier: 9, count: 4 },
      ],
      {},
    );

    const mj = results.find((r) => r.tool === "Midjourney")!;
    expect(mj.votes).toEqual([2, 0, 0, 0, 1]);
    expect(mj.total).toBe(3);
    expect(mj.avgTier).toBeCloseTo(4 / 3, 6);
    expect(mj.rank).toBe(1);

    const krea = results.find((r) => r.tool === "Krea")!;
    expect(krea.rank).toBe(2);
    expect(krea.total).toBe(5);

    expect(results.find((r) => r.tool === "OpenAI Sora")).toBeUndefined();
    const flux = results.find((r) => r.tool === "Flux")!;
    expect(flux.total).toBe(0); // 只有非法档位行 → 视同 0 票
    expect(flux.rank).toBeNull();
  });

  it("票多的排前面，同票数按预设顺序稳定排序", () => {
    const { results } = buildBoardResults(
      "code",
      [
        { tool: "Aider", tier: 3, count: 1 },
        { tool: "Cursor", tier: 0, count: 4 },
        { tool: "Cline", tier: 1, count: 4 },
      ],
      {},
    );
    const order = results.slice(0, 3).map((r) => r.tool);
    expect(order).toEqual(["Cursor", "Cline", "Aider"]);
    // Cursor 与 Cline 同为 4 票，按预设池顺序（Cursor 在 Cline 之前）
    expect(TIERLIST_TOOLS.code.findIndex(([n]) => n === "Cursor")).toBeLessThan(
      TIERLIST_TOOLS.code.findIndex(([n]) => n === "Cline"),
    );
  });

  it("带上我的投票，且对非法档位容错", () => {
    const { results, myVotes } = buildBoardResults(
      "video",
      [],
      { Runway: 0, Pika: 99, Luma: 1 },
    );
    expect(myVotes.Pika).toBe(99);
    const runway = results.find((r) => r.tool === "Runway")!;
    expect(runway.myTier).toBe(0);
    const luma = results.find((r) => r.tool === "Luma")!;
    expect(luma.myTier).toBe(1);
    // 非法档位不当成已投票
    const pika = results.find((r) => r.tool === "Pika")!;
    expect(pika.myTier).toBeNull();
  });

  it("榜池调整后的历史票不再展示，但不影响其他工具", () => {
    const { results } = buildBoardResults(
      "chat",
      [{ tool: "已下架的老工具", tier: 0, count: 7 }],
      {},
    );
    expect(results).toHaveLength(TIERLIST_TOOLS.chat.length);
    expect(results.every((r) => r.total === 0)).toBe(true);
  });
});
