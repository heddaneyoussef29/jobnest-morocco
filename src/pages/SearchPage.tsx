import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { supabase } from '../lib/supabase'

interface SearchResult {
  id: string
  type: 'article' | 'job' | 'category'
  title: string
  slug?: string
  excerpt?: string
  description?: string
  search_keywords?: string
  cover_image_url?: string
  company?: string
  location?: string
  job_type?: string
  created_at: string
}

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState(searchParams.get('q') || '')

  useEffect(() => {
    const q = searchParams.get('q')
    if (q) {
      setQuery(q)
      performSearch(q)
    }
  }, [searchParams])

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setLoading(true)
    const searchTerm = searchQuery.trim().toLowerCase()

    try {
      // Search in articles
      const { data: articles } = await supabase
        .from('articles')
        .select('id, title, slug, excerpt, cover_image_url, search_keywords, created_at')
        .eq('status', 'published')
        .is('deleted_at', null)

      // Search in jobs
      const { data: jobs } = await supabase
        .from('jobs')
        .select('id, title, company, location, job_type, description, search_keywords, created_at')
        .eq('status', 'active')
        .is('deleted_at', null)

      // Search in categories
      const { data: categories } = await supabase
        .from('categories')
        .select('id, name, slug, description, search_keywords, created_at')

      const searchResults: SearchResult[] = []

      // Filter articles
      if (articles) {
        articles.forEach(article => {
          const searchText = `${article.title} ${article.excerpt || ''} ${article.search_keywords || ''}`.toLowerCase()
          if (searchText.includes(searchTerm)) {
            searchResults.push({
              ...article,
              type: 'article'
            })
          }
        })
      }

      // Filter jobs
      if (jobs) {
        jobs.forEach(job => {
          const searchText = `${job.title} ${job.company} ${job.location || ''} ${job.description || ''} ${job.search_keywords || ''}`.toLowerCase()
          if (searchText.includes(searchTerm)) {
            searchResults.push({
              ...job,
              type: 'job'
            })
          }
        })
      }

      // Filter categories
      if (categories) {
        categories.forEach(category => {
          const searchText = `${category.name} ${category.description || ''} ${category.search_keywords || ''}`.toLowerCase()
          if (searchText.includes(searchTerm)) {
            searchResults.push({
              ...category,
              title: category.name,
              type: 'category'
            })
          }
        })
      }

      setResults(searchResults)
    } catch (err) {
      console.error('Search error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      setSearchParams({ q: query.trim() })
      performSearch(query.trim())
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'article': return { label: 'مقال', color: 'bg-blue-100 text-blue-700' }
      case 'job': return { label: 'وظيفة', color: 'bg-emerald-100 text-emerald-700' }
      case 'category': return { label: 'تصنيف', color: 'bg-purple-100 text-purple-700' }
      default: return { label: '', color: '' }
    }
  }

  const getResultLink = (result: SearchResult) => {
    switch (result.type) {
      case 'article': return `/article/${result.slug}`
      case 'job': return '/jobs'
      case 'category': return `/articles?category=${result.slug}`
      default: return '#'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Search Header */}
      <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6 text-center">نتائج البحث</h1>
          
          {/* Search Form */}
          <form onSubmit={handleSearch} className="bg-white rounded-2xl p-4 shadow-xl">
            <div className="flex gap-4">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ابحث عن مقال، وظيفة، أو تصنيف..."
                className="flex-1 px-6 py-4 text-lg text-gray-900 border-0 focus:ring-0 outline-none"
              />
              <button
                type="submit"
                className="px-8 py-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                بحث
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">جاري البحث...</p>
          </div>
        ) : results.length === 0 && query ? (
          <div className="text-center py-20">
            <svg className="w-20 h-20 text-gray-300 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="text-xl font-bold text-gray-900 mb-2">لا توجد نتائج لـ "{query}"</h3>
            <p className="text-gray-600">جرب البحث بكلمات مختلفة</p>
          </div>
        ) : results.length > 0 ? (
          <>
            <p className="text-gray-600 mb-6">{results.length} نتيجة بحث لـ "{query}"</p>
            <div className="space-y-4">
              {results.map((result) => {
                const typeInfo = getTypeLabel(result.type)
                return (
                  <Link
                    key={`${result.type}-${result.id}`}
                    to={getResultLink(result)}
                    className="block bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-start gap-4">
                      {result.cover_image_url && (
                        <img src={result.cover_image_url} alt={result.title} className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${typeInfo.color}`}>
                            {typeInfo.label}
                          </span>
                          {result.company && (
                            <span className="text-gray-500 text-sm">{result.company}</span>
                          )}
                          {result.location && (
                            <span className="text-gray-400 text-sm">• {result.location}</span>
                          )}
                        </div>
                        <h3 className="font-bold text-gray-900 text-lg mb-2">{result.title}</h3>
                        {(result.excerpt || result.description) && (
                          <p className="text-gray-600 text-sm line-clamp-2">
                            {result.excerpt || result.description}
                          </p>
                        )}
                        {result.search_keywords && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {result.search_keywords.split(',').map((keyword, idx) => (
                              <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                {keyword.trim()}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <svg className="w-20 h-20 text-gray-300 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="text-xl font-bold text-gray-900 mb-2">ابدأ البحث</h3>
            <p className="text-gray-600">اكتب كلمة للبحث في المقالات والوظائف والتصنيفات</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
