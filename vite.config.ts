import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ mode }) => ({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
  esbuild: {
    // Remove console.log, console.warn, and console.error in production
    drop: mode === "production" ? ["console", "debugger"] : [],
  },
  build: {
    // Ensure minification is enabled in production
    minify: mode === "production" ? "esbuild" : false,
  },
}));
