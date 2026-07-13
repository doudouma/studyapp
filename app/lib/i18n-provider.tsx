import { useEffect } from "react";
import { I18nextProvider, useTranslation } from "react-i18next";
import i18n, { setLanguage } from "./i18n";

function LangWatcher() {
  const { i18n: i18nInstance } = useTranslation();
  useEffect(() => {
    document.documentElement.lang = i18nInstance.language;
    const handle = (lng: string) => { document.documentElement.lang = lng; };
    i18nInstance.on("languageChanged", handle);
    return () => { i18nInstance.off("languageChanged", handle); };
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

export { setLanguage };
