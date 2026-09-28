import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../server/features/pages/html-guard", () => ({
  detectAndSanitizeHtml: vi.fn(),
  extractDomains: vi.fn(),
  checkDomainsWithPhishDestroy: vi.fn(),
  detectWithAi: vi.fn(),
}));

vi.mock("../server/features/pages/pages.storage", () => ({
  deletePageObjects: vi.fn(),
  deleteTmpByBucketId: vi.fn(),
  putHtml: vi.fn(),
  getMimeType: vi.fn(),
  isExpiredByUploaded: vi.fn(),
}));

vi.mock("../server/features/pages/pages.repo", () => ({
  deletePageRecord: vi.fn(),
  getPageRecord: vi.fn(),
  getPageMeta: vi.fn(),
  incrementPageViewCount: vi.fn(),
}));

vi.mock("../server/features/admin/upload-log.repo", () => ({
  insertUploadLog: vi.fn(),
  insertScanLog: vi.fn(),
  getLatestBlockedScan: vi.fn(),
}));

import { scanHtmlInBackground, serveUserPage } from "../server/features/pages/pages.service";
import { detectAndSanitizeHtml, extractDomains, checkDomainsWithPhishDestroy, detectWithAi } from "../server/features/pages/html-guard";
import { deletePageObjects, deleteTmpByBucketId } from "../server/features/pages/pages.storage";
import { deletePageRecord } from "../server/features/pages/pages.repo";
import { insertScanLog, getLatestBlockedScan } from "../server/features/admin/upload-log.repo";

const mockDetect = vi.mocked(detectAndSanitizeHtml);
const mockExtract = vi.mocked(extractDomains);
const mockPhish = vi.mocked(checkDomainsWithPhishDestroy);
const mockAi = vi.mocked(detectWithAi);
const mockDeletePageObjects = vi.mocked(deletePageObjects);
const mockDeleteTmp = vi.mocked(deleteTmpByBucketId);
const mockDeleteRecord = vi.mocked(deletePageRecord);
const mockInsertScanLog = vi.mocked(insertScanLog);
const mockGetBlocked = vi.mocked(getLatestBlockedScan);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("scanHtmlInBackground", () => {
  const bucket = {} as R2Bucket;
  const d1 = {} as D1Database;
  const ai = {} as Ai;

  describe("安全内容 - 不删除", () => {
    it("正则检测通过且无外部域名时保留页面", async () => {
      mockDetect.mockReturnValue({ safe: true, threats: [], sanitizedHtml: "<p>ok</p>" });
      mockExtract.mockReturnValue([]);

      await scanHtmlInBackground({ bucket, d1 }, "abc1234", "<p>ok</p>", false);

      expect(mockDeletePageObjects).not.toHaveBeenCalled();
      expect(mockDeleteRecord).not.toHaveBeenCalled();
    });

    it("正则检测通过且域名安全时保留页面", async () => {
      mockDetect.mockReturnValue({ safe: true, threats: [], sanitizedHtml: "<p>ok</p>" });
      mockExtract.mockReturnValue(["example.com"]);
      mockPhish.mockResolvedValue({ safe: true, threats: [] });

      await scanHtmlInBackground({ bucket, d1 }, "abc1234", '<a href="https://example.com">link</a>', false);

      expect(mockDeletePageObjects).not.toHaveBeenCalled();
    });
  });

  describe("scan_log 写入", () => {
    it("审核通过时写入 approved 记录", async () => {
      mockDetect.mockReturnValue({ safe: true, threats: [], sanitizedHtml: "<p>ok</p>" });
      mockExtract.mockReturnValue([]);

      await scanHtmlInBackground({ bucket, d1 }, "abc1234", "<p>ok</p>", false);

      expect(mockInsertScanLog).toHaveBeenCalledTimes(1);
      expect(mockInsertScanLog).toHaveBeenCalledWith(
        d1,
        expect.objectContaining({ pageId: "abc1234", status: "approved", htmlLength: 9, isAnonymous: false })
      );
    });

    it("正则不通过时写入 blocked 记录（reason=regex + threats JSON）", async () => {
      mockDetect.mockReturnValue({
        safe: false,
        threats: [{ label: "iframe", count: 2 }],
        sanitizedHtml: "",
      });

      await scanHtmlInBackground({ bucket, d1 }, "abc1234", "<iframe></iframe>", false);

      expect(mockInsertScanLog).toHaveBeenCalledWith(
        d1,
        expect.objectContaining({
          pageId: "abc1234",
          status: "blocked",
          reason: "regex",
          threats: JSON.stringify([{ label: "iframe", count: 2 }]),
          isAnonymous: false,
        })
      );
    });

    it("钓鱼不通过时写入 blocked 记录（reason=phishing）", async () => {
      mockDetect.mockReturnValue({ safe: true, threats: [], sanitizedHtml: "<p>ok</p>" });
      mockExtract.mockReturnValue(["evil.com"]);
      mockPhish.mockResolvedValue({
        safe: false,
        threats: [{ domain: "evil.com", severity: "high", score: 80, keywords: ["login"] }],
      });

      await scanHtmlInBackground({ bucket, d1 }, "abc1234", '<a href="https://evil.com">phish</a>', true);

      expect(mockInsertScanLog).toHaveBeenCalledWith(
        d1,
        expect.objectContaining({
          pageId: "abc1234",
          status: "blocked",
          reason: "phishing",
          threats: JSON.stringify([{ domain: "evil.com", severity: "high", score: 80, keywords: ["login"] }]),
          isAnonymous: true,
        })
      );
    });

    it("AI 不通过时写入 blocked 记录（reason=ai + verdict）", async () => {
      mockDetect.mockReturnValue({ safe: true, threats: [], sanitizedHtml: "<p>ok</p>" });
      mockExtract.mockReturnValue([]);
      mockAi.mockResolvedValue({ safe: false, verdict: "unsafe: phishing page" });

      await scanHtmlInBackground({ bucket, d1, ai }, "abc1234", "<p>suspicious</p>", false);

      expect(mockInsertScanLog).toHaveBeenCalledWith(
        d1,
        expect.objectContaining({
          pageId: "abc1234",
          status: "blocked",
          reason: "ai",
          threats: JSON.stringify({ verdict: "unsafe: phishing page" }),
        })
      );
    });

    it("审核异常时写入 error 记录", async () => {
      mockDetect.mockImplementation(() => { throw new Error("parse error"); });

      await scanHtmlInBackground({ bucket, d1 }, "abc1234", "<p>content</p>", false);

      expect(mockInsertScanLog).toHaveBeenCalledWith(
        d1,
        expect.objectContaining({
          pageId: "abc1234",
          status: "error",
          threats: JSON.stringify({ error: "Error: parse error" }),
        })
      );
    });

    it("无 d1 时不写 scan_log 也不抛错", async () => {
      mockDetect.mockReturnValue({ safe: true, threats: [], sanitizedHtml: "<p>ok</p>" });
      mockExtract.mockReturnValue([]);

      await expect(
        scanHtmlInBackground({ bucket }, "abc1234", "<p>ok</p>", false)
      ).resolves.not.toThrow();
      expect(mockInsertScanLog).not.toHaveBeenCalled();
    });
  });

  describe("不安全内容 - 删除页面", () => {
    it("正则检测不通过时删除已登录用户页面", async () => {
      mockDetect.mockReturnValue({
        safe: false,
        threats: [{ label: "iframe", count: 1 }],
        sanitizedHtml: "",
      });

      await scanHtmlInBackground({ bucket, d1 }, "abc1234", "<iframe src='evil.com'>", false);

      expect(mockDeletePageObjects).toHaveBeenCalledWith(bucket, "abc1234");
      expect(mockDeleteRecord).toHaveBeenCalledWith(d1, "abc1234");
    });

    it("正则检测不通过时删除匿名用户 tmp/ 文件", async () => {
      mockDetect.mockReturnValue({
        safe: false,
        threats: [{ label: "iframe", count: 1 }],
        sanitizedHtml: "",
      });

      await scanHtmlInBackground({ bucket, d1 }, "xyz7890", "<iframe src='evil.com'>", true);

      expect(mockDeleteTmp).toHaveBeenCalledWith(bucket, "xyz7890");
      expect(mockDeletePageObjects).not.toHaveBeenCalled();
      expect(mockDeleteRecord).not.toHaveBeenCalled();
    });

    it("钓鱼域名检测不通过时删除页面", async () => {
      mockDetect.mockReturnValue({ safe: true, threats: [], sanitizedHtml: "<p>ok</p>" });
      mockExtract.mockReturnValue(["evil.com"]);
      mockPhish.mockResolvedValue({
        safe: false,
        threats: [{ domain: "evil.com", severity: "high", score: 80, keywords: ["login"] }],
      });

      await scanHtmlInBackground({ bucket, d1 }, "abc1234", '<a href="https://evil.com">phish</a>', false);

      expect(mockDeletePageObjects).toHaveBeenCalledWith(bucket, "abc1234");
      expect(mockDeleteRecord).toHaveBeenCalledWith(d1, "abc1234");
    });

    it("AI 检测不通过时删除页面", async () => {
      mockDetect.mockReturnValue({ safe: true, threats: [], sanitizedHtml: "<p>ok</p>" });
      mockExtract.mockReturnValue([]);
      mockAi.mockResolvedValue({ safe: false, verdict: "unsafe: phishing page" });

      await scanHtmlInBackground({ bucket, d1, ai }, "abc1234", "<p>suspicious</p>", false);

      expect(mockDeletePageObjects).toHaveBeenCalledWith(bucket, "abc1234");
      expect(mockDeleteRecord).toHaveBeenCalledWith(d1, "abc1234");
    });
  });

  describe("容错", () => {
    it("检测异常时不影响页面（不删除）", async () => {
      mockDetect.mockImplementation(() => { throw new Error("parse error"); });

      await scanHtmlInBackground({ bucket, d1 }, "abc1234", "<p>content</p>", false);

      expect(mockDeletePageObjects).not.toHaveBeenCalled();
    });

    it("删除失败不抛出异常", async () => {
      mockDetect.mockReturnValue({
        safe: false,
        threats: [{ label: "iframe", count: 1 }],
        sanitizedHtml: "",
      });
      mockDeletePageObjects.mockRejectedValue(new Error("r2 down"));

      await expect(
        scanHtmlInBackground({ bucket, d1 }, "abc1234", "<iframe>", false)
      ).resolves.not.toThrow();
    });
  });
});

describe("serveUserPage - 被下架页面提示", () => {
  const makeBucket = () => ({ get: vi.fn().mockResolvedValue(null) }) as unknown as R2Bucket;

  it("有 blocked 记录时返回 410 及原因（regex 显示标签名）", async () => {
    const bucket = makeBucket();
    mockGetBlocked.mockResolvedValue({ reason: "regex", labels: ["iframe", "object"] });

    const res = await serveUserPage(
      { d1: {} as D1Database, bucket },
      "abc1234",
      "zh-CN,zh;q=0.9"
    );

    expect(res.status).toBe(410);
    const body = await res.text();
    expect(body).toContain("该页面因违反内容规范已被下架");
    expect(body).toContain("iframe, object");
    expect(bucket.get).toHaveBeenCalled();
  });

  it("phishing 原因只显示类别文案，不泄露 threats 细节", async () => {
    mockGetBlocked.mockResolvedValue({ reason: "phishing", labels: [] });

    const res = await serveUserPage(
      { d1: {} as D1Database, bucket: makeBucket() },
      "abc1234",
      "zh-CN,zh;q=0.9"
    );

    expect(res.status).toBe(410);
    const body = await res.text();
    expect(body).toContain("页面包含疑似钓鱼/欺诈内容");
    expect(body).not.toContain("evil.com");
  });

  it("无 blocked 记录时返回普通 404", async () => {
    mockGetBlocked.mockResolvedValue(null);

    const res = await serveUserPage(
      { d1: {} as D1Database, bucket: makeBucket() },
      "abc1234",
      "zh-CN,zh;q=0.9"
    );

    expect(res.status).toBe(404);
    const body = await res.text();
    expect(body).toContain("页面不存在或已过期");
  });

  it("blocked 查询异常时回退普通 404", async () => {
    mockGetBlocked.mockRejectedValue(new Error("d1 down"));

    const res = await serveUserPage(
      { d1: {} as D1Database, bucket: makeBucket() },
      "abc1234",
      "zh-CN,zh;q=0.9"
    );

    expect(res.status).toBe(404);
  });

  it("英文 Accept-Language 返回英文下架页", async () => {
    mockGetBlocked.mockResolvedValue({ reason: "ai", labels: [] });

    const res = await serveUserPage(
      { d1: {} as D1Database, bucket: makeBucket() },
      "abc1234",
      "en-US,en;q=0.9"
    );

    expect(res.status).toBe(410);
    const body = await res.text();
    expect(body).toContain("did not pass AI safety review");
  });

  it("getLatestBlockedScan 使用页面 id 查询", async () => {
    mockGetBlocked.mockResolvedValue(null);
    const d1 = {} as D1Database;

    await serveUserPage({ d1, bucket: makeBucket() }, "abc1234", "zh");

    expect(mockGetBlocked).toHaveBeenCalledWith(d1, "abc1234");
  });
});
