# Changelog

All notable changes to this site. Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), versions follow [SemVer](https://semver.org/).

## [1.16.1] - 2026-11-13

### Changed
- The home page "GitHub" button shows the GitHub mark before its label.

## [1.16.0] - 2026-11-13

### Changed
- Timeline dots are a scroll spotlight (#35 follow-up): instead of every dot above the middle staying lit, a dot turns mint only while its row is about a third of the way down the screen, then dims again. Only the rows near the top glow, and the glow follows you as you scroll. The newest repo stays mint with its pulse.
- Author box links are icons (X, LinkedIn, GitHub, Email, RSS, Newsletter), with accessible names and hover titles, instead of text links.

### Fixed
- `⌘ K` on Macs: the key label is now chosen before the first paint (no "Ctrl" flash), and detection also covers Chrome on macOS, which reports its platform as `macOS` and was missed by the old case-sensitive check. Windows, Linux and Android still show `Ctrl K`.
- Missing spaces in key hints: the footer read `v1.15.0·shortcuts` and the header read `CtrlK`. The footer hint is now inline, and the header hint uses a gap.

## [1.15.0] - 2026-11-13

### Added
- Newsletter sign-up (#26) with Buttondown (`buttondown.com/harindu`):
  - A `$ subscribe --email` card after every post, below the author box, and a compact version under the post list on the blog, category, tag and series pages.
  - A plain HTML form that posts straight to Buttondown's embed endpoint, so it works without JavaScript and loads nothing from Buttondown until someone subscribes. Buttondown's confirmation page opens in a new tab.
  - Labelled `type="email"` field with `autocomplete="email"` and `required`; stacks on phones.
  - A "Newsletter ↗" link in the author box.
- `newsletter` (Buttondown username) in `src/data/author.ts`.

## [1.14.0] - 2026-11-13

### Changed
- Timeline dots react to scrolling (#35): on `/timeline/` and the home page's "Recently shipped" list, each dot turns from grey to mint as its row reaches the middle of the screen, so the rail fills as you scroll down and empties as you scroll up. CSS scroll timeline, no JavaScript. The newest repo stays mint with its pulse; browsers without scroll timelines keep the static look.

## [1.13.0] - 2026-11-13

### Added
- Analytics (#25): Cloudflare Web Analytics is on for harindujayakody.com with automatic setup. Cloudflare adds its beacon to every page at the edge, so there's no code change. It's cookie-free (no consent banner), skips prerendered pages until they're opened, and never runs in local builds. Documented in `docs/ARCHITECTURE.md` and the README.

### Changed
- README: the local `GITHUB_TOKEN` command now has a Windows PowerShell version next to the Bash one, with how to unset it.

## [1.12.0] - 2026-11-13

### Added
- Comments on posts (#24) with [giscus](https://giscus.app): each post gets its own GitHub Discussions thread in this repo's Announcements category (only giscus and the owner can open threads). Readers sign in with GitHub to comment or react.
  - Loads only when the comments come within 600px of the screen, or when "load comments" is clicked, so readers who stop earlier download nothing from giscus.
  - Matches the site: `public/giscus-theme.css` recolours giscus's transparent dark theme with the site's ink, mint and border tokens.
  - `$ cat comments.log` heading, placed after the older/newer links and before related posts. Without JavaScript, a link to the Discussions page shows instead.
  - `comments: false` in front matter turns comments off for a post.
- GitHub Discussions enabled on the repo.

## [1.11.0] - 2026-11-13

### Added
- GitHub contribution graph (#27) on the home page, under the stats: the last year of contributions from GitHub's GraphQL API, drawn as a static grid in mint using GitHub's own 5 activity levels. It has month labels, a less/more legend, the total and a link to the GitHub profile. Hovering a day shows its count and date, and screen readers get a one-line summary. Phones show the last 26 weeks. No JavaScript; refreshed by the daily rebuild.
- `getContributions()` in `src/lib/github.ts`, cached per build. If there's no token or the API fails, the graph is left out and the build log says why.

## [1.10.0] - 2026-11-13

### Added
- Post series (#28): posts with the same `series` name become a multi-part series once 2 or more parts are published.
  - A "series · part N of M" box under the post header lists every part, highlights the current one and links to the series page. Collapsible.
  - "← previous part / next part →" links at the end of each part, above the older/newer links.
  - Series page at `/blog/series/<slug>/` listing the parts in reading order; added to the sitemap.
  - `BlogPosting.isPartOf` (`CreativeWorkSeries`) and `position` in each part's structured data.
  - A `Series:` line in the markdown copy of each part (`/blog/<slug>.md`, `llms-full.txt`).
- Optional `seriesOrder` to set the reading order; otherwise parts read oldest first.
- Build warnings: a series with only one published part (usually a typo in the name; the post shows as a normal post and no series page is built), and a series where only some parts set `seriesOrder` (ignored, so date order is used).
- `docs/CONTENT.md` "Series" section and commented `series` fields in the sample post.

## [1.9.0] - 2026-11-13

### Added
- Instant page loads (#20): Speculation Rules prerender same-site pages when you hover a link (or press on touch screens), so they open immediately in Chrome and Edge. Feeds, markdown copies, share images, `search.json` and external links are excluded. Other browsers ignore the rules. No JavaScript file added.
- Page transitions (#21): pages cross-fade in 200ms while the header and footer hold still, using cross-document View Transitions (CSS only). Off under `prefers-reduced-motion`; browsers without support navigate as before.
- Reading progress bar (#22): a 2px mint bar under the header on posts, driven by a scroll timeline (no JavaScript). Hidden where unsupported and in print.
- Older / newer links (#23) at the end of every post, above related posts, with `rel="prev"` / `rel="next"`. Stacked on phones; the newest and oldest posts show one link.

### Fixed
- The scroll-reveal fade on sections never ran in production: the CSS minifier folded `animation` and `animation-timeline` into one shorthand, which browsers reject. Scroll-linked animations now use longhand properties (noted in `docs/DESIGN.md`).

## [1.8.0] - 2026-11-12

### Added
- Social share images (#7): every post gets a 1200×630 PNG at `/og/<slug>.png`, generated at build time in the site's style: dark background with a mint glow, `~/harindu $ cat post.md`, category tag, the title in Poppins, avatar, name, domain, date and reading time. The home page and blog index get their own cards (`/og/index.png`, `/og/blog.png`).
- `og:image:width`, `og:image:height` and `og:image:alt` on every page; every page now uses `summary_large_image`.
- Build-time dev dependencies: `satori` (layout to SVG with embedded fonts), `@resvg/resvg-js` (SVG to PNG), `@types/node` (types for the build-time endpoint). Nothing new ships to visitors.

### Changed
- Posts without a raster cover (and posts with an SVG cover) now share their generated card instead of the small avatar card. `BlogPosting.image` points to the same image.

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
