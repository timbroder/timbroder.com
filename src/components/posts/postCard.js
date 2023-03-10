import * as React from "react"
import {Card} from "../content/card";

export default function PostCard({ post: post, showDesc: showDesc = true }) {
    const title = post.frontmatter.title || post.fields.slug

    return (
        <article className="md:grid md:grid-cols-4 md:items-baseline">
            <Card className="md:col-span-3">
                <Card.Title href={post.fields.slug}>
                    {title}
                </Card.Title>
                <Card.Eyebrow
                    as="time"
                    dateTime={post.frontmatter.date}
                    className="md:hidden"
                    decorate
                >
                    {post.frontmatter.date}

                    {post.frontmatter.category &&
                        <span>&nbsp;in {post.frontmatter.category}</span>
                    }
                </Card.Eyebrow>
                {showDesc &&
                    <Card.Description>{post.frontmatter.description || post.excerpt}</Card.Description>
                }
                <Card.Cta>Read {post.frontmatter.link ? 'commentary' : 'article'}</Card.Cta>
            </Card>
            <Card.Eyebrow
                as="time"
                dateTime={post.frontmatter.date}
                className="mt-1 hidden md:block"
            >
                {post.frontmatter.date}
                {post.frontmatter.category &&
                <span>&nbsp;in {post.frontmatter.category}</span>
            }
            </Card.Eyebrow>
        </article>
    )
}