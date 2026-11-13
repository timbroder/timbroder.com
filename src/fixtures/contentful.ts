/**
 * The sample Contentful posts, for the component stories.
 *
 * They are read from the same saved answer the tests and the samples build
 * use (contentful/entries.json), so a story never shows something the tests
 * do not know about.
 */
import { contentfulPosts } from '../lib/contentful/posts.ts';
import { collect, type EntriesResponse } from '../lib/contentful/types.ts';
import answer from './contentful/entries.json';

/**
 * The sample picture's address on Contentful's image server is made up, so
 * nothing would show. In a story it is swapped for a picture this site
 * keeps, with that picture's real size.
 */
export const STORY_PICTURE = {
  url: '/images/remote/2015-07-19-fussy-coffee/19799533225_f86f5625d2_z_d.jpg',
  width: 640,
  height: 640,
};

/** The body of a sample post, by slug, as the site renders it. */
export async function sampleBody(slug: string): Promise<string> {
  const content = collect([structuredClone(answer) as unknown as EntriesResponse]);
  const file = content.assets.get('sample-picture')?.fields.file;
  if (!file) throw new Error('The samples have no asset called sample-picture.');
  file.url = STORY_PICTURE.url;
  file.details = { image: { width: STORY_PICTURE.width, height: STORY_PICTURE.height } };

  const { posts } = await contentfulPosts(content);
  const post = posts.find((candidate) => candidate.slug === slug);
  if (!post) throw new Error(`The samples have no published post with the slug ${slug}.`);
  return post.html;
}
