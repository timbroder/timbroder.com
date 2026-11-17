import { article, linkPost, longTitle } from '../fixtures/posts.ts';
import PostNav from './PostNav.astro';

export default {
  component: PostNav,
};

export const NewerAndOlder = {
  args: { newer: article, older: linkPost },
};

/** The newest post: the older post stays on the right. */
export const OlderOnly = {
  args: { newer: null, older: linkPost },
};

/** The oldest post. */
export const NewerOnly = {
  args: { newer: article, older: null },
};

/** Long titles wrap inside their half; on a phone the two stack. */
export const LongTitles = {
  args: { newer: longTitle, older: article },
};

/** A site with one post shows nothing. */
export const Neither = {
  args: { newer: null, older: null },
};
