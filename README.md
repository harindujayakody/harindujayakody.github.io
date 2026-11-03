# harindujayakody.com

Personal site of Harindu Jayakody: blog, projects and tools, and a timeline of every public repo.
Built with Astro 7 and Tailwind v4. It's static, with no framework JavaScript in the browser, and deploys to GitHub Pages.

**Live:** https://harindujayakody.com

## Quick start

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # outputs to dist/
npm run preview   # serves dist/
```

Requires Node 22 or newer. Set `GITHUB_TOKEN` locally if the GitHub API rate-limits you (60 requests an hour without it).

## Everyday tasks

| I want to… | Do this |
|---|---|
| Publish a post | Add `src/content/blog/<slug>.md` and push to `master` → [docs/CONTENT.md](docs/CONTENT.md) |
| Add a cover image | Put the image in `src/content/blog/images/`, set `image: ./images/<file>` |
| Embed an X post in an article | Paste X's embed code, minus the `<script>` line |
| Show X posts on the home page | Add URLs to `src/data/x-posts.ts` |
| Add a tool or project | Add an entry to `src/data/projects.ts` |
| Change colors or fonts | `src/styles/global.css` → [docs/DESIGN.md](docs/DESIGN.md) |

## Pages

`/` · `/blog/` · `/blog/<slug>/` · `/blog/category/<slug>/` · `/blog/tag/<slug>/` · `/projects/` · `/timeline/` · `/search/`

Machine-readable: `/sitemap.xml` · `/robots.txt` · `/rss.xml` · `/llms.txt` · `/llms-full.txt` · `/blog/<slug>.md` · `/search.json`

## Docs

- [docs/CONTENT.md](docs/CONTENT.md): writing posts, front matter, images, embeds, projects
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md): how the site is built and deployed
- [docs/DESIGN.md](docs/DESIGN.md): colors, type, motion, components
- [CHANGELOG.md](CHANGELOG.md)

## Deploy

Every push to `master` runs `.github/workflows/deploy.yml` (build, then GitHub Pages). It also rebuilds daily at 01:00 UTC so the repo timeline, stats and X like counts stay fresh.
