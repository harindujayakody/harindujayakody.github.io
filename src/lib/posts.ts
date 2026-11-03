import { getCollection, type CollectionEntry } from "astro:content";

export type Post = CollectionEntry<"blog">;

export const getPosts = async () =>
  // Drafts show in `npm run dev` for previewing, never in production builds.
  (await getCollection("blog", (p) => import.meta.env.DEV || !p.data.draft)).sort((a, b) => +b.data.date - +a.data.date);

export const readingTime = (body = "") => Math.max(1, Math.round(body.split(/\s+/).length / 220));

export const fmtDate = (d: Date) =>
  d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

export const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export const categoryUrl = (c: string) => `/blog/category/${slugify(c)}/`;
export const tagUrl = (t: string) => `/blog/tag/${slugify(t)}/`;

// Same category scores 2, each shared tag 1; ties go to the newer post.
export const relatedPosts = (post: Post, all: Post[], n = 3) =>
  all
    .filter((p) => p.id !== post.id)
    .map((p) => ({
      p,
      score:
        (p.data.category === post.data.category ? 2 : 0) +
        p.data.tags.filter((t) => post.data.tags.includes(t)).length,
    }))
    .sort((a, b) => b.score - a.score || +b.p.data.date - +a.p.data.date)
    .slice(0, n)
    .map((x) => x.p);

// Plain-markdown version of a post for AI agents (/blog/<id>.md and /llms-full.txt).
export const postMarkdown = (p: Post, site: URL) => `# ${p.data.title}

> ${p.data.description}

- URL: ${new URL(`/blog/${p.id}/`, site)}
- Published: ${p.data.date.toISOString().slice(0, 10)}${p.data.updated ? `\n- Updated: ${p.data.updated.toISOString().slice(0, 10)}` : ""}
- Category: ${p.data.category}
- Tags: ${p.data.tags.join(", ")}
- Author: Harindu Jayakody

${(p.body ?? "").trim()}`;
