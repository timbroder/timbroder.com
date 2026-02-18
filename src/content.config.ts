import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'

// Helper for fields that might be YAML null
const nullableString = z.string().nullable().optional().transform(v => v ?? undefined)
const nullableBool = z.boolean().nullable().optional().transform(v => v ?? undefined)
const nullableNumber = z.number().nullable().optional().transform(v => v ?? undefined)

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    layout: z.string().nullable().default('post').transform(v => v ?? 'post'),
    tags: z.array(z.string().nullable()).nullable().optional().default([]).transform(
      (tags) => (tags || []).filter((t): t is string => t !== null && t !== '')
    ),
    category: nullableString,
    categories: z.array(z.string()).nullable().optional(),
    link: nullableString,
    description: nullableString,
    draft: nullableBool,
    slug: nullableString,
    // Legacy fields
    wordpress_id: nullableNumber,
    dsq_thread_id: z.union([z.string(), z.number()]).nullable().optional().transform(v => v != null ? String(v) : undefined),
    author: nullableString,
    comments: nullableBool,
    excerpt: nullableString,
    path: nullableString,
  })
})

const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    layout: z.string(),
    path: z.string(),
  })
})

export const collections = { blog, pages }
