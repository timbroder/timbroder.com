/**
 * The RSS feed at /feed.
 *
 * Subscribers have been reading this feed for years, so what identifies an
 * item must not change: a feed reader shows an item again as new when its
 * guid changes.
 *
 *  - A post's guid is the address it had on the old site, without a
 *    trailing slash, which is the form the old feed used. A post whose slug
 *    was tidied up keeps the old address as its guid, and links to the new
 *    one.
 *  - Every item carries the whole post, as before.
 *  - Addresses inside a post are made absolute. A feed is read somewhere
 *    else, where "/images/photo.jpg" points nowhere.
 */
import * as cheerio from 'cheerio';
import type { Post } from './post-model.ts';

export interface FeedChannel {
  title: string;
  description: string;
  /** The site's address, without a trailing slash. */
  site: string;
}

const escape = (text: string) =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/** Characters XML does not allow, which a few old posts contain. */
const withoutControlCharacters = (text: string) =>
  // eslint-disable-next-line no-control-regex
  text.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F￾￿]/g, '');

/**
 * What identifies a post in the feed. It is not a link: the old address of
 * a re-slugged post only redirects.
 */
export function feedGuid(post: Post, site: string): string {
  const path = post.redirectFrom[0] ?? post.url;
  return `${site}${path.replace(/\/$/, '')}`;
}

/** Attributes that hold one address. */
const ADDRESS_ATTRIBUTES = ['href', 'src', 'poster', 'data', 'action', 'cite'];

const isRelative = (address: string) =>
  address !== '' && !/^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(address.trim());

/** Makes every address in a piece of HTML absolute. `page` is the path of the page it is on. */
export function absoluteAddresses(html: string, site: string, page: string): string {
  if (!html) return html;
  const $ = cheerio.load(html, null, false);
  const absolute = (address: string) => {
    if (!isRelative(address)) return address;
    try {
      return new URL(address.trim(), `${site}${page}`).href;
    } catch {
      return address;
    }
  };
  for (const attribute of ADDRESS_ATTRIBUTES) {
    $(`[${attribute}]`).each((_, element) => {
      const $element = $(element);
      $element.attr(attribute, absolute($element.attr(attribute) ?? ''));
    });
  }
  // srcset holds several addresses, each followed by a size.
  $('[srcset]').each((_, element) => {
    const $element = $(element);
    const candidates = ($element.attr('srcset') ?? '').split(',').map((candidate) => {
      const [address, ...size] = candidate.trim().split(/\s+/);
      return [absolute(address), ...size].join(' ');
    });
    $element.attr('srcset', candidates.join(', '));
  });
  return $.html();
}

export interface FeedItem {
  title: string;
  description: string;
  link: string;
  guid: string;
  date: Date;
  html: string;
}

export function feedItem(post: Post, site: string): FeedItem {
  return {
    title: post.title,
    description: post.description,
    link: `${site}${post.url}`,
    guid: feedGuid(post, site),
    date: post.date,
    html: absoluteAddresses(post.html, site, post.url),
  };
}

/** The feed as XML. `posts` are newest first. */
export function renderFeed(posts: Post[], channel: FeedChannel): string {
  const { site } = channel;
  const cdata = (text: string) =>
    `<![CDATA[${withoutControlCharacters(text).replace(/]]>/g, ']]]]><![CDATA[>')}]]>`;
  const text = (value: string) => escape(withoutControlCharacters(value));

  const items = posts.map((post) => {
    const item = feedItem(post, site);
    return [
      '<item>',
      `<title>${text(item.title)}</title>`,
      `<description>${text(item.description)}</description>`,
      `<link>${text(item.link)}</link>`,
      `<guid isPermaLink="false">${text(item.guid)}</guid>`,
      `<pubDate>${item.date.toUTCString()}</pubDate>`,
      `<content:encoded>${cdata(item.html)}</content:encoded>`,
      '</item>',
    ].join('');
  });

  // The newest post's date, so two builds of the same content give the same feed.
  const updated = posts.length ? posts[0].date.toUTCString() : undefined;

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom" version="2.0">',
    '<channel>',
    `<title>${text(channel.title)}</title>`,
    `<description>${text(channel.description)}</description>`,
    `<link>${text(site)}</link>`,
    `<atom:link href="${text(site)}/feed" rel="self" type="application/rss+xml"/>`,
    '<language>en</language>',
    ...(updated ? [`<lastBuildDate>${updated}</lastBuildDate>`] : []),
    ...items,
    '</channel>',
    '</rss>',
    '',
  ].join('\n');
}
