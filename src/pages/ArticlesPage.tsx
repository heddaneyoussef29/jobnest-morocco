import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { supabase } from '../lib/supabase'

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

function ArticleImage({ article }: { article: Article }) {
  const [imgError, setImgError] = useState(false)

  if (!article.cover_image_url || imgError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-50 to-emerald-100">
        <svg className="w-12 h-12 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
      </div>
    )
  }

  return (
    <img
      src={article.cover_image_url}
      alt={article.cover_image_alt || article.title}
      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
      loading="lazy"
      onError={() => setImgError(true)}
    />
  )
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function ArticlesPage() {
  const [searchParams] = useSearchParams()
  const [articles, setArticles] = useState<Article[]>([])
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '')
  const [, setSearchParams] = useSearchParams()

  useEffect(() => {
    if (selectedCategory) {
      setSearchParams({ category: selectedCategory }, { replace: true })
    } else {
      setSearchParams({}, { replace: true })
    }
  }, [selectedCategory])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [articlesResult, categoriesResult] = await Promise.all([
        supabase
          .from('articles')
          .select('id, title, slug, excerpt, cover_image_url, cover_image_alt, published_at, reading_time, category_id')
          .eq('status', 'published')
          .is('deleted_at', null)
          .order('published_at', { ascending: false }),
        supabase
          .from('categories')
          .select('*')
          .order('sort_order')
      ])

      const articlesData = articlesResult.data || []
      const categoriesData = categoriesResult.data || []

      const articlesWithCategories = articlesData.map(article => {
        const category = categoriesData.find(c => c.id === article.category_id)
        return {
          ...article,
          category: category ? { name: category.name, slug: category.slug } : null
        }
      })

      setArticles(articlesWithCategories)
      setCategories(categoriesData)
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredArticles = selectedCategory
    ? articles.filter(a => a.category?.slug === selectedCategory)
    : articles

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">المقالات المهنية</h1>
          <p className="text-emerald-100 text-lg mb-8">اكتشف نصائح وإرشادات لتطوير مسارك المهني</p>
          
          {/* Category Filters */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                !selectedCategory
                  ? 'bg-white text-emerald-700 shadow-lg'
                  : 'bg-emerald-700/50 text-white hover:bg-emerald-700/70'
              }`}
            >
              جميع المقالات
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === cat.slug
                    ? 'bg-white text-emerald-700 shadow-lg'
                    : 'bg-emerald-700/50 text-white hover:bg-emerald-700/70'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Articles Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">جاري تحميل المقالات...</p>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="text-center py-20">
            <svg className="w-20 h-20 text-gray-300 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            <h3 className="text-xl font-bold text-gray-900 mb-2">لا توجد مقالات متاحة حالياً</h3>
            <p className="text-gray-600">تحقق لاحقاً من جديد</p>
          </div>
        ) : (
          <>
            <p className="text-gray-600 mb-6">{filteredArticles.length} مقال متاح</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredArticles.map((article) => (
                <Link
                  key={article.id}
                  to={`/article/${article.slug}`}
                  className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 group"
                >
                  <div className="h-48 overflow-hidden">
                    <ArticleImage article={article} />
                  </div>
                  <div className="p-6">
                    {article.category && (
                      <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium mb-3">
                        {article.category.name}
                      </span>
                    )}
                    <h3 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-emerald-600 transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    {article.excerpt && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{article.excerpt}</p>
                    )}
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      {article.published_at && (
                        <span>{formatDate(article.published_at)}</span>
                      )}
                      {article.reading_time && (
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {article.reading_time} دقائق قراءة
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  )
}
