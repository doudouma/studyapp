import { createRoot } from "react-dom/client";
import { StartClient } from "@tanstack/react-start/client";
import { loadLocale } from "~/lib/i18n";
import { parseLangFromPath } from "~/lib/lang";

/**
 * Hydration entry. The active language's locale chunk must be in the i18n
 * instance before React renders, otherwise the server-rendered translations
 * would be replaced by raw keys. Only the URL's language is fetched here.
 */
async function boot() {
  const rootEl = document.getElementById("root");
  if (!rootEl) {
    console.error("[client] root element not found!");
    return;
  }

  try {
    await loadLocale(parseLangFromPath(window.location.pathname));
  } catch (err) {
    console.error("[client] failed to load locale:", err);
  }

  createRoot(rootEl).render(<StartClient />);
}

void boot();
