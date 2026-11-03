# harindujayakody.github.io

Personal site. Astro, Tailwind v4, zero client JS.

```bash
npm install
npm run dev
```

## Publish a post

Add `src/content/blog/<slug>.md` and push to `master`:

```md
---
title: "Post title"
description: "One line for the list and SEO."
date: 2026-11-03
tags: ["web"]
draft: false
---
```

The Deploy workflow builds and publishes to GitHub Pages on every push, plus once a day so the repo timeline stays current.
