import { createRootRoute, HeadContent, Scripts, Outlet, Link } from "@tanstack/react-router";
import { AuthProvider } from "~/lib/auth-context";
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
        content:
          "100mini 是一款免费的 HTML 在线托管工具。粘贴或拖拽 HTML/CSS/JS 代码，一键生成分享链接，24 小时自动销毁。",
      },
      { name: "keywords", content: "HTML托管,学习页面,快闪托管,网页分享,免费托管,学习工具,教育工具,师生互动,静态网页,AI教育,AI学习" },
      { name: "robots", content: "index, follow" },
      { name: "theme-color", content: "#ffffff" },
      { name: "color-scheme", content: "light dark" },
      { property: "og:type", content: "website" },
      { property: "og:title", content: "100mini - 免费 HTML 托管与分享工具" },
      {
        property: "og:description",
        content: "粘贴或拖拽 HTML/CSS/JS 代码，一键生成分享链接，24 小时自动销毁。",
      },
      { name: "twitter:card", content: "summary" },
      {
        name: "twitter:title",
        content: "100mini - 免费 HTML 托管与分享工具",
      },
      {
        name: "twitter:description",
        content: "粘贴或拖拽 HTML/CSS/JS 代码，一键生成分享链接，24 小时自动销毁。",
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
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
      <h1 className="text-4xl font-bold text-foreground">404</h1>
      <p className="mt-2 text-muted-foreground">页面不存在</p>
      <Link to="/" className="mt-4 text-sm text-primary hover:underline">
        返回首页
      </Link>
    </main>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  if (isServer) {
    return (
      <html lang="zh-CN">
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
      <AuthProvider>
        <Outlet />
      </AuthProvider>
    </RootDocument>
  );
}
