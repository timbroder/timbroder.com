import * as React from "react"
import { Link, graphql } from "gatsby"
import { Fragment } from "react"

import Layout from "../components/layout/layout"
import Seo from "../components/seo"
import Posts from "../components/posts/posts"
import Pagination from "../components/pagination"
import Headline from "../components/content/headline"

const CategoryTemplate = ({
    data,
    location,
    pageContext
}) => {
    const posts = data.allMarkdownRemark.nodes
    const siteTitle = data.site.siteMetadata?.title
    const { category, currentPage, numPages, basePath } = pageContext

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
    query BlogPostByCategory($category: String, $skip: Int!, $limit: Int!) {
        site {
            siteMetadata {
                title
            }
        }
        allMarkdownRemark(
            sort: { frontmatter: { date: DESC } }
            filter: { frontmatter: { draft: { ne: true }, category: { eq: $category }, layout: { eq: "post" } } }
            limit: $limit
            skip: $skip
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
                }
            }
        }
    }
`
