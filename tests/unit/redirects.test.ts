import { describe, expect, it } from 'vitest';
import {
  FIXED_REDIRECTS,
  fullyEncode,
  redirectsFile,
  requestForms,
} from '../../src/lib/redirects.ts';

describe('requestForms', () => {
  it('needs one rule for a plain path', () => {
    expect(requestForms('/2016/01/tektok-podcast---ep023/')).toEqual([
      '/2016/01/tektok-podcast---ep023/',
    ]);
  });

  it('encodes characters a browser always encodes', () => {
    expect(requestForms('/2015/07/a-|-b/')).toEqual(['/2015/07/a-%7C-b/']);
    expect(requestForms('/2015/08/aren’t/')).toEqual(['/2015/08/aren%E2%80%99t/']);
  });

  it('writes both forms for characters a browser sends as they are', () => {
    expect(requestForms('/2015/10/q&a/')).toEqual([
      '/2015/10/q&a/',
      '/2015/10/q%26a/',
    ]);
    expect(requestForms("/2015/07/world's-best/")).toEqual([
      "/2015/07/world's-best/",
      '/2015/07/world%27s-best/',
    ]);
    expect(requestForms('/2015/07/git-2.5,-x/')).toEqual([
      '/2015/07/git-2.5,-x/',
      '/2015/07/git-2.5%2C-x/',
    ]);
  });

  it('adds lowercase forms when the path has capitals', () => {
    expect(requestForms('/2016/04/Great-Series-&-More/')).toEqual([
      '/2016/04/Great-Series-&-More/',
      '/2016/04/Great-Series-%26-More/',
      '/2016/04/great-series-&-more/',
      '/2016/04/great-series-%26-more/',
    ]);
  });

  it('never leaves a space, which would break the file format', () => {
    for (const form of requestForms('/2016/02/notification-organization (1)/')) {
      expect(form).not.toMatch(/\s/);
    }
  });
});

describe('fullyEncode', () => {
  it('keeps slashes and unreserved characters', () => {
    expect(fullyEncode('/2015/07/a-b_c.d~e/')).toBe('/2015/07/a-b_c.d~e/');
  });

  it('encodes the characters encodeURIComponent leaves alone', () => {
    expect(fullyEncode("/a'b(c)d*e!/")).toBe('/a%27b%28c%29d%2Ae%21/');
  });
});

describe('redirectsFile', () => {
  const file = redirectsFile(
    [
      { url: '/2015/10/q-and-a/', redirectFrom: ['/2015/10/q&a/'] },
      { url: '/2010/01/plain/', redirectFrom: [] },
    ],
    [{ from: '/old/', to: '/' }],
  );
  const rules = file.split('\n').filter((l) => l && !l.startsWith('#'));

  it('writes one 301 rule per form, then the fixed rules', () => {
    expect(rules).toEqual([
      '/2015/10/q&a/  /2015/10/q-and-a/  301',
      '/2015/10/q%26a/  /2015/10/q-and-a/  301',
      '/old/  /  301',
    ]);
  });

  it('never writes a rule that points at itself', () => {
    // The old URL differed from the new one only in its capitals.
    const caseOnly = redirectsFile(
      [{ url: '/2018/08/my-favorite-keto-recipes/', redirectFrom: ['/2018/08/My-favorite-Keto-recipes/'] }],
      [],
    );
    expect(caseOnly.split('\n').filter((l) => l && !l.startsWith('#'))).toEqual([
      '/2018/08/My-favorite-Keto-recipes/  /2018/08/my-favorite-keto-recipes/  301',
    ]);
  });

  it('ends with a newline', () => {
    expect(file.endsWith('\n')).toBe(true);
  });

  it('includes the fixed redirects by default', () => {
    const defaults = redirectsFile([]);
    for (const { from, to } of FIXED_REDIRECTS) {
      expect(defaults).toContain(`${from}  ${to}  301`);
    }
  });
});
