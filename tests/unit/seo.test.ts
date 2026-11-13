/** R11, R19: the head tags for search engines and link previews, and the analytics script. */
import vm from 'node:vm';
import { describe, expect, it } from 'vitest';
import { toPost, type PostInput } from '../../src/lib/post-model.ts';
import {
  ANALYTICS_ID,
  DEFAULT_SHARE_IMAGE,
  analyticsScript,
  articleData,
  oneLine,
  scriptJson,
  socialTags,
} from '../../src/lib/seo.ts';

const post = (over: Partial<PostInput> = {}) =>
  toPost({
    id: 'a',
    source: 'markdown',
    filePath: 'content/blog/2019-09-07-small-wins.md',
    title: 'Small Wins',
    date: new Date('2019-09-07T23:30:00Z'),
    description: 'Remember to value\nthe little wins.',
    html: '<p>Body</p>',
    ...over,
  });

const byName = (tags: ReturnType<typeof socialTags>) =>
  Object.fromEntries(tags.map((tag) => [tag.property ?? tag.name, tag.content]));

describe('socialTags', () => {
  const page = { title: 'Small Wins', description: 'Remember to value\nthe  little wins.', path: '/2019/09/small-wins/' };

  it('has the Open Graph and Twitter tags the Gatsby site had', () => {
    expect(byName(socialTags(page))).toEqual({
      'og:title': 'Small Wins',
      'og:description': 'Remember to value the little wins.',
      'og:type': 'website',
      'og:url': 'https://timbroder.com/2019/09/small-wins/',
      'og:image': 'https://timbroder.com/og-image.png',
      'twitter:card': 'summary_large_image',
      'twitter:title': 'Small Wins',
      'twitter:description': 'Remember to value the little wins.',
      'twitter:image': 'https://timbroder.com/og-image.png',
    });
  });

  it('names Open Graph tags with property and Twitter tags with name', () => {
    const tags = socialTags(page);
    expect(tags.filter((tag) => tag.property).every((tag) => tag.property!.startsWith('og:'))).toBe(true);
    expect(tags.filter((tag) => tag.name).every((tag) => tag.name!.startsWith('twitter:'))).toBe(true);
    expect(tags.every((tag) => Boolean(tag.property) !== Boolean(tag.name))).toBe(true);
  });

  it("uses a page's own picture when it has one", () => {
    const tags = byName(socialTags({ ...page, image: 'https://images.ctfassets.net/s/a/h/share.png' }));
    expect(tags['og:image']).toBe('https://images.ctfassets.net/s/a/h/share.png');
    expect(tags['twitter:image']).toBe('https://images.ctfassets.net/s/a/h/share.png');
  });

  it('leaves the address out for a page that has none, like the 404 page', () => {
    expect(byName(socialTags({ ...page, path: null }))).not.toHaveProperty('og:url');
  });
});

describe('articleData', () => {
  it('describes a post as the Gatsby site did', () => {
    expect(articleData(post())).toEqual({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: 'Small Wins',
      description: 'Remember to value the little wins.',
      url: 'https://timbroder.com/2019/09/small-wins/',
      // The day in UTC, as in the post's address.
      datePublished: '2019-09-07',
      author: { '@type': 'Person', name: 'Tim Broder', url: 'https://timbroder.com' },
      publisher: { '@type': 'Person', name: 'Tim Broder', url: 'https://timbroder.com' },
      image: DEFAULT_SHARE_IMAGE,
      mainEntityOfPage: { '@type': 'WebPage', '@id': 'https://timbroder.com/2019/09/small-wins/' },
    });
  });

  it("uses the post's own picture when it has one", () => {
    const image = 'https://images.ctfassets.net/s/a/h/share.png';
    expect(articleData(post({ image })).image).toBe(image);
  });
});

describe('scriptJson', () => {
  it('cannot end the script element it sits in', () => {
    const json = scriptJson({ headline: 'How to close a </script> tag <!-- safely' });
    expect(json).not.toContain('<');
    expect(JSON.parse(json)).toEqual({ headline: 'How to close a </script> tag <!-- safely' });
  });
});

describe('oneLine', () => {
  it('joins lines and trims', () => {
    expect(oneLine('  one\ntwo \n\n three  ')).toBe('one two three');
  });
});

describe('analyticsScript', () => {
  /** Runs the script as a page on `hostname` would, and reports what it did. */
  function runOn(hostname: string) {
    const added: { src?: string; async?: boolean }[] = [];
    const window: Record<string, unknown> = {};
    const context = {
      location: { hostname },
      document: {
        createElement: () => ({}),
        head: { appendChild: (element: { src?: string; async?: boolean }) => added.push(element) },
      },
      window,
    };
    vm.runInNewContext(analyticsScript(), context);
    return { added, dataLayer: window.dataLayer as unknown[] | undefined };
  }

  it("loads Google's code on the real site and tells it which property this is", () => {
    for (const host of ['timbroder.com', 'www.timbroder.com']) {
      const { added, dataLayer } = runOn(host);
      expect(added).toEqual([
        { async: true, src: `https://www.googletagmanager.com/gtag/js?id=${ANALYTICS_ID}` },
      ]);
      const calls = dataLayer!.map((call) => Array.from(call as ArrayLike<unknown>));
      expect(calls.map((call) => call[0])).toEqual(['js', 'config']);
      expect(calls[1]).toEqual(['config', 'G-L8N53HMK1R']);
    }
  });

  it('does nothing anywhere else', () => {
    for (const host of ['localhost', 'deploy-preview-136--funny-meringue-5e00b8.netlify.app', 'nottimbroder.com']) {
      const { added, dataLayer } = runOn(host);
      expect(added).toEqual([]);
      expect(dataLayer).toBeUndefined();
    }
  });
});
