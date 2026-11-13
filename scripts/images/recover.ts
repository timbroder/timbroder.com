/**
 * Puts back a picture that the migration could not find.
 *
 * About ninety images in the old posts were gone from the internet when
 * the site moved, and show a placeholder. This is for when the original
 * turns up later, for example in Tim's Google Photos library. The steps
 * around it are in RECOVER_MISSING_IMAGES.md.
 *
 *   node scripts/images/recover.ts --list
 *       What is still missing, post by post, with what is known about each.
 *       Add --json for the same as data.
 *
 *   node scripts/images/recover.ts --search <folder>
 *       Looks through a folder of photos (a Google Takeout export, say) for
 *       files named like the missing ones. It only reports; it changes
 *       nothing.
 *
 *   node scripts/images/recover.ts "<original address>" <file> [--note "where it was found"]
 *       Uses <file> for that image: copies it to public/images/remote/<post>/,
 *       points the post at it in place of the placeholder, and records it in
 *       content/image-sources.json. Add --as-is to keep a file that is over
 *       the size limits.
 */
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { basename, dirname, extname, join } from 'node:path';
import { imageRefs, inspectImage, judge, localName, setImageAddress } from './lib.ts';
import type { Source } from './apply.ts';

const SOURCES = 'content/image-sources.json';
const PLACEHOLDER = '/images/missing-image.svg';
/** A picture in a post never needs to be bigger than this. */
const MAX_WIDTH = 2000;
const MAX_BYTES = 1_500_000;

const sources = JSON.parse(readFileSync(SOURCES, 'utf8')) as Source[];
const missing = sources.filter((source) => source.source === 'placeholder');

/** The markdown file of a post or page, from its name in the record. */
function fileOf(post: string): string {
  for (const dir of ['content/blog', 'content/pages']) {
    if (existsSync(join(dir, `${post}.md`))) return join(dir, `${post}.md`);
  }
  throw new Error(`There is no post or page called ${post}`);
}

/** Where a missing image was hosted, and so where its original is likely to be. */
function whereToLook(url: string): string {
  if (/^https?:\/\/lh\d\.(google|ggpht)\.com\//.test(url)) return 'Picasa Web Albums';
  if (/^https?:\/\/(\d\.bp\.blogspot\.com|bp\d\.blogger\.com)\//.test(url)) return 'Blogger (uploaded with the post)';
  if (/flickr\.com\//.test(url)) return 'Flickr';
  if (/fbcdn\.net\//.test(url)) return 'Facebook (a personal photo)';
  return "another site's image; unlikely to be in Tim's library";
}

/** The file name in an address, as it would be called on disk. */
function nameIn(url: string): string {
  const name = basename(new URL(url).pathname);
  try {
    return decodeURIComponent(name);
  } catch {
    return name;
  }
}

/** The size the address asked the host for, if it says: "s400" is 400 pixels on the long side. */
function sizeHint(url: string): string | null {
  const blogger = url.match(/\/s(\d+)(?:-[a-z])?\//);
  if (blogger) return `${blogger[1]} px on its long side`;
  const flickr = url.match(/_([a-z])(?:_d)?\.[a-z]+$/);
  const sizes: Record<string, string> = { m: '240 px', z: '640 px', b: '1024 px', k: '2048 px', o: 'the original size' };
  return flickr && sizes[flickr[1]] ? sizes[flickr[1]] : null;
}

interface Missing {
  original: string;
  name: string;
  where: string;
  size: string | null;
  post: string;
  file: string;
  title: string;
  date: string;
  /** Which image of the post it is, and how many the post has. */
  position: number;
  of: number;
  alt: string;
  /** The words just before the image in the post. */
  after: string;
}

function worklist(): Missing[] {
  const list: Missing[] = [];
  for (const source of missing) {
    for (const [post, positions] of Object.entries(source.positions ?? {})) {
      const file = fileOf(post);
      const text = readFileSync(file, 'utf8');
      const refs = imageRefs(text);
      for (const position of positions) {
        const ref = refs[position - 1];
        if (ref?.url !== PLACEHOLDER) continue;
        // The words before the image, from the post itself, not its frontmatter.
        const bodyStart = text.indexOf('\n---', 3) + 4;
        const before = text
          .slice(Math.max(bodyStart, ref.start - 400), ref.start)
          .replace(/\[?!\[[^\]]*\]\([^)]*\)(\]\([^)]*\))?/g, ' ')
          .replace(/\[?!\[[^\]]*(\]\()?$/, '')
          .replace(/\s+/g, ' ')
          .trim();
        list.push({
          original: source.original,
          name: nameIn(source.original),
          where: whereToLook(source.original),
          size: sizeHint(source.original),
          post,
          file,
          title: text.match(/^title:\s*(.+)$/m)?.[1].replace(/^['"]|['"]$/g, '') ?? post,
          date: post.match(/^\d{4}-\d{2}-\d{2}/)?.[0] ?? '',
          position,
          of: refs.length,
          alt: ref.alt,
          after: before.slice(-160),
        });
      }
    }
  }
  return list.sort((a, b) => a.post.localeCompare(b.post) || a.position - b.position);
}

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? walk(join(dir, entry.name)) : [join(dir, entry.name)],
  );
}

const args = process.argv.slice(2);
const option = (name: string) => {
  const at = args.indexOf(name);
  return at === -1 ? undefined : args[at + 1];
};

if (args.includes('--list')) {
  const list = worklist();
  if (args.includes('--json')) {
    console.log(JSON.stringify(list, null, 2));
  } else {
    let post = '';
    for (const item of list) {
      if (item.post !== post) {
        post = item.post;
        console.log(`\n${item.title}  (${item.date})\n  ${item.file}`);
      }
      console.log(`  image ${item.position} of ${item.of}: ${item.name}`);
      console.log(`      was on:  ${item.where}${item.size ? `, shown at ${item.size}` : ''}`);
      if (item.alt) console.log(`      alt:     ${item.alt}`);
      if (item.after) console.log(`      follows: …${item.after}`);
      console.log(`      address: ${item.original}`);
    }
    const posts = new Set(list.map((item) => item.post)).size;
    const different = new Set(list.map((item) => item.original)).size;
    console.log(`\n${list.length} placeholders (${different} different images) in ${posts} posts.`);
  }
} else if (args.includes('--search')) {
  const folder = option('--search');
  if (!folder || !existsSync(folder)) throw new Error('Give --search a folder that exists.');
  const byName = new Map<string, string[]>();
  for (const file of walk(folder)) {
    const key = basename(file, extname(file)).toLowerCase();
    byName.set(key, [...(byName.get(key) ?? []), file]);
  }
  let found = 0;
  for (const item of worklist()) {
    const key = basename(item.name, extname(item.name)).toLowerCase();
    const candidates = byName.get(key) ?? [];
    if (candidates.length === 0) continue;
    found += 1;
    console.log(`\n${item.name}  (${item.post}, image ${item.position})\n  address: ${item.original}`);
    for (const candidate of candidates) {
      const info = inspectImage(readFileSync(candidate));
      console.log(`  ${candidate}  ${info ? `${info.width}x${info.height} ${info.type}` : 'not an image'}`);
    }
  }
  console.log(
    `\n${found} missing images have a file of the same name in ${folder}. ` +
      'A name is only a hint ("1.jpg", "Untitled.jpg"): look at each one before using it.',
  );
} else {
  const [original, file] = args.filter((arg, i) => !arg.startsWith('--') && args[i - 1] !== '--note');
  if (!original || !file) {
    throw new Error('Usage: recover.ts --list | --search <folder> | "<original address>" <file> [--note "..."]');
  }
  const source = missing.find((entry) => entry.original === original);
  if (!source) {
    throw new Error(`${original} is not recorded as missing. Run with --list to see what is.`);
  }
  const data = readFileSync(file);
  const verdict = judge(data);
  if (!verdict.ok || !verdict.info) throw new Error(`${file} cannot be used: ${verdict.reason}`);
  const { type, width } = verdict.info;
  if (!args.includes('--as-is') && (width > MAX_WIDTH || data.length > MAX_BYTES)) {
    throw new Error(
      `${file} is ${width} px wide and ${Math.round(data.length / 1000)} kB. Make it at most ${MAX_WIDTH} px wide ` +
        `and ${MAX_BYTES / 1000} kB first (on a Mac: sips --resampleWidth 1600 "${file}"), or add --as-is.`,
    );
  }

  const posts = Object.keys(source.positions ?? {});
  if (posts.length === 0) throw new Error(`The record does not say where ${original} was shown.`);
  const local = `/images/remote/${posts[0]}/${localName(original, type)}`;
  const target = join('public', local);
  if (existsSync(target) && !readFileSync(target).equals(data)) {
    throw new Error(`${target} already exists and is a different file.`);
  }

  // Check every place first, so that nothing is half done if one is wrong.
  const edits = posts.map((post) => {
    const path = fileOf(post);
    let text = readFileSync(path, 'utf8');
    for (const position of source.positions![post]) {
      text = setImageAddress(text, position, PLACEHOLDER, local);
    }
    return { path, text };
  });

  mkdirSync(dirname(target), { recursive: true });
  copyFileSync(file, target);
  for (const { path, text } of edits) writeFileSync(path, text);
  source.local = local;
  source.source = 'google-photos';
  const note = option('--note');
  if (note) source.note = note;
  writeFileSync(SOURCES, `${JSON.stringify(sources, null, 2)}\n`);

  console.log(`${target} (${width} px wide, ${Math.round(statSync(target).size / 1000)} kB)`);
  for (const { path } of edits) console.log(`${path} now shows it.`);
  console.log(`${missing.length - 1} images are still missing. When you are done: npm run build && npm test && npm run test:build`);
}
