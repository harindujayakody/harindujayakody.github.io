// Browser-side search shared by the /search/ page and the Ctrl+K dialog. Index comes from /search.json.
export type Doc = { type: "post" | "tool" | "project"; title: string; desc: string; url: string; meta: string; text: string };
export type Hit = { doc: Doc; score: number };

let index: Promise<Doc[]> | undefined;
// Fetched once, on first use; a failed fetch is retried next time instead of being cached.
export const loadIndex = () =>
  (index ??= fetch("/search.json")
    .then((r) => (r.ok ? (r.json() as Promise<Doc[]>) : Promise.reject(new Error(`HTTP ${r.status}`))))
    .catch((e) => {
      index = undefined;
      throw e;
    }));

export const terms = (q: string) => q.toLowerCase().split(/\s+/).filter(Boolean);

// Every term must appear somewhere; title matches rank higher. Stable for equal scores (index order = newest first).
export function search(docs: Doc[], words: string[]): Hit[] {
  if (!words.length) return [];
  return docs
    .flatMap((doc) => {
      const title = doc.title.toLowerCase();
      const all = `${title} ${doc.desc} ${doc.text}`.toLowerCase();
      return words.every((w) => all.includes(w)) ? [{ doc, score: words.filter((w) => title.includes(w)).length }] : [];
    })
    .sort((a, b) => b.score - a.score);
}

export const GROUPS = [
  { type: "post", label: "Posts" },
  { type: "tool", label: "Tools" },
  { type: "project", label: "Projects" },
] as const;

export const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const reEsc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Escapes the text, then wraps matched words in <mark>. Splitting on the raw text keeps markup out of matches.
export function highlight(text: string, words: string[]) {
  if (!words.length) return esc(text);
  const re = new RegExp(`(${words.map(reEsc).join("|")})`, "gi");
  return text
    .split(re)
    .map((part, i) => (i % 2 ? `<mark>${esc(part)}</mark>` : esc(part)))
    .join("");
}
