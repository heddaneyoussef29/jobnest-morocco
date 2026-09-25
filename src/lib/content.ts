import { marked } from 'marked'
import DOMPurify from 'isomorphic-dompurify'

// Configure marked for Arabic content
marked.setOptions({
  breaks: true,
  gfm: true,
})

/**
 * Convert Markdown to sanitized HTML
 */
export function markdownToHtml(markdown: string): string {
  if (!markdown) return ''

  // Convert markdown to HTML
  const rawHtml = marked.parse(markdown) as string

  // Sanitize HTML to prevent XSS
  const cleanHtml = DOMPurify.sanitize(rawHtml, {
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'br', 'hr',
      'strong', 'em', 'b', 'i', 'u', 's', 'mark', 'ul', 'ol', 'li',
      'blockquote', 'cite', 'a', 'img',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'pre', 'code', 'figure', 'figcaption', 'div', 'span', 'iframe',
    ],
    ALLOWED_ATTR: [
      'href', 'target', 'rel', 'src', 'alt', 'width', 'height',
      'class', 'id', 'dir', 'lang', 'colspan', 'rowspan',
      'loading', 'decoding', 'style',
      'frameborder', 'allowfullscreen', 'allow', 'data-platform',
    ],
    ALLOW_DATA_ATTR: false,
  })

  return cleanHtml
}

/**
 * Extract plain text from HTML or Markdown
 */
export function extractPlainText(content: string): string {
  if (!content) return ''

  // If it looks like HTML, strip tags
  if (content.includes('<')) {
    return content
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  }

  // If it's markdown, strip markdown syntax
  return content
    .replace(/#{1,6}\s/g, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/`{1,3}[^`]*`{1,3}/g, '')
    .replace(/^\s*[-*+]\s/gm, '')
    .replace(/^\s*\d+\.\s/gm, '')
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Generate table of contents from HTML content
 */
export function generateToc(html: string): Array<{ id: string; text: string; level: number }> {
  const toc: Array<{ id: string; text: string; level: number }> = []
  const headingRegex = /<h([1-6])[^>]*>(.*?)<\/h[1-6]>/gi
  let match

  while ((match = headingRegex.exec(html)) !== null) {
    const level = parseInt(match[1])
    const text = match[2].replace(/<[^>]*>/g, '').trim()
    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()

    if (id && text) {
      toc.push({ id, text, level })
    }
  }

  return toc
}

/**
 * Add IDs to headings for table of contents
 */
export function addHeadingIds(html: string): string {
  return html.replace(/<h([1-6])[^>]*>(.*?)<\/h[1-6]>/gi, (match, level, content) => {
    const text = content.replace(/<[^>]*>/g, '').trim()
    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()

    if (!id) return match

    // Check if heading already has an id
    if (/id=["']/.test(match)) {
      return match
    }

    return `<h${level} id="${id}">${content}</h${level}>`
  })
}
