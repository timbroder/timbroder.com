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
 * Generate slug for Contentful posts using the same pattern as Markdown
 */
function generateContentfulSlug(date, slug) {
    return `/${moment(date).format('YYYY/MM/')}${slug}/`
}

/**
 * Normalize a post from either source to a common shape for page creation
 */
function normalizePost(node, source) {
    if (source === 'markdown') {
        return {
            id: node.id,
            source: 'markdown',
            slug: node.fields?.slug,
            category: node.frontmatter?.category,
            tags: node.frontmatter?.tags || [],
            layout: node.frontmatter?.layout,
        }
    } else {
        return {
            id: node.id,
            source: 'contentful',
            slug: generateContentfulSlug(node.date, node.slug),
            category: node.category,
            tags: node.tags || [],
            layout: 'post', // Contentful posts are always posts, not pages
        }
    }
}

/**
 * @type {import('gatsby').GatsbyNode['createPages']}
 */
exports.createPages = async ({graphql, actions, reporter}) => {
    const {createPage, createRedirect} = actions

    // Get all markdown blog nodes and Contentful blog posts sorted by date
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
                        date
                    }
                }
            }
        }
        allContentfulBlogPost(
            sort: { date: ASC },
            filter: { draft: { ne: true } }
        ) {
            edges {
                node {
                    id
                    slug
                    date
                    category
                    tags
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

    const markdownNodes = result.data.allMarkdownRemark.edges
    const contentfulNodes = result.data.allContentfulBlogPost?.edges || []
    const redirects = result.data.site.siteMetadata.redirects

    // Normalize all posts
    const markdownPosts = markdownNodes
        .map(item => ({ ...normalizePost(item.node, 'markdown'), date: item.node.frontmatter?.date }))
        .filter(item => item.layout !== 'page')

    const markdownPages = markdownNodes
        .map(item => normalizePost(item.node, 'markdown'))
        .filter(item => item.layout === 'page')

    const contentfulPosts = contentfulNodes
        .map(item => ({ ...normalizePost(item.node, 'contentful'), date: item.node.date }))

    // Create a set of markdown slugs for conflict detection
    const markdownSlugs = new Set(markdownPosts.map(p => p.slug))

    // Filter out contentful posts that conflict with markdown (markdown takes priority)
    const filteredContentfulPosts = contentfulPosts.filter(p => {
        if (markdownSlugs.has(p.slug)) {
            reporter.warn(`Contentful post with slug "${p.slug}" conflicts with a Markdown post. Markdown takes priority.`)
            return false
        }
        return true
    })

    // Merge all posts and sort by date ascending (for prev/next navigation)
    const allPosts = [...markdownPosts, ...filteredContentfulPosts]
    allPosts.sort((a, b) => new Date(a.date) - new Date(b.date))

    // Collect all tags and categories with their post counts
    const tagCounts = {}
    const categoryCounts = {}

    allPosts.forEach(item => {
        if (item.tags) {
            item.tags.forEach(tag => {
                const tagSlug = _.kebabCase(tag)
                if (!tagCounts[tagSlug]) {
                    tagCounts[tagSlug] = { name: tag, count: 0 }
                }
                tagCounts[tagSlug].count++
            })
        }
        if (item.category) {
            const catSlug = _.kebabCase(item.category)
            if (!categoryCounts[catSlug]) {
                categoryCounts[catSlug] = { name: item.category, count: 0 }
            }
            categoryCounts[catSlug].count++
        }
    })

    // Create paginated blog list pages (home page)
    const numPages = Math.ceil(allPosts.length / POSTS_PER_PAGE)
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
    allPosts.forEach((item, i) => {
        const previousPostId = i === 0 ? null : allPosts[i - 1].id
        const nextPostId = i === allPosts.length - 1 ? null : allPosts[i + 1].id
        const previousPostSource = i === 0 ? null : allPosts[i - 1].source
        const nextPostSource = i === allPosts.length - 1 ? null : allPosts[i + 1].source

        createPage({
            path: item.slug,
            component: postTemplate,
            context: {
                id: item.id,
                source: item.source,
                previousPostId,
                nextPostId,
                previousPostSource,
                nextPostSource,
            },
        })
    })

    // Create individual static pages (markdown only)
    markdownPages.forEach(item => {
        createPage({
            path: item.slug,
            component: pageTemplate,
            context: { id: item.id }
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
    } else if (node.internal.type === 'ContentfulBlogPost') {
        // Create slug field for Contentful posts
        const slug = generateContentfulSlug(node.date, node.slug)
        createNodeField({
            name: `slug`,
            node,
            value: slug,
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

    type ContentfulBlogPost implements Node {
      fields: Fields
    }
  `)
}
