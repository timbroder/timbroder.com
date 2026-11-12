/**
 * Captures the baseline from the live site into tests/baseline/.
 *
 *   npm run baseline:capture
 *
 * The baseline is what the migration is tested against, so rerun this while
 * the Gatsby site is still live whenever main has changed.
 *
 * Environment:
 *   BASELINE_ORIGIN       site to capture (default https://timbroder.com)
 *   BASELINE_CONCURRENCY  parallel requests (default 4)
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  extractFeed,
  extractPage,
  type CardFacts,
  type PageFacts,
} from '../../tests/lib/extract.ts';
import {
  classifyPath,
  isListType,
  toPath,
  withTrailingSlash,
} from '../../tests/lib/urls.ts';

const ORIGIN = (process.env.BASELINE_ORIGIN ?? 'https://timbroder.com').replace(
  /\/$/,
  '',
);
const CONCURRENCY = Number(process.env.BASELINE_CONCURRENCY ?? 4);
const USER_AGENT = 'timbroder.com-baseline-capture';
const OUT = join(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
  'tests',
  'baseline',
);

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface Fetched {
  status: number;
  body: string;
  contentType: string | null;
  location: string | null;
}

/**
 * Fetch with retries. The live site occasionally answers with a short
 * transient "Error - Request ID" body, so those are retried as well.
 */
async function get(
  path: string,
  { follow = true, expect }: { follow?: boolean; expect?: number } = {},
): Promise<Fetched> {
  const url = new URL(path, `${ORIGIN}/`).toString();
  let last: Fetched | Error | undefined;
  for (let attempt = 0; attempt < 5; attempt++) {
    if (attempt) await sleep(1000 * 2 ** (attempt - 1));
    try {
      const res = await fetch(url, {
        headers: { 'user-agent': USER_AGENT },
        redirect: follow ? 'follow' : 'manual',
      });
      const body = await res.text();
      last = {
        status: res.status,
        body,
        contentType: res.headers.get('content-type'),
        location: res.headers.get('location'),
      };
      const transient =
        res.status >= 500 ||
        res.status === 429 ||
        (body.length < 200 && /^Error\b/.test(body.trim()));
      if (transient) continue;
      if (expect !== undefined && res.status !== expect) continue;
      return last;
    } catch (err) {
      last = err as Error;
    }
  }
  if (last instanceof Error || last === undefined) {
    throw new Error(`Failed to fetch ${url}: ${last?.message ?? 'no response'}`);
  }
  return last;
}

async function pool<T, R>(
  items: T[],
  worker: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      while (next < items.length) {
        const index = next++;
        results[index] = await worker(items[index], index);
        await sleep(50);
      }
    }),
  );
  return results;
}

function locs(xml: string): string[] {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) =>
    m[1]
      .replace(/&amp;/g, '&')
      .replace(/&apos;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>'),
  );
}

function write(name: string, content: string) {
  writeFileSync(join(OUT, name), content);
  console.log(`wrote tests/baseline/${name}`);
}

const json = (value: unknown) => `${JSON.stringify(value, null, 1)}\n`;

function gitSha(ref: string): string | null {
  try {
    return execFileSync('git', ['rev-parse', ref], { encoding: 'utf8' }).trim();
  } catch {
    return null;
  }
}

async function main() {
  mkdirSync(OUT, { recursive: true });

  // 1. URLs from the sitemap.
  const index = await get('/sitemap-index.xml', { expect: 200 });
  const sitemapUrls = locs(index.body);
  const urlSet = new Set<string>();
  for (const sitemapUrl of sitemapUrls) {
    const sitemap = await get(new URL(sitemapUrl).pathname, { expect: 200 });
    for (const loc of locs(sitemap.body)) urlSet.add(toPath(loc));
  }
  const urls = [...urlSet].sort();
  console.log(`sitemap: ${urls.length} URLs`);

  // 2. Every page, plus the 404 page (which is not in the sitemap).
  let done = 0;
  const targets = [...urls, '/404.html'];
  const pages = await pool(targets, async (path) => {
    const res = await get(encodeURI(path), { expect: 200 });
    if (res.status !== 200) {
      throw new Error(`${path} returned ${res.status}`);
    }
    done++;
    if (done % 100 === 0) console.log(`pages: ${done}/${targets.length}`);
    return extractPage(path, res.body);
  });

  // 3. List pages repeat the same cards many times over, so cards are stored
  //    once per post and each list page only keeps the order of its cards.
  const cards = new Map<string, CardFacts>();
  const cardVariants: { href: string; page: string; card: CardFacts }[] = [];
  const sequences: string[][] = [];
  const sequenceIds = new Map<string, number>();
  const lists: Record<
    string,
    {
      headline: string | null;
      pagination: NonNullable<PageFacts['list']>['pagination'];
      sequence: number;
    }
  > = {};

  const pageLines: string[] = [];
  for (const page of pages) {
    if (isListType(page.type) && page.list) {
      const hrefs: string[] = [];
      for (const card of page.list.cards) {
        const href = withTrailingSlash(toPath(card.href));
        hrefs.push(href);
        const known = cards.get(href);
        const normalised = { ...card, href };
        if (!known) {
          cards.set(href, normalised);
        } else if (JSON.stringify(known) !== JSON.stringify(normalised)) {
          cardVariants.push({ href, page: page.url, card: normalised });
        }
      }
      const key = hrefs.join('\n');
      let id = sequenceIds.get(key);
      if (id === undefined) {
        id = sequences.length;
        sequences.push(hrefs);
        sequenceIds.set(key, id);
      }
      lists[page.url] = {
        headline: page.list.headline,
        pagination: page.list.pagination,
        sequence: id,
      };
      // Keep the page record small: the list itself lives in lists.json.
      const { list: _list, ...rest } = page;
      pageLines.push(JSON.stringify(rest));
    } else {
      pageLines.push(JSON.stringify(page));
    }
  }

  write('urls.txt', `${urls.join('\n')}\n`);
  write('pages.jsonl', `${pageLines.join('\n')}\n`);
  write(
    'lists.json',
    json({
      pages: lists,
      sequences,
      cards: Object.fromEntries([...cards].sort(([a], [b]) => a.localeCompare(b))),
      cardVariants,
    }),
  );

  // 4. The feed.
  const feed = await get('/feed', { expect: 200 });
  const feedFacts = extractFeed(feed.body);
  write(
    'feed.json',
    json({
      contentType: feed.contentType,
      bytes: Buffer.byteLength(feed.body),
      ...feedFacts,
    }),
  );

  // 5. How Netlify answers requests that are not plain pages.
  const probes: Record<string, unknown> = {};
  const probe = async (path: string) => {
    const res = await get(path, { follow: false });
    probes[path] = {
      status: res.status,
      contentType: res.contentType,
      location: res.location ? toPath(res.location) : null,
    };
    return res;
  };
  await probe('/about');
  await probe('/tag/android');
  await probe('/About/');
  await probe('/this-page-does-not-exist/');
  await probe('/feed');
  await probe('/feed/');
  await probe('/sitemap-index.xml');
  await probe('/sitemap-0.xml');
  await probe('/favicon.ico');
  await probe('/og-image.png');
  const robots = await probe('/robots.txt');
  const manifest = await probe('/manifest.webmanifest');
  let manifestJson: unknown = null;
  try {
    manifestJson = JSON.parse(manifest.body);
  } catch {
    manifestJson = null;
  }
  write(
    'site.json',
    json({ probes, robots: robots.body, manifest: manifestJson }),
  );

  // 6. Summary.
  const counts: Record<string, number> = {};
  for (const url of urls) {
    const type = classifyPath(url);
    counts[type] = (counts[type] ?? 0) + 1;
  }
  write(
    'meta.json',
    json({
      capturedAt: new Date().toISOString(),
      origin: ORIGIN,
      mainSha: gitSha('origin/main'),
      urls: urls.length,
      counts,
      feedItems: feedFacts.items.length,
    }),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
