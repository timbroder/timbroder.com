import { getCollection } from 'astro:content'
import { getContentfulPosts } from './contentful'
import { extractRichTextExcerpt } from './render-rich-text'

export interface NormalizedPost {
  source: 'markdown' | 'contentful'
  slug: string
  title: string
  date: Date
  formattedDate: string
  description: string
  category?: string
  tags: string[]
  link?: string
  // Markdown-specific
  markdownId?: string
  entry?: any // raw collection entry for rendering
  body?: string
  // Contentful-specific
  content?: any
  ogImage?: string
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: '2-digit',
  })
}

function pad2(n: number): string {
  return n.toString().padStart(2, '0')
}

/**
 * Generate slug from a markdown post's data and file id.
 * Uses date-based URL pattern: /{YYYY}/{MM}/{slug}/
 */
export function getSlugFromPost(data: any, fileId: string): string {
  const date = new Date(data.date)
  const yyyy = date.getUTCFullYear()
  const mm = pad2(date.getUTCMonth() + 1)

  // 1. If frontmatter has `path:` → use that directly
  if (data.path) {
    // Ensure trailing slash
    let p = data.path
    if (!p.endsWith('/')) p += '/'
    return p
  }

  // 2. If frontmatter has `slug:` + `date:` → /{YYYY}/{MM}/{slug}/
  if (data.slug) {
    return `/${yyyy}/${mm}/${data.slug}/`
  }

  // 3. Otherwise → strip date prefix from filename and use that
  // fileId looks like "2007-07-15-begining.markdown" or similar
  const fileName = fileId
    .replace(/\.md$/, '')
    .replace(/\.markdown$/, '')
  const adjusted = fileName.replace(/^\d{4}-\d{2}-\d{2}-/, '')
  return `/${yyyy}/${mm}/${adjusted}/`
}

/**
 * Generate slug for Contentful posts: /{YYYY}/{MM}/{slug}/
 */
function getContentfulSlug(date: string, slug: string): string {
  const d = new Date(date)
  const yyyy = d.getUTCFullYear()
  const mm = pad2(d.getUTCMonth() + 1)
  return `/${yyyy}/${mm}/${slug}/`
}

/**
 * Generate a plain-text excerpt from markdown body content.
 * Strips markdown syntax and returns the first ~160 characters at a word boundary.
 */
function generateExcerpt(body: string | undefined, maxLength = 160): string {
  if (!body) return ''

  let text = body
    // Remove code blocks (fenced)
    .replace(/```[\s\S]*?```/g, '')
    // Remove code blocks (indented) - skip lines starting with 4+ spaces after a blank line
    // Remove inline code
    .replace(/`[^`]+`/g, '')
    // Remove images
    .replace(/!\[.*?\]\(.*?\)/g, '')
    // Remove links but keep text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove headings
    .replace(/^#{1,6}\s+/gm, '')
    // Remove bold/italic markers
    .replace(/(\*{1,3}|_{1,3})(.*?)\1/g, '$2')
    // Remove blockquotes
    .replace(/^>\s?/gm, '')
    // Remove horizontal rules
    .replace(/^[-*_]{3,}\s*$/gm, '')
    // Remove HTML tags
    .replace(/<[^>]+>/g, '')
    // Collapse whitespace
    .replace(/\s+/g, ' ')
    .trim()

  if (text.length <= maxLength) return text

  // Trim to word boundary
  const trimmed = text.slice(0, maxLength)
  const lastSpace = trimmed.lastIndexOf(' ')
  return (lastSpace > 0 ? trimmed.slice(0, lastSpace) : trimmed) + '…'
}

function kebabCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Get all markdown blog posts, normalized
 */
async function getMarkdownPosts(): Promise<NormalizedPost[]> {
  const collection = await getCollection('blog')

  return collection
    .filter(entry => !entry.data.draft && entry.data.layout === 'post')
    .map(entry => {
      const slug = getSlugFromPost(entry.data, entry.id)
      return {
        source: 'markdown' as const,
        slug,
        title: entry.data.title,
        date: new Date(entry.data.date),
        formattedDate: formatDate(new Date(entry.data.date)),
        description: entry.data.description || entry.data.excerpt || generateExcerpt(entry.body),
        category: entry.data.category,
        tags: entry.data.tags || [],
        link: entry.data.link,
        markdownId: entry.id,
        entry: entry,
        body: entry.body,
      }
    })
}

/**
 * Get all Contentful posts, normalized
 */
async function getContentfulNormalizedPosts(): Promise<NormalizedPost[]> {
  const posts = await getContentfulPosts()

  return posts.map(post => {
    const slug = getContentfulSlug(post.date, post.slug)
    const excerpt = post.description || extractRichTextExcerpt(post.content)

    return {
      source: 'contentful' as const,
      slug,
      title: post.title,
      date: new Date(post.date),
      formattedDate: formatDate(new Date(post.date)),
      description: excerpt,
      category: post.category,
      tags: post.tags || [],
      link: post.link,
      content: post.content,
      ogImage: post.ogImage?.fields?.file?.url
        ? `https:${post.ogImage.fields.file.url}`
        : undefined,
    }
  })
}

/**
 * Get all posts merged from markdown + Contentful, sorted by date DESC.
 * Markdown takes priority on slug conflicts.
 */
export async function getAllPosts(): Promise<NormalizedPost[]> {
  const [markdownPosts, contentfulPosts] = await Promise.all([
    getMarkdownPosts(),
    getContentfulNormalizedPosts(),
  ])

  const markdownSlugs = new Set(markdownPosts.map(p => p.slug))

  const filteredContentful = contentfulPosts.filter(p => {
    if (markdownSlugs.has(p.slug)) {
      console.warn(`Contentful post "${p.title}" conflicts with markdown slug "${p.slug}". Markdown wins.`)
      return false
    }
    return true
  })

  const all = [...markdownPosts, ...filteredContentful]
  all.sort((a, b) => b.date.getTime() - a.date.getTime())
  return all
}

/**
 * Get all markdown pages (layout: 'page')
 */
export async function getPages() {
  const collection = await getCollection('pages')
  return collection
}

/**
 * Get posts filtered by tag (case-insensitive)
 */
export function filterByTag(posts: NormalizedPost[], tag: string): NormalizedPost[] {
  return posts.filter(post =>
    post.tags.some(t => t.toLowerCase() === tag.toLowerCase())
  )
}

/**
 * Get posts filtered by category (case-insensitive)
 */
export function filterByCategory(posts: NormalizedPost[], category: string): NormalizedPost[] {
  return posts.filter(post =>
    post.category && post.category.toLowerCase() === category.toLowerCase()
  )
}

/**
 * Collect all unique tags with counts
 */
export function getAllTags(posts: NormalizedPost[]): Map<string, { name: string; slug: string; count: number }> {
  const tags = new Map<string, { name: string; slug: string; count: number }>()
  posts.forEach(post => {
    post.tags.forEach(tag => {
      const tagSlug = kebabCase(tag)
      const existing = tags.get(tagSlug)
      if (existing) {
        existing.count++
      } else {
        tags.set(tagSlug, { name: tag, slug: tagSlug, count: 1 })
      }
    })
  })
  return tags
}

/**
 * Collect all unique categories with counts
 */
export function getAllCategories(posts: NormalizedPost[]): Map<string, { name: string; slug: string; count: number }> {
  const categories = new Map<string, { name: string; slug: string; count: number }>()
  posts.forEach(post => {
    if (post.category) {
      const catSlug = kebabCase(post.category)
      const existing = categories.get(catSlug)
      if (existing) {
        existing.count++
      } else {
        categories.set(catSlug, { name: post.category, slug: catSlug, count: 1 })
      }
    }
  })
  return categories
}
