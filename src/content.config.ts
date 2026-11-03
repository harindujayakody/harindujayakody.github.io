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
      category: z.string().default("General"),
      tags: z.array(z.string()).default([]),
      // 16:9 cover, path relative to the post, e.g. ./images/my-post.jpg
      image: image().optional(),
      imageAlt: z.string().default(""),
      draft: z.boolean().default(false),
    }),
});

export const collections = { blog };
