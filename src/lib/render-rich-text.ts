import { documentToHtmlString } from '@contentful/rich-text-html-renderer'
import { BLOCKS, INLINES } from '@contentful/rich-text-types'
import type { Document } from '@contentful/rich-text-types'

function findReference(references: any[], id: string) {
  if (!references) return null
  return references.find((ref: any) => {
    const refId = ref.sys?.id || ref.contentful_id
    return refId === id
  })
}

const renderOptions = (references?: any[]) => ({
  renderNode: {
    [BLOCKS.EMBEDDED_ASSET]: (node: any) => {
      const assetId = node.data?.target?.sys?.id
      const asset = references ? findReference(references, assetId) : node.data?.target

      if (!asset) return ''

      const file = asset.fields?.file || asset.file
      const title = asset.fields?.title || asset.title || ''
      const description = asset.fields?.description || asset.description || ''

      if (!file?.url) return ''

      const url = file.url.startsWith('//') ? `https:${file.url}` : file.url
      const imgUrl = `${url}?w=800&fm=webp&q=80`

      return `<figure class="my-8">
        <img src="${imgUrl}" alt="${description || title}" class="rounded-lg" loading="lazy" />
        ${(title || description) ? `<figcaption class="text-center text-sm text-gray-500 mt-2">${description || title}</figcaption>` : ''}
      </figure>`
    },

    [BLOCKS.EMBEDDED_ENTRY]: (node: any) => {
      const entryId = node.data?.target?.sys?.id
      const entry = references ? findReference(references, entryId) : node.data?.target

      if (!entry) return ''

      // Handle Code Block entries
      const contentType = entry.sys?.contentType?.sys?.id || entry.__typename
      if (contentType === 'codeBlock' || contentType === 'ContentfulCodeBlock') {
        const language = entry.fields?.language || entry.language || 'text'
        const code = entry.fields?.code?.code || entry.fields?.code || entry.code?.code || entry.code || ''
        const escaped = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        return `<pre><code class="language-${language}">${escaped}</code></pre>`
      }

      return ''
    },

    [INLINES.HYPERLINK]: (node: any, next: (nodes: any) => string) => {
      return `<a href="${node.data.uri}" target="_blank" rel="noopener noreferrer">${next(node.content)}</a>`
    },

    [INLINES.EMBEDDED_ENTRY]: (node: any) => {
      const entryId = node.data?.target?.sys?.id
      const entry = references ? findReference(references, entryId) : node.data?.target

      if (!entry) return ''

      const contentType = entry.sys?.contentType?.sys?.id || entry.__typename
      if (contentType === 'codeBlock' || contentType === 'ContentfulCodeBlock') {
        const language = entry.fields?.language || entry.language || 'text'
        const code = entry.fields?.code?.code || entry.fields?.code || entry.code?.code || entry.code || ''
        const escaped = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        return `<pre><code class="language-${language}">${escaped}</code></pre>`
      }

      return ''
    },
  },
})

export function renderContentfulRichText(richText: any, references?: any[]): string {
  if (!richText) return ''

  let document: Document
  if (typeof richText === 'string') {
    try {
      document = JSON.parse(richText)
    } catch {
      return ''
    }
  } else if (richText.raw) {
    try {
      document = JSON.parse(richText.raw)
    } catch {
      return ''
    }
  } else {
    document = richText
  }

  return documentToHtmlString(document, renderOptions(references))
}

function extractTextFromNode(node: any): string {
  if (!node) return ''
  if (node.nodeType === 'text') return node.value || ''
  if (node.content && Array.isArray(node.content)) {
    return node.content.map(extractTextFromNode).join('')
  }
  return ''
}

export function extractRichTextExcerpt(richText: any, maxLength = 512): string {
  if (!richText) return ''

  let document: any
  if (typeof richText === 'string') {
    try { document = JSON.parse(richText) } catch { return '' }
  } else if (richText.raw) {
    try { document = JSON.parse(richText.raw) } catch { return '' }
  } else {
    document = richText
  }

  const text = extractTextFromNode(document)
  const cleaned = text.replace(/\s+/g, ' ').trim()

  if (cleaned.length <= maxLength) return cleaned

  const truncated = cleaned.substring(0, maxLength)
  const lastSpace = truncated.lastIndexOf(' ')

  if (lastSpace > maxLength * 0.8) {
    return truncated.substring(0, lastSpace) + '...'
  }
  return truncated + '...'
}
