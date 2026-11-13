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
      category: z.enum(["AI", "Guides", "Windows", "Web"], {
        error: (iss) => `Unknown category ${JSON.stringify(iss.input)}. Use one of: AI, Guides, Windows, Web (see docs/CONTENT.md).`,
      }),
      tags: z.array(z.string()).default([]),
      // Posts sharing the exact same name form a series (2+ published parts); parts read oldest first unless seriesOrder is set.
      series: z.string().trim().min(1).optional(),
      seriesOrder: z.number().int().positive().optional(),
      // 16:9 cover, path relative to the post, e.g. ./images/my-post.jpg
      image: image().optional(),
      imageAlt: z.string().default(""),
      draft: z.boolean().default(false),
    }),
});

export const collections = { blog };
