import type { APIContext } from "astro";
import { getPosts, categoryUrl } from "../lib/posts";

// Indexable pages only: tag pages and search are noindex, so they stay out.
export async function GET({ site }: APIContext) {
  const posts = await getPosts();
  const latest = posts[0] ? (posts[0].data.updated ?? posts[0].data.date) : new Date();
  const entries: [string, Date][] = [
    ["/", latest],
    ["/blog/", latest],
    ["/projects/", new Date()],
    ["/timeline/", new Date()],
    ...[...new Set(posts.map((p) => p.data.category))].map((c): [string, Date] => [categoryUrl(c), latest]),
    ...posts.map((p): [string, Date] => [`/blog/${p.id}/`, p.data.updated ?? p.data.date]),
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.map(([path, d]) => `  <url><loc>${new URL(path, site)}</loc><lastmod>${d.toISOString()}</lastmod></url>`).join("\n")}
</urlset>`;
  return new Response(xml, { headers: { "Content-Type": "application/xml" } });
}
