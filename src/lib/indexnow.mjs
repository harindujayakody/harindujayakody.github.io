// Which pages to tell IndexNow about after a deploy: each changed blog post, plus the pages that list it.
export function urlsFor(files, host) {
  const posts = files.map((f) => /^src\/content\/blog\/([^/]+)\.md$/.exec(f)?.[1]).filter(Boolean);
  if (!posts.length) return [];
  return [`https://${host}/`, `https://${host}/blog/`, ...posts.map((id) => `https://${host}/blog/${id}/`)];
}
