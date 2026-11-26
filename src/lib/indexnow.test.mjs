/* global console */
import assert from "node:assert/strict";
import { urlsFor } from "./indexnow.mjs";

assert.deepEqual(urlsFor(["README.md", "src/styles/global.css"], "x.com"), []);
assert.deepEqual(urlsFor(["src/content/blog/a-post.md", "src/content/blog/images/a.png"], "x.com"), ["https://x.com/", "https://x.com/blog/", "https://x.com/blog/a-post/"]);
console.log("indexnow.mjs: all assertions passed");
