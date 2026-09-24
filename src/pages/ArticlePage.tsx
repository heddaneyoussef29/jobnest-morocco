import { useEffect, useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { addHeadingIds, generateToc } from '../lib/content'
import DOMPurify from 'isomorphic-dompurify'
import Header from '../components/Header'
import Footer from '../components/Footer'
import '../styles/article-styles.css'

interface Article {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content_html: string | null
  content: string
  cover_image_url: string | null
  cover_image_alt: string | null
  published_at: string | null
  reading_time: number | null
  views_count: number
  meta_title: string | null
  meta_description: string | null
  category: { name: string; slug: string } | null
}

interface TocItem {
  id: string
  text: string
  level: number
}

// Format date with English/Latin numerals
function formatDate(date: string): string {
  const d = new Date(date)
  const day = d.getDate()
  const months = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ]
  const month = months[d.getMonth()]
  const year = d.getFullYear()
  return `${day} ${month} ${year}`
}

// Format number with English numerals
function formatNumber(num: number): string {
  return num.toLocaleString('en-US')
}

// Smart content processing - adds styling classes based on content patterns
function processArticleContent(html: string): string {
  if (!html) return ''
  
  let processed = html

  // Convert paragraphs starting with 💡, ⚠️, ✅, ℹ️ to styled boxes
  processed = processed.replace(
    /<p[^>]*>\s*💡\s*(.*?)<\/p>/gs,
    '<div class="highlight-box"><p>💡 $1</p></div>'
  )
  processed = processed.replace(
    /<p[^>]*>\s*⚠️\s*(.*?)<\/p>/gs,
    '<div class="warning-box"><p>⚠️ $1</p></div>'
  )
  processed = processed.replace(
    /<p[^>]*>\s*✅\s*(.*?)<\/p>/gs,
    '<div class="success-box"><p>✅ $1</p></div>'
  )
  processed = processed.replace(
    /<p[^>]*>\s*ℹ️\s*(.*?)<\/p>/gs,
    '<div class="info-box"><p>ℹ️ $1</p></div>'
  )

  // Convert blockquotes with 💡 to highlight boxes
  processed = processed.replace(
    /<blockquote[^>]*>\s*<p[^>]*>\s*💡\s*(.*?)<\/p>\s*<\/blockquote>/gs,
    '<div class="highlight-box"><p>💡 $1</p></div>'
  )

  // Add lazy loading to images without it
  processed = processed.replace(
    /<img(?![^>]*loading=)([^>]*)>/g,
    '<img loading="lazy"$1>'
  )

  // Add figure wrapper to standalone images
  processed = processed.replace(
    /(<img[^>]+>)\s*(<p[^>]*class="image-caption"[^>]*>.*?<\/p>)?/g,
    '<figure>$1$2</figure>'
  )

  // Insert ad placeholder after every 3rd heading (h2)
  let h2Count = 0
  processed = processed.replace(/<h2[^>]*>(.*?)<\/h2>/g, (match, content) => {
    h2Count++
    if (h2Count > 1 && h2Count % 3 === 0) {
      return `${match}\n<div class="ad-placeholder" data-ad-position="${h2Count}"></div>`
    }
    return match
  })

  return processed
}

// Get smart icon based on article category or title
function getSmartIcon(category?: string | null, title?: string): string {
  const text = (category || title || '').toLowerCase()
  
  if (text.includes('وظا') || text.includes('عمل') || text.includes('career') || text.includes('job')) return '💼'
  if (text.includes('تقني') || text.includes('برمج') || text.includes('tech') || text.includes('code')) return '💻'
  if (text.includes('تصميم') || text.includes('design') || text.includes('creative')) return '🎨'
  if (text.includes('تسويق') || text.includes('market') || text.includes('إعلان')) return '📊'
  if (text.includes('تعليم') || text.includes('learn') || text.includes('study')) return '📚'
  if (text.includes('صحي') || text.includes('health') || text.includes('fitness')) return '🏥'
  if (text.includes('مال') || text.includes('finance') || text.includes('invest')) return '💰'
  if (text.includes('سفر') || text.includes('travel') || text.includes('tour')) return '✈️'
  if (text.includes('طبخ') || text.includes('cook') || text.includes('food')) return '🍳'
  if (text.includes('رياضة') || text.includes('sport') || text.includes('football')) return '⚽'
  
  return '📝' // Default icon
}

function TableOfContents({ items }: { items: TocItem[] }) {
  const [activeId, setActiveId] = useState('')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id)
        })
      },
      { rootMargin: '-80px 0px -80% 0px' }
    )
    items.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [items])

  if (items.length < 2) return null

  return (
    <nav className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
        محتويات المقال
      </h3>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li key={item.id} style={{ paddingRight: `${(item.level - 1) * 12}px` }}>
            <a
              href={`#${item.id}`}
              className={`block py-1.5 px-3 rounded-lg text-sm transition-all ${
                activeId === item.id
                  ? 'bg-emerald-50 text-emerald-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

function Sidebar({ currentId, category }: { currentId: string; category: { name: string; slug: string } | null }) {
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([])
  const [popularArticles, setPopularArticles] = useState<Article[]>([])

  useEffect(() => {
    fetchRelated()
    fetchPopular()
  }, [currentId, category])

  const fetchRelated = async () => {
    const { data } = await supabase
      .from('articles')
      .select('id, title, slug, cover_image_url, published_at, category:categories(name, slug)')
      .eq('status', 'published')
      .is('deleted_at', null)
      .neq('id', currentId)
      .limit(4)
    setRelatedArticles(data || [])
  }

  const fetchPopular = async () => {
    const { data } = await supabase
      .from('articles')
      .select('id, title, slug, cover_image_url, published_at, views_count, category:categories(name, slug)')
      .eq('status', 'published')
      .is('deleted_at', null)
      .neq('id', currentId)
      .order('views_count', { ascending: false })
      .limit(5)
    setPopularArticles(data || [])
  }

  return (
    <aside className="space-y-6">
      {/* Follow Us */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">تابعنا</h3>
        <div className="flex flex-wrap gap-3">
          <a href="#" className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
          </a>
          <a href="#" className="flex items-center justify-center w-10 h-10 bg-sky-500 text-white rounded-full hover:bg-sky-600 transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" /></svg>
          </a>
          <a href="#" className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-500 text-white rounded-full hover:opacity-90 transition-opacity">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
          </a>
          <a href="#" className="flex items-center justify-center w-10 h-10 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
          </a>
          <a href="#" className="flex items-center justify-center w-10 h-10 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
          </a>
        </div>
      </div>

      {/* Popular Articles */}
      {popularArticles.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg>
            الأكثر رواجاً
          </h3>
          <div className="space-y-4">
            {popularArticles.map((article, idx) => (
              <Link
                key={article.id}
                to={`/article/${article.slug}`}
                className="flex items-start gap-3 group"
              >
                <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-emerald-100 text-emerald-700 rounded-full text-sm font-bold">
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-800 group-hover:text-emerald-600 transition-colors line-clamp-2">
                    {article.title}
                  </h4>
                  <span className="text-xs text-gray-400 mt-1 block">
                    {formatNumber(article.views_count || 0)} مشاهدة
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            مقالات ذات صلة
          </h3>
          <div className="space-y-4">
            {relatedArticles.slice(0, 3).map((article) => (
              <Link
                key={article.id}
                to={`/article/${article.slug}`}
                className="flex items-start gap-3 group"
              >
                {article.cover_image_url && (
                  <img
                    src={article.cover_image_url}
                    alt={article.title}
                    className="w-20 h-16 object-cover rounded-lg flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-800 group-hover:text-emerald-600 transition-colors line-clamp-2">
                    {article.title}
                  </h4>
                  <span className="text-xs text-gray-400 mt-1 block">
                    {article.published_at ? formatDate(article.published_at) : ''}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Newsletter */}
      <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl p-6 text-white">
        <h3 className="text-lg font-bold mb-2">اشترك في النشرة البريدية</h3>
        <p className="text-emerald-100 text-sm mb-4">احصل على آخر المقالات مباشرة في بريدك</p>
        <div className="flex gap-2">
          <input
            type="email"
            placeholder="بريدك الإلكتروني"
            className="flex-1 px-4 py-2.5 rounded-lg bg-white/20 text-white placeholder-white/60 text-sm border border-white/30 focus:outline-none focus:border-white"
          />
          <button className="px-4 py-2.5 bg-white text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-50 transition-colors">
            اشترك
          </button>
        </div>
      </div>
    </aside>
  )
}

export default function ArticlePage() {
  const { slug } = useParams<{ slug: string }>()
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [toc, setToc] = useState<TocItem[]>([])
  const viewCounted = useRef(false)

  useEffect(() => {
    if (slug) fetchArticle()
  }, [slug])

  const fetchArticle = async () => {
    setLoading(true)
    setError(false)

    try {
      const { data: articleData, error: fetchError } = await supabase
        .from('articles')
        .select('*, category:categories(name, slug)')
        .eq('slug', slug)
        .eq('status', 'published')
        .is('deleted_at', null)
        .single()

      if (fetchError || !articleData) {
        setError(true)
        return
      }

      const html = articleData.content_html || articleData.content || ''
      const processedHtml = addHeadingIds(html)
      const styledHtml = processArticleContent(processedHtml)
      const tocItems = generateToc(processedHtml)

      setArticle({ ...articleData, content_html: styledHtml })
      setToc(tocItems)
      document.title = articleData.meta_title || articleData.title

      const metaDesc = document.querySelector('meta[name="description"]')
      if (metaDesc) {
        metaDesc.setAttribute('content', articleData.meta_description || articleData.excerpt || '')
      }

      if (!viewCounted.current) {
        viewCounted.current = true
        // Use database function to prevent view count manipulation
        supabase.rpc('increment_article_views', { article_id: articleData.id })
          .then(() => {
            setArticle(prev => prev ? { ...prev, views_count: (prev.views_count || 0) + 1 } : prev)
          })
          .catch(() => {})
      }
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <div className="inline-block w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 mt-4">جاري تحميل المقال...</p>
        </div>
        <Footer />
      </div>
    )
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">المقال غير موجود</h1>
          <p className="text-gray-500 mb-6">عذراً، لا يمكننا العثور على هذا المقال</p>
          <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-medium transition-colors">
            العودة للرئيسية
          </Link>
        </div>
        <Footer />
      </div>
    )
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.excerpt || article.title,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('تم نسخ رابط المقال!')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Cover Image */}
      {article.cover_image_url && (
        <div className="w-full h-64 md:h-80 lg:h-96 bg-gray-200 overflow-hidden">
          <img
            src={article.cover_image_url}
            alt={article.cover_image_alt || article.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-emerald-600 transition-colors">الرئيسية</Link>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          <Link to="/articles" className="hover:text-emerald-600 transition-colors">المقالات</Link>
          {article.category && (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              <span>{article.category.name}</span>
            </>
          )}
        </nav>

        {/* Main Layout: Article + Sidebar */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Article Content */}
          <main className="flex-1 min-w-0">
            {/* Category Badge */}
            {article.category && (
              <span className="inline-block px-3 py-1 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-full mb-4">
                {article.category.name}
              </span>
            )}

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-[2.5rem] font-bold text-gray-900 mb-5 leading-tight">
              {article.title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-8 pb-6 border-b border-gray-200">
              {article.published_at && (
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  {formatDate(article.published_at)}
                </span>
              )}
              {article.reading_time && (
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 0118 0 9 9 0 0118 0z" /></svg>
                  {article.reading_time} دقائق للقراءة
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                {formatNumber(article.views_count || 0)} مشاهدة
              </span>
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 transition-colors mr-auto"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                مشاركة
              </button>
            </div>

            {/* Excerpt */}
            {article.excerpt && (
              <div className="bg-emerald-50 border-r-4 border-emerald-600 p-4 mb-8 rounded-r-xl">
                <p className="text-gray-700 text-lg leading-relaxed">{article.excerpt}</p>
              </div>
            )}

            {/* Table of Contents */}
            <TableOfContents items={toc} />

            {/* Article Content */}
            <div
              className="article-styled"
              style={{ overflowWrap: 'break-word', wordBreak: 'break-word' }}
              dangerouslySetInnerHTML={{ __html: (() => {
                const html = article.content_html || article.content || ''
                // Decode HTML entities if content was escaped
                const decoded = html
                  .replace(/&lt;/g, '<')
                  .replace(/&gt;/g, '>')
                  .replace(/&amp;/g, '&')
                  .replace(/&quot;/g, '"')
                  .replace(/&#39;/g, "'")
                return DOMPurify.sanitize(decoded, {
                  ALLOWED_TAGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'hr', 'strong', 'em', 'b', 'i', 'u', 's', 'mark', 'ul', 'ol', 'li', 'blockquote', 'cite', 'a', 'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'pre', 'code', 'figure', 'figcaption', 'div', 'span', 'iframe'],
                  ALLOWED_ATTR: ['href', 'target', 'rel', 'src', 'alt', 'width', 'height', 'class', 'id', 'dir', 'lang', 'colspan', 'rowspan', 'loading', 'decoding', 'style', 'frameborder', 'allowfullscreen', 'allow', 'data-platform'],
                  ALLOW_DATA_ATTR: false,
                })
              })() }}
            />

            {/* Share Buttons */}
            <div className="mt-10 pt-8 border-t border-gray-200">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm font-medium text-gray-700">مشاركة:</span>
                <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                  فيسبوك
                </a>
                <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(article.title + ' ' + window.location.href)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                  واتساب
                </a>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                  نسخ الرابط
                </button>
              </div>
            </div>

            {/* Navigation */}
            <div className="mt-8">
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-6 py-3 border-2 border-emerald-600 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-colors font-medium"
              >
                <svg className="w-5 h-5 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                العودة للمقالات
              </Link>
            </div>
          </main>

          {/* Sidebar */}
          <div className="w-full lg:w-80 flex-shrink-0">
            <div className="lg:sticky lg:top-24">
              <Sidebar currentId={article.id} category={article.category} />
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
