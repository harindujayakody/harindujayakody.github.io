// Hand-picked items for /projects (and the first `featured` ones on the home page).
// Add anything here — it doesn't need to be a GitHub repo. `repo` adds a source link.
export type Item = {
  name: string;
  desc: string;
  kind: "tool" | "project";
  href: string;
  repo?: string;
  tags: string[];
  featured?: boolean;
};

const gh = (name: string) => `https://github.com/harindujayakody/${name}`;
const pages = (name: string) => `https://harindujayakody.github.io/${name}/`;

export const items: Item[] = [
  { name: "Infiax", kind: "project", href: "https://infiax.com", tags: ["Company", "Web apps"], desc: "My software studio. We build full-stack web apps, internal tools and automation for clients." },
  { name: "octopus-agent", kind: "project", href: gh("octopus-agent"), repo: gh("octopus-agent"), tags: ["TypeScript", "Chromium"], featured: true, desc: "Free, open-source anti-detect browser with engine-level fingerprint spoofing in Chromium." },
  { name: "browser-cache-cleaner-windows", kind: "project", href: gh("browser-cache-cleaner-windows"), repo: gh("browser-cache-cleaner-windows"), tags: ["PowerShell", "Windows"], featured: true, desc: "Cleans Chrome, Brave, Edge and Firefox cache across all profiles. Cookies stay safe." },
  { name: "proxyhell", kind: "project", href: gh("proxyhell"), repo: gh("proxyhell"), tags: ["Shell", "Linux"], featured: true, desc: "SOCKS5 automation: installs Dante and manages authenticated proxies from the terminal." },
  { name: "2fa-tools", kind: "tool", href: pages("2fa-tools"), repo: gh("2fa-tools"), tags: ["PWA", "Security"], featured: true, desc: "Privacy-first TOTP generator running entirely in the browser. Offline PWA, no backend." },
  { name: "steam-deal-finder", kind: "tool", href: pages("steam-deal-finder"), repo: gh("steam-deal-finder"), tags: ["JavaScript", "Gaming"], featured: true, desc: "Converts Steam USD prices to LKR live and tracks historical deals for Sri Lankan gamers." },
  { name: "binance-p2p-lkr-rate-live-update", kind: "tool", href: pages("binance-p2p-lkr-rate-live-update"), repo: gh("binance-p2p-lkr-rate-live-update"), tags: ["JavaScript", "Finance"], featured: true, desc: "Live Binance P2P LKR/USDT rates, advertiser listings, calculator and a toolbar rate badge." },
  { name: "duplicate-tabs-pro", kind: "tool", href: pages("duplicate-tabs-pro"), repo: gh("duplicate-tabs-pro"), tags: ["Extension"], desc: "Lightweight browser extension that clones your active tab with one click or a shortcut." },
  { name: "nic-information-finder", kind: "tool", href: pages("nic-information-finder"), repo: gh("nic-information-finder"), tags: ["JavaScript", "Sri Lanka"], desc: "Look up the details encoded in a Sri Lankan NIC number." },
  { name: "http-status-codes", kind: "tool", href: pages("http-status-codes"), repo: gh("http-status-codes"), tags: ["Reference"], desc: "Every HTTP status code explained, from informational to server errors." },
  { name: "speed-post-by-sl-post", kind: "tool", href: pages("speed-post-by-sl-post"), repo: gh("speed-post-by-sl-post"), tags: ["Calculator", "Sri Lanka"], desc: "Speed Post fee calculator for Sri Lanka Post." },
];
