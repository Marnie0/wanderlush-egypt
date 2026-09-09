import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [react(), tailwindcss()],
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
          if (/[\\/]node_modules[\\/](react|react-dom|react-router)/.test(id)) return "react";
          if (/[\\/]node_modules[\\/](i18next|react-i18next)/.test(id)) return "i18n";
          if (/[\\/]node_modules[\\/](framer-motion|motion-dom|motion-utils)/.test(id)) return "motion";
        },
      },
    },
  },
});
