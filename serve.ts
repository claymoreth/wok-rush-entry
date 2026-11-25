// serve.ts — tiny static server for the game/ directory. Node 22, stdlib only.
import { createServer } from "node:http";
import { readFileSync, existsSync, statSync } from "node:fs";
import { join, resolve, extname, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(join(fileURLToPath(new URL(".", import.meta.url)), "game"));

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

function parsePort(argv: string[]): number {
  const idx = argv.indexOf("--port");
  if (idx >= 0 && argv[idx + 1]) {
    const n = Number(argv[idx + 1]);
    if (Number.isInteger(n) && n > 0 && n < 65536) return n;
  }
  return 8080;
}

const port = parsePort(process.argv.slice(2));

const server = createServer((req, res) => {
  const rawPath = decodeURIComponent(req.url?.split("?")[0] || "/");
  const rel = normalize(rawPath === "/" ? "index.html" : rawPath.replace(/^\/+/, ""));
  const filePath = resolve(join(root, rel));
  if (!filePath.startsWith(root + "/") && filePath !== root) {
    res.writeHead(403, { "content-type": "text/plain" });
    res.end("Forbidden\n");
    return;
  }
  if (!existsSync(filePath) || !statSync(filePath).isFile()) {
    res.writeHead(404, { "content-type": "text/plain" });
    res.end("Not found\n");
    return;
  }
  const ext = extname(filePath).toLowerCase();
  res.writeHead(200, { "content-type": MIME[ext] || "application/octet-stream" });
  res.end(readFileSync(filePath));
});

server.listen(port, () => {
  console.log(`Wok Rush serving game/ on http://localhost:${port}/`);
});
