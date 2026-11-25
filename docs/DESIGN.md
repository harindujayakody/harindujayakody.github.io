# Design

A quiet, dark, terminal-flavoured personal site. One soft accent, used sparingly. Content first.

## Principles

1. **Ink first, accent second.** Text and numbers are white or grey. Mint marks only what's interactive or current: the active nav item, the primary button, category labels, the newest timeline dot.
2. **Terminal voice, not a terminal costume.** Short shell prompts label pages (`$ ls ./posts`, `cd ../blog`); everything else is plain, readable prose.
3. **No glow, no gradients on text.** Depth comes from 1px borders and a faint card fill.
4. **Fast is part of the design.** Nothing ships that delays first paint.

## Color tokens

Defined on `:root` in `src/styles/global.css` with shadcn/ui names, so components read like shadcn.

| Token | Value | Use |
|---|---|---|
| `--background` | `oklch(0.14 0.008 265)` | Page |
| `--foreground` | `oklch(0.96 0.004 265)` | Body text, numbers |
| `--card` | `oklch(0.175 0.01 265)` | Card fill, used at 50–70% opacity |
| `--muted` / `--secondary` | `oklch(0.23 0.012 265)` | Chips, active nav background |
| `--muted-foreground` | `oklch(0.7 0.012 265)` | Secondary text, meta |
| `--primary` | `oklch(0.82 0.09 165)` | Soft mint accent |
| `--accent` | `oklch(0.75 0.05 230)` | The `$` in the hero prompt only |
| `--border` | `oklch(1 0 0 / 9%)` | All borders |
| `--ring` | mint at 45% | Focus rings |

Two themes. Dark (above) is the default palette; light lives under `html[data-theme="light"]` with the same token names (background `oklch(0.985 0.003 265)`, text `oklch(0.2 0.012 265)`, primary `oklch(0.52 0.11 165)`). Light is the default: `<html>` is rendered with `data-theme="light"`, and an inline script in the `<head>` switches it to dark before first paint only when the visitor chose dark with `ThemeToggle` (saved in `localStorage`). The device setting is not followed. Every text pair passes WCAG AA in both themes. Extra tokens cover what used to be hex values: `--dot`, `--glow`, `--code-bg`, `--code-border`, `--code-inline`, `--danger`, `--warning`, `--star`, `--st-1` to `--st-5`. Background: a faint mint radial at the top plus a 24px dot grid.
X brand pink `#f91880` appears only on the X card like icon, on hover.
Code borrows GitHub dark mode: Shiki `github-dark-default` syntax colours, `#151b23` blocks with a `#3d444d` border and 6px corners, and a `#656c7633` chip for inline code. These are the only non-token colours besides the X pink.

## Typography

| Role | Font | Notes |
|---|---|---|
| Headings | Poppins 600 | `tracking-tight`; h1 `text-4xl` → `sm:text-6xl` |
| Body | Inter variable | 16px, `leading-relaxed` |
| Article body (`.prose`) | Inter variable | 18px, `leading-8`; used by blog posts and the HTTP status-code pages |
| Numbers, code, labels, nav | JetBrains Mono variable | `tabular-nums` for stats |

## Motion

All CSS, no JavaScript. Everything is disabled under `prefers-reduced-motion: reduce`.

| Class | Effect |
|---|---|
| `.rise` | Fade and rise 14px on load; stagger with `style="--d:80ms"` |
| `.reveal` | Same rise, driven by scroll position (`animation-timeline: view()`), in browsers that support it; elsewhere the content just shows |
| `.read-progress` | 2px mint bar under the header on posts, filled by `animation-timeline: scroll(root)`; hidden where unsupported and in print |
| Page transitions | `@view-transition { navigation: auto; }`: the page cross-fades in 200ms while the header and footer (`view-transition-name`) hold still |
| Theme switch | View Transitions: switching to light clips the new view open as a circle from the toggle; switching to dark clips the old (light) view closed into it. `html.theme-switching` removes named transition parts so the page moves as one; plain switch without View Transitions or with reduced motion |
| Dialogs | Search and shortcuts dialogs fade and scale in from 96% (slide up on phones) and reverse on close; the backdrop dim and blur fade with them (`@starting-style`, `transition-behavior: allow-discrete`). `scrollbar-gutter: stable` keeps the page still while a dialog locks scrolling |
| `<details>` | FAQ answers, the table of contents and series boxes open and close by animating height (`interpolate-size: allow-keywords`, `::details-content`) with a fade |

Scroll-linked animations must use longhand properties (`animation-name`, `animation-timeline`, …). The CSS minifier folds `animation` plus `animation-timeline` into one shorthand, and browsers reject a shorthand with a timeline, so the animation silently disappears.
| `.caret` | Blinking cursor in the hero |
| `.ping` | Pulse on the newest timeline repo |
| `.tl-dot` | Timeline dots as a scroll spotlight: mint while their row is about 28–38% down the screen (keyframes 62–72% of `animation-timeline: view()`), grey above and below; `.is-newest` is always mint. Static grey where unsupported |
| Cards | `-translate-y-0.5` and a brighter border on hover |

## Components

| Component | Notes |
|---|---|
| `ui/Button` | `default` (mint fill), `outline`, `ghost`; `size="icon"` |
| `ui/Card` | Bordered, translucent; becomes a link when given `href` |
| `ui/Badge` | `secondary` (filled, mono) or `outline` |
| `PostList` | Whole row is the link (stretched link); category and tag links sit above it. Type: title 19px semibold, description 15px (the article body itself is 18px) |
| `ProjectCard` | Same stretched-link pattern; optional "source ↗" |
| `XFeed` | Mirrors an X post: avatar, name, handle, text, X's like and reply icons |
| `Timeline` | Year column (sticky on desktop), dashed rail, dots |
| `ContributionGraph` | Last year of GitHub contributions: GitHub's 5 levels as `.cg .l0`–`.l4` (grey, then mint at 25/50/75/100%), month labels, legend, hover titles; one `role="img"` summary for screen readers. Last 26 weeks below `sm` |
| `SeriesBox` | "series · part N of M" `<details>` listing every part, current one highlighted |
| `PostNav` | Older/newer (or previous/next part) cards, stacked on phones |
| `Comments` | `$ cat comments.log` heading; giscus iframe injected on scroll (600px early) or click; theme `public/giscus-theme.css` recolours giscus's transparent dark theme with the site tokens |
| `Subscribe` | `$ subscribe --email` card after each post (`compact` on blog list pages): plain HTML form posting to Buttondown, works without JavaScript; username in `src/data/author.ts` |
| `Toc` | "On this page" `<details>` on posts with 3+ `##` sections: top-level sections only, numbered `01`, `02`…; open for up to 6 sections, collapsed to one line above that; two columns above `sm` when long |
| `AuthorBox` | After every post: avatar, name, role, bio, and icon links (X, LinkedIn, GitHub, email, RSS, newsletter) as ghost icon buttons with labels and hover titles; reads `src/data/author.ts` |
| `StarCard` | "Star on GitHub" for a repo: `compact` split button (top of tool pages) or a card with the repo description (end of posts and tools). Star count from the build-time GitHub repo list, hidden while 0; the star fills gold on hover |
| `SearchDialog` | Native `<dialog>`: opened by the header icon, `Ctrl/⌘+K` or `/`; combobox + grouped listbox, `↑`/`↓`/`↵`/`esc`; full-screen below `sm` |
| `Shortcuts` | Global keys (`Ctrl/⌘+K`, `/`, `g`+`h`/`b`/`p`/`t`, `?`) and the help dialog; key hints (`kbd`) shown only to fine-pointer devices. `[data-mod-key]` renders `⌘` or `Ctrl` from CSS, based on `html[data-mac]` set by an inline script in the head before first paint |
| `ThemeToggle` | Sun/moon button in the header; icons rotate and swap. Saves only a dark choice; picking light clears it, since light is the default. Fires `theme:change` (giscus listens and switches its theme) |

## Layout

- Single column, `max-w-3xl`, 16px side gutters on phones.
- Grids collapse to one column below `sm` (640px). Grid columns use `minmax(0,1fr)` so long repo names truncate instead of widening the page.
- The sticky header holds `blog · tools · projects · timeline` plus a search icon; the `~/harindu` logo links home. Below 640px `timeline` is hidden (`desktopOnly` in the nav list) so the header fits at 360px; it stays reachable from the home page and via `g t`.

## Accessibility

- Skip-to-content link, `aria-current` on nav, `aria-label` on icon-only links.
- Visible focus rings (`ring-[3px]` in `--ring`).
- Muted text stays above 4.5:1 contrast on the background.
