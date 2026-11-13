/** The sample posts the stories use must themselves follow the content rules. */
import { describe, expect, it } from 'vitest';
import {
  article,
  linkPost,
  longWord,
  manyTags,
  noDescription,
  samplePosts,
} from '../../src/fixtures/posts.ts';
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
