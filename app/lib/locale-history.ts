import { createBrowserHistory, parseHref } from "@tanstack/history";
import { parseLangFromPath, stripLangPrefix, withLangPrefix } from "./lang";

/**
 * A browser history that transparently handles the language URL prefix.
 *
 * Why this exists: TanStack Start's server handler FORCES basepath to
 * `ROUTER_BASEPATH` ("/") and overrides the router history with a memory
 * history initialized from the (prefix-stripped) request path. So the server
 * always dehydrates router state for the STRIPPED path (e.g. "/square").
 *
 * For hydration to succeed, the client router must also see the stripped path
 * ("/square") — NOT the browser URL "/en/square". But we still want the browser
 * URL bar, links, and push/replace to use the prefixed URL ("/en/square") so
 * each language stays a distinct, indexable URL.
 *
 * This history reconciles both:
 *   - parseLocation: strips the /{lang} prefix from window.location so the
 *     router sees "/square" at browser URL "/en/square" (matches server state).
 *   - createHref: re-adds the current language prefix, so <Link>/push/replace
 *     produce prefixed URLs ("/en/square") in the browser.
 *
 * basepath stays "/" on both server and client.
 */
export function createLocaleBrowserHistory() {
  return createBrowserHistory({
    parseLocation: () => {
      const loc = window.location;
      const pathname = stripLangPrefix(loc.pathname);
      return parseHref(
        pathname + loc.search + loc.hash,
        window.history.state ?? undefined
      );
    },
    createHref: (path: string) => {
      const lang = parseLangFromPath(window.location.pathname);
      // path may include search/hash — prefix only the pathname portion.
      const u = new URL(path, window.location.origin);
      return withLangPrefix(lang, u.pathname) + u.search + u.hash;
    },
  });
}
