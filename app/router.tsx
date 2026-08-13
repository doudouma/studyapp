import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { createLocaleBrowserHistory } from "./lib/locale-history";

/**
 * The router uses basepath "/" on both server and client. The language URL
 * prefix (/en/, /es/, ...) is handled transparently:
 *   - server.tsx strips the prefix before SSR, so the server matches the flat
 *     route tree and dehydrates state for the stripped path.
 *   - on the client, createLocaleBrowserHistory() strips the prefix when
 *     reading the location (so hydration matches the server state) and re-adds
 *     it when creating hrefs (so links/push keep the language-prefixed URL).
 *
 * Switching language is a full page navigation (LangSwitcher), which re-runs
 * SSR + hydration for the new language.
 */
export function getRouter() {
  const router = createTanStackRouter({
    routeTree,
    defaultPreload: "intent",
    history: typeof window !== "undefined" ? createLocaleBrowserHistory() : undefined,
  });
  return router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
