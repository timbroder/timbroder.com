/**
 * Points links and pictures at this site's own pages and files, in place of
 * the addresses the site had in earlier lives.
 *
 *   npm run build
 *   node scripts/content/local-links.ts          apply
 *   node scripts/content/local-links.ts --list   only show what would change
 *
 * What it rewrites:
 *
 *   http://timbroder.com/2011/01/getting-it-onto-the-kindle.html
 *       the WordPress form of a post's address  ->  /2011/01/getting-it-onto-the-kindle/
 *   http://blog.gpowered.net/2007/08/google-get-in-gear.html
 *   https://gpowered.blogspot.com/2007/08/google-get-in-gear.html
 *       the blog's addresses from 2007 to 2009  ->  /2007/08/google-get-in-gear/
 *   https://gpowered.blogspot.com/search/label/HOWTO
 *       a Blogger label                         ->  /tag/howto/
 *   http://timbroder.com/wp-content/uploads/2010/11/batman3.jpg
 *   https://d208tez5h4u8q2.cloudfront.net/wp-content/uploads/2010/07/IMAG0124-150x150.jpg
 *       a WordPress upload, also from its CDN   ->  /images/2010/11/batman3.jpg
 *   a link around a picture, leading to the picture's WordPress "attachment
 *   page"                                       ->  the picture itself
 *
 * An address is only rewritten when its target exists: a page in the build
 * (which is why it needs a build), or a file in the images folder. Anything
 * else is left alone and listed. Running it again changes nothing.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { builtPages, newUrlOf } from '../../tests/lib/dist.ts';
import { contentFiles, maskCode } from '../images/lib.ts';

/**
 * Hosts this blog has lived at. The last one is the CDN that served the
 * WordPress site's uploads.
 */
const OWN_HOSTS =
  /^https?:\/\/(?:www\.)?(timbroder\.com|blog\.gpowered\.net|gpowered\.blogspot\.com|d208tez5h4u8q2\.cloudfront\.net)(?=[/?#]|$)/i;
/** Where image files are, before and after they move to public/. */
const IMAGE_ROOTS = ['public/images', 'content/blog/images'];

const imageExists = (path: string) =>
  IMAGE_ROOTS.some((root) => existsSync(join(root, decodeURIComponent(path.replace(/^\/images\//, '')))));

/** The new address for an old one, or null when there is nothing to point at. */
function localise(url: string): string | null {
  const own = url.match(OWN_HOSTS);
  if (!own) return null;
  let path = url.slice(own[0].length).split(/[?#]/)[0] || '/';
  try {
    path = decodeURI(path);
  } catch {
    // Keep the path as written.
  }

  const upload = path.match(/^\/wp-content\/uploads\/(.+)$/);
  if (upload) return imageExists(`/images/${upload[1]}`) ? `/images/${upload[1]}` : null;

  if (path === '/' || path === '/index.html') return '/';
  // A Blogger label is a tag here.
  const label = path.match(/^\/search\/label\/([^/]+)\/?$/);
  if (label) return newUrlOf(`/tag/${label[1].toLowerCase()}/`);
  // "/2011/01/post.html" and "/page.html" became "/2011/01/post/" and "/page/".
  // Old links were not careful about capitals.
  const page = `${path.replace(/\.html$/, '').replace(/\/$/, '')}/`;
  return newUrlOf(page) ?? newUrlOf(page.toLowerCase());
}

/** "[" picture "](" address ")": the link, when its whole text is one picture. */
const LINKED_PICTURE = /\[\s*!\[[^\]]*\]\(([^()\s]+)\)\s*\]\(([^()\s]+)\)/g;
/** "](" address, with an optional title, ")". */
const TARGET = /\]\(([^()\s]+)((?:\s+"[^"]*")?\s*\))/g;
const AUTOLINK = /<(https?:\/\/[^>\s]+)>/g;

const listOnly = process.argv.includes('--list');
builtPages();

let rewritten = 0;
let files = 0;
const left = new Set<string>();

for (const file of contentFiles()) {
  const raw = readFileSync(file, 'utf8');
  const masked = maskCode(raw);
  /** Replacements as [start, end, text], applied from the end backwards. */
  const edits: [number, number, string][] = [];
  const note = (from: string, to: string) => {
    if (listOnly) console.log(`${file.replace('content/', '')}\n    ${from}\n    -> ${to}`);
  };

  // A link around a picture that leads to a page that no longer exists.
  const handled = new Set<number>();
  for (const match of masked.matchAll(LINKED_PICTURE)) {
    const [, picture, target] = match;
    if (!OWN_HOSTS.test(target) || localise(target)) continue;
    const local = localise(picture) ?? (picture.startsWith('/images/') ? picture : null);
    if (!local) continue;
    const start = match.index + match[0].lastIndexOf(target);
    edits.push([start, start + target.length, local]);
    handled.add(start);
    note(target, `${local} (the picture it surrounds)`);
  }

  for (const match of masked.matchAll(TARGET)) {
    const start = match.index + 2;
    if (handled.has(start)) continue;
    const url = match[1];
    if (!OWN_HOSTS.test(url)) continue;
    const local = localise(url);
    if (!local) {
      left.add(url);
      continue;
    }
    edits.push([start, start + url.length, local]);
    note(url, local);
  }

  for (const match of masked.matchAll(AUTOLINK)) {
    const url = match[1];
    if (!OWN_HOSTS.test(url)) continue;
    const local = localise(url);
    if (!local) {
      left.add(url);
      continue;
    }
    // "<http://...>" shows the address as the link text; keep showing it.
    edits.push([match.index, match.index + match[0].length, `[${url}](${local})`]);
    note(match[0], `[${url}](${local})`);
  }

  if (edits.length === 0) continue;
  files += 1;
  rewritten += edits.length;
  if (listOnly) continue;
  let out = raw;
  for (const [start, end, text] of edits.sort((a, b) => b[0] - a[0])) {
    out = out.slice(0, start) + text + out.slice(end);
  }
  writeFileSync(file, out);
}

console.log(`${rewritten} addresses made local in ${files} files.`);
if (left.size) {
  console.log(`\nLeft as they are, because nothing on this site matches (${left.size}):`);
  for (const url of [...left].sort()) console.log(`  ${url}`);
}
