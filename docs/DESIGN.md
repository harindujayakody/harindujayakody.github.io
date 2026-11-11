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

The site is dark only (`color-scheme: dark`). Background: a 4% mint radial at the top plus a 24px dot grid at 4% white.
X brand pink `#f91880` appears only on the X card like icon, on hover.
Code borrows GitHub dark mode: Shiki `github-dark-default` syntax colours, `#151b23` blocks with a `#3d444d` border and 6px corners, and a `#656c7633` chip for inline code. These are the only non-token colours besides the X pink.

## Typography

| Role | Font | Notes |
|---|---|---|
| Headings | Poppins 600 | `tracking-tight`; h1 `text-4xl` → `sm:text-6xl` |
| Body | Inter variable | 16px, `leading-relaxed` |
| Numbers, code, labels, nav | JetBrains Mono variable | `tabular-nums` for stats |

## Motion

All CSS, no JavaScript. Everything is disabled under `prefers-reduced-motion: reduce`.

| Class | Effect |
|---|---|
| `.rise` | Fade and rise 14px on load; stagger with `style="--d:80ms"` |
| `.reveal` | Same rise, driven by scroll position (`animation-timeline: view()`), in browsers that support it; elsewhere the content just shows |
| `.caret` | Blinking cursor in the hero |
| `.ping` | Pulse on the newest timeline repo |
| Cards | `-translate-y-0.5` and a brighter border on hover |

## Components

| Component | Notes |
|---|---|
| `ui/Button` | `default` (mint fill), `outline`, `ghost`; `size="icon"` |
| `ui/Card` | Bordered, translucent; becomes a link when given `href` |
| `ui/Badge` | `secondary` (filled, mono) or `outline` |
| `PostList` | Whole row is the link (stretched link); category and tag links sit above it |
| `ProjectCard` | Same stretched-link pattern; optional "source ↗" |
| `XFeed` | Mirrors an X post: avatar, name, handle, text, X's like and reply icons |
| `Timeline` | Year column (sticky on desktop), dashed rail, dots |
| `Toc` | "On this page" `<details>`, shown on posts with 3+ `##` sections; two columns above `sm` when long |
| `AuthorBox` | After every post: avatar, name, role, bio, links; reads `src/data/author.ts` |

## Layout

- Single column, `max-w-3xl`, 16px side gutters on phones.
- Grids collapse to one column below `sm` (640px). Grid columns use `minmax(0,1fr)` so long repo names truncate instead of widening the page.
- The sticky header holds `blog · projects · timeline` plus a search icon; the `~/harindu` logo links home. It fits at 360px.

## Accessibility

- Skip-to-content link, `aria-current` on nav, `aria-label` on icon-only links.
- Visible focus rings (`ring-[3px]` in `--ring`).
- Muted text stays above 4.5:1 contrast on the background.
