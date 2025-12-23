import * as React from "react"
import { useMemo, Fragment } from "react"
import { Link, graphql } from "gatsby"

import Layout from "../components/layout/layout"
import Seo from "../components/seo"
import Posts from "../components/posts/posts"
import Pagination from "../components/pagination"
import Headline from "../components/content/headline"

/**
 * Merge and sort posts from both Markdown and Contentful sources
 */
function mergePosts(markdownNodes = [], contentfulNodes = []) {
    const markdownPosts = markdownNodes.map(node => ({
        ...node,
        _source: 'markdown',
        _sortDate: new Date(node.frontmatter?.date || 0),
    }))

    const contentfulPosts = contentfulNodes.map(node => ({
        ...node,
        _source: 'contentful',
        _sortDate: new Date(node.date || 0),
    }))

    const allPosts = [...markdownPosts, ...contentfulPosts]
    allPosts.sort((a, b) => b._sortDate - a._sortDate)

    return allPosts
}

const CategoryTemplate = ({
    data,
    location,
    pageContext
}) => {
    const siteTitle = data.site.siteMetadata?.title
    const { category, currentPage, numPages, basePath } = pageContext

    const posts = useMemo(() => {
        const markdownNodes = data.allMarkdownRemark?.nodes || []
        const contentfulNodes = data.allContentfulBlogPost?.nodes || []
        return mergePosts(markdownNodes, contentfulNodes)
    }, [data])

    return (
        <Layout location={location} title={siteTitle}>
            <header className="flex flex-col">
                <Headline>
                    {`Category: ${category}`}
                </Headline>
            </header>
            <Posts posts={posts} />
            <Pagination
                currentPage={currentPage}
                numPages={numPages}
                basePath={basePath}
            />
        </Layout>
    )
}

export const Head = ({ pageContext, location }) => {
    const { category, currentPage, numPages, basePath } = pageContext
    const isFirst = currentPage === 1
    const isLast = currentPage === numPages
    const prevPage = currentPage - 1 === 1 ? basePath : `${basePath}page/${currentPage - 1}/`
    const nextPage = `${basePath}page/${currentPage + 1}/`
    const title = currentPage === 1 ? `Category: ${category}` : `Category: ${category} - Page ${currentPage}`

    return (
        <Fragment>
            <Seo
                title={title}
                pathname={location.pathname}
            />
            {!isFirst && <link rel="prev" href={prevPage} />}
            {!isLast && <link rel="next" href={nextPage} />}
        </Fragment>
    )
}

export default CategoryTemplate

export const pageQuery = graphql`
    query BlogPostByCategory($category: String) {
        site {
            siteMetadata {
                title
            }
        }
        allMarkdownRemark(
            sort: { frontmatter: { date: DESC } }
            filter: { frontmatter: { draft: { ne: true }, category: { eq: $category }, layout: { eq: "post" } } }
        ) {
            nodes {
                excerpt(pruneLength: 512)
                fields {
                    slug
                }
                frontmatter {
                    title
                    date(formatString: "MMMM DD, YYYY")
                    description
                    category
                    link
                }
            }
        }
        allContentfulBlogPost(
            sort: { date: DESC }
            filter: { draft: { ne: true }, category: { eq: $category } }
        ) {
            nodes {
                id
                title
                slug
                date
                formattedDate: date(formatString: "MMMM DD, YYYY")
                description
                category
                link
                fields {
                    slug
                }
            }
        }
    }
`
