/**
 * The Netlify redirects, generated from the posts. An integration in
 * astro.config.mjs renames the built file to `_redirects`, the name Netlify
 * looks for; Astro will not build a route whose name starts with "_".
 */
import type { APIRoute } from 'astro';
import { getPosts } from '../lib/posts.ts';
import { redirectsFile } from '../lib/redirects.ts';

export const GET: APIRoute = async () =>
  new Response(redirectsFile(await getPosts()), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
