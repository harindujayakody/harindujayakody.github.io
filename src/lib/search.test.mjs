import assert from "node:assert/strict";
/* global console */
import { search, terms, highlight } from "./search.ts";

const d = (title, text = "", type = "post") => ({ type, title, desc: "", url: `/${title}`, meta: "", text });
const docs = [d("Sync CC Switch with WebDAV", "cpanel guide"), d("Windows error 2503", "msiexec installer"), d("2fa-tools", "totp pwa", "tool")];

assert.deepEqual(terms("  WebDAV   cPanel "), ["webdav", "cpanel"]);
assert.equal(search(docs, []).length, 0, "empty query → no hits");
assert.deepEqual(search(docs, ["webdav", "cpanel"]).map((h) => h.doc.title), ["Sync CC Switch with WebDAV"], "all terms must match");
assert.equal(search(docs, ["installer"])[0].doc.title, "Windows error 2503", "body text matches");
const ranked = search([d("guide to things", "windows"), d("Windows guide", "")], ["windows"]);
assert.equal(ranked[0].doc.title, "Windows guide", "title match ranks first");

assert.equal(highlight("Error <b>2503</b>", ["2503"]), "Error &#60;b&#62;<mark>2503</mark>&#60;/b&#62;", "escapes HTML, marks match");
assert.equal(highlight("a.b a+b", ["a+b"]), "a.b <mark>a+b</mark>", "regex chars in query are literal");
assert.equal(highlight("WebDAV", ["webdav"]), "<mark>WebDAV</mark>", "case-insensitive, keeps original case");
assert.equal(highlight("x\"y", []), "x&#34;y");
console.log("search.ts: all assertions passed");
