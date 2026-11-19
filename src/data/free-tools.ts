// Tools hosted on this site under /free-tools/. Add one entry per tool page.
export type FreeTool = {
  slug: string; // folder under /free-tools/, also the share card at /og/free-tools/<slug>.png
  name: string;
  href: string;
  desc: string;
  tags: string[];
  // Bump when the tool's page changes; the sitemap uses it as lastmod (not the build date).
  updated: Date;
  source?: string;
  post?: string;
};

export const freeTools: FreeTool[] = [
  {
    slug: "http-status-codes",
    name: "HTTP status codes",
    href: "/free-tools/http-status-codes/",
    desc: "All 63 HTTP status codes explained: what each one means, common causes, how to fix errors like 404, 500 and 502, and example responses.",
    tags: ["HTTP", "Reference", "Web"],
    updated: new Date("2026-11-19"),
    source: "https://github.com/harindujayakody/http-status-codes",
    post: "/blog/http-status-codes-reference/",
  },
  {
    slug: "2fa-online",
    name: "2FA code generator",
    href: "/free-tools/2fa-online/",
    desc: "Paste a 2FA secret key and get the live 6-digit code, like an authenticator app. Runs in your browser; nothing is sent or saved.",
    tags: ["TOTP", "Security", "Private"],
    updated: new Date("2026-11-19"),
    source: "https://github.com/harindujayakody/2fa-tools",
    post: "/blog/free-online-2fa-code-generator/",
  },
];

export const toolsUpdated = new Date(Math.max(...freeTools.map((t) => +t.updated)));
