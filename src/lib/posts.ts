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

export const seriesUrl = (name: string) => `/blog/series/${slugify(name)}/`;

// Reading order: seriesOrder when every part has one (a partial set is ambiguous, so it's ignored), else oldest first.
const seriesParts = (name: string, all: Post[]) => {
  const parts = all.filter((p) => p.data.series === name);
  const numbered = parts.every((p) => p.data.seriesOrder !== undefined);
  return parts.sort((a, b) => (numbered ? a.data.seriesOrder! - b.data.seriesOrder! : 0) || +a.data.date - +b.data.date);
};

// Every series with its parts. A one-part "series" (usually a typo in the name) is listed so the caller can warn.
export const allSeries = (all: Post[]) =>
  [...new Set(all.flatMap((p) => p.data.series ?? []))].map((name) => ({ name, parts: seriesParts(name, all) }));

// The post's series, only when it has 2+ parts; otherwise the post is treated as a normal post.
export const seriesOf = (post: Post, all: Post[]) => {
  if (!post.data.series) return undefined;
  const parts = seriesParts(post.data.series, all);
  return parts.length > 1 ? { name: post.data.series, parts, index: parts.findIndex((p) => p.id === post.id) } : undefined;
};

// Plain-markdown version of a post for AI agents (/blog/<id>.md and /llms-full.txt).
export const postMarkdown = (p: Post, site: URL, all: Post[] = []) => {
  const s = seriesOf(p, all);
  return `# ${p.data.title}

> ${p.data.description}

- URL: ${new URL(`/blog/${p.id}/`, site)}
- Published: ${p.data.date.toISOString().slice(0, 10)}${p.data.updated ? `\n- Updated: ${p.data.updated.toISOString().slice(0, 10)}` : ""}
- Category: ${p.data.category}
- Tags: ${p.data.tags.join(", ")}${s ? `\n- Series: ${s.name} (part ${s.index + 1} of ${s.parts.length}, ${new URL(seriesUrl(s.name), site)})` : ""}
- Author: Harindu Jayakody

${(p.body ?? "").trim()}`;
};
