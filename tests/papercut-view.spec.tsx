import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import "~/lib/i18n";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ to, children, ...rest }: any) => (
    <a href={to} {...rest}>
      {children}
    </a>
  ),
}));

import { PaperCutView } from "~/components/papercut/PaperCutView";

function makeCtx() {
  const ctx: Record<string, any> = {};
  for (const m of [
    "setTransform",
    "clearRect",
    "beginPath",
    "moveTo",
    "lineTo",
    "closePath",
    "arc",
    "quadraticCurveTo",
    "fill",
    "stroke",
    "translate",
    "rotate",
    "scale",
    "save",
    "restore",
    "drawImage",
  ]) {
    ctx[m] = vi.fn();
  }
  ctx.createRadialGradient = vi.fn(() => ({ addColorStop: vi.fn() }));
  ctx.canvas = {};
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 1;
  ctx.fillStyle = "#000";
  return ctx as unknown as CanvasRenderingContext2D;
}

function rawPayload(nums: number[]): string {
  const bytes = new Uint8Array(new Int16Array(nums).buffer);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return "0" + btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

const payload = rawPayload([8, 1, 3, 100, 200, -300, -400, 500, -600]);

beforeEach(() => {
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(makeCtx());
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  window.history.replaceState({}, "", "/");
});

describe("PaperCutView", () => {
  it("renders a shared artwork with a create-your-own link", async () => {
    window.history.replaceState({}, "", `/papercut/view?d=${payload}`);
    const { container } = render(<PaperCutView />);

    await waitFor(() =>
      expect(screen.getByText("Paper Cut Showcase")).toBeTruthy()
    );
    const canvas = container.querySelector("canvas");
    expect(canvas).toBeTruthy();
    expect(canvas!.width).toBeGreaterThan(0);

    const link = screen.getByText("Create Your Own").closest("a");
    expect(link?.getAttribute("href")).toBe("/papercut");
  });

  it("shows an invalid message when no payload is present", async () => {
    window.history.replaceState({}, "", "/papercut/view");
    const { container } = render(<PaperCutView />);
    await waitFor(() =>
      expect(
        screen.getByText("This artwork link is invalid or expired.")
      ).toBeTruthy()
    );
    expect(container.querySelector("canvas")).toBeNull();
    expect(screen.getByText("Create Your Own")).toBeTruthy();
  });

  it("shows an invalid message for a malformed payload", async () => {
    window.history.replaceState({}, "", "/papercut/view?d=0broken");
    render(<PaperCutView />);
    await waitFor(() =>
      expect(
        screen.getByText("This artwork link is invalid or expired.")
      ).toBeTruthy()
    );
  });
});
