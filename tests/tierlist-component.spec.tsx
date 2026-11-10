import { describe, it, expect, beforeAll, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { loadLocale } from "~/lib/i18n";
import { TierListMaker } from "~/components/tierlist/TierListMaker";

/**
 * 等级编辑回归测试。
 *
 * 背景：等级名称原来靠三连 `prompt()`，浏览器压制弹窗后完全改不了；
 * 现在改为应用内弹窗 + 明确的 ✎ 按钮。这里锁住三条路径：
 *  1. ✎ 按钮能打开弹窗；
 *  2. 改名保存后界面与 localStorage 都更新；
 *  3. 英文副标题可以清空。
 */

beforeAll(async () => {
  await loadLocale("en");
});

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  cleanup();
  localStorage.clear();
});

function storedTier(index: number) {
  const raw = localStorage.getItem("ai-tierlist_state");
  if (!raw) return null;
  return JSON.parse(raw).tiers[index] as { id: string; label: string; en: string };
}

describe("等级编辑", () => {
  it("点击 ✎ 打开弹窗，改名后界面与存档都更新", async () => {
    render(<TierListMaker />);

    // 5 个等级各有一个编辑按钮（aria-label 来自 ui.editTier）
    const editButtons = await screen.findAllByLabelText(/Edit tier/i);
    expect(editButtons).toHaveLength(5);

    fireEvent.click(editButtons[0]);

    const nameInput = await screen.findByDisplayValue("S God tier");
    fireEvent.change(nameInput, { target: { value: "S 神级" } });
    fireEvent.click(screen.getByRole("button", { name: /^Save$/ }));

    // 弹窗关闭
    await waitFor(() => {
      expect(screen.queryByDisplayValue("S 神级")).toBeNull();
    });
    // 界面更新
    expect((await screen.findAllByText("S 神级")).length).toBeGreaterThan(0);
    // 存档更新
    await waitFor(() => {
      expect(storedTier(0)?.label).toBe("S 神级");
    });
    expect(storedTier(0)?.id).toBe("t1");
  });

  it("英文副标题可以清空（旧实现会忽略空值）", async () => {
    render(<TierListMaker />);

    const editButtons = await screen.findAllByLabelText(/Edit tier/i);
    fireEvent.click(editButtons[1]); // A 档

    const enInput = await screen.findByDisplayValue("Recommended");
    fireEvent.change(enInput, { target: { value: "" } });
    fireEvent.click(screen.getByRole("button", { name: /^Save$/ }));

    await waitFor(() => {
      expect(storedTier(1)?.en).toBe("");
    });
  });

  it("点击等级标签本体同样可以编辑", async () => {
    const { container } = render(<TierListMaker />);

    await screen.findAllByLabelText(/Edit tier/i);
    const label = container.querySelector(".tl-tier-label .tname");
    expect(label?.textContent).toBe("S God tier");
    fireEvent.click(label!);

    expect(await screen.findByDisplayValue("S God tier")).toBeTruthy();
  });
});
