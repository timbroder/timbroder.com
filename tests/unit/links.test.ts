import { describe, expect, it } from 'vitest';
import { internalPath, mayBeContentfulPost } from '../lib/links.ts';

describe('internalPath', () => {
  const from = (href: string) => internalPath(href, '/2019/09/small-wins/');

  it('keeps a link that starts with a slash', () => {
    expect(from('/about/')).toBe('/about/');
    expect(from('/2015/07/fussy-coffee/#grinder')).toBe('/2015/07/fussy-coffee/#grinder');
  });

  it("reads the site's full address as a path, with and without www", () => {
    expect(from('https://timbroder.com/about/')).toBe('/about/');
    expect(from('http://www.timbroder.com/2015/07/fussy-coffee/')).toBe('/2015/07/fussy-coffee/');
    expect(from('https://timbroder.com')).toBe('/');
  });

  it('reads a link with no scheme and no slash as a page inside the post, as a browser does', () => {
    expect(from('asana.com')).toBe('/2019/09/small-wins/asana.com');
    expect(from('../fussy-coffee/')).toBe('/2019/09/fussy-coffee/');
  });

  it('leaves out other sites, other schemes and spots on the same page', () => {
    for (const href of [
      'https://example.com/',
      '//example.com/',
      'mailto:someone@example.com',
      'tweetbot://post',
      '#top',
      '?page=2',
      '',
    ]) {
      expect(from(href), href).toBeNull();
    }
  });
});

describe('mayBeContentfulPost', () => {
  it('is true for the address of a post, when the build left Contentful out', () => {
    expect(mayBeContentfulPost('/2026/11/a-post/', 'off')).toBe(true);
    expect(mayBeContentfulPost('/2026/11/a-post', 'off')).toBe(true);
    expect(mayBeContentfulPost('/2026/11/a-post/#a-heading', 'off')).toBe(true);
    expect(mayBeContentfulPost('/2026/11/caf%C3%A9/', 'off')).toBe(true);
  });

  it('is false for any other address: no post written in Contentful lives there', () => {
    for (const path of [
      '/',
      '/about/',
      '/tag/astro/',
      '/category/code/page/2/',
      '/2026/11/',
      '/2026/11/a-post/asana.com',
      '/images/2026/11/picture.png',
    ]) {
      expect(mayBeContentfulPost(path, 'off'), path).toBe(false);
    }
  });

  it('is false when the build has the Contentful posts, so the link really goes nowhere', () => {
    expect(mayBeContentfulPost('/2026/11/a-post/', 'api: 2 posts')).toBe(false);
    expect(mayBeContentfulPost('/2026/11/a-post/', 'samples: 3 posts')).toBe(false);
    expect(mayBeContentfulPost('/2026/11/a-post/', '')).toBe(false);
  });
});
