# Changelog

All notable changes to this site. Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), versions follow [SemVer](https://semver.org/).

## [1.7.0] - 2026-11-12

### Added
- Search pop-up (#13): `Ctrl/⌘ + K`, `/` or the header icon opens search over the current page instead of navigating away. Results are grouped (Posts, Tools, Projects) with matched words highlighted; `↑`/`↓` move, `↵` opens, `esc` or a click outside closes. Full-screen on phones. The index loads only on first open.
- Keyboard shortcuts (#14): `g` then `h`/`b`/`p`/`t` go to home, blog, projects and timeline; `?` (or the footer "shortcuts" button) shows the list. Ignored while typing in a field. The header shows `⌘ K` on Apple devices and `Ctrl K` elsewhere; key hints are hidden on touch screens.
- `npm test`: unit tests for the search logic, run in CI and before every deploy.

### Changed
- `/search/` uses the same shared search module as the pop-up (`src/lib/search.ts`), now with grouped, highlighted results. It stays the target for `?q=` links and Google's `SearchAction`.

## [1.6.0] - 2026-11-12

### Added
- Table of contents (#8): an "On this page" box on posts with 3 or more sections, listing `##` and `###` headings; collapsible, and two columns on wider screens when long.
- Linkable headings (#8): every `##`/`###` gets a `#` link to its own section (shown on hover or focus, always faintly visible on touch screens). Headings land below the sticky header. Section ids are unchanged, so existing links keep working.
- Author box (#9) after every post: photo, name, role, bio and links (X, LinkedIn, GitHub, email, RSS).
- `src/data/author.ts`: one source for author facts, used by the author box, the home page `Person` and each post's `BlogPosting.author` (now with `image` and `sameAs`).

## [1.5.0] - 2026-11-12

### Added
- Custom 404 page (#10): terminal-style "no such file or directory" with the requested path, buttons for search, home, blog and projects, and the 3 latest posts. `noindex`; GitHub Pages serves it for every missing URL.
- Redirect from `/blog/category/ai-tools/` to `/blog/category/ai/`.

### Changed
- Categories are a fixed list (#11): `AI`, `Guides`, `Windows`, `Web`. Any other value fails the build with a clear message. "Craft Anything" moved from "AI Tools" to "AI", so `/blog/category/ai/` now has both AI posts.
- Home page stats (#12): **posts published**, **tools & projects** (hand-picked items and public repos, counted once) and **years building**, each linking to its page. "Stars earned" removed.

## [1.4.0] - 2026-11-11

### Added
- `ci.yml`: `astro check`, ESLint and a full build on every pull request (closes #3 together with the deploy gate).
- `LICENSE` (MIT), `npm run check` and `npm run lint` scripts, ESLint config, and typed `Props` interfaces in components (PR #5).

### Changed
- Deploy runs `check` and `lint` before building, so type or lint errors stop a release.
- All GitHub Actions pinned to full commit SHAs on their latest releases: checkout v7.0.1, setup-node v7.1.0, upload-pages-artifact v5.0.0, deploy-pages v5.0.1 (closes #4).
- Deploy installs dependencies once (`npm ci`, then check, lint and build) instead of a second install inside `withastro/action`.
- README rewritten: highlights, tech stack, how it works (with a build diagram), project structure, scripts, CI and security, SEO, performance and badges.

## [1.3.0] - 2026-11-11

### Changed
- Code in posts now looks like GitHub dark mode: syntax colours from Shiki's `github-dark-default` (was `vesper`), `#151b23` blocks with GitHub's `#3d444d` border, 6px corners and 85% font size, and GitHub's neutral grey chip for inline `code` (was mint).

## [1.2.0] - 2026-11-11

### Added
- Copy button on every code block in posts. It appears on hover with a mouse and is always visible on touch screens; it shows "copied ✓" after copying. The small script ships only on posts that contain code.

## [1.1.0] - 2026-11-04

### Added
- Site version in the footer (read from `package.json`), linking to this changelog on GitHub.

## [1.0.3] - 2026-11-04

### Fixed
- Accessibility (PageSpeed "prohibited ARIA attributes"): X card like and reply counts no longer put `aria-label` on a plain `<span>`; screen readers get visually hidden text ("2 likes") instead.

### Changed
- Home page avatar is served through `astro:assets` as a hashed WebP (under 1 KB, down from a 39 KB PNG), so it can be cached long-term. `public/avatar.png` stays for social cards.

## [1.0.2] - 2026-11-04

### Changed
- New avatar `public/avatar.png` (home page, default social card, `Person` structured data).
- New favicon and Apple touch icon `public/favicon.jpg`, separate from the avatar.

### Removed
- Old `public/avatar.jpg`.

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
