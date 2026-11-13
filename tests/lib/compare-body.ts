/**
 * Helpers for comparing a post body on the new site with the live one (R6).
 *
 * Two kinds of difference are improvements, and each can be recognised
 * exactly, so the test can allow them without allowing anything else:
 *
 *  - A link or picture the live site shows as raw markdown, because the
 *    export split its address across lines, is now a link or a picture.
 *    `sameOnceRendered` accepts exactly that change.
 *
 *  - A wrapped line that the live site pushed out of its list item or quote
 *    into a paragraph of its own now stays where it belongs.
 *    `joinWrappedLines` moves it back in the live block list.
 */

const ADDRESS = String.raw`\((?:[^()]|\([^()]*\))*\)`;
/** At the start of a string: a linked picture, a picture, or a link, as raw markdown. */
const RAW = [
  // [![alt](picture)](target): nothing is left to read once it renders.
  { pattern: new RegExp(String.raw`^\[!\[[^\]]*\]${ADDRESS}\]${ADDRESS}`), rendered: () => '' },
  { pattern: new RegExp(String.raw`^!\[[^\]]*\]${ADDRESS}`), rendered: () => '' },
  // [text](target): the text is left.
  {
    pattern: new RegExp(String.raw`^\[([^\[\]]*)\]${ADDRESS}`),
    rendered: (match: RegExpMatchArray) => match[1],
  },
];

/**
 * True when `built` reads the same as `live` once some of the raw markdown
 * links and pictures in `live` are rendered: "[here](http://example.com/a-
 * b)" may have become "here", and a picture may have become nothing.
 *
 * Each raw link or picture may be rendered or still raw; nothing else may
 * differ. Spaces are ignored, because a picture that disappears from the
 * text takes the space around it along.
 */
export function sameOnceRendered(live: string, built: string): boolean {
  const squeeze = (text: string) => text.replace(/\s+/g, '');
  const to = squeeze(built);
  let i = 0;
  let j = 0;
  while (i < live.length) {
    if (/\s/.test(live[i])) {
      i += 1;
      continue;
    }
    // Raw markdown is looked for in the text as written: without its
    // spaces, "me! [a link](...)" would look like a picture.
    const rest = live.slice(i);
    const found =
      rest[0] === '[' || rest[0] === '!'
        ? RAW.map((raw) => ({ raw, match: rest.match(raw.pattern) })).find((x) => x.match)
        : undefined;
    if (found?.match) {
      const whole = squeeze(found.match[0]);
      const text = squeeze(found.raw.rendered(found.match));
      if (to.startsWith(whole, j)) j += whole.length; // still raw on the new site
      else if (to.startsWith(text, j)) j += text.length;
      else return false;
      i += found.match[0].length;
      continue;
    }
    if (live[i] !== to[j]) return false;
    i += 1;
    j += 1;
  }
  return j === to.length;
}

/** The addresses of raw markdown links and pictures in a text, spaces removed. */
export function rawAddresses(text: string): string[] {
  const found: string[] = [];
  for (const match of text.matchAll(/\]\(((?:[^()]|\([^()]*\))*)\)/g)) {
    const address = match[1].replace(/\s+"[^"]*"\s*$/, '').replace(/\s+/g, '');
    if (address) found.push(address);
  }
  return found;
}

interface Block {
  path: string;
  length: number;
  start: string;
}

function parse(block: string): Block {
  const [path, length, ...start] = block.split('|');
  return { path, length: Number(length), start: start.join('|') };
}

/**
 * Rewrites the live block list as if wrapped lines had stayed in their list
 * item or quote, wherever the new site has exactly that: the same block,
 * longer by one space and the paragraph that follows it on the live site.
 *
 * Returns the rewritten list and how many lines were moved back.
 */
export function joinWrappedLines(live: string[], built: string[]): { blocks: string[]; joined: number } {
  const blocks: string[] = [];
  let joined = 0;
  let at = 0;
  for (let i = 0; i < live.length; i += 1) {
    const mine = parse(live[i]);
    const theirs = built[at] ? parse(built[at]) : null;
    const next = live[i + 1] ? parse(live[i + 1]) : null;
    const inside = mine.path !== 'p' && !mine.path.endsWith('>pre') && mine.path !== 'pre';
    if (
      theirs &&
      next &&
      live[i] !== built[at] &&
      inside &&
      next.path === 'p' &&
      theirs.path === mine.path &&
      theirs.start === mine.start &&
      theirs.length === mine.length + 1 + next.length
    ) {
      blocks.push(built[at]);
      joined += 1;
      i += 1;
    } else {
      blocks.push(live[i]);
    }
    at += 1;
  }
  return { blocks, joined };
}

/** The parts of a post body the comparison reads. Matches BodyFacts in extract.ts. */
interface Body {
  text: string;
  headings: { level: number; text: string }[];
  links: string[];
  images: { src: string; alt: string }[];
  code: string[];
  blocks: string[];
  counts: { iframes: number; objects: number; tables: number; blockquotes: number; lists: number };
}

/** What stage 5 did to the old remote images, as far as a comparison needs. */
export interface ImageChanges {
  /** Addresses of images that were taken out of the posts. */
  removed: Set<string>;
  /** Where links around removed images led. They went with the image. */
  removedLinks: Set<string>;
  /** Addresses of images that now have a local copy or the placeholder. */
  replaced: Set<string>;
}

export interface BodyComparison {
  /** The text differs, and only by raw markdown that now renders. */
  nowRendered: boolean;
  /** How many wrapped lines stay in their list item or quote. */
  wrappedLines: number;
  /** Every difference that is neither of those. */
  problems: string[];
}

/** The addresses this blog has had. A link to one is now a link within the site. */
const OWN_HOSTS = /^https?:\/\/(?:www\.)?(timbroder\.com|blog\.gpowered\.net|gpowered\.blogspot\.com)(?=[/?#]|$)/i;

const squeeze = (text: string) => text.replace(/\s+/g, '');

/** What is in `a` and not in `b`, counting repeats. */
function without<T>(a: T[], b: T[]): T[] {
  const left = new Map<T, number>();
  for (const item of b) left.set(item, (left.get(item) ?? 0) + 1);
  return a.filter((item) => {
    const n = left.get(item) ?? 0;
    if (n > 0) left.set(item, n - 1);
    return n === 0;
  });
}

/** The addresses of the raw markdown pictures in a text, spaces removed. */
function rawPictures(text: string): string[] {
  return [...text.matchAll(/!\[[^\]]*\]\(((?:[^()]|\([^()]*\))*)\)/g)].map((match) =>
    squeeze(match[1].replace(/\s+"[^"]*"\s*$/, '')),
  );
}

/**
 * Compares a post body on the new site with the live one.
 *
 * Two kinds of difference are recognised and reported, not treated as
 * problems: raw markdown that now renders, and wrapped lines that stay in
 * their list item or quote. Everything else is a problem.
 */
export function compareBodies(live: Body, now: Body, images: ImageChanges): BodyComparison {
  const problems: string[] = [];
  const short = (value: unknown) => JSON.stringify(value).slice(0, 300);

  // Text.
  const differs = live.text !== now.text;
  const nowRendered = differs && sameOnceRendered(live.text, now.text);
  if (differs && !nowRendered) {
    let at = 0;
    while (at < live.text.length && live.text[at] === now.text[at]) at += 1;
    const from = Math.max(0, at - 40);
    problems.push(
      `text differs:\n      live: ${short(live.text.slice(from, at + 100))}\n      now:  ${short(now.text.slice(from, at + 100))}`,
    );
  }

  // Headings.
  const sameHeadings =
    live.headings.length === now.headings.length &&
    live.headings.every(
      (heading, i) =>
        heading.level === now.headings[i].level &&
        (heading.text === now.headings[i].text ||
          (nowRendered && sameOnceRendered(heading.text, now.headings[i].text))),
    );
  if (!sameHeadings) {
    problems.push(`headings differ:\n      live: ${short(live.headings)}\n      now:  ${short(now.headings)}`);
  }

  // Code.
  if (JSON.stringify(live.code) !== JSON.stringify(now.code)) {
    problems.push(`code differs (${live.code.length} blocks on the live site, ${now.code.length} now)`);
  }

  // Embeds and tables.
  for (const kind of ['iframes', 'objects', 'tables'] as const) {
    if (live.counts[kind] !== now.counts[kind]) {
      problems.push(`${kind}: ${live.counts[kind]} on the live site, ${now.counts[kind]} now`);
    }
  }

  // Paragraphs, list items and quotes.
  const { blocks, joined } = joinWrappedLines(live.blocks, now.blocks);
  if (!differs && JSON.stringify(blocks) !== JSON.stringify(now.blocks)) {
    let at = 0;
    while (at < blocks.length && blocks[at] === now.blocks[at]) at += 1;
    problems.push(
      `paragraphs and lists differ, from block ${at}:\n      live: ${short(blocks.slice(at, at + 3))}\n      now:  ${short(now.blocks.slice(at, at + 3))}`,
    );
  }
  for (const kind of ['lists', 'blockquotes'] as const) {
    const fewer = live.counts[kind] - now.counts[kind];
    // A wrapped line that stays in its item joins the two halves of a list
    // the live site had split. Where raw markdown now renders, the block
    // list cannot say how many lines were joined, so any number may be.
    const allowed = differs ? Infinity : joined;
    if (fewer < 0 || fewer > allowed) {
      problems.push(`${kind}: ${live.counts[kind]} on the live site, ${now.counts[kind]} now`);
    }
  }

  // Links. The Gatsby site dropped "index.html" from the end of an address.
  const plain = (link: string) => link.replace(/\/index\.html$/, '/');
  const liveLinks = live.links.map(plain);
  const nowLinks = now.links.map(plain);
  const liveRaw = rawAddresses(live.text).map(plain);
  const gone = without(liveLinks, nowLinks).filter(
    (link) =>
      !link.startsWith('/static/') && // the Gatsby image plugin's link to the full-size file
      !OWN_HOSTS.test(link) && // now a link within the site
      !images.removedLinks.has(link) &&
      !images.replaced.has(link) && // a link to a picture that is now local
      // The first piece of an address that was split across lines: the
      // live site made a link of that piece alone.
      !liveRaw.some((address) => address !== link && address.startsWith(link)),
  );
  const added = without(nowLinks, liveLinks).filter(
    (link) =>
      !(link.startsWith('/') && !link.startsWith('//')) && // within the site; R16 checks these
      !liveRaw.includes(squeeze(link)), // raw markdown on the live site
  );
  if (gone.length) problems.push(`links gone: ${short(gone)}`);
  if (added.length) problems.push(`links added: ${short(added)}`);

  // Pictures.
  const removedThen = live.images.filter((image) => images.removed.has(image.src)).length;
  const renderedNow = without(rawPictures(live.text), rawPictures(now.text)).filter(
    (address) => !images.removed.has(address),
  ).length;
  const expected = live.images.length - removedThen + renderedNow;
  if (now.images.length !== expected) {
    problems.push(
      `pictures: ${now.images.length} now, expected ${expected} (${live.images.length} on the live site, ` +
        `${removedThen} removed, ${renderedNow} that were raw markdown)`,
    );
  }

  return { nowRendered, wrappedLines: joined, problems };
}
