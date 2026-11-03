import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  build: { inlineStylesheets: "always" },
  markdown: { shikiConfig: { theme: "vesper" } },
  vite: { plugins: [tailwindcss()] },
});
