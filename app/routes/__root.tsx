import { createRootRoute, Outlet } from "@tanstack/react-router";
import "~/styles/app.css";

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
          "码上钉是一款免费的 HTML 在线托管工具。粘贴或拖拽 HTML/CSS/JS 代码，一键生成分享链接，24 小时自动销毁。",
      },
      { name: "robots", content: "index, follow" },
      { name: "theme-color", content: "#667eea" },
      { name: "color-scheme", content: "light" },
      { property: "og:type", content: "website" },
      { property: "og:title", content: "码上钉 - 免费 HTML 托管与分享工具" },
      {
        property: "og:description",
        content: "粘贴或拖拽 HTML/CSS/JS 代码，一键生成分享链接，24 小时自动销毁。",
      },
      { name: "twitter:card", content: "summary" },
      {
        name: "twitter:title",
        content: "码上钉 - 免费 HTML 托管与分享工具",
      },
      {
        name: "twitter:description",
        content: "粘贴或拖拽 HTML/CSS/JS 代码，一键生成分享链接，24 小时自动销毁。",
      },
    ],
    links: [
      { rel: "canonical", href: "https://studypage.app/" },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  return <Outlet />;
}
