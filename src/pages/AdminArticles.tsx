import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { supabase } from '../lib/supabase'

interface Article {
  id: string
  title: string
  slug: string
  status: string
  published_at: string | null
  created_at: string
  cover_image_url: string | null
  cover_image_alt: string | null
  reading_time: number | null
  excerpt: string | null
  views_count: number
  category: { name: string } | null
}

export default function AdminArticles() {
  const { user, loading } = useAuthStore()
  const navigate = useNavigate()
  const [articles, setArticles] = useState<Article[]>([])
  const [loadingArticles, setLoadingArticles] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all')
  const [sortBy, setSortBy] = useState<'newest' | 'views'>('newest')
  const [selectedArticles, setSelectedArticles] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!loading && !user) navigate('/admin/login')
  }, [user, loading, navigate])

  useEffect(() => { if (user) fetchArticles() }, [user])

  const fetchArticles = async () => {
    setLoadingArticles(true)
    const { data } = await supabase
      .from('articles')
      .select('*, category:categories(name)')
      .is('deleted_at', null)
      .order('views_count', { ascending: false })
    setArticles(data || [])
    setLoadingArticles(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المقال؟')) return
    await supabase.from('articles').update({ deleted_at: new Date().toISOString() }).eq('id', id)
    fetchArticles()
  }

  const handleBulkDelete = async () => {
    if (selectedArticles.size === 0) return
    if (!confirm(`هل أنت متأكد من حذف ${selectedArticles.size} مقال(s)؟`)) return
    
    const ids = Array.from(selectedArticles)
    await supabase.from('articles').update({ deleted_at: new Date().toISOString() }).in('id', ids)
    setSelectedArticles(new Set())
    fetchArticles()
  }

  const toggleSelectArticle = (id: string) => {
    const newSelected = new Set(selectedArticles)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedArticles(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectedArticles.size === filteredArticles.length) {
      setSelectedArticles(new Set())
    } else {
      setSelectedArticles(new Set(filteredArticles.map(a => a.id)))
    }
  }

  const handlePublish = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'published' ? 'draft' : 'published'
    await supabase.from('articles').update({
      status: newStatus,
      published_at: newStatus === 'published' ? new Date().toISOString() : null
    }).eq('id', id)
    fetchArticles()
  }

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.category?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'all' || article.status === filterStatus
    return matchesSearch && matchesStatus
  }).sort((a, b) => {
    if (sortBy === 'views') return (b.views_count || 0) - (a.views_count || 0)
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  const publishedCount = articles.filter(a => a.status === 'published').length
  const draftCount = articles.filter(a => a.status === 'draft').length
  const totalViews = articles.reduce((sum, a) => sum + (a.views_count || 0), 0)

  if (loading || !user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-emerald-50/30" dir="rtl">
      {/* Header */}
      <header className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 text-white shadow-lg shadow-emerald-200/50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Link to="/admin" className="flex items-center gap-1 text-emerald-100 hover:text-white transition-colors bg-white/10 px-2 py-1.5 rounded-lg backdrop-blur-sm text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                لوحة الإدارة
              </Link>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold flex items-center gap-2">
                  <svg className="w-5 h-5 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
                  إدارة المقالات
                </h1>
                <p className="text-emerald-100 text-xs sm:text-sm mt-0.5 hidden sm:block">إدارة وتنظيم جميع مقالاتك</p>
              </div>
            </div>
            <Link to="/admin/articles/new" className="flex items-center justify-center gap-2 px-4 py-2 bg-white text-emerald-700 rounded-xl hover:bg-emerald-50 font-semibold shadow-sm hover:shadow-md transition-all text-sm sm:text-base">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              مقال جديد
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{articles.length}</p>
                <p className="text-sm text-gray-500">إجمالي المقالات</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-600">{publishedCount}</p>
                <p className="text-sm text-gray-500">منشور</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-600">{draftCount}</p>
                <p className="text-sm text-gray-500">مسودات</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-rose-600">{totalViews.toLocaleString('en-US')}</p>
                <p className="text-sm text-gray-500">إجمالي المشاهدات</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="بحث في المقالات..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-10 pl-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-gray-50 focus:bg-white transition-colors"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'all', label: 'الكل', count: articles.length },
                { value: 'published', label: 'منشور', count: publishedCount },
                { value: 'draft', label: 'مسودة', count: draftCount },
              ].map(f => (
                <button
                  key={f.value}
                  onClick={() => setFilterStatus(f.value as any)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    filterStatus === f.value
                      ? f.value === 'published' ? 'bg-emerald-600 text-white shadow-sm'
                        : f.value === 'draft' ? 'bg-amber-500 text-white shadow-sm'
                        : 'bg-gray-800 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {f.label} ({f.count})
                </button>
              ))}
              <div className="w-px bg-gray-200 mx-1"></div>
              {[
                { value: 'newest', label: 'الأحدث' },
                { value: 'views', label: 'الأكثر مشاهدة' },
              ].map(s => (
                <button
                  key={s.value}
                  onClick={() => setSortBy(s.value as any)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    sortBy === s.value
                      ? s.value === 'views' ? 'bg-rose-600 text-white shadow-sm' : 'bg-gray-800 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {s.value === 'views' && <span className="ml-1">👁</span>}
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Bulk Actions */}
          {selectedArticles.size > 0 && (
            <div className="mt-4 p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
              <span className="text-sm text-emerald-700 font-medium">
                تم تحديد {selectedArticles.size} مقال(s)
              </span>
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                حذف المحدد
              </button>
            </div>
          )}
        </div>

        {loadingArticles ? (
          <div className="text-center py-16">
            <div className="inline-block w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 mt-4 text-lg">جاري تحميل المقالات...</p>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <p className="text-gray-600 text-lg mb-2">
              {searchQuery || filterStatus !== 'all' ? 'لا توجد نتائج مطابقة' : 'لا توجد مقالات بعد'}
            </p>
            <p className="text-gray-400 text-sm mb-6">
              {searchQuery || filterStatus !== 'all' ? 'جرب تغيير معايير البحث' : 'ابدأ بإنشاء أول مقال'}
            </p>
            {!searchQuery && filterStatus === 'all' && (
              <Link to="/admin/articles/new" className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-medium shadow-sm hover:shadow-md transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                أضف أول مقال
              </Link>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Table Header */}
            <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50/80 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <div className="col-span-1">
                <input
                  type="checkbox"
                  checked={selectedArticles.size === filteredArticles.length && filteredArticles.length > 0}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 text-emerald-600 bg-white border-gray-300 rounded focus:ring-emerald-500 cursor-pointer"
                />
              </div>
              <div className="col-span-3">المقال</div>
              <div className="col-span-2">التصنيف</div>
              <div className="col-span-1">الحالة</div>
              <div className="col-span-1">الوقت</div>
              <div className="col-span-1 text-center">المشاهدات</div>
              <div className="col-span-1">التاريخ</div>
              <div className="col-span-2 text-center">إجراءات</div>
            </div>

            {/* Articles List */}
            <div className="divide-y divide-gray-100">
              {filteredArticles.map((article, index) => (
                <div key={article.id} className={`grid grid-cols-1 lg:grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50/50 transition-colors items-center group ${selectedArticles.has(article.id) ? 'bg-emerald-50/50' : ''}`}>
                  {/* Checkbox */}
                  <div className="col-span-1 hidden lg:block">
                    <input
                      type="checkbox"
                      checked={selectedArticles.has(article.id)}
                      onChange={() => toggleSelectArticle(article.id)}
                      className="w-4 h-4 text-emerald-600 bg-white border-gray-300 rounded focus:ring-emerald-500 cursor-pointer"
                    />
                  </div>

                  {/* Article Info with Image */}
                  <div className="col-span-4 flex items-center gap-4">
                    {/* Cover Image Thumbnail */}
                    <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-100">
                      {article.cover_image_url ? (
                        <img
                          src={article.cover_image_url}
                          alt={article.cover_image_alt || article.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                            const parent = target.parentElement
                            if (parent) {
                              parent.innerHTML = `<div class="w-full h-full flex items-center justify-center"><svg class="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>`
                            }
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate group-hover:text-emerald-700 transition-colors">
                        {article.title}
                      </h3>
                      {article.excerpt && (
                        <p className="text-sm text-gray-500 truncate mt-0.5 max-w-xs">{article.excerpt}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1 lg:hidden">
                        {new Date(article.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>

                  {/* Category */}
                  <div className="col-span-2 hidden lg:block">
                    <span className="text-sm text-gray-600">
                      {article.category?.name ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 rounded-lg text-xs font-medium">
                          {article.category.name}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </span>
                  </div>

                  {/* Status */}
                  <div className="col-span-1 hidden lg:block">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full ${
                      article.status === 'published'
                        ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                        : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${article.status === 'published' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                      {article.status === 'published' ? 'منشور' : 'مسودة'}
                    </span>
                  </div>

                  {/* Reading Time */}
                  <div className="col-span-1 hidden lg:block">
                    <span className="text-sm text-gray-500">{article.reading_time || '—'} د</span>
                  </div>

                  {/* Views Count */}
                  <div className="col-span-1 hidden lg:block text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 text-rose-600 rounded-lg text-xs font-semibold">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      {(article.views_count || 0).toLocaleString('en-US')}
                    </span>
                  </div>

                  {/* Date */}
                  <div className="col-span-1 hidden lg:block">
                    <span className="text-sm text-gray-500">{new Date(article.created_at).toLocaleDateString('fr-FR')}</span>
                  </div>

                  {/* Actions */}
                  <div className="col-span-2 flex items-center justify-center gap-2">
                    <Link
                      to={`/admin/articles/${article.id}/edit`}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      تعديل
                    </Link>
                    <button
                      onClick={() => handlePublish(article.id, article.status)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                        article.status === 'published'
                          ? 'text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100'
                          : 'text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                      }`}
                    >
                      {article.status === 'published' ? (
                        <>
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                          إلغاء النشر
                        </>
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          نشر
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(article.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      حذف
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 bg-gray-50/50 border-t border-gray-100 text-sm text-gray-500">
              عرض {filteredArticles.length} من {articles.length} مقال
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
