import { describe, it, expect, vi, beforeEach } from "vitest";
import { zipSync } from "fflate";

vi.mock("../server/features/pages/pages.repo", () => ({
  getMembershipExpiresAt: vi.fn(),
  isMemberByUserId: vi.fn(),
  countUserPages: vi.fn(),
  listUserPages: vi.fn(),
  findOwnedPage: vi.fn(),
  getPageRecord: vi.fn(),
  insertPageRecord: vi.fn(),
  updatePageRecord: vi.fn(),
  deletePageRecord: vi.fn(),
  getUserPoints: vi.fn(),
  getUserLinksLimitBonus: vi.fn(),
  deductPointsAndAddBonus: vi.fn(),
  deductPoints: vi.fn(),
  incrementPageViewCount: vi.fn(),
  getPageMeta: vi.fn(),
}));

vi.mock("../server/features/pages/pages.storage", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../server/features/pages/pages.storage")>();
  return {
    ...actual,
    putHtml: vi.fn(),
    deletePageObjects: vi.fn(),
    deleteTmpByBucketId: vi.fn(),
  };
});

vi.mock("../server/features/pages/pages.render", () => ({
  injectBanner: vi.fn(),
  notFoundHtml: vi.fn(),
  detectLangFromHeader: vi.fn(),
}));

vi.mock("../server/features/admin/upload-log.repo", () => ({
  insertUploadLog: vi.fn(),
}));

import { createUpload, updateOwnPage, ServiceError } from "../server/features/pages/pages.service";
import * as repo from "../server/features/pages/pages.repo";
import { putHtml, deletePageObjects } from "../server/features/pages/pages.storage";

const MB = 1024 * 1024;
const enc = new TextEncoder();

function makeBucket() {
  return {
    put: vi.fn(async () => ({})),
    get: vi.fn(async () => null as unknown),
    list: vi.fn(async () => ({ objects: [], truncated: false })),
    delete: vi.fn(async () => undefined),
  } as any;
}

function makeRow(overrides: Record<string, unknown> = {}) {
  return {
    id: "p1",
    title: "t",
    category: "general",
    tags: "",
    isPermanent: true,
    viewCount: 0,
    createdAt: new Date(),
    expiresAt: null,
    previewPath: null,
    ...overrides,
  } as any;
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(repo.getMembershipExpiresAt).mockResolvedValue(null);
  vi.mocked(repo.isMemberByUserId).mockResolvedValue(false);
  vi.mocked(repo.countUserPages).mockResolvedValue(0);
  vi.mocked(repo.getUserLinksLimitBonus).mockResolvedValue(0);
  vi.mocked(repo.getUserPoints).mockResolvedValue(50);
  vi.mocked(repo.findOwnedPage).mockResolvedValue(true);
  vi.mocked(repo.getPageRecord).mockResolvedValue(makeRow());
  vi.mocked(repo.insertPageRecord).mockResolvedValue(undefined as any);
  vi.mocked(repo.updatePageRecord).mockResolvedValue(undefined as any);
  vi.mocked(repo.deductPointsAndAddBonus).mockResolvedValue(40);
  vi.mocked(repo.deductPoints).mockResolvedValue(40);
  vi.mocked(putHtml).mockResolvedValue(undefined as any);
  vi.mocked(deletePageObjects).mockResolvedValue(undefined as any);
});

const anon = null;

function baseUpload(overrides: Record<string, unknown> = {}) {
  return {
    d1: {} as any,
    bucket: makeBucket(),
    user: anon as any,
    title: "",
    category: "general",
    tags: "",
    shareToSquare: false,
    ...overrides,
  } as any;
}

// ───────────────────────────────────────────────
// createUpload
// ───────────────────────────────────────────────
describe("createUpload — 匿名", () => {
  it("小内容存 tmp/ 且不落库、不扣分", async () => {
    const bucket = makeBucket();
    const res = await createUpload(baseUpload({ bucket, user: null, content: "<p>hi</p>" }));
    expect(res.isPermanent).toBe(false);
    expect(res.expiresAt).toBeGreaterThan(Date.now());
    expect(res._isAnonymous).toBe(true);
    expect(res._html).toBe("<p>hi</p>");
    expect(bucket.put.mock.calls[0][0]).toMatch(/^tmp\/.+\.html$/);
    expect(repo.insertPageRecord).not.toHaveBeenCalled();
    expect(repo.deductPoints).not.toHaveBeenCalled();
  });

  it("内容超过 5MB → 413", async () => {
    const p = createUpload(baseUpload({ content: "a".repeat(6 * MB) }));
    await expect(p).rejects.toMatchObject({ status: 413 });
  });

  it("bucket 缺失时不抛错", async () => {
    const res = await createUpload(baseUpload({ bucket: undefined, content: "<p>ok</p>" }));
    expect(res.url).toMatch(/^\/p\//);
  });
});

describe("createUpload — 登录用户", () => {
  const user = { id: "u1", name: "N", email: "e@x.com" };

  it("标题为空 → 400", async () => {
    await expect(createUpload(baseUpload({ user, title: "", content: "x" }))).rejects.toMatchObject({ status: 400 });
  });

  it("缺少 d1 → 503", async () => {
    await expect(
      createUpload(baseUpload({ user, d1: undefined, title: "t", content: "x" }))
    ).rejects.toMatchObject({ status: 503 });
  });

  it("未超配额、未超尺寸 → 落库且不扣分", async () => {
    const bucket = makeBucket();
    const res = await createUpload(baseUpload({ user, bucket, title: "t", content: "<p>ok</p>" }));
    expect(res.isPermanent).toBe(true);
    expect(res.expiresAt).toBeNull();
    expect(putHtml).toHaveBeenCalledWith(bucket, expect.stringMatching(/\.html$/), "<p>ok</p>");
    expect(repo.insertPageRecord).toHaveBeenCalled();
    expect(repo.deductPoints).not.toHaveBeenCalled();
    expect(repo.deductPointsAndAddBonus).not.toHaveBeenCalled();
  });

  it("超出免费页面数、积分足够 → 扣配额费并加 bonus", async () => {
    vi.mocked(repo.countUserPages).mockResolvedValue(5);
    await createUpload(baseUpload({ user, title: "t", content: "x" }));
    expect(repo.deductPointsAndAddBonus).toHaveBeenCalledWith(expect.anything(), "u1", 10);
    expect(repo.deductPoints).not.toHaveBeenCalled();
  });

  it("超出免费页面数、积分不足 → 403", async () => {
    vi.mocked(repo.countUserPages).mockResolvedValue(5);
    vi.mocked(repo.getUserPoints).mockResolvedValue(5);
    await expect(createUpload(baseUpload({ user, title: "t", content: "x" }))).rejects.toMatchObject({ status: 403 });
    expect(repo.insertPageRecord).not.toHaveBeenCalled();
  });

  it("仅超尺寸（7MB）→ 只扣尺寸费，不加 bonus", async () => {
    await createUpload(baseUpload({ user, title: "t", content: "a".repeat(7 * MB) }));
    expect(repo.deductPoints).toHaveBeenCalledWith(expect.anything(), "u1", 10);
    expect(repo.deductPointsAndAddBonus).not.toHaveBeenCalled();
  });

  it("配额费 + 尺寸费叠加 → 各扣 10", async () => {
    vi.mocked(repo.countUserPages).mockResolvedValue(5);
    await createUpload(baseUpload({ user, title: "t", content: "a".repeat(7 * MB) }));
    expect(repo.deductPointsAndAddBonus).toHaveBeenCalledWith(expect.anything(), "u1", 10);
    expect(repo.deductPoints).toHaveBeenCalledWith(expect.anything(), "u1", 10);
  });

  it("叠加费用积分不足 → 403 且消息含两种原因", async () => {
    vi.mocked(repo.countUserPages).mockResolvedValue(5);
    vi.mocked(repo.getUserPoints).mockResolvedValue(15);
    const p = createUpload(baseUpload({ user, title: "t", content: "a".repeat(7 * MB) }));
    await expect(p).rejects.toBeInstanceOf(ServiceError);
    await p.catch((e: any) => {
      expect(e.status).toBe(403);
      expect(e.message).toContain("免费额度已用完");
      expect(e.message).toContain("内容超过");
      expect(e.message).toContain("20 积分");
    });
  });

  it("会员 → 免配额费，但 7MB 仍扣尺寸费", async () => {
    const future = Date.now() + 86_400_000;
    vi.mocked(repo.getMembershipExpiresAt).mockResolvedValue(future);
    vi.mocked(repo.countUserPages).mockResolvedValue(99);
    await createUpload(baseUpload({ user, title: "t", content: "a".repeat(7 * MB) }));
    expect(repo.deductPointsAndAddBonus).not.toHaveBeenCalled();
    expect(repo.deductPoints).toHaveBeenCalledWith(expect.anything(), "u1", 10);
  });

  it("会员小内容 → 不扣分", async () => {
    vi.mocked(repo.getMembershipExpiresAt).mockResolvedValue(Date.now() + 86_400_000);
    await createUpload(baseUpload({ user, title: "t", content: "x" }));
    expect(repo.deductPoints).not.toHaveBeenCalled();
    expect(repo.deductPointsAndAddBonus).not.toHaveBeenCalled();
  });

  it("内容超过 50MB → 413", async () => {
    await expect(
      createUpload(baseUpload({ user, title: "t", content: "a".repeat(51 * MB) }))
    ).rejects.toMatchObject({ status: 413 });
  });

  it("不支持的扩展名 → 400", async () => {
    const file = { bytes: enc.encode("x"), filename: "a.txt" };
    await expect(createUpload(baseUpload({ user, title: "t", file }))).rejects.toMatchObject({ status: 400 });
  });

  it("上传 .html 文件 → 解码内容并落盘", async () => {
    const bucket = makeBucket();
    const file = { bytes: enc.encode("<h1>file</h1>"), filename: "a.html" };
    const res = await createUpload(baseUpload({ user, bucket, title: "t", file }));
    expect(res._html).toBe("<h1>file</h1>");
    expect(putHtml).toHaveBeenCalledWith(bucket, expect.stringMatching(/\.html$/), "<h1>file</h1>");
  });

  it("既无内容也无文件 → 400", async () => {
    await expect(createUpload(baseUpload({ user, title: "t" }))).rejects.toMatchObject({ status: 400 });
  });
});

describe("createUpload — ZIP", () => {
  const user = { id: "u1", name: "N", email: "e@x.com" };

  it("登录用户 ZIP 以 {id}/index.html 与资源落盘", async () => {
    const bucket = makeBucket();
    const zip = zipSync({ "index.html": enc.encode("<h1>hi</h1>"), "app.js": enc.encode("1") });
    await createUpload(baseUpload({ user, bucket, title: "t", file: { bytes: zip, filename: "site.zip" } }));
    const keys = bucket.put.mock.calls.map((c: any[]) => c[0]);
    expect(keys.some((k: string) => /\/index\.html$/.test(k))).toBe(true);
    expect(keys.some((k: string) => /\/app\.js$/.test(k))).toBe(true);
  });

  it("ZIP 无 index.html 时回退到首个 .html", async () => {
    const bucket = makeBucket();
    const zip = zipSync({ "page.html": enc.encode("<h1>hi</h1>") });
    await createUpload(baseUpload({ user, bucket, title: "t", file: { bytes: zip, filename: "site.zip" } }));
    const keys = bucket.put.mock.calls.map((c: any[]) => c[0]);
    expect(keys.some((k: string) => k.endsWith("/index.html"))).toBe(true);
  });

  it("ZIP 无任何 HTML → 400", async () => {
    const zip = zipSync({ "a.css": enc.encode("body{}") });
    await expect(
      createUpload(baseUpload({ user, title: "t", file: { bytes: zip, filename: "site.zip" } }))
    ).rejects.toMatchObject({ status: 400 });
  });

  it("高度可压缩 ZIP：解压后 6MB 触发尺寸费", async () => {
    const zip = zipSync({ "index.html": enc.encode("a".repeat(6 * MB)) });
    expect(zip.length).toBeLessThan(5 * MB);
    await createUpload(baseUpload({ user, title: "t", file: { bytes: zip, filename: "site.zip" } }));
    expect(repo.deductPoints).toHaveBeenCalledWith(expect.anything(), "u1", 10);
  });

  it("ZIP 解压后超过 50MB → 413", async () => {
    const zip = zipSync({ "index.html": enc.encode("a".repeat(51 * MB)) });
    await expect(
      createUpload(baseUpload({ user, title: "t", file: { bytes: zip, filename: "site.zip" } }))
    ).rejects.toMatchObject({ status: 413 });
  });

  it("匿名 ZIP 存于 tmp/{id}/", async () => {
    const bucket = makeBucket();
    const zip = zipSync({ "index.html": enc.encode("<h1>hi</h1>") });
    await createUpload(baseUpload({ bucket, user: null, file: { bytes: zip, filename: "site.zip" } }));
    const keys = bucket.put.mock.calls.map((c: any[]) => c[0]);
    expect(keys.every((k: string) => k.startsWith("tmp/"))).toBe(true);
  });
});

// ───────────────────────────────────────────────
// updateOwnPage
// ───────────────────────────────────────────────
describe("updateOwnPage", () => {
  function baseUpdate(overrides: Record<string, unknown> = {}) {
    return {
      d1: {} as any,
      bucket: makeBucket(),
      userId: "u1",
      pageId: "p1",
      ...overrides,
    } as any;
  }

  it("页面不属于该用户 → 404", async () => {
    vi.mocked(repo.findOwnedPage).mockResolvedValue(false);
    await expect(updateOwnPage(baseUpdate({ title: "t" }))).rejects.toMatchObject({ status: 404 });
  });

  it("仅更新元数据 → 不写内容、不扣分", async () => {
    const res = await updateOwnPage(baseUpdate({ title: "new", category: "math", tags: "a,b" }));
    expect(repo.updatePageRecord).toHaveBeenCalledWith(expect.anything(), "p1", { title: "new", category: "math", tags: "a,b" });
    expect(putHtml).not.toHaveBeenCalled();
    expect(repo.deductPoints).not.toHaveBeenCalled();
    expect(res.success).toBe(true);
  });

  it("替换内容为扁平 HTML（原非 ZIP）", async () => {
    const bucket = makeBucket();
    await updateOwnPage(baseUpdate({ bucket, content: "<p>new</p>" }));
    expect(putHtml).toHaveBeenCalledWith(bucket, "p1.html", "<p>new</p>");
    expect(repo.deductPoints).not.toHaveBeenCalled();
  });

  it("替换内容时保留原 ZIP 布局", async () => {
    const bucket = makeBucket();
    bucket.get.mockResolvedValue({});
    await updateOwnPage(baseUpdate({ bucket, content: "<p>new</p>" }));
    expect(putHtml).toHaveBeenCalledWith(bucket, "p1/index.html", "<p>new</p>");
  });

  it("内容超过 5MB → 扣尺寸费", async () => {
    await updateOwnPage(baseUpdate({ content: "a".repeat(7 * MB) }));
    expect(repo.deductPoints).toHaveBeenCalledWith(expect.anything(), "u1", 10);
  });

  it("内容超过 5MB 且积分不足 → 403，且不写内容不扣分", async () => {
    vi.mocked(repo.getUserPoints).mockResolvedValue(5);
    await expect(updateOwnPage(baseUpdate({ content: "a".repeat(7 * MB) }))).rejects.toMatchObject({ status: 403 });
    expect(putHtml).not.toHaveBeenCalled();
    expect(repo.deductPoints).not.toHaveBeenCalled();
  });

  it("内容超过 50MB → 413", async () => {
    await expect(updateOwnPage(baseUpdate({ content: "a".repeat(51 * MB) }))).rejects.toMatchObject({ status: 413 });
  });

  it("替换 ZIP 文件 → 清理旧对象并写 index.html 与资源", async () => {
    const bucket = makeBucket();
    const zip = zipSync({ "index.html": enc.encode("<h1>hi</h1>"), "a.js": enc.encode("1") });
    await updateOwnPage(baseUpdate({ bucket, file: { bytes: zip, filename: "s.zip" } }));
    expect(deletePageObjects).toHaveBeenCalledWith(bucket, "p1");
    const keys = bucket.put.mock.calls.map((c: any[]) => c[0]);
    expect(keys).toContain("p1/index.html");
    expect(keys).toContain("p1/a.js");
    expect(repo.deductPoints).not.toHaveBeenCalled();
  });

  it("替换 ZIP 无 HTML → 400", async () => {
    const zip = zipSync({ "a.css": enc.encode("x") });
    await expect(updateOwnPage(baseUpdate({ file: { bytes: zip, filename: "s.zip" } }))).rejects.toMatchObject({ status: 400 });
  });

  it("替换 >5MB 的 ZIP → 扣尺寸费", async () => {
    const zip = zipSync({ "index.html": enc.encode("a".repeat(6 * MB)) });
    await updateOwnPage(baseUpdate({ file: { bytes: zip, filename: "s.zip" } }));
    expect(repo.deductPoints).toHaveBeenCalledWith(expect.anything(), "u1", 10);
  });

  it("替换 >50MB 的 ZIP → 413", async () => {
    const zip = zipSync({ "index.html": enc.encode("a".repeat(51 * MB)) });
    await expect(updateOwnPage(baseUpdate({ file: { bytes: zip, filename: "s.zip" } }))).rejects.toMatchObject({ status: 413 });
  });

  it("替换为扁平 HTML 时清理 ZIP 残留（含分页）", async () => {
    const bucket = makeBucket();
    bucket.list
      .mockResolvedValueOnce({ objects: [{ key: "p1/a" }], truncated: true, cursor: "c1" })
      .mockResolvedValueOnce({ objects: [{ key: "p1/b" }], truncated: false });
    await updateOwnPage(baseUpdate({ bucket, file: { bytes: enc.encode("<p>x</p>"), filename: "a.html" } }));
    expect(putHtml).toHaveBeenCalledWith(bucket, "p1.html", "<p>x</p>");
    expect(bucket.delete).toHaveBeenCalledTimes(2);
  });

  it("替换为扁平 HTML 且无残留 → 不调用 delete", async () => {
    const bucket = makeBucket();
    await updateOwnPage(baseUpdate({ bucket, file: { bytes: enc.encode("<p>x</p>"), filename: "a.html" } }));
    expect(bucket.delete).not.toHaveBeenCalled();
  });
});
