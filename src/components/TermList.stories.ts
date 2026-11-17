import { manyTags } from '../fixtures/posts.ts';
import TermList from './TermList.astro';

export default {
  component: TermList,
};

/** More tags than fit on a line; most tags on this site have one post. */
export const Tags = {
  args: {
    root: '/tag/',
    terms: manyTags.map((name, index) => ({
      slug: name.toLowerCase().replace(/ /g, '-'),
      name,
      count: index % 4 === 0 ? 12 + index : 1,
    })),
  },
};

export const OneTag = {
  args: { root: '/tag/', terms: [{ slug: 'coffee', name: 'coffee', count: 3 }] },
};
