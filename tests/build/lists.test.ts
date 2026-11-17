/**
 * R5, R27, R28: lists show the right posts, in order, 20 to a page, and
 * every card matches its post.
 *
 * Nothing here knows which posts exist. Each rule is checked against the
 * posts the build has: the home list has all of them, a tag page has the
 * posts that carry the tag, and so on.
 */
import { describe, expect, it } from 'vitest';
import { builtPages, readList, readPage } from '../lib/dist.ts';
import { normalizeText, type CardFacts, type PostFacts } from '../lib/extract.ts';
import { listRoot, pageNumber } from '../lib/urls.ts';

const built = builtPages();
const POST = /^\/\d{4}\/\d{2}\/[^/]+\/$/;

/** Every post page, with what it says about itself. */
const posts = new Map<string, PostFacts & { title: string | null }>();
for (const url of built) {
  if (!POST.test(url)) continue;
  const page = readPage(url);
  posts.set(url, { ...page.post!, title: page.chrome.heading });
}

/** The pages of every list, by the list's first page. */
const lists = new Map<string, string[]>();
for (const url of built) {
  if (url !== '/' && !/^\/(page|tag|category)\//.test(url)) continue;
  const root = listRoot(url);
  lists.set(root, [...(lists.get(root) ?? []), url]);
}
for (const pages of lists.values()) pages.sort((a, b) => pageNumber(a) - pageNumber(b));

const cardsOf = (root: string): CardFacts[] => lists.get(root)!.flatMap((url) => readList(url).cards);

/** Lists of posts by tag page and by category page, from the posts themselves. */
function postsByTerm(termsOf: (post: PostFacts) => string[]): Map<string, Set<string>> {
  const terms = new Map<string, Set<string>>();
  for (const [url, post] of posts) {
    for (const term of termsOf(post)) terms.set(term, (terms.get(term) ?? new Set()).add(url));
  }
  return terms;
}
const byTag = postsByTerm((post) => post.tags.map((tag) => tag.href));
const byCategory = postsByTerm((post) => (post.category ? [post.category.href] : []));

describe('R5: lists', () => {
  it('has the home list, tag lists and category lists', () => {
    expect(lists.has('/')).toBe(true);
    expect([...lists.keys()].filter((root) => root.startsWith('/tag/')).length).toBeGreaterThan(150);
    expect([...lists.keys()].filter((root) => root.startsWith('/category/')).length).toBeGreaterThan(5);
    expect(posts.size).toBeGreaterThan(500);
  });

  it('shows every post on the home list, once', () => {
    expect(cardsOf('/').map((card) => card.href).sort()).toEqual([...posts.keys()].sort());
  });

  it('shows on a tag page exactly the posts that carry the tag', () => {
    const wrong: string[] = [];
    for (const [root, tagged] of byTag) {
      if (!lists.has(root)) wrong.push(`${root} has no page`);
      else if (JSON.stringify(cardsOf(root).map((c) => c.href).sort()) !== JSON.stringify([...tagged].sort())) wrong.push(root);
    }
    expect(wrong).toEqual([]);
    expect([...lists.keys()].filter((root) => root.startsWith('/tag/') && !byTag.has(root))).toEqual([]);
  });

  it('shows on a category page exactly the posts in the category', () => {
    const wrong: string[] = [];
    for (const [root, inCategory] of byCategory) {
      if (!lists.has(root)) wrong.push(`${root} has no page`);
      else if (JSON.stringify(cardsOf(root).map((c) => c.href).sort()) !== JSON.stringify([...inCategory].sort())) wrong.push(root);
    }
    expect(wrong).toEqual([]);
    expect([...lists.keys()].filter((root) => root.startsWith('/category/') && !byCategory.has(root))).toEqual([]);
  });

  it('orders every list newest first', () => {
    for (const root of lists.keys()) {
      const times = cardsOf(root).map((card) => Date.parse(`${card.date} UTC`));
      expect(times.every((time) => !Number.isNaN(time)), root).toBe(true);
      expect([...times].sort((a, b) => b - a), root).toEqual(times);
    }
  });

  it('puts 20 posts on every page but the last, which has the rest', () => {
    for (const [root, pages] of lists) {
      pages.forEach((url, index) => {
        const count = readList(url).cards.length;
        if (index < pages.length - 1) expect(count, url).toBe(20);
        else expect(count, url).toBeGreaterThan(0);
        expect(count, url).toBeLessThanOrEqual(20);
      });
      // Pages are numbered 1, 2, 3 with none missing.
      expect(pages.map(pageNumber), root).toEqual(pages.map((_, index) => index + 1));
    }
  });

  it('links the pages of a list together in both directions', () => {
    for (const [root, pages] of lists) {
      pages.forEach((url, index) => {
        const pagination = readList(url).pagination;
        expect(pagination?.prev ?? null, url).toBe(index > 0 ? pages[index - 1] : null);
        expect(pagination?.next ?? null, url).toBe(index < pages.length - 1 ? pages[index + 1] : null);
      });
      // The same links are in the head, for search engines.
      for (const url of pages) {
        const head = readPage(url).head.links;
        const pagination = readList(url).pagination;
        expect(head.find((link) => link.rel === 'prev')?.href ?? null, url).toBe(pagination?.prev ?? null);
        expect(head.find((link) => link.rel === 'next')?.href ?? null, url).toBe(pagination?.next ?? null);
      }
      expect(root).toBe(pages[0]);
    }
  });

  it('shows the same headline on every page of a list, and none on the home list', () => {
    for (const [root, pages] of lists) {
      const headlines = new Set(pages.map((url) => readList(url).headline));
      expect(headlines.size, root).toBe(1);
      const [headline] = headlines;
      if (root === '/') expect(headline).toBeNull();
      else expect(headline, root).toMatch(root.startsWith('/tag/') ? /^Tag: \S/ : /^Category: \S/);
    }
  });
});

describe('R28: cards', () => {
  const cards = cardsOf('/');

  it('show the title, date and category of their post', () => {
    const wrong = cards.filter((card) => {
      const post = posts.get(card.href)!;
      return (
        card.title !== post.title ||
        card.date !== post.date ||
        (card.category ?? null) !== (post.category?.label ?? null)
      );
    });
    expect(wrong.map((card) => card.href)).toEqual([]);
  });

  it('show the same summary as the post gives search engines', () => {
    const wrong = cards.filter((card) => {
      const { description } = readPage(card.href).head;
      // A post with no text of its own has no summary on its card.
      return card.description !== '' && card.description !== normalizeText(description ?? '');
    });
    expect(wrong.map((card) => card.href)).toEqual([]);
  });

  it('read the same on every list a post is on', () => {
    const home = new Map(cards.map((card) => [card.href, JSON.stringify(card)]));
    const different: string[] = [];
    for (const root of lists.keys()) {
      for (const card of cardsOf(root)) {
        if (JSON.stringify(card) !== home.get(card.href)) different.push(`${root}: ${card.href}`);
      }
    }
    expect(different).toEqual([]);
  });
});

describe('R27: link posts', () => {
  const linkPosts = [...posts].filter(([, post]) => post.originalLink);

  it('has link posts and ordinary posts', () => {
    expect(linkPosts.length).toBeGreaterThan(100);
    expect(posts.size - linkPosts.length).toBeGreaterThan(100);
  });

  it('link to the article with a full address', () => {
    expect(linkPosts.filter(([, post]) => !/^https?:\/\/\S+$/.test(post.originalLink!)).map(([url]) => url)).toEqual([]);
  });

  it('say "Read commentary" on the card of a link post and "Read article" on the rest', () => {
    const wrong = cardsOf('/').filter(
      (card) => card.cta !== (posts.get(card.href)!.originalLink ? 'Read commentary' : 'Read article'),
    );
    expect(wrong.map((card) => card.href)).toEqual([]);
  });
});
