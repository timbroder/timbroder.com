/**
 * The feed, at /feed with no file extension, as on the old site. What goes
 * in it is decided in src/lib/feed.ts. Netlify is told its content type in
 * netlify.toml, since the file name gives no hint.
 */
import type { APIRoute } from 'astro';
import { renderFeed } from '../lib/feed.ts';
import { getPosts } from '../lib/posts.ts';
import { SITE } from '../lib/site.ts';

export const GET: APIRoute = async () => {
  const xml = renderFeed(await getPosts(), {
    title: SITE.feedTitle,
    description: SITE.description,
    site: SITE.url,
  });
  return new Response(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
};
