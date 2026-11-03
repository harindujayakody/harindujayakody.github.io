export type XPost = {
  id: string;
  url: string;
  text: string;
  truncated: boolean;
  date: string;
  likes: number;
  replies: number;
  name: string;
  handle: string;
  verified: boolean;
  avatar: string;
  media?: { type: "photo" | "video" | "animated_gif"; src: string; width: number; height: number };
};

// X's public embed endpoint (same one react-tweet uses); no API key. The token is X's own derivation from the id.
const token = (id: string) => ((Number(id) / 1e15) * Math.PI).toString(36).replace(/(0+|\.)/g, "");

export async function getPost(url: string): Promise<XPost | null> {
  const id = url.match(/status\/(\d+)/)?.[1];
  if (!id) return null;
  try {
    const r = await fetch(`https://cdn.syndication.twimg.com/tweet-result?id=${id}&token=${token(id)}`);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const t = await r.json();
    let text: string = t.text ?? "";
    for (const u of t.entities?.urls ?? []) text = text.replace(u.url, u.display_url);
    text = text.replace(/https:\/\/t\.co\/\S+/g, "").trim(); // leftover t.co links are attached media
    text = text.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&"); // X sends HTML-escaped text
    const m = t.mediaDetails?.[0];
    return {
      id,
      url: `https://x.com/${t.user.screen_name}/status/${id}`,
      text,
      truncated: Boolean(t.note_tweet), // long posts: the endpoint only returns the preview text
      date: t.created_at,
      likes: t.favorite_count ?? 0,
      replies: t.conversation_count ?? 0,
      // NFKC turns styled "𝗛𝗮𝗿𝗶𝗻𝗱𝘂" into plain letters; strip private-use glyphs no font can draw
      name: t.user.name.normalize("NFKC").replace(/\p{Co}/gu, "").trim(),
      handle: t.user.screen_name,
      verified: Boolean(t.user.is_blue_verified || t.user.verified),
      avatar: t.user.profile_image_url_https.replace("_normal.", "_bigger."),
      // name=small is X's 680px JPG: about 5x lighter than the original PNG, plenty for a card
      media: m && { type: m.type, src: `${m.media_url_https.replace(/\.\w+$/, "")}?format=jpg&name=small`, width: m.original_info?.width ?? 1600, height: m.original_info?.height ?? 900 },
    };
  } catch (e) {
    console.warn(`[x] skipped ${url}: ${(e as Error).message}`);
    return null;
  }
}

export const getXPosts = async (urls: string[]) =>
  (await Promise.all(urls.map(getPost))).filter((p): p is XPost => p !== null);

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const fmt = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K` : String(n));
const icon = (d: string, cls = "size-[1.1rem]") => `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" class="${cls}"><path d="${d}"/></svg>`;
const X_LOGO = "M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.41l-5.8-7.58-6.64 7.58H.47l8.6-9.83L0 1.15h7.59l5.24 6.93 6.07-6.93zm-1.29 19.5h2.04L6.48 3.24H4.3l13.31 17.41z";
const HEART = "M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z";
const REPLY = "M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z";
const BADGE = "M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.66-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.33 2.19c-1.4-.46-2.91-.2-3.92.81s-1.26 2.52-.8 3.91c-1.31.67-2.2 1.91-2.2 3.34s.89 2.67 2.2 3.34c-.46 1.39-.21 2.9.8 3.91s2.52 1.26 3.91.81c.67 1.31 1.91 2.19 3.34 2.19s2.68-.88 3.34-2.19c1.39.45 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34zm-11.71 4.2L6.8 12.46l1.41-1.42 2.26 2.26 4.8-5.23 1.47 1.36-6.2 6.77z";
const PLAY = "M8 5v14l11-7z";

// One card for both the home feed and in-article embeds, so they always match.
export function xCardHtml(p: XPost, { clamp = false } = {}) {
  const date = new Date(p.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const m = p.media;
  const media = m
    ? `<div class="relative aspect-video overflow-hidden rounded-lg border bg-black">
        <img src="${esc(m.src)}" alt="" aria-hidden="true" loading="lazy" decoding="async" class="absolute inset-0 size-full scale-110 object-cover opacity-40 blur-2xl" />
        <img src="${esc(m.src)}" alt="${m.type === "photo" ? "Image from the post" : "Video preview"}" width="${m.width}" height="${m.height}" loading="lazy" decoding="async" class="relative mx-auto h-full w-auto object-contain" />
        ${m.type === "photo" ? "" : `<span class="absolute inset-0 flex items-center justify-center"><span class="flex size-14 items-center justify-center rounded-full bg-background/80 text-foreground ring-1 ring-border backdrop-blur transition group-hover:scale-105 group-hover:text-primary">${icon(PLAY, "size-6 translate-x-0.5")}</span></span>
        <span class="absolute right-3 bottom-3 rounded-full bg-background/80 px-3 py-1 font-mono text-xs backdrop-blur">Watch on X ↗</span>`}
      </div>`
    : "";
  return `<article class="x-card group relative flex min-w-0 flex-col gap-3 rounded-xl border bg-card/70 p-5 transition duration-300 hover:border-foreground/20">
  <div class="flex items-center gap-3">
    <img src="${esc(p.avatar)}" alt="" width="40" height="40" loading="lazy" decoding="async" class="size-10 rounded-full border" />
    <div class="min-w-0 flex-1 leading-tight">
      <p class="flex items-center gap-1 truncate text-sm font-semibold text-foreground">${esc(p.name)}${p.verified ? icon(BADGE, "size-4 shrink-0 text-[#1d9bf0]") : ""}</p>
      <p class="truncate font-mono text-xs text-muted-foreground">@${esc(p.handle)}</p>
    </div>
    <span class="text-muted-foreground transition group-hover:text-foreground">${icon(X_LOGO, "size-4")}</span>
  </div>
  <p class="${clamp ? "line-clamp-6 " : ""}text-[0.95rem] leading-relaxed whitespace-pre-line text-foreground/90">${esc(p.text)}${p.truncated ? ` <span class="text-primary">Show more on X</span>` : ""}</p>
  ${media}
  <div class="mt-auto flex items-center gap-4 text-xs text-muted-foreground">
    <span class="flex items-center gap-1.5 tabular-nums transition group-hover:text-[#f91880]">${icon(HEART)}<span aria-hidden="true">${p.likes ? fmt(p.likes) : ""}</span><span class="sr-only">${p.likes} likes</span></span>
    <span class="flex items-center gap-1.5 tabular-nums">${icon(REPLY)}<span aria-hidden="true">${p.replies ? fmt(p.replies) : ""}</span><span class="sr-only">${p.replies} replies</span></span>
    <time datetime="${esc(p.date)}" class="ml-auto font-mono">${date}</time>
  </div>
  <a href="${esc(p.url)}" target="_blank" rel="noopener" class="absolute inset-0 rounded-xl focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring" aria-label="View post by ${esc(p.name)} on X"></a>
</article>`;
}
