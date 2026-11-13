/**
 * Loads every published post, from every source, as `Post`.
 *
 * This is the only place that knows where posts come from: markdown files
 * through a content collection, and Contentful through its API. Everything
 * else uses the list returned here.
 */
import { existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { getCollection } from 'astro:content';
import { contentfulSource, fetchEntries, readSamples } from './contentful/api.ts';
import { contentfulPosts } from './contentful/posts.ts';
import { collect } from './contentful/types.ts';
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

/** Settings come from the environment, or from a local .env file. */
function setting(name: string): string | undefined {
  return process.env[name] ?? (import.meta.env as Record<string, string | undefined>)[name];
}

interface FromContentful {
  posts: Post[];
  /** "api", "samples" or "off". */
  from: string;
  /** How many entries were left out because they are marked as drafts. */
  drafts: number;
}

async function loadContentfulPosts(): Promise<FromContentful> {
  const source = contentfulSource({
    CONTEXT: setting('CONTEXT'),
    CONTENTFUL_FIXTURES: setting('CONTENTFUL_FIXTURES'),
    CONTENTFUL_SPACE_ID: setting('CONTENTFUL_SPACE_ID'),
    CONTENTFUL_ACCESS_TOKEN: setting('CONTENTFUL_ACCESS_TOKEN'),
    CONTENTFUL_ENVIRONMENT: setting('CONTENTFUL_ENVIRONMENT'),
  });
  if (source.kind === 'off') return { posts: [], from: 'off', drafts: 0 };
  const pages = source.kind === 'samples' ? readSamples(source.file) : await fetchEntries(source);
  return { ...(await contentfulPosts(collect(pages))), from: source.kind };
}

/** A post may only show a local image that is really there. */
function publicFileExists(path: string): boolean {
  const file = join(process.cwd(), 'public', path);
  return existsSync(file) && statSync(file).isFile();
}

interface Loaded {
  posts: Post[];
  contentful: string;
}

const count = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

async function load(): Promise<Loaded> {
  const [markdown, contentful] = await Promise.all([loadMarkdownPosts(), loadContentfulPosts()]);
  const { posts, dropped } = finalizePosts([...markdown, ...contentful.posts], { publicFileExists });

  if (contentful.from === 'off') {
    console.log(
      'Contentful: not read, because CONTENTFUL_SPACE_ID and CONTENTFUL_ACCESS_TOKEN are not set.',
    );
    return { posts, contentful: 'off' };
  }
  const shown = count(contentful.posts.length - dropped.length, 'post', 'posts');
  console.log(
    `Contentful (${contentful.from}): ${shown} shown, ` +
      `${count(contentful.drafts, 'draft', 'drafts')} left out.`,
  );
  // When both sources have a post at the same URL, the markdown one is shown.
  for (const post of dropped) {
    console.warn(
      `Contentful post "${post.title}" is not shown: a markdown post already lives at ${post.url}.`,
    );
  }
  return { posts, contentful: `${contentful.from}: ${shown}` };
}

let cache: Promise<Loaded> | undefined;

/** Published posts, newest first. Throws if the content breaks a rule. */
export async function getPosts(): Promise<Post[]> {
  cache ??= load();
  return (await cache).posts;
}

/**
 * What this build shows from Contentful: "api: 2 posts", "samples: 3 posts"
 * or "off". It goes in the page head, so that a deployed build can be asked
 * whether it reached the real space.
 */
export async function contentfulStatus(): Promise<string> {
  cache ??= load();
  return (await cache).contentful;
}
