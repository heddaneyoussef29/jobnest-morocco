import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Header from '../components/Header'
import Footer from '../components/Footer'

interface NavItem {
  id: string
  title: string
  slug: string
  url: string
  visible: boolean
  order: number
  icon: string
  subItems: NavItem[]
  content?: string
  pageType?: 'static' | 'articles'
}

interface Article {
  id: string
  title: string
  slug: string
  excerpt: string | null
  cover_image_url: string | null
  cover_image_alt: string | null
  published_at: string | null
  reading_time: number | null
  category: { name: string; slug: string } | null
}

function ArticleCard({ article }: { article: Article }) {
  const [imgError, setImgError] = useState(false)

  return (
    <Link to={`/article/${article.slug}`} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="aspect-video overflow-hidden relative">
        {article.cover_image_url && !imgError ? (
          <img
            src={article.cover_image_url}
            alt={article.cover_image_alt || article.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-50 to-emerald-100">
            <svg className="w-16 h-16 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          </div>
        )}
        {article.reading_time && (
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-gray-700 shadow-sm">
                          📖 {article.reading_time} دقائق
          </div>
        )}
      </div>
      <div className="p-5">
        {article.category && (
          <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-semibold mb-3">
            {article.category.name}
          </span>
        )}
        <h3 className="font-bold text-gray-900 group-hover:text-emerald-600 transition-colors mb-2 line-clamp-2 text-lg">{article.title}</h3>
        {article.excerpt && <p className="text-gray-500 text-sm line-clamp-2 mb-3">{article.excerpt}</p>}
        <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-100">
          {article.published_at && (
            <span className="flex items-center gap-1">
              {new Date(article.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'numeric', year: 'numeric' })}
            </span>
          )}
          <span className="text-emerald-600 font-medium group-hover:translate-x-1 transition-transform">
            اقرأ المزيد ←
          </span>
        </div>
      </div>
    </Link>
  )
}

function ShareButtons({ title, url }: { title: string; url: string }) {
  const shareUrl = typeof window !== 'undefined' ? window.location.href : url
  const encodedUrl = encodeURIComponent(shareUrl)
  const encodedTitle = encodeURIComponent(title)

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-sm font-medium text-gray-600">مشاركة:</span>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-4 py-2 bg-[#1877F2] text-white rounded-lg text-sm hover:bg-[#166FE5] transition-colors shadow-sm hover:shadow-md"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
        فيسبوك
      </a>
      <a
        href={`https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-4 py-2 bg-[#25D366] text-white rounded-lg text-sm hover:bg-[#20BD5A] transition-colors shadow-sm hover:shadow-md"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.299-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
        واتساب
      </a>
      <a
        href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-4 py-2 bg-[#1DA1F2] text-white rounded-lg text-sm hover:bg-[#1A91DA] transition-colors shadow-sm hover:shadow-md"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
        تويتر
      </a>
      <a
        href={`https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-4 py-2 bg-[#0088CC] text-white rounded-lg text-sm hover:bg-[#0077B3] transition-colors shadow-sm hover:shadow-md"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
        تيليجرام
      </a>
      <button
        onClick={() => {
          navigator.clipboard.writeText(window.location.href)
          alert('تم نسخ الرابط!')
        }}
        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors shadow-sm hover:shadow-md"
      >
        📋 نسخ الرابط
      </button>
    </div>
  )
}

export default function DynamicPage() {
  const { slug } = useParams<{ slug: string }>()
  const [page, setPage] = useState<NavItem | null>(null)
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    fetchPage()
  }, [slug])

  const fetchPage = async () => {
    setLoading(true)
    setNotFound(false)
    setArticles([])
    const { data } = await supabase.from('settings').select('value').eq('key', 'nav_pages').single()
    if (data?.value) {
      try {
        const items: NavItem[] = typeof data.value === 'string' ? JSON.parse(data.value) : data.value
        const found = findPageBySlug(items, slug || '')
        if (found) {
          setPage(found)
          if (found.pageType === 'articles') {
            await fetchArticles(found.slug)
          }
        } else {
          setNotFound(true)
        }
      } catch {
        setNotFound(true)
      }
    } else {
      setNotFound(true)
    }
    setLoading(false)
  }

  const fetchArticles = async (pageSlug: string) => {
    const { data } = await supabase
      .from('articles')
      .select('id, title, slug, excerpt, cover_image_url, cover_image_alt, published_at, reading_time, category_id')
      .eq('status', 'published')
      .is('deleted_at', null)
      .eq('nav_page_slug', pageSlug)
      .order('published_at', { ascending: false })

    if (data && data.length > 0) {
      const categoryIds = [...new Set(data.map(a => a.category_id).filter(Boolean))]
      let categoryMap: Record<string, string> = {}
      if (categoryIds.length > 0) {
        const { data: cats } = await supabase.from('categories').select('id, name').in('id', categoryIds)
        if (cats) cats.forEach(c => { categoryMap[c.id] = c.name })
      }

      setArticles(data.map(a => ({
        ...a,
        category: a.category_id ? { name: categoryMap[a.category_id] || '', slug: '' } : null
      })))
    }
  }

  const findPageBySlug = (items: NavItem[], targetSlug: string): NavItem | null => {
    for (const item of items) {
      if (item.slug === targetSlug) return item
      if (item.subItems?.length) {
        const found = findPageBySlug(item.subItems, targetSlug)
        if (found) return found
      }
    }
    return null
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">جاري تحميل الصفحة...</p>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  if (notFound || !page) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex flex-col items-center justify-center px-4">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">الصفحة غير موجودة</h1>
          <p className="text-gray-500 mb-6">الصفحة التي تبحث عنها غير موجودة أو تم حذفها</p>
          <Link to="/" className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium">
            العودة للرئيسية
          </Link>
        </div>
        <Footer />
      </>
    )
  }

  const isArticlesPage = page.pageType === 'articles'
  const pageUrl = typeof window !== 'undefined' ? window.location.href : ''

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50" dir="rtl">
        {/* Hero Header */}
        <div className="relative bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-700 text-white overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/3"></div>
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-emerald-100/80 mb-6 overflow-x-auto">
              <Link to="/" className="hover:text-white transition-colors whitespace-nowrap">الرئيسية</Link>
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <Link to="/jobs" className="hover:text-white transition-colors whitespace-nowrap">الوظائف</Link>
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-white font-semibold whitespace-nowrap">{page.title}</span>
            </nav>
            
            <div className="flex flex-col items-center text-center">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">{page.title}</h1>
              {isArticlesPage && (
                <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
                  <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold border border-white/20">
                    📚 {articles.length} مقال متاح
                  </span>
                  <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold border border-white/20">
                    🕐 آخر تحديث: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
          {/* Share Buttons */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
            <ShareButtons title={page.title} url={pageUrl} />
          </div>

          {isArticlesPage ? (
            articles.length > 0 ? (
              <>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {articles.map(article => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>

                {/* Newsletter Section */}
                <div className="mt-12 bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-2xl p-8 text-white">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                      <h3 className="text-xl font-bold mb-2">📬 اشترك للحصول على آخر المقالات</h3>
                      <p className="text-emerald-100">احصل على جديد المقالات مباشرة في بريدك الإلكتروني</p>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                      <input
                        type="email"
                        placeholder="بريدك الإلكتروني"
                        className="flex-1 md:w-64 px-4 py-3 rounded-xl bg-white/20 text-white placeholder-white/60 border border-white/30 focus:outline-none focus:border-white"
                      />
                      <button className="px-6 py-3 bg-white text-emerald-700 rounded-xl font-medium hover:bg-emerald-50 transition-colors">
                        اشترك
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">لا توجد مقالات بعد</h3>
                <p className="text-gray-500 mb-6">لم يتم إضافة أي مقالات لهذه الصفحة بعد</p>
                <Link to="/articles" className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium inline-block">
                  تصفح المقالات
                </Link>
              </div>
            )
          ) : (
            page.content ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-10">
                <div className="article-styled" style={{ overflowWrap: 'break-word' }} dangerouslySetInnerHTML={{ __html: page.content }} />
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                <div className="text-6xl mb-4">📄</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">صفحة قيد الإعداد</h3>
                <p className="text-gray-500">سيتم إضافة محتوى لهذه الصفحة قريباً</p>
              </div>
            )
          )}

          {/* Back to Home */}
          <div className="mt-12 text-center">
            <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 border-2 border-emerald-600 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-colors font-medium">
              العودة للرئيسية
              <svg className="w-5 h-5 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}