import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * 用户页面服务的 SEO 卫生（P0）：
 *  - /p/* 整体由 robots.txt 屏蔽，因此不再按页面做收录门槛
 *  - 匿名 tmp 页仍加 meta + X-Robots-Tag 双保险 noindex
 *  - UGC 外链服务时统一补 rel="nofollow ugc noopener"
 */

vi.mock("../server/features/pages/pages.repo", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../server/features/pages/pages.repo")>();
  return {
    ...actual,
    getPageRecord: vi.fn(),
    claimPageView: vi.fn(),
  };
});

import { serveUserPage } from "../server/features/pages/pages.service";
import { getPageRecord } from "../server/features/pages/pages.repo";

const mockGetPageRecord = vi.mocked(getPageRecord);

const HOUR = 3_600_000;
const CRAWLER_UA = "Googlebot/2.1 (+http://www.google.com/bot.html)";

function makeBucket(html: string, key = "abc1234.html") {
  const obj = { key, uploaded: new Date(), text: async () => html };
  const get = vi.fn(async (path: string) => (path === key ? obj : null));
  return { bucket: { get } as unknown as R2Bucket, get };
}

function makeRecord(patch: Record<string, unknown> = {}) {
  return {
    id: "abc1234",
    state: "active",
    burnReason: null,
    expiresAt: null,
    maxViews: null,
    category: "general",
    tags: "",
    title: "My study page",
    isSharedToSquare: true,
    userId: "user_1",
    createdAt: new Date(Date.now() - 48 * HOUR),
    sharedAt: new Date(Date.now() - 48 * HOUR),
    ...patch,
    // Drizzle row 的其它列与本用例无关
  } as never;
}

async function serve(html: string, key = "abc1234.html") {
  const { bucket } = makeBucket(html, key);
  return serveUserPage(
    { d1: {} as D1Database, bucket, userAgent: CRAWLER_UA },
    "abc1234",
    "en",
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("serveUserPage - 收录门槛", () => {
  it("广场分享页：不加 noindex，外链补 rel", async () => {
    mockGetPageRecord.mockResolvedValue(makeRecord());
    const res = await serve(
      '<html><head><title>x</title></head><body><a href="https://example.com/x">x</a></body></html>',
    );
    expect(res.status).toBe(200);
    expect(res.headers.get("x-robots-tag")).toBeNull();
    const body = await res.text();
    expect(body).not.toContain('name="robots" content="noindex"');
    expect(body).toContain('rel="nofollow ugc noopener"');
  });

  it("分享页不再做逐页质量判断：刚创建、标题为占位也照常返回", async () => {
    mockGetPageRecord.mockResolvedValue(
      makeRecord({ createdAt: new Date(), sharedAt: new Date(), title: "未命名" }),
    );
    const res = await serve('<html><head><title>x</title></head><body>hi</body></html>');
    expect(res.status).toBe(200);
    expect(res.headers.get("x-robots-tag")).toBeNull();
  });

  it("匿名 tmp 页面：noindex", async () => {
    mockGetPageRecord.mockResolvedValue(null as never);
    const res = await serve('<html><head></head><body>anon</body></html>', "tmp/abc1234.html");
    expect(res.status).toBe(200);
    expect(res.headers.get("x-robots-tag")).toBe("noindex, nofollow");
  });

  it("没有 </head> 的碎片 HTML：靠响应头兜底 noindex", async () => {
    mockGetPageRecord.mockResolvedValue(null as never);
    const res = await serve('<div><a href="https://x.com">x</a></div>', "tmp/abc1234.html");
    expect(res.headers.get("x-robots-tag")).toBe("noindex, nofollow");
    const body = await res.text();
    expect(body).not.toContain('name="robots"');
    expect(body).toContain('rel="nofollow ugc noopener"');
  });

  it("未分享的登录用户页面保持原有行为（不主动 noindex）", async () => {
    mockGetPageRecord.mockResolvedValue(makeRecord({ isSharedToSquare: false }));
    const res = await serve("<html><head></head><body>private</body></html>");
    expect(res.headers.get("x-robots-tag")).toBeNull();
  });
});
