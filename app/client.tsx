import { createRoot } from "react-dom/client";
import { StartClient } from "@tanstack/react-start/client";
import { loadLocale } from "~/lib/i18n";
import { parseLangFromPath } from "~/lib/lang";

/**
 * 部署后仍在运行的旧标签页持有上一版的路由 chunk 清单：入口文件 hash 没变，
 * 但它要预加载的 `ai-books_.free-<旧hash>.js` 已经被新部署替换掉了。
 * 预加载 404 后路由状态里会留下一个悬空的 match，下一次路由跳转就抛
 * "Cannot read properties of undefined (reading '_nonReactive')"。
 *
 * 这里只自动刷新一次：刷新后拿到新清单即恢复正常；标记在启动成功后清掉，
 * 这样以后再次部署还能再恢复一次，也不会出现刷新死循环。
 */
const RELOAD_FLAG = "100mini:chunk-reload";

function installChunkRecovery() {
  if (typeof window === "undefined") return;
  window.addEventListener("vite:preloadError", (event) => {
    event.preventDefault();
    if (sessionStorage.getItem(RELOAD_FLAG)) return;
    sessionStorage.setItem(RELOAD_FLAG, "1");
    window.location.reload();
  });
}

/**
 * Hydration entry. The active language's locale chunk must be in the i18n
 * instance before React renders, otherwise the server-rendered translations
 * would be replaced by raw keys. Only the URL's language is fetched here.
 */
async function boot() {
  installChunkRecovery();

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

  // 启动满 10 秒说明这次加载是健康的，允许下次部署再自动恢复一次
  window.setTimeout(() => sessionStorage.removeItem(RELOAD_FLAG), 10_000);
}

void boot();
