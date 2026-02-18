import { createClient } from 'contentful'

function getClient() {
  const spaceId = import.meta.env.CONTENTFUL_SPACE_ID
  const accessToken = import.meta.env.CONTENTFUL_ACCESS_TOKEN

  if (!spaceId || !accessToken) {
    return null
  }

  return createClient({
    space: spaceId,
    accessToken: accessToken,
  })
}

export interface ContentfulBlogPost {
  title: string
  slug: string
  date: string
  description?: string
  category?: string
  tags?: string[]
  link?: string
  draft?: boolean
  content?: any
  ogImage?: {
    fields: {
      file: {
        url: string
      }
      title?: string
      description?: string
    }
  }
}

export async function getContentfulPosts(): Promise<ContentfulBlogPost[]> {
  const client = getClient()
  if (!client) {
    console.warn('Contentful credentials not configured, skipping Contentful posts')
    return []
  }

  try {
    const entries = await client.getEntries({
      content_type: 'blogPost',
      order: ['-fields.date'],
      limit: 1000,
      include: 2,
    })

    return entries.items
      .map((item: any) => ({
        title: item.fields.title,
        slug: item.fields.slug,
        date: item.fields.date,
        description: item.fields.description || '',
        category: item.fields.category || undefined,
        tags: item.fields.tags || [],
        link: item.fields.link || undefined,
        draft: item.fields.draft || false,
        content: item.fields.content || undefined,
        ogImage: item.fields.ogImage || undefined,
      }))
      .filter((post: ContentfulBlogPost) => !post.draft)
  } catch (error) {
    console.error('Failed to fetch Contentful posts:', error)
    return []
  }
}
