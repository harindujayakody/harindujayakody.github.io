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

export type ContributionDay = {
  date: string;
  contributionCount: number;
  contributionLevel: "NONE" | "FIRST_QUARTILE" | "SECOND_QUARTILE" | "THIRD_QUARTILE" | "FOURTH_QUARTILE";
};
export type ContributionCalendar = { totalContributions: number; weeks: { contributionDays: ContributionDay[] }[] };

const calendarQuery = `query($login: String!) { user(login: $login) { contributionsCollection { contributionCalendar {
  totalContributions weeks { contributionDays { date contributionCount contributionLevel } } } } } }`;

// Last year of contributions (GraphQL only, which always needs a token). null hides the graph; the build still succeeds.
let calendarCache: Promise<ContributionCalendar | null> | undefined;
export const getContributions = () =>
  (calendarCache ??= (async () => {
    const token = import.meta.env.GITHUB_TOKEN;
    if (!token) throw new Error("no GITHUB_TOKEN set");
    const r = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ query: calendarQuery, variables: { login: USER } }),
    });
    if (!r.ok) throw new Error(`GitHub GraphQL ${r.status}`);
    const json = await r.json();
    const calendar = json.data?.user?.contributionsCollection?.contributionCalendar;
    if (!calendar) throw new Error(json.errors?.[0]?.message ?? "no calendar in response");
    return calendar as ContributionCalendar;
  })().catch((e) => {
    console.warn(`[github] contribution graph unavailable: ${e.message}`);
    return null;
  }));
