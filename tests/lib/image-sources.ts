/** Reads content/image-sources.json, the record of where each old remote image went. */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export interface ImageSource {
  /** The address the post used to show. */
  original: string;
  /** What the post shows now, or null when the image was removed. */
  local: string | null;
  source: 'original' | 'repo' | 'archive' | 'placeholder' | 'removed' | 'google-photos';
  archived?: string;
  reason?: string;
  /** For `removed`: where the links around it led, which went with it. */
  links?: string[];
  /** For `google-photos`: where it was found. */
  note?: string;
  /** The posts that show it, as file names without ".md". */
  posts: string[];
  /** For an image that is or was the placeholder: which image of each post it is. */
  positions?: Record<string, number[]>;
  /** How many times the posts show it. */
  uses: number;
}

export const PLACEHOLDER = '/images/missing-image.svg';

const FILE = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'content', 'image-sources.json');

export function loadImageSources(): ImageSource[] {
  return JSON.parse(readFileSync(FILE, 'utf8')) as ImageSource[];
}
