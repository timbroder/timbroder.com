import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as cheerio from 'cheerio';
import { describe, expect, it } from 'vitest';
import {
  blockText,
  bodyBlocks,
  extractFeed,
  extractPage,
  normalizeCode,
  normalizeText,
} from '../lib/extract.ts';

const FIXTURES = join(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  'fixtures',
  'html',
);
const fixture = (name: string) => readFileSync(join(FIXTURES, name), 'utf8');

describe('text helpers', () => {
  it('collapses whitespace and drops zero-width characters', () => {
    expect(normalizeText('  a\n\t b c ​ ')).toBe('a b c');
  });

  it('keeps line breaks in code but trims line ends', () => {
    expect(normalizeCode('\nconst a = 1   \r\n  b()\n\n')).toBe(
      'const a = 1\n  b()',
    );
  });

  it('puts a space at block boundaries but not between inline elements', () => {
    const $ = cheerio.load(
      '<div id="x"><p>one</p><p>two <em>three</em><b>four</b></p><ul><li>five</li><li>six</li></ul></div>',
    );
    expect(blockText($('#x'))).toBe('one two threefour five six');
  });

  it('gives the same text whatever whitespace separates blocks', () => {
    const tight = cheerio.load('<main><h1>Title</h1><p>Body</p></main>');
    const loose = cheerio.load('<main>\n  <h1>Title</h1>\n  <p>Body</p>\n</main>');
    expect(blockText(tight('main'))).toBe(blockText(loose('main')));
  });
});

describe('bodyBlocks', () => {
  const blocks = (html: string) => {
    const $ = cheerio.load(`<div id="body">${html}</div>`);
    return bodyBlocks($, $('#body'));
  };

  it('lists each paragraph, heading and list item with its length and start', () => {
    expect(blocks('<h2>Title</h2><p>One two.</p><ul><li>First</li><li>Second</li></ul>')).toEqual([
      'h2|5|Title',
      'p|8|One two.',
      'ul>li|5|First',
      'ul>li|6|Second',
    ]);
  });

  it('reads a list item the same whether or not its text is in a paragraph', () => {
    expect(blocks('<ul><li><p>First</p></li></ul>')).toEqual(blocks('<ul><li>First</li></ul>'));
  });

  it('marks a second paragraph in the same item, and names the lists around a nested one', () => {
    expect(blocks('<ol><li><p>One</p><p>More</p><ul><li>Inner</li></ul></li></ol>')).toEqual([
      'ol>li|3|One',
      'ol>li+|4|More',
      'ol>li>ul>li|5|Inner',
    ]);
  });

  it('tells a paragraph after a list from the end of its last item', () => {
    expect(blocks('<ul><li>Videos</li></ul><p>Cons</p>')).toEqual(['ul>li|6|Videos', 'p|4|Cons']);
    expect(blocks('<ul><li>Videos Cons</li></ul>')).toEqual(['ul>li|11|Videos Cons']);
  });

  it('records a code block without its text, also through a wrapper', () => {
    expect(blocks('<p>Run:</p><pre><code>ls</code></pre>')).toEqual(['p|4|Run:', 'pre|0|']);
    expect(blocks('<ol><li>Run <div class="gatsby-highlight"><pre>ls</pre></div></li></ol>')).toEqual(
      blocks('<ol><li>Run <pre>ls</pre></li></ol>'),
    );
    expect(blocks('<ol><li>Run <pre>ls</pre></li></ol>')).toEqual(['ol>li|3|Run', 'ol>li+>pre|0|']);
  });

  it('keeps a space at the edge of a link, and reads quotes', () => {
    expect(blocks('<ul><li>using <a href="/x">ext2fs </a>(untested)</li></ul>')).toEqual([
      'ul>li|23|using ext2fs (untested)',
    ]);
    expect(blocks('<blockquote><p>Said</p></blockquote>')).toEqual(['blockquote>p|4|Said']);
  });
});

describe('extractPage: a link post', () => {
  const page = extractPage(
    '/2019/09/small-wins/',
    fixture('gatsby-link-post.html'),
  );

  it('classifies the page', () => {
    expect(page.type).toBe('post');
    expect(page.list).toBeUndefined();
  });

  it('reads the head', () => {
    expect(page.head).toMatchObject({
      lang: 'en',
      title: 'Small Wins | Tim Broder .com',
      description: 'Great short read.',
      canonical: 'https://timbroder.com/2019/09/small-wins/',
      analytics: true,
    });
    expect(page.head.og['og:title']).toBe('Small Wins');
    expect(page.head.twitter['twitter:card']).toBe('summary_large_image');
    expect(page.head.jsonLd).toEqual([
      {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'Small Wins',
      },
    ]);
  });

  it('keeps only the head links we compare', () => {
    expect(page.head.links).toEqual([
      {
        rel: 'alternate',
        href: '/feed',
        type: 'application/rss+xml',
        title: 'TimBroder.com RSS Feed',
      },
      { rel: 'manifest', href: '/manifest.webmanifest' },
    ]);
  });

  it('reads the navigation and which item is highlighted', () => {
    expect(page.chrome.nav.map((n) => n.label)).toEqual([
      'Posts',
      'Podcasts',
      'Projects',
      'Talks',
      'About',
    ]);
    expect(page.chrome.nav.filter((n) => n.active).map((n) => n.label)).toEqual(
      ['Posts'],
    );
  });

  it('reads the site footer, not the article footer', () => {
    expect(page.chrome.footerLinks).toHaveLength(5);
    expect(page.chrome.footerText).toBe(
      '© 2007 - 2026 Tim Broder. All rights reserved.',
    );
  });

  it('reads the post details', () => {
    expect(page.chrome.heading).toBe('Small Wins');
    expect(page.post).toMatchObject({
      date: 'September 07, 2019',
      dateTime: '2019-09-07',
      originalLink: 'https://davidhemphill.com/small-wins',
      tags: [
        { label: 'small wins', href: '/tag/small-wins/' },
        { label: 'CoreData', href: '/tag/core-data/' },
      ],
      category: { label: 'Commentary', href: '/category/commentary/' },
    });
  });

  it('reads the body without the "original article" line or code', () => {
    const body = page.post!.body;
    expect(body.text).toBe(
      "Great short read. Remember to value the little wins. I've missed out on a lot of moments. Why it matters See more. one two",
    );
    expect(body.headings).toEqual([{ level: 2, text: 'Why it matters' }]);
    expect(body.links).toEqual(['https://example.com/more']);
    expect(body.images).toEqual([
      { src: '/images/2019/09/win.png', alt: 'A small win' },
    ]);
    expect(body.counts).toEqual({
      iframes: 0,
      objects: 0,
      tables: 0,
      blockquotes: 1,
      lists: 1,
    });
  });

  it('reads code blocks as plain code, without line-number markup', () => {
    expect(page.post!.body.code).toEqual(['const wins = 1\nconsole.log(wins)']);
  });
});

describe('extractPage: a tag list', () => {
  const page = extractPage(
    '/tag/android/page/2/',
    fixture('gatsby-tag-list.html'),
  );

  it('classifies the page and reads its headline', () => {
    expect(page.type).toBe('tag');
    expect(page.post).toBeUndefined();
    expect(page.list!.headline).toBe('Tag: Android');
    expect(page.chrome.nav.some((n) => n.active)).toBe(false);
  });

  it('reads prev and next from the head', () => {
    expect(page.head.links.filter((l) => l.rel !== 'alternate')).toEqual([
      { rel: 'next', href: '/tag/android/page/3/' },
      { rel: 'prev', href: '/tag/android/' },
    ]);
  });

  it('reads each card', () => {
    expect(page.list!.cards).toEqual([
      {
        title: 'Setting up Office 365 email on Android',
        href: '/2012/05/setting-office-365-email-android',
        date: 'May 25, 2012',
        category: 'Code',
        description: 'How to set it up.',
        cta: 'Read article',
      },
      {
        title: 'A link post',
        href: '/2015/09/a-link-post',
        date: 'September 19, 2015',
        category: null,
        description: '',
        cta: 'Read commentary',
      },
    ]);
  });

  it('reads the pagination', () => {
    expect(page.list!.pagination).toEqual({
      text: 'Page 2 of 3 ← PreviousNext →',
      prev: '/tag/android/',
      next: '/tag/android/page/3/',
    });
  });
});

describe('extractPage: a page with no article body', () => {
  const page = extractPage(
    '/404.html',
    '<html lang="en"><head><title>404: Not Found | Tim Broder .com</title></head><body><main><h1>404: Not Found</h1><p>You just hit a route that doesn&#x27;t exist... the sadness.</p><img src="data:image/svg+xml,placeholder" alt=""/></main></body></html>',
  );

  it('falls back to the text of <main>', () => {
    expect(page.type).toBe('notfound');
    expect(page.head.canonical).toBeNull();
    expect(page.head.analytics).toBe(false);
    expect(page.main).toEqual({
      text: "404: Not Found You just hit a route that doesn't exist... the sadness.",
      links: [],
      images: [],
    });
  });
});

describe('extractFeed', () => {
  const feed = extractFeed(`<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:content="http://purl.org/rss/1.0/modules/content/" version="2.0"><channel>
<title><![CDATA[TimBroder.com RSS Feed]]></title>
<description><![CDATA[Tim Broder is a creative technologist]]></description>
<link>https://timbroder.com</link>
<item><title><![CDATA[Small Wins]]></title><description><![CDATA[Great short read.]]></description><link>https://timbroder.com/2019/09/small-wins</link><guid isPermaLink="false">https://timbroder.com/2019/09/small-wins</guid><pubDate>Sat, 07 Sep 2019 00:00:00 GMT</pubDate><content:encoded><![CDATA[<p>Great short read.</p>]]></content:encoded></item>
<item><title>No content</title><link>https://timbroder.com/2015/07/x</link><guid>https://timbroder.com/2015/07/x</guid></item>
</channel></rss>`);

  it('reads the channel', () => {
    expect(feed).toMatchObject({
      title: 'TimBroder.com RSS Feed',
      description: 'Tim Broder is a creative technologist',
      link: 'https://timbroder.com',
    });
  });

  it('reads each item', () => {
    expect(feed.items).toEqual([
      {
        guid: 'https://timbroder.com/2019/09/small-wins',
        link: 'https://timbroder.com/2019/09/small-wins',
        title: 'Small Wins',
        pubDate: '2019-09-07T00:00:00.000Z',
        descriptionLength: 17,
        contentLength: 24,
      },
      {
        guid: 'https://timbroder.com/2015/07/x',
        link: 'https://timbroder.com/2015/07/x',
        title: 'No content',
        pubDate: null,
        descriptionLength: 0,
        contentLength: 0,
      },
    ]);
  });
});
