/**
 * Rejoins web addresses that were split across lines.
 *
 *   node scripts/content/join-wrapped-urls.ts          apply
 *   node scripts/content/join-wrapped-urls.ts --list   only show what would change
 *
 * The old posts were exported with long lines wrapped, and the wrap did not
 * spare addresses:
 *
 *     There is a great podcast about it [here](http://google-code-
 *     updates.blogspot.com/2007/06/google-developer-podcast.html)
 *
 * An address cannot contain a space or a line break, so markdown does not
 * see a link there, and the reader sees the brackets and the address as
 * text. The same happens to images. This removes the breaks inside the
 * address of a link or image. Link text and titles are left as they are.
 *
 * Running it again changes nothing.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { contentFiles, maskCode } from '../images/lib.ts';

/** "](" then an address that may hold spaces and matched brackets, then ")". */
const TARGET = /\]\(((?:[^()]|\([^()]*\))*)\)/g;
/** An optional title at the end: [text](address "title"). */
const TITLE = /\s+"[^"]*"\s*$/;
const LOOKS_LIKE_ADDRESS = /^<?((https?:)?\/\/|\/|mailto:)/i;

const listOnly = process.argv.includes('--list');
let files = 0;
let joined = 0;

for (const file of contentFiles()) {
  const raw = readFileSync(file, 'utf8');
  const masked = maskCode(raw);
  let out = '';
  let last = 0;
  let count = 0;
  for (const match of masked.matchAll(TARGET)) {
    const inner = raw.slice(match.index + 2, match.index + 2 + match[1].length);
    const title = inner.match(TITLE)?.[0] ?? '';
    const address = inner.slice(0, inner.length - title.length);
    if (!/\s/.test(address.trim())) continue;
    const whole = address.replace(/\s+/g, '');
    if (!LOOKS_LIKE_ADDRESS.test(whole)) continue;
    out += raw.slice(last, match.index + 2) + whole + title;
    last = match.index + 2 + match[1].length;
    count += 1;
    if (listOnly) console.log(`${file.replace('content/', '')}: ${whole.slice(0, 110)}`);
  }
  if (count === 0) continue;
  files += 1;
  joined += count;
  if (!listOnly) writeFileSync(file, out + raw.slice(last));
}

console.log(`${joined} addresses rejoined in ${files} files.`);
