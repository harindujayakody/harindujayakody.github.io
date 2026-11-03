export type XPost = {
  id: string;
  url: string;
  text: string;
  date: string;
  likes: number;
  replies: number;
  name: string;
  handle: string;
  avatar: string;
};

// X's public embed endpoint (same one react-tweet uses); no API key. The token is X's own derivation from the id.
const token = (id: string) => ((Number(id) / 1e15) * Math.PI).toString(36).replace(/(0+|\.)/g, "");

async function getPost(url: string): Promise<XPost | null> {
  const id = url.match(/status\/(\d+)/)?.[1];
  if (!id) return null;
  try {
    const r = await fetch(`https://cdn.syndication.twimg.com/tweet-result?id=${id}&token=${token(id)}`);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const t = await r.json();
    let text: string = t.text ?? "";
    for (const u of t.entities?.urls ?? []) text = text.replace(u.url, u.display_url);
    text = text.replace(/https:\/\/t\.co\/\S+/g, "").trim(); // leftover t.co links are attached media
    text = text.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&"); // X sends HTML-escaped text; Astro escapes again
    return {
      id,
      url: `https://x.com/${t.user.screen_name}/status/${id}`,
      text,
      date: t.created_at,
      likes: t.favorite_count ?? 0,
      replies: t.conversation_count ?? 0,
      // NFKC turns styled "𝗛𝗮𝗿𝗶𝗻𝗱𝘂" into plain letters; strip private-use glyphs no font can draw
      name: t.user.name.normalize("NFKC").replace(/\p{Co}/gu, "").trim(),
      handle: t.user.screen_name,
      avatar: t.user.profile_image_url_https.replace("_normal.", "_bigger."),
    };
  } catch (e) {
    console.warn(`[x] skipped ${url}: ${(e as Error).message}`);
    return null;
  }
}

export const getXPosts = async (urls: string[]) =>
  (await Promise.all(urls.map(getPost))).filter((p): p is XPost => p !== null);
