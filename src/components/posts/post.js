import * as React from "react"
import {Card} from "./card";
import {formatDate} from "../../lib/formatDate";

export default function Post({ post: post }) {
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
                </Card.Eyebrow>
                <Card.Description>{post.frontmatter.description}</Card.Description>
                <Card.Cta>Read article</Card.Cta>
            </Card>
            <Card.Eyebrow
                as="time"
                dateTime={post.frontmatter.date}
                className="mt-1 hidden md:block"
            >
                {post.frontmatter.date}
            </Card.Eyebrow>
        </article>
    )
}