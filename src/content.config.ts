import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      date: z.coerce.date(),
      updated: z.coerce.date().optional(),
      // A fixed list keeps category pages from splitting into near-duplicates ("AI" vs "AI Tools").
      category: z.enum(["AI", "Guides", "Windows", "Web", "Domains"], {
        error: (iss) => `Unknown category ${JSON.stringify(iss.input)}. Use one of: AI, Guides, Windows, Web, Domains (see docs/CONTENT.md).`,
      }),
      tags: z.array(z.string()).default([]),
      // Posts sharing the exact same name form a series (2+ published parts); parts read oldest first unless seriesOrder is set.
      series: z.string().trim().min(1).optional(),
      seriesOrder: z.number().int().positive().optional(),
      // GitHub repo the post is about ("owner/name"); shows a "Star on GitHub" card after the article.
      repo: z.string().regex(/^[\w.-]+\/[\w.-]+$/, "repo must look like owner/name").optional(),
      // 16:9 cover, path relative to the post, e.g. ./images/my-post.jpg
      image: image().optional(),
      imageAlt: z.string().default(""),
      // Shown in the blog index sidebar under "popular" (no analytics here, so you pick them).
      popular: z.boolean().default(false),
      draft: z.boolean().default(false),
      comments: z.boolean().default(true),
    }),
});

export const collections = { blog };
