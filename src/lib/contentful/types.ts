/**
 * The parts of Contentful's Content Delivery API that this site reads.
 *
 * Two content types exist in the space:
 *
 *   blogPost   title, slug, date, draft, description, category, tags, link,
 *              content (rich text), ogImage (an asset)
 *   codeBlock  title, language, code, showLineNumbers
 *              (embedded in a post's rich text)
 */

export const POST_TYPE = 'blogPost';
export const CODE_BLOCK_TYPE = 'codeBlock';

/** A reference to another entry or an asset, as it appears inside fields and rich text. */
export interface Link {
  sys: { type: 'Link'; linkType: string; id: string };
}

export interface Entry {
  sys: {
    id: string;
    type: 'Entry';
    contentType: { sys: { id: string } };
  };
  fields: Record<string, unknown>;
}

export interface Asset {
  sys: { id: string; type: 'Asset' };
  fields: {
    title?: string;
    description?: string;
    file?: {
      /** Starts with "//": the address without its scheme. */
      url: string;
      contentType: string;
      fileName?: string;
      details?: { size?: number; image?: { width: number; height: number } };
    };
  };
}

/** One answer from the API's entries endpoint. */
export interface EntriesResponse {
  total: number;
  skip: number;
  limit: number;
  items: Entry[];
  /** Entries and assets that the items link to. */
  includes?: { Entry?: Entry[]; Asset?: Asset[] };
}

/** Everything read from Contentful, ready for links to be looked up. */
export interface ContentfulContent {
  /** The blog post entries, published and not. */
  posts: Entry[];
  /** Every entry by id: the posts and whatever they embed. */
  entries: Map<string, Entry>;
  assets: Map<string, Asset>;
}

export function isLink(value: unknown): value is Link {
  const sys = (value as Link | undefined)?.sys;
  return sys?.type === 'Link' && typeof sys.id === 'string';
}

/** Turns the answers from the API into one set of posts, entries and assets. */
export function collect(pages: EntriesResponse[]): ContentfulContent {
  const entries = new Map<string, Entry>();
  const assets = new Map<string, Asset>();
  const posts = new Map<string, Entry>();
  for (const page of pages) {
    for (const item of page.items) {
      entries.set(item.sys.id, item);
      if (item.sys.contentType?.sys.id === POST_TYPE) posts.set(item.sys.id, item);
    }
    for (const entry of page.includes?.Entry ?? []) {
      if (!entries.has(entry.sys.id)) entries.set(entry.sys.id, entry);
    }
    for (const asset of page.includes?.Asset ?? []) assets.set(asset.sys.id, asset);
  }
  return { posts: [...posts.values()], entries, assets };
}
