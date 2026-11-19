/* global console */
// All numbers here are made up (serial 0000 / 000) to exercise the date rules.
import assert from "node:assert/strict";
import { decodeNic, ageOn, weekday } from "./nic.ts";

const today = new Date(2026, 10, 19);
const d = (nic) => {
  const r = decodeNic(nic, today);
  return "error" in r ? r.error : `${r.year}-${String(r.month).padStart(2, "0")}-${String(r.day).padStart(2, "0")} ${r.gender}`;
};

// Fixed 366-day table: February always has 29 days
assert.equal(d("199503100000"), "1995-01-31 Male");
assert.equal(d("199503200000"), "1995-02-01 Male");
assert.equal(d("199606000000"), "1996-02-29 Male");
assert.match(d("199506000000"), /29 February 1995/);
assert.equal(d("199506100000"), "1995-03-01 Male");
assert.equal(d("199606100000"), "1996-03-01 Male");
assert.equal(d("200914700000"), "2009-05-26 Male");
assert.equal(d("199514300000"), "1995-05-22 Male");
assert.equal(d("199614300000"), "1996-05-22 Male");
assert.equal(d("199536600000"), "1995-12-31 Male");
assert.equal(d("200036600000"), "2000-12-31 Male");

// Women and the old format
assert.equal(d("199562300000"), "1995-05-02 Female");
assert.equal(d("199586600000"), "1995-12-31 Female");
assert.equal(d("951230000V"), "1995-05-02 Male");
assert.equal(d("95 623 0000 x"), "1995-05-02 Female");

// Errors
assert.match(d("199536700000"), /out of range/);
assert.match(d("199550000000"), /out of range/);
assert.match(d("199500000000"), /out of range/);
assert.match(d("209912300000"), /possible birth year/);
assert.match(d("95123000V"), /9 digits/);
assert.match(d("abc"), /9 digits/);

// Conversion
assert.equal(decodeNic("951230000V", today).converted, "199512300000");
assert.equal(decodeNic("199512300000", today).converted, "951230000V");
assert.equal(decodeNic("199512310000", today).converted, undefined); // serial doesn't start with 0
assert.equal(decodeNic("200912300000", today).converted, undefined); // born in 2000 or later: new format only

// Age and weekday
assert.equal(ageOn({ year: 1995, month: 5, day: 2 }, new Date(2026, 4, 1)), 30);
assert.equal(ageOn({ year: 1995, month: 5, day: 2 }, new Date(2026, 4, 2)), 31);
assert.equal(weekday({ year: 1995, month: 5, day: 2 }), "Tuesday");

console.log("nic.ts: all assertions passed");
