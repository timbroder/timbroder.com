import { article, longTitle, longWord, noCategory, noDescription } from '../fixtures/posts.ts';
import type { Post } from '../lib/post-model.ts';
import { isoDate } from '../lib/site.ts';
import SearchResult from './SearchResult.astro';

export default {
  component: SearchResult,
};

const found = (post: Post, passage?: string) => ({
  result: {
    url: post.url,
    title: post.title,
    date: isoDate(post.date),
    category: post.category,
    passage,
  },
});

/** The words that matched are marked in the passage. */
export const Match = {
  args: found(
    article,
    'One less thing to keep running. On the devices: <mark>Kobo:</mark> KOReader, instead of the stock <mark>Kobo</mark> reader. iPhone, text: Readest, which speaks the same sync protocol.',
  ),
};

/** A search that matched the title or a tag shows how the post begins. */
export const MatchInTheTitle = {
  args: found(
    noCategory,
    'A few principles I keep coming back to when I lead a team. None of them are new, and most of them I learned by getting them wrong first.',
  ),
};

/** A post that is only a picture has no passage to show. */
export const NoPassage = { args: found(noDescription) };

export const LongTitle = {
  args: found(
    longTitle,
    'This week we watched three films from the eighties and argued about all of them. <mark>Escape</mark> from New York held up best.',
  ),
};

/** A web address too long for one line wraps; the result never grows wider. */
export const LongWord = {
  args: found(longWord, longWord.description.replace('regex=1', '<mark>regex=1</mark>')),
};
