import { useEffect } from "react";
import { I18nextProvider, useTranslation } from "react-i18next";
import i18n, { getBcp47 } from "./i18n";
import { parseLangFromPath } from "./seo";

/**
 * Keeps <html lang> in sync with the active language (as a BCP-47 tag for
 * accessibility / SEO), and ensures the i18n instance matches the URL on mount.
 *
 * Language is URL-driven: the URL prefix is the source of truth. On client-side
 * navigation within the same language the i18n language is unchanged; switching
 * language reloads the page (LangSwitcher), re-initializing from the new URL.
 */
function LangWatcher() {
  const { i18n: i18nInstance } = useTranslation();

  useEffect(() => {
    // Ensure i18n matches the URL on mount (defensive — init already reads URL).
    const urlLang = parseLangFromPath(window.location.pathname);
    if (i18nInstance.language !== urlLang) {
      i18nInstance.changeLanguage(urlLang);
    }
    document.documentElement.lang = getBcp47(i18nInstance.language);

    const handle = (lng: string) => {
      document.documentElement.lang = getBcp47(lng);
    };
    i18nInstance.on("languageChanged", handle);
    return () => {
      i18nInstance.off("languageChanged", handle);
    };
  }, [i18nInstance]);

  return null;
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  return (
    <I18nextProvider i18n={i18n}>
      <LangWatcher />
      {children}
    </I18nextProvider>
  );
}
