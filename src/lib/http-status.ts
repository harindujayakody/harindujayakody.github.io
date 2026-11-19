import { freeTools } from "../data/free-tools";
import type { StatusCode } from "../data/http-status-codes";

export const httpTool = freeTools.find((t) => t.slug === "http-status-codes")!;
export const BASE = httpTool.href; // "/free-tools/http-status-codes/"
export const codeUrl = (code: number) => `${BASE}${code}/`;

export const CLASSES = [
  { digit: 1, id: "1xx", name: "Informational", blurb: "The request was received and the server is still working on it." },
  { digit: 2, id: "2xx", name: "Success", blurb: "The request was received, understood and accepted." },
  { digit: 3, id: "3xx", name: "Redirection", blurb: "The client has to take another step, usually following a new URL." },
  { digit: 4, id: "4xx", name: "Client error", blurb: "Something is wrong with the request, so the server won't handle it." },
  { digit: 5, id: "5xx", name: "Server error", blurb: "The request looked fine, but the server failed to handle it." },
] as const;

export const classOf = (code: number) => CLASSES[Math.floor(code / 100) - 1];

// Page <title> targets the way people search: errors get "how to fix", the rest get "meaning".
// Long names get a shorter tail so the title stays under about 60 characters, where Google cuts it off.
export function pageTitle(s: StatusCode) {
  const head = `${s.code} ${s.name}`;
  if (s.code < 400) return head.length > 30 ? `${head}: Meaning` : `${head}: HTTP Status Code Meaning`;
  return head.length > 24 ? `${head}: Meaning and Fix` : `${head}: What It Means and How to Fix It`;
}

// A minimal raw response, so readers see where the code and its headers appear.
export function exampleResponse(s: StatusCode) {
  const h: string[] = [`HTTP/1.1 ${s.code} ${s.name}`];
  const has = (name: string) => s.headers?.some((x) => x.toLowerCase() === name.toLowerCase());
  if (has("Location")) h.push("Location: https://example.com/new-page");
  if (has("Retry-After")) h.push("Retry-After: 120");
  if (has("WWW-Authenticate")) h.push('WWW-Authenticate: Bearer realm="api"');
  if (has("Proxy-Authenticate")) h.push('Proxy-Authenticate: Basic realm="proxy"');
  if (has("Allow")) h.push("Allow: GET, HEAD");
  if (has("Upgrade")) h.push("Upgrade: HTTP/2.0");
  if (has("Content-Range")) h.push("Content-Range: bytes 0-1023/4096");
  if (has("ETag")) h.push('ETag: "33a64df5"');
  const noBody = s.code < 200 || s.code === 204 || s.code === 304;
  if (!noBody) h.push("Content-Type: text/plain; charset=utf-8");
  return h.join("\n") + (noBody ? "" : `\n\n${s.code} ${s.name}`);
}

// Ways to see the status of a response from the command line and common languages.
// Clients follow redirects by default, so 3xx snippets turn that off or they would only ever see the final page.
export function snippets(code: number) {
  const redirect = code >= 300 && code < 400;
  return [
    {
      lang: "bash",
      label: "cURL",
      code: `# Print only the status code${redirect ? " (no -L, so the redirect isn't followed)" : ""}\ncurl -s -o /dev/null -w "%{http_code}\\n" https://example.com/`,
    },
    {
      lang: "js",
      label: "JavaScript (Node.js)",
      code: `const res = await fetch("https://example.com/"${redirect ? ', { redirect: "manual" }' : ""});\nif (res.status === ${code}) {\n  console.log(res.status, res.statusText${redirect ? ', res.headers.get("location")' : ""});\n}`,
    },
    {
      lang: "python",
      label: "Python",
      code: `import requests\n\nres = requests.get("https://example.com/"${redirect ? ", allow_redirects=False" : ""})\nif res.status_code == ${code}:\n    print(res.status_code, res.reason${redirect ? ', res.headers.get("Location")' : ""})`,
    },
    {
      lang: "go",
      label: "Go",
      code: redirect
        ? `client := &http.Client{\n\tCheckRedirect: func(*http.Request, []*http.Request) error {\n\t\treturn http.ErrUseLastResponse\n\t},\n}\nres, err := client.Get("https://example.com/")\nif err != nil {\n\tlog.Fatal(err)\n}\ndefer res.Body.Close()\nif res.StatusCode == ${code} {\n\tfmt.Println(res.Status, res.Header.Get("Location"))\n}`
        : `res, err := http.Get("https://example.com/")\nif err != nil {\n\tlog.Fatal(err)\n}\ndefer res.Body.Close()\nif res.StatusCode == ${code} {\n\tfmt.Println(res.Status)\n}`,
    },
  ];
}
