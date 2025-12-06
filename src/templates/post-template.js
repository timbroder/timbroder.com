import * as React from "react"
import {Link, graphql} from "gatsby"

import Layout from "../components/layout/layout"
import Seo from "../components/seo"
import Post from "../components/posts/post";
import Headline from "../components/content/headline";
import _ from "lodash";

/**
 * Normalize post data from either source
 */
function normalizePostData(data, pageContext) {
    const source = pageContext.source || 'markdown'

    if (source === 'markdown' && data.markdownRemark) {
        const post = data.markdownRemark
        return {
            source: 'markdown',
            title: post.frontmatter.title,
            date: post.frontmatter.date,
            dateISO: post.frontmatter.dateISO,
            description: post.frontmatter.description || post.excerpt,
            excerpt: post.excerpt,
            tags: post.frontmatter.tags,
            category: post.frontmatter.category,
            link: post.frontmatter.link,
            html: post.html,
            ogImage: null, // Markdown posts don't have custom OG images yet
            _original: post,
        }
    } else if (source === 'contentful' && data.contentfulBlogPost) {
        const post = data.contentfulBlogPost
        return {
            source: 'contentful',
            title: post.title,
            date: post.formattedDate,
            dateISO: post.date,
            description: post.description || '',
            excerpt: post.description || '',
            tags: post.tags,
            category: post.category,
            link: post.link,
            content: post.content,
            ogImage: post.ogImage?.file?.url ? `https:${post.ogImage.file.url}` : null,
            _original: post,
        }
    }

    return null
}

/**
 * Get previous/next post info based on source
 */
function getPrevNextInfo(data, pageContext) {
    const { previousPostSource, nextPostSource } = pageContext

    let previous = null
    let next = null

    // Get previous post
    if (previousPostSource === 'markdown' && data.previousMarkdown) {
        previous = {
            slug: data.previousMarkdown.fields?.slug,
            title: data.previousMarkdown.frontmatter?.title,
        }
    } else if (previousPostSource === 'contentful' && data.previousContentful) {
        previous = {
            slug: data.previousContentful.fields?.slug,
            title: data.previousContentful.title,
        }
    }

    // Get next post
    if (nextPostSource === 'markdown' && data.nextMarkdown) {
        next = {
            slug: data.nextMarkdown.fields?.slug,
            title: data.nextMarkdown.frontmatter?.title,
        }
    } else if (nextPostSource === 'contentful' && data.nextContentful) {
        next = {
            slug: data.nextContentful.fields?.slug,
            title: data.nextContentful.title,
        }
    }

    return { previous, next }
}

const BlogPostTemplate = ({
    data,
    location,
    pageContext,
}) => {
    const siteTitle = data.site.siteMetadata?.title || `Title`
    const postData = normalizePostData(data, pageContext)

    if (!postData) {
        return <Layout location={location} title={siteTitle}><p>Post not found</p></Layout>
    }

    const { tags, category } = postData

    return (
        <Layout location={location} title={siteTitle}>
            <article
                itemScope
                itemType="http://schema.org/Article"
            >
                <header className="flex flex-col">
                    <span className="flex flex-row mt-2">
                        <time
                            dateTime={postData.dateISO}
                            className="flex items-center text-base text-zinc-400"
                        >
                            <span className="h-4 w-0.5 rounded-full bg-zinc-200"/>
                            <span className="ml-3">{postData.date}</span>
                        </time>
                    </span>
                    <Headline padded={false}>
                        {postData.title}
                    </Headline>
                </header>
                <Post post={postData._original} source={postData.source}/>
                <footer className="flex flex-col">
                    <span className="flex flex-row mt-2">
                        {tags &&
                            <span className="ml-1 ">
                            {tags.map((tag) => (
                                <Link key={tag} to={`/tag/${_.kebabCase(tag)}/`}>
                                    <span
                                        className=" align-middle mx-1 px-3 py-0.5 rounded-full text-xs font-medium bg-zinc-800 text-white">{tag}</span>
                                </Link>
                            ))}
                            </span>
                        }
                        {category &&
                            <span className="flex items-center text-base text-zinc-400">
                                <span className="ml-3 h-4 w-0.5 rounded-full bg-zinc-200 "/>
                                <span className="ml-3 align-middle">
                                    <Link to={`/category/${_.kebabCase(category)}/`}>Category: <span className="underline"> {category}</span></Link>
                                </span>
                            </span>
                        }
                    </span>
                </footer>
            </article>
        </Layout>
    )
}

export const Head = ({data, location, pageContext}) => {
    const site = data.site
    const siteUrl = site.siteMetadata?.siteUrl
    const articleUrl = `${siteUrl}${location.pathname}`

    const postData = normalizePostData(data, pageContext)
    if (!postData) return null

    const ogImage = postData.ogImage || `${siteUrl}/og-image.png`

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": postData.title,
        "description": postData.description,
        "url": articleUrl,
        "datePublished": postData.dateISO,
        "author": {
            "@type": "Person",
            "name": site.siteMetadata?.author?.name,
            "url": siteUrl
        },
        "publisher": {
            "@type": "Person",
            "name": site.siteMetadata?.author?.name,
            "url": siteUrl
        },
        "image": ogImage,
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": articleUrl
        }
    }

    return (
        <>
            <Seo
                title={postData.title}
                description={postData.description}
                pathname={location.pathname}
                image={postData.ogImage}
            />
            <script type="application/ld+json">
                {JSON.stringify(jsonLd)}
            </script>
        </>
    )
}

export default BlogPostTemplate

export const pageQuery = graphql`
  query BlogPostBySlug(
    $id: String!
    $previousPostId: String
    $nextPostId: String
  ) {
    site {
      siteMetadata {
        title
        siteUrl
        author {
          name
        }
      }
    }
    markdownRemark(id: { eq: $id }) {
      id
      excerpt(pruneLength: 512)
      html
      frontmatter {
        title
        date(formatString: "MMMM DD, YYYY")
        dateISO: date(formatString: "YYYY-MM-DD")
        description
        tags
        category
        link
      }
    }
    contentfulBlogPost(id: { eq: $id }) {
      id
      title
      slug
      date
      formattedDate: date(formatString: "MMMM DD, YYYY")
      description
      tags
      category
      link
      content {
        raw
        references {
          ... on ContentfulAsset {
            contentful_id
            __typename
            gatsbyImageData(width: 800, placeholder: BLURRED)
            title
            description
          }
          ... on ContentfulCodeBlock {
            contentful_id
            __typename
            title
            language
            code {
              code
            }
            showLineNumbers
          }
        }
      }
      ogImage {
        file {
          url
        }
        gatsbyImageData(width: 1200, placeholder: BLURRED)
      }
    }
    previousMarkdown: markdownRemark(id: { eq: $previousPostId }) {
      fields {
        slug
      }
      frontmatter {
        title
      }
    }
    nextMarkdown: markdownRemark(id: { eq: $nextPostId }) {
      fields {
        slug
      }
      frontmatter {
        title
      }
    }
    previousContentful: contentfulBlogPost(id: { eq: $previousPostId }) {
      fields {
        slug
      }
      title
    }
    nextContentful: contentfulBlogPost(id: { eq: $nextPostId }) {
      fields {
        slug
      }
      title
    }
  }
`
