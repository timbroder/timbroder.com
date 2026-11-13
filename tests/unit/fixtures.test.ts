/** The sample posts the stories use must themselves follow the content rules. */
import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { STORY_PICTURE, sampleBody } from '../../src/fixtures/contentful.ts';
import {
  article,
  linkPost,
  longWord,
  manyTags,
  noDescription,
  samplePosts,
} from '../../src/fixtures/posts.ts';
import { readSamples } from '../../src/lib/contentful/api.ts';
import { contentfulPosts } from '../../src/lib/contentful/posts.ts';
import { collect } from '../../src/lib/contentful/types.ts';
import { validatePosts } from '../../src/lib/post-model.ts';

describe('sample posts', () => {
  it('pass the same checks as real posts', () => {
    expect(() => validatePosts(samplePosts)).not.toThrow();
  });

  it('cover the states the stories show', () => {
    expect(article.link).toBeUndefined();
    expect(linkPost.link).toBeTruthy();
    expect(noDescription.description).toBe('');
    expect(samplePosts.some((post) => !post.category)).toBe(true);
    // Far longer than the 30 or so letters that fit across a phone.
    expect(longWord.description.split(' ').some((word) => word.length > 80)).toBe(true);
    expect(manyTags.length).toBeGreaterThan(10);
  });
});

describe('the Contentful samples in the stories', () => {
  const slug = 'sample-contentful-picture-and-code';

  it('are the samples the tests use, with only the picture swapped for a local one', async () => {
    const { posts } = await contentfulPosts(collect(readSamples('src/fixtures/contentful/entries.json')));
    const tested = posts.find((post) => post.slug === slug)!.html;
    const shown = await sampleBody(slug);
    const withoutPicture = (html: string) => html.replace(/<img [^>]*>/, '<img>');
    expect(shown).not.toBe(tested);
    expect(withoutPicture(shown)).toBe(withoutPicture(tested));
    expect(shown).toContain(
      `<img src="${STORY_PICTURE.url}" alt="A kettle on the stove" width="${STORY_PICTURE.width}" height="${STORY_PICTURE.height}" loading="lazy">`,
    );
  });

  it('show a picture that this site keeps', () => {
    expect(existsSync(`public${STORY_PICTURE.url}`)).toBe(true);
  });

  it('fail clearly for a post that is not in the samples', async () => {
    await expect(sampleBody('no-such-post')).rejects.toThrow(/no published post with the slug no-such-post/);
    await expect(sampleBody('sample-contentful-draft')).rejects.toThrow(/no published post/);
  });
});
