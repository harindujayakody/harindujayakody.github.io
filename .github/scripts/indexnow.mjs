/* global console, process, fetch */
// Runs after a deploy: sends new or edited published posts to IndexNow (Bing, Yandex and others). Never fails the deploy.
import { execSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { urlsFor } from "../../src/lib/indexnow.mjs";

const host = "harindujayakody.com";
const key = readdirSync("public").find((f) => /^[a-f0-9]{32}\.txt$/.test(f))?.slice(0, 32);
if (!key) { console.log("No IndexNow key file in public/, skipping."); process.exit(0); }

// HEAD^ is the previous master tip, so this covers everything the merged pull request changed.
const files = execSync("git diff --name-only HEAD^ HEAD", { encoding: "utf8" }).split("\n").filter(Boolean);
const urlList = urlsFor(files.filter((f) => existsSync(f) && !/^draft:\s*true/m.test(f.endsWith(".md") ? readFileSync(f, "utf8") : "")), host);
if (!urlList.length) { console.log("No published post changes, nothing to submit."); process.exit(0); }

try {
  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host, key, keyLocation: `https://${host}/${key}.txt`, urlList }),
  });
  console.log(`IndexNow ${res.status} for ${urlList.length} URLs:\n${urlList.join("\n")}`);
} catch (e) {
  console.log("IndexNow request failed:", e.message);
}
