export const SUPPORTED_EXTS = [
  "doc", "docx", "ppt", "pptx", "xls", "xlsx",
  "odt", "ods", "odp", "rtf", "epub", "csv", "pdf",
];

export const MAX_SIZE = 20 * 1024 * 1024;

export const PUBLISH_LIMIT = 5 * 1024 * 1024;

export type EngineStatus = "idle" | "loading" | "ready" | "error";

type WasmModule = typeof import("@firecrawl/anydoc-wasm");

let engine: WasmModule | null = null;
let enginePromise: Promise<WasmModule> | null = null;

export function ensureEngine(): Promise<WasmModule> {
  if (engine) return Promise.resolve(engine);
  if (!enginePromise) {
    enginePromise = (async () => {
      const mod = (await import("@firecrawl/anydoc-wasm")) as WasmModule;
      await mod.default();
      engine = mod;
      return mod;
    })().catch((err) => {
      enginePromise = null;
      throw err;
    });
  }
  return enginePromise;
}

export function isSupportedExt(name: string): boolean {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  return SUPPORTED_EXTS.includes(ext);
}

export function formatLabel(format: string | undefined): string {
  return format ?? "unknown";
}

export interface ConvertResult {
  markdown: string;
  format: string | undefined;
  ms: number;
}

export function toMarkdownFromFile(
  bytes: Uint8Array,
  name: string,
): ConvertResult {
  const mod = engine;
  if (!mod) throw new Error("engine-not-ready");
  const format = mod.formatFromBytes(bytes) ?? mod.formatFromPath(name);
  const started = performance.now();
  const markdown = mod.toMarkdownBytes(bytes, format ?? null);
  const ms = Math.max(1, Math.round(performance.now() - started));
  return { markdown, format, ms };
}

const ERROR_KEYS: Record<string, string> = {
  encrypted: "any2md.error.encrypted",
  unsupported: "any2md.error.unsupported",
  malformed: "any2md.error.malformed",
  resourceLimit: "any2md.error.resourceLimit",
  missingPart: "any2md.error.missingPart",
};

export function errorKey(code: unknown): string {
  if (typeof code === "string" && ERROR_KEYS[code]) return ERROR_KEYS[code];
  return "any2md.error.unknown";
}
