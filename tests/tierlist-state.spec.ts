import { describe, it, expect } from "vitest";
import {
  isBoard,
  sanitizeBoard,
  type TierBoard,
} from "~/lib/tierlist/board";

/**
 * 存档清洗契约：外部输入（localStorage / 分享链接 / 损坏数据）在渲染前必须
 * 满足「React key 唯一 + 引用完整」。破坏这些不变量会触发
 * `Failed to execute 'insertBefore' on 'Node'`（重复 key → 锚点被 React 移走）。
 */

const asBoard = (v: unknown) => v as TierBoard;

describe("榜单有效性判定 isBoard", () => {
  it("拒绝没有任何等级的榜单（渲染不出分级表）", () => {
    expect(
      isBoard({ title: "x", theme: "generic", pool: [], tiers: [], tools: {} }),
    ).toBe(false);
  });

  it("拒绝缺字段 / 非对象输入", () => {
    expect(isBoard(null)).toBe(false);
    expect(isBoard("nope")).toBe(false);
    expect(isBoard({ title: "x" })).toBe(false);
    expect(
      isBoard({ title: "x", theme: "generic", pool: [], tools: {} }), // 缺 tiers
    ).toBe(false);
  });

  it("接受形状完整的榜单", () => {
    expect(
      isBoard({
        title: "x",
        theme: "generic",
        pool: [],
        tiers: [{ id: "t1", label: "S", en: "", color: "#ef4444", items: [] }],
        tools: {},
      }),
    ).toBe(true);
  });
});

describe("存档清洗 sanitizeBoard", () => {
  it("tier id 重复时重排，保证 React key 唯一（insertBefore 崩溃的直接诱因）", () => {
    const out = sanitizeBoard(
      asBoard({
        title: "t",
        theme: "generic",
        pool: [],
        tools: { p0: { name: "A", cat: "chat", comment: "" } },
        tiers: [
          { id: "t1", label: "S", en: "", color: "#ef4444", items: ["p0"] },
          { id: "t1", label: "A", en: "", color: "#f59e0b", items: [] },
          { id: "t1", label: "B", en: "", color: "#10b981", items: [] },
          { id: "", label: "C", en: "", color: "#3b82f6", items: [] },
        ],
      }),
    );
    const ids = out.tiers.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toEqual(["t1", "t2", "t3", "t4"]);
  });

  it("tier id 缺失时补唯一名，标签回退", () => {
    const out = sanitizeBoard(
      asBoard({
        title: "t",
        theme: "generic",
        pool: [],
        tools: {},
        tiers: [{ label: null, en: 42, color: "red", items: null }],
      }),
    );
    expect(out.tiers).toHaveLength(1);
    expect(out.tiers[0].id).toBe("t1");
    expect(out.tiers[0].label).toBe("T1");
    expect(out.tiers[0].en).toBe("");
    expect(out.tiers[0].color).toBe("#8d8d8d"); // 非 #rrggbb 一律回退
    expect(out.tiers[0].items).toEqual([]);
  });

  it("pool 去重：重复、悬空、类型错的 id 全部丢弃", () => {
    const out = sanitizeBoard(
      asBoard({
        title: "t",
        theme: "generic",
        pool: ["p0", "p0", "ghost", 123, null, ""],
        tools: { p0: { name: "A", cat: "chat", comment: "" } },
        tiers: [{ id: "t1", label: "S", en: "", color: "#ef4444", items: [] }],
      }),
    );
    expect(out.pool).toEqual(["p0"]);
  });

  it("同一工具同时出现在 pool 与 tier → 只保留在 tier（一次出现）", () => {
    const out = sanitizeBoard(
      asBoard({
        title: "t",
        theme: "generic",
        pool: ["p0"],
        tools: { p0: { name: "A", cat: "chat", comment: "" } },
        tiers: [
          { id: "t1", label: "S", en: "", color: "#ef4444", items: ["p0"] },
          { id: "t2", label: "A", en: "", color: "#f59e0b", items: ["p0", "p0"] },
        ],
      }),
    );
    expect(out.pool).toEqual([]);
    expect(out.tiers[0].items).toEqual(["p0"]);
    expect(out.tiers[1].items).toEqual([]); // 重复引用只算一次
    const total = [
      ...out.pool,
      ...out.tiers.flatMap((t) => t.items),
    ];
    expect(new Set(total).size).toBe(total.length);
  });

  it("孤儿工具补回 pool；本体为 null / 缺名字的工具被剔除", () => {
    const out = sanitizeBoard(
      asBoard({
        title: "t",
        theme: "generic",
        pool: [],
        tools: {
          kept: { name: "Kept", cat: "chat", comment: "hi" },
          orphan: { name: "Orphan", cat: "chat" },
          broken: null,
          empty: { name: "   ", cat: "chat", comment: "" },
        },
        tiers: [{ id: "t1", label: "S", en: "", color: "#ef4444", items: ["kept"] }],
      }),
    );
    expect(out.tiers[0].items).toEqual(["kept"]);
    expect(out.pool).toEqual(["orphan"]);
    expect(Object.keys(out.tools).sort()).toEqual(["kept", "orphan"]);
  });

  it("分类白名单外回退 other，comment 非字符串回退空串", () => {
    const out = sanitizeBoard(
      asBoard({
        title: "t",
        theme: "generic",
        pool: ["p0"],
        tools: { p0: { name: "A", cat: "not-a-cat", comment: 123 } as never },
        tiers: [{ id: "t1", label: "S", en: "", color: "#ef4444", items: [] }],
      }),
    );
    expect(out.tools.p0.cat).toBe("other");
    expect(out.tools.p0.comment).toBe("");
  });

  it("旧版默认调色板整组迁移到新配色，自定义颜色不动", () => {
    const legacy = sanitizeBoard(
      asBoard({
        title: "t",
        theme: "generic",
        pool: [],
        tools: {},
        tiers: [
          { id: "t1", label: "S", en: "", color: "#ef4444", items: [] },
          { id: "t2", label: "A", en: "", color: "#f59e0b", items: [] },
          { id: "t3", label: "B", en: "", color: "#10b981", items: [] },
          { id: "t4", label: "C", en: "", color: "#3b82f6", items: [] },
          { id: "t5", label: "D", en: "", color: "#64748b", items: [] },
        ],
      }),
    );
    expect(legacy.tiers.map((t) => t.color)).toEqual([
      "#d8ff00", "#ffffff", "#cfcfcf", "#8d8d8d", "#3f3f3f",
    ]);

    const custom = sanitizeBoard(
      asBoard({
        title: "t",
        theme: "generic",
        pool: [],
        tools: {},
        tiers: [
          { id: "t1", label: "S", en: "", color: "#ff00aa", items: [] },
          { id: "t2", label: "A", en: "", color: "#f59e0b", items: [] },
        ],
      }),
    );
    expect(custom.tiers.map((t) => t.color)).toEqual(["#ff00aa", "#f59e0b"]);
  });

  it("清洗是幂等的（再次清洗结果不变）", () => {
    const poison = asBoard({
      title: "",
      theme: "bogus",
      pool: ["p0", "p0", "x"],
      tools: { p0: { name: "A", cat: "chat", comment: "" }, orphan: { name: "B", cat: "image", comment: "" } },
      tiers: [
        { id: "t1", label: "S", en: "", color: "#ef4444", items: ["p0"] },
        { id: "t1", label: "A", en: "", color: "#f59e0b", items: [] },
      ],
    });
    const once = sanitizeBoard(poison);
    const twice = sanitizeBoard(once);
    expect(twice).toEqual(once);
  });
});
