/* global Response, URL, crypto, TextEncoder */
// "Was this helpful?" counter for the blog. KV namespace VOTES holds `c:<post id>` (count) and `v:<hash>` (one vote per visitor per post).
// shortcut: KV read-modify-write is not atomic, so two votes in the same instant can count as one. Fine at blog scale; move to a Durable Object if it matters.
const ORIGINS = ["https://harindujayakody.com", "http://localhost:4321"];
const ID = /^[a-z0-9-]{1,100}$/;

const cors = (req) => {
  const o = req.headers.get("Origin");
  return { "Access-Control-Allow-Origin": ORIGINS.includes(o) ? o : ORIGINS[0], "Access-Control-Allow-Methods": "GET, POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type", Vary: "Origin" };
};
const json = (req, body, status = 200, extra = {}) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...cors(req), ...extra } });

const sha = async (s) => [...new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)))].map((b) => b.toString(16).padStart(2, "0")).join("");

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(req) });

    // All counts: { "post-id": 12, ... }
    if (req.method === "GET" && url.pathname === "/votes") {
      const { keys } = await env.VOTES.list({ prefix: "c:", limit: 1000 });
      const counts = Object.fromEntries(await Promise.all(keys.map(async (k) => [k.name.slice(2), Number(await env.VOTES.get(k.name)) || 0])));
      return json(req, counts, 200, { "Cache-Control": "public, max-age=60" });
    }

    // One vote per visitor (hashed IP) per post. A repeat returns the unchanged count.
    if (req.method === "POST" && url.pathname === "/vote") {
      if (!ORIGINS.includes(req.headers.get("Origin"))) return json(req, { error: "forbidden" }, 403);
      const { id } = await req.json().catch(() => ({}));
      if (typeof id !== "string" || !ID.test(id)) return json(req, { error: "bad id" }, 400);
      const seen = `v:${await sha(`${id}:${req.headers.get("CF-Connecting-IP") ?? ""}`)}`;
      const count = Number(await env.VOTES.get(`c:${id}`)) || 0;
      if (await env.VOTES.get(seen)) return json(req, { count, counted: false });
      await env.VOTES.put(seen, "1", { expirationTtl: 60 * 60 * 24 * 365 });
      await env.VOTES.put(`c:${id}`, String(count + 1));
      return json(req, { count: count + 1, counted: true });
    }
    return json(req, { error: "not found" }, 404);
  },
};
