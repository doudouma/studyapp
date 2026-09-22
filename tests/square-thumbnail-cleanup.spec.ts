import { describe, it, expect, vi, beforeEach } from "vitest";

const dbState = {
  sharedRows: [] as { id: string }[],
};

vi.mock("../server/db", () => ({
  createDb: () => ({
    select: () => ({
      from: () => ({
        where: () => Promise.resolve(dbState.sharedRows),
      }),
    }),
  }),
}));

import { cleanupOrphanThumbnails } from "../server/features/square/square.service";

function fakeD1() {
  const state = { updates: 0 };
  return {
    prepare: () => ({
      run: async () => {
        state.updates++;
        return { success: true, meta: { changes: 12 } };
      },
    }),
    getUpdates: () => state.updates,
  } as any;
}

beforeEach(() => {
  dbState.sharedRows = [];
});

describe("cleanupOrphanThumbnails", () => {
  it("缺少 d1 或 bucket → 0", async () => {
    expect(await cleanupOrphanThumbnails(undefined, {} as any)).toEqual({ deleted: 0, scanned: 0 });
    expect(await cleanupOrphanThumbnails({} as any, undefined)).toEqual({ deleted: 0, scanned: 0 });
  });

  it("删除非分享页缩略图，保留分享页", async () => {
    dbState.sharedRows = [{ id: "keep123" }];
    const d1 = fakeD1();
    const bucket = {
      list: vi.fn(async () => ({
        objects: [{ key: "thumbnails/keep123.webp" }, { key: "thumbnails/orphan1.webp" }],
        truncated: false,
      })),
      delete: vi.fn(async () => undefined),
    } as any;

    const res = await cleanupOrphanThumbnails(d1, bucket);

    expect(res).toEqual({ deleted: 1, scanned: 2 });
    expect(bucket.delete).toHaveBeenCalledWith(["thumbnails/orphan1.webp"]);
    expect(d1.getUpdates()).toBe(1);
  });

  it("分页扫描并累加，删除全部非分享页对象", async () => {
    dbState.sharedRows = [];
    const d1 = fakeD1();
    const bucket = {
      list: vi
        .fn()
        .mockResolvedValueOnce({ objects: [{ key: "thumbnails/a.webp" }], truncated: true, cursor: "c1" })
        .mockResolvedValueOnce({ objects: [{ key: "thumbnails/b.webp" }], truncated: false }),
      delete: vi.fn(async () => undefined),
    } as any;

    const res = await cleanupOrphanThumbnails(d1, bucket);

    expect(res).toEqual({ deleted: 2, scanned: 2 });
    expect(bucket.list).toHaveBeenCalledTimes(2);
    expect(bucket.delete).toHaveBeenCalledWith(["thumbnails/a.webp"]);
    expect(bucket.delete).toHaveBeenCalledWith(["thumbnails/b.webp"]);
  });

  it("无孤立对象 → 不调用 delete，但仍清空 preview_path", async () => {
    dbState.sharedRows = [{ id: "keep123" }];
    const d1 = fakeD1();
    const bucket = {
      list: vi.fn(async () => ({ objects: [{ key: "thumbnails/keep123.webp" }], truncated: false })),
      delete: vi.fn(async () => undefined),
    } as any;

    const res = await cleanupOrphanThumbnails(d1, bucket);

    expect(res).toEqual({ deleted: 0, scanned: 1 });
    expect(bucket.delete).not.toHaveBeenCalled();
    expect(d1.getUpdates()).toBe(1);
  });
});
