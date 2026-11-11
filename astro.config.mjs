import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import { satteri } from "@astrojs/markdown-satteri";
import { xEmbed } from "./src/lib/x-embed-plugin.ts";

export default defineConfig({
  site: "https://harindujayakody.com",
  build: { inlineStylesheets: "always" },
  // Old category merged into AI (issue #11).
  redirects: { "/blog/category/ai-tools": "/blog/category/ai/" },
  markdown: { shikiConfig: { theme: "github-dark-default" }, processor: satteri({ hastPlugins: [xEmbed] }) },
  vite: { plugins: [tailwindcss()] },
});
