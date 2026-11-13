import {
  article,
  linkPost,
  longTitle,
  longWord,
  noCategory,
  noDescription,
} from '../fixtures/posts.ts';
import PostCard from './PostCard.astro';

export default {
  component: PostCard,
};

export const Article = { args: { post: article } };

/** Link posts say "Read commentary". */
export const LinkPost = { args: { post: linkPost } };

export const NoCategory = { args: { post: noCategory } };

export const NoDescription = { args: { post: noDescription } };

export const LongTitle = { args: { post: longTitle } };

/** A web address too long for one line wraps; the card never grows wider. */
export const LongWord = { args: { post: longWord } };
