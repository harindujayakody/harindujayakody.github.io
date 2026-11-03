import type { APIContext } from "astro";
import { getPosts } from "../lib/posts";
import { items } from "../data/projects";

// https://llmstxt.org — a markdown map of the site for AI agents.
export async function GET({ site }: APIContext) {
  const u = (p: string) => new URL(p, site).href;
  const posts = await getPosts();
  const body = `# Harindu Jayakody

> Founder of Infiax (https://infiax.com), based in Sri Lanka and studying at Wrexham University. Builds full-stack web apps, browser extensions and automation tools.

Contact: me@harindujayakody.com · GitHub: https://github.com/harindujayakody · X: https://x.com/harindu522 · LinkedIn: https://www.linkedin.com/in/harindux/

Every post is also available as plain markdown by replacing the trailing slash with \`.md\` (e.g. ${u("/blog/example.md")}). Full text of all posts: ${u("/llms-full.txt")}

## Blog posts

${posts.map((p) => `- [${p.data.title}](${u(`/blog/${p.id}.md`)}): ${p.data.description}`).join("\n")}

## Tools & projects

${items.map((i) => `- [${i.name}](${i.href}): ${i.desc}`).join("\n")}

## Optional

- [All public repositories](${u("/timeline/")}): every GitHub repo by year
- [RSS feed](${u("/rss.xml")})
- [Sitemap](${u("/sitemap.xml")})
`;
  return new Response(body, { headers: { "Content-Type": "text/markdown; charset=utf-8" } });
}
