// Build-time page metadata (title, description, image) for link previews on external links.
// Only these hosts are fetched, so a post cannot make the build request arbitrary sites.
const HOSTS = new Set(["github.com", "www.github.com", "harindujayakody.com", "www.harindujayakody.com", "kathaarana.com", "www.kathaarana.com"]);

export type Meta = { title: string; desc: string; img: string };
const cache = new Map<string, Promise<Meta | undefined>>();

export const isPreviewHost = (u: URL) => HOSTS.has(u.hostname);

const decode = (s: string) => s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;|&#x27;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
// Matches <meta property="og:x" content="..."> in either attribute order.
const og = (html: string, key: string) => {
  const m = html.match(new RegExp(`<meta[^>]+(?:property|name)=["']${key}["'][^>]*content=["']([^"']*)["']`, "i")) ?? html.match(new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]*(?:property|name)=["']${key}["']`, "i"));
  return m ? decode(m[1]).trim() : "";
};

async function load(url: string): Promise<Meta | undefined> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000), headers: { "User-Agent": "harindujayakody.com link previews", Accept: "text/html" } });
    if (!res.ok) return undefined;
    const html = (await res.text()).slice(0, 200_000);
    const title = og(html, "og:title") || decode(html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1] ?? "").trim();
    if (!title) return undefined;
    const img = og(html, "og:image");
    let desc = og(html, "og:description") || og(html, "description");
    let name = title;
    if (new URL(url).hostname.endsWith("github.com")) {
      // GitHub titles look like "GitHub - owner/repo: description"; keep just "owner/repo" and drop the repeated tail of the description.
      name = title.replace(/^GitHub - /, "").replace(/:\s.*$/, "");
      desc = desc.replace(/\s-\s[\w.-]+\/[\w.-]+$/, "");
    }
    return { title: name, desc, img: img ? new URL(img, url).href : "" };
  } catch {
    return undefined; // offline or blocked: the link simply gets no preview
  }
}

export const pageMeta = (url: string) => (cache.has(url) ? cache.get(url)! : (cache.set(url, load(url)), cache.get(url)!));
