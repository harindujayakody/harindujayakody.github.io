# Architecture

A static site. All data is fetched and all HTML is rendered at build time; the browser gets HTML, inlined CSS, fonts and images.
The only JavaScript is on `/search/` (a ~1 KB filter). X embeds in posts are turned into static cards at build time, so no X script is loaded.

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
  data/author.ts         name, role, bio, links; feeds the author box and Person JSON-LD
  lib/
    posts.ts             getPosts, slugify, category/tag URLs, relatedPosts, postMarkdown
    github.ts            repo list from the GitHub API (cached per build, fails soft to [])
    x.ts                 X post fetch (no key; fails soft) and xCardHtml, the one card used everywhere
    x-embed-plugin.ts    Markdown (Sätteri) plugin: pasted X embed code becomes an xCardHtml card at build time
    heading-anchors-plugin.ts  Markdown plugin: ids + "#" self-links on h2/h3 (GitHub-style slugs)
  layouts/Layout.astro   <head> SEO (canonical, OG, Twitter, robots, JSON-LD), header nav, footer
  components/            PostList, BlogIndex, Timeline, ProjectCard, XFeed, Socials, ui/*
  pages/                 routes (below)
  styles/global.css      tokens, base styles, motion, prose
.github/workflows/deploy.yml
```

## Routes

| Route | File | Notes |
|---|---|---|
| `/` | `pages/index.astro` | Hero, stats (posts, tools & projects, years; each links to its page), featured projects, latest posts, recent repos, X posts. `ProfilePage` + `WebSite` JSON-LD |
| `/blog/` | `pages/blog/index.astro` → `BlogIndex` | Category filter chips |
| `/blog/category/<slug>/` | `pages/blog/category/[slug].astro` | Indexable; `CollectionPage` + breadcrumbs |
| `/blog/tag/<slug>/` | `pages/blog/tag/[slug].astro` | `noindex, follow` |
| `/blog/<slug>/` | `pages/blog/[id].astro` | `BlogPosting` (author from `data/author.ts`) + breadcrumbs, cover image, table of contents (3+ sections), heading links, author box, related posts, X embeds as static cards |
| `/blog/<slug>.md` | `pages/blog/[id].md.ts` | Raw markdown for AI agents |
| `/projects/` | `pages/projects.astro` | Tools, projects, all repos |
| `/timeline/` | `pages/timeline.astro` | Every repo grouped by year |
| `/search/` | `pages/search.astro` + `search.json.ts` | Client-side filter over a JSON index; `noindex` |
| `/404.html` | `pages/404.astro` | Custom not-found page: requested path, search and nav buttons, latest posts; `noindex` |
| `/blog/category/ai-tools/` | `astro.config.mjs` `redirects` | Redirect page to `/blog/category/ai/` (category merged) |
| `/sitemap.xml` `/robots.txt` `/rss.xml` `/llms.txt` `/llms-full.txt` | `pages/*.ts` | Generated endpoints; no extra dependencies |

## External data and failure modes

| Source | Used for | If it fails |
|---|---|---|
| `api.github.com/users/harindujayakody/repos` | timeline, stats, repo list | Build continues; timeline shows a notice, stats fall back |
| `cdn.syndication.twimg.com/tweet-result` | X cards on the home page and in posts | Home: that post is skipped. Posts: the pasted embed shows as a styled quote |
| `pbs.twimg.com` (browser) | avatars, photo and video previews in X cards (680px JPG) | Image fails to load; the card text still shows |

The deploy workflow passes `GITHUB_TOKEN` so the GitHub API isn't rate-limited in CI.

## Deploy

`.github/workflows/deploy.yml`: on push to `master`, daily at 01:00 UTC, or manually.
Steps (Node 24): `npm ci` → `npm run check` → `npm run lint` → `npm run build` → `actions/upload-pages-artifact` → `actions/deploy-pages`. A failed check or lint stops the release. Every action is pinned to a full commit SHA with its release in a comment; bump them deliberately. Repo setting: Pages → Source: GitHub Actions.

`.github/workflows/ci.yml` runs the same check, lint and build on every pull request (no deploy).

### Cloudflare (in front of harindujayakody.com)

GitHub Pages can't set cache headers, so long caching is done in Cloudflare:

- **Cache rule:** URI path starts with `/_astro/` → Edge TTL and Browser TTL **1 year**. Everything in `/_astro/` has a content hash in its file name, so it never goes stale.
- Leave HTML on the default short cache so new posts appear right after a deploy.
- **Email Address Obfuscation** (Scrape Shield) adds `email-decode.min.js` to every page; turn it off to keep pages script-free.
- **Web Analytics** adds `beacon.min.js` (about 10 KB, flagged as legacy JavaScript by PageSpeed). Keep it only if you use the stats.

## SEO model

- One canonical URL per page (`Astro.site` = `https://harindujayakody.com`).
- Indexable: home, blog, categories, posts, projects, timeline, all listed in the sitemap with `lastmod`.
- Not indexed: tag pages (duplicate category listings) and search.
- Structured data mirrors visible content: author, dates, breadcrumbs, article section.
- `/llms.txt` follows llmstxt.org and points agents at the `.md` copies.
