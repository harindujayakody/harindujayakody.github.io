---
title: "Free Online 2FA Code Generator That Never Sees Your Keys"
description: "Get a 2FA code from a secret key in your browser. How my free TOTP tool works, why nothing is saved on a server, and when to use an app instead."
date: 2026-11-19
popular: true
category: "Web"
tags: ["2fa", "totp", "security", "free tools", "authenticator"]
repo: "harindujayakody/2fa-tools"
---

I built a small tool that turns a 2FA secret key into the 6-digit code an authenticator app would show. It now lives on this site at [/free-tools/2fa-online/](/free-tools/2fa-online/), in the same theme as everything else.

The short version: **no data is saved on any server.** The code is calculated in your browser, and your keys never leave the page.

## What is a 2FA secret key?

When you turn on two-factor authentication, most services show a QR code. Under it there's usually a link like "Can't scan the code?" that reveals the same thing as text: a key such as `JBSW Y3DP EHPK 3PXP`.

That key, plus the current time, is all an authenticator app needs to produce your codes. Anything that has the key can produce the same codes, which is why the key must be kept as safe as a password.

## How to use the tool

1. Open the [2FA code generator](/free-tools/2fa-online/).
2. Paste your secret key. For several accounts, put one key per line.
3. Press **Get 2FA codes** (or `Ctrl` + `Enter`).
4. Copy the code with the copy button before the ring runs out. A new code appears every 30 seconds.

Spaces, dashes and lowercase letters don't matter, so you can paste keys exactly as services show them. If a key has a typo, the tool tells you which character is wrong.

## Your keys stay on your device

This was the main goal, so here's exactly what happens to a key you paste.

The code is calculated with the browser's built-in Web Crypto API, and the page makes no requests with your key. Nothing is saved either: not on a server, and not in your browser (no cookies, no `localStorage`). The key exists only in the open tab's memory.

The tool wipes it when you press Clear all, after 5 minutes without activity, when the tab sits in the background for over 2 minutes, and when you leave the page. Results label each key like `Key 1 · JBSW…PXP`, so someone glancing at your screen doesn't see the secret.

The page also has a strict Content Security Policy that blocks third-party scripts and any connection to another domain. If something did go wrong, the browser itself would refuse to send your key elsewhere.

Once the page has loaded, generating codes doesn't need an internet connection at all.

## How 2FA codes are calculated

These codes are TOTP (time-based one-time passwords), defined in [RFC 6238](https://datatracker.ietf.org/doc/html/rfc6238). Google Authenticator, Authy and nearly every service use the same method:

1. Count how many 30-second periods have passed since 1 January 1970.
2. Sign that number with the secret key using HMAC-SHA1.
3. Take 31 bits from the signature and keep the last 6 digits.

Because your phone and the service both know the key and the time, they arrive at the same code without talking to each other. This is the whole calculation in the tool:

```ts
export async function totp(secret: string, nowSec = Math.floor(Date.now() / 1000)) {
  const key = await crypto.subtle.importKey("raw", base32ToBytes(secret), { name: "HMAC", hash: "SHA-1" }, false, ["sign"]);
  const counter = new Uint8Array(8);
  new DataView(counter.buffer).setBigUint64(0, BigInt(Math.floor(nowSec / 30)));
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, counter));
  const off = sig[19] & 0x0f;
  const code = (((sig[off] & 0x7f) << 24) | (sig[off + 1] << 16) | (sig[off + 2] << 8) | sig[off + 3]) % 1_000_000;
  return { code: String(code).padStart(6, "0"), remaining: 30 - (nowSec % 30) };
}
```

It's checked against the official test vectors from the RFC every time the site is built, so a broken change can't go live.

## When to use an authenticator app instead

For everyday logins, an authenticator app on your phone is the safer choice: your keys stay on one device you carry, instead of being pasted anywhere.

The tool is handy when:

- you're setting up 2FA and want to confirm the key works,
- you're moving accounts to a new phone and need a code in between,
- you need a code on a computer you trust and your phone isn't nearby.

Only paste a secret key on a device you trust, and press **Clear all** when you're done.

## Open source

The tool started as [2fa-tools](https://github.com/harindujayakody/2fa-tools), a single HTML file with no dependencies, MIT licensed. The version on this site uses the same algorithm and the same wipe rules, with two changes: keys are masked in the results, and invalid keys explain what's wrong.

Try it at [harindujayakody.com/free-tools/2fa-online](/free-tools/2fa-online/).
