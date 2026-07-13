import { useTranslation } from "react-i18next";
import { setLanguage } from "~/lib/i18n";

export function LangSwitcher() {
  const { i18n: i18nInstance } = useTranslation();
  const current = i18nInstance.language;

  const toggle = () => {
    const next = current === "zh" ? "en" : "zh";
    setLanguage(next);
  };

  return (
    <button
      onClick={toggle}
      className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer font-medium"
      aria-label="Switch language"
    >
      {current === "zh" ? "EN" : "中文"}
    </button>
  );
}
