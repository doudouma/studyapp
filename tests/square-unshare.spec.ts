import { describe, it, expect, vi, beforeEach } from "vitest";

const dbState = {
  selectRows: [] as unknown[],
  updateValues: null as unknown,
};

vi.mock("../server/db", () => {
  function thenable(rows: unknown[]) {
    const p: any = Promise.resolve(rows);
    p.limit = () => p;
    return p;
  }
  return {
    createDb: () => ({
      select: () => ({ from: () => ({ where: () => thenable(dbState.selectRows) }) }),
      update: () => ({
        set: (v: unknown) => ({
          where: () => {
            dbState.updateValues = v;
            return Promise.resolve();
          },
        }),
      }),
    }),
  };
});

import { unshareFromSquare } from "../server/features/square/square.service";
import { clearSquareSharing } from "../server/features/square/square.repo";

function makeBucket(reject = false) {
  return {
    delete: vi.fn(async () => {
      if (reject) throw new Error("r2 down");
      return undefined;
    }),
  } as any;
}

beforeEach(() => {
  dbState.selectRows = [];
  dbState.updateValues = null;
});

describe("unshareFromSquare", () => {
  it("无 d1 → false", async () => {
    expect(await unshareFromSquare(undefined, makeBucket(), "p1", "u1")).toBe(false);
  });

  it("页面不属于该用户 → false，且不删除缩略图", async () => {
    dbState.selectRows = [];
    const bucket = makeBucket();
    expect(await unshareFromSquare({} as any, bucket, "p1", "u1")).toBe(false);
    expect(bucket.delete).not.toHaveBeenCalled();
  });

  it("取消分享 → 清空 previewPath 并删除缩略图", async () => {
    dbState.selectRows = [{ id: "p1" }];
    const bucket = makeBucket();
    expect(await unshareFromSquare({} as any, bucket, "p1", "u1")).toBe(true);
    expect(dbState.updateValues).toEqual({ isSharedToSquare: false, sharedAt: null, previewPath: null });
    expect(bucket.delete).toHaveBeenCalledWith("thumbnails/p1.webp");
  });

  it("无 bucket → 仍返回 true", async () => {
    dbState.selectRows = [{ id: "p1" }];
    expect(await unshareFromSquare({} as any, undefined, "p1", "u1")).toBe(true);
    expect(dbState.updateValues).toEqual({ isSharedToSquare: false, sharedAt: null, previewPath: null });
  });

  it("删除缩略图失败 → 不影响取消结果", async () => {
    dbState.selectRows = [{ id: "p1" }];
    const bucket = makeBucket(true);
    expect(await unshareFromSquare({} as any, bucket, "p1", "u1")).toBe(true);
    expect(bucket.delete).toHaveBeenCalledWith("thumbnails/p1.webp");
  });
});

describe("clearSquareSharing", () => {
  it("同时清空 previewPath", async () => {
    await clearSquareSharing({} as any, "p1");
    expect(dbState.updateValues).toEqual({ isSharedToSquare: false, sharedAt: null, previewPath: null });
  });
});
