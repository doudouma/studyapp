import {
  currentLang,
  stripLangPrefix,
  withLangPrefix,
  type Lang,
} from "~/lib/seo";

const LANGUAGES: { code: Lang; label: string }[] = [
  { code: "zh", label: "中文" },
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "pt", label: "Português" },
  { code: "fr", label: "Français" },
];

/**
 * Switch language by navigating to the equivalent page under the new language's
 * URL prefix. Uses a full page navigation so the router re-initializes its
 * basepath for the new language.
 */
export function LangSwitcher() {
  // Read the active language from the i18n instance: server.tsx sets it from
  // the URL prefix before SSR, and the client sets it from window.location.
  // This keeps the selected <option> correct during SSR (no window access).
  const current = currentLang();

  const change = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value as Lang;
    if (next === current) return;
    const basePath = stripLangPrefix(window.location.pathname);
    const newUrl = withLangPrefix(next, basePath) + window.location.search + window.location.hash;
    window.location.assign(newUrl);
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
