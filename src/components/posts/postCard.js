import * as React from "react"
import {Card} from "../content/card";

/**
 * Normalize post data from either Markdown or Contentful source
 */
function normalizePost(post) {
    // Check if this is a Contentful post (has direct properties) or Markdown (has frontmatter)
    if (post.frontmatter) {
        // Markdown post
        return {
            slug: post.fields?.slug,
            title: post.frontmatter.title || post.fields?.slug,
            date: post.frontmatter.date,
            category: post.frontmatter.category,
            description: post.frontmatter.description || post.excerpt,
            link: post.frontmatter.link,
        }
    } else {
        // Contentful post
        return {
            slug: post.fields?.slug,
            title: post.title || post.fields?.slug,
            date: post.formattedDate || post.date,
            category: post.category,
            description: post.description || '',
            link: post.link,
        }
    }
}

export default function PostCard({ post: post, showDesc: showDesc = true }) {
    const normalized = normalizePost(post)
    const title = normalized.title

    return (
        <article className="md:grid md:grid-cols-4 md:items-baseline">
            <Card className="md:col-span-3">
                <Card.Title href={normalized.slug}>
                    {title}
                </Card.Title>
                <Card.Eyebrow
                    as="time"
                    dateTime={normalized.date}
                    className="md:hidden"
                    decorate
                >
                    {normalized.date}

                    {normalized.category &&
                        <span>&nbsp;in {normalized.category}</span>
                    }
                </Card.Eyebrow>
                {showDesc &&
                    <Card.Description>{normalized.description}</Card.Description>
                }
                <Card.Cta>Read {normalized.link ? 'commentary' : 'article'}</Card.Cta>
            </Card>
            <Card.Eyebrow
                as="time"
                dateTime={normalized.date}
                className="mt-1 hidden md:block"
            >
                {normalized.date}
                {normalized.category &&
                <span>&nbsp;in {normalized.category}</span>
            }
            </Card.Eyebrow>
        </article>
    )
}
