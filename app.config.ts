import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "app"),
      "@shared": path.resolve(__dirname, "shared"),
      // 注意：app 代码中对 @server 只允许 import type（类型会被擦除，
      // 运行时 import server 代码会把服务端依赖打进客户端 bundle）
      "@server": path.resolve(__dirname, "server"),
    },
  },
  optimizeDeps: {
    exclude: ["@firecrawl/anydoc-wasm"],
  },
  ssr: {
    // Cloudflare Workers runtime: resolve worker/browser export conditions so
    // dependencies don't pull Node-only builds (e.g. @better-auth/telemetry's
    // `node` condition imports node:fs, which Workers rejects).
    resolve: {
      conditions: ["workerd", "worker", "module", "browser", "development|production"],
    },
  },
  plugins: [
    tanstackStart({
      srcDirectory: "app",
    }),
    tailwindcss(),
    react(),
  ],
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
