import { useEffect } from "react";
import { createRootRoute, HeadContent, Scripts, Outlet, Link, useRouterState } from "@tanstack/react-router";
import { AuthProvider } from "~/lib/auth-context";
import { I18nProvider } from "~/lib/i18n-provider";
import i18n, { getBcp47 } from "~/lib/i18n";
import { useTranslation } from "react-i18next";
import {
  buildHreflangLinks,
  buildJsonLd,
  withLangPrefix,
  currentLang,
  BASE_URL,
} from "~/lib/seo";
import "~/styles/app.css";
import interFontUrl from "@fontsource-variable/inter/files/inter-latin-wght-normal.woff2?url";

export const Route = createRootRoute({
  head: (ctx: any) => {
    const matches: Array<{ pathname: string }> = ctx?.matches ?? [];
    const leafPath = matches.length ? matches[matches.length - 1].pathname : "/";
    const lang = currentLang();
    const jsonLd = buildJsonLd(leafPath, lang);
    const pageUrl = BASE_URL + withLangPrefix(lang, leafPath);

    return {
      meta: [
        { title: i18n.t("app.title") },
        { charSet: "utf-8" },
        {
          name: "viewport",
          content: "width=device-width, initial-scale=1.0",
        },
        {
          name: "description",
          content: i18n.t("app.desc"),
        },
        { name: "keywords", content: i18n.t("app.keywords") },
        { name: "robots", content: "index, follow" },
        { name: "theme-color", content: "#ffffff" },
        { name: "color-scheme", content: "light dark" },
        { property: "og:type", content: "website" },
        { property: "og:title", content: i18n.t("app.title") },
        {
          property: "og:description",
          content: i18n.t("app.desc"),
        },
        { property: "og:url", content: pageUrl },
        { property: "og:locale", content: getBcp47(lang).replace("-", "_") },
        { name: "twitter:card", content: "summary" },
        {
          name: "twitter:title",
          content: i18n.t("app.title"),
        },
        {
          name: "twitter:description",
          content: i18n.t("app.desc"),
        },
        // Localized JSON-LD structured data — one set per language version.
        // TanStack's head runtime accepts { "script:ld+json": object } entries
        // (rendered as <script type="application/ld+json">); cast because the
        // head type is narrower than what the runtime supports.
        ...jsonLd.map((block) => ({ "script:ld+json": block } as any)),
      ] as any[],
      // NOTE: canonical + hreflang alternate links are NOT declared here.
      // TanStack's HeadContent re-renders `links:` on the client, which
      // duplicates the SSR-injected links (12 instead of 6) and triggers a
      // React "Invalid DOM property hreflang" warning during hydration. They
      // are rendered server-only in RootDocument's <head> instead.
      links: [
        { rel: "preload", href: interFontUrl, as: "font", type: "font/woff2", crossOrigin: "anonymous" },
      ] as any[],
    };
  },
  notFoundComponent: NotFound,
  component: RootComponent,
});

const isServer = typeof window === "undefined";

function NotFound() {
  const { t } = useTranslation();
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
      <h1 className="text-4xl font-bold text-foreground">{t("404.title")}</h1>
      <p className="mt-2 text-muted-foreground">{t("404.message")}</p>
      <Link to="/" className="mt-4 text-sm text-primary hover:underline">
        {t("404.back")}</Link>
    </main>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  // Leaf route pathname (router operates on the lang-stripped base path) and
  // the active language — used to render canonical + hreflang <link> tags.
  const leafPath = useRouterState({
    select: (s) => s.matches[s.matches.length - 1]?.pathname ?? "/",
  });
  const lang = currentLang();
  const canonicalHref = BASE_URL + withLangPrefix(lang, leafPath);
  const hreflangLinks = buildHreflangLinks(leafPath);

  // Keep canonical + hreflang <link> tags in sync on client-side navigation.
  // They are rendered server-only (see head() note above), so React doesn't
  // manage them; this effect updates their href attributes when the route
  // changes, avoiding stale canonical URLs after SPA navigation.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute("href", canonicalHref);

    const alts = document.querySelectorAll('link[rel="alternate"][hreflang]');
    const newAlts = buildHreflangLinks(leafPath);
    if (alts.length === newAlts.length) {
      alts.forEach((el, i) => el.setAttribute("href", newAlts[i].href));
    } else {
      alts.forEach((el) => el.remove());
      for (const l of newAlts) {
        const link = document.createElement("link");
        link.setAttribute("rel", "alternate");
        link.setAttribute("hreflang", l.hrefLang ?? "");
        link.setAttribute("href", l.href);
        document.head.appendChild(link);
      }
    }
  }, [leafPath, canonicalHref]);

  if (isServer) {
    return (
      <html lang={getBcp47(i18n.language)}>
        <head>
          <HeadContent />
          {/* Canonical + hreflang rendered server-only (see head() note above):
              the client branch below does not re-render them, so there is no
              duplication and no client-side prop warning. HTML attribute names
              are case-insensitive, so `hrefLang=` is parsed identically to
              `hreflang=` by browsers and Google. */}
          <link rel="canonical" href={canonicalHref} />
          {hreflangLinks.map((l) => (
            <link key={l.hrefLang} rel={l.rel} hrefLang={l.hrefLang} href={l.href} />
          ))}
        </head>
        <body>
          <div id="root">{children}</div>
          <Scripts />
        </body>
      </html>
    );
  }
  return (
    <>
      <HeadContent />
      {children}
      <Scripts />
    </>
  );
}

function RootComponent() {
  return (
    <RootDocument>
      <I18nProvider>
        <AuthProvider>
          <Outlet />
        </AuthProvider>
      </I18nProvider>
    </RootDocument>
  );
}
