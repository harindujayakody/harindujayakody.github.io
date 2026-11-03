import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import { satteri } from "@astrojs/markdown-satteri";
import { xEmbed } from "./src/lib/x-embed-plugin.ts";

export default defineConfig({
  site: "https://harindujayakody.com",
  build: { inlineStylesheets: "always" },
  markdown: { shikiConfig: { theme: "vesper" }, processor: satteri({ hastPlugins: [xEmbed] }) },
  vite: { plugins: [tailwindcss()] },
});
