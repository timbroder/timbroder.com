/**
 * Stage 2 proof (P3, P4): an endpoint at /feed, with no file extension, that
 * can read each post's rendered HTML. Stage 7 replaces this with the real
 * feed.
 */
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

const escape = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export const GET: APIRoute = async ({ site }) => {
  const posts = await getCollection('blog', (entry) => entry.data.draft !== true);
  const pages = await getCollection('pages');
  const items = [...posts, ...pages]
    .map((entry) => {
      const html = entry.rendered?.html ?? '';
      return `<item><title>${escape(String(entry.data.title ?? ''))}</title><guid isPermaLink="false">${escape(entry.id)}</guid><content:encoded><![CDATA[${html.replace(/]]>/g, ']]]]><![CDATA[>')}]]></content:encoded></item>`;
    })
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:content="http://purl.org/rss/1.0/modules/content/" version="2.0"><channel>
<title>TimBroder.com RSS Feed</title><link>${site}</link><description>Tim Broder is a creative technologist</description>
${items}
</channel></rss>`;
  return new Response(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
};
