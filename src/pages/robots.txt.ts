import type { APIContext } from "astro";

// Search engines and AI crawlers are all welcome; llms.txt points agents at clean content.
export const GET = ({ site }: APIContext) =>
  new Response(
    `User-agent: *
Allow: /
Disallow: /search/

Sitemap: ${new URL("/sitemap.xml", site)}
# AI agents: ${new URL("/llms.txt", site)}
`,
    { headers: { "Content-Type": "text/plain" } },
  );
