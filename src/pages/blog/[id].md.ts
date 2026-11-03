import type { APIContext } from "astro";
import { getPosts, postMarkdown, type Post } from "../../lib/posts";

export async function getStaticPaths() {
  return (await getPosts()).map((post) => ({ params: { id: post.id }, props: { post } }));
}

export const GET = ({ props, site }: APIContext) =>
  new Response(postMarkdown(props.post as Post, site!), { headers: { "Content-Type": "text/markdown; charset=utf-8" } });
