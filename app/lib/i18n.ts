import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { parseLangFromPath, DEFAULT_LANG, type Lang } from "./lang";

/**
 * Language is derived from the URL (not localStorage), so every language
 * version has a unique, indexable URL:
 *   /        → en (default, no prefix)
 *   /zh/...  → zh
 *   /es/...  → es
 *   /pt/...  → pt
 *   /fr/...  → fr
 *
 * On the server, server.tsx sets the language from the URL prefix before SSR.
 * On the client, we read it from window.location.pathname.
 *
 * **按需加载**：所有语言各成一块 chunk，页面/请求只拉当前语言那一块，
 * 主包不再内置任何 locale JSON。加载时机：
 *   - server: server.tsx 在 SSR 前 `await loadLocale(lang)`
 *   - client: client.tsx 在 hydration 前 `await loadLocale(urlLang)`
 * 切换语言是一次整页导航（LangSwitcher），所以客户端每次只用装一门语言。
 *
 * fallbackLng 关闭：未翻译的 key 直接返回 key 本身（不再回退英文，因为英文
 * 也不再预置在主包里）。各语言文件应保持 key 完整（见 tests 的 key 校验）。
 */
type Messages = Record<string, unknown>;

const LOADERS = import.meta.glob<{ default: Messages }>("./locales/*.json", {
  import: "default",
}) as Record<string, () => Promise<Messages>>;

/** 已加入 i18n 实例的语言（isolate / 页面级缓存） */
const loaded = new Set<Lang>();
/** 正在加载的语言，避免并发重复拉取同一 chunk */
const inflight = new Map<Lang, Promise<void>>();

function detectInitialLang(): Lang {
  if (typeof window !== "undefined") {
    return parseLangFromPath(window.location.pathname);
  }
  return DEFAULT_LANG; // server default; server.tsx overrides per-request
}

const ready = i18n.use(initReactI18next).init({
  resources: {},
  lng: detectInitialLang(),
  fallbackLng: false,
  interpolation: { escapeValue: false },
});

/**
 * 加载某语言的 locale 并加入 i18n 实例。幂等且并发安全。
 * 必须在任何 `i18n.t()` / `useTranslation()` 渲染之前 await。
 */
export async function loadLocale(lang: Lang): Promise<void> {
  await ready;
  if (loaded.has(lang)) return;

  const existing = inflight.get(lang);
  if (existing) return existing;

  const load = LOADERS[`./locales/${lang}.json`];
  if (!load) throw new Error(`No locale bundle for "${lang}"`);

  const pending = load()
    .then((messages) => {
      i18n.addResourceBundle(lang, "translation", messages, true, true);
      loaded.add(lang);
    })
    .finally(() => {
      inflight.delete(lang);
    });

  inflight.set(lang, pending);
  return pending;
}

export default i18n;

// getBcp47 is re-exported from ./lang (single source of truth) so existing
// callers importing from "~/lib/i18n" keep working.
export { getBcp47 } from "./lang";
