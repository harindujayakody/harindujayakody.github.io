import { getPosts } from "../lib/posts";
import { items } from "../data/projects";

export async function GET() {
  const posts = (await getPosts()).map((p) => ({
    type: "post",
    title: p.data.title,
    desc: p.data.description,
    url: `/blog/${p.id}/`,
    meta: p.data.category,
    // body is included so search matches the article text, not just titles
    text: [p.data.category, ...p.data.tags, p.body ?? ""].join(" ").replace(/\s+/g, " "),
  }));
  const work = items.map((i) => ({ type: i.kind, title: i.name, desc: i.desc, url: i.href, meta: i.kind, text: i.tags.join(" ") }));
  return new Response(JSON.stringify([...posts, ...work]), { headers: { "Content-Type": "application/json" } });
}
