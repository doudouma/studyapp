import { useTranslation } from "react-i18next";
import { setLanguage } from "~/lib/i18n";

const LANGUAGES = [
  { code: "zh", label: "中文" },
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "pt", label: "Português" },
  { code: "fr", label: "Français" },
];

export function LangSwitcher() {
  const { i18n: i18nInstance } = useTranslation();
  const current = i18nInstance.language;

  const change = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value);
  };

  return (
    <select
      value={current}
      onChange={change}
      className="bg-transparent text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer focus:outline-none"
      aria-label="Language"
    >
      {LANGUAGES.map((l) => (
        <option key={l.code} value={l.code} className="text-foreground bg-background">
          {l.label}
        </option>
      ))}
    </select>
  );
}
