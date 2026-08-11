import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import zh from "./locales/zh.json";
import en from "./locales/en.json";
import es from "./locales/es.json";
import pt from "./locales/pt.json";
import fr from "./locales/fr.json";

const resources = {
  zh: { translation: zh },
  en: { translation: en },
  es: { translation: es },
  pt: { translation: pt },
  fr: { translation: fr },
};

const SUPPORTED = ["zh", "en", "es", "pt", "fr"];

function detectLang(browserLang: string): string {
  const base = browserLang.toLowerCase().split("-")[0];
  if (SUPPORTED.includes(base)) return base;
  return "en";
}

const lang =
  typeof window !== "undefined"
    ? localStorage.getItem("lang") || detectLang(navigator.language)
    : "zh";

i18n.use(initReactI18next).init({
  resources,
  lng: lang,
  fallbackLng: "zh",
  interpolation: { escapeValue: false },
});

export default i18n;

export function setLanguage(lng: string) {
  i18n.changeLanguage(lng);
  if (typeof window !== "undefined") {
    localStorage.setItem("lang", lng);
    document.documentElement.lang = lng;
  }
}

export function getBcp47(lng: string | undefined): string {
  switch (lng?.toLowerCase().split("-")[0]) {
    case "zh": return "zh-CN";
    case "es": return "es-ES";
    case "pt": return "pt-BR";
    case "fr": return "fr-FR";
    default: return "en-US";
  }
}
