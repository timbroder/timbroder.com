import { samplePosts } from '../fixtures/posts.ts';
import { postsByYear } from '../lib/lists.ts';
import { sortPosts } from '../lib/post-model.ts';
import PostIndex from './PostIndex.astro';

export default {
  component: PostIndex,
};

/** One post a year, including a title and a web address too long for a line. */
export const SeveralYears = {
  args: { years: postsByYear(sortPosts(samplePosts)) },
};

export const OneYear = {
  args: { years: [{ year: 2026, posts: samplePosts.slice(0, 3) }] },
};
