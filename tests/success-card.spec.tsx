import { describe, it, expect, vi, beforeEach, afterEach, beforeAll } from "vitest";
import { render, cleanup, waitFor } from "@testing-library/react";
import { loadLocale } from "~/lib/i18n";

beforeAll(async () => {
  await loadLocale("en");
});

vi.mock("~/lib/upload-flow", () => ({
  captureAndUploadThumbnail: vi.fn(),
}));

vi.mock("qrcode/lib/browser.js", () => ({
  toString: vi.fn(async () => "<svg></svg>"),
}));

import { SuccessCard } from "~/components/SuccessCard";
import { captureAndUploadThumbnail } from "~/lib/upload-flow";

const user = { id: "u1", name: "N", email: "e@x.com" };

function renderCard(props: Record<string, unknown> = {}) {
  return render(
    <SuccessCard
      url="/p/abc1234"
      pageId="abc1234"
      isPermanent
      onReset={() => {}}
      {...(props as any)}
    />
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(captureAndUploadThumbnail).mockResolvedValue(undefined);
});

afterEach(() => {
  cleanup();
});

describe("SuccessCard 缩略图生成条件", () => {
  it("已登录 + 已分享 → 触发生成", async () => {
    renderCard({ user, shareToSquare: true });
    await waitFor(() => expect(captureAndUploadThumbnail).toHaveBeenCalledWith("abc1234"));
  });

  it("已登录但未分享 → 不生成", async () => {
    renderCard({ user, shareToSquare: false });
    await new Promise((r) => setTimeout(r, 20));
    expect(captureAndUploadThumbnail).not.toHaveBeenCalled();
  });

  it("未登录（匿名）→ 不生成", async () => {
    renderCard({ user: null, shareToSquare: true });
    await new Promise((r) => setTimeout(r, 20));
    expect(captureAndUploadThumbnail).not.toHaveBeenCalled();
  });

  it("生成失败不抛错", async () => {
    vi.mocked(captureAndUploadThumbnail).mockRejectedValue(new Error("capture failed"));
    renderCard({ user, shareToSquare: true });
    await waitFor(() => expect(captureAndUploadThumbnail).toHaveBeenCalled());
  });
});
