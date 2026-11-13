import { manyTags } from '../fixtures/posts.ts';
import PostMeta from './PostMeta.astro';

export default {
  component: PostMeta,
};

export const TagsAndCategory = {
  args: { tags: ['homelab', 'kobo', 'audiobooks', 'CoreData'], category: 'Code' },
};

/** Tags wrap onto more lines; the category moves below when there is no room beside. */
export const ManyTags = {
  args: { tags: manyTags, category: 'Code' },
};

export const TagsOnly = {
  args: { tags: ['coffee', 'aeropress'] },
};

export const CategoryOnly = {
  args: { tags: [], category: 'Commentary' },
};

export const Neither = {
  args: { tags: [] },
};
