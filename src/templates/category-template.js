import * as React from "react"
import {Link, graphql} from "gatsby"

import Bio from "../components/bio"
import Layout from "../components/layout/layout"
import Seo from "../components/seo"
import {Prose} from "../components/content/pros";
import Posts from "../components/posts/posts";
import Headline from "../components/content/headline";

const TagTemplate = ({
                         data,
                         location,
                         pageContext
                     }) => {
    const posts = data.allMarkdownRemark.nodes
    const siteTitle = data.site.siteMetadata?.title

    return (
        <Layout location={location} title={siteTitle}>
            <header className="flex flex-col">
                <Headline>
                    {`Category: ${pageContext.category}`}
                </Headline>
            </header>
            <Posts posts={posts}/>
        </Layout>
    )
}

export const Head = ({pageContext}) => {
    return (
        <Seo
            title={`Category: ${pageContext.category}`}
        />
    )
}

export default TagTemplate

export const pageQuery = graphql`
  query BlogPostByCategory($category: String) {
    site {
      siteMetadata {
        title
      }
    }
    allMarkdownRemark(
        sort: { frontmatter: { date: ASC } },
        filter: { frontmatter: { draft: { ne: true }, category: { eq: $category }, layout: { eq: "post" }} }
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
  }}
`
