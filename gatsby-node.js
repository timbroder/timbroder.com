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
const blogPost = path.resolve(`./src/templates/blog-post.js`)
const pageTemplate = path.resolve('./src/templates/page-template.js');
const tagTemplate = path.resolve('./src/templates/tag-template.js');
const categoryTemplate = path.resolve('./src/templates/category-template.js');

/**
 * @type {import('gatsby').GatsbyNode['createPages']}
 */
exports.createPages = async ({graphql, actions, reporter}) => {
    const {createPage} = actions


    // Get all markdown blog nodes sorted by date
    const result = await graphql(`
    {
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

    // Create blog nodes pages
    // But only if there's at least one markdown file found at "content/blog" (defined in gatsby-config.js)
    // `context` is available in the template as a prop and as a variable in GraphQL

    if (nodes.length > 0) {
        nodes.forEach((post, i) => {
            let tags = []
            let categories = []

            if (post.node.frontmatter?.layout === 'page') {
                console.log('skip post')
            } else {
                const previousPostId = i === 0 ? null : nodes[i - 1].node.id
                const nextPostId = i === nodes.length - 1 ? null : nodes[i + 1].node.id

                console.log(previousPostId, nextPostId)

                createPage({
                    path: post.node.fields.slug,
                    component: blogPost,
                    context: {
                        id: post.node.id,
                        previousPostId,
                        nextPostId,
                    },
                })

                if (post.node?.frontmatter?.tags) {
                    tags = tags.concat(post.node.frontmatter.tags);
                }

                tags.forEach((tag, ti) => {
                    const tagPath = `/tag/${_.kebabCase(tag)}/`;
                    createPage({
                        path: tagPath,
                        component: tagTemplate,
                        context: { tag }
                    });
                })

                if (post.node?.frontmatter?.category) {
                    categories = tags.concat(post.node.frontmatter.category);
                }

                categories.forEach((category, ti) => {
                    const categoryPath = `/category/${_.kebabCase(category)}/`;
                    createPage({
                        path: categoryPath,
                        component: categoryTemplate,
                        context: { category }
                    });
                })
            }

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
      twitter: String
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
