import { createRootRoute, HeadContent, Scripts, Outlet, Link } from "@tanstack/react-router";
import { AuthProvider } from "~/lib/auth-context";
import { I18nProvider } from "~/lib/i18n-provider";
import i18n from "~/lib/i18n";
import { useTranslation } from "react-i18next";
import "~/styles/app.css";
import interFontUrl from "@fontsource-variable/inter/files/inter-latin-wght-normal.woff2?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
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
      { name: "twitter:card", content: "summary" },
      {
        name: "twitter:title",
        content: i18n.t("app.title"),
      },
      {
        name: "twitter:description",
        content: i18n.t("app.desc"),
      },
    ],
    links: [
      { rel: "canonical", href: "https://100mini.com/" },
      { rel: "preload", href: interFontUrl, as: "font", type: "font/woff2", crossOrigin: "anonymous" },
    ],
  }),
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
        {t("404.back")}
      </Link>
    </main>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  if (isServer) {
    return (
      <html lang={i18n.language || "zh-CN"}>
        <head>
          <HeadContent />
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
