// Tools hosted on this site under /free-tools/. Add one entry per tool page.
export type FreeTool = {
  name: string;
  href: string;
  desc: string;
  tags: string[];
  source?: string;
  post?: string;
};

export const freeTools: FreeTool[] = [
  {
    name: "2FA code generator",
    href: "/free-tools/2fa-online/",
    desc: "Paste a 2FA secret key and get the live 6-digit code, like an authenticator app. Runs in your browser; nothing is sent or saved.",
    tags: ["TOTP", "Security", "Private"],
    source: "https://github.com/harindujayakody/2fa-tools",
    post: "/blog/free-online-2fa-code-generator/",
  },
];
