import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";
import { contentSplit } from "./scripts/vite-content-split";

export default defineConfig({
  plugins: [contentSplit(), react(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@content": fileURLToPath(new URL("./content", import.meta.url)),
    },
  },
  build: {
    target: "es2022",
    cssTarget: "chrome111",
    rollupOptions: {
      output: {
        // Keep the vendor libraries out of the route chunks so the homepage
        // ships the smallest possible first paint.
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          // Anchored on the package directory: an unanchored "react" would
          // also claim react-i18next before the i18n rule saw it.
          if (/[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom)[\\/]/.test(id)) return "react";
          if (/[\\/]node_modules[\\/](i18next|react-i18next|i18next-browser-languagedetector)[\\/]/.test(id)) return "i18n";
          if (/[\\/]node_modules[\\/](framer-motion|motion-dom|motion-utils)/.test(id)) return "motion";
        },
      },
    },
  },
});
