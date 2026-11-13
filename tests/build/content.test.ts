/**
 * R6: every post reads the same as on the live site.
 *
 * Each post body is compared with the baseline: its text, headings, links,
 * pictures, code, and which paragraph or list item each piece of text is
 * in. A post may differ only in the ways listed in
 * tests/lib/expected-content.ts, and only as much as it says.
 */
import { describe, expect, it } from 'vitest';
import { loadPages } from '../lib/baseline.ts';
import { compareBodies, type ImageChanges } from '../lib/compare-body.ts';
import { newUrlOf, readPage } from '../lib/dist.ts';
import {
  isRepairedBody,
  NOW_RENDERED,
  REPAIRED_BODIES,
  WRAPPED_LINES,
} from '../lib/expected-content.ts';
import { loadImageSources } from '../lib/image-sources.ts';

const sources = loadImageSources();
const images: ImageChanges = {
  removed: new Set(sources.filter((s) => s.source === 'removed').map((s) => s.original)),
  removedLinks: new Set(sources.flatMap((s) => s.links ?? [])),
  replaced: new Set(sources.filter((s) => s.local).map((s) => s.original)),
};

const posts = loadPages().filter((page) => page.post);
const results = posts.map((page) => {
  const url = newUrlOf(page.url);
  const now = url ? readPage(url).post?.body : undefined;
  return { liveUrl: page.url, url, comparison: now ? compareBodies(page.post!.body, now, images) : null };
});
const compared = results.filter((result) => !isRepairedBody(result.liveUrl));

describe('R6: post content', () => {
  it('has every post from the live site', () => {
    expect(posts.length).toBeGreaterThan(500);
    expect(results.filter((result) => !result.comparison).map((result) => result.liveUrl)).toEqual([]);
  });

  it('reads the same as the live site, apart from the listed kinds of difference', () => {
    const problems = compared
      .filter((result) => result.comparison!.problems.length)
      .map((result) => `${result.liveUrl}\n    ${result.comparison!.problems.join('\n    ')}`);
    expect(problems).toEqual([]);
  });

  it('renders raw markdown in exactly the posts on the list', () => {
    const found = compared.filter((r) => r.comparison!.nowRendered).map((r) => r.liveUrl);
    expect(found.sort()).toEqual([...NOW_RENDERED].sort());
  });

  it('keeps wrapped lines in their list item or quote in exactly the listed places', () => {
    const found: Record<string, number> = {};
    for (const result of compared) {
      // Where raw markdown now renders, block lengths change and the count
      // is not reliable; the text of those posts is checked instead.
      if (result.comparison!.nowRendered) continue;
      if (result.comparison!.wrappedLines) found[result.liveUrl] = result.comparison!.wrappedLines;
    }
    expect(found).toEqual(WRAPPED_LINES);
  });

  it('lists as repaired only posts that exist and do differ', () => {
    for (const ending of Object.keys(REPAIRED_BODIES)) {
      const matches = results.filter((result) => result.liveUrl.endsWith(ending));
      expect(matches, ending).toHaveLength(1);
      const { comparison } = matches[0];
      expect(
        comparison!.problems.length > 0 || comparison!.nowRendered || comparison!.wrappedLines > 0,
        `${ending} no longer differs from the live site`,
      ).toBe(true);
    }
  });
});
