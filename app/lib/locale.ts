const SUPPORTED = new Set(["zh", "en", "es", "pt", "fr"]);

export function parseAcceptLanguage(header: string | null | undefined): string {
  if (!header) return "zh";
  const langs = header.split(",").map((l) => {
    const [lang, q = "1"] = l.trim().split(";q=");
    return { lang: lang.split("-")[0], q: parseFloat(q) || 1 };
  }).sort((a, b) => b.q - a.q);
  for (const { lang } of langs) {
    if (SUPPORTED.has(lang)) return lang;
  }
  return "en";
}
