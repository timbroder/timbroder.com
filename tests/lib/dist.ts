/**
 * Reads the built site in dist/ for the build-output tests.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { extractPage, type ListFacts, type PageFacts } from './extract.ts';

export const DIST = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'dist');

export function assertBuilt(): void {
  if (!existsSync(join(DIST, 'index.html'))) {
    throw new Error('dist/ is missing. Run `npm run build` before the build tests.');
  }
}

function walk(dir: string, found: string[]): void {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path, found);
    else if (name === 'index.html') found.push(dir);
  }
}

let pages: Set<string> | undefined;

/** The path of every built page, for example "/2019/09/small-wins/". */
export function builtPages(): Set<string> {
  if (!pages) {
    assertBuilt();
    const dirs: string[] = [];
    walk(DIST, dirs);
    pages = new Set(
      dirs.map((dir) => {
        const rel = dir.slice(DIST.length).split('\\').join('/');
        return rel === '' ? '/' : `${rel}/`;
      }),
    );
  }
  return pages;
}

/** True for a built page or any other built file, such as /feed. */
export function exists(path: string): boolean {
  if (builtPages().has(path)) return true;
  const file = join(DIST, path);
  return existsSync(file) && statSync(file).isFile();
}

export function readHtml(url: string): string {
  const file = url.endsWith('/') ? join(DIST, url, 'index.html') : join(DIST, url);
  return readFileSync(file, 'utf8');
}

const cache = new Map<string, PageFacts>();

/** The same facts the baseline holds, read from the built page. */
export function readPage(url: string): PageFacts {
  let facts = cache.get(url);
  if (!facts) {
    facts = extractPage(url, readHtml(url));
    cache.set(url, facts);
  }
  return facts;
}

export function readList(url: string): ListFacts {
  const list = readPage(url).list;
  if (!list) throw new Error(`${url} is not a list page`);
  return list;
}

export interface RedirectRule {
  from: string;
  to: string;
  status: number;
}

let rules: RedirectRule[] | undefined;

export function loadRedirects(): RedirectRule[] {
  if (!rules) {
    assertBuilt();
    rules = readFileSync(join(DIST, '_redirects'), 'utf8')
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#'))
      .map((line) => {
        const [from, to, status = '301'] = line.split(/\s+/);
        return { from, to, status: Number(status) };
      });
  }
  return rules;
}

function matches(rule: string, request: string): boolean {
  if (!rule.includes(':')) return rule === request;
  const pattern = rule
    .split('/')
    .map((part) =>
      part.startsWith(':') ? '[^/]+' : part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
    )
    .join('/');
  return new RegExp(`^${pattern}$`).test(request);
}

/**
 * Where Netlify would send a request, or null.
 *
 * `request` is the path as a client sends it. Netlify compares rules with
 * the request exactly, and serves a real page before looking at redirects.
 */
export function resolveRedirect(request: string): RedirectRule | null {
  return loadRedirects().find((rule) => matches(rule.from, request)) ?? null;
}

/** The form of a path that a browser puts on the wire. */
export const asBrowserSends = (path: string) => encodeURI(path);
