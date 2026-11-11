# Writing content

Everything is a file in the repo. Edit, commit, push to `master`, and the site rebuilds in about a minute.

## Posts

**Start from the example:** [`src/content/blog/sample-post.md`](../src/content/blog/sample-post.md) uses every feature (headings, cover and inline images, an X embed, code, tables, lists) with comments. It's a draft, so it only shows in `npm run dev` at `/blog/sample-post/`. Copy it, rename it and set `draft: false`.

Create `src/content/blog/<slug>.md`. The file name becomes the URL: `/blog/<slug>/`.

```md
---
title: "How to Fix Windows Installer Error 2503"
description: "One sentence. Shown in lists, search results and social cards."
date: 2026-11-03
updated: 2026-11-10          # optional; shown on the post and sent to Google as dateModified
category: "Windows"           # one per post; gets its own indexable page
tags: ["Windows", "troubleshooting"]
image: ./images/error-2503.jpg   # optional 16:9 cover
imageAlt: "Windows installer error dialog"
draft: false                  # true keeps it out of the build
---

Start with the first paragraph. Don't repeat the title as a `#` heading; the page already shows it.

## Use h2 for sections
```

| Field | Required | Notes |
|---|---|---|
| `title` | yes | Keep it under about 60 characters for search results. |
| `description` | yes | About 140–160 characters. |
| `date` | yes | `YYYY-MM-DD`. Posts sort newest first. |
| `updated` | no | Set it when you meaningfully change a post. |
| `category` | yes | One of `AI`, `Guides`, `Windows`, `Web`. Anything else fails the build. To add a category, add it to the list in `src/content.config.ts`. Each category gets an indexable page at `/blog/category/<slug>/`. |
| `tags` | no | Free-form. Tag pages are `noindex` so they don't compete with categories. |
| `image` | no | Path relative to the post. Use 16:9, at least 1200×675. |
| `imageAlt` | with image | Describe the image for screen readers. |
| `draft` | no | `true` keeps the post off the live site, sitemap and RSS. Drafts still show in `npm run dev` for previewing. |

### Images

- Put files in `src/content/blog/images/`.
- Cover: `image: ./images/name.jpg` in front matter.
- Inline: `![Alt text](./images/name.jpg)`. Shown in a 16:9 frame and cropped to fill it.
- SVG works but isn't converted, and an SVG cover can't be a social card (the avatar is used instead). Use JPG, PNG or WebP for real covers.
- Astro converts them to WebP and generates sizes. Don't put post images in `public/`, because they'd skip optimization.

### Embedding an X post

Copy the embed code from X (… menu → Embed post). Paste the `<blockquote class="twitter-tweet">…</blockquote>` part.
Leave out the `<script>` line. At build time the site fetches the post and draws it as its own card (author, verified badge, text, photo or video preview, likes), matching the site theme with no X script. Long posts end with "Show more on X".
Replace blank lines inside the blockquote with `<br><br>`, because a blank line ends an HTML block in Markdown.

### Code

Use fenced blocks with a language: ```` ```powershell ````. Highlighting uses the Shiki `github-dark-default` theme (the same colours as GitHub dark mode).

## Home page X posts

`src/data/x-posts.ts`: a list of post URLs, newest first. Each is fetched at build time and drawn as a site-themed card. If X stops serving a post, it's skipped and the build still succeeds.

## Projects & Tools

`src/data/projects.ts`. Each item:

```ts
{ name: "2fa-tools", kind: "tool", href: "https://…", repo: "https://github.com/…", tags: ["PWA"], featured: true, desc: "One sentence." }
```

- `kind`: `tool` (something people use in a browser) or `project`.
- `href`: where the card links. Can be any site, not only GitHub.
- `repo`: optional; adds a "source ↗" link.
- `featured: true`: also shown on the home page (keep it to 6).

The "Repositories" list on `/projects/` and the `/timeline/` page come from the GitHub API automatically.
