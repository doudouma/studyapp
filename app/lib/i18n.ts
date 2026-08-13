import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import zh from "./locales/zh.json";
import en from "./locales/en.json";
import es from "./locales/es.json";
import pt from "./locales/pt.json";
import fr from "./locales/fr.json";
import { parseLangFromPath, DEFAULT_LANG, type Lang } from "./lang";

const resources = {
  zh: { translation: zh },
  en: { translation: en },
  es: { translation: es },
  pt: { translation: pt },
  fr: { translation: fr },
};

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
 */
function detectInitialLang(): Lang {
  if (typeof window !== "undefined") {
    return parseLangFromPath(window.location.pathname);
  }
  return DEFAULT_LANG; // server default; server.tsx overrides per-request
}

i18n.use(initReactI18next).init({
  resources,
  lng: detectInitialLang(),
  fallbackLng: DEFAULT_LANG,
  interpolation: { escapeValue: false },
});

export default i18n;

// getBcp47 is re-exported from ./lang (single source of truth) so existing
// callers importing from "~/lib/i18n" keep working.
export { getBcp47 } from "./lang";
