import { defineConfig } from "vitest/config";

export default defineConfig({
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
