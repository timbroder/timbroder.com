/**
 * Sample posts, shared by the component stories and the unit tests, so a
 * story never shows a state the tests do not know about.
 */
import { toPost, type Post } from '../lib/post-model.ts';

const body = '<p>Body text.</p>';

/** An ordinary post with everything filled in. */
export const article: Post = toPost({
  id: 'article',
  source: 'markdown',
  title: 'Reading on My Kobo, Listening on My Phone, Never Losing My Place',
  date: new Date('2026-11-11T00:00:00Z'),
  slug: 'kobo-audiobook-sync',
  category: 'Code',
  tags: ['homelab', 'kobo', 'audiobooks'],
  description:
    "I sometimes read on a Kobo. I also listen to audiobooks on my phone. What I've wanted for a long time is for those to be the same book. Switching formats mid-book is miserable.",
  html: body,
});

/** A link post: commentary on an article somewhere else. */
export const linkPost: Post = toPost({
  id: 'link-post',
  source: 'markdown',
  title: 'Small Wins',
  date: new Date('2019-09-07T00:00:00Z'),
  slug: 'small-wins',
  link: 'https://davidhemphill.com/small-wins',
  category: 'Commentary',
  description: 'Great short read. Remember to value the little wins. Not just the big ones',
  html: body,
});

export const noCategory: Post = toPost({
  id: 'no-category',
  source: 'markdown',
  title: 'My Leadership Style',
  date: new Date('2025-03-21T00:00:00Z'),
  slug: 'my-leadership-style',
  description: 'A few principles I keep coming back to when I lead a team.',
  html: body,
});

/** A post with no text to summarise, such as one that is only a photo. */
export const noDescription: Post = toPost({
  id: 'no-description',
  source: 'markdown',
  title: 'Lazy bum',
  date: new Date('2010-06-01T00:00:00Z'),
  slug: 'lazy-bum',
  category: 'Random',
  html: '',
});

export const longTitle: Post = toPost({
  id: 'long-title',
  source: 'markdown',
  title:
    'Show & Tell Cast - S02EP017 - Escape from New York, The Delta Force & Big Trouble in Little China',
  date: new Date('2018-08-27T20:47:00Z'),
  slug: 'show-and-tell-cast-s02ep017-escape-from-new-york-the-delta-force-and-big-trouble-in-little-china',
  link: 'http://tekside.net/show-and-tell',
  category: 'Commentary',
  description: 'This week we watched three films from the eighties and argued about all of them.',
  html: body,
});

/** A post whose summary holds a web address far longer than a line. */
export const longWord: Post = toPost({
  id: 'long-word',
  source: 'markdown',
  title: 'House of Cards regex mute filter for Tweetbot',
  date: new Date('2014-02-15T22:12:22Z'),
  slug: 'house-cards-regex-mute-filter-tweetbot',
  category: 'Code',
  description:
    "Some regular expressions if you don't want to see spoilers in your timeline Just the show name. tweetbot:///mute/keyword?regex=1&text=(%3Fi)%23%3Fhouse(%20%3Fof)%3F(%3F%3D%20%3Fcards)%7C(%3Fi)%23%3Fkevin(%3F%3D%20%3Fspacey) @housecards #houseofcards",
  html: body,
});

/** More tags than fit on one line of a phone. */
export const manyTags = [
  'Android',
  'appengine',
  'blogger',
  'bookmarks',
  'calendar',
  'Docs Spreadsheets',
  'gadgets',
  'gchat',
  'gdata',
  'gears',
  'GWT',
  'maps',
  'Mashups',
  'picasa web',
  'reader',
];

export const samplePosts: Post[] = [
  article,
  linkPost,
  noCategory,
  noDescription,
  longTitle,
  longWord,
];
