/**
 * Serves the built site in dist/ for the browser tests.
 *
 *   node scripts/serve-dist.ts [port]
 *
 * It behaves like Netlify where the tests care: a directory serves its
 * index.html, a path without its trailing slash redirects to the one with
 * it, and an unknown path gets 404.html with a 404 status.
 *
 * `astro preview` is not used because it moves itself to the background
 * when it is not run from a terminal, which test runners cannot manage.
 */
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';

const root = join(process.cwd(), 'dist');
const port = Number(process.argv[2] ?? process.env.PORT ?? 4321);

const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

const isFile = (path: string) => existsSync(path) && statSync(path).isFile();
const isDirectory = (path: string) => existsSync(path) && statSync(path).isDirectory();

if (!isFile(join(root, 'index.html'))) {
  console.error('dist/ is missing. Run `npm run build` first.');
  process.exit(1);
}

createServer((req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost');
  let path = url.pathname;
  try {
    path = decodeURIComponent(path);
  } catch {
    // Leave a malformed escape as it is.
  }

  let file = normalize(join(root, path));
  if (!file.startsWith(root)) {
    res.writeHead(403).end();
    return;
  }

  if (isDirectory(file)) {
    if (!path.endsWith('/')) {
      res.writeHead(301, { location: `${url.pathname}/${url.search}` }).end();
      return;
    }
    file = join(file, 'index.html');
  }

  if (!isFile(file)) {
    const notFound = join(root, '404.html');
    res.writeHead(404, { 'content-type': TYPES['.html'] });
    if (isFile(notFound)) createReadStream(notFound).pipe(res);
    else res.end('Not found');
    return;
  }

  const type =
    TYPES[extname(file)] ??
    (path === '/feed' ? 'application/rss+xml; charset=utf-8' : 'application/octet-stream');
  res.writeHead(200, { 'content-type': type });
  createReadStream(file).pipe(res);
}).listen(port, () => {
  console.log(`Serving dist/ at http://localhost:${port}`);
});
