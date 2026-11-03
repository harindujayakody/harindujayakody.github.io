import type { APIContext } from "astro";
import { getPosts } from "../lib/posts";

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

export async function GET({ site }: APIContext) {
  const posts = await getPosts();
  const items = posts.map((p) => {
    const url = new URL(`/blog/${p.id}/`, site);
    return `    <item>
      <title>${esc(p.data.title)}</title>
      <link>${url}</link>
      <guid>${url}</guid>
      <description>${esc(p.data.description)}</description>
      <category>${esc(p.data.category)}</category>
      <pubDate>${p.data.date.toUTCString()}</pubDate>
    </item>`;
  });
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Harindu Jayakody</title>
    <link>${site}</link>
    <description>Notes on building web apps, browser extensions, Windows fixes and AI tools.</description>
    <language>en</language>
    <atom:link href="${new URL("/rss.xml", site)}" rel="self" type="application/rss+xml" />
${items.join("\n")}
  </channel>
</rss>`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml" } });
}
