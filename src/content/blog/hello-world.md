---
title: "Hello, world"
description: "Why this site exists and how I publish to it: one markdown file, one git push."
date: 2026-11-03
tags: ["meta", "astro"]
---

This is the first post on my new site. It's built with **Astro**, ships zero JavaScript,
and every post is a plain markdown file.

## How publishing works

1. Add a file to `src/content/blog/`, e.g. `my-post.md`.
2. Fill in the frontmatter:

```md
---
title: "My post"
description: "One line for the list and SEO."
date: 2026-11-03
tags: ["web", "tools"]
draft: false
---
```

3. `git push`. The host rebuilds and the post is live.

Set `draft: true` to keep a post out of the build until it's ready.

> Replace this post with your own, or delete it.
