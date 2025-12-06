/**
 * Rich text renderer for Contentful content
 * Handles embedded assets (images), code blocks, and other embedded entries
 */

import React from 'react'
import { GatsbyImage, getImage } from 'gatsby-plugin-image'
import { BLOCKS, INLINES, MARKS } from '@contentful/rich-text-types'
import { renderRichText } from 'gatsby-source-contentful/rich-text'
import Prism from 'prismjs'

// Import additional Prism languages
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-jsx'
import 'prismjs/components/prism-tsx'
import 'prismjs/components/prism-python'
import 'prismjs/components/prism-bash'
import 'prismjs/components/prism-json'
import 'prismjs/components/prism-yaml'
import 'prismjs/components/prism-markdown'
import 'prismjs/components/prism-css'
import 'prismjs/components/prism-sql'
import 'prismjs/components/prism-graphql'
import 'prismjs/components/prism-go'
import 'prismjs/components/prism-ruby'
import 'prismjs/components/prism-diff'

/**
 * Code Block component for embedded code snippets
 */
function CodeBlock({ language, code, showLineNumbers = true }) {
  const lang = language || 'text'
  const grammar = Prism.languages[lang] || Prism.languages.text
  const highlighted = Prism.highlight(code, grammar, lang)

  const lines = code.split('\n')
  const lineNumbersMarkup = showLineNumbers
    ? lines.map((_, i) => `<span class="line-numbers-rows"><span></span></span>`).join('')
    : ''

  return (
    <div className="gatsby-highlight" data-language={lang}>
      <pre className={`language-${lang}${showLineNumbers ? ' line-numbers' : ''}`}>
        <code
          className={`language-${lang}`}
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />
      </pre>
    </div>
  )
}

/**
 * Embedded Asset (Image) renderer
 */
function EmbeddedAsset({ node }) {
  const { gatsbyImageData, title, description } = node.data.target

  if (!gatsbyImageData) {
    // Fallback for non-image assets or missing data
    return null
  }

  const image = getImage(gatsbyImageData)

  return (
    <figure className="my-8">
      <GatsbyImage
        image={image}
        alt={description || title || ''}
        className="rounded-lg"
      />
      {(title || description) && (
        <figcaption className="text-center text-sm text-gray-500 mt-2">
          {description || title}
        </figcaption>
      )}
    </figure>
  )
}

/**
 * Embedded Entry (Code Block) renderer
 */
function EmbeddedEntry({ node }) {
  const entry = node.data.target

  // Handle Code Block entries
  if (entry.__typename === 'ContentfulCodeBlock' || entry.sys?.contentType?.sys?.id === 'codeBlock') {
    return (
      <CodeBlock
        language={entry.language}
        code={entry.code?.code || entry.code}
        showLineNumbers={entry.showLineNumbers !== false}
      />
    )
  }

  // Unknown entry type
  console.warn('Unknown embedded entry type:', entry.__typename || entry.sys?.contentType?.sys?.id)
  return null
}

/**
 * Rich text rendering options
 */
const options = {
  renderMark: {
    [MARKS.BOLD]: (text) => <strong>{text}</strong>,
    [MARKS.ITALIC]: (text) => <em>{text}</em>,
    [MARKS.UNDERLINE]: (text) => <u>{text}</u>,
    [MARKS.CODE]: (text) => <code className="bg-gray-100 px-1 rounded text-sm">{text}</code>,
  },
  renderNode: {
    [BLOCKS.PARAGRAPH]: (node, children) => <p className="mb-4">{children}</p>,
    [BLOCKS.HEADING_1]: (node, children) => <h1 className="text-3xl font-bold mt-8 mb-4">{children}</h1>,
    [BLOCKS.HEADING_2]: (node, children) => <h2 className="text-2xl font-bold mt-8 mb-4">{children}</h2>,
    [BLOCKS.HEADING_3]: (node, children) => <h3 className="text-xl font-bold mt-6 mb-3">{children}</h3>,
    [BLOCKS.HEADING_4]: (node, children) => <h4 className="text-lg font-bold mt-6 mb-3">{children}</h4>,
    [BLOCKS.HEADING_5]: (node, children) => <h5 className="text-base font-bold mt-4 mb-2">{children}</h5>,
    [BLOCKS.HEADING_6]: (node, children) => <h6 className="text-sm font-bold mt-4 mb-2">{children}</h6>,
    [BLOCKS.UL_LIST]: (node, children) => <ul className="list-disc list-inside mb-4 ml-4">{children}</ul>,
    [BLOCKS.OL_LIST]: (node, children) => <ol className="list-decimal list-inside mb-4 ml-4">{children}</ol>,
    [BLOCKS.LIST_ITEM]: (node, children) => <li className="mb-1">{children}</li>,
    [BLOCKS.QUOTE]: (node, children) => (
      <blockquote className="border-l-4 border-gray-300 pl-4 italic my-4">{children}</blockquote>
    ),
    [BLOCKS.HR]: () => <hr className="my-8 border-gray-300" />,
    [BLOCKS.EMBEDDED_ASSET]: (node) => <EmbeddedAsset node={node} />,
    [BLOCKS.EMBEDDED_ENTRY]: (node) => <EmbeddedEntry node={node} />,
    [INLINES.HYPERLINK]: (node, children) => (
      <a href={node.data.uri} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    ),
    [INLINES.EMBEDDED_ENTRY]: (node) => <EmbeddedEntry node={node} />,
  },
}

/**
 * Render Contentful rich text content
 */
export function renderContentfulRichText(richText) {
  if (!richText) return null
  return renderRichText(richText, options)
}

export default renderContentfulRichText
