import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';

// Content stays where it has always lived, in /content.
// Files without an extension are deliberately not matched: three old posts
// have none and have never been published.
const blog = defineCollection({
  loader: glob({ base: './content/blog', pattern: '*.md' }),
});

const pages = defineCollection({
  loader: glob({ base: './content/pages', pattern: '*.md' }),
});

export const collections = { blog, pages };
