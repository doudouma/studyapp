import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import zh from "./locales/zh.json";
import en from "./locales/en.json";

const resources = { zh: { translation: zh }, en: { translation: en } };

const lang =
  typeof window !== "undefined"
    ? localStorage.getItem("lang") || navigator.language?.startsWith("zh") ? "zh" : "en"
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
