/**
 * What goes in a page's head for search engines and link previews.
 *
 * The tags and their values are the ones the Gatsby site had, so that
 * search results and shared links do not change with the move.
 */
import type { Post } from './post-model.ts';
import { SITE, isoDate } from './site.ts';

/** Shown in a link preview when a page has no picture of its own. */
export const DEFAULT_SHARE_IMAGE = `${SITE.url}/og-image.png`;

/** The Google Analytics (GA4) property. */
export const ANALYTICS_ID = 'G-L8N53HMK1R';

/** The site's hosts in production. Analytics only runs there. */
export const PRODUCTION_HOSTS = ['timbroder.com', 'www.timbroder.com'];

export interface PageMeta {
  /** The page's title, without the site name. */
  title: string;
  description: string;
  /** The page's path, or null for a page with no address of its own (the 404 page). */
  path: string | null;
  /** A picture of the page's own, as a full address. */
  image?: string;
}

export interface MetaTag {
  /** Open Graph tags are named with `property`, the others with `name`. */
  property?: string;
  name?: string;
  content: string;
}

export const absoluteUrl = (path: string) => `${SITE.url}${path}`;

/**
 * Text on one line. A summary keeps the line breaks of the post it was
 * taken from, which mean nothing in a tag.
 */
export const oneLine = (text: string) => text.replace(/\s+/g, ' ').trim();

/** The Open Graph and Twitter tags of a page. */
export function socialTags({ title, description: summary, path, image }: PageMeta): MetaTag[] {
  const picture = image ?? DEFAULT_SHARE_IMAGE;
  const description = oneLine(summary);
  return [
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:type', content: 'website' },
    ...(path ? [{ property: 'og:url', content: absoluteUrl(path) }] : []),
    { property: 'og:image', content: picture },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: picture },
  ];
}

/** A post described for search engines (schema.org Article). */
export function articleData(post: Post): Record<string, unknown> {
  const url = absoluteUrl(post.url);
  const person = { '@type': 'Person', name: SITE.author, url: SITE.url };
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: oneLine(post.description),
    url,
    datePublished: isoDate(post.date),
    author: person,
    publisher: person,
    image: post.image ?? DEFAULT_SHARE_IMAGE,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
  };
}

/**
 * JSON that is safe inside a <script> element: a "<" in the data cannot
 * end the element early.
 */
export function scriptJson(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

/**
 * The script that starts Google Analytics.
 *
 * It only loads Google's code on the real site. A deploy preview, a local
 * build or a test run would otherwise be counted as visits.
 */
export function analyticsScript(id = ANALYTICS_ID, hosts = PRODUCTION_HOSTS): string {
  return [
    `if (${JSON.stringify(hosts)}.indexOf(location.hostname) !== -1) {`,
    `  var tag = document.createElement('script');`,
    `  tag.async = true;`,
    `  tag.src = 'https://www.googletagmanager.com/gtag/js?id=${id}';`,
    `  document.head.appendChild(tag);`,
    `  window.dataLayer = window.dataLayer || [];`,
    `  window.gtag = function () { window.dataLayer.push(arguments); };`,
    `  window.gtag('js', new Date());`,
    `  window.gtag('config', '${id}');`,
    `}`,
  ].join('\n');
}
