/**
 * Everything the site had on the day it replaced the Gatsby site still
 * works: no address a reader has goes dead, and no post shows up in a feed
 * reader a second time. See tests/lib/cutover.ts for when the list changes.
 */
import { describe, expect, it } from 'vitest';
import { loadCutover } from '../lib/cutover.ts';
import { destinationOf, readHtml } from '../lib/dist.ts';
import { extractFeed } from '../lib/extract.ts';

const cutover = loadCutover();

describe('what the site had when it replaced the Gatsby site', () => {
  it('is a full record', () => {
    expect(cutover.posts.length).toBe(519);
    expect(cutover.oldAddresses.length).toBe(87);
    expect(cutover.feedGuids.length).toBe(519);
  });

  it('still has every post, at its address or behind a redirect', () => {
    expect(cutover.posts.filter((url) => !destinationOf(url))).toEqual([]);
  });

  it('still has the home page, the About page and every markdown page', () => {
    expect(cutover.pages.filter((url) => destinationOf(url) !== url)).toEqual([]);
  });

  it('still sends every old address to a page', () => {
    expect(cutover.oldAddresses.filter((url) => !destinationOf(url))).toEqual([]);
  });

  it('still has every guid in the feed, so no reader sees an old post as new', () => {
    const guids = new Set(extractFeed(readHtml('/feed')).items.map((item) => item.guid));
    expect(cutover.feedGuids.filter((guid) => !guids.has(guid))).toEqual([]);
  });
});
