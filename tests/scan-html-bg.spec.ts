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
}));

vi.mock("../server/features/pages/pages.repo", () => ({
  deletePageRecord: vi.fn(),
}));

import { scanHtmlInBackground } from "../server/features/pages/pages.service";
import { detectAndSanitizeHtml, extractDomains, checkDomainsWithPhishDestroy, detectWithAi } from "../server/features/pages/html-guard";
import { deletePageObjects, deleteTmpByBucketId } from "../server/features/pages/pages.storage";
import { deletePageRecord } from "../server/features/pages/pages.repo";

const mockDetect = vi.mocked(detectAndSanitizeHtml);
const mockExtract = vi.mocked(extractDomains);
const mockPhish = vi.mocked(checkDomainsWithPhishDestroy);
const mockAi = vi.mocked(detectWithAi);
const mockDeletePageObjects = vi.mocked(deletePageObjects);
const mockDeleteTmp = vi.mocked(deleteTmpByBucketId);
const mockDeleteRecord = vi.mocked(deletePageRecord);

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
