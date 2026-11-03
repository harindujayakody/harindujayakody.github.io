export type Repo = {
  name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  html_url: string;
  homepage: string | null;
  created_at: string;
  fork: boolean;
};

const USER = "harindujayakody";

// Fetched once at build time; rebuild (or push) to refresh. Set GITHUB_TOKEN to avoid the 60 req/h anon limit.
let cache: Promise<Repo[]> | undefined;
export const getRepos = () =>
  (cache ??= fetch(`https://api.github.com/users/${USER}/repos?per_page=100&sort=created`, {
    headers: import.meta.env.GITHUB_TOKEN ? { Authorization: `Bearer ${import.meta.env.GITHUB_TOKEN}` } : {},
  })
    .then((r) => {
      if (!r.ok) throw new Error(`GitHub API ${r.status}`);
      return r.json() as Promise<Repo[]>;
    })
    .then((repos) => repos.filter((r) => !r.fork && r.name !== USER))
    .catch((e) => {
      console.warn(`[github] timeline unavailable: ${e.message}`);
      return [];
    }));
