/**
 * Loads every published post, from every source, as `Post`.
 *
 * This is the only place that knows about content collections. Everything
 * else uses the list returned here.
 */
import { existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { getCollection } from 'astro:content';
import { excerpt } from './excerpt.ts';
import { finalizePosts, toPost, type Post } from './post-model.ts';

async function loadMarkdownPosts(): Promise<Post[]> {
  const entries = await getCollection('blog', (entry) => !entry.data.draft);
  return entries.map((entry) => {
    const html = entry.rendered?.html ?? '';
    return toPost({
      id: entry.id,
      source: 'markdown',
      filePath: entry.filePath ?? `${entry.id}.md`,
      title: entry.data.title,
      date: entry.data.date,
      slug: entry.data.slug,
      redirectFrom: entry.data.redirect_from,
      link: entry.data.link,
      tags: entry.data.tags,
      category: entry.data.category,
      // A post's own description, or else a summary of its text.
      description: entry.data.description ?? excerpt(html),
      html,
    });
  });
}

/** A post may only show a local image that is really there. */
function publicFileExists(path: string): boolean {
  const file = join(process.cwd(), 'public', path);
  return existsSync(file) && statSync(file).isFile();
}

let cache: Promise<Post[]> | undefined;

/** Published posts, newest first. Throws if the content breaks a rule. */
export function getPosts(): Promise<Post[]> {
  cache ??= loadMarkdownPosts().then((posts) => finalizePosts(posts, { publicFileExists }));
  return cache;
}
