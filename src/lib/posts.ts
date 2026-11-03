import { getCollection } from "astro:content";

export const getPosts = async () =>
  (await getCollection("blog", (p) => !p.data.draft)).sort((a, b) => +b.data.date - +a.data.date);

export const readingTime = (body = "") => Math.max(1, Math.round(body.split(/\s+/).length / 220));

export const fmtDate = (d: Date) =>
  d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
