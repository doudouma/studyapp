import { describe, it, expect, vi, beforeEach, afterEach, beforeAll } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { loadLocale } from "~/lib/i18n";
import { PaperCutApp } from "~/components/papercut/PaperCutApp";

beforeAll(async () => {
  await loadLocale("en");
});

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
    "clip",
    "rect",
    "roundRect",
  ]) {
    ctx[m] = vi.fn();
  }
  ctx.createRadialGradient = vi.fn(() => ({ addColorStop: vi.fn() }));
  ctx.createLinearGradient = vi.fn(() => ({ addColorStop: vi.fn() }));
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

const RECT = {
  x: 0,
  y: 0,
  left: 0,
  top: 0,
  width: 400,
  height: 600,
  right: 400,
  bottom: 600,
  toJSON() {},
} as DOMRect;

function pointer(type: string, init: Record<string, unknown>) {
  const Ctor: any = (globalThis as any).PointerEvent ?? MouseEvent;
  return new Ctor(type, { bubbles: true, cancelable: true, ...init });
}

const toolButtons = (c: HTMLElement) =>
  Array.from(c.querySelectorAll<HTMLButtonElement>(".papercut-tools button"));
const disabledStates = (c: HTMLElement) =>
  toolButtons(c).map((b) => b.classList.contains("disabled"));

async function drawCut(container: HTMLElement) {
  fireEvent.click(screen.getByText("Start Cutting"));
  await waitFor(() =>
    expect(container.querySelector<HTMLCanvasElement>(".papercut-canvas")!.width).toBe(400)
  );
  const stage = container.querySelector(".papercut-stage")!;
  stage.dispatchEvent(pointer("pointerdown", { clientX: 200, clientY: 500, pointerId: 1, buttons: 1 }));
  stage.dispatchEvent(pointer("pointermove", { clientX: 240, clientY: 500, pointerId: 1, buttons: 1 }));
  stage.dispatchEvent(pointer("pointermove", { clientX: 220, clientY: 450, pointerId: 1, buttons: 1 }));
  stage.dispatchEvent(pointer("pointerup", { clientX: 220, clientY: 450, pointerId: 1 }));
  await waitFor(() => expect(disabledStates(container)[0]).toBe(false));
}

beforeEach(() => {
  localStorage.clear();
  if (typeof (globalThis as any).PointerEvent === "undefined") {
    class PE extends MouseEvent {
      pointerId: number;
      constructor(type: string, init: any = {}) {
        super(type, init);
        this.pointerId = init.pointerId ?? 1;
      }
    }
    vi.stubGlobal("PointerEvent", PE);
  }
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(makeCtx());
  vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation(
    ((cb: BlobCallback) => cb(null)) as any
  );
  vi.spyOn(Element.prototype, "getBoundingClientRect").mockReturnValue(RECT);
  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) =>
    setTimeout(() => cb(performance.now() + 1e6), 0) as unknown as number
  );
  vi.stubGlobal("cancelAnimationFrame", (id: number) => clearTimeout(id));
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: {
      writeText: vi.fn().mockResolvedValue(undefined),
      write: vi.fn().mockResolvedValue(undefined),
    },
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  window.history.replaceState({}, "", "/");
});

describe("PaperCutApp home", () => {
  it("renders the home screen", () => {
    render(<PaperCutApp />);
    expect(screen.getByText("Paper Cut Art")).toBeTruthy();
    expect(screen.getByText("Start Cutting")).toBeTruthy();
  });

  it("switches to the cut page when starting", async () => {
    const { container } = render(<PaperCutApp />);
    fireEvent.click(screen.getByText("Start Cutting"));
    expect(screen.getByText("Unfold")).toBeTruthy();
    await waitFor(() =>
      expect(container.querySelector<HTMLCanvasElement>(".papercut-canvas")!.width).toBe(400)
    );
  });
});

describe("PaperCutApp drawing and history", () => {
  it("draws a cut and unfolds the result overlay", async () => {
    const { container } = render(<PaperCutApp />);
    await drawCut(container);
    fireEvent.click(screen.getByText("Unfold"));
    await waitFor(() =>
      expect(container.querySelector(".papercut-overlay.show")).toBeTruthy()
    );
  });

  it("clear, undo and redo keep history consistent", async () => {
    const { container } = render(<PaperCutApp />);
    await drawCut(container);
    expect(disabledStates(container)).toEqual([false, false, true]);

    fireEvent.click(toolButtons(container)[0]); // clear
    await waitFor(() => expect(disabledStates(container)).toEqual([true, false, true]));

    fireEvent.click(toolButtons(container)[1]); // undo
    await waitFor(() => expect(disabledStates(container)).toEqual([false, false, false]));

    fireEvent.click(toolButtons(container)[2]); // redo
    await waitFor(() => expect(disabledStates(container)).toEqual([true, false, true]));
  });
});

describe("PaperCutApp shared artwork links", () => {
  const payload = rawPayload([8, 1, 3, 100, 200, -300, -400, 500, -600]);

  it("opens the result overlay for a valid ?d payload", async () => {
    window.history.replaceState({}, "", `/?d=${payload}`);
    render(<PaperCutApp />);
    await waitFor(() =>
      expect(document.querySelector(".papercut-overlay.show")).toBeTruthy()
    );
  });

  it("ignores an invalid ?d payload", async () => {
    window.history.replaceState({}, "", "/?d=0not-a-real-payload");
    render(<PaperCutApp />);
    await new Promise((r) => setTimeout(r, 60));
    expect(document.querySelector(".papercut-overlay.show")).toBeNull();
    expect(screen.getByText("Start Cutting")).toBeTruthy();
  });

  it("builds a /papercut/view link and copies it from the share modal", async () => {
    window.history.replaceState({}, "", `/papercut?d=${payload}`);
    const { container } = render(<PaperCutApp />);
    await waitFor(() =>
      expect(container.querySelector(".papercut-overlay.show")).toBeTruthy()
    );

    fireEvent.click(container.querySelector(".papercut-share-btn")!);
    const copy = await screen.findByText("Copy Link");
    fireEvent.click(copy);

    const writeText = navigator.clipboard.writeText as ReturnType<typeof vi.fn>;
    await waitFor(() => expect(writeText).toHaveBeenCalled());
    const url = writeText.mock.calls[0][0] as string;
    expect(url).toContain("/papercut/view?d=");
    expect(url.startsWith("http://localhost")).toBe(true);
  });
});
