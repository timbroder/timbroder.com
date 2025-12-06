/**
 * Utility to merge and normalize posts from Markdown and Contentful sources
 */

const moment = require('moment')

/**
 * Normalize a Markdown post to a common shape
 */
function normalizeMarkdownPost(node) {
  return {
    id: node.id,
    source: 'markdown',
    slug: node.fields?.slug,
    title: node.frontmatter?.title,
    date: node.frontmatter?.date,
    dateISO: node.frontmatter?.date,
    description: node.frontmatter?.description || node.excerpt,
    excerpt: node.excerpt,
    category: node.frontmatter?.category,
    tags: node.frontmatter?.tags || [],
    link: node.frontmatter?.link,
    html: node.html,
    // Keep original node for any additional data needed
    _original: node,
  }
}

/**
 * Normalize a Contentful post to a common shape
 */
function normalizeContentfulPost(node) {
  const dateForSlug = moment(node.date).format('YYYY/MM/')
  const slug = `/${dateForSlug}${node.slug}/`

  return {
    id: node.id,
    source: 'contentful',
    slug,
    title: node.title,
    date: node.date,
    dateISO: node.date,
    description: node.description || '',
    excerpt: node.description || '',
    category: node.category,
    tags: node.tags || [],
    link: node.link,
    // Rich text content - will be rendered differently
    content: node.content,
    ogImage: node.ogImage,
    // Keep original node for any additional data needed
    _original: node,
  }
}

/**
 * Merge posts from both sources, sorted by date descending
 * Markdown posts take priority if there are slug conflicts
 */
function mergePosts(markdownNodes = [], contentfulNodes = []) {
  const markdownPosts = markdownNodes.map(normalizeMarkdownPost)
  const contentfulPosts = contentfulNodes.map(normalizeContentfulPost)

  // Create a set of markdown slugs for conflict detection
  const markdownSlugs = new Set(markdownPosts.map(p => p.slug))

  // Filter out contentful posts that conflict with markdown
  const filteredContentfulPosts = contentfulPosts.filter(p => {
    if (markdownSlugs.has(p.slug)) {
      console.warn(`Contentful post "${p.title}" has conflicting slug "${p.slug}" with a Markdown post. Markdown takes priority.`)
      return false
    }
    return true
  })

  // Merge and sort by date descending
  const allPosts = [...markdownPosts, ...filteredContentfulPosts]
  allPosts.sort((a, b) => new Date(b.date) - new Date(a.date))

  return allPosts
}

/**
 * Filter posts by tag
 */
function filterByTag(posts, tag) {
  return posts.filter(post =>
    post.tags && post.tags.some(t =>
      t.toLowerCase() === tag.toLowerCase()
    )
  )
}

/**
 * Filter posts by category
 */
function filterByCategory(posts, category) {
  return posts.filter(post =>
    post.category && post.category.toLowerCase() === category.toLowerCase()
  )
}

module.exports = {
  normalizeMarkdownPost,
  normalizeContentfulPost,
  mergePosts,
  filterByTag,
  filterByCategory,
}
