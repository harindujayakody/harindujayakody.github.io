import { getPosts } from "../lib/posts";
import { items } from "../data/projects";
import { freeTools } from "../data/free-tools";
import { statusCodes } from "../data/http-status-codes";
import { codeUrl } from "../lib/http-status";

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
  const work = items
    .filter((i) => !freeTools.some((t) => t.href === i.href)) // a free tool is listed once, below
    .map((i) => ({ type: i.kind, title: i.name, desc: i.desc, url: i.href, meta: i.kind, text: i.tags.join(" ") }));
  const tools = freeTools.map((t) => ({ type: "tool", title: t.name, desc: t.desc, url: t.href, meta: "free tool", text: t.tags.join(" ") }));
  const codes = statusCodes.map((s) => ({
    type: "tool",
    title: `${s.code} ${s.name}`,
    desc: s.summary,
    url: codeUrl(s.code),
    meta: "HTTP status code",
    text: `http status error ${s.meaning.join(" ")}`,
  }));
  return new Response(JSON.stringify([...posts, ...tools, ...codes, ...work]), { headers: { "Content-Type": "application/json" } });
}
