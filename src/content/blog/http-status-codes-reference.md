---
title: "HTTP Status Codes: All 63 Codes Explained, From 100 to 511"
description: "A detailed guide to every HTTP status code from 100 Continue to 511: what each one means, the usual causes of 4xx and 5xx errors, and where to fix them."
date: 2026-11-19
updated: 2026-11-19
category: "Web"
tags: ["http", "status codes", "web development", "free tools", "debugging"]
repo: "harindujayakody/http-status-codes"
---

Every response a server sends starts with a three-digit status code. Most of the time you never see it, because the page simply loads. When something breaks, the code is usually the first clue: a 404 points at the URL, a 401 at your login, and a 502 at the server behind the proxy.

This post covers all 63 codes in use today, grouped from 1xx to 5xx. Each one has a short explanation here and its own page in my [HTTP status codes reference](/free-tools/http-status-codes/), with the full list of causes, fixes, related headers, an example response and code snippets.

## How status codes work

When your browser asks for a page, the server's reply begins with a status line such as `HTTP/1.1 404 Not Found`. The number is what matters. The text after it, the reason phrase, is only a label for people, and HTTP/2 and HTTP/3 drop it completely.

The first digit tells you the class of the response:

| Class | Meaning | Codes |
|---|---|---|
| [1xx informational](#1xx-informational) | The request was received and is still being processed | 4 |
| [2xx success](#2xx-success) | The request was received, understood and accepted | 10 |
| [3xx redirection](#3xx-redirection) | The client has to take another step, usually following a new URL | 9 |
| [4xx client error](#4xx-client-error) | Something is wrong with the request itself | 29 |
| [5xx server error](#5xx-server-error) | The request looked fine, but the server failed to handle it | 11 |

The class is enough to react sensibly even to a code you have never seen. The HTTP specification says a client that receives an unknown code should treat it like the x00 code of its class, so an unfamiliar 4xx is handled like a 400.

## How to see the status code

In Chrome, Edge or Firefox, open the developer tools (F12), switch to the Network tab and reload the page. The Status column shows the code for every request, including images, scripts and API calls that fail silently.

From a terminal, `curl` prints just the code:

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://example.com/
```

Add `-I` instead to see the status line and all the response headers, which is the quickest way to follow a chain of redirects.

## 1xx informational

Interim responses. The server has the request and is still working on it, so a final response follows. You rarely see these in a browser.

### 100 Continue

The server got the request headers and has not rejected them, so the client should go ahead and send the request body. Clients ask for it by sending Expect: 100-continue before uploading a large body. If the server would refuse the request anyway (for example with 401 or 413), it can say so before any data is wasted.

Headers and examples: [100 Continue](/free-tools/http-status-codes/100/)

### 101 Switching Protocols

The server agrees to switch to the different protocol the client asked for in its Upgrade header, such as WebSocket. The WebSocket handshake is the most common example: a GET with Upgrade: websocket gets 101 back. HTTP/2 and HTTP/3 do not use 101; WebSockets over HTTP/2 use the extended CONNECT method instead.

Headers and examples: [101 Switching Protocols](/free-tools/http-status-codes/101/)

### 102 Processing

A WebDAV interim response saying the server accepted the request and is still working on it, so the client should not time out. 102 was defined in RFC 2518 for WebDAV. It let a server tell the client that a long request, such as a COPY or MOVE of a large folder tree, was still in progress.

Deprecated: you may still meet it, but new servers shouldn't send it.

Headers and examples: [102 Processing](/free-tools/http-status-codes/102/)

### 103 Early Hints

An interim response that sends Link headers early so the browser can preload CSS, fonts or scripts while the server builds the page. The hints are only hints. The final response still has to send its own headers, and clients that do not understand 103 are expected to ignore it and wait for the real answer.

Headers and examples: [103 Early Hints](/free-tools/http-status-codes/103/)

## 2xx success

The request worked. Which 2xx code comes back tells the client what kind of result to expect.

### 200 OK

The request worked. The response body holds the result, such as the page, file or JSON data the client asked for. 200 is the standard success code. What the body contains depends on the method: for GET it is the resource, for POST it is usually the result of the action, and for HEAD there is no body, only the headers a GET would return.

Headers and examples: [200 OK](/free-tools/http-status-codes/200/)

### 201 Created

The request worked and created a new resource. The Location header usually points to the URL of the new item. Servers send 201 after a request creates something, most often a POST to a collection (POST /users) or a PUT to a URL that did not exist yet.

Headers and examples: [201 Created](/free-tools/http-status-codes/201/)

### 202 Accepted

The server accepted the request for processing, but the work has not finished yet and may still fail later. 202 is for asynchronous work such as video encoding, report generation or bulk imports. The server queues the job and replies right away.

Headers and examples: [202 Accepted](/free-tools/http-status-codes/202/)

### 203 Non-Authoritative Information

The request worked, but a proxy between you and the origin server changed the response before passing it on. A transforming proxy sends 203 when it has modified a 200 response from the origin, for example by recompressing images or rewriting content.

Headers and examples: [203 Non-Authoritative Information](/free-tools/http-status-codes/203/)

### 204 No Content

The request worked and there is nothing to send back. The response has no body, and the browser stays on the current page. APIs often return 204 after a DELETE, or after a PUT or PATCH when the client does not need the updated resource back.

Headers and examples: [204 No Content](/free-tools/http-status-codes/204/)

### 205 Reset Content

The request worked and the client should reset the document view, such as clearing the form the user just submitted. Browsers do not reliably act on it, so most apps clear forms in JavaScript and send 204 or 200 instead.

Headers and examples: [205 Reset Content](/free-tools/http-status-codes/205/)

### 206 Partial Content

The server is sending only part of the file: the byte range the client asked for in its Range header. This is how video players seek and how download managers resume broken downloads. If the client asks for several ranges, the server can send them in a multipart/byteranges body.

Headers and examples: [206 Partial Content](/free-tools/http-status-codes/206/)

### 207 Multi-Status

A WebDAV response that carries a separate status code for each of several resources, wrapped in an XML body. A 207 can mix successes and failures, so clients have to read the body to know what happened.

Headers and examples: [207 Multi-Status](/free-tools/http-status-codes/207/)

### 208 Already Reported

Used inside a WebDAV 207 response to say a collection's members were already listed earlier, so they are not repeated. Defined by RFC 5842 (WebDAV bindings). When the same resource is reachable through several bindings, 208 stops the server listing its members again and avoids infinite loops on requests with Depth: infinity.

Headers and examples: [208 Already Reported](/free-tools/http-status-codes/208/)

### 226 IM Used

The server answered a GET with a delta: the result of instance manipulations applied to the current version of the resource. Defined by RFC 3229 (delta encoding in HTTP). A client that already has an older version sends A-IM and If-None-Match headers, and the server can reply with only the differences instead of the whole resource.

Headers and examples: [226 IM Used](/free-tools/http-status-codes/226/)

## 3xx redirection

The client has to do something else to finish the request, usually follow the URL in the Location header. Browsers do this automatically.

### 300 Multiple Choices

The resource has more than one representation, such as different languages or formats, and the client needs to pick one. 300 is meant for agent-driven content negotiation. The server lists the options and may suggest a preferred one in the Location header.

Headers and examples: [300 Multiple Choices](/free-tools/http-status-codes/300/)

### 301 Moved Permanently

The page has moved to a new URL for good. Browsers and search engines follow the Location header and update their links. Send 301 when a URL changes permanently: a new domain, HTTP to HTTPS, a renamed slug. Search engines move the old URL's ranking signals to the new one, and browsers cache 301s, sometimes for a long time.

Headers and examples: [301 Moved Permanently](/free-tools/http-status-codes/301/)

### 302 Found

The resource is temporarily at a different URL. Clients follow the Location header but keep using the original URL in future. 302 is the standard temporary redirect, used for things like sending a logged-out user to a login page. Search engines keep the original URL indexed. In HTTP/1.0 it was called Moved Temporarily.

Headers and examples: [302 Found](/free-tools/http-status-codes/302/)

### 303 See Other

The server redirects the client to another URL that it must fetch with GET, typically after a form submission or other POST. 303 is the clean way to do the Post/Redirect/Get pattern. After a form submit, the server replies 303 with a Location pointing to a result page, and the browser loads it with GET. Refreshing that page then does not resubmit the form.

Headers and examples: [303 See Other](/free-tools/http-status-codes/303/)

### 304 Not Modified

The cached copy is still valid, so the server sends no body and the client loads the resource from its own cache. A 304 is normal HTTP caching, and seeing many of them in your network tab is a good sign. The response should repeat headers such as ETag, Cache-Control and Expires so the cache can refresh them.

Headers and examples: [304 Not Modified](/free-tools/http-status-codes/304/)

### 305 Use Proxy

A deprecated redirect that told the client to repeat the request through the proxy named in the Location header. 305 asked the client to reach the resource through a specific proxy. It was deprecated because letting a server choose a client's proxy is a security risk.

Deprecated: you may still meet it, but new servers shouldn't send it.

Headers and examples: [305 Use Proxy](/free-tools/http-status-codes/305/)

### 306 (Unused)

A reserved status code. It appeared in an early HTTP/1.1 draft as Switch Proxy and no longer has any meaning. 306 was used in an earlier draft of HTTP/1.1 and dropped before the final spec. RFC 9110 keeps the number reserved so it is never reused.

Reserved and not used.

Headers and examples: [306 (Unused)](/free-tools/http-status-codes/306/)

### 307 Temporary Redirect

The resource is temporarily at another URL, and the client must repeat the exact same request there, keeping the method and body. 307 is like 302 with one firm rule: the method and body do not change. A POST stays a POST, which makes it safe for redirecting API calls and form submissions.

Headers and examples: [307 Temporary Redirect](/free-tools/http-status-codes/307/)

### 308 Permanent Redirect

The resource has moved permanently to a new URL, and clients must keep the same method and body when following the redirect. 308 is the permanent version of 307 and the method-safe version of 301. Clients follow the Location header and update links and caches, and a POST stays a POST.

Headers and examples: [308 Permanent Redirect](/free-tools/http-status-codes/308/)

## 4xx client error

Something about the request is wrong: the URL, the login, the data or the method. Sending it again unchanged usually gives the same error.

### 400 Bad Request

The server could not understand the request because something in it is malformed, like broken JSON, bad syntax or invalid headers. 400 is the general client error. The server is saying the request itself is wrong, so sending it again unchanged will not help.

Common causes:

- Malformed JSON, or a body that does not match its Content-Type header.
- Corrupt or oversized cookies sent by the browser.

Fixes and examples: [400 Bad Request](/free-tools/http-status-codes/400/)

### 401 Unauthorized

The request needs authentication. You are not logged in, or the credentials or token you sent are missing, invalid or expired. Despite the name, 401 is about authentication: who you are. The server must send a WWW-Authenticate header saying how to authenticate, such as Basic or Bearer.

Common causes:

- No Authorization header or session cookie was sent.
- An expired or revoked access token, or a token issued for a different environment.

Fixes and examples: [401 Unauthorized](/free-tools/http-status-codes/401/)

### 402 Payment Required

Reserved for future use in the HTTP spec. Some APIs use it to say that payment, credit or a paid plan is needed. 402 has been reserved since early HTTP with digital payments in mind, but no standard ever defined how it should work. RFC 9110 still lists it as reserved for future use.

Common causes:

- An unpaid invoice, expired subscription or used-up credit on an API account.
- A plan that does not include the feature or endpoint you called.

Fixes and examples: [402 Payment Required](/free-tools/http-status-codes/402/)

### 403 Forbidden

The server understood the request but refuses to allow it. Logging in again will not help unless your account gets access. A 403 can come from the app, the web server, or a security layer such as a WAF or CDN in front of it. Servers may return 404 instead when they want to hide that a resource exists.

Common causes:

- File or folder permissions the web server cannot read, or a directory with no index file and listing turned off.
- A web application firewall, CDN rule or bot filter blocking your IP, country or user agent.

Fixes and examples: [403 Forbidden](/free-tools/http-status-codes/403/)

### 404 Not Found

The server cannot find anything at this URL. The page may have moved or been deleted, or the link may have a typo. 404 is the most familiar error on the web. The server is up and working, but nothing exists at the requested path, and the code does not say whether that is temporary or permanent.

Common causes:

- A typo in the URL or a broken link on another page.
- The page was deleted or moved without a redirect, often after a redesign or CMS change.

Fixes and examples: [404 Not Found](/free-tools/http-status-codes/404/)

### 405 Method Not Allowed

The URL exists but does not accept the HTTP method you used, like sending POST to an endpoint that only allows GET. The server must include an Allow header listing the methods the resource does support, for example Allow: GET, HEAD.

Common causes:

- Calling an API endpoint with the wrong method, such as POST instead of PUT.
- A form posting to a static file, which most web servers only serve with GET and HEAD.

Fixes and examples: [405 Method Not Allowed](/free-tools/http-status-codes/405/)

### 406 Not Acceptable

The server cannot produce a response in any format the client said it accepts in its Accept headers. Clients send Accept, Accept-Language or Accept-Encoding to say what they can handle. If nothing on the server matches, it can return 406, although many servers send a default format instead.

Common causes:

- An Accept header that is too strict, such as Accept: application/xml for an API that only returns JSON.
- A server security filter (some ModSecurity setups, for example) configured to block requests with 406.

Fixes and examples: [406 Not Acceptable](/free-tools/http-status-codes/406/)

### 407 Proxy Authentication Required

A proxy between you and the website needs you to authenticate before it will forward your request. 407 is like 401, but for a proxy. The proxy sends a Proxy-Authenticate header with the scheme it wants, and the client answers with Proxy-Authorization.

Common causes:

- A company proxy that requires a username and password.
- Missing or wrong credentials in HTTP_PROXY or HTTPS_PROXY variables or in a tool's proxy settings.

Fixes and examples: [407 Proxy Authentication Required](/free-tools/http-status-codes/407/)

### 408 Request Timeout

The server closed the connection because the client took too long to send the full request. Servers also send 408 when closing idle keep-alive connections, and the client can repeat the request. If a proxy gave up waiting for its backend, that is 504 Gateway Timeout instead.

Common causes:

- A slow or unstable network connection, especially during large uploads.
- A client that opens a connection and then sends nothing for a while.

Fixes and examples: [408 Request Timeout](/free-tools/http-status-codes/408/)

### 409 Conflict

The request conflicts with the current state of the resource, such as saving a version that someone else already changed. 409 says the request is reasonable but cannot be applied right now because of the resource's state. The client should be able to resolve the conflict and send it again.

Common causes:

- Two users or processes editing the same record, where the second save is based on stale data.
- Creating something that already exists, such as a duplicate email or ID.

Fixes and examples: [409 Conflict](/free-tools/http-status-codes/409/)

### 410 Gone

The resource used to exist here but was deliberately removed and will not come back. There is no forwarding address. 410 is a stronger 404. It says the removal is permanent and intended, so clients and search engines should drop the URL and links to it should be removed.

Common causes:

- A product, post or account was deleted on purpose.
- An old API version or endpoint was retired.

Fixes and examples: [410 Gone](/free-tools/http-status-codes/410/)

### 411 Length Required

The server refuses the request because it has a body but no Content-Length header saying how big that body is. Some servers need to know the body size up front and reject requests that omit it or use chunked transfer encoding.

Common causes:

- A POST or PUT sent with chunked encoding to a server that does not accept it.
- A hand-built request or client library that leaves out the header, often on an empty POST.

Fixes and examples: [411 Length Required](/free-tools/http-status-codes/411/)

### 412 Precondition Failed

A condition in the request headers, such as If-Match or If-Unmodified-Since, was false, so the server did not apply the request. Clients use conditional headers to avoid overwriting other people's changes. A PUT with If-Match: "abc" means update only if the current ETag is still "abc". If someone else changed it, the server answers 412.

Common causes:

- The resource changed since you fetched it, so your ETag no longer matches.
- A client sending a stale or malformed If-Match or If-Unmodified-Since value.

Fixes and examples: [412 Precondition Failed](/free-tools/http-status-codes/412/)

### 413 Content Too Large

The request body is bigger than the server is willing to accept, usually because an upload is over the size limit. Older specs called this 413 Payload Too Large, and before that Request Entity Too Large. RFC 9110 renamed it Content Too Large.

Common causes:

- Uploading a file larger than the site allows.
- nginx's client_max_body_size, which defaults to 1 MB.

Fixes and examples: [413 Content Too Large](/free-tools/http-status-codes/413/)

### 414 URI Too Long

The URL is longer than the server is willing to process, often because too much data was packed into the query string. Older specs called this Request-URI Too Long. Servers set a maximum URL length, and anything over it gets 414.

Common causes:

- Large data in query parameters, such as long lists of IDs or encoded JSON.
- A form using GET for a large amount of input.

Fixes and examples: [414 URI Too Long](/free-tools/http-status-codes/414/)

### 415 Unsupported Media Type

The server refuses the request body because its format, given by Content-Type or Content-Encoding, is not supported. The server checked the Content-Type or Content-Encoding of what you sent and does not handle it, for example XML sent to a JSON-only API.

Common causes:

- A missing Content-Type header, so the server cannot tell the body is JSON.
- Form data (application/x-www-form-urlencoded) sent to an endpoint expecting application/json, or the reverse.

Fixes and examples: [415 Unsupported Media Type](/free-tools/http-status-codes/415/)

### 416 Range Not Satisfiable

The byte range asked for in the Range header is outside the file, so the server cannot send that part. Older specs called this Requested Range Not Satisfiable. It happens when a client asks for bytes past the end of the resource, such as bytes=5000- on a 4000-byte file.

Common causes:

- Resuming a download after the file on the server changed or got smaller.
- A client bug that calculates the wrong offsets.

Fixes and examples: [416 Range Not Satisfiable](/free-tools/http-status-codes/416/)

### 417 Expectation Failed

The server cannot meet the requirement in the request's Expect header, which is almost always Expect: 100-continue. The only expectation defined in HTTP is 100-continue. A server or proxy that does not support it can reply 417.

Common causes:

- A server or proxy that does not handle Expect: 100-continue.
- A client library adding Expect: 100-continue to large POST requests by default.

Fixes and examples: [417 Expectation Failed](/free-tools/http-status-codes/417/)

### 418 I'm a teapot

An April Fools' joke code from the Hyper Text Coffee Pot Control Protocol: a teapot refusing to brew coffee. It was never a real HTTP status, but many frameworks and sites added it as an Easter egg. Because it is so widely used, RFC 9110 reserves 418 so it will not be given a real meaning later.



Common causes:

- A developer returning it as a joke or Easter egg.
- A server or bot filter using it as an unusual way to refuse requests.

Fixes and examples: [418 I'm a teapot](/free-tools/http-status-codes/418/)

### 421 Misdirected Request

The request reached a server that cannot answer for this hostname and scheme, often because an HTTP/2 connection was reused. With HTTP/2 and HTTP/3, a browser can reuse one connection for several hostnames that share an IP address and TLS certificate. If the server on that connection is not configured for the requested host, it answers 421.

Common causes:

- A wildcard or multi-domain certificate shared by sites that run on different servers or with different TLS settings.
- A reverse proxy or CDN receiving traffic for a hostname it does not serve.

Fixes and examples: [421 Misdirected Request](/free-tools/http-status-codes/421/)

### 422 Unprocessable Content

The server understood the request and its format, but the data inside failed validation, like a missing field or bad email. It started in WebDAV (RFC 4918) as 422 Unprocessable Entity and was brought into the main HTTP spec by RFC 9110 under the name Unprocessable Content.

Common causes:

- A required field is missing or empty.
- A value has the wrong type or format, such as text where a number is expected, or an invalid email.

Fixes and examples: [422 Unprocessable Content](/free-tools/http-status-codes/422/)

### 423 Locked

A WebDAV response saying the file or resource is locked, so the server will not change it until the lock is released.

Common causes:

- Another user or app has the file open for editing.
- A stale lock left behind after a client crashed.

Fixes and examples: [423 Locked](/free-tools/http-status-codes/423/)

### 424 Failed Dependency

A WebDAV response saying the request failed because another action it depended on failed first. Mostly seen inside 207 Multi-Status responses. If a PROPPATCH sets several properties and one fails, the rest return 424, because the operation is all or nothing.

Common causes:

- One part of a multi-step WebDAV operation failed, so the other parts were not applied.
- A locked or forbidden resource earlier in the same request.

Fixes and examples: [424 Failed Dependency](/free-tools/http-status-codes/424/)

### 425 Too Early

The server will not process a request sent in TLS early data, because an attacker could replay it. Proxies add Early-Data: 1 when they forward a request that arrived in early data. The client should retry after the TLS handshake completes.

Common causes:

- A non-idempotent request, such as a POST, sent in 0-RTT data.
- A CDN or proxy forwarding an early-data request to an origin that refuses them.

Fixes and examples: [425 Too Early](/free-tools/http-status-codes/425/)

### 426 Upgrade Required

The server refuses to handle the request over the current protocol, and its Upgrade header names the protocol to switch to. A common case is a WebSocket endpoint receiving a plain HTTP request without the upgrade handshake.

Common causes:

- A WebSocket endpoint opened as a normal web page or called with a plain HTTP client.
- A reverse proxy dropping the Upgrade and Connection headers before they reach the app.

Fixes and examples: [426 Upgrade Required](/free-tools/http-status-codes/426/)

### 428 Precondition Required

The server requires a conditional request, such as one with If-Match, to stop clients from overwriting each other's changes. Defined in RFC 6585. An API returns 428 when a client tries to change a resource without proving it has the latest version. The client should fetch the resource, read its ETag and send it back in If-Match.

Common causes:

- A PUT, PATCH or DELETE sent without If-Match or If-Unmodified-Since.
- A client library or proxy that drops conditional headers.

Fixes and examples: [428 Precondition Required](/free-tools/http-status-codes/428/)

### 429 Too Many Requests

You sent too many requests in a short time and hit a rate limit. Wait, then retry, ideally after the Retry-After time. Defined in RFC 6585 for rate limiting. The server may send Retry-After, either a number of seconds or a date, to say when you can try again.

Common causes:

- A script, loop or retry storm sending requests faster than the API allows.
- Many users behind one IP address, such as an office or mobile network, sharing one limit.

Fixes and examples: [429 Too Many Requests](/free-tools/http-status-codes/429/)

### 431 Request Header Fields Too Large

The server refuses the request because its headers are too big, usually because of too many or oversized cookies. Defined in RFC 6585. The limit can apply to all headers together or to a single header. Cookies are the usual culprit, since every cookie for a domain goes out with every request.

Common causes:

- Cookies piling up on a domain, often from analytics, A/B tests or many subdomains sharing cookies.
- A very large Authorization header, such as a JWT carrying too many claims.

Fixes and examples: [431 Request Header Fields Too Large](/free-tools/http-status-codes/431/)

### 451 Unavailable For Legal Reasons

The server cannot show this resource because of a legal demand, such as a court order, government block or copyright claim. Defined in RFC 7725. The number is a nod to Ray Bradbury's novel Fahrenheit 451.

Common causes:

- A court order or government requirement in your country.
- A copyright or DMCA takedown notice.

Fixes and examples: [451 Unavailable For Legal Reasons](/free-tools/http-status-codes/451/)

## 5xx server error

The request was fine, but the server or something behind it failed. These are the server owner's problem, though retrying later often works.

### 500 Internal Server Error

Something went wrong on the server and it could not complete the request. It is a generic error and not your fault. The problem is on the server side, so changing your request rarely helps. The real cause is almost always in the server's error logs.

Common causes:

- An unhandled exception or bug in the application code.
- A failed database connection or query.

Fixes and examples: [500 Internal Server Error](/free-tools/http-status-codes/500/)

### 501 Not Implemented

The server does not support the functionality needed for the request, typically an HTTP method it does not recognise. 501 means the server does not know how to handle the method for any resource. With 405, the server knows the method but this URL does not allow it.

Common causes:

- An uncommon or custom method, such as PROPFIND sent to a server without WebDAV.
- An API endpoint that is stubbed out but not implemented.

Fixes and examples: [501 Not Implemented](/free-tools/http-status-codes/501/)

### 502 Bad Gateway

A server acting as a gateway or proxy got an invalid response, or no usable response, from the upstream server behind it. Most sites have a reverse proxy, load balancer or CDN (nginx, Cloudflare, a cloud load balancer) in front of the app server. A 502 means that front layer contacted the app and got back garbage, a reset connection or nothing at all.

Common causes:

- The app server (Node.js, PHP-FPM, Gunicorn) has crashed, is restarting or is not running.
- The proxy points at the wrong host, port or socket, or a firewall blocks the connection.

Fixes and examples: [502 Bad Gateway](/free-tools/http-status-codes/502/)

### 503 Service Unavailable

The server cannot handle the request right now, usually because it is overloaded or down for maintenance. Try again later. 503 is for temporary conditions. The server can send Retry-After with a number of seconds or a date to say when it expects to be back.

Common causes:

- Planned maintenance or a deploy in progress.
- More traffic than the available servers or workers can handle.

Fixes and examples: [503 Service Unavailable](/free-tools/http-status-codes/503/)

### 504 Gateway Timeout

A gateway or proxy waited too long for a response from the upstream server and gave up before the page was ready. The proxy (nginx, a load balancer, a CDN) reached the upstream but did not get a full response within its timeout. The upstream may still be working on the request.

Common causes:

- A slow database query, report or third-party API call holding up the request.
- A proxy timeout shorter than the app needs, such as nginx's proxy_read_timeout (60 seconds by default) or a CDN's own limit.

Fixes and examples: [504 Gateway Timeout](/free-tools/http-status-codes/504/)

### 505 HTTP Version Not Supported

The server does not support, or refuses to use, the major HTTP version the client used for the request. The server should explain in the body which versions it supports. Clients and servers usually agree on HTTP/2 or HTTP/3 during the TLS handshake, so 505 is rare.

Common causes:

- A malformed request line, such as a typo in HTTP/1.1 from a hand-written client.
- A proxy forwarding requests in an HTTP version the backend does not support.

Fixes and examples: [505 HTTP Version Not Supported](/free-tools/http-status-codes/505/)

### 506 Variant Also Negotiates

A server configuration error in content negotiation: the chosen variant is itself set up to negotiate, creating a loop. Defined in RFC 2295 (Transparent Content Negotiation). The server's negotiation setup points to a variant that negotiates again, so it cannot pick a final representation.

Common causes:

- A type map or negotiation rule (for example in Apache's mod_negotiation) where a variant points back to a negotiable resource.
- Transparent content negotiation turned on for resources that should not use it.

Fixes and examples: [506 Variant Also Negotiates](/free-tools/http-status-codes/506/)

### 507 Insufficient Storage

The server cannot store what it needs to complete the request, typically because its disk or the user's quota is full. Defined by WebDAV in RFC 4918, and also used by some file and storage services. The condition is meant to be temporary.

Common causes:

- The server's disk is full.
- The user's storage quota is used up.

Fixes and examples: [507 Insufficient Storage](/free-tools/http-status-codes/507/)

### 508 Loop Detected

The server stopped a WebDAV request because it found an infinite loop, usually from bindings processed with Depth: infinity. Some shared hosts also show 508 Resource Limit Is Reached when an account uses too much CPU or memory. That is a hosting panel convention, not the RFC meaning.

Common causes:

- Bindings that create a cycle inside a WebDAV collection.
- On shared hosting, an account going over its CPU, memory or process limits.

Fixes and examples: [508 Loop Detected](/free-tools/http-status-codes/508/)

### 510 Not Extended

The request is missing an HTTP extension declaration that the server requires before it will process the request. Defined in RFC 2774 (An HTTP Extension Framework). The framework was never widely adopted and the RFC is now marked Historic, so 510 is effectively obsolete.

Deprecated: you may still meet it, but new servers shouldn't send it.

Common causes:

- A server built for the RFC 2774 extension framework receiving a request without the extension it needs.
- A custom server using 510 for its own purposes.

Fixes and examples: [510 Not Extended](/free-tools/http-status-codes/510/)

### 511 Network Authentication Required

You need to log in to the network before you can get online, typically on hotel, airport or cafe Wi-Fi with a captive portal. Defined in RFC 6585 for captive portals. The network intercepts your request and replies with 511 and a page linking to its login or terms screen.

Common causes:

- Public Wi-Fi that requires you to sign in or accept terms.
- A network session that expired and needs a fresh login.

Fixes and examples: [511 Network Authentication Required](/free-tools/http-status-codes/511/)

## Codes people mix up

A few pairs come up again and again, and picking the wrong one confuses both browsers and search engines.

401 Unauthorized means the server doesn't know who you are yet, so logging in can fix it. 403 Forbidden means it knows (or doesn't need to) and still says no, so logging in again won't help.

404 Not Found makes no promise about the future. 410 Gone says the page was removed on purpose and won't return, which helps search engines drop it sooner.

502 Bad Gateway and 504 Gateway Timeout both come from a proxy such as nginx or Cloudflare. A 502 means the server behind it sent a broken answer or none at all; a 504 means it answered too slowly.

For a page that moved for good, use 301 Moved Permanently or 308 Permanent Redirect. The difference is that 308 keeps the request method, so a POST stays a POST. The same goes for the temporary pair, 302 Found and 307 Temporary Redirect.

400 Bad Request and 422 Unprocessable Content both reject what the client sent. Use 400 when the request can't be parsed at all, such as broken JSON, and 422 when it parses fine but fails validation, such as an email field without an @.

## Which codes to use in your own API

Most APIs only need a small set. For success, send 200 OK for reads and updates that return data, 201 Created with a Location header when something new is made, and 204 No Content when there is nothing to send back.

For client errors, 400 and 422 cover bad input, 401 means log in, 403 means not allowed, and 404 means not found. Use 409 Conflict when the request clashes with the current state, such as editing an outdated version, and 429 Too Many Requests with Retry-After when someone hits a rate limit.

On the server side, 500 Internal Server Error covers unexpected failures, and 503 Service Unavailable with Retry-After tells clients the outage is temporary. Anything beyond that is worth adding only when a client would do something different because of it.

## Using the reference

The [reference page](/free-tools/http-status-codes/) lists every code in one place. Type a number or a word like "timeout" in the filter box, and press Enter when one code is left to open it. You can also press `Ctrl` + `K` anywhere on this site and type a code number.

The descriptions follow RFC 9110, the current HTTP specification, plus the RFCs that define the extra codes, and each code's page links to its exact section. Older names are mentioned where they changed, because people still search for "413 Payload Too Large" and "422 Unprocessable Entity".

If you spot a mistake or a code that needs a better explanation, open an issue on the [GitHub repo](https://github.com/harindujayakody/http-status-codes).
