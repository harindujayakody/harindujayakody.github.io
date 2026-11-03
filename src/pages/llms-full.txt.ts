import type { APIContext } from "astro";
import { getPosts, postMarkdown } from "../lib/posts";

export async function GET({ site }: APIContext) {
  const posts = await getPosts();
  const body = `# Harindu Jayakody — all posts\n\n${posts.map((p) => postMarkdown(p, site!)).join("\n\n---\n\n")}\n`;
  return new Response(body, { headers: { "Content-Type": "text/markdown; charset=utf-8" } });
}
