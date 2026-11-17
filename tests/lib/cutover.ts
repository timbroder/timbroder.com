/**
 * What the site had on 2026-11-13, the day it replaced the Gatsby site:
 * its posts and pages, the old addresses that redirect, and the guid of
 * every feed item.
 *
 * Readers have these addresses bookmarked and linked, and feed readers
 * know each post by its guid, so they have to keep working. Publishing a
 * post never touches this list. It only changes when something that existed
 * that day is taken away on purpose: delete its line from
 * tests/fixtures/cutover.json.
 *
 * Posts written in Contentful are not in it, because the build the tests
 * read is made without the Contentful settings and cannot have them.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export interface Cutover {
  /** The address of every post. */
  posts: string[];
  /** The other pages a reader can land on: home, About and the markdown pages. */
  pages: string[];
  /** Addresses the Gatsby site had that now redirect, as a reader would type them. */
  oldAddresses: string[];
  feedGuids: string[];
}

const FILE = join(dirname(fileURLToPath(import.meta.url)), '..', 'fixtures', 'cutover.json');

export function loadCutover(): Cutover {
  return JSON.parse(readFileSync(FILE, 'utf8')) as Cutover;
}
