# Architecture

A static site. All data is fetched and all HTML is rendered at build time; the browser gets HTML, inlined CSS, fonts and images.
JavaScript runs on two pages only: `/search/` (a ~1 KB filter) and posts containing an X embed (X's widget, loaded when the embed scrolls near).

```
 src/content/blog/*.md ─┐
 src/data/projects.ts ──┤
 src/data/x-posts.ts ───┼──►  astro build  ──►  dist/  ──►  GitHub Pages  ──►  harindujayakody.com
 GitHub REST API ───────┤      (Node 24,
 X syndication API ─────┘       GitHub Actions)
```

## Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Astro 7, static output | Zero JS by default; content collections for markdown |
| Styling | Tailwind v4 via `@tailwindcss/vite`, CSS inlined into each page | No render-blocking stylesheet request |
| Components | Astro components with shadcn/ui token names (`Button`, `Card`, `Badge`) | shadcn's look without shipping React |
| Fonts | Self-hosted via Fontsource: Poppins 600, Inter variable, JetBrains Mono variable | No third-party font request; above-the-fold fonts preloaded |
| Images | `astro:assets` | WebP, responsive `srcset`, OG image generation |
| Hosting | GitHub Pages via Actions | Free, a push deploys |

## Source layout

```
src/
  content.config.ts      blog collection schema (zod): title, date, category, tags, image…
  content/blog/          posts (.md) and images/
  data/projects.ts       hand-picked tools & projects
  data/x-posts.ts        X post URLs for the home page
  lib/
    posts.ts             getPosts, slugify, category/tag URLs, relatedPosts, postMarkdown
    github.ts            repo list from the GitHub API (cached per build, fails soft to [])
    x.ts                 X post fetch via cdn.syndication.twimg.com (no key; fails soft per post)
  layouts/Layout.astro   <head> SEO (canonical, OG, Twitter, robots, JSON-LD), header nav, footer
  components/            PostList, BlogIndex, Timeline, ProjectCard, XFeed, Socials, ui/*
  pages/                 routes (below)
  styles/global.css      tokens, base styles, motion, prose
.github/workflows/deploy.yml
```

## Routes

| Route | File | Notes |
|---|---|---|
| `/` | `pages/index.astro` | Hero, stats (live from GitHub), featured projects, latest posts, recent repos, X posts. `ProfilePage` + `WebSite` JSON-LD |
| `/blog/` | `pages/blog/index.astro` → `BlogIndex` | Category filter chips |
| `/blog/category/<slug>/` | `pages/blog/category/[slug].astro` | Indexable; `CollectionPage` + breadcrumbs |
| `/blog/tag/<slug>/` | `pages/blog/tag/[slug].astro` | `noindex, follow` |
| `/blog/<slug>/` | `pages/blog/[id].astro` | `BlogPosting` + breadcrumbs, cover image, related posts, lazy X widget |
| `/blog/<slug>.md` | `pages/blog/[id].md.ts` | Raw markdown for AI agents |
| `/projects/` | `pages/projects.astro` | Tools, projects, all repos |
| `/timeline/` | `pages/timeline.astro` | Every repo grouped by year |
| `/search/` | `pages/search.astro` + `search.json.ts` | Client-side filter over a JSON index; `noindex` |
| `/sitemap.xml` `/robots.txt` `/rss.xml` `/llms.txt` `/llms-full.txt` | `pages/*.ts` | Generated endpoints; no extra dependencies |

## External data and failure modes

| Source | Used for | If it fails |
|---|---|---|
| `api.github.com/users/harindujayakody/repos` | timeline, stats, repo list | Build continues; timeline shows a notice, stats fall back |
| `cdn.syndication.twimg.com/tweet-result` | home page X cards | That post is skipped |
| `platform.x.com/widgets.js` (browser) | real embeds in posts | Reader sees the styled quote with a link |

The deploy workflow passes `GITHUB_TOKEN` so the GitHub API isn't rate-limited in CI.

## Deploy

`.github/workflows/deploy.yml`: on push to `master`, daily at 01:00 UTC, or manually.
`withastro/action@v3` (Node 24) builds, then `actions/deploy-pages@v4` publishes. Repo setting: Pages → Source: GitHub Actions.

## SEO model

- One canonical URL per page (`Astro.site` = `https://harindujayakody.com`).
- Indexable: home, blog, categories, posts, projects, timeline, all listed in the sitemap with `lastmod`.
- Not indexed: tag pages (duplicate category listings) and search.
- Structured data mirrors visible content: author, dates, breadcrumbs, article section.
- `/llms.txt` follows llmstxt.org and points agents at the `.md` copies.
