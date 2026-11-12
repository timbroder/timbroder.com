import PostMeta from './PostMeta.astro';

export default {
  component: PostMeta,
};

export const TagsAndCategory = {
  args: { tags: ['homelab', 'kobo', 'audiobooks', 'CoreData'], category: 'Code' },
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
