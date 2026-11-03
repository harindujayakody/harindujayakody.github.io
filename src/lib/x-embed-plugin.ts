import { getPost, xCardHtml } from "./x";

const STATUS = /https:\/\/(?:x|twitter)\.com\/\w+\/status\/\d+/;
type Ctx = { replaceNode(node: unknown, n: { type: "raw"; value: string }): void };
type El = { properties?: { className?: unknown; href?: unknown }; children?: El[]; value?: string };

const card = async (url: string | undefined) => {
  const p = url ? await getPost(url) : null;
  return p ? { type: "raw" as const, value: xCardHtml(p) } : null;
};

const findHref = (n: El): string | undefined => {
  if (typeof n.properties?.href === "string" && STATUS.test(n.properties.href)) return n.properties.href;
  for (const c of n.children ?? []) {
    const h = findHref(c);
    if (h) return h;
  }
};

// Sätteri hast plugin: swaps pasted X embed code (<blockquote class="twitter-tweet">) for the site's own
// X card, fetched at build time, so posts ship no X script. If the fetch fails, the styled blockquote stays.
export const xEmbed = {
  name: "x-embed",
  // Block HTML in markdown usually arrives as a raw node…
  async raw(node: { value: string }, ctx: Ctx) {
    if (!node.value.includes("twitter-tweet")) return;
    const c = await card(node.value.match(STATUS)?.[0]);
    if (c) ctx.replaceNode(node, c);
  },
  // …or as a parsed element, depending on how the HTML block is split.
  element: {
    filter: ["blockquote"],
    async visit(node: El, ctx: Ctx) {
      const cls = node.properties?.className;
      if (!(Array.isArray(cls) && cls.includes("twitter-tweet"))) return;
      const c = await card(findHref(node));
      if (c) ctx.replaceNode(node, c);
    },
  },
};
