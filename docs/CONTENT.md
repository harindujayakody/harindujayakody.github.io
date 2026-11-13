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

Posts with three or more `##` sections automatically get an "On this page" table of contents (top-level sections only; collapsed by default when there are more than 6), and every `##`/`###` heading gets a `#` link readers can copy. The author box at the end of each post comes from `src/data/author.ts`; edit your bio there once.

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
| `comments` | no | `false` hides the comments section on that post. Default `true`. |
| `series` | no | Name of a multi-part series. See below. |
| `seriesOrder` | no | Part number (1, 2, 3…). Set it on every part or on none. |

### Comments

Every post has a comments section (giscus). Readers sign in with GitHub, and each post gets its own thread in the repo's **Discussions → Announcements** category, created when the first comment is posted. Moderate there: edit, hide or delete comments, or lock a thread. Set `comments: false` to turn comments off for one post.

### Newsletter

A `$ subscribe --email` form appears after every post and under the post lists on the blog pages. It posts straight to Buttondown (username `harindu`, set in `src/data/author.ts`). Subscribers, confirmation emails (double opt-in) and sending live in the Buttondown dashboard; nothing about the newsletter is stored in this repo.

### Series

Give each part the same `series` name, spelled exactly the same:

```md
series: "Build an AI agent"
seriesOrder: 2      # optional
```

- Parts read oldest first. To choose the order yourself, set `seriesOrder` on **every** part; if only some parts have it, it's ignored and the build warns.
- Each part gets a "part N of M" box under the header listing all parts, plus "← previous part / next part →" links at the end.
- The series gets its own page at `/blog/series/<slug>/` (in the sitemap), and each post's structured data says which series it belongs to.
- A series needs **2 or more published parts**. With only one (often a typo in the name), the post shows as a normal post and the build prints a `[series]` warning. Drafts don't count on the live site, so publishing part 1 before part 2 is fine: the series appears when part 2 goes live.

### Images

- Put files in `src/content/blog/images/`.
- Cover: `image: ./images/name.jpg` in front matter.
- Inline: `![Alt text](./images/name.jpg)`. Shown in a 16:9 frame and cropped to fill it.
- Every post automatically gets a 1200×630 social card (title, category, date, your name and avatar) at `/og/<slug>.png`. Set a JPG, PNG or WebP `image:` cover to use that instead. SVG covers show on the page but the generated card is used for sharing, since social networks reject SVG.
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
