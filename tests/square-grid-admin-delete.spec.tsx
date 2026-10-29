import { describe, it, expect, vi, beforeEach, afterEach, beforeAll } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { loadLocale } from "~/lib/i18n";
import type { SquareItem } from "@shared/types/square";

const state = vi.hoisted(() => ({ user: null as { role?: string } | null }));
const deleteAdminPage = vi.hoisted(() => vi.fn());

vi.mock("~/lib/auth-context", () => ({
  useAuth: () => ({ user: state.user }),
}));

vi.mock("~/features/admin/api", () => ({
  deleteAdminPage,
}));

beforeAll(async () => {
  await loadLocale("en");
});

import { SquareGrid } from "~/components/SquareGrid";

function makeItem(overrides: Partial<SquareItem> = {}): SquareItem {
  return {
    id: "p1",
    slug: null,
    title: "Page One",
    category: "math",
    tags: "",
    viewCount: 5,
    sharedAt: 0,
    previewPath: "/thumb.webp",
    userName: null,
    userImage: null,
    ...overrides,
  };
}

beforeEach(() => {
  state.user = null;
  deleteAdminPage.mockReset();
  deleteAdminPage.mockResolvedValue({ ok: true });
});

afterEach(() => {
  cleanup();
});

describe("SquareGrid 渲染", () => {
  it("空列表显示空状态", () => {
    render(<SquareGrid items={[]} />);
    expect(screen.getByText("Square is empty")).toBeTruthy();
  });

  it("渲染分类、标签、作者与浏览量", () => {
    render(
      <SquareGrid
        items={[
          makeItem({
            tags: "algebra, geometry",
            userName: "Alice",
            userImage: "https://example.com/a.png",
          }),
        ]}
      />
    );
    expect(screen.getByText("Math")).toBeTruthy();
    expect(screen.getByText("algebra")).toBeTruthy();
    expect(screen.getByText("geometry")).toBeTruthy();
    expect(screen.getByText("Alice")).toBeTruthy();
    expect(screen.getByText("5")).toBeTruthy();
    expect(screen.getByAltText("Alice")).toBeTruthy();
  });

  it("作者无头像时显示首字母，无作者时显示匿名", () => {
    render(
      <SquareGrid
        items={[
          makeItem({ id: "p1", userName: "Bob", userImage: null }),
          makeItem({ id: "p2", userName: null }),
        ]}
      />
    );
    expect(screen.getByText("B")).toBeTruthy();
    expect(screen.getByText("Anonymous")).toBeTruthy();
  });

  it("未知分类回退为原值", () => {
    render(<SquareGrid items={[makeItem({ category: "astronomy" })]} />);
    expect(screen.getByText("astronomy")).toBeTruthy();
  });

  it("无自定义标题时显示未命名", () => {
    render(<SquareGrid items={[makeItem({ title: "" })]} />);
    expect(screen.getAllByText("Untitled").length).toBeGreaterThan(0);
  });

  it("无 previewPath 时直接渲染 iframe", () => {
    const { container } = render(
      <SquareGrid items={[makeItem({ id: "p9", slug: "my-page", previewPath: null })]} />
    );
    const iframe = container.querySelector("iframe");
    expect(iframe?.getAttribute("src")).toBe("/p/my-page");
    expect(container.querySelector("img")).toBeNull();
  });

  it("缩略图加载失败时降级为 iframe", () => {
    const { container } = render(<SquareGrid items={[makeItem({ id: "p2" })]} />);
    fireEvent.error(container.querySelector("img")!);
    expect(container.querySelector("iframe")?.getAttribute("src")).toBe("/p/p2");
  });

  it("第 9 张起缩略图懒加载", () => {
    const items = Array.from({ length: 9 }, (_, i) =>
      makeItem({ id: `p${i}`, title: `Page ${i}` })
    );
    const { container } = render(<SquareGrid items={items} />);
    const imgs = container.querySelectorAll("img");
    expect(imgs[0].getAttribute("loading")).toBeNull();
    expect(imgs[8].getAttribute("loading")).toBe("lazy");
  });
});

describe("SquareGrid 管理员删除", () => {
  it("非管理员不显示删除按钮", () => {
    state.user = { role: "user" };
    render(<SquareGrid items={[makeItem()]} />);
    expect(screen.queryByRole("button", { name: "Delete" })).toBeNull();
  });

  it("取消确认不调用删除接口", async () => {
    state.user = { role: "admin" };
    render(<SquareGrid items={[makeItem()]} />);
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(await screen.findByText("Delete Page")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(screen.queryByText("Delete Page")).toBeNull());
    expect(deleteAdminPage).not.toHaveBeenCalled();
  });

  it("确认后调用删除接口并移除卡片", async () => {
    state.user = { role: "admin" };
    const onDeleted = vi.fn();
    render(<SquareGrid items={[makeItem({ id: "p7" })]} onDeleted={onDeleted} />);

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    fireEvent.click(await screen.findByRole("button", { name: "Confirm Delete" }));

    await waitFor(() => expect(deleteAdminPage).toHaveBeenCalledWith("p7"));
    await waitFor(() => expect(onDeleted).toHaveBeenCalledWith("p7"));
    await waitFor(() => expect(screen.queryByText("Delete Page")).toBeNull());
  });

  it("未传 onDeleted 时删除成功不报错", async () => {
    state.user = { role: "admin" };
    render(<SquareGrid items={[makeItem({ id: "p8" })]} />);

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    fireEvent.click(await screen.findByRole("button", { name: "Confirm Delete" }));

    await waitFor(() => expect(deleteAdminPage).toHaveBeenCalledWith("p8"));
    await waitFor(() => expect(screen.queryByText("Delete Page")).toBeNull());
  });

  it("接口返回失败时显示错误且保留弹窗", async () => {
    state.user = { role: "admin" };
    deleteAdminPage.mockResolvedValue({ ok: false, error: "boom" });
    const onDeleted = vi.fn();
    render(<SquareGrid items={[makeItem()]} onDeleted={onDeleted} />);

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    fireEvent.click(await screen.findByRole("button", { name: "Confirm Delete" }));

    expect(await screen.findByText("boom")).toBeTruthy();
    expect(onDeleted).not.toHaveBeenCalled();
    expect(screen.getByText("Delete Page")).toBeTruthy();
  });

  it("接口返回失败但无错误信息时使用默认文案", async () => {
    state.user = { role: "admin" };
    deleteAdminPage.mockResolvedValue({ ok: false });
    render(<SquareGrid items={[makeItem()]} />);

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    fireEvent.click(await screen.findByRole("button", { name: "Confirm Delete" }));

    expect(await screen.findByText("Delete failed")).toBeTruthy();
    expect(screen.getByText("Delete Page")).toBeTruthy();
  });

  it("删除过程中点击遮罩不会关闭弹窗", async () => {
    state.user = { role: "admin" };
    let resolveDelete!: (value: { ok: boolean }) => void;
    deleteAdminPage.mockImplementation(
      () => new Promise((resolve) => { resolveDelete = resolve; })
    );
    render(<SquareGrid items={[makeItem()]} />);

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    fireEvent.click(await screen.findByRole("button", { name: "Confirm Delete" }));

    const overlay = document.querySelector('[data-slot="dialog-overlay"]');
    expect(overlay).toBeTruthy();
    fireEvent.pointerDown(overlay!);
    fireEvent.click(overlay!);
    expect(screen.getByText("Delete Page")).toBeTruthy();

    resolveDelete({ ok: true });
    await waitFor(() => expect(screen.queryByText("Delete Page")).toBeNull());
  });

  it("接口抛错时显示通用错误", async () => {
    state.user = { role: "admin" };
    deleteAdminPage.mockRejectedValue(new Error("network"));
    render(<SquareGrid items={[makeItem()]} />);

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    fireEvent.click(await screen.findByRole("button", { name: "Confirm Delete" }));

    expect(await screen.findByText("Delete failed")).toBeTruthy();
  });
});
