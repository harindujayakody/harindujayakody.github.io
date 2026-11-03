# Changelog

All notable changes to this site. Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), versions follow [SemVer](https://semver.org/).

## [1.0.1] - 2026-11-04

### Changed
- **X embeds in posts are now site-themed cards built at build time**, replacing X's widget, whose iframe used X's own colours, font and player and couldn't be styled. Cards show the author, verified badge, text, a photo or video preview (vertical video centred over a blurred backdrop, with "Watch on X"), likes, replies and date. Long posts end with "Show more on X". Posts no longer load any X script.
- Home page X cards use the same card, now with photo previews.
- X images load as X's 680px JPG (`name=small`) instead of full PNGs: about 5× lighter.
- Markdown runs through Astro 7's Sätteri processor with a small `x-embed` plugin; `@astrojs/markdown-satteri` is now a direct dependency.

## [1.0.0] - 2026-11-04

### Added
- **Projects & Tools page** (`/projects/`): hand-picked tools and projects from `src/data/projects.ts` (custom items need not be GitHub repos), plus every public repo sorted by stars.
- **Categories and tags**: every post has a `category`; categories get indexable pages at `/blog/category/<slug>/`, tags get `noindex, follow` pages at `/blog/tag/<slug>/`. Both are clickable everywhere they appear.
- **Search** (`/search/`): searches post titles, descriptions, tags and full text, plus projects and tools. Supports `?q=` links and is wired to Google's `SearchAction`.
- **Related posts** under every article (same category first, then shared tags, then newest).
- **Cover images**: optional 16:9 `image` in front matter, optimized to responsive WebP; also used as the social card image. Inline markdown images are framed 16:9.
- **Real X embeds in posts**: paste X's embed code into a post; X's widget loads only when the embed scrolls near, in dark mode with do-not-track on. The styled quote shows until then.
- **SEO**: JSON-LD (`ProfilePage` + `Person`, `WebSite` with `SearchAction`, `BlogPosting`, `BreadcrumbList`, `CollectionPage`), `article:*` Open Graph tags, `max-image-preview:large`, author meta, `updated` dates, skip-to-content link.
- **Discovery files**: `/sitemap.xml`, `/robots.txt`, `/rss.xml`.
- **AI agent files**: `/llms.txt`, `/llms-full.txt`, and a plain-markdown copy of every post at `/blog/<slug>.md`.
- **Performance**: preloads the two fonts used above the fold (Poppins 600, Inter).
- Docs: `README.md`, `docs/ARCHITECTURE.md`, `docs/DESIGN.md`, `docs/CONTENT.md`.
- `src/content/blog/sample-post.md`: a commented reference post using every feature (draft; never published).
- Drafts now show in `npm run dev` so you can preview them; production builds still exclude them.

### Changed
- X cards on the home page use X's own like and reply icons, with X's pink on hover, and show reply counts.
- Navigation: `blog · projects · timeline` plus a search icon; the logo links home.
- Email is now me@harindujayakody.com; LinkedIn is now linkedin.com/in/harindux.

### Removed
- The placeholder "Hello, world" post.

## [0.4.0] - 2026-11-04

### Added
- Post: "Hermes Agent Mobile Is in Private Beta", with X embed markup styled as a site card.
- Canonical URLs and `og:url` on harindujayakody.com.

## [0.3.0] - 2026-11-03

### Added
- "On X" section on the home page, fetched at build time from `src/data/x-posts.ts`.
- Post: "How to Fix Windows Installer Error 2503".

### Changed
- Softer mint accent used sparingly; removed glows.

## [0.2.0] - 2026-11-03

### Added
- Markdown blog, GitHub repo timeline, dark terminal-style theme with CSS-only motion.
- GitHub Pages deploy workflow with a daily rebuild.

## [0.1.0] - 2026-11-03

### Added
- First Astro site replacing the 2020 WordPress export.
