/**
 * Addresses of files in public/ that a browser must not serve stale.
 *
 * A browser keeps a site's tab icon for a long time and goes by its
 * address. Each icon's address therefore carries a short fingerprint of the
 * file, so a new picture has a new address and shows straight away.
 */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const cache = new Map<string, string>();

/** "/icons/icon-32.png?v=1a2b3c4d" for the file public/icons/icon-32.png. */
export function fingerprinted(path: string, root = join(process.cwd(), 'public')): string {
  let address = cache.get(`${root}${path}`);
  if (!address) {
    const hash = createHash('sha1').update(readFileSync(join(root, path))).digest('hex').slice(0, 8);
    address = `${path}?v=${hash}`;
    cache.set(`${root}${path}`, address);
  }
  return address;
}
