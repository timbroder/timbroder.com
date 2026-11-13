/**
 * Shared by the image scripts: finding image references in the markdown
 * sources, and telling a real picture from the junk an old image URL can
 * return.
 */
import { createHash } from 'node:crypto';
import { readdirSync } from 'node:fs';
import { basename, join } from 'node:path';

export const CONTENT_DIRS = ['content/blog', 'content/pages'];

/** Every markdown file with content, as a path from the repo root. */
export function contentFiles(): string[] {
  return CONTENT_DIRS.flatMap((dir) =>
    readdirSync(dir)
      .filter((name) => name.endsWith('.md'))
      .sort()
      .map((name) => join(dir, name)),
  );
}

/** "2019-09-07-small-wins" for "content/blog/2019-09-07-small-wins.md". */
export const stemOf = (file: string) => basename(file, '.md');

/**
 * Blanks out fenced code and inline code, keeping every other character
 * where it was, so nothing inside code is taken for an image and positions
 * still line up with the original text.
 */
export function maskCode(source: string): string {
  const blank = (text: string) => text.replace(/[^\n]/g, ' ');
  return (
    source
      // A fence may be indented. A line like "```ls -la```" is not one: the
      // text after an opening fence cannot contain a backtick.
      .replace(/^[ \t]*(`{3,})[^`\n]*\n[\s\S]*?\n[ \t]*\1`*[ \t]*$/gm, blank)
      .replace(/^[ \t]*(~{3,})[^\n]*\n[\s\S]*?\n[ \t]*\1~*[ \t]*$/gm, blank)
      .replace(/`[^`\n]+`/g, blank)
  );
}

export interface ImageRef {
  url: string;
  alt: string;
  /** Where the URL starts and ends in the source. */
  start: number;
  end: number;
}

/** A URL inside "(...)": no spaces, and brackets only in matched pairs. */
const URL_IN_BRACKETS = String.raw`(?:[^()\s]|\([^()\s]*\))+`;
const IMAGE = new RegExp(
  String.raw`!\[([^\]]*)\]\(\s*(${URL_IN_BRACKETS})(?:\s+"[^"]*")?\s*\)`,
  'g',
);

/**
 * Markdown images outside code: `![alt](url)`, and `![alt][name]` with its
 * address given elsewhere as `[name]: url`.
 */
export function imageRefs(source: string): ImageRef[] {
  const masked = maskCode(source);
  const refs: ImageRef[] = [];
  for (const match of masked.matchAll(IMAGE)) {
    const start = match.index + match[0].indexOf(match[2], match[1].length + 3);
    refs.push({ url: match[2], alt: match[1], start, end: start + match[2].length });
  }
  for (const match of masked.matchAll(/!\[([^\]]*)\]\[([^\]]+)\]/g)) {
    const name = match[2].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const definition = masked.match(new RegExp(`^[ \\t]*\\[${name}\\]:[ \\t]*<?([^\\s>]+)`, 'im'));
    if (!definition || definition.index === undefined) continue;
    const start = definition.index + definition[0].lastIndexOf(definition[1]);
    refs.push({ url: definition[1], alt: match[1], start, end: start + definition[1].length });
  }
  return refs.sort((a, b) => a.start - b.start);
}

export const isRemote = (url: string) => /^(https?:)?\/\//i.test(url);

/**
 * Points the image at `position` in a markdown source (counting from 1) at
 * another address. It refuses unless that image now has the address
 * `expected`, so the wrong picture cannot be replaced by a slip of the
 * count.
 */
export function setImageAddress(
  source: string,
  position: number,
  expected: string,
  replacement: string,
): string {
  const ref = imageRefs(source)[position - 1];
  if (!ref) throw new Error(`There is no image ${position}`);
  if (ref.url !== expected) {
    throw new Error(`Image ${position} is ${ref.url}, not ${expected}`);
  }
  return source.slice(0, ref.start) + replacement + source.slice(ref.end);
}

/**
 * The file name a copy of a remote image gets: its own name from the
 * address, made safe, with the extension its content calls for.
 */
export function localName(url: string, type: string): string {
  const address = new URL(url.startsWith('//') ? `https:${url}` : url);
  let raw = address.pathname.split('/').pop() || 'image';
  try {
    raw = decodeURIComponent(raw);
  } catch {
    // Keep the name as written.
  }
  const dot = raw.lastIndexOf('.');
  const stem = (dot > 0 ? raw.slice(0, dot) : raw).replace(/[^A-Za-z0-9._-]+/g, '-') || 'image';
  return `${stem}.${type}`;
}

export interface ImageInfo {
  type: 'png' | 'jpg' | 'gif' | 'webp' | 'bmp' | 'svg';
  width: number;
  height: number;
}

/**
 * Reads the type and size of an image from its first bytes, or returns null
 * when the bytes are not an image (an error page saved as "photo.png").
 */
export function inspectImage(data: Buffer): ImageInfo | null {
  if (data.length >= 24 && data.readUInt32BE(0) === 0x89504e47) {
    return { type: 'png', width: data.readUInt32BE(16), height: data.readUInt32BE(20) };
  }
  if (data.length >= 10 && data.toString('latin1', 0, 3) === 'GIF') {
    return { type: 'gif', width: data.readUInt16LE(6), height: data.readUInt16LE(8) };
  }
  if (data.length >= 26 && data.toString('latin1', 0, 2) === 'BM') {
    return { type: 'bmp', width: data.readInt32LE(18), height: Math.abs(data.readInt32LE(22)) };
  }
  if (
    data.length >= 30 &&
    data.toString('latin1', 0, 4) === 'RIFF' &&
    data.toString('latin1', 8, 12) === 'WEBP'
  ) {
    const kind = data.toString('latin1', 12, 16);
    if (kind === 'VP8X') {
      return { type: 'webp', width: 1 + data.readUIntLE(24, 3), height: 1 + data.readUIntLE(27, 3) };
    }
    if (kind === 'VP8 ') {
      return {
        type: 'webp',
        width: data.readUInt16LE(26) & 0x3fff,
        height: data.readUInt16LE(28) & 0x3fff,
      };
    }
    if (kind === 'VP8L') {
      const bits = data.readUInt32LE(21);
      return { type: 'webp', width: 1 + (bits & 0x3fff), height: 1 + ((bits >> 14) & 0x3fff) };
    }
    return null;
  }
  if (data.length >= 4 && data[0] === 0xff && data[1] === 0xd8) {
    // JPEG: walk the segments to the frame header, which holds the size.
    let at = 2;
    while (at + 9 < data.length) {
      if (data[at] !== 0xff) return null;
      const marker = data[at + 1];
      if (marker === 0xff) {
        at += 1;
        continue;
      }
      const isFrame =
        marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
      if (isFrame) {
        return { type: 'jpg', width: data.readUInt16BE(at + 7), height: data.readUInt16BE(at + 5) };
      }
      at += 2 + data.readUInt16BE(at + 2);
    }
    return null;
  }
  const head = data.toString('utf8', 0, 512).trimStart();
  if (head.startsWith('<svg') || (head.startsWith('<?xml') && head.includes('<svg'))) {
    return { type: 'svg', width: 0, height: 0 };
  }
  return null;
}

export const sha1 = (data: Buffer) => createHash('sha1').update(data).digest('hex');

/**
 * Pictures a host sends in place of one it no longer has. They are valid
 * images, so they have to be recognised by their content.
 */
export const STAND_INS: Record<string, string> = {
  '1131f49b8ee9d350dc7a91f28ac83b1698884c0b': "Google's grey warning triangle, 200x200",
  '3f141167dc72a5e33dc786b3b7b3f2f94a76bdbb': "Google's grey warning triangle, 160x160",
  '10f3f7f79e6528aa9d828316248997568ac0d833': 'Flickr\'s "This photo is no longer available"',
};

export interface Verdict {
  ok: boolean;
  /** Why the bytes were turned down. */
  reason?: string;
  info?: ImageInfo;
  sha1: string;
}

/** Decides whether downloaded bytes are a real picture worth keeping. */
export function judge(data: Buffer, standIns: Record<string, string> = STAND_INS): Verdict {
  const hash = sha1(data);
  const info = inspectImage(data);
  if (!info) return { ok: false, reason: 'not an image', sha1: hash };
  if (standIns[hash]) return { ok: false, reason: `stand-in: ${standIns[hash]}`, info, sha1: hash };
  if (info.type !== 'svg' && info.width * info.height <= 4) {
    return { ok: false, reason: `tracking pixel (${info.width}x${info.height})`, info, sha1: hash };
  }
  return { ok: true, info, sha1: hash };
}
