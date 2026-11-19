// TOTP (RFC 6238, HMAC-SHA1, 30 s, 6 digits), ported from github.com/harindujayakody/2fa-tools.
// Runs on the Web Crypto API only: works in browsers and in Node (tests) with no network or storage.

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

// Spaces, dashes and "=" padding are ignored, and case doesn't matter, so keys can be pasted as services show them.
export const normalizeKey = (key: string) => key.toUpperCase().replace(/[\s=-]/g, "");

export function base32ToBytes(b32: string) {
  let bits = 0;
  let val = 0;
  const out: number[] = [];
  for (const c of normalizeKey(b32)) {
    const idx = ALPHABET.indexOf(c);
    if (idx < 0) throw new Error(`Invalid character "${c}"`);
    val = (val << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      out.push((val >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  if (!out.length) throw new Error("Key is empty");
  return new Uint8Array(out);
}

export async function totp(secret: string, nowSec = Math.floor(Date.now() / 1000)) {
  const key = await crypto.subtle.importKey("raw", base32ToBytes(secret), { name: "HMAC", hash: "SHA-1" }, false, ["sign"]);
  const counter = new Uint8Array(8);
  new DataView(counter.buffer).setBigUint64(0, BigInt(Math.floor(nowSec / 30)));
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, counter));
  const off = sig[19] & 0x0f;
  const code = (((sig[off] & 0x7f) << 24) | (sig[off + 1] << 16) | (sig[off + 2] << 8) | sig[off + 3]) % 1_000_000;
  return { code: String(code).padStart(6, "0"), remaining: 30 - (nowSec % 30) };
}

// Show just enough of a key to tell rows apart, never the whole secret.
export const maskKey = (key: string) => {
  const k = normalizeKey(key);
  return k.length <= 8 ? `${k.slice(0, 2)}…` : `${k.slice(0, 4)}…${k.slice(-3)}`;
};
