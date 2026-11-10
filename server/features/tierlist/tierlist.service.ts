import type {
  TierlistBoard,
  TierlistBoardResponse,
  TierlistTally,
  TierlistToolResult,
} from "@shared/types/tierlist";
import {
  TIERLIST_TOOLS,
  TIER_LEVELS,
  isTierlistBoard,
} from "@shared/types/tierlist";
import { getMyVotes, getTallies, upsertVote } from "./tierlist.repo";

/**
 * AI Tier List 业务逻辑层 (Service)
 * 承载校验规则、聚合口径与 DTO 转换。
 *
 * 聚合口径（透明算术，界面上会原样展示给用户）：
 *  - 票数分布 = 每档位的票数；
 *  - avgTier = 票数加权平均（S=0…D=4），保留小数供 tooltip/排序参考；
 *  - rank = avgTier 四舍五入映射回档位，即「流行等级」；
 *  - 0 票一律为 null（显示为未评级），不编造默认值。
 */

export type VoteOutcome =
  | { ok: true; tool: string; tier: number }
  | { ok: false; error: string };

/** 档位必须是 0–4 的整数 */
export function isTierLevel(v: unknown): v is number {
  return typeof v === "number" && Number.isInteger(v) && v >= 0 && v < TIER_LEVELS;
}

/** 工具必须真实存在于该固定榜（防止往库里写任意字符串） */
export function isToolOnBoard(board: TierlistBoard, tool: unknown): tool is string {
  if (typeof tool !== "string") return false;
  return TIERLIST_TOOLS[board].some(([name]) => name === tool);
}

/**
 * 固定榜 + 计数行 + 我的投票 → 完整榜单响应（纯函数，可单测）
 *
 * - 0 票工具照常上榜（固定榜的意义：让人能对冷门工具投票）；
 * - 排序：总票数降序，同票数按预设顺序稳定排序；
 * - 计数里出现但不在当前榜定义中的工具会被丢弃（榜池调整后的历史票不再展示）。
 */
export function buildBoardResults(
  board: TierlistBoard,
  tallies: TierlistTally[],
  myVotes: Record<string, number>,
): TierlistBoardResponse {
  const tallyMap = new Map<string, number[]>();
  for (const row of tallies) {
    if (!isTierLevel(row.tier) || row.count <= 0) continue;
    let votes = tallyMap.get(row.tool);
    if (!votes) {
      votes = new Array<number>(TIER_LEVELS).fill(0);
      tallyMap.set(row.tool, votes);
    }
    votes[row.tier] += row.count;
  }

  const decorated = TIERLIST_TOOLS[board].map(([name, cat], index) => {
    const votes = tallyMap.get(name) ?? new Array<number>(TIER_LEVELS).fill(0);
    const total = votes.reduce((sum, n) => sum + n, 0);
    const weighted = votes.reduce((sum, n, level) => sum + n * level, 0);
    const avgTier = total > 0 ? weighted / total : null;
    const rank =
      avgTier === null ? null : Math.min(TIER_LEVELS - 1, Math.round(avgTier));
    const mine = myVotes[name];
    const myTier = isTierLevel(mine) ? mine : null;

    const result: TierlistToolResult & { index: number } = {
      tool: name,
      cat,
      votes,
      total,
      avgTier,
      rank,
      myTier,
      index,
    };
    return result;
  });

  decorated.sort((a, b) => b.total - a.total || a.index - b.index);

  return {
    board,
    results: decorated.map(({ index: _index, ...rest }) => rest),
    myVotes,
  };
}

/** 校验并写入一票（改票 = 覆盖） */
export async function castUserVote(
  d1: D1Database | undefined,
  userId: string,
  board: unknown,
  tool: unknown,
  tier: unknown,
): Promise<VoteOutcome> {
  if (!d1) return { ok: false, error: "database unavailable" };
  if (!isTierlistBoard(board)) return { ok: false, error: "unknown board" };
  if (!isToolOnBoard(board, tool)) return { ok: false, error: "unknown tool" };
  if (!isTierLevel(tier)) return { ok: false, error: "invalid tier" };

  await upsertVote(d1, userId, board, tool, tier);
  return { ok: true, tool, tier };
}

/** 拉取某榜的完整结果（未登录只取聚合，不取我的投票） */
export async function getBoardResults(
  d1: D1Database | undefined,
  board: TierlistBoard,
  userId?: string,
): Promise<TierlistBoardResponse> {
  if (!d1) return { board, results: [], myVotes: {} };

  const [tallies, myVotes] = await Promise.all([
    getTallies(d1, board),
    userId ? getMyVotes(d1, userId, board) : Promise.resolve({} as Record<string, number>),
  ]);

  return buildBoardResults(board, tallies, myVotes);
}
