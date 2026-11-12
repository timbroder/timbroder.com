/**
 * Loads every published post, from every source, as `Post`.
 *
 * This is the only place that knows about content collections. Everything
 * else uses the list returned here.
 */
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

let cache: Promise<Post[]> | undefined;

/** Published posts, newest first. Throws if the content breaks a rule. */
export function getPosts(): Promise<Post[]> {
  cache ??= loadMarkdownPosts().then(finalizePosts);
  return cache;
}
