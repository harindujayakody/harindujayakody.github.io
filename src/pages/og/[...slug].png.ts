import type { APIContext } from "astro";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { getPosts, fmtDate, readingTime } from "../../lib/posts";
import { author } from "../../data/author";

// Build-time Open Graph images (1200×630): satori lays out the card with real Poppins glyphs, resvg rasterizes it.
// Poppins is the only site font shipped as static .woff (satori can't read woff2 or variable fonts).
type Card = { title: string; kicker: string; meta: string; cmd: string };

export async function getStaticPaths() {
  const posts = await getPosts();
  return [
    ...posts.map((p) => ({
      params: { slug: p.id },
      props: { title: p.data.title, kicker: p.data.category, meta: `${fmtDate(p.data.date)} · ${readingTime(p.body)} min read`, cmd: "cat post.md" },
    })),
    { params: { slug: "index" }, props: { title: author.name, kicker: "Founder of Infiax", meta: "Web apps · browser extensions · tools", cmd: "whoami" } },
    { params: { slug: "blog" }, props: { title: "Notes on AI tools, Windows fixes and building for the web", kicker: "Blog", meta: `${posts.length} posts`, cmd: "ls ./posts" } },
  ];
}

const root = process.cwd(); // astro build runs from the project root
const font = (w: number) => readFile(join(root, `node_modules/@fontsource/poppins/files/poppins-latin-${w}-normal.woff`));
let assets: Promise<{ fonts: { name: string; data: Buffer; weight: 400 | 500 | 600 }[]; avatar: string }> | undefined;
const loadAssets = () =>
  (assets ??= Promise.all([font(400), font(500), font(600), readFile(join(root, "src/assets/avatar.png"))]).then(([r, m, b, av]) => ({
    fonts: [
      { name: "Poppins", data: r, weight: 400 },
      { name: "Poppins", data: m, weight: 500 },
      { name: "Poppins", data: b, weight: 600 },
    ],
    avatar: `data:image/png;base64,${av.toString("base64")}`,
  })));

// Minimal element helper: satori takes React-shaped objects, so no JSX/React needed.
const h = (type: string, style: Record<string, unknown>, ...children: unknown[]) => ({
  type,
  props: { style: { display: "flex", ...style }, children: children.length === 1 ? children[0] : children },
});

const C = { bg: "#0b0d12", fg: "#eef0f4", muted: "#9aa0ab", mint: "#7fd6b4", border: "rgba(255,255,255,0.12)" };

function card({ title, kicker, meta, cmd }: Card, avatar: string) {
  const size = title.length > 70 ? 52 : title.length > 45 ? 60 : 72;
  return h(
    "div",
    {
      // satori sizes this box without its padding, so subtract it to land exactly on the 1200×630 canvas.
      width: 1200 - 2 * 80,
      height: 630 - 2 * 64,
      flexDirection: "column",
      justifyContent: "space-between",
      padding: "64px 80px",
      boxSizing: "content-box",
      backgroundColor: C.bg,
      backgroundImage: "radial-gradient(circle at 50% -20%, rgba(127,214,180,0.16), rgba(127,214,180,0) 60%), radial-gradient(circle at 2px 2px, rgba(255,255,255,0.07) 1.5px, rgba(255,255,255,0) 0)",
      backgroundSize: "1200px 630px, 28px 28px",
      fontFamily: "Poppins",
      color: C.fg,
    },
    h(
      "div",
      { justifyContent: "space-between", alignItems: "center" },
      h("div", { fontSize: 28, fontWeight: 500, color: C.muted }, h("span", { color: C.mint }, "~/harindu"), h("span", { marginLeft: 14 }, `$ ${cmd}`)),
      h("div", { fontSize: 24, fontWeight: 500, color: C.mint, border: `2px solid ${C.mint}`, borderRadius: 999, padding: "6px 22px" }, kicker),
    ),
    h("div", { fontSize: size, fontWeight: 600, lineHeight: 1.12, letterSpacing: -1.5, maxWidth: 1040 }, title),
    h(
      "div",
      { justifyContent: "space-between", alignItems: "center", borderTop: `2px solid ${C.border}`, paddingTop: 32 },
      h(
        "div",
        { alignItems: "center" },
        { type: "img", props: { src: avatar, width: 64, height: 64, style: { borderRadius: 999, border: `2px solid ${C.border}` } } },
        h("div", { flexDirection: "column", marginLeft: 20 }, h("div", { fontSize: 26, fontWeight: 600 }, author.name), h("div", { fontSize: 22, color: C.muted }, "harindujayakody.com")),
      ),
      h("div", { fontSize: 24, color: C.muted }, meta),
    ),
  );
}

export async function GET({ props }: APIContext) {
  const { fonts, avatar } = await loadAssets();
  const svg = await satori(card(props as Card, avatar) as Parameters<typeof satori>[0], { width: 1200, height: 630, fonts });
  const png = new Resvg(svg, { fitTo: { mode: "width", value: 1200 } }).render().asPng();
  return new Response(new Uint8Array(png), { headers: { "Content-Type": "image/png" } });
}
