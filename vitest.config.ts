import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "app"),
      "@shared": path.resolve(__dirname, "shared"),
      "@server": path.resolve(__dirname, "server"),
    },
  },
  test: {
    include: ["tests/**/*.spec.{ts,tsx}"],
    exclude: [
      "tests/any2md.spec.ts",
      "tests/idphoto.spec.ts",
      "tests/md2html-publish.spec.ts",
      "tests/pomodoro.spec.ts",
      "tests/upload-cli.e2e.spec.ts",
      "tests/**/*-ui.spec.ts",
    ],
    environment: "jsdom",
    coverage: {
      provider: "v8",
      reporter: ["text"],
      // 大文件积分计费：纯逻辑（共享常量 + 费用函数）与扣分数据访问
      include: ["shared/types/pages.ts", "server/features/pages/pages.repo.ts"],
      thresholds: {
        statements: 100,
        branches: 100,
        functions: 100,
        lines: 100,
      },
    },
  },
});
