import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@shared": path.resolve(__dirname, "shared"),
      "@server": path.resolve(__dirname, "server"),
    },
  },
  test: {
    include: ["tests/**/*.spec.ts"],
    exclude: [
      "tests/any2md.spec.ts",
      "tests/idphoto.spec.ts",
      "tests/md2html-publish.spec.ts",
      "tests/pomodoro.spec.ts",
      "tests/upload-cli.e2e.spec.ts",
      "tests/**/*-ui.spec.ts",
    ],
  },
});
