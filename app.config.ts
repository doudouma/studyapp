import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "app"),
    },
  },
  plugins: [tailwindcss(), react()],
  server: {
    proxy: {
      "/api": "http://localhost:3000",
      "/p": "http://localhost:3000",
    },
  },
});
