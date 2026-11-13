/**
 * The plain-text summary of a post, used on cards and in the page
 * description when a post has no `description:` of its own.
 *
 * This follows the Gatsby site's rule closely, because the same text has
 * been in search results and link previews for years: take the text of the
 * post, leave out code and blocks of raw HTML, and cut it at about
 * 512 characters without splitting a word.
 */
import * as cheerio from 'cheerio';
import type { AnyNode, Element } from 'domhandler';

export const EXCERPT_LENGTH = 512;

/** Elements markdown itself produces. Anything else was raw HTML in the post. */
const MARKDOWN_TAGS = new Set([
  'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'em', 'strong', 'code', 'pre',
  'blockquote', 'ul', 'ol', 'li', 'img', 'br', 'hr', 'table', 'thead', 'tbody',
  'tr', 'th', 'td', 'del', 'input', 'sup', 'section',
]);

/** Elements that only hold other blocks, so stray whitespace in them is not text. */
const BLOCK_CONTAINERS = new Set([
  'ul', 'ol', 'blockquote', 'table', 'thead', 'tbody', 'tr', 'section',
]);

/** Each of these starts with a space, which is what separates paragraphs. */
const SPACED = new Set(['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'td', 'th', 'br']);

const BLOCK_CHILDREN = new Set(['p', 'ul', 'ol', 'pre', 'blockquote', 'table']);

const isElement = (node: AnyNode): node is Element =>
  node.type === 'tag' || node.type === 'script' || node.type === 'style';

function holdsBlocks(el: Element): boolean {
  if (BLOCK_CONTAINERS.has(el.name)) return true;
  // A list item holds blocks when its content is wrapped in paragraphs.
  return el.name === 'li' && el.children.some((c) => isElement(c) && BLOCK_CHILDREN.has(c.name));
}

/**
 * True for an image that was hosted elsewhere when the Gatsby site took its
 * summaries. That includes the old posts' images that have since been
 * copied into /images/remote/, and the placeholder that stands in for the
 * ones that could not be recovered: their summaries should not change
 * because the picture moved.
 */
export function wasHostedElsewhere(src: string): boolean {
  return (
    /^(https?:)?\/\//.test(src) ||
    src.startsWith('/images/remote/') ||
    src === '/images/missing-image.svg'
  );
}

/** The text of rendered post HTML, the way the Gatsby site collected it. */
export function plainText(html: string): string {
  const $ = cheerio.load(html, null, false);
  const parts: string[] = [];

  const walk = (node: AnyNode, parent: Element | null) => {
    if (node.type === 'text') {
      const betweenBlocks = parent === null || holdsBlocks(parent);
      if (betweenBlocks && node.data.trim() === '') return;
      parts.push(node.data);
      return;
    }
    if (!isElement(node)) return;
    const name = node.name;

    // Code is left out, inline code included: the Gatsby site's highlighter
    // turned every piece of code into raw HTML before the summary was taken.
    if (name === 'pre' || name === 'code' || name === 'script' || name === 'style') return;
    // An image hosted elsewhere contributes its alt text. An image served
    // from this site does not: the Gatsby site's image plugin turned those
    // into raw HTML before the summary was taken.
    if (name === 'img') {
      if (wasHostedElsewhere(node.attribs.src ?? '')) parts.push(node.attribs.alt ?? '');
      return;
    }
    if (!MARKDOWN_TAGS.has(name)) {
      // Raw HTML. A whole block of it (a <div>, an embed) was left out; a
      // tag inside a sentence (<b>word</b>) kept its text.
      const isBlock = parent === null || holdsBlocks(parent);
      if (isBlock) return;
    }
    if (SPACED.has(name)) parts.push(' ');
    // A list item whose text is not wrapped in a paragraph still counts as one.
    if (name === 'li' && !node.children.some((c) => isElement(c) && c.name === 'p')) {
      parts.push(' ');
    }
    for (const child of node.children) walk(child, node);
  };

  for (const node of $.root().contents().toArray()) walk(node, null);
  return parts.join('').trim();
}

/**
 * Cut text to about `length` characters without splitting a word, and add
 * an ellipsis. This is underscore.string's `prune`, which the Gatsby site
 * used, kept exact so summaries come out the same.
 */
export function prune(text: string, length: number, ending = '…'): string {
  if (text.length <= length) return text;
  const toTemplate = (c: string) => (c.toUpperCase() !== c.toLowerCase() ? 'A' : ' ');
  let template = text.slice(0, length + 1).replace(/.(?=\W*\w*$)/g, toTemplate);
  if (/\w\w/.test(template.slice(template.length - 2))) {
    template = template.replace(/\s*\S+$/, '');
  } else {
    template = template.slice(0, template.length - 1).replace(/\s+$/, '');
  }
  return (template + ending).length > text.length
    ? text
    : text.slice(0, template.length) + ending;
}

export function excerpt(html: string, length = EXCERPT_LENGTH): string {
  return prune(plainText(html), length);
}
