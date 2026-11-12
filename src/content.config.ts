import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { parseFrontmatterDate } from './lib/legacy-url.ts';
import { CLEAN_SLUG } from './lib/slug.ts';

// Old posts carry empty values in many shapes: null, '', and the text "None".
const blank = (value: unknown) =>
  value === null || value === undefined || value === '' || value === 'None';

const optionalText = z.preprocess(
  (value) => (blank(value) ? undefined : typeof value === 'number' ? String(value) : value),
  z.string().optional(),
);

const post = z.looseObject({
  title: z.preprocess(
    (value) => (typeof value === 'number' ? String(value) : value),
    z
      .string({ error: 'A post needs a title. If it starts with "#", put it in quotes.' })
      .trim()
      .min(1, 'A post needs a title.'),
  ),

  // Dates are read as UTC; see parseFrontmatterDate.
  date: z.preprocess(
    (value) => parseFrontmatterDate(value) ?? value,
    z.date({ error: 'A post needs a date, for example 2026-11-11 or 2026-11-11 09:30.' }),
  ),

  // Optional: without it the slug comes from the file name. Either way it
  // must be clean, which src/lib/post-model.ts checks.
  slug: z
    .string()
    .regex(CLEAN_SLUG, 'A slug may only contain lowercase letters, digits and single hyphens.')
    .optional(),

  // Old URLs of this post. Each one becomes a redirect to the post.
  redirect_from: z.preprocess(
    (value) => (blank(value) ? [] : value),
    z.array(z.string().startsWith('/').endsWith('/')),
  ),

  // The article a link post comments on.
  link: z.preprocess(
    (value) => (blank(value) ? undefined : value),
    z.url({ protocol: /^https?$/, error: 'link must be a full http(s) URL.' }).optional(),
  ),

  tags: z.preprocess(
    (value) =>
      Array.isArray(value)
        ? value.filter((tag) => !blank(tag)).map((tag) => String(tag).trim())
        : blank(value)
          ? []
          : value,
    z.array(z.string()),
  ),

  category: optionalText,
  description: optionalText,
  draft: z.preprocess((value) => (blank(value) ? false : value), z.boolean()),

  // Set on posts written with AI help. Not displayed; the attribution line is
  // in the post body.
  ai_assisted: z.boolean().optional(),
  ai_model: z.string().optional(),
});

const page = z.looseObject({
  title: z.string().trim().min(1),
  // The page's URL, for example /projects
  path: z.string().startsWith('/'),
  description: optionalText,
});

// Content stays where it has always lived, in /content. Files without an
// extension are deliberately not matched: three old posts have none and have
// never been published.
const blog = defineCollection({
  loader: glob({
    base: './content/blog',
    pattern: '*.md',
    // The file name, so every post has a unique id. The default would use
    // `slug:` from frontmatter, and two posts in different months can share one.
    generateId: ({ entry }) => entry.replace(/\.md$/, ''),
  }),
  schema: post,
});

const pages = defineCollection({
  loader: glob({
    base: './content/pages',
    pattern: '*.md',
    generateId: ({ entry }) => entry.replace(/\.md$/, ''),
  }),
  schema: page,
});

export const collections = { blog, pages };
