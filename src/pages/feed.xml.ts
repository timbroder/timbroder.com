import rss from '@astrojs/rss'
import type { APIContext } from 'astro'
import { getAllPosts } from '../lib/posts'

export async function GET(context: APIContext) {
  const posts = await getAllPosts()

  return rss({
    title: 'TimBroder.com RSS Feed',
    description: 'Tim Broder is a creative technologist',
    site: context.site!.toString(),
    items: posts.map(post => ({
      title: post.title,
      pubDate: post.date,
      description: post.description,
      link: post.slug,
    })),
  })
}
