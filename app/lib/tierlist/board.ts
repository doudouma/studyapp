import { TIER_CATS } from "@shared/types/tierlist";

/**
 * 榜单存档的形状、有效性判定与清洗（纯函数，无 React、无 i18n）。
 *
 * 单独成文件的原因有两个：
 *  1. 组件文件只导出组件，React Fast Refresh 才能正常工作。
 *     若在 `TierListMaker.tsx` 里导出这些函数，Vite 会报
 *     `Could not Fast Refresh ("isBoard" export is incompatible)`，
 *     整模块失效、状态半更新，进而触发 `insertBefore ... is not a child`。
 *  2. 这些不变量需要被单测直接覆盖。
 */

export type TierTool = { name: string; cat: string; comment: string };

/** 旧版默认 tier 配色 → 新版酸橙/单色调色板（仅整组默认色时迁移，自定义颜色不动） */
const LEGACY_DEFAULT_COLORS = ["#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#64748b"];
const CURRENT_DEFAULT_COLORS = ["#d8ff00", "#ffffff", "#cfcfcf", "#8d8d8d", "#3f3f3f"];

export type TierRow = {
  id: string;
  label: string;
  en: string;
  color: string;
  items: string[];
};

export type TierBoard = {
  title: string;
  theme: string;
  tiers: TierRow[];
  pool: string[];
  tools: Record<string, TierTool>;
};

export function isBoard(v: unknown): v is TierBoard {
  if (!v || typeof v !== "object") return false;
  const b = v as TierBoard;
  return (
    typeof b.title === "string" &&
    typeof b.theme === "string" &&
    Array.isArray(b.pool) &&
    // 没有任何等级的榜单渲染不出分级表 → 判为无效，由调用方回退默认榜单
    Array.isArray(b.tiers) &&
    b.tiers.length > 0 &&
    !!b.tools &&
    typeof b.tools === "object"
  );
}

/**
 * 清洗外部存档（localStorage / 分享链接）到可安全渲染的形态。
 *
 * **不变量**——破坏任何一条 React 都会出错，尤其是「key 重复」：
 * 重复 key 会让 React 复用/丢弃子节点，此后 commitPlacement 持有的兄弟节点
 * 锚点已被移走，直接抛 `insertBefore ... is not a child`。
 *  1. tier id 全局唯一且非空（重复/缺失时重排）；
 *  2. 每个工具只出现一次（pool 或唯一一个 tier）；
 *  3. pool/tiers 只保留真实存在的工具，落单的补回 pool；
 *  4. 颜色只接受 #rrggbb，分类只接受白名单。
 */
export function sanitizeBoard(b: TierBoard): TierBoard {
  const tools: Record<string, TierTool> = {};
  for (const [id, raw] of Object.entries(b.tools)) {
    if (!raw || typeof raw !== "object" || typeof raw.name !== "string" || !raw.name.trim()) continue;
    const cat = typeof raw.cat === "string" && (TIER_CATS as readonly string[]).includes(raw.cat) ? raw.cat : "other";
    tools[id] = { name: raw.name, cat, comment: typeof raw.comment === "string" ? raw.comment : "" };
  }
  const known = new Set(Object.keys(tools));
  const seen = new Set<string>();
  const take = (ids: unknown): string[] =>
    (Array.isArray(ids) ? ids : []).filter((id): id is string => {
      if (typeof id !== "string" || !known.has(id) || seen.has(id)) return false;
      seen.add(id);
      return true;
    });

  // 先取等级里的引用：用户主动排过的优先，池只是「未分类」兜底桶
  const usedTierIds = new Set<string>();
  const tiers = (Array.isArray(b.tiers) ? b.tiers : []).map((tier, i) => {
    let id = typeof tier?.id === "string" && tier.id ? tier.id : "";
    if (!id || usedTierIds.has(id)) {
      let n = i + 1;
      while (usedTierIds.has(`t${n}`)) n += 1;
      id = `t${n}`;
    }
    usedTierIds.add(id);
    return {
      id,
      label: typeof tier?.label === "string" && tier.label ? tier.label : `T${i + 1}`,
      en: typeof tier?.en === "string" ? tier.en : "",
      color: /^#[0-9a-fA-F]{6}$/.test(String(tier?.color)) ? String(tier.color) : "#8d8d8d",
      items: take(tier?.items),
    };
  });
  if (
    tiers.length === LEGACY_DEFAULT_COLORS.length &&
    tiers.every((tier, i) => tier.color.toLowerCase() === LEGACY_DEFAULT_COLORS[i])
  ) {
    tiers.forEach((tier, i) => { tier.color = CURRENT_DEFAULT_COLORS[i]; });
  }

  const pool = take(b.pool);

  // 没被放到任何等级、也不在池里的工具，补回池子（否则会"消失"）
  for (const id of Object.keys(tools)) if (!seen.has(id)) pool.push(id);

  return {
    title: b.title || "AI Tools Tier List",
    theme: b.theme || "generic",
    tiers,
    pool,
    tools,
  };
}
