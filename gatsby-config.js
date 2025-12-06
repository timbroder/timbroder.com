/**
 * Configure your Gatsby site with this file.
 *
 * See: https://www.gatsbyjs.com/docs/reference/config-files/gatsby-config/
 */

require("dotenv").config({
  path: `.env.${process.env.NODE_ENV}`,
})

/**
 * @type {import('gatsby').GatsbyConfig}
 */
module.exports = {
  siteMetadata: {
    title: `Tim Broder .com`,
    author: {
      name: `Tim Broder`,
      summary: `Code, Comics, Crossfit, and now, D&D.`,
      since: `2007`,
    },
    description: `Tim Broder is a creative technologist`,
    siteUrl: `https://timbroder.com/`,
    nav: [
      {
        title: 'Posts',
        slug: '/'
      },
      {
        title: 'Podcasts',
        slug: '/podcasts/'
      },
      {
        title: 'Projects',
        slug: '/projects/'
      },
      {
        title: 'Talks',
        slug: '/talks/'
      },
      {
        title: 'About',
        slug: '/about/'
      },
    ],
    redirects: [
      {
        from: '/feed',
        to: '/atom_feedburner.xml'
      }
    ]
  },
  plugins: [
    `gatsby-plugin-image`,
    'gatsby-plugin-postcss',
    {
      resolve: `gatsby-source-contentful`,
      options: {
        spaceId: process.env.CONTENTFUL_SPACE_ID,
        accessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/content/blog`,
        name: `blog`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/content/pages`,
        name: `page`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/images`,
      },
    },
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [
          {
            resolve: `gatsby-remark-images`,
            options: {
              maxWidth: 630,
            },
          },
          {
            resolve: `gatsby-remark-responsive-iframe`,
            options: {
              wrapperStyle: `margin-bottom: 1.0725rem`,
            },
          },
          {
            resolve: 'gatsby-remark-prismjs',
            options: {
              showLineNumbers: true
            }
          },
          {
            resolve: `gatsby-plugin-google-gtag`,
            options: {
              // You can add multiple tracking ids and a pageview event will be fired for all of them.
              trackingIds: [
                "G-L8N53HMK1R", // Google Analytics / GA
              ],
              // This object is used for configuration specific to this plugin
              pluginConfig: {
                head: true,
              },
            },
          }
        ],
      },
    },
    `gatsby-transformer-sharp`,
    {
      resolve: 'gatsby-plugin-sitemap',
      options: {
        query: `
            {
              site {
                siteMetadata {
                  siteUrl
                }
              }
              allSitePage(
                filter: {
                  path: { regex: "/^(?!/404/|/404.html|/dev-404-page/)/" }
                }
              ) {
                nodes {
                  path
                }
              }
          }`,
        serialize: ({ path, modifiedGmt }) => {
          console.log("!", path);
          return {
            url: path,
            lastmod: modifiedGmt,
          }
        },
      }
    },
    `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-plugin-feed`,
      options: {
        query: `
          {
            site {
              siteMetadata {
                title
                description
                siteUrl
                site_url: siteUrl
              }
            }
          }
        `,
        feeds: [
          {
            serialize: ({ query: { site, allMarkdownRemark, allContentfulBlogPost } }) => {
              const moment = require('moment')

              // Process markdown posts
              const markdownPosts = allMarkdownRemark.nodes.map(node => ({
                title: node.frontmatter.title,
                description: node.excerpt,
                date: node.frontmatter.date,
                url: site.siteMetadata.siteUrl + node.fields.slug,
                guid: site.siteMetadata.siteUrl + node.fields.slug,
                custom_elements: [{ "content:encoded": node.html }],
                _sortDate: new Date(node.frontmatter.date),
              }))

              // Process Contentful posts
              const contentfulPosts = (allContentfulBlogPost?.nodes || []).map(node => {
                const slug = `/${moment(node.date).format('YYYY/MM/')}${node.slug}/`
                return {
                  title: node.title,
                  description: node.description || '',
                  date: node.date,
                  url: site.siteMetadata.siteUrl + slug,
                  guid: site.siteMetadata.siteUrl + slug,
                  custom_elements: [{ "content:encoded": node.description || '' }],
                  _sortDate: new Date(node.date),
                }
              })

              // Merge and sort by date descending
              const allPosts = [...markdownPosts, ...contentfulPosts]
              allPosts.sort((a, b) => b._sortDate - a._sortDate)

              // Remove internal sort field before returning
              return allPosts.map(({ _sortDate, ...post }) => post)
            },
            query: `{
              allMarkdownRemark(
                sort: {frontmatter: {date: DESC}}
                filter: { frontmatter: { draft: { ne: true }, layout: { eq: "post" } } }
              ) {
                nodes {
                  excerpt
                  html
                  fields {
                    slug
                  }
                  frontmatter {
                    title
                    date
                  }
                }
              }
              allContentfulBlogPost(
                sort: { date: DESC }
                filter: { draft: { ne: true } }
              ) {
                nodes {
                  title
                  slug
                  date
                  description
                }
              }
            }`,
            output: "/feed",
            title: "TimBroder.com RSS Feed",
          },
        ],
      },
    },
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `Gatsby Starter Blog`,
        short_name: `Gatsby`,
        start_url: `/`,
        background_color: `#ffffff`,
        // This will impact how browsers show your PWA/website
        // https://css-tricks.com/meta-theme-color-and-trickery/
        // theme_color: `#663399`,
        display: `minimal-ui`,
        icon: `src/images/gatsby-icon.png`, // This path is relative to the root of the site.
      },
    },
  ],
}
