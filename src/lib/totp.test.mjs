/* global console */
import assert from "node:assert/strict";
import { base32ToBytes, totp, maskKey } from "./totp.ts";

// Base32 decoding: "Hello!" + 0xdeadbeef
assert.deepEqual([...base32ToBytes("JBSWY3DPEHPK3PXP")], [72, 101, 108, 108, 111, 33, 222, 173, 190, 239]);
// Case, spaces, dashes and padding are ignored
assert.deepEqual(base32ToBytes("jbsw y3dp-ehpk3pxp=="), base32ToBytes("JBSWY3DPEHPK3PXP"));
// Invalid characters and empty keys are rejected
assert.throws(() => base32ToBytes("INVALID189!"), /Invalid character "1"/);
assert.throws(() => base32ToBytes(" - = "), /empty/);

// RFC 6238 test vectors (HMAC-SHA1, 30 s step): secret "12345678901234567890"
const rfc = "GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ";
assert.deepEqual(await totp(rfc, 59), { code: "287082", remaining: 1 });
assert.equal((await totp(rfc, 1111111109)).code, "081804");
assert.equal((await totp(rfc, 1111111111)).code, "050471");
assert.equal((await totp(rfc, 1234567890)).code, "005924");
assert.equal((await totp(rfc, 2000000000)).code, "279037");
assert.equal((await totp(rfc, 20000000000)).code, "353130", "counter beyond 32 bits");
assert.equal((await totp(rfc, 30)).remaining, 30);

// Masking never shows the whole key
assert.equal(maskKey("jbsw y3dp ehpk 3pxp"), "JBSW…PXP");
assert.equal(maskKey("ABCDEFG"), "AB…");

console.log("totp.ts: all assertions passed");
