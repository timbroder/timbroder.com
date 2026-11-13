/**
 * Turns Contentful blog post entries into `Post`, the shape every post has.
 *
 * The rules are the ones markdown posts follow: a post needs a title, a
 * date and a clean slug, its URL is /YYYY/MM/slug/ with the month in UTC,
 * and its summary is its description or else the start of its text.
 *
 * Every problem in every entry is collected and reported together, each
 * with the entry's title and ID, so one failed build shows all that needs
 * fixing in Contentful.
 */
import type { Document } from '@contentful/rich-text-types';
import { excerpt } from '../excerpt.ts';
import { parseFrontmatterDate } from '../legacy-url.ts';
import { ContentError, postUrl, toPost, type Post } from '../post-model.ts';
import { isCleanSlug } from '../slug.ts';
import { renderRichText, withScheme, type RichTextContext } from './rich-text.ts';
import { isLink, type ContentfulContent, type Entry } from './types.ts';

export interface ContentfulPosts {
  /** Published posts, in no particular order. */
  posts: Post[];
  /** How many entries were left out because they are marked as drafts. */
  drafts: number;
}

/** The id a Contentful post has on this site. */
export const postId = (entry: Entry) => `contentful:${entry.sys.id}`;

const blank = (value: unknown) =>
  value === undefined || value === null || (typeof value === 'string' && value.trim() === '');

/** What an entry is called in a message: its title when it has one, and always its ID. */
function label(entry: Entry): string {
  const title = entry.fields.title;
  return typeof title === 'string' && title.trim()
    ? `Contentful post "${title.trim()}" (entry ${entry.sys.id})`
    : `Contentful entry ${entry.sys.id}`;
}

interface Basics {
  entry: Entry;
  title: string;
  slug: string;
  date: Date;
  url: string;
}

export async function contentfulPosts(content: ContentfulContent): Promise<ContentfulPosts> {
  const problems: string[] = [];
  const published = new Map<string, Basics>();
  let drafts = 0;

  // First what gives a post its address, for every post, so that a link
  // from one post to another can be filled in.
  for (const entry of content.posts) {
    const { fields } = entry;
    const report = (problem: string) => problems.push(`${label(entry)} ${problem}`);

    if (!blank(fields.draft) && typeof fields.draft !== 'boolean') {
      report('has a draft field that is neither on nor off.');
      continue;
    }
    if (fields.draft === true) {
      drafts += 1;
      continue;
    }

    const before = problems.length;
    if (typeof fields.title !== 'string' || !fields.title.trim()) report('has no title.');
    if (typeof fields.slug !== 'string' || !fields.slug.trim()) {
      report('has no slug.');
    } else if (!isCleanSlug(fields.slug)) {
      report(
        `has the slug "${fields.slug}". A slug may only contain lowercase letters, digits and single hyphens.`,
      );
    }
    const date = parseFrontmatterDate(fields.date);
    if (blank(fields.date)) report('has no date.');
    else if (!date) report(`has a date that cannot be read: ${JSON.stringify(fields.date)}.`);
    if (problems.length > before || !date) continue;

    const slug = fields.slug as string;
    published.set(entry.sys.id, {
      entry,
      title: (fields.title as string).trim(),
      slug,
      date,
      url: postUrl(date, slug),
    });
  }

  const context: RichTextContext = {
    entries: content.entries,
    assets: content.assets,
    postUrl: (id) => published.get(id)?.url,
  };

  const posts: Post[] = [];
  for (const { entry, title, slug, date } of published.values()) {
    const { fields } = entry;
    const before = problems.length;
    const report = (problem: string) => problems.push(`${label(entry)} ${problem}`);

    const text = (name: string): string | undefined => {
      const value = fields[name];
      if (blank(value)) return undefined;
      if (typeof value !== 'string') {
        report(`has a ${name} that is not text.`);
        return undefined;
      }
      return value.trim();
    };

    const description = text('description');
    const category = text('category');

    // The article a link post comments on.
    let link = text('link');
    if (link && !/^https?:\/\/\S+$/i.test(link)) {
      report(`has the link "${link}", which is not a full http(s) address.`);
      link = undefined;
    }

    let tags: string[] = [];
    if (!blank(fields.tags)) {
      if (Array.isArray(fields.tags) && fields.tags.every((tag) => typeof tag === 'string')) {
        tags = (fields.tags as string[]).map((tag) => tag.trim()).filter(Boolean);
      } else {
        report('has tags that are not a list of words.');
      }
    }

    // The post's own picture for link previews.
    let image: string | undefined;
    if (!blank(fields.ogImage)) {
      const asset = isLink(fields.ogImage) ? content.assets.get(fields.ogImage.sys.id) : undefined;
      const file = asset?.fields.file;
      if (!file?.url) {
        report('has a share image (ogImage) that is not published.');
      } else if (!file.contentType.startsWith('image/')) {
        report('has a share image (ogImage) that is not a picture.');
      } else {
        image = withScheme(file.url);
      }
    }

    let html = '';
    if (!blank(fields.content)) {
      try {
        html = await renderRichText(fields.content as Document, context);
      } catch (error) {
        if (!(error instanceof ContentError)) throw error;
        report(`${error.message}.`);
      }
    }

    if (problems.length > before) continue;
    posts.push(
      toPost({
        id: postId(entry),
        source: 'contentful',
        title,
        date,
        slug,
        link,
        tags,
        category,
        description: description ?? excerpt(html),
        image,
        html,
      }),
    );
  }

  if (problems.length) {
    throw new ContentError(
      `Problems in Contentful:\n${problems.map((problem) => `  - ${problem}`).join('\n')}`,
    );
  }
  return { posts, drafts };
}
