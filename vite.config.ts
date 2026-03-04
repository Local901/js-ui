import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],

  root: "playground", // 👈 important

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"), // import library easily
    },
  },

  server: {
    port: 5173,
    open: true,
  },
});