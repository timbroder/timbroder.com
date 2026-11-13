/**
 * Puts every image the posts show into public/images/ and points the posts
 * at the local copies.
 *
 *   node scripts/images/fetch.ts     first, until nothing is left to try
 *   node scripts/images/apply.ts
 *
 * What it does:
 *
 *  1. Moves the image files that were under content/ to public/images/, so
 *     that /images/2012/08/solr1.png is a real address. Files that are not
 *     pictures (saved error pages, the hosts' "unavailable" stand-ins,
 *     tracking pixels) are deleted, not moved.
 *  2. Saves each remote image that fetch.ts found under
 *     public/images/remote/<post>/ and rewrites the post to use it.
 *  3. Points each image that is gone at the placeholder,
 *     /images/missing-image.svg.
 *  4. Removes images that were never pictures (see NOT_PICTURES).
 *  5. Records where everything came from in content/image-sources.json.
 *
 * Running it again changes nothing.
 */
import { execFileSync } from 'node:child_process';
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { basename, dirname, extname, join, relative } from 'node:path';
import { contentFiles, imageRefs, isRemote, judge, maskCode, STAND_INS } from './lib.ts';
import type { Fetched } from './fetch.ts';

const CACHE = 'scripts/images/.cache';
const PUBLIC = 'public/images';
const PLACEHOLDER = '/images/missing-image.svg';
const SOURCES = 'content/image-sources.json';

/**
 * Remote "images" that were never pictures: counters and buttons that feed
 * services add to every item, and spacers. They show nothing, so they are
 * taken out of the post, not replaced with the placeholder.
 */
const NOT_PICTURES: [RegExp, string][] = [
  [/^https?:\/\/feeds\.feedburner\.com\/~/, 'a counter or button added by FeedBurner'],
  [/^https?:\/\/feeds\.feedburner\.com\/%7E/i, 'a counter or button added by FeedBurner'],
  [/^https?:\/\/blogger\.googleusercontent\.com\/tracker\//, 'a counter added by Blogger'],
  [/\/blank\.gif$/, 'an empty spacer image'],
];
const notPicture = (url: string) => NOT_PICTURES.find(([pattern]) => pattern.test(url))?.[1];

export interface Source {
  /** The address the post used to show. */
  original: string;
  /** What the post shows now, or null when the image was removed. */
  local: string | null;
  /**
   * original: downloaded from the original address.
   * repo: a copy that was already in this repository.
   * archive: recovered from the Internet Archive.
   * placeholder: gone everywhere; the post shows the placeholder.
   * removed: never a picture; taken out of the post.
   */
  source: 'original' | 'repo' | 'archive' | 'placeholder' | 'removed';
  /** The Internet Archive capture, for `archive`. */
  archived?: string;
  /** Why, for `removed`. */
  reason?: string;
  /** For `removed`: where the links around it led, which went with it. */
  links?: string[];
  posts: string[];
  /** How many times the posts show it. */
  uses: number;
}

const manifest: Record<string, Fetched> = JSON.parse(readFileSync(join(CACHE, 'manifest.json'), 'utf8'));
const sources = new Map<string, Source>(
  existsSync(SOURCES)
    ? (JSON.parse(readFileSync(SOURCES, 'utf8')) as Source[]).map((source) => [source.original, source])
    : [],
);

const git = (...args: string[]) => execFileSync('git', args, { stdio: 'pipe' });

function walk(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? walk(join(dir, entry.name)) : [join(dir, entry.name)],
  );
}

// 1. Move the image files out of content/.
const earlierDownloads = new Set(
  Object.values(manifest)
    .filter((entry) => entry.source === 'repo')
    .map((entry) => entry.from!),
);
let moved = 0;
const junk: string[] = [];
for (const [from, to] of [
  ['content/blog/images', PUBLIC],
  ['content/pages/images', join(PUBLIC, 'pages')],
]) {
  for (const file of walk(from)) {
    if (basename(file) === '.DS_Store') {
      rmSync(file);
      continue;
    }
    const verdict = judge(readFileSync(file), STAND_INS);
    if (!verdict.ok) {
      junk.push(`${file}: ${verdict.reason}`);
      git('rm', '-q', '--', file);
      continue;
    }
    // An earlier download of a remote image goes to remote/ in step 2.
    if (earlierDownloads.has(file)) {
      git('rm', '-q', '--', file);
      continue;
    }
    const target = join(to, relative(from, file));
    mkdirSync(dirname(target), { recursive: true });
    git('mv', '--', file, target);
    moved += 1;
  }
}

// 2 and 3. A local file, or the placeholder, for every remote image.
const taken = new Set(walk(PUBLIC));
function place(entry: Fetched): string {
  const post = entry.posts[0];
  // Keep the file's own name, with the extension its content calls for.
  const address = new URL(entry.url.startsWith('//') ? `https:${entry.url}` : entry.url);
  const raw = decodeURIComponent(basename(address.pathname)) || 'image';
  const stem = (extname(raw) ? raw.slice(0, -extname(raw).length) : raw).replace(/[^A-Za-z0-9._-]+/g, '-');
  let target = join(PUBLIC, 'remote', post, `${stem}.${entry.type}`);
  for (let n = 2; taken.has(target); n += 1) {
    if (readFileSync(target).equals(readFileSync(join(CACHE, entry.file!)))) return target;
    target = join(PUBLIC, 'remote', post, `${stem}-${n}.${entry.type}`);
  }
  mkdirSync(dirname(target), { recursive: true });
  cpSync(join(CACHE, entry.file!), target);
  taken.add(target);
  return target;
}

// Only the images the posts still show: an address that has since been
// repaired or pointed at a local file is no longer remote.
const shown = new Set(
  contentFiles().flatMap((file) =>
    imageRefs(readFileSync(file, 'utf8'))
      .map((ref) => ref.url)
      .filter(isRemote),
  ),
);
for (const entry of Object.values(manifest)) {
  if (sources.has(entry.url) || !shown.has(entry.url)) continue;
  const reason = notPicture(entry.url);
  if (reason) {
    sources.set(entry.url, { original: entry.url, local: null, source: 'removed', reason, posts: entry.posts, uses: 0 });
  } else if (entry.source === 'gone') {
    sources.set(entry.url, { original: entry.url, local: PLACEHOLDER, source: 'placeholder', posts: entry.posts, uses: 0 });
  } else {
    const local = `/${relative('public', place(entry))}`;
    sources.set(entry.url, {
      original: entry.url,
      local,
      source: entry.source,
      ...(entry.source === 'archive' ? { archived: entry.from } : {}),
      posts: entry.posts,
      uses: 0,
    });
  }
}

// 4. Rewrite the posts.
let rewritten = 0;
let removed = 0;
const unknown = new Set<string>();
for (const file of contentFiles()) {
  const raw = readFileSync(file, 'utf8');
  const masked = maskCode(raw);
  const edits: [number, number, string][] = [];

  for (const ref of imageRefs(raw)) {
    if (ref.url.startsWith('images/')) {
      // A page's own image, written relative to the page.
      edits.push([ref.start, ref.end, `/images/pages/${ref.url.slice('images/'.length)}`]);
      continue;
    }
    if (!isRemote(ref.url)) continue;
    const source = sources.get(ref.url);
    if (!source) {
      unknown.add(ref.url);
      continue;
    }
    source.uses += 1;
    if (source.local) {
      edits.push([ref.start, ref.end, source.local]);
      rewritten += 1;
      continue;
    }
    // Take the whole image out, with the link around it if it has one.
    const imageStart = masked.lastIndexOf('![', ref.start);
    let start = imageStart;
    let end = masked.indexOf(')', ref.end) + 1;
    const link = masked.slice(end).match(/^\s*\]\((?:[^()\s]|\([^()\s]*\))*(?:\s+"[^"]*")?\s*\)/);
    if (link && /\[\s*$/.test(masked.slice(0, imageStart))) {
      start = masked.lastIndexOf('[', imageStart);
      end += link[0].length;
      const target = link[0].replace(/^\s*\]\(/, '').replace(/(?:\s+"[^"]*")?\s*\)$/, '');
      source.links = [...new Set([...(source.links ?? []), target])];
    }
    edits.push([start, end, '']);
    removed += 1;
  }

  // A link to the very file an image shows now goes to the local copy too.
  for (const match of masked.matchAll(/\]\(((?:[^()\s]|\([^()\s]*\))+)(?:\s+"[^"]*")?\s*\)/g)) {
    const url = match[1];
    const start = match.index + 2;
    if (!isRemote(url) || edits.some(([from, to]) => start >= from && start < to)) continue;
    const local = sources.get(url)?.local;
    if (local && local !== PLACEHOLDER) edits.push([start, start + url.length, local]);
  }

  if (edits.length === 0) continue;
  let out = raw;
  for (const [start, end, text] of edits.sort((a, b) => b[0] - a[0])) {
    out = out.slice(0, start) + text + out.slice(end);
  }
  if (out !== raw) writeFileSync(file, out);
}

// 5. The record, with only the images the posts still account for.
const record = [...sources.values()]
  .map((source) => ({ ...source, posts: [...source.posts].sort() }))
  .sort((a, b) => a.posts[0].localeCompare(b.posts[0]) || a.original.localeCompare(b.original));
writeFileSync(SOURCES, `${JSON.stringify(record, null, 2)}\n`);

const count = (kind: Source['source']) => record.filter((source) => source.source === kind).length;
console.log(`${moved} image files moved to ${PUBLIC}/; ${junk.length} files that were not pictures deleted.`);
console.log(
  `${rewritten} image references now local; ${removed} removed. Of ${record.length} remote images: ` +
    `${count('original')} from the original address, ${count('repo')} already in the repo, ` +
    `${count('archive')} from the Internet Archive, ${count('placeholder')} gone (placeholder), ` +
    `${count('removed')} removed.`,
);
if (junk.length && process.argv.includes('--junk')) console.log(junk.join('\n'));
if (unknown.size) {
  console.log(`\nNot fetched yet; run fetch.ts again (${unknown.size}):`);
  for (const url of unknown) console.log(`  ${url}`);
  process.exitCode = 1;
}
if (statSync(PUBLIC).isDirectory() && !existsSync(join('public', PLACEHOLDER))) {
  console.log(`\nThe placeholder ${PLACEHOLDER} is missing.`);
  process.exitCode = 1;
}
