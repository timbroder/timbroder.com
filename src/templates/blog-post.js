import * as React from "react"
import {Link, graphql} from "gatsby"

import Layout from "../components/layout/layout"
import Seo from "../components/seo"
import Post from "../components/posts/post";
import Headline from "../components/content/headline";
import _ from "lodash";
import {Fragment} from "react";

const BlogPostTemplate = ({
                              data: {previous, next, site, markdownRemark: post},
                              location,
                          }) => {
    const siteTitle = site.siteMetadata?.title || `Title`
    const tags = post.frontmatter.tags;
    const category = post.frontmatter.category;

    return (
        <Layout location={location} title={siteTitle}>
            <article
                itemScope
                itemType="http://schema.org/Article"
            >
                <header className="flex flex-col">
                    <Headline padded={false}>
                        {post.frontmatter.title}
                    </Headline>
                    <span className="flex flex-row mt-2">
                        <time
                            dateTime={post.frontmatter.date}
                            className="flex items-center text-base text-zinc-400"
                        >
                            <span className="h-4 w-0.5 rounded-full bg-zinc-200"/>
                            <span className="ml-3">{post.frontmatter.date}</span>
                        </time>
                        {tags &&
                            <span className="ml-1 ">
                            {tags.map((tag) => (
                                <Link to={`/tag/${_.kebabCase(tag)}/`}>
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


                </header>
                <Post post={post}/>
                {/*<header>*/}
                {/*  <h1 itemProp="headline">{post.frontmatter.title}</h1>*/}
                {/*  <p>{post.frontmatter.date}</p>*/}
                {/*</header>*/}
                {/*<section*/}
                {/*  dangerouslySetInnerHTML={{ __html: post.html }}*/}
                {/*  itemProp="articleBody"*/}
                {/*/>*/}
                {/*<hr />*/}
                {/*<footer>*/}
                {/*  <Bio />*/}
                {/*</footer>*/}
            </article>
            {/*<nav className="blog-post-nav">*/}
            {/*  <ul*/}
            {/*    style={{*/}
            {/*      display: `flex`,*/}
            {/*      flexWrap: `wrap`,*/}
            {/*      justifyContent: `space-between`,*/}
            {/*      listStyle: `none`,*/}
            {/*      padding: 0,*/}
            {/*    }}*/}
            {/*  >*/}
            {/*    <li>*/}
            {/*      {previous && (*/}
            {/*        <Link to={previous.fields.slug} rel="prev">*/}
            {/*          ← {previous.frontmatter.title}*/}
            {/*        </Link>*/}
            {/*      )}*/}
            {/*    </li>*/}
            {/*    <li>*/}
            {/*      {next && (*/}
            {/*        <Link to={next.fields.slug} rel="next">*/}
            {/*          {next.frontmatter.title} →*/}
            {/*        </Link>*/}
            {/*      )}*/}
            {/*    </li>*/}
            {/*  </ul>*/}
            {/*</nav>*/}
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
    $previousPostId: String
    $nextPostId: String
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
      }
    }
    previous: markdownRemark(id: { eq: $previousPostId }) {
      fields {
        slug
      }
      frontmatter {
        title
      }
    }
    next: markdownRemark(id: { eq: $nextPostId }) {
      fields {
        slug
      }
      frontmatter {
        title
      }
    }
  }
`
