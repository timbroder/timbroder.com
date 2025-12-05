import * as React from "react"
import { Link, graphql } from "gatsby"
import { Fragment } from "react"

import Layout from "../components/layout/layout"
import Seo from "../components/seo"
import Posts from "../components/posts/posts"
import Pagination from "../components/pagination"

const BlogListTemplate = ({ data, location, pageContext }) => {
    const siteTitle = data.site.siteMetadata?.title || `Title`
    const posts = data.allMarkdownRemark.nodes
    const { currentPage, numPages } = pageContext

    return (
        <Layout location={location} title={siteTitle}>
            <Posts posts={posts} />
            <Pagination
                currentPage={currentPage}
                numPages={numPages}
                basePath="/"
            />
        </Layout>
    )
}

export default BlogListTemplate

export const Head = ({ location, pageContext }) => {
    const { currentPage, numPages } = pageContext
    const isFirst = currentPage === 1
    const isLast = currentPage === numPages
    const prevPage = currentPage - 1 === 1 ? "/" : `/page/${currentPage - 1}/`
    const nextPage = `/page/${currentPage + 1}/`
    const title = currentPage === 1 ? "TimBroder.com Posts" : `TimBroder.com Posts - Page ${currentPage}`

    return (
        <Fragment>
            <Seo title={title} pathname={location.pathname} />
            <link key="mastodon" rel="me" href="https://masto.ai/@timothybroder" />
            <link
                key="gatsby-plugin-feed-0"
                rel="alternate"
                type="application/rss+xml"
                title="TimBroder.com RSS Feed"
                href="https://feeds.feedburner.com/timbroder"
            />
            {!isFirst && <link rel="prev" href={prevPage} />}
            {!isLast && <link rel="next" href={nextPage} />}
        </Fragment>
    )
}

export const pageQuery = graphql`
    query BlogListQuery($skip: Int!, $limit: Int!) {
        site {
            siteMetadata {
                title
            }
        }
        allMarkdownRemark(
            sort: { frontmatter: { date: DESC } }
            filter: { frontmatter: { layout: { eq: "post" }, draft: { ne: true } } }
            limit: $limit
            skip: $skip
        ) {
            nodes {
                excerpt(pruneLength: 512)
                fields {
                    slug
                }
                frontmatter {
                    date(formatString: "MMMM DD, YYYY")
                    title
                    description
                    category
                }
            }
        }
    }
`
