module.exports = {
  siteMetadata: {
    url: 'https://www.timbroder.com',
    title: 'timbroder.com',
    subtitle: 'Code. Comics. Crossfit',
    copyright: '© 2007-2019 Tim Broder. All rights reserved.',
    disqusShortname: '',
    menu: [
      {
        label: 'Apps',
        path: '/apps.html'
      },
      {
        label: 'Podcasts',
        path: '/podcasts.html'
      },
      {
        label: 'Projects',
        path: '/projects.html'
      },
      {
        label: 'Talks',
        path: '/talks.html'
      }
    ],
    author: {
      name: 'Tim Broder',
      email: 'timothy.broder@gmail.com',
      twitter: 'timothybroder',
      github: 'timbroder',
      rss: '/rss.xml',
      linkedin: 'timbroder',
      instagram: 'timothybroder'
    }
  },
  plugins: [
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        path: `${__dirname}/src/pages`,
        name: 'pages'
      }
    },
    {
      resolve: 'gatsby-plugin-feed',
      options: {
        query: `
          {
            site {
              siteMetadata {
                site_url: url
                title
              }
            }
          }
        `,
        feeds: [
          {
            serialize: ({ query: { site, allMarkdownRemark } }) => (
              allMarkdownRemark.edges.map(edge =>
                Object.assign({}, edge.node.frontmatter, {
                  date: edge.node.frontmatter.date,
                  url: site.siteMetadata.site_url + edge.node.fields.slug,
                  guid: site.siteMetadata.site_url + edge.node.fields.slug,
                  custom_elements: [{ 'content:encoded': edge.node.html }],
                  link: site.siteMetadata.link,
                  slug: site.siteMetadata.slug
                }))
            ),
            query: `
              {
                allMarkdownRemark(
                  limit: 1000,
                  sort: { order: DESC, fields: [frontmatter___date] },
                  filter: { frontmatter: { layout: { eq: "post" }, draft: { ne: true } } }
                ) {
                  edges {
                    node {
                      html
                      fields {
                        slug
                      }
                      frontmatter {
                        title
                        date
                        layout
                        draft
                        description
                      }
                    }
                  }
                }
              }
            `,
            output: '/rss.xml'
          }
        ]
      }
    },
    {
      resolve: 'gatsby-transformer-remark',
      options: {
        plugins: [
          {
            resolve: 'gatsby-remark-images',
            options: {
              maxWidth: 960
            }
          },
          {
            resolve: 'gatsby-remark-responsive-iframe',
            options: { wrapperStyle: 'margin-bottom: 1.0725rem' }
          },
          {
            resolve: 'gatsby-remark-prismjs',
            options: {
              showLineNumbersGlobal: true
            }
          },
          'gatsby-remark-copy-linked-files',
          'gatsby-remark-smartypants'
        ]
      }
    },
    'gatsby-transformer-sharp',
    'gatsby-plugin-sharp',
    {
      resolve: 'gatsby-plugin-google-analytics',
      options: { trackingId: 'UA-73379983-2' }
    },
    {
      resolve: `gatsby-plugin-google-fonts`,
      options: {
        fonts: [`roboto\:400,400i,500,700`]
      }
    },
    {
      resolve: 'gatsby-plugin-sitemap',
      options: {
        query: `
            {
              site {
                siteMetadata {
                  url
                }
              }
              allSitePage(
                filter: {
                  path: { regex: "/^(?!/404/|/404.html|/dev-404-page/)/" }
                }
              ) {
                edges {
                  node {
                    path
                  }
                }
              }
          }`,
        output: '/sitemap.xml',
        serialize: ({ site, allSitePage }) =>
          allSitePage.edges.map((edge) => {
            return {
              url: site.siteMetadata.url + edge.node.path,
              changefreq: 'daily',
              priority: 0.7
            };
          })
      }
    },
    'gatsby-plugin-offline',
    'gatsby-plugin-catch-links',
    'gatsby-plugin-react-helmet',
    'gatsby-plugin-postcss-sass'
  ]
};
