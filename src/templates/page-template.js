import * as React from "react"
import {Link, graphql} from "gatsby"

import Layout from "../components/layout/layout"
import Seo from "../components/seo"
import Post from "../components/posts/post";
import Headline from "../components/content/headline";
import _ from "lodash";

const BlogPostTemplate = ({
                              data: {site, markdownRemark: post},
                              location,
                          }) => {
    const siteTitle = site.siteMetadata?.title || `Title`

    return (
        <Layout location={location} title={siteTitle}>
            <header className="flex flex-col">
                <Headline padded={false}>
                    {post.frontmatter.title}
                </Headline>
            </header>
            <Post post={post}/>
        </Layout>
    )
}

export const Head = ({data: {markdownRemark: post}}) => {
    return (
        <Seo
            title={post.frontmatter.title}
            description={post.frontmatter.description || post.excerpt}
        />
    )
}

export default BlogPostTemplate

export const pageQuery = graphql`
  query BlogPostBySlug(
    $id: String!
  ) {
    site {
      siteMetadata {
        title
      }
    }
    markdownRemark(id: { eq: $id }) {
      id
      excerpt(pruneLength: 512)
      html
      frontmatter {
        title
        date(formatString: "MMMM DD, YYYY")
        description
        tags
        category
        link
      }
    }
  }
`
