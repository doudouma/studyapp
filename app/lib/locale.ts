export function parseAcceptLanguage(header: string | null): string {
  if (!header) return "zh";
  const langs = header.split(",").map((l) => {
    const [lang, q = "1"] = l.trim().split(";q=");
    return { lang: lang.split("-")[0], q: parseFloat(q) || 1 };
  }).sort((a, b) => b.q - a.q);
  const preferred = langs[0]?.lang;
  return preferred?.startsWith("zh") ? "zh" : "en";
}
