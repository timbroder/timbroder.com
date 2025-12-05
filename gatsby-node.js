/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.com/docs/reference/config-files/gatsby-node/
 */

const path = require(`path`)
const {createFilePath} = require(`gatsby-source-filesystem`)
const _ = require('lodash');
const moment = require("moment");

// Define the template for blog post
const postTemplate = path.resolve(`./src/templates/post-template.js`)
const pageTemplate = path.resolve('./src/templates/page-template.js');
const tagTemplate = path.resolve('./src/templates/tag-template.js');
const categoryTemplate = path.resolve('./src/templates/category-template.js');
const blogListTemplate = path.resolve('./src/templates/blog-list-template.js');

const POSTS_PER_PAGE = 20;

/**
 * @type {import('gatsby').GatsbyNode['createPages']}
 */
exports.createPages = async ({graphql, actions, reporter}) => {
    const {createPage, createRedirect} = actions

    // Get all markdown blog nodes sorted by date
    const result = await graphql(`
    {
        site {
          siteMetadata {
            redirects {
                from
                to
            }
          }
        }
        allMarkdownRemark(
            sort: { frontmatter: { date: ASC } },
            filter: { frontmatter: { draft: { ne: true } } },
            limit: 1000
        ) {
            edges {
                node {
                    id
                    fields {
                        slug
                    }
                    frontmatter {
                        layout
                        category
                        tags
                        link
                    }
                }
            }
        }
    }
  `)

    if (result.errors) {
        reporter.panicOnBuild(
            `There was an error loading your blog posts`,
            result.errors
        )
        return
    }

    const nodes = result.data.allMarkdownRemark.edges
    const redirects = result.data.site.siteMetadata.redirects

    // Separate posts and pages
    const posts = nodes.filter(item => item.node.frontmatter?.layout !== 'page')
    const pages = nodes.filter(item => item.node.frontmatter?.layout === 'page')

    // Collect all tags and categories with their post counts
    const tagCounts = {}
    const categoryCounts = {}

    posts.forEach(item => {
        if (item.node?.frontmatter?.tags) {
            item.node.frontmatter.tags.forEach(tag => {
                const tagSlug = _.kebabCase(tag)
                if (!tagCounts[tagSlug]) {
                    tagCounts[tagSlug] = { name: tag, count: 0 }
                }
                tagCounts[tagSlug].count++
            })
        }
        if (item.node?.frontmatter?.category) {
            const catSlug = _.kebabCase(item.node.frontmatter.category)
            if (!categoryCounts[catSlug]) {
                categoryCounts[catSlug] = { name: item.node.frontmatter.category, count: 0 }
            }
            categoryCounts[catSlug].count++
        }
    })

    // Create paginated blog list pages (home page)
    const numPages = Math.ceil(posts.length / POSTS_PER_PAGE)
    Array.from({ length: numPages }).forEach((_, i) => {
        createPage({
            path: i === 0 ? `/` : `/page/${i + 1}/`,
            component: blogListTemplate,
            context: {
                limit: POSTS_PER_PAGE,
                skip: i * POSTS_PER_PAGE,
                numPages,
                currentPage: i + 1,
            },
        })
    })

    // Create individual post pages
    posts.forEach((item, i) => {
        const previousPostId = i === 0 ? null : posts[i - 1].node.id
        const nextPostId = i === posts.length - 1 ? null : posts[i + 1].node.id

        createPage({
            path: item.node.fields.slug,
            component: postTemplate,
            context: {
                id: item.node.id,
                previousPostId,
                nextPostId,
            },
        })
    })

    // Create individual static pages
    pages.forEach(item => {
        createPage({
            path: item.node.fields.slug,
            component: pageTemplate,
            context: { id: item.node.id }
        })
    })

    // Create paginated tag pages
    Object.keys(tagCounts).forEach(tagSlug => {
        const tag = tagCounts[tagSlug]
        const numTagPages = Math.ceil(tag.count / POSTS_PER_PAGE)

        Array.from({ length: numTagPages }).forEach((_, i) => {
            createPage({
                path: i === 0 ? `/tag/${tagSlug}/` : `/tag/${tagSlug}/page/${i + 1}/`,
                component: tagTemplate,
                context: {
                    tag: tag.name,
                    limit: POSTS_PER_PAGE,
                    skip: i * POSTS_PER_PAGE,
                    numPages: numTagPages,
                    currentPage: i + 1,
                    basePath: `/tag/${tagSlug}/`,
                },
            })
        })
    })

    // Create paginated category pages
    Object.keys(categoryCounts).forEach(catSlug => {
        const category = categoryCounts[catSlug]
        const numCatPages = Math.ceil(category.count / POSTS_PER_PAGE)

        Array.from({ length: numCatPages }).forEach((_, i) => {
            createPage({
                path: i === 0 ? `/category/${catSlug}/` : `/category/${catSlug}/page/${i + 1}/`,
                component: categoryTemplate,
                context: {
                    category: category.name,
                    limit: POSTS_PER_PAGE,
                    skip: i * POSTS_PER_PAGE,
                    numPages: numCatPages,
                    currentPage: i + 1,
                    basePath: `/category/${catSlug}/`,
                },
            })
        })
    })

    // Create redirects
    if (redirects && redirects.length > 0) {
        redirects.forEach((item) => {
            createRedirect({
                fromPath: item.from,
                toPath: item.to,
            });
        })
    }
}

/**
 * @type {import('gatsby').GatsbyNode['onCreateNode']}
 */
exports.onCreateNode = ({node, actions, getNode}) => {
    const {createNodeField} = actions

    if (node.internal.type === 'File') {
        const parsedFilePath = path.parse(node.absolutePath);
        const slug = `/${parsedFilePath.dir.split('---')[1]}/`;
        createNodeField({node, name: 'slug', value: slug});
    } else if (node.internal.type === `MarkdownRemark` &&
        typeof node.slug === 'undefined') {
        let value;

        if (typeof node.frontmatter.path !== 'undefined') {
            value = node.frontmatter.path;
        } else if (typeof node.frontmatter.slug !== 'undefined' && typeof node.frontmatter.date) {
            value = `/${moment(node.frontmatter.date).format('YYYY/MM/') + node.frontmatter.slug}`;
        } else {
            const fileName = _.replace(_.replace(_.last(_.split(node.fileAbsolutePath, '/')), '.md', ''), '.markdown', '');
            const adjusted = _.replace(fileName, new RegExp('\\d{4}-\\d{2}-\\d{2}-', 'g'), '');
            value = `/${moment(node.frontmatter.date).format('YYYY/MM/') + adjusted}`;
        }

        createNodeField({
            name: `slug`,
            node,
            value,
        })
    }
}

/**
 * @type {import('gatsby').GatsbyNode['createSchemaCustomization']}
 */
exports.createSchemaCustomization = ({actions}) => {
    const {createTypes} = actions

    // Explicitly define the siteMetadata {} object
    // This way those will always be defined even if removed from gatsby-config.js

    // Also explicitly define the Markdown frontmatter
    // This way the "MarkdownRemark" queries will return `null` even when no
    // blog posts are stored inside "content/blog" instead of returning an error
    createTypes(`
    type SiteSiteMetadata {
      author: Author
      siteUrl: String
      social: Social
    }

    type Author {
      name: String
      summary: String
    }

    type Social {
      mastodon: String
    }

    type MarkdownRemark implements Node {
      frontmatter: Frontmatter
      fields: Fields
    }

    type Frontmatter {
      title: String
      description: String
      date: Date @dateformat
    }

    type Fields {
      slug: String
    }
  `)
}
