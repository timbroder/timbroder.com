/**
 * Turns Contentful rich text into HTML.
 *
 * The HTML is the same kind the markdown processor produces (plain
 * paragraphs, headings, lists, the same code blocks), so a post reads and
 * looks the same wherever it was written.
 *
 * Anything the site cannot show stops the build with a message that names
 * it: an entry of an unknown type, something embedded that is not
 * published, a kind of formatting added to Contentful after this was
 * written. Leaving it out quietly would publish a post with a hole in it.
 */
import { BLOCKS, INLINES, MARKS } from '@contentful/rich-text-types';
import type { Block, Document, Inline, Text } from '@contentful/rich-text-types';
import { highlightCode } from '../highlight.ts';
import { ContentError } from '../post-model.ts';
import { CODE_BLOCK_TYPE, isLink, type Asset, type Entry } from './types.ts';

export interface RichTextContext {
  entries: Map<string, Entry>;
  assets: Map<string, Asset>;
  /** The path of a published blog post, by entry id. */
  postUrl: (entryId: string) => string | undefined;
}

type Node = Block | Inline | Text;

/** Pictures wider than this are asked for at this width. A post's column is narrower. */
export const MAX_IMAGE_WIDTH = 1600;

const escapeText = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escapeAttribute = (text: string) => escapeText(text).replace(/"/g, '&quot;');

/** Contentful gives addresses without a scheme: "//images.ctfassets.net/...". */
export const withScheme = (url: string) => (url.startsWith('//') ? `https:${url}` : url);

/** Innermost first. Strikethrough is <del>, as in markdown. */
const MARK_TAGS: [string, string][] = [
  [MARKS.CODE, 'code'],
  [MARKS.SUBSCRIPT, 'sub'],
  [MARKS.SUPERSCRIPT, 'sup'],
  [MARKS.STRIKETHROUGH, 'del'],
  [MARKS.UNDERLINE, 'u'],
  [MARKS.ITALIC, 'em'],
  [MARKS.BOLD, 'strong'],
];

const HEADINGS: Record<string, string> = {
  [BLOCKS.HEADING_1]: 'h1',
  [BLOCKS.HEADING_2]: 'h2',
  [BLOCKS.HEADING_3]: 'h3',
  [BLOCKS.HEADING_4]: 'h4',
  [BLOCKS.HEADING_5]: 'h5',
  [BLOCKS.HEADING_6]: 'h6',
};

const isText = (node: Node): node is Text => node.nodeType === 'text';

/** True for a paragraph with nothing in it. The Contentful editor leaves these around. */
function isEmptyParagraph(node: Node): boolean {
  return (
    node.nodeType === BLOCKS.PARAGRAPH &&
    (node as Block).content.every((child) => isText(child) && child.value.trim() === '')
  );
}

function renderText(node: Text): string {
  // A line break typed with shift and enter.
  let html = escapeText(node.value).replace(/\r?\n/g, '<br>');
  const marks = new Set((node.marks ?? []).map((mark) => mark.type));
  for (const [mark, tag] of MARK_TAGS) {
    if (marks.delete(mark)) html = `<${tag}>${html}</${tag}>`;
  }
  if (marks.size) {
    throw new ContentError(`uses the text style "${[...marks][0]}", which this site cannot show yet`);
  }
  return html;
}

function linkedId(node: Node, what: string): string {
  const target = (node.data as { target?: unknown }).target;
  if (!isLink(target)) throw new ContentError(`has ${what} with nothing in it`);
  return target.sys.id;
}

function findEntry(node: Node, context: RichTextContext): Entry {
  const id = linkedId(node, 'an embedded entry');
  const entry = context.entries.get(id);
  if (!entry) {
    throw new ContentError(
      `embeds an entry that is not published (${id}). Publish it, or take it out of the post`,
    );
  }
  return entry;
}

function findAsset(node: Node, context: RichTextContext): Asset & { fields: { file: NonNullable<Asset['fields']['file']> } } {
  const id = linkedId(node, 'a picture or file');
  const asset = context.assets.get(id);
  if (!asset) {
    throw new ContentError(
      `uses a picture or file that is not published (${id}). Publish it, or take it out of the post`,
    );
  }
  if (!asset.fields.file?.url) {
    throw new ContentError(`uses the asset "${asset.fields.title ?? id}", which has no file`);
  }
  return asset as Asset & { fields: { file: NonNullable<Asset['fields']['file']> } };
}

/** Formats that Contentful's image server can resize. */
const RESIZABLE = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);

/** A picture's address and the size it will be shown at. */
export function imageAddress(file: NonNullable<Asset['fields']['file']>): {
  src: string;
  width?: number;
  height?: number;
} {
  const src = withScheme(file.url);
  const size = file.details?.image;
  if (!size?.width || !size.height) return { src };
  const resizable =
    RESIZABLE.has(file.contentType) && /^https:\/\/images\.ctfassets\.net\//.test(src);
  if (size.width > MAX_IMAGE_WIDTH && resizable) {
    return {
      src: `${src}?w=${MAX_IMAGE_WIDTH}`,
      width: MAX_IMAGE_WIDTH,
      height: Math.round((size.height * MAX_IMAGE_WIDTH) / size.width),
    };
  }
  return { src, width: size.width, height: size.height };
}

/**
 * A picture: the asset's title is its alt text, and its description, when
 * it has one, is shown as a caption. Any other file becomes a link to it.
 */
function renderAsset(node: Node, context: RichTextContext): string {
  const asset = findAsset(node, context);
  const { file } = asset.fields;
  const title = asset.fields.title?.trim() ?? '';
  const description = asset.fields.description?.trim() ?? '';

  if (!file.contentType.startsWith('image/')) {
    const name = title || file.fileName || 'Download';
    return `<p><a href="${escapeAttribute(withScheme(file.url))}">${escapeText(name)}</a></p>`;
  }
  const { src, width, height } = imageAddress(file);
  const size = width && height ? ` width="${width}" height="${height}"` : '';
  const image = `<img src="${escapeAttribute(src)}" alt="${escapeAttribute(title)}"${size} loading="lazy">`;
  const caption = description ? `\n<figcaption>${escapeText(description)}</figcaption>` : '';
  return `<figure>\n${image}${caption}\n</figure>`;
}

function codeOf(entry: Entry): { code: string; language?: string; lineNumbers: boolean } {
  const { code, language, showLineNumbers } = entry.fields;
  if (typeof code !== 'string' || code.trim() === '') {
    throw new ContentError(`embeds a code block with no code in it (${entry.sys.id})`);
  }
  return {
    code,
    language: typeof language === 'string' ? language : undefined,
    lineNumbers: showLineNumbers !== false,
  };
}

function embeddedType(entry: Entry): string {
  return entry.sys.contentType?.sys.id ?? 'unknown';
}

async function renderEntry(node: Node, context: RichTextContext): Promise<string> {
  const entry = findEntry(node, context);
  if (embeddedType(entry) === CODE_BLOCK_TYPE) {
    const { code, language, lineNumbers } = codeOf(entry);
    return highlightCode(code, language, { lineNumbers });
  }
  throw new ContentError(
    `embeds an entry of the type "${embeddedType(entry)}", which this site cannot show`,
  );
}

async function renderInline(nodes: Node[], context: RichTextContext): Promise<string> {
  let html = '';
  for (const node of nodes) {
    if (isText(node)) {
      html += renderText(node);
      continue;
    }
    const inner = () => renderInline((node as Inline).content, context);
    switch (node.nodeType) {
      case INLINES.HYPERLINK: {
        const uri = (node.data as { uri?: unknown }).uri;
        if (typeof uri !== 'string' || uri.trim() === '') {
          throw new ContentError('has a link with no address');
        }
        html += `<a href="${escapeAttribute(uri.trim())}">${await inner()}</a>`;
        break;
      }
      case INLINES.ENTRY_HYPERLINK: {
        const id = linkedId(node, 'a link to an entry');
        const url = context.postUrl(id);
        if (!url) {
          throw new ContentError(`links to an entry that is not a published post (${id})`);
        }
        html += `<a href="${escapeAttribute(url)}">${await inner()}</a>`;
        break;
      }
      case INLINES.ASSET_HYPERLINK: {
        const asset = findAsset(node, context);
        html += `<a href="${escapeAttribute(withScheme(asset.fields.file.url))}">${await inner()}</a>`;
        break;
      }
      case INLINES.EMBEDDED_ENTRY: {
        // A code block placed inside a line of text is shown as inline code.
        const entry = findEntry(node, context);
        if (embeddedType(entry) !== CODE_BLOCK_TYPE) {
          throw new ContentError(
            `embeds an entry of the type "${embeddedType(entry)}", which this site cannot show`,
          );
        }
        html += `<code>${escapeText(codeOf(entry).code)}</code>`;
        break;
      }
      default:
        throw new ContentError(`contains "${node.nodeType}", which this site cannot show yet`);
    }
  }
  return html;
}

/** The blocks inside a list item, quote or table cell, one per line. */
async function renderBlocks(nodes: Node[], context: RichTextContext): Promise<string> {
  const parts: string[] = [];
  for (const node of nodes) {
    const html = await renderBlock(node, context);
    if (html) parts.push(html);
  }
  return parts.join('\n');
}

/**
 * The inside of a list item or table cell. Contentful wraps its text in a
 * paragraph; markdown does not, so a lone paragraph is unwrapped to give
 * the same spacing.
 */
async function renderCompact(nodes: Node[], context: RichTextContext): Promise<string> {
  const blocks = nodes.filter((node) => !isEmptyParagraph(node));
  const [first, ...rest] = blocks;
  const isList = (node: Node) =>
    node.nodeType === BLOCKS.UL_LIST || node.nodeType === BLOCKS.OL_LIST;
  if (first?.nodeType === BLOCKS.PARAGRAPH && rest.every(isList)) {
    const text = await renderInline((first as Block).content, context);
    return rest.length ? `${text}\n${await renderBlocks(rest, context)}\n` : text;
  }
  const html = await renderBlocks(blocks, context);
  return html ? `\n${html}\n` : '';
}

async function renderTable(node: Block, context: RichTextContext): Promise<string> {
  const rows: { header: boolean; html: string }[] = [];
  for (const row of node.content as Block[]) {
    if (row.nodeType !== BLOCKS.TABLE_ROW) {
      throw new ContentError(`has a table that contains "${row.nodeType}"`);
    }
    const cells: string[] = [];
    let header = row.content.length > 0;
    for (const cell of row.content as Block[]) {
      const tag = cell.nodeType === BLOCKS.TABLE_HEADER_CELL ? 'th' : 'td';
      if (tag === 'td') {
        if (cell.nodeType !== BLOCKS.TABLE_CELL) {
          throw new ContentError(`has a table row that contains "${cell.nodeType}"`);
        }
        header = false;
      }
      const span = cell.data as { colspan?: number; rowspan?: number };
      const attributes =
        (Number(span.colspan) > 1 ? ` colspan="${Number(span.colspan)}"` : '') +
        (Number(span.rowspan) > 1 ? ` rowspan="${Number(span.rowspan)}"` : '');
      cells.push(`<${tag}${attributes}>${await renderCompact(cell.content, context)}</${tag}>`);
    }
    rows.push({ header, html: `<tr>${cells.join('')}</tr>` });
  }
  // Rows of header cells at the top are the table's head.
  let headRows = 0;
  while (headRows < rows.length && rows[headRows].header) headRows += 1;
  const section = (tag: string, part: typeof rows) =>
    part.length ? `<${tag}>\n${part.map((row) => row.html).join('\n')}\n</${tag}>\n` : '';
  return `<table>\n${section('thead', rows.slice(0, headRows))}${section('tbody', rows.slice(headRows))}</table>`;
}

async function renderBlock(node: Node, context: RichTextContext): Promise<string> {
  if (isText(node)) return renderText(node);
  const block = node as Block;
  const heading = HEADINGS[node.nodeType];
  if (heading) return `<${heading}>${await renderInline(block.content, context)}</${heading}>`;

  switch (node.nodeType) {
    case BLOCKS.PARAGRAPH:
      return isEmptyParagraph(node) ? '' : `<p>${await renderInline(block.content, context)}</p>`;
    case BLOCKS.UL_LIST:
    case BLOCKS.OL_LIST: {
      const tag = node.nodeType === BLOCKS.UL_LIST ? 'ul' : 'ol';
      const items: string[] = [];
      for (const item of block.content as Block[]) {
        if (item.nodeType !== BLOCKS.LIST_ITEM) {
          throw new ContentError(`has a list that contains "${item.nodeType}"`);
        }
        items.push(`<li>${await renderCompact(item.content, context)}</li>`);
      }
      return `<${tag}>\n${items.join('\n')}\n</${tag}>`;
    }
    case BLOCKS.QUOTE:
      return `<blockquote>\n${await renderBlocks(block.content, context)}\n</blockquote>`;
    case BLOCKS.HR:
      return '<hr>';
    case BLOCKS.EMBEDDED_ASSET:
      return renderAsset(node, context);
    case BLOCKS.EMBEDDED_ENTRY:
      return renderEntry(node, context);
    case BLOCKS.TABLE:
      return renderTable(block, context);
    default:
      throw new ContentError(`contains "${node.nodeType}", which this site cannot show yet`);
  }
}

/** The HTML of a rich text field. Throws a ContentError for what it cannot show. */
export async function renderRichText(document: Document, context: RichTextContext): Promise<string> {
  if (document?.nodeType !== BLOCKS.DOCUMENT || !Array.isArray(document.content)) {
    throw new ContentError('has content that is not rich text');
  }
  return renderBlocks(document.content, context);
}
