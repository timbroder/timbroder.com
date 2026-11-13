/**
 * R27 to R30: the details on every page match the live site.
 *
 * R27 link posts, R28 list cards, R29 navigation and footer, R30 post
 * details. Every intended difference is listed in tests/lib/expected.ts.
 */
import { describe, expect, it } from 'vitest';
import { loadLists, loadPages } from '../lib/baseline.ts';
import { builtPages, newUrlOf, readList, readPage } from '../lib/dist.ts';
import {
  HAD_EMPTY_TAGS,
  NAV_HIGHLIGHT_DIFFERS,
  NOT_LINK_POSTS,
  SUMMARY_DIFFERS,
  isNewlyListed,
  isRepaired,
} from '../lib/expected.ts';
import { isRepairedBody, NOW_RENDERED } from '../lib/expected-content.ts';
import type { CardFacts } from '../lib/extract.ts';

const baseline = loadPages();
const lists = loadLists();
const built = builtPages();

/** Baseline pages that still exist, each with the URL it has now. */
const pairs = baseline.flatMap((live) => {
  if (live.url === '/404.html') return [{ live, url: '/404.html' }];
  if (live.type === 'post') {
    const url = newUrlOf(live.url);
    return url ? [{ live, url }] : [];
  }
  // Other pages only count if they are still at the same address.
  return built.has(live.url) ? [{ live, url: live.url }] : [];
});
const posts = pairs.filter(({ live }) => live.type === 'post');

/** Every card on the new site, by post URL. Cards render the same on every list. */
const cards = new Map<string, CardFacts>();
for (const url of built) {
  if (url === '/' || url.startsWith('/page/')) {
    for (const card of readList(url).cards) cards.set(card.href, card);
  }
}

describe('R29: navigation and footer', () => {
  it('compares every page', () => {
    expect(pairs.length).toBeGreaterThan(760);
  });

  it('shows the same navigation, with the same item highlighted', () => {
    const differing = pairs
      .filter(({ live }) => !NAV_HIGHLIGHT_DIFFERS.includes(live.url))
      .filter(({ live, url }) => JSON.stringify(live.chrome.nav) !== JSON.stringify(readPage(url).chrome.nav))
      .map(({ live }) => live.url);
    expect(differing).toEqual([]);
  });

  it('highlights nothing on the 404 page', () => {
    expect(readPage('/404.html').chrome.nav.filter((item) => item.active)).toEqual([]);
  });

  it('shows the same footer links and copyright line', () => {
    const differing = pairs
      .filter(({ live, url }) => {
        const now = readPage(url).chrome;
        return (
          JSON.stringify(live.chrome.footerLinks) !== JSON.stringify(now.footerLinks) ||
          live.chrome.footerText !== now.footerText
        );
      })
      .map(({ live }) => live.url);
    expect(differing).toEqual([]);
  });

  it('shows the same main heading', () => {
    const differing = pairs
      .filter(({ live }) => !isRepaired(live.url))
      .filter(({ live, url }) => (live.chrome.heading ?? '') !== (readPage(url).chrome.heading ?? ''))
      .map(({ live, url }) => [live.url, live.chrome.heading, readPage(url).chrome.heading]);
    expect(differing).toEqual([]);
  });

  it('gives the repaired posts a heading', () => {
    for (const { live, url } of pairs.filter(({ live }) => isRepaired(live.url))) {
      expect(readPage(url).chrome.heading, live.url).toBeTruthy();
    }
  });
});

describe('R30: post details', () => {
  const comparable = posts.filter(({ live }) => !isRepaired(live.url));

  it('compares every post', () => {
    expect(posts.length).toBe(baseline.filter((p) => p.type === 'post').length);
  });

  it('shows the same date', () => {
    const differing = comparable
      .filter(({ live, url }) => {
        const now = readPage(url).post!;
        return live.post!.date !== now.date || live.post!.dateTime !== now.dateTime;
      })
      .map(({ live }) => live.url);
    expect(differing).toEqual([]);
  });

  it('shows the same tags, linking to the same tag pages', () => {
    const differing = comparable
      .filter(({ url }) => !HAD_EMPTY_TAGS.includes(url))
      .filter(({ live, url }) => JSON.stringify(live.post!.tags) !== JSON.stringify(readPage(url).post!.tags))
      .map(({ live }) => live.url);
    expect(differing).toEqual([]);
  });

  it('drops the empty tags and nothing else', () => {
    for (const url of HAD_EMPTY_TAGS) {
      const live = posts.find((pair) => pair.url === url)!.live.post!.tags;
      expect(readPage(url).post!.tags, url).toEqual(live.filter((tag) => tag.label !== ''));
    }
  });

  it('shows the same category, linking to the same category page', () => {
    const differing = comparable
      .filter(({ live, url }) => JSON.stringify(live.post!.category) !== JSON.stringify(readPage(url).post!.category))
      .map(({ live }) => live.url);
    expect(differing).toEqual([]);
  });
});

describe('R27: link posts', () => {
  const comparable = posts.filter(({ live, url }) => !isRepaired(live.url) && !NOT_LINK_POSTS.includes(url));

  it('has link posts to compare', () => {
    expect(comparable.filter(({ live }) => live.post!.originalLink).length).toBeGreaterThan(150);
  });

  it('shows the "original article" link exactly where the live site does, with the same target', () => {
    const differing = comparable
      .filter(({ live, url }) => live.post!.originalLink !== readPage(url).post!.originalLink)
      .map(({ live, url }) => [live.url, live.post!.originalLink, readPage(url).post!.originalLink]);
    expect(differing).toEqual([]);
  });

  it('says "Read commentary" on link posts and "Read article" on the rest', () => {
    const differing = comparable
      .filter(({ live }) => live.url in lists.cards)
      .filter(({ live, url }) => lists.cards[live.url].cta !== cards.get(url)?.cta)
      .map(({ live, url }) => [live.url, lists.cards[live.url].cta, cards.get(url)?.cta]);
    expect(differing).toEqual([]);
  });

  it('matches the call to action to the link on every card', () => {
    for (const [url, card] of cards) {
      const isLinkPost = Boolean(readPage(url).post!.originalLink);
      expect(card.cta, url).toBe(isLinkPost ? 'Read commentary' : 'Read article');
    }
  });

  it('treats the two "link: None" posts as ordinary posts', () => {
    for (const url of NOT_LINK_POSTS) {
      expect(readPage(url).post!.originalLink, url).toBeNull();
      expect(cards.get(url)?.cta, url).toBe('Read article');
    }
  });
});

describe('R28: list cards', () => {
  const comparable = Object.entries(lists.cards).flatMap(([liveUrl, live]) => {
    const url = newUrlOf(liveUrl);
    return url && !isRepaired(liveUrl) ? [{ liveUrl, live, now: cards.get(url) }] : [];
  });

  it('has a card for every card on the live site', () => {
    expect(comparable.filter(({ now }) => !now).map(({ liveUrl }) => liveUrl)).toEqual([]);
    expect(comparable.length).toBeGreaterThan(510);
  });

  it('shows the same title, date and category', () => {
    const differing = comparable
      .filter(({ live, now }) => live.title !== now!.title || live.date !== now!.date || live.category !== now!.category)
      .map(({ liveUrl }) => liveUrl);
    expect(differing).toEqual([]);
  });

  it('shows the same summary, unless the text of the post is meant to differ', () => {
    const differing = comparable
      .filter(({ liveUrl }) => !SUMMARY_DIFFERS.includes(newUrlOf(liveUrl)!))
      // Raw markdown that now renders, or a post repaired by hand: the
      // summary is taken from text that has changed.
      .filter(({ liveUrl }) => !NOW_RENDERED.has(liveUrl) && !isRepairedBody(liveUrl))
      .filter(({ live, now }) => live.description !== now!.description)
      .map(({ liveUrl }) => liveUrl);
    expect(differing).toEqual([]);
  });

  it('shows no raw markdown link in a summary that the live site did not show', () => {
    const RAW_LINK = /\]\(\s*(https?:|\/)/;
    const worse = comparable
      .filter(({ live, now }) => RAW_LINK.test(now!.description) && !RAW_LINK.test(live.description))
      .map(({ liveUrl }) => liveUrl);
    expect(worse).toEqual([]);
  });

  it('lists a summary as different only while it really is', () => {
    const stale = SUMMARY_DIFFERS.filter((url) => {
      const entry = comparable.find(({ liveUrl }) => newUrlOf(liveUrl) === url);
      return !entry || entry.live.description === entry.now!.description;
    });
    expect(stale).toEqual([]);
  });

  it('gives a card to the three posts the live site never listed', () => {
    const added = [...cards.keys()].filter(isNewlyListed);
    expect(added).toHaveLength(3);
  });
});
