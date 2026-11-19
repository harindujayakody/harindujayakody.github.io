---
title: "HTTP Status Codes Explained: A Free Reference for All 63"
description: "My free HTTP status codes reference: every code from 100 to 511 with its meaning, common causes, how to fix errors, and example requests."
date: 2026-11-19
category: "Web"
tags: ["http", "status codes", "web development", "free tools", "debugging"]
repo: "harindujayakody/http-status-codes"
---

I keep looking up the same handful of HTTP status codes: is 422 or 400 the right answer for bad form data, and what does a 502 actually tell me about my server? So I turned my old [http-status-codes](https://github.com/harindujayakody/http-status-codes) project into a proper reference on this site: [/free-tools/http-status-codes/](/free-tools/http-status-codes/).

It covers all 63 codes, and every code has its own page.

## What's on each code page

Each page, such as [404 Not Found](/free-tools/http-status-codes/404/) or [502 Bad Gateway](/free-tools/http-status-codes/502/), explains what the code means and how it differs from the codes it gets confused with. For errors (4xx and 5xx) there's a list of common causes and the steps to fix them, written for both the person seeing the error and the person running the server.

Below that you'll find the headers that matter for that code (a 429 should come with Retry-After, a 405 must list the allowed methods in Allow), an example of the raw response, and short snippets that check for the code in cURL, JavaScript, Python and Go. Every page links to the RFC section that defines the code, so you can read the source when it matters.

## How to find a code quickly

The main page lists every code in plain HTML, grouped from 1xx to 5xx. Type in the filter box to narrow it down by number or by a word like "timeout" or "redirect". When only one code is left, press Enter to open it. The row of chips at the top links straight to the codes people search for most, such as 200, 301, 404, 500 and 502.

You can also press `Ctrl` + `K` anywhere on this site and type a code number.

## The codes people mix up most

A few pairs come up again and again.

401 Unauthorized means the server doesn't know who you are yet, so logging in can fix it. [403 Forbidden](/free-tools/http-status-codes/403/) means it knows (or doesn't care) and still says no.

404 Not Found makes no promise about the future. [410 Gone](/free-tools/http-status-codes/410/) says the page was removed on purpose, which helps search engines drop it sooner.

Both 502 and [504](/free-tools/http-status-codes/504/) come from a proxy such as nginx or Cloudflare. A 502 means the server behind it sent a broken answer or none at all; a 504 means it answered too slowly.

For a page that moved for good, use 301 or [308](/free-tools/http-status-codes/308/). The difference is that 308 keeps the request method, so a POST stays a POST.

## How it's built

The pages are static HTML generated when the site builds, from one data file with an entry per code. There's no tracking and nothing to install, and the filter is the only part that needs JavaScript. Without it, the full list still works.

The descriptions follow RFC 9110, the current HTTP specification, plus the RFCs that define the extra codes (WebDAV codes like 207 and 423, 429 Too Many Requests, 451 Unavailable For Legal Reasons). I also mention old names where they changed, because people still search for "413 Payload Too Large" and "422 Unprocessable Entity".

If you spot a mistake or a code that needs a better explanation, open an issue on the [GitHub repo](https://github.com/harindujayakody/http-status-codes).
