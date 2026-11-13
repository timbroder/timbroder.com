/**
 * Turns a page's HTML into plain facts that can be compared.
 *
 * The same extractor runs on the live Gatsby site (to capture the baseline)
 * and on the new build (to compare against it), so it only relies on markup
 * both sides share: semantic elements, `itemprop="articleBody"`, link targets
 * and a few stable class names.
 */
import * as cheerio from 'cheerio';
import type { AnyNode } from 'domhandler';
import { classifyPath, isListType, type PageType } from './urls.ts';

type $ = cheerio.CheerioAPI;
type Sel = cheerio.Cheerio<AnyNode>;

export interface HeadLink {
  rel: string;
  href: string;
  type?: string;
  title?: string;
}

export interface HeadFacts {
  lang: string | null;
  title: string | null;
  description: string | null;
  canonical: string | null;
  og: Record<string, string>;
  twitter: Record<string, string>;
  links: HeadLink[];
  jsonLd: unknown[];
  analytics: boolean;
}

export interface NavItem {
  label: string;
  href: string;
  active: boolean;
}

export interface ChromeFacts {
  heading: string | null;
  nav: NavItem[];
  footerLinks: { label: string; href: string }[];
  footerText: string | null;
}

export interface BodyFacts {
  /** Visible text outside code blocks, whitespace collapsed. */
  text: string;
  headings: { level: number; text: string }[];
  links: string[];
  images: { src: string; alt: string }[];
  /** Text of each code block, in order. */
  code: string[];
  /**
   * Where each paragraph, heading and list item starts and ends: one entry
   * per block, in order, as "path|length|start of its text". The path names
   * the lists and quotes the block sits in, for example "ul>li" or
   * "blockquote>p". See `bodyBlocks`.
   */
  blocks: string[];
  counts: {
    iframes: number;
    objects: number;
    tables: number;
    blockquotes: number;
    lists: number;
  };
}

export interface PostFacts {
  date: string | null;
  dateTime: string | null;
  tags: { label: string; href: string }[];
  category: { label: string; href: string } | null;
  /** Target of the "original article" link on link posts. */
  originalLink: string | null;
  body: BodyFacts;
}

export interface CardFacts {
  title: string;
  href: string;
  date: string | null;
  category: string | null;
  description: string;
  cta: string | null;
}

export interface ListFacts {
  headline: string | null;
  cards: CardFacts[];
  pagination: { text: string; prev: string | null; next: string | null } | null;
}

export interface MainFacts {
  text: string;
  links: { label: string; href: string }[];
  images: { src: string; alt: string }[];
}

export interface PageFacts {
  url: string;
  type: PageType;
  head: HeadFacts;
  chrome: ChromeFacts;
  post?: PostFacts;
  list?: ListFacts;
  main?: MainFacts;
}

/** Collapse whitespace and drop zero-width characters. */
export function normalizeText(s: string): string {
  return s
    .replace(/[​‌‍⁠]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Code keeps its line breaks; only trailing whitespace is trimmed. */
export function normalizeCode(s: string): string {
  return s
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((line) => line.replace(/\s+$/, ''))
    .join('\n')
    .replace(/^\n+|\n+$/g, '');
}

const BLOCK_TAGS = new Set([
  'address', 'article', 'aside', 'blockquote', 'br', 'dd', 'details', 'div',
  'dl', 'dt', 'figcaption', 'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4',
  'h5', 'h6', 'header', 'hr', 'li', 'main', 'nav', 'ol', 'p', 'pre', 'section',
  'summary', 'table', 'tbody', 'td', 'tfoot', 'th', 'thead', 'tr', 'ul',
]);

/**
 * Visible text with a space at every block boundary.
 *
 * Two renderers can differ in the whitespace they leave between block
 * elements ("</p><p>" versus "</p>\n<p>") without any visible difference, so
 * plain `.text()` is not comparable. Spacing between inline elements is kept
 * as written, because there it is visible.
 */
export function blockText(
  $el: Sel,
  skip: readonly string[] = ['script', 'style', 'noscript'],
): string {
  return normalizeText(rawBlockText($el, skip));
}

/** `blockText` before its whitespace is collapsed, for joining pieces. */
function rawBlockText($el: Sel, skip: readonly string[]): string {
  let out = '';
  const walk = (node: AnyNode) => {
    if (node.type === 'text') {
      out += node.data;
      return;
    }
    if (!('children' in node) || !('name' in node)) return;
    if (skip.includes(node.name)) return;
    const block = BLOCK_TAGS.has(node.name);
    if (block) out += ' ';
    for (const child of node.children) walk(child as AnyNode);
    if (block) out += ' ';
  };
  $el.each((_, node) => walk(node));
  return out;
}

const HEAD_LINK_RELS = new Set(['alternate', 'me', 'prev', 'next', 'manifest']);

export function extractHead($: $, html: string): HeadFacts {
  const meta = (selector: string): string | null =>
    $(selector).first().attr('content') ?? null;

  const og: Record<string, string> = {};
  $('meta[property^="og:"]').each((_, el) => {
    const key = $(el).attr('property');
    if (key) og[key] = $(el).attr('content') ?? '';
  });

  const twitter: Record<string, string> = {};
  $('meta[name^="twitter:"]').each((_, el) => {
    const key = $(el).attr('name');
    if (key) twitter[key] = $(el).attr('content') ?? '';
  });

  const links: HeadLink[] = [];
  $('link[rel]').each((_, el) => {
    const rel = ($(el).attr('rel') ?? '').toLowerCase();
    if (!HEAD_LINK_RELS.has(rel)) return;
    const link: HeadLink = { rel, href: $(el).attr('href') ?? '' };
    const type = $(el).attr('type');
    const title = $(el).attr('title');
    if (type) link.type = type;
    if (title) link.title = title;
    links.push(link);
  });
  links.sort((a, b) =>
    `${a.rel} ${a.href}`.localeCompare(`${b.rel} ${b.href}`),
  );

  const jsonLd: unknown[] = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    const raw = $(el).text();
    try {
      jsonLd.push(JSON.parse(raw));
    } catch {
      jsonLd.push(raw);
    }
  });

  const title = $('head title').first().text();

  return {
    lang: $('html').attr('lang') ?? null,
    title: title ? normalizeText(title) : null,
    description: meta('meta[name="description"]'),
    canonical: $('link[rel="canonical"]').first().attr('href') ?? null,
    og,
    twitter,
    links,
    jsonLd,
    analytics: /googletagmanager\.com\/gtag|G-L8N53HMK1R/.test(html),
  };
}

function hasClass($el: Sel, token: string): boolean {
  return ($el.attr('class') ?? '').split(/\s+/).includes(token);
}

export function extractChrome($: $): ChromeFacts {
  // The main navigation is the first list that links to the About page.
  const navList = $('ul')
    .filter((_, el) => $(el).find('a[href="/about/"]').length > 0)
    .first();
  const nav: NavItem[] = [];
  navList.find('li > a').each((_, el) => {
    const $a = $(el);
    nav.push({
      label: normalizeText($a.text()),
      href: $a.attr('href') ?? '',
      active:
        $a.attr('aria-current') === 'page' || hasClass($a, 'text-teal-500'),
    });
  });

  // The site footer is the last <footer> that is not part of an article.
  const footer = $('footer')
    .filter((_, el) => $(el).parents('article').length === 0)
    .last();
  const footerLinks: { label: string; href: string }[] = [];
  footer.find('a').each((_, el) => {
    footerLinks.push({
      label: normalizeText($(el).text()),
      href: $(el).attr('href') ?? '',
    });
  });
  const footerText = blockText(footer.find('p').last());
  const heading = blockText($('h1').first());

  return {
    heading: heading || null,
    nav,
    footerLinks,
    footerText: footerText || null,
  };
}

/** The real source of an image, ignoring inline placeholder data URLs. */
function imageSrc($img: Sel): string | null {
  const candidates = [$img.attr('src'), $img.attr('data-src')];
  return candidates.find((src) => src && !src.startsWith('data:')) ?? null;
}

/** Elements that hold blocks. Their own name becomes part of the path. */
const CONTAINERS = new Set(['ul', 'ol', 'li', 'blockquote', 'dl', 'dd', 'table', 'tr', 'td', 'th']);
/** Wrappers with no meaning of their own; blocks inside count as if unwrapped. */
const TRANSPARENT = new Set(['div', 'section', 'article', 'tbody', 'thead', 'tfoot', 'center', 'figure']);
const BLOCK_START = 24;

/**
 * The block structure of a post body.
 *
 * `text` proves the words are the same; this proves they are in the same
 * paragraphs and list items. Each entry is "path|length|start", where path
 * is the chain of lists and quotes around the block, ending in what the
 * block is.
 *
 * Two things that make no visible difference are left out. A list item
 * reads "ul>li" whether or not its text is wrapped in a paragraph (a
 * "loose" list). A second paragraph in the same item reads "ul>li+".
 * Code blocks are an entry with no text, since `code` compares theirs.
 */
export function bodyBlocks($: $, $body: Sel): string[] {
  const blocks: string[] = [];
  const add = (path: string, text: string) => {
    const clean = normalizeText(text);
    if (clean) blocks.push(`${path}|${clean.length}|${clean.slice(0, BLOCK_START)}`);
  };

  /**
   * Walks the children of `node`, which lies in the container at `path`.
   * `item` is shared with a wrapper <div> inside a list item, so a block in
   * the wrapper still knows whether it is the first in its item.
   */
  const walk = (node: AnyNode, path: string[], item = { first: true }) => {
    if (!('children' in node)) return;
    const inItem = path.at(-1) === 'li';
    /** The path of a block of this kind, lying directly in the container. */
    const here = (kind: string) => {
      if (!inItem) return [...path, kind].join('>');
      const own = [...path.slice(0, -1), item.first ? 'li' : 'li+'];
      item.first = false;
      return (kind === 'p' || kind === 'text' ? own : [...own, kind]).join('>');
    };
    // Text and inline elements lying directly in the container form one block.
    let loose = '';
    const flush = () => {
      if (normalizeText(loose)) add(here('text'), loose);
      loose = '';
    };

    for (const child of node.children as AnyNode[]) {
      if (child.type === 'text') {
        loose += child.data;
        continue;
      }
      if (!('name' in child)) continue;
      const name = child.name;
      if (name === 'script' || name === 'style' || name === 'noscript') continue;
      if (name === 'pre') {
        flush();
        blocks.push(`${here('pre')}|0|`);
      } else if (CONTAINERS.has(name)) {
        flush();
        if (inItem) item.first = false;
        walk(child, [...path, name]);
      } else if (TRANSPARENT.has(name)) {
        flush();
        walk(child, path, item);
      } else if (name === 'br') {
        loose += ' ';
      } else if (BLOCK_TAGS.has(name)) {
        flush();
        add(here(name), blockText($(child), ['pre', 'script', 'style', 'noscript']));
      } else {
        // Not collapsed yet: a space at the edge of a link is part of the sentence.
        loose += rawBlockText($(child), ['script', 'style', 'noscript']);
      }
    }
    flush();
  };

  $body.each((_, node) => walk(node, []));
  return blocks;
}

export function extractBody($: $, $body: Sel): BodyFacts {
  const code: string[] = [];
  $body.find('pre').each((_, el) => {
    const $pre = $(el);
    const $code = $pre.find('code').first();
    code.push(normalizeCode(($code.length ? $code : $pre).text()));
  });

  const headings: { level: number; text: string }[] = [];
  $body.find('h1, h2, h3, h4, h5, h6').each((_, el) => {
    headings.push({
      level: Number(el.tagName[1]),
      text: blockText($(el)),
    });
  });

  const links: string[] = [];
  $body.find('a[href]').each((_, el) => {
    links.push($(el).attr('href') ?? '');
  });

  const images: { src: string; alt: string }[] = [];
  $body.find('img').each((_, el) => {
    if ($(el).parents('noscript').length) return;
    const src = imageSrc($(el));
    if (src) images.push({ src, alt: $(el).attr('alt') ?? '' });
  });

  const counts = {
    iframes: $body.find('iframe').length,
    objects: $body.find('object, embed').length,
    tables: $body.find('table').length,
    blockquotes: $body.find('blockquote').length,
    lists: $body.find('ul, ol').length,
  };

  return {
    text: blockText($body, ['pre', 'script', 'style', 'noscript']),
    headings,
    links,
    images,
    code,
    blocks: bodyBlocks($, $body),
    counts,
  };
}

export function extractPost($: $): PostFacts {
  const $article = $('main article').first();
  const $scope = $article.length ? $article : $('main').first();
  const $time = $scope.find('header time').first();
  const $footer = $scope.children('footer').first();

  const tags: { label: string; href: string }[] = [];
  $footer.find('a[href^="/tag/"]').each((_, el) => {
    tags.push({
      label: normalizeText($(el).text()),
      href: $(el).attr('href') ?? '',
    });
  });

  const $category = $footer.find('a[href^="/category/"]').first();
  const category = $category.length
    ? {
        label: normalizeText($category.text()).replace(/^Category:\s*/, ''),
        href: $category.attr('href') ?? '',
      }
    : null;

  const $body = $scope.find('[itemprop="articleBody"]').first();

  // Link posts put "Check out the original article." just above the body.
  let originalLink: string | null = null;
  $body
    .prevAll('p')
    .find('a')
    .each((_, el) => {
      if (/original article/i.test($(el).text())) {
        originalLink = $(el).attr('href') ?? null;
      }
    });

  return {
    date: $time.length ? normalizeText($time.text()) : null,
    dateTime: $time.attr('datetime') ?? null,
    tags,
    category,
    originalLink,
    body: extractBody($, $body),
  };
}

export function extractCard($: $, $card: Sel): CardFacts {
  const $title = $card.find('h2').first();
  const $time = $card.find('time').first();

  let category: string | null = null;
  $time.find('span').each((_, el) => {
    const text = normalizeText($(el).text());
    const m = text.match(/^in\s+(.+)$/);
    if (m) category = m[1];
  });

  const $cta = $card.find('div[aria-hidden="true"]').first();

  return {
    title: blockText($title),
    href: $title.find('a').first().attr('href') ?? '',
    date: $time.attr('datetime') ?? null,
    category,
    description: blockText($card.find('p').first()),
    cta: $cta.length ? blockText($cta) : null,
  };
}

export function extractList($: $): ListFacts {
  const $main = $('main').first();
  const headline = blockText($main.find('h1').first());

  const cards: CardFacts[] = [];
  $main.find('article').each((_, el) => {
    cards.push(extractCard($, $(el)));
  });

  const $pagination = $main.find('nav[aria-label="Pagination"]').first();
  const pagination = $pagination.length
    ? {
        text: blockText($pagination),
        prev: $pagination.find('a[rel="prev"]').attr('href') ?? null,
        next: $pagination.find('a[rel="next"]').attr('href') ?? null,
      }
    : null;

  return {
    headline: headline || null,
    cards,
    pagination,
  };
}

export function extractMain($: $): MainFacts {
  const $main = $('main').first();
  const links: { label: string; href: string }[] = [];
  $main.find('a[href]').each((_, el) => {
    links.push({
      label: blockText($(el)),
      href: $(el).attr('href') ?? '',
    });
  });
  const images: { src: string; alt: string }[] = [];
  $main.find('img').each((_, el) => {
    if ($(el).parents('noscript').length) return;
    const src = imageSrc($(el));
    if (src) images.push({ src, alt: $(el).attr('alt') ?? '' });
  });
  return { text: blockText($main), links, images };
}

/** Extract everything we compare for one page. */
export function extractPage(url: string, html: string): PageFacts {
  const $ = cheerio.load(html);
  const type = classifyPath(url);
  const facts: PageFacts = {
    url,
    type,
    head: extractHead($, html),
    chrome: extractChrome($),
  };

  if (isListType(type)) {
    facts.list = extractList($);
  } else if ($('[itemprop="articleBody"]').length) {
    // Posts and markdown pages share the same body component.
    facts.post = extractPost($);
  } else {
    facts.main = extractMain($);
  }
  return facts;
}

export interface FeedItem {
  guid: string;
  link: string;
  title: string;
  pubDate: string | null;
  descriptionLength: number;
  contentLength: number;
}

export interface FeedFacts {
  title: string;
  description: string;
  link: string;
  items: FeedItem[];
}

export function extractFeed(xml: string): FeedFacts {
  const $ = cheerio.load(xml, { xml: true });
  const $channel = $('channel').first();
  const items: FeedItem[] = [];
  $channel.find('item').each((_, el) => {
    const $item = $(el);
    const pubDate = $item.children('pubDate').text();
    const parsed = pubDate ? new Date(pubDate) : null;
    items.push({
      guid: $item.children('guid').text().trim(),
      link: $item.children('link').text().trim(),
      title: normalizeText($item.children('title').text()),
      pubDate:
        parsed && !Number.isNaN(parsed.getTime()) ? parsed.toISOString() : null,
      descriptionLength: $item.children('description').text().length,
      contentLength: $item.children('content\\:encoded').text().length,
    });
  });
  return {
    title: normalizeText($channel.children('title').text()),
    description: normalizeText($channel.children('description').text()),
    link: $channel.children('link').first().text().trim(),
    items,
  };
}
