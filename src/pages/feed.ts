/**
 * The feed, at /feed with no file extension. This is a minimal version;
 * stage 7 replaces it with the real one (stable guids, both sources).
 */
import type { APIRoute } from 'astro';
import { getPosts } from '../lib/posts.ts';
import { SITE } from '../lib/site.ts';

const escape = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export const GET: APIRoute = async () => {
  const items = (await getPosts())
    .map((post) => {
      const link = new URL(post.url, SITE.url).href;
      return `<item><title>${escape(post.title)}</title><link>${escape(link)}</link><guid isPermaLink="false">${escape(link)}</guid><pubDate>${post.date.toUTCString()}</pubDate><content:encoded><![CDATA[${post.html.replace(/]]>/g, ']]]]><![CDATA[>')}]]></content:encoded></item>`;
    })
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:content="http://purl.org/rss/1.0/modules/content/" version="2.0"><channel>
<title>${escape(SITE.feedTitle)}</title><link>${SITE.url}</link><description>${escape(SITE.description)}</description>
${items}
</channel></rss>`;
  return new Response(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
};
