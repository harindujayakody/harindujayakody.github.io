type El = { properties?: { id?: unknown } };
type Ctx = {
  textContent(node: unknown): string;
  setProperty(node: unknown, key: string, value: unknown): void;
  appendChild(node: unknown, child: unknown): void;
};

// GitHub-style slug (same rules as github-slugger, which Astro uses), so section URLs stay stable.
const slug = (text: string) => text.toLowerCase().replace(/[^\p{L}\p{M}\p{N}\p{Pc}\- ]/gu, "").replace(/ /g, "-");

// Sätteri hast plugin: gives each h2/h3 an id and a "#" link to itself.
// Astro's own heading-id plugin runs after this one and keeps an existing id, so the table of contents
// (built from those ids) matches. The link has no text (the "#" is drawn by CSS), so it doesn't leak into
// heading text or TOC labels. Factory form: a fresh duplicate counter per document.
export const headingAnchors = () => {
  const seen = new Map<string, number>();
  return {
    name: "heading-anchors",
    element: {
      filter: ["h2", "h3"],
      visit(node: El, ctx: Ctx) {
        const text = ctx.textContent(node).trim();
        let id = typeof node.properties?.id === "string" ? node.properties.id : slug(text);
        if (typeof node.properties?.id !== "string") {
          const n = seen.get(id) ?? 0;
          seen.set(id, n + 1);
          if (n) id = `${id}-${n}`;
          ctx.setProperty(node, "id", id);
        }
        ctx.appendChild(node, {
          type: "element",
          tagName: "a",
          properties: { href: `#${id}`, className: ["heading-anchor"], ariaLabel: `Link to section: ${text}` },
          children: [],
        });
      },
    },
  };
};
