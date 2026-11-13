import type { APIContext } from "astro";
import { getPosts, postMarkdown, type Post } from "../../lib/posts";

export async function getStaticPaths() {
  const all = await getPosts();
  return all.map((post) => ({ params: { id: post.id }, props: { post, all } }));
}

export const GET = ({ props, site }: APIContext) =>
  new Response(postMarkdown(props.post as Post, site!, props.all as Post[]), { headers: { "Content-Type": "text/markdown; charset=utf-8" } });
