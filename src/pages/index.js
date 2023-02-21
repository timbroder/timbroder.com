import * as React from "react"
import { Link, graphql } from "gatsby"

import Bio from "../components/bio"
import Layout from "../components/layout/layout"
import Seo from "../components/seo"
import Posts from "../components/posts/posts";
import {Fragment} from "react";

const BlogIndex = ({ data, location }) => {
  const siteTitle = data.site.siteMetadata?.title || `Title`
  const posts = data.allMarkdownRemark.nodes

  return (
    <Layout location={location} title={siteTitle}>
      {/*<Bio />*/}
        <Posts posts={posts}/>
    </Layout>
  )
}

export default BlogIndex

/**
 * Head export to define metadata for the page
 *
 * See: https://www.gatsbyjs.com/docs/reference/built-in-components/gatsby-head/
 */
export const Head = () => (
  <Fragment>
    <Seo title="TimBroder.com Posts" />
    <a rel="me" href="https://masto.ai/@timothybroder">Mastodon</a>
    <link
        key={`gatsby-plugin-feed-0`}
        rel="alternate"
        type="application/rss+xml"
        title="TimBroder.com RSS Feed"
        href="https://feeds.feedburner.com/timbroder"
    />
  </Fragment>
)

export const pageQuery = graphql`
  {
    site {
      siteMetadata {
        title
      }
    }
    allMarkdownRemark(
      sort: { frontmatter: { date: DESC } },
      filter: { frontmatter: { layout: { eq: "post" }, draft: { ne: true } } }
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
