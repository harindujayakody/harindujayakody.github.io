/* global self, caches, fetch, URL, location, Response */
// Service worker for the LKR Rates tool only (scope: /free-tools/exchange-rates/).
// Rates data: network first, last copy when offline. The page: network first, cached copy when offline.
// Built files (/_astro/, fonts, icons): cache first.
const CACHE = "lkr-rates-v1";
const PAGE = "/free-tools/exchange-rates/";

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.add(PAGE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

const networkFirst = (req, fallback) =>
  fetch(req)
    .then((res) => {
      if (res.ok) caches.open(CACHE).then((c) => c.put(req, res.clone()));
      return res;
    })
    .catch(() => caches.match(req).then((hit) => hit || (fallback ? caches.match(fallback) : Response.error())));

self.addEventListener("fetch", (e) => {
  const { request } = e;
  if (request.method !== "GET") return;
  const url = new URL(request.url);

  // Rate files live on a data-only Pages site under /d/.
  if (url.hostname.endsWith(".pages.dev") && url.pathname.startsWith("/d/")) {
    e.respondWith(networkFirst(request));
    return;
  }
  if (url.origin !== location.origin) return;

  if (request.mode === "navigate") {
    e.respondWith(networkFirst(request, PAGE));
    return;
  }
  if (url.pathname.startsWith("/_astro/") || url.pathname.startsWith("/lkr/") || /\.(woff2?|png|jpg|svg)$/.test(url.pathname)) {
    e.respondWith(
      caches.match(request).then((hit) => hit || fetch(request).then((res) => {
        if (res.ok) caches.open(CACHE).then((c) => c.put(request, res.clone()));
        return res;
      })),
    );
  }
});
