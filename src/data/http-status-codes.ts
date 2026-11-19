// One entry per HTTP status code shown on /free-tools/http-status-codes/. Category comes from the first digit.
export type StatusCode = {
  code: number;
  name: string; // official reason phrase, e.g. "Not Found", "I'm a teapot"
  summary: string; // one plain sentence, 90 to 150 characters, says what the code means; used in lists and as the page description
  meaning: string[]; // 2 or 3 short paragraphs (each 1 to 3 sentences): what it means, when servers send it, how it differs from close codes
  causes?: string[]; // 2 to 4 common causes (required for 4xx and 5xx; include for 3xx where useful)
  fixes?: string[]; // 2 to 4 concrete steps: what a visitor can try, and what the site owner / developer should check (required for 4xx and 5xx)
  headers?: string[]; // relevant response headers, e.g. ["Location"], ["Retry-After"], ["WWW-Authenticate"]; omit if none matter
  spec: { label: string; url: string };
  related: number[]; // 2 to 4 codes that exist in this file
  status?: "deprecated" | "unused" | "joke"; // omit for normal codes
};

const rfc = (num: number, section?: string) =>
  section
    ? { label: `RFC ${num}, section ${section}`, url: `https://www.rfc-editor.org/rfc/rfc${num}#section-${section}` }
    : { label: `RFC ${num}`, url: `https://www.rfc-editor.org/rfc/rfc${num}.html` };

export const statusCodes: StatusCode[] = [
  // 1xx informational
  {
    code: 100,
    name: "Continue",
    summary: "The server got the request headers and has not rejected them, so the client should go ahead and send the request body.",
    meaning: [
      "100 Continue is an interim response. It tells the client that the server has read the request headers and is happy for the body to follow.",
      "Clients ask for it by sending Expect: 100-continue before uploading a large body. If the server would refuse the request anyway (for example with 401 or 413), it can say so before any data is wasted.",
      "Browsers rarely send Expect: 100-continue, so you mostly meet this code with curl and HTTP client libraries.",
    ],
    headers: ["Expect"],
    spec: rfc(9110, "15.2.1"),
    related: [417, 101, 103],
  },
  {
    code: 101,
    name: "Switching Protocols",
    summary: "The server agrees to switch to the different protocol the client asked for in its Upgrade header, such as WebSocket.",
    meaning: [
      "A client sends Upgrade and Connection: Upgrade headers to ask for a new protocol on the same connection. If the server agrees, it replies 101 with an Upgrade header naming the protocol, and from then on both sides speak that protocol.",
      "The WebSocket handshake is the most common example: a GET with Upgrade: websocket gets 101 back. HTTP/2 and HTTP/3 do not use 101; WebSockets over HTTP/2 use the extended CONNECT method instead.",
    ],
    headers: ["Upgrade", "Connection"],
    spec: rfc(9110, "15.2.2"),
    related: [426, 100, 200],
  },
  {
    code: 102,
    name: "Processing",
    summary: "A WebDAV interim response saying the server accepted the request and is still working on it, so the client should not time out.",
    meaning: [
      "102 was defined in RFC 2518 for WebDAV. It let a server tell the client that a long request, such as a COPY or MOVE of a large folder tree, was still in progress.",
      "RFC 4918, which replaced RFC 2518, dropped 102 because few clients supported it. The number is still registered, but you should not rely on it. For long jobs, return 202 Accepted with a status URL instead.",
    ],
    spec: rfc(2518, "10.1"),
    related: [202, 103, 100],
    status: "deprecated",
  },
  {
    code: 103,
    name: "Early Hints",
    summary: "An interim response that sends Link headers early so the browser can preload CSS, fonts or scripts while the server builds the page.",
    meaning: [
      "Defined in RFC 8297. While the server is still working on the final response (querying a database, rendering HTML), it can send 103 with headers like Link: </style.css>; rel=preload so the browser starts fetching those files sooner.",
      "The hints are only hints. The final response still has to send its own headers, and clients that do not understand 103 are expected to ignore it and wait for the real answer.",
    ],
    headers: ["Link"],
    spec: rfc(8297),
    related: [200, 100, 304],
  },

  // 2xx success
  {
    code: 200,
    name: "OK",
    summary: "The request worked. The response body holds the result, such as the page, file or JSON data the client asked for.",
    meaning: [
      "200 is the standard success code. What the body contains depends on the method: for GET it is the resource, for POST it is usually the result of the action, and for HEAD there is no body, only the headers a GET would return.",
      "If a successful response has nothing to send back, 204 No Content is clearer. If the request created something, 201 Created tells the client where the new item lives.",
      "A 200 only means the HTTP exchange succeeded. A page that says \"not found\" but returns 200 is a soft 404, and Google Search Console reports it as an error, so send real error codes for real errors.",
    ],
    spec: rfc(9110, "15.3.1"),
    related: [201, 204, 304],
  },
  {
    code: 201,
    name: "Created",
    summary: "The request worked and created a new resource. The Location header usually points to the URL of the new item.",
    meaning: [
      "Servers send 201 after a request creates something, most often a POST to a collection (POST /users) or a PUT to a URL that did not exist yet.",
      "The response should include a Location header with the new resource's URL. Many APIs also return the created object in the body, which saves the client a second request.",
      "If the work has only been queued and the resource does not exist yet, use 202 Accepted instead.",
    ],
    headers: ["Location", "ETag"],
    spec: rfc(9110, "15.3.2"),
    related: [200, 202, 303],
  },
  {
    code: 202,
    name: "Accepted",
    summary: "The server accepted the request for processing, but the work has not finished yet and may still fail later.",
    meaning: [
      "202 is for asynchronous work such as video encoding, report generation or bulk imports. The server queues the job and replies right away.",
      "HTTP has no way to send the real result later, so APIs usually return a link to a status endpoint (in the Location header or the body) that the client can poll.",
    ],
    headers: ["Location"],
    spec: rfc(9110, "15.3.3"),
    related: [201, 200, 303],
  },
  {
    code: 203,
    name: "Non-Authoritative Information",
    summary: "The request worked, but a proxy between you and the origin server changed the response before passing it on.",
    meaning: [
      "A transforming proxy sends 203 when it has modified a 200 response from the origin, for example by recompressing images or rewriting content.",
      "It warns the client that the content is not exactly what the origin sent. You will rarely see it in practice.",
    ],
    spec: rfc(9110, "15.3.4"),
    related: [200, 304],
  },
  {
    code: 204,
    name: "No Content",
    summary: "The request worked and there is nothing to send back. The response has no body, and the browser stays on the current page.",
    meaning: [
      "APIs often return 204 after a DELETE, or after a PUT or PATCH when the client does not need the updated resource back.",
      "A 204 response cannot contain a body. Calling response.json() on it in JavaScript throws an \"Unexpected end of JSON input\" error, so check the status before parsing.",
      "Compare with 200 (success with a body) and 205 (success, and reset the form that sent the request).",
    ],
    spec: rfc(9110, "15.3.5"),
    related: [200, 205, 201],
  },
  {
    code: 205,
    name: "Reset Content",
    summary: "The request worked and the client should reset the document view, such as clearing the form the user just submitted.",
    meaning: [
      "Like 204, a 205 has no body. It also asks the client to reset the view that sent the request, for example clearing form fields so the user can enter another record.",
      "Browsers do not reliably act on it, so most apps clear forms in JavaScript and send 204 or 200 instead.",
    ],
    spec: rfc(9110, "15.3.6"),
    related: [204, 200],
  },
  {
    code: 206,
    name: "Partial Content",
    summary: "The server is sending only part of the file: the byte range the client asked for in its Range header.",
    meaning: [
      "Clients send a Range header (for example Range: bytes=0-1023) to get part of a resource. The server replies 206 with a Content-Range header saying which bytes are in the body and the full size, like Content-Range: bytes 0-1023/146515.",
      "This is how video players seek and how download managers resume broken downloads. If the client asks for several ranges, the server can send them in a multipart/byteranges body.",
      "A range outside the file gets 416. A server that does not support ranges ignores the header and sends the whole file with 200. Servers advertise support with Accept-Ranges: bytes.",
    ],
    headers: ["Range", "Content-Range", "Accept-Ranges", "If-Range"],
    spec: rfc(9110, "15.3.7"),
    related: [416, 200, 304],
  },
  {
    code: 207,
    name: "Multi-Status",
    summary: "A WebDAV response that carries a separate status code for each of several resources, wrapped in an XML body.",
    meaning: [
      "WebDAV uses 207 when one request touches many resources, such as a PROPFIND on a folder. The body is an XML multistatus document with one response element per resource, each with its own status.",
      "A 207 can mix successes and failures, so clients have to read the body to know what happened.",
    ],
    spec: rfc(4918, "11.1"),
    related: [208, 424, 200],
  },
  {
    code: 208,
    name: "Already Reported",
    summary: "Used inside a WebDAV 207 response to say a collection's members were already listed earlier, so they are not repeated.",
    meaning: [
      "Defined by RFC 5842 (WebDAV bindings). When the same resource is reachable through several bindings, 208 stops the server listing its members again and avoids infinite loops on requests with Depth: infinity.",
      "It is meant to appear inside a 207 Multi-Status body, not as the main status of a response.",
    ],
    spec: rfc(5842, "7.1"),
    related: [207, 508],
  },
  {
    code: 226,
    name: "IM Used",
    summary: "The server answered a GET with a delta: the result of instance manipulations applied to the current version of the resource.",
    meaning: [
      "Defined by RFC 3229 (delta encoding in HTTP). A client that already has an older version sends A-IM and If-None-Match headers, and the server can reply with only the differences instead of the whole resource.",
      "Very few servers or clients implement delta encoding, so you are unlikely to see 226 outside specialised systems.",
    ],
    headers: ["A-IM", "IM", "Delta-Base"],
    spec: rfc(3229, "10.4.1"),
    related: [200, 304, 206],
  },

  // 3xx redirection
  {
    code: 300,
    name: "Multiple Choices",
    summary: "The resource has more than one representation, such as different languages or formats, and the client needs to pick one.",
    meaning: [
      "300 is meant for agent-driven content negotiation. The server lists the options and may suggest a preferred one in the Location header.",
      "There is no standard format for the list, so browsers do not choose automatically and the code is rarely used. Most sites pick a version themselves using Accept or Accept-Language, or redirect with 302.",
    ],
    headers: ["Location"],
    spec: rfc(9110, "15.4.1"),
    related: [301, 302, 406],
  },
  {
    code: 301,
    name: "Moved Permanently",
    summary: "The page has moved to a new URL for good. Browsers and search engines follow the Location header and update their links.",
    meaning: [
      "Send 301 when a URL changes permanently: a new domain, HTTP to HTTPS, a renamed slug. Search engines move the old URL's ranking signals to the new one, and browsers cache 301s, sometimes for a long time.",
      "For historical reasons, clients may change a POST into a GET when following a 301. If the method and body must be kept, use 308 Permanent Redirect. For a temporary move, use 302 or 307.",
    ],
    causes: [
      "A redirect loop, where URL A redirects to B and B redirects back to A, often caused by competing http/https or www/non-www rules.",
      "A chain of several redirects left over from more than one site migration.",
      "A cached 301 that the browser keeps following after the server rule was removed.",
    ],
    fixes: [
      "Run curl -I on the URL or open the browser's network tab to see every hop and its Location header.",
      "Point old URLs straight to the final URL in one hop, and keep https and www rules in one place (only at the CDN or only in nginx, for example).",
      "If a browser is stuck on a stale 301, clear its cache or test in a private window. Use 302 while you are still testing a new redirect.",
    ],
    headers: ["Location"],
    spec: rfc(9110, "15.4.2"),
    related: [308, 302, 307],
  },
  {
    code: 302,
    name: "Found",
    summary: "The resource is temporarily at a different URL. Clients follow the Location header but keep using the original URL in future.",
    meaning: [
      "302 is the standard temporary redirect, used for things like sending a logged-out user to a login page. Search engines keep the original URL indexed. In HTTP/1.0 it was called Moved Temporarily.",
      "Browsers historically changed POST to GET when following a 302, and the spec now allows that. The ambiguity is why 303 (always switch to GET) and 307 (never change the method) exist.",
    ],
    causes: [
      "Login or session checks that bounce between two URLs, giving ERR_TOO_MANY_REDIRECTS.",
      "A session cookie that never gets saved, so the app keeps redirecting to the login page.",
      "A temporary redirect left in place for a permanent move, so search engines keep the old URL.",
    ],
    fixes: [
      "As a visitor stuck in a loop, clear cookies for the site and try again.",
      "Check the session cookie's Domain, Path and Secure settings, especially behind a proxy that terminates HTTPS.",
      "If the move is permanent, switch to 301 or 308.",
    ],
    headers: ["Location"],
    spec: rfc(9110, "15.4.3"),
    related: [301, 303, 307],
  },
  {
    code: 303,
    name: "See Other",
    summary: "The server redirects the client to another URL that it must fetch with GET, typically after a form submission or other POST.",
    meaning: [
      "303 is the clean way to do the Post/Redirect/Get pattern. After a form submit, the server replies 303 with a Location pointing to a result page, and the browser loads it with GET. Refreshing that page then does not resubmit the form.",
      "Unlike 302, a 303 always means switch to GET (a HEAD request stays HEAD). Use 307 when the method has to stay the same.",
    ],
    headers: ["Location"],
    spec: rfc(9110, "15.4.4"),
    related: [302, 307, 201],
  },
  {
    code: 304,
    name: "Not Modified",
    summary: "The cached copy is still valid, so the server sends no body and the client loads the resource from its own cache.",
    meaning: [
      "A client with a cached copy sends a conditional GET: If-None-Match with the ETag it stored, or If-Modified-Since with the Last-Modified date. If nothing has changed, the server replies 304 with no body, which saves bandwidth.",
      "A 304 is normal HTTP caching, and seeing many of them in your network tab is a good sign. The response should repeat headers such as ETag, Cache-Control and Expires so the cache can refresh them.",
    ],
    causes: [
      "Visitors keep seeing an old file after a deploy because its ETag or Last-Modified value did not change.",
      "A CDN or proxy answering 304 from its own stale copy.",
    ],
    fixes: [
      "As a visitor, do a hard refresh (Ctrl+Shift+R, or Cmd+Shift+R on a Mac) to bypass the cache.",
      "Use fingerprinted file names for static assets (app.3f9a1c.js) so every deploy gets a new URL.",
      "Make sure ETag or Last-Modified changes when the content changes, and purge the CDN cache after deploying.",
    ],
    headers: ["ETag", "If-None-Match", "Last-Modified", "If-Modified-Since", "Cache-Control"],
    spec: rfc(9110, "15.4.5"),
    related: [200, 412, 206],
  },
  {
    code: 305,
    name: "Use Proxy",
    summary: "A deprecated redirect that told the client to repeat the request through the proxy named in the Location header.",
    meaning: [
      "305 asked the client to reach the resource through a specific proxy. It was deprecated because letting a server choose a client's proxy is a security risk.",
      "Modern browsers do not follow it, and servers should not send it.",
    ],
    spec: rfc(9110, "15.4.6"),
    related: [307, 407],
    status: "deprecated",
  },
  {
    code: 306,
    name: "(Unused)",
    summary: "A reserved status code. It appeared in an early HTTP/1.1 draft as Switch Proxy and no longer has any meaning.",
    meaning: [
      "306 was used in an earlier draft of HTTP/1.1 and dropped before the final spec. RFC 9110 keeps the number reserved so it is never reused.",
      "No server should send it, and clients have no defined way to handle it.",
    ],
    spec: rfc(9110, "15.4.7"),
    related: [305, 307],
    status: "unused",
  },
  {
    code: 307,
    name: "Temporary Redirect",
    summary: "The resource is temporarily at another URL, and the client must repeat the exact same request there, keeping the method and body.",
    meaning: [
      "307 is like 302 with one firm rule: the method and body do not change. A POST stays a POST, which makes it safe for redirecting API calls and form submissions.",
      "In Chrome's network tab you may see \"307 Internal Redirect\" when a site uses HSTS. The browser upgrades http:// to https:// itself without contacting the server.",
      "For a permanent move with the same method guarantee, use 308.",
    ],
    headers: ["Location"],
    spec: rfc(9110, "15.4.8"),
    related: [302, 308, 303],
  },
  {
    code: 308,
    name: "Permanent Redirect",
    summary: "The resource has moved permanently to a new URL, and clients must keep the same method and body when following the redirect.",
    meaning: [
      "308 is the permanent version of 307 and the method-safe version of 301. Clients follow the Location header and update links and caches, and a POST stays a POST.",
      "It was first defined in RFC 7538 and is now part of RFC 9110. Google treats 308 the same as 301 for indexing. Very old clients may not understand it, which is one reason many sites still use 301 for plain page moves.",
    ],
    headers: ["Location"],
    spec: rfc(9110, "15.4.9"),
    related: [301, 307, 302],
  },

  // 4xx client errors
  {
    code: 400,
    name: "Bad Request",
    summary: "The server could not understand the request because something in it is malformed, like broken JSON, bad syntax or invalid headers.",
    meaning: [
      "400 is the general client error. The server is saying the request itself is wrong, so sending it again unchanged will not help.",
      "It is broader than 422, which means the syntax was fine but the data failed validation, and 415, which is about the body's format. Plenty of APIs still use 400 for validation errors too.",
    ],
    causes: [
      "Malformed JSON, or a body that does not match its Content-Type header.",
      "Corrupt or oversized cookies sent by the browser.",
      "Invalid characters in the URL, or a query string the server cannot parse.",
      "Missing required parameters in an API call.",
    ],
    fixes: [
      "As a visitor, check the URL for typos, then clear cookies and cache for that site and try again.",
      "As a developer, read the response body: most APIs say which field or header is wrong.",
      "Validate JSON before sending it and set Content-Type: application/json to match.",
      "Check the logs of any proxy in front of the app too, since nginx and load balancers can return 400 for bad headers before your code runs.",
    ],
    spec: rfc(9110, "15.5.1"),
    related: [422, 415, 431, 413],
  },
  {
    code: 401,
    name: "Unauthorized",
    summary: "The request needs authentication. You are not logged in, or the credentials or token you sent are missing, invalid or expired.",
    meaning: [
      "Despite the name, 401 is about authentication: who you are. The server must send a WWW-Authenticate header saying how to authenticate, such as Basic or Bearer.",
      "Compare with 403. A 401 means log in and try again; a 403 means the server knows who you are and still says no. Proxies use the separate 407 code.",
    ],
    causes: [
      "No Authorization header or session cookie was sent.",
      "An expired or revoked access token, or a token issued for a different environment.",
      "A wrong username or password for HTTP Basic auth.",
      "Server clock skew making a signed token look expired or not yet valid.",
    ],
    fixes: [
      "Log in again, or sign out and back in to get a fresh session.",
      "Check the header format, for example Authorization: Bearer <token>, with no extra quotes or spaces.",
      "Refresh the access token when it expires, and confirm it was issued for this API.",
      "Read the WWW-Authenticate header and the response body for the exact reason, such as invalid_token.",
    ],
    headers: ["WWW-Authenticate"],
    spec: rfc(9110, "15.5.2"),
    related: [403, 407, 511],
  },
  {
    code: 402,
    name: "Payment Required",
    summary: "Reserved for future use in the HTTP spec. Some APIs use it to say that payment, credit or a paid plan is needed.",
    meaning: [
      "402 has been reserved since early HTTP with digital payments in mind, but no standard ever defined how it should work. RFC 9110 still lists it as reserved for future use.",
      "Some services send it on their own terms, for example when an account runs out of credit or a subscription lapses. The exact meaning depends on the service.",
    ],
    causes: [
      "An unpaid invoice, expired subscription or used-up credit on an API account.",
      "A plan that does not include the feature or endpoint you called.",
    ],
    fixes: [
      "Check the service's billing page and update the payment method or plan.",
      "Read the response body. Services that use 402 usually explain what is needed.",
      "If you run the API, consider 403 with a clear message, since 402 has no standard meaning.",
    ],
    spec: rfc(9110, "15.5.3"),
    related: [403, 401, 429],
  },
  {
    code: 403,
    name: "Forbidden",
    summary: "The server understood the request but refuses to allow it. Logging in again will not help unless your account gets access.",
    meaning: [
      "403 means the server knows what you want and will not do it. Unlike 401, sending the same credentials again will not change the answer, though a different account or role might.",
      "A 403 can come from the app, the web server, or a security layer such as a WAF or CDN in front of it. Servers may return 404 instead when they want to hide that a resource exists.",
    ],
    causes: [
      "File or folder permissions the web server cannot read, or a directory with no index file and listing turned off.",
      "A web application firewall, CDN rule or bot filter blocking your IP, country or user agent.",
      "Your account or API token lacks the role or scope for this action.",
      "Hotlink protection, or a missing CSRF token on a form submission.",
    ],
    fixes: [
      "As a visitor, check you are logged into the right account, try another network or turn off your VPN, and clear cookies.",
      "On the server, check file ownership and permissions (commonly 644 for files and 755 for folders) and that an index file exists.",
      "Review WAF, CDN and .htaccess rules, and look for the blocked request in their logs.",
      "For APIs, confirm the token's scopes and the user's permissions.",
    ],
    spec: rfc(9110, "15.5.4"),
    related: [401, 404, 451],
  },
  {
    code: 404,
    name: "Not Found",
    summary: "The server cannot find anything at this URL. The page may have moved or been deleted, or the link may have a typo.",
    meaning: [
      "404 is the most familiar error on the web. The server is up and working, but nothing exists at the requested path, and the code does not say whether that is temporary or permanent.",
      "If you know the page is gone for good, 410 Gone is more precise. Servers may also return 404 instead of 403 to hide a resource from people who should not see it.",
      "A page that says \"not found\" but returns 200 is a soft 404. Google Search Console flags these, so make sure your error page sends a real 404 status.",
    ],
    causes: [
      "A typo in the URL or a broken link on another page.",
      "The page was deleted or moved without a redirect, often after a redesign or CMS change.",
      "Case or trailing slash mismatches, such as /About instead of /about.",
      "Missing rewrite rules, such as a single-page app that needs every path served by index.html.",
    ],
    fixes: [
      "As a visitor, check the URL, try the site's search or home page, or look for an archived copy.",
      "Redirect moved pages to their new URL with a 301.",
      "Find broken links with Google Search Console or a site crawler and fix them at the source.",
      "Serve a helpful custom 404 page that still returns the 404 status code.",
    ],
    spec: rfc(9110, "15.5.5"),
    related: [410, 301, 403],
  },
  {
    code: 405,
    name: "Method Not Allowed",
    summary: "The URL exists but does not accept the HTTP method you used, like sending POST to an endpoint that only allows GET.",
    meaning: [
      "The server must include an Allow header listing the methods the resource does support, for example Allow: GET, HEAD.",
      "405 is about the method on a resource the server knows. If the server does not recognise the method at all, 501 Not Implemented fits better.",
    ],
    causes: [
      "Calling an API endpoint with the wrong method, such as POST instead of PUT.",
      "A form posting to a static file, which most web servers only serve with GET and HEAD.",
      "A route defined for GET only, with no handler for the method you sent.",
      "CORS preflight OPTIONS requests that the server does not handle.",
    ],
    fixes: [
      "Check the Allow header in the response and use one of the listed methods.",
      "Read the API documentation for the endpoint's method.",
      "Add a handler for the method in your router, or send the request to the correct path.",
      "If a proxy sits in front, check it is not rewriting the URL to a static file.",
    ],
    headers: ["Allow"],
    spec: rfc(9110, "15.5.6"),
    related: [501, 404, 400],
  },
  {
    code: 406,
    name: "Not Acceptable",
    summary: "The server cannot produce a response in any format the client said it accepts in its Accept headers.",
    meaning: [
      "Clients send Accept, Accept-Language or Accept-Encoding to say what they can handle. If nothing on the server matches, it can return 406, although many servers send a default format instead.",
      "406 is about the format you want back. 415 is the opposite: the server cannot read the format you sent.",
    ],
    causes: [
      "An Accept header that is too strict, such as Accept: application/xml for an API that only returns JSON.",
      "A server security filter (some ModSecurity setups, for example) configured to block requests with 406.",
    ],
    fixes: [
      "Loosen the Accept header, or send Accept: */*.",
      "Check which content types the API supports and ask for one of them.",
      "If you run the server, check security filter logs, and consider returning a default format instead.",
    ],
    headers: ["Accept", "Accept-Language", "Accept-Encoding"],
    spec: rfc(9110, "15.5.7"),
    related: [415, 300, 400],
  },
  {
    code: 407,
    name: "Proxy Authentication Required",
    summary: "A proxy between you and the website needs you to authenticate before it will forward your request.",
    meaning: [
      "407 is like 401, but for a proxy. The proxy sends a Proxy-Authenticate header with the scheme it wants, and the client answers with Proxy-Authorization.",
      "You usually see it on corporate networks, or when a tool such as npm, git or Docker is set to use a proxy that needs a login.",
    ],
    causes: [
      "A company proxy that requires a username and password.",
      "Missing or wrong credentials in HTTP_PROXY or HTTPS_PROXY variables or in a tool's proxy settings.",
    ],
    fixes: [
      "Sign in to the proxy, or ask your network admin for the right credentials.",
      "Put the credentials in the proxy URL (http://user:pass@proxy:port), URL-encoding any special characters.",
      "If you should not be using a proxy at all, remove it from system and tool settings.",
    ],
    headers: ["Proxy-Authenticate", "Proxy-Authorization"],
    spec: rfc(9110, "15.5.8"),
    related: [401, 403, 511],
  },
  {
    code: 408,
    name: "Request Timeout",
    summary: "The server closed the connection because the client took too long to send the full request.",
    meaning: [
      "The server waited for the request headers or body and gave up. The client was slow to send; the server was not slow to respond.",
      "Servers also send 408 when closing idle keep-alive connections, and the client can repeat the request. If a proxy gave up waiting for its backend, that is 504 Gateway Timeout instead.",
    ],
    causes: [
      "A slow or unstable network connection, especially during large uploads.",
      "A client that opens a connection and then sends nothing for a while.",
      "A server or proxy with a very short client timeout.",
    ],
    fixes: [
      "Retry the request and check your connection.",
      "Split large uploads into smaller chunks or use resumable uploads.",
      "On the server, review client_header_timeout and client_body_timeout in nginx (or the equivalent) if real users hit the limit.",
    ],
    spec: rfc(9110, "15.5.9"),
    related: [504, 413, 429],
  },
  {
    code: 409,
    name: "Conflict",
    summary: "The request conflicts with the current state of the resource, such as saving a version that someone else already changed.",
    meaning: [
      "409 says the request is reasonable but cannot be applied right now because of the resource's state. The client should be able to resolve the conflict and send it again.",
      "Common uses are edit conflicts, duplicates (a username that is already taken) and deleting something other records depend on. 412 is the header-based version of the edit conflict case.",
    ],
    causes: [
      "Two users or processes editing the same record, where the second save is based on stale data.",
      "Creating something that already exists, such as a duplicate email or ID.",
      "Deleting a resource that other data still references.",
    ],
    fixes: [
      "Fetch the latest version, reapply or merge your changes, and retry.",
      "Read the response body to see which field or version caused the conflict.",
      "For APIs, send If-Match with the ETag so stale updates are caught reliably with 412.",
    ],
    spec: rfc(9110, "15.5.10"),
    related: [412, 422, 428],
  },
  {
    code: 410,
    name: "Gone",
    summary: "The resource used to exist here but was deliberately removed and will not come back. There is no forwarding address.",
    meaning: [
      "410 is a stronger 404. It says the removal is permanent and intended, so clients and search engines should drop the URL and links to it should be removed.",
      "Search engines remove both 404 and 410 URLs from their index, and a 410 can speed that up a little. If the content moved somewhere else, use a 301 redirect instead.",
    ],
    causes: [
      "A product, post or account was deleted on purpose.",
      "An old API version or endpoint was retired.",
    ],
    fixes: [
      "As a visitor, look for the content elsewhere on the site; it is not coming back at this URL.",
      "As a site owner, remove internal links and sitemap entries that point to the URL.",
      "If a replacement page exists, redirect to it with a 301 instead of returning 410.",
    ],
    spec: rfc(9110, "15.5.11"),
    related: [404, 301, 308],
  },
  {
    code: 411,
    name: "Length Required",
    summary: "The server refuses the request because it has a body but no Content-Length header saying how big that body is.",
    meaning: [
      "Some servers need to know the body size up front and reject requests that omit it or use chunked transfer encoding.",
      "The client can retry once it adds a valid Content-Length header.",
    ],
    causes: [
      "A POST or PUT sent with chunked encoding to a server that does not accept it.",
      "A hand-built request or client library that leaves out the header, often on an empty POST.",
    ],
    fixes: [
      "Send a Content-Length that matches the body size in bytes (Content-Length: 0 for an empty body).",
      "Buffer the body before sending instead of streaming it, so the length is known.",
    ],
    headers: ["Content-Length", "Transfer-Encoding"],
    spec: rfc(9110, "15.5.12"),
    related: [413, 400, 412],
  },
  {
    code: 412,
    name: "Precondition Failed",
    summary: "A condition in the request headers, such as If-Match or If-Unmodified-Since, was false, so the server did not apply the request.",
    meaning: [
      "Clients use conditional headers to avoid overwriting other people's changes. A PUT with If-Match: \"abc\" means update only if the current ETag is still \"abc\". If someone else changed it, the server answers 412.",
      "This prevents the lost update problem. For GET and HEAD, a failed If-None-Match or If-Modified-Since gives 304 instead.",
    ],
    causes: [
      "The resource changed since you fetched it, so your ETag no longer matches.",
      "A client sending a stale or malformed If-Match or If-Unmodified-Since value.",
    ],
    fixes: [
      "Fetch the resource again to get the current ETag, reapply your change and retry.",
      "In apps, tell the user someone else edited the item and let them merge.",
      "Make sure servers behind a load balancer generate the same ETag for the same content.",
    ],
    headers: ["ETag", "If-Match", "If-Unmodified-Since"],
    spec: rfc(9110, "15.5.13"),
    related: [409, 428, 304],
  },
  {
    code: 413,
    name: "Content Too Large",
    summary: "The request body is bigger than the server is willing to accept, usually because an upload is over the size limit.",
    meaning: [
      "Older specs called this 413 Payload Too Large, and before that Request Entity Too Large. RFC 9110 renamed it Content Too Large.",
      "The server may close the connection after sending it. If the limit is temporary, it can include Retry-After.",
    ],
    causes: [
      "Uploading a file larger than the site allows.",
      "nginx's client_max_body_size, which defaults to 1 MB.",
      "PHP's upload_max_filesize and post_max_size, or a framework body limit such as Express's 100 kb default for JSON.",
      "An upload limit on a CDN or load balancer in front of the server.",
    ],
    fixes: [
      "As a visitor, compress or resize the file, or upload it in smaller parts.",
      "In nginx, raise client_max_body_size (for example client_max_body_size 50M;) in the http, server or location block, then reload.",
      "Raise the matching limits in PHP, your framework and any proxy or CDN, because the smallest limit wins.",
      "For very large files, use chunked or direct-to-storage uploads.",
    ],
    headers: ["Retry-After"],
    spec: rfc(9110, "15.5.14"),
    related: [414, 431, 411],
  },
  {
    code: 414,
    name: "URI Too Long",
    summary: "The URL is longer than the server is willing to process, often because too much data was packed into the query string.",
    meaning: [
      "Older specs called this Request-URI Too Long. Servers set a maximum URL length, and anything over it gets 414.",
      "It usually points to data that belongs in a request body, or to a bug that keeps adding to the URL.",
    ],
    causes: [
      "Large data in query parameters, such as long lists of IDs or encoded JSON.",
      "A form using GET for a large amount of input.",
      "A redirect loop that appends the query string again on every hop.",
    ],
    fixes: [
      "Move the data into the request body and use POST.",
      "Look for redirect rules that repeat the query string.",
      "If long URLs are expected, raise the server limit (large_client_header_buffers in nginx).",
    ],
    spec: rfc(9110, "15.5.15"),
    related: [413, 431, 400],
  },
  {
    code: 415,
    name: "Unsupported Media Type",
    summary: "The server refuses the request body because its format, given by Content-Type or Content-Encoding, is not supported.",
    meaning: [
      "The server checked the Content-Type or Content-Encoding of what you sent and does not handle it, for example XML sent to a JSON-only API.",
      "415 is about the format of what you send. 406 is the reverse: the server cannot produce the format you asked to receive.",
    ],
    causes: [
      "A missing Content-Type header, so the server cannot tell the body is JSON.",
      "Form data (application/x-www-form-urlencoded) sent to an endpoint expecting application/json, or the reverse.",
      "A compressed body (Content-Encoding: gzip) the server does not accept.",
      "Uploading a file type the endpoint does not allow.",
    ],
    fixes: [
      "Set Content-Type to match the body, such as Content-Type: application/json.",
      "With fetch, add the header yourself: passing JSON.stringify output as the body sends it as text/plain.",
      "Check the API docs for accepted formats. For compression problems, the server's Accept-Encoding response header lists what it supports.",
    ],
    headers: ["Content-Type", "Content-Encoding", "Accept-Encoding"],
    spec: rfc(9110, "15.5.16"),
    related: [406, 400, 422],
  },
  {
    code: 416,
    name: "Range Not Satisfiable",
    summary: "The byte range asked for in the Range header is outside the file, so the server cannot send that part.",
    meaning: [
      "Older specs called this Requested Range Not Satisfiable. It happens when a client asks for bytes past the end of the resource, such as bytes=5000- on a 4000-byte file.",
      "The server should send Content-Range: bytes */4000 so the client learns the real size.",
    ],
    causes: [
      "Resuming a download after the file on the server changed or got smaller.",
      "A client bug that calculates the wrong offsets.",
      "A partial download in a local cache that no longer matches the server's file.",
    ],
    fixes: [
      "Restart the download from the beginning, or delete the partial file.",
      "Send If-Range with the ETag so the server returns the full file when it has changed.",
      "Read the Content-Range header in the 416 response to get the actual size.",
    ],
    headers: ["Range", "Content-Range", "If-Range"],
    spec: rfc(9110, "15.5.17"),
    related: [206, 200, 412],
  },
  {
    code: 417,
    name: "Expectation Failed",
    summary: "The server cannot meet the requirement in the request's Expect header, which is almost always Expect: 100-continue.",
    meaning: [
      "The only expectation defined in HTTP is 100-continue. A server or proxy that does not support it can reply 417.",
      "A client that gets 417 can retry the same request without the Expect header.",
    ],
    causes: [
      "A server or proxy that does not handle Expect: 100-continue.",
      "A client library adding Expect: 100-continue to large POST requests by default.",
    ],
    fixes: [
      "Remove the Expect header and resend. In curl, pass -H \"Expect:\" to stop it being sent.",
      "On the server, enable 100-continue support or ignore the header.",
    ],
    headers: ["Expect"],
    spec: rfc(9110, "15.5.18"),
    related: [100, 400],
  },
  {
    code: 418,
    name: "I'm a teapot",
    summary: "An April Fools' joke code from the Hyper Text Coffee Pot Control Protocol: a teapot refusing to brew coffee.",
    meaning: [
      "418 comes from RFC 2324, published on 1 April 1998, which defined the Hyper Text Coffee Pot Control Protocol (HTCPCP) for controlling coffee pots over a network. A teapot asked to brew coffee answers 418 I'm a teapot.",
      "It was never a real HTTP status, but many frameworks and sites added it as an Easter egg. Because it is so widely used, RFC 9110 reserves 418 so it will not be given a real meaning later.",
    ],
    causes: [
      "A developer returning it as a joke or Easter egg.",
      "A server or bot filter using it as an unusual way to refuse requests.",
    ],
    fixes: [
      "As a visitor, nothing is broken on your side. The site chose to send it.",
      "If your script or scraper gets 418, the site may be blocking automated traffic; check its terms and rate limits.",
      "In your own API, use a standard code such as 403 or 400 for real refusals.",
    ],
    spec: rfc(9110, "15.5.19"),
    related: [400, 403, 501],
    status: "joke",
  },
  {
    code: 421,
    name: "Misdirected Request",
    summary: "The request reached a server that cannot answer for this hostname and scheme, often because an HTTP/2 connection was reused.",
    meaning: [
      "With HTTP/2 and HTTP/3, a browser can reuse one connection for several hostnames that share an IP address and TLS certificate. If the server on that connection is not configured for the requested host, it answers 421.",
      "The client can retry on a new connection. The fix is almost always in the server's TLS and virtual host setup.",
    ],
    causes: [
      "A wildcard or multi-domain certificate shared by sites that run on different servers or with different TLS settings.",
      "A reverse proxy or CDN receiving traffic for a hostname it does not serve.",
      "The TLS SNI name and the Host header pointing to different sites.",
    ],
    fixes: [
      "As a visitor, reload the page, which can open a fresh connection.",
      "Give each site its own certificate, or serve every hostname on a shared certificate from the same server config.",
      "Check that the proxy's server_name or host routing includes the hostname being requested.",
    ],
    spec: rfc(9110, "15.5.20"),
    related: [400, 502, 404],
  },
  {
    code: 422,
    name: "Unprocessable Content",
    summary: "The server understood the request and its format, but the data inside failed validation, like a missing field or bad email.",
    meaning: [
      "It started in WebDAV (RFC 4918) as 422 Unprocessable Entity and was brought into the main HTTP spec by RFC 9110 under the name Unprocessable Content.",
      "Use 400 when the request is malformed, such as broken JSON. Use 422 when the JSON parses fine but the values are wrong. Rails, Laravel and FastAPI all return 422 for validation errors by default.",
    ],
    causes: [
      "A required field is missing or empty.",
      "A value has the wrong type or format, such as text where a number is expected, or an invalid email.",
      "A value breaks a business rule, such as an end date before the start date.",
    ],
    fixes: [
      "Read the error response. Validation APIs usually list each failing field and why.",
      "Check the request against the API's schema or documentation.",
      "As a visitor, look for form fields marked with errors and correct them.",
    ],
    spec: rfc(9110, "15.5.21"),
    related: [400, 409, 415],
  },
  {
    code: 423,
    name: "Locked",
    summary: "A WebDAV response saying the file or resource is locked, so the server will not change it until the lock is released.",
    meaning: [
      "WebDAV clients can LOCK a resource while editing it. Other requests that try to change it get 423 until the owner unlocks it or the lock times out.",
    ],
    causes: [
      "Another user or app has the file open for editing.",
      "A stale lock left behind after a client crashed.",
    ],
    fixes: [
      "Wait for the other user to finish, or close the file in the app that holds it.",
      "If you own the lock, send its token in the If header.",
      "Ask the server admin to remove a stale lock, or wait for it to expire.",
    ],
    headers: ["Lock-Token", "If"],
    spec: rfc(4918, "11.3"),
    related: [424, 409, 207],
  },
  {
    code: 424,
    name: "Failed Dependency",
    summary: "A WebDAV response saying the request failed because another action it depended on failed first.",
    meaning: [
      "Mostly seen inside 207 Multi-Status responses. If a PROPPATCH sets several properties and one fails, the rest return 424, because the operation is all or nothing.",
    ],
    causes: [
      "One part of a multi-step WebDAV operation failed, so the other parts were not applied.",
      "A locked or forbidden resource earlier in the same request.",
    ],
    fixes: [
      "Look through the 207 body for the status that is not 424. That is the real error.",
      "Fix that error and send the whole request again.",
    ],
    spec: rfc(4918, "11.4"),
    related: [207, 423, 409],
  },
  {
    code: 425,
    name: "Too Early",
    summary: "The server will not process a request sent in TLS early data, because an attacker could replay it.",
    meaning: [
      "TLS 1.3 lets clients send data in the first flight of a resumed connection (0-RTT early data). That saves a round trip, but the data can be replayed. A server that sees a risky request in early data can answer 425.",
      "Proxies add Early-Data: 1 when they forward a request that arrived in early data. The client should retry after the TLS handshake completes.",
    ],
    causes: [
      "A non-idempotent request, such as a POST, sent in 0-RTT data.",
      "A CDN or proxy forwarding an early-data request to an origin that refuses them.",
    ],
    fixes: [
      "Retry the request. Well-behaved clients resend it automatically after the handshake.",
      "On the server, accept only safe, idempotent requests (like GET) in early data, or turn 0-RTT off.",
    ],
    headers: ["Early-Data"],
    spec: rfc(8470, "5.2"),
    related: [400, 426, 503],
  },
  {
    code: 426,
    name: "Upgrade Required",
    summary: "The server refuses to handle the request over the current protocol, and its Upgrade header names the protocol to switch to.",
    meaning: [
      "The server must send an Upgrade header listing the protocol it requires. If the client then asks to upgrade and the server agrees, the switch happens with 101 Switching Protocols.",
      "A common case is a WebSocket endpoint receiving a plain HTTP request without the upgrade handshake.",
    ],
    causes: [
      "A WebSocket endpoint opened as a normal web page or called with a plain HTTP client.",
      "A reverse proxy dropping the Upgrade and Connection headers before they reach the app.",
      "A server that requires a newer protocol than the client used.",
    ],
    fixes: [
      "Connect with a WebSocket client using ws:// or wss://, or with whatever protocol the Upgrade header names.",
      "In nginx, set proxy_http_version 1.1, proxy_set_header Upgrade $http_upgrade and proxy_set_header Connection \"upgrade\".",
      "Update the client or library if it does not support the required protocol.",
    ],
    headers: ["Upgrade", "Connection"],
    spec: rfc(9110, "15.5.22"),
    related: [101, 505, 400],
  },
  {
    code: 428,
    name: "Precondition Required",
    summary: "The server requires a conditional request, such as one with If-Match, to stop clients from overwriting each other's changes.",
    meaning: [
      "Defined in RFC 6585. An API returns 428 when a client tries to change a resource without proving it has the latest version. The client should fetch the resource, read its ETag and send it back in If-Match.",
      "428 means the condition is missing. 412 means the condition was sent but did not match.",
    ],
    causes: [
      "A PUT, PATCH or DELETE sent without If-Match or If-Unmodified-Since.",
      "A client library or proxy that drops conditional headers.",
    ],
    fixes: [
      "GET the resource first, then repeat the update with If-Match set to the ETag you received.",
      "Check the API docs for which conditional header it expects.",
    ],
    headers: ["ETag", "If-Match"],
    spec: rfc(6585, "3"),
    related: [412, 409, 304],
  },
  {
    code: 429,
    name: "Too Many Requests",
    summary: "You sent too many requests in a short time and hit a rate limit. Wait, then retry, ideally after the Retry-After time.",
    meaning: [
      "Defined in RFC 6585 for rate limiting. The server may send Retry-After, either a number of seconds or a date, to say when you can try again.",
      "Many APIs also send headers like X-RateLimit-Limit and X-RateLimit-Remaining so clients can slow down before they hit the limit. 429 is about your traffic; 503 means the whole server is struggling.",
    ],
    causes: [
      "A script, loop or retry storm sending requests faster than the API allows.",
      "Many users behind one IP address, such as an office or mobile network, sharing one limit.",
      "Repeated login or form attempts hitting a stricter limit on that endpoint.",
      "Bot protection on a CDN treating your traffic as abusive.",
    ],
    fixes: [
      "As a visitor, wait a few minutes and try again.",
      "Read Retry-After and do not retry before that time.",
      "Use exponential backoff with jitter, and cache responses so you make fewer calls.",
      "Batch requests where the API allows it, or ask the provider for a higher limit.",
    ],
    headers: ["Retry-After"],
    spec: rfc(6585, "4"),
    related: [503, 403, 408],
  },
  {
    code: 431,
    name: "Request Header Fields Too Large",
    summary: "The server refuses the request because its headers are too big, usually because of too many or oversized cookies.",
    meaning: [
      "Defined in RFC 6585. The limit can apply to all headers together or to a single header. Cookies are the usual culprit, since every cookie for a domain goes out with every request.",
      "Some servers report the same problem as 400. nginx, for example, shows 400 Bad Request with the message Request Header Or Cookie Too Large.",
    ],
    causes: [
      "Cookies piling up on a domain, often from analytics, A/B tests or many subdomains sharing cookies.",
      "A very large Authorization header, such as a JWT carrying too many claims.",
      "Large custom headers added by a proxy or the app.",
    ],
    fixes: [
      "As a visitor, clear cookies for that site and reload.",
      "Store less in cookies and scope them to the paths and subdomains that need them.",
      "Keep tokens small, or raise the header limit (large_client_header_buffers in nginx, --max-http-header-size in Node.js).",
    ],
    spec: rfc(6585, "5"),
    related: [400, 413, 414],
  },
  {
    code: 451,
    name: "Unavailable For Legal Reasons",
    summary: "The server cannot show this resource because of a legal demand, such as a court order, government block or copyright claim.",
    meaning: [
      "Defined in RFC 7725. The number is a nod to Ray Bradbury's novel Fahrenheit 451.",
      "The response should explain the legal demand. It can include a Link header with rel=\"blocked-by\" naming the party that is carrying out the block.",
    ],
    causes: [
      "A court order or government requirement in your country.",
      "A copyright or DMCA takedown notice.",
      "A site blocking regions where it cannot comply with local law, such as data protection rules.",
    ],
    fixes: [
      "As a visitor, there is nothing technical to fix. Read the explanation on the page and look for the content through legal channels in your region.",
      "As a site owner, use 451 rather than 403 or 404 for legal blocks, and explain the reason in the response body.",
    ],
    headers: ["Link"],
    spec: rfc(7725, "3"),
    related: [403, 404, 410],
  },

  // 5xx server errors
  {
    code: 500,
    name: "Internal Server Error",
    summary: "Something went wrong on the server and it could not complete the request. It is a generic error and not your fault.",
    meaning: [
      "500 is the catch-all server error. The app hit an unexpected condition, usually an unhandled exception, and had no more specific code to send.",
      "The problem is on the server side, so changing your request rarely helps. The real cause is almost always in the server's error logs.",
    ],
    causes: [
      "An unhandled exception or bug in the application code.",
      "A failed database connection or query.",
      "A server misconfiguration, such as a broken .htaccess rule or wrong permissions on a script.",
      "Missing environment variables or a half-finished deploy.",
    ],
    fixes: [
      "As a visitor, reload after a minute, and contact the site if it keeps happening.",
      "Check the application and web server error logs for the stack trace at the time of the request.",
      "Roll back the latest deploy or config change if the errors started right after it.",
      "Catch expected errors and return specific codes (400, 404, 503) so real 500s stand out.",
    ],
    spec: rfc(9110, "15.6.1"),
    related: [502, 503, 504],
  },
  {
    code: 501,
    name: "Not Implemented",
    summary: "The server does not support the functionality needed for the request, typically an HTTP method it does not recognise.",
    meaning: [
      "501 means the server does not know how to handle the method for any resource. With 405, the server knows the method but this URL does not allow it.",
      "Some APIs also use 501 for features that are planned but not built yet.",
    ],
    causes: [
      "An uncommon or custom method, such as PROPFIND sent to a server without WebDAV.",
      "An API endpoint that is stubbed out but not implemented.",
      "A proxy that does not support the method.",
    ],
    fixes: [
      "Check the method name for typos and use one the server supports.",
      "Check the API docs or changelog to see if the feature exists yet.",
      "If you run the server, enable the module that handles the method, or return 405 with an Allow header if only this resource rejects it.",
    ],
    spec: rfc(9110, "15.6.2"),
    related: [405, 500, 505],
  },
  {
    code: 502,
    name: "Bad Gateway",
    summary: "A server acting as a gateway or proxy got an invalid response, or no usable response, from the upstream server behind it.",
    meaning: [
      "Most sites have a reverse proxy, load balancer or CDN (nginx, Cloudflare, a cloud load balancer) in front of the app server. A 502 means that front layer contacted the app and got back garbage, a reset connection or nothing at all.",
      "With 504 the upstream was reachable but too slow, and with 503 the server reports itself unavailable. With 502 the upstream is usually down, crashed or misconfigured.",
    ],
    causes: [
      "The app server (Node.js, PHP-FPM, Gunicorn) has crashed, is restarting or is not running.",
      "The proxy points at the wrong host, port or socket, or a firewall blocks the connection.",
      "The upstream sent a malformed response, or headers bigger than the proxy's buffer.",
      "DNS or SSL problems between a CDN and the origin server.",
    ],
    fixes: [
      "As a visitor, wait a moment and reload. Short 502s often happen during deploys.",
      "Check the app process is running and listening where the proxy expects; curl it directly from the proxy host.",
      "Read the proxy error log. nginx logs lines such as connect() failed (111: Connection refused) or upstream sent too big header.",
      "Check app logs for crashes or out-of-memory kills, and raise proxy_buffer_size if upstream headers are too large.",
    ],
    spec: rfc(9110, "15.6.3"),
    related: [504, 503, 500],
  },
  {
    code: 503,
    name: "Service Unavailable",
    summary: "The server cannot handle the request right now, usually because it is overloaded or down for maintenance. Try again later.",
    meaning: [
      "503 is for temporary conditions. The server can send Retry-After with a number of seconds or a date to say when it expects to be back.",
      "It is the right status for planned maintenance pages. Search engines treat a short 503 as temporary and keep the page, while a maintenance page served with 200 could end up indexed.",
    ],
    causes: [
      "Planned maintenance or a deploy in progress.",
      "More traffic than the available servers or workers can handle.",
      "No healthy backends left behind a load balancer because the app is failing health checks.",
      "A dependency such as the database is down, and the app reports itself unavailable.",
    ],
    fixes: [
      "As a visitor, wait and retry, and check the site's status page.",
      "As a client, honour Retry-After and back off instead of retrying in a tight loop.",
      "As the owner, check health checks, autoscaling, worker limits (PHP-FPM pm.max_children, Gunicorn workers) and CPU and memory usage.",
      "Serve maintenance pages with 503 and a Retry-After header.",
    ],
    headers: ["Retry-After"],
    spec: rfc(9110, "15.6.4"),
    related: [502, 504, 429],
  },
  {
    code: 504,
    name: "Gateway Timeout",
    summary: "A gateway or proxy waited too long for a response from the upstream server and gave up before the page was ready.",
    meaning: [
      "The proxy (nginx, a load balancer, a CDN) reached the upstream but did not get a full response within its timeout. The upstream may still be working on the request.",
      "502 means the upstream gave a bad or broken response. 504 means no response in time. 408 is the reverse case, where the server gave up waiting for the client.",
    ],
    causes: [
      "A slow database query, report or third-party API call holding up the request.",
      "A proxy timeout shorter than the app needs, such as nginx's proxy_read_timeout (60 seconds by default) or a CDN's own limit.",
      "An overloaded app server with requests queuing up.",
      "Network problems between the proxy and the origin.",
    ],
    fixes: [
      "As a visitor, wait and retry. If you submitted a form or payment, check whether it went through before sending it again.",
      "Find the slow step with app logs or tracing and speed it up, for example with a database index or a cache.",
      "Move long work to a background job and return 202 with a status URL.",
      "If the work really needs more time, raise proxy_read_timeout in nginx and the matching limit on any CDN or load balancer.",
    ],
    spec: rfc(9110, "15.6.5"),
    related: [502, 503, 408],
  },
  {
    code: 505,
    name: "HTTP Version Not Supported",
    summary: "The server does not support, or refuses to use, the major HTTP version the client used for the request.",
    meaning: [
      "The server should explain in the body which versions it supports. Clients and servers usually agree on HTTP/2 or HTTP/3 during the TLS handshake, so 505 is rare.",
    ],
    causes: [
      "A malformed request line, such as a typo in HTTP/1.1 from a hand-written client.",
      "A proxy forwarding requests in an HTTP version the backend does not support.",
    ],
    fixes: [
      "Use a standard HTTP client library and let it choose the version.",
      "Check the proxy's upstream settings, such as proxy_http_version in nginx.",
      "Upgrade or reconfigure the backend server.",
    ],
    spec: rfc(9110, "15.6.6"),
    related: [426, 501, 400],
  },
  {
    code: 506,
    name: "Variant Also Negotiates",
    summary: "A server configuration error in content negotiation: the chosen variant is itself set up to negotiate, creating a loop.",
    meaning: [
      "Defined in RFC 2295 (Transparent Content Negotiation). The server's negotiation setup points to a variant that negotiates again, so it cannot pick a final representation.",
      "It is rare and always a server-side misconfiguration.",
    ],
    causes: [
      "A type map or negotiation rule (for example in Apache's mod_negotiation) where a variant points back to a negotiable resource.",
      "Transparent content negotiation turned on for resources that should not use it.",
    ],
    fixes: [
      "As a visitor, nothing on your side will fix it. Contact the site.",
      "Check the server's content negotiation config and make each variant point to a real file.",
    ],
    spec: rfc(2295, "8.1"),
    related: [500, 300, 508],
  },
  {
    code: 507,
    name: "Insufficient Storage",
    summary: "The server cannot store what it needs to complete the request, typically because its disk or the user's quota is full.",
    meaning: [
      "Defined by WebDAV in RFC 4918, and also used by some file and storage services. The condition is meant to be temporary.",
    ],
    causes: [
      "The server's disk is full.",
      "The user's storage quota is used up.",
      "An upload that would exceed the space available.",
    ],
    fixes: [
      "As a user, delete files or upgrade your storage plan.",
      "As an admin, check disk usage (df -h), clear old logs and temp files, and add disk space or alerts.",
    ],
    spec: rfc(4918, "11.5"),
    related: [413, 500, 503],
  },
  {
    code: 508,
    name: "Loop Detected",
    summary: "The server stopped a WebDAV request because it found an infinite loop, usually from bindings processed with Depth: infinity.",
    meaning: [
      "Defined in RFC 5842 (WebDAV bindings). A collection with a binding back to itself or a parent would loop forever under Depth: infinity, so the server ends the operation with 508.",
      "Some shared hosts also show 508 Resource Limit Is Reached when an account uses too much CPU or memory. That is a hosting panel convention, not the RFC meaning.",
    ],
    causes: [
      "Bindings that create a cycle inside a WebDAV collection.",
      "On shared hosting, an account going over its CPU, memory or process limits.",
    ],
    fixes: [
      "Remove the binding that creates the cycle, or use a smaller Depth value.",
      "On shared hosting, check resource usage in the control panel, cut heavy plugins or scripts, or move to a bigger plan.",
    ],
    spec: rfc(5842, "7.2"),
    related: [208, 506, 503],
  },
  {
    code: 510,
    name: "Not Extended",
    summary: "The request is missing an HTTP extension declaration that the server requires before it will process the request.",
    meaning: [
      "Defined in RFC 2774 (An HTTP Extension Framework). The framework was never widely adopted and the RFC is now marked Historic, so 510 is effectively obsolete.",
    ],
    causes: [
      "A server built for the RFC 2774 extension framework receiving a request without the extension it needs.",
      "A custom server using 510 for its own purposes.",
    ],
    fixes: [
      "Read the response body for the extension the server wants.",
      "If you run the server, return a standard code such as 400 or 403 instead.",
    ],
    spec: rfc(2774, "7"),
    related: [501, 400, 426],
    status: "deprecated",
  },
  {
    code: 511,
    name: "Network Authentication Required",
    summary: "You need to log in to the network before you can get online, typically on hotel, airport or cafe Wi-Fi with a captive portal.",
    meaning: [
      "Defined in RFC 6585 for captive portals. The network intercepts your request and replies with 511 and a page linking to its login or terms screen.",
      "It comes from the network, not the website you were trying to reach. Origin servers should not send it.",
    ],
    causes: [
      "Public Wi-Fi that requires you to sign in or accept terms.",
      "A network session that expired and needs a fresh login.",
    ],
    fixes: [
      "Open any http:// page, or your device's network sign-in prompt, to reach the portal and log in.",
      "Disconnect and reconnect to the Wi-Fi if the portal does not appear.",
      "Turn off a VPN or custom DNS for a moment, since they can stop the portal from loading.",
    ],
    spec: rfc(6585, "6"),
    related: [401, 407, 403],
  },
];
