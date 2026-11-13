/**
 * Finds a copy of every remote image the posts show, and saves it.
 *
 *   node scripts/images/fetch.ts            fetch what is not fetched yet
 *   node scripts/images/fetch.ts --retry    try the ones marked gone again
 *
 * For each image it tries, in order:
 *   1. a copy already in the repo (content/blog/images/<post>/), if it is a
 *      real picture and not a stand-in
 *   2. the original address
 *   3. the Internet Archive, oldest capture first. For Tim's old Blogger and
 *      Picasa pictures it looks through everything the Archive holds for
 *      his account, under every host name those services have used, and
 *      takes the same photo at any size.
 * and otherwise marks the image as gone.
 *
 * Results go to scripts/images/.cache/ (not committed): the files, and
 * manifest.json, which apply.ts reads. Running it again only fetches what
 * is missing.
 */
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { contentFiles, imageRefs, isRemote, judge, stemOf, STAND_INS } from './lib.ts';

const CACHE = 'scripts/images/.cache';
const MANIFEST = join(CACHE, 'manifest.json');
const AGENT = 'Mozilla/5.0 (compatible; image-archiver)';
const retry = process.argv.includes('--retry');

export interface Fetched {
  url: string;
  /** Posts (file stems) that show this image. */
  posts: string[];
  source: 'repo' | 'original' | 'archive' | 'gone';
  /** The saved file, inside the cache folder. */
  file?: string;
  /** Where the bytes came from: a repo path, or the address fetched. */
  from?: string;
  type?: string;
  width?: number;
  height?: number;
  bytes?: number;
  sha1?: string;
  /** What was tried and why each attempt was turned down. */
  tried: string[];
}

mkdirSync(join(CACHE, 'files'), { recursive: true });
const manifest: Record<string, Fetched> = existsSync(MANIFEST)
  ? JSON.parse(readFileSync(MANIFEST, 'utf8'))
  : {};
const save = () => writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2));

// A picture kept on an earlier run may since have been recognised as a
// stand-in. Forget those, so they are looked for again.
for (const [url, entry] of Object.entries(manifest)) {
  if (entry.sha1 && STAND_INS[entry.sha1]) delete manifest[url];
}

const absolute = (url: string) => (url.startsWith('//') ? `https:${url}` : url);

/** The same address on the host's sister servers, which hold the same files. */
function mirrors(url: string): string[] {
  const out = [url];
  const noQuery = url.split('?')[0];
  if (noQuery !== url) out.push(noQuery);
  // Blogger's "s1600-h" address is a page that shows the picture at "s1600".
  for (const base of [...out]) if (base.includes('-h/')) out.push(base.replace(/\/(s\d+)-h\//, '/$1/'));
  for (const base of [...out]) {
    const lh = base.match(/^(https?:\/\/)lh\d(\.(?:google|ggpht)\.com\/.*)$/);
    if (lh) for (const n of [3, 4, 5, 6]) out.push(`${lh[1]}lh${n}${lh[2]}`);
    const bp = base.match(/^(https?:\/\/)\d(\.bp\.blogspot\.com\/.*)$/);
    if (bp) for (const n of [1, 2, 3, 4]) out.push(`${bp[1]}${n}${bp[2]}`);
  }
  return [...new Set(out)];
}

async function get(url: string, timeout = 25_000): Promise<{ data: Buffer; finalUrl: string } | string> {
  try {
    const response = await fetch(url, {
      redirect: 'follow',
      headers: { 'User-Agent': AGENT, Accept: 'image/*,*/*;q=0.5' },
      signal: AbortSignal.timeout(timeout),
    });
    if (!response.ok) return `HTTP ${response.status}`;
    return { data: Buffer.from(await response.arrayBuffer()), finalUrl: response.url };
  } catch (error) {
    return (error as Error).name === 'TimeoutError' ? 'timed out' : `failed (${(error as Error).message})`;
  }
}

const MOVED_AWAY = /unavailable|not[-_]?found|removed|missing|placeholder|deleted|error|404/i;

/** Fetches one address and says whether what came back is the picture. */
async function attempt(url: string, tried: string[]) {
  const got = await get(url);
  if (typeof got === 'string') {
    tried.push(`${url}: ${got}`);
    return null;
  }
  if (got.finalUrl !== url && MOVED_AWAY.test(got.finalUrl) && !MOVED_AWAY.test(url)) {
    tried.push(`${url}: redirected to ${got.finalUrl}`);
    return null;
  }
  const verdict = judge(got.data, STAND_INS);
  if (!verdict.ok) {
    tried.push(`${url}: ${verdict.reason}`);
    return null;
  }
  return { ...got, verdict };
}

let archiveTurn = Promise.resolve();
/** The Internet Archive asks for gentle use: one request at a time, with a pause. */
function politely<T>(task: () => Promise<T>): Promise<T> {
  const run = archiveTurn.then(task);
  const pause = () => new Promise<void>((resolve) => setTimeout(resolve, 2500));
  archiveTurn = run.then(pause, pause);
  return run;
}

/** Asks the Archive's index a question, waiting and asking again when it is busy. */
async function askArchive(query: string): Promise<string[][]> {
  let problem = '';
  for (const wait of [0, 20, 45, 90, 180]) {
    if (wait) await new Promise((resolve) => setTimeout(resolve, wait * 1000));
    const got = await politely(() => get(`https://web.archive.org/cdx/search/cdx?output=json&${query}`, 90_000));
    if (typeof got === 'string') {
      problem = got;
      continue;
    }
    try {
      return (JSON.parse(got.data.toString('utf8') || '[]') as string[][]).slice(1);
    } catch {
      problem = 'answer was not a list';
    }
  }
  throw new Error(`The Internet Archive did not answer (${problem})`);
}

interface Capture {
  timestamp: string;
  original: string;
}

/** Captures of one exact address, oldest first. */
async function captures(url: string): Promise<Capture[]> {
  const rows = await askArchive(
    `fl=timestamp,original&filter=statuscode:200&collapse=digest&limit=8&url=${encodeURIComponent(url)}`,
  );
  return rows.map(([timestamp, original]) => ({ timestamp, original }));
}

/**
 * Tim's old Blogger and Picasa pictures have addresses like
 *   <host>/<account>/<x>/<y>/<photo>/<size>/<name>
 * and the same photo was served from several hosts over the years.
 */
const ALBUM =
  /^https?:\/\/(?:\d\.bp\.blogspot\.com|bp\d\.blogger\.com|lh\d\.(?:google|ggpht)\.com)\/(_Ng3QbVQfLZ8|timothy\.broder)\/[^/]+\/[^/]+\/([^/]+)\/([^/]+)\/[^/?]+/;
const ALBUM_HOSTS: Record<string, string[]> = {
  _Ng3QbVQfLZ8: [
    ...[1, 2, 3, 4].map((n) => `${n}.bp.blogspot.com`),
    ...[0, 1, 2, 3].map((n) => `bp${n}.blogger.com`),
    ...[3, 4, 5, 6].map((n) => `lh${n}.ggpht.com`),
  ],
  'timothy.broder': [
    ...[3, 4, 5, 6].map((n) => `lh${n}.google.com`),
    ...[3, 4, 5, 6].map((n) => `lh${n}.ggpht.com`),
  ],
};

const listings = new Map<string, Promise<Capture[]>>();
/** Everything the Archive holds under one host for one account. Kept on disk. */
function accountCaptures(host: string, account: string): Promise<Capture[]> {
  const key = `${host}/${account}`;
  if (!listings.has(key)) {
    listings.set(
      key,
      (async () => {
        const file = join(CACHE, 'listings', `${host}_${account}.json`);
        if (existsSync(file)) return JSON.parse(readFileSync(file, 'utf8')) as Capture[];
        const rows = await askArchive(
          `fl=timestamp,original&filter=statuscode:200&collapse=urlkey&limit=5000&matchType=prefix&url=${encodeURIComponent(`${host}/${account}/`)}`,
        );
        const found = rows.map(([timestamp, original]) => ({ timestamp, original }));
        mkdirSync(join(CACHE, 'listings'), { recursive: true });
        writeFileSync(file, JSON.stringify(found));
        return found;
      })(),
    );
  }
  return listings.get(key)!;
}

/** Captures of the same photo under any host and at any size, same size first. */
async function albumCaptures(url: string): Promise<Capture[]> {
  const match = url.match(ALBUM);
  if (!match) return [];
  const [, account, photo, size] = match;
  const found: Capture[] = [];
  for (const host of ALBUM_HOSTS[account]) {
    for (const capture of await accountCaptures(host, account)) {
      if (capture.original.includes(`/${photo}/`)) found.push(capture);
    }
  }
  const sameSize = (capture: Capture) => (capture.original.includes(`/${size}/`) ? 0 : 1);
  return found.sort((a, b) => sameSize(a) - sameSize(b));
}

async function resolve(url: string, posts: string[]): Promise<Fetched> {
  const tried: string[] = [];
  const address = absolute(url);
  const name = basename(new URL(address).pathname) || 'image';

  const keep = (source: Fetched['source'], from: string, data: Buffer, verdict: ReturnType<typeof judge>) => {
    const file = join('files', `${verdict.sha1}.${verdict.info!.type}`);
    writeFileSync(join(CACHE, file), data);
    return {
      url, posts, source, file, from, tried,
      type: verdict.info!.type, width: verdict.info!.width, height: verdict.info!.height,
      bytes: data.length, sha1: verdict.sha1,
    } satisfies Fetched;
  };

  // 1. A copy already in the repo.
  for (const post of posts) {
    const local = join('content/blog/images', post, decodeURIComponent(name));
    if (!existsSync(local) || !statSync(local).isFile()) continue;
    const data = readFileSync(local);
    const verdict = judge(data, STAND_INS);
    if (verdict.ok) return keep('repo', local, data, verdict);
    tried.push(`${local}: ${verdict.reason}`);
  }

  // 2. The original address, and the same file on sister servers.
  for (const candidate of mirrors(address)) {
    const got = await attempt(candidate, tried);
    if (got) return keep('original', candidate, got.data, got.verdict);
  }

  // 3. The Internet Archive, oldest capture first: the oldest is the most
  //    likely to be from before the picture was taken down.
  const fromArchive = async ({ timestamp, original }: Capture) => {
    const archived = `https://web.archive.org/web/${timestamp}id_/${original}`;
    const got = await politely(() => attempt(archived, tried));
    return got ? keep('archive', archived, got.data, got.verdict) : null;
  };
  if (ALBUM.test(address)) {
    const found = await albumCaptures(address);
    if (found.length === 0) tried.push('archive: no capture of this photo under any host or size');
    for (const capture of found) {
      const kept = await fromArchive(capture);
      if (kept) return kept;
    }
  } else {
    for (const candidate of mirrors(address)) {
      const found = await captures(candidate);
      if (found.length === 0) tried.push(`archive of ${candidate}: no capture`);
      for (const capture of found) {
        const kept = await fromArchive(capture);
        if (kept) return kept;
      }
    }
  }

  return { url, posts, source: 'gone', tried };
}

// Every remote image, with the posts that show it.
const wanted = new Map<string, Set<string>>();
for (const file of contentFiles()) {
  for (const ref of imageRefs(readFileSync(file, 'utf8'))) {
    if (!isRemote(ref.url)) continue;
    if (!wanted.has(ref.url)) wanted.set(ref.url, new Set());
    wanted.get(ref.url)!.add(stemOf(file));
  }
}

const todo = [...wanted].filter(([url]) => !manifest[url] || (retry && manifest[url].source === 'gone'));
console.error(`${wanted.size} remote images; ${todo.length} to fetch.`);

let done = 0;
const queue = [...todo];
await Promise.all(
  Array.from({ length: 4 }, async () => {
    for (let item = queue.shift(); item; item = queue.shift()) {
      const [url, posts] = item;
      try {
        manifest[url] = await resolve(url, [...posts].sort());
      } catch (error) {
        console.error(`  skipped for now: ${(error as Error).message}`);
      }
      done += 1;
      if (done % 10 === 0) {
        save();
        console.error(`  ${done}/${todo.length}`);
      }
    }
  }),
);
for (const [url, posts] of wanted) if (manifest[url]) manifest[url].posts = [...posts].sort();
for (const url of Object.keys(manifest)) if (!wanted.has(url)) delete manifest[url];
save();

const all = Object.values(manifest);
const count = (source: string) => all.filter((entry) => entry.source === source).length;
console.log(
  `already in the repo: ${count('repo')}, original address: ${count('original')}, ` +
    `Internet Archive: ${count('archive')}, gone: ${count('gone')}, ` +
    `not tried yet: ${wanted.size - all.length}`,
);

// The same bytes for different addresses usually means a stand-in.
const bySha = new Map<string, Fetched[]>();
for (const entry of all) {
  if (!entry.sha1) continue;
  bySha.set(entry.sha1, [...(bySha.get(entry.sha1) ?? []), entry]);
}
for (const [hash, entries] of bySha) {
  if (entries.length < 2) continue;
  console.log(`\nsame picture for ${entries.length} addresses (${hash}, ${entries[0].width}x${entries[0].height}):`);
  for (const entry of entries) console.log(`  ${entry.url}`);
}
