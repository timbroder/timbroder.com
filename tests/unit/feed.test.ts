/** R9: what identifies a post in the feed never changes, and a feed item works away from the site. */
import * as cheerio from 'cheerio';
import { describe, expect, it } from 'vitest';
import { absoluteAddresses, feedGuid, feedItem, renderFeed } from '../../src/lib/feed.ts';
import { toPost, type PostInput } from '../../src/lib/post-model.ts';

const SITE = 'https://timbroder.com';
const channel = { title: 'TimBroder.com RSS Feed', description: 'A feed', site: SITE };

const post = (over: Partial<PostInput> = {}) =>
  toPost({
    id: 'a',
    source: 'markdown',
    filePath: 'content/blog/2019-09-07-small-wins.md',
    title: 'Small Wins',
    date: new Date('2019-09-07T00:00:00Z'),
    description: 'Remember to value the little wins.',
    html: '<p>Body</p>',
    ...over,
  });

describe('feedGuid', () => {
  it('is the address of the post without its trailing slash, as in the old feed', () => {
    expect(feedGuid(post(), SITE)).toBe('https://timbroder.com/2019/09/small-wins');
  });

  it('stays the old address when a post has a new slug', () => {
    const moved = post({
      slug: 'show-and-tell-cast',
      redirectFrom: ['/2019/09/show-&-tell-cast/'],
    });
    expect(feedGuid(moved, SITE)).toBe('https://timbroder.com/2019/09/show-&-tell-cast');
    expect(feedItem(moved, SITE).link).toBe('https://timbroder.com/2019/09/show-and-tell-cast/');
  });

  it('keeps the trailing slash for a post from Contentful, as the old feed did', () => {
    const fromContentful = post({ id: 'contentful:1', source: 'contentful', filePath: undefined, slug: 'hello' });
    expect(feedGuid(fromContentful, SITE)).toBe('https://timbroder.com/2019/09/hello/');
  });
});

describe('absoluteAddresses', () => {
  const absolute = (html: string, page = '/2019/09/small-wins/') => absoluteAddresses(html, SITE, page);

  it('completes addresses that start at the root of the site', () => {
    expect(absolute('<p><a href="/2014/09/morning-rituals/">rituals</a> <img src="/images/a.png" alt=""></p>')).toBe(
      '<p><a href="https://timbroder.com/2014/09/morning-rituals/">rituals</a> ' +
        '<img src="https://timbroder.com/images/a.png" alt=""></p>',
    );
  });

  it('completes addresses that are relative to the post', () => {
    expect(absolute('<a href="notes.pdf">notes</a>')).toBe(
      '<a href="https://timbroder.com/2019/09/small-wins/notes.pdf">notes</a>',
    );
  });

  it('leaves full addresses, other schemes and links within the page alone', () => {
    const html =
      '<a href="https://example.com/a?b=1&amp;c=2">a</a><a href="//example.com/b">b</a>' +
      '<a href="mailto:tim@example.com">c</a><a href="#top">d</a><a href="tweetbot:///mute">e</a>';
    expect(absolute(html)).toBe(html);
  });

  it('completes every address in a srcset', () => {
    expect(absolute('<img srcset="/images/a.png 1x, /images/a@2x.png 2x" src="/images/a.png">')).toBe(
      '<img srcset="https://timbroder.com/images/a.png 1x, https://timbroder.com/images/a@2x.png 2x" ' +
        'src="https://timbroder.com/images/a.png">',
    );
  });

  it('completes the address of an embedded video or object', () => {
    expect(absolute('<video poster="/images/p.jpg" src="/images/v.mp4"></video>')).toBe(
      '<video poster="https://timbroder.com/images/p.jpg" src="https://timbroder.com/images/v.mp4"></video>',
    );
  });

  it('does not touch the text of the post', () => {
    expect(absolute('<p>href="/not/a/link" &amp; a &lt;tag&gt;</p>')).toBe(
      '<p>href="/not/a/link" &amp; a &lt;tag&gt;</p>',
    );
    expect(absolute('')).toBe('');
  });
});

describe('renderFeed', () => {
  const parse = (xml: string) => cheerio.load(xml, { xml: true });

  it('describes the channel', () => {
    const $ = parse(renderFeed([post()], channel));
    expect($('channel > title').text()).toBe('TimBroder.com RSS Feed');
    expect($('channel > link').text()).toBe(SITE);
    expect($('channel > atom\\:link').attr('href')).toBe('https://timbroder.com/feed');
    // The newest post's date, not the time of the build.
    expect($('channel > lastBuildDate').text()).toBe('Sat, 07 Sep 2019 00:00:00 GMT');
  });

  it('gives every post an item, in the order given, with its whole text', () => {
    const older = post({ id: 'b', slug: 'older', title: 'Older', date: new Date('2018-01-02T03:04:05Z') });
    const $ = parse(renderFeed([post(), older], channel));
    const items = $('item').toArray().map((item) => $(item));
    expect(items.map((item) => item.children('title').text())).toEqual(['Small Wins', 'Older']);
    expect(items[1].children('pubDate').text()).toBe('Tue, 02 Jan 2018 03:04:05 GMT');
    expect(items[0].children('guid').attr('isPermaLink')).toBe('false');
    expect(items[0].children('link').text()).toBe('https://timbroder.com/2019/09/small-wins/');
    expect(items[0].children('description').text()).toBe('Remember to value the little wins.');
    expect(items[0].children('content\\:encoded').text()).toBe('<p>Body</p>');
  });

  it('survives text that would break the XML', () => {
    const awkward = post({
      title: 'Tips & <tricks> for "x"',
      description: 'A < B & C',
      // A script is kept as written, so this "]]>" would end the CDATA section early.
      html: '<p>A stray control character: \u0008.</p><script>if (a[b[0]]>1) go();</script>',
    });
    const xml = renderFeed([awkward], channel);
    const $ = parse(xml);
    expect($('item > title').text()).toBe('Tips & <tricks> for "x"');
    expect($('item > description').text()).toBe('A < B & C');
    expect($('item > content\\:encoded').text()).toBe(
      '<p>A stray control character: .</p><script>if (a[b[0]]>1) go();</script>',
    );
    expect(xml).not.toContain('\u0008');
    expect($('item').length).toBe(1);
  });

  it('is a valid feed with no posts at all', () => {
    const $ = parse(renderFeed([], channel));
    expect($('item').length).toBe(0);
    expect($('channel > lastBuildDate').length).toBe(0);
  });
});
