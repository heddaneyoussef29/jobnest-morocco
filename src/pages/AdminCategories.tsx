import { useEffect, useState, lazy, Suspense } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { supabase } from '../lib/supabase'
import TagInput from '../components/TagInput'
import { useToast, ToastContainer } from '../components/Toast'

const RichTextEditor = lazy(() => import('../components/RichTextEditor'))

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  search_keywords: string | null
  sort_order: number
  created_at: string
}

export default function AdminCategories() {
  const { user, loading } = useAuthStore()
  const navigate = useNavigate()
  const { toasts, removeToast, success, error: toastError, warning } = useToast()
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [searchKeywords, setSearchKeywords] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!loading && !user) navigate('/admin/login')
  }, [user, loading, navigate])

  useEffect(() => {
    if (user) fetchCategories()
  }, [user])

  const fetchCategories = async () => {
    setLoadingCategories(true)
    const { data } = await supabase.from('categories').select('*').order('sort_order')
    setCategories(data || [])
    setLoadingCategories(false)
  }

  const generateSlug = (text: string) => {
    // First try ASCII-only slug
    let slug = text.toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
    
    // If slug is empty (all Arabic text), use timestamp fallback
    if (!slug || slug.length < 2) {
      slug = `category-${Date.now()}`
    }
    
    return slug
  }

  const handleSave = async () => {
    if (!name.trim()) {
      setError('يرجى إدخال اسم التصنيف')
      return
    }
    setSaving(true)
    setError('')

    const categoryData = {
      name: name.trim(),
      slug: slug || generateSlug(name),
      description: description.trim() || null,
      search_keywords: searchKeywords.trim() || null,
      updated_at: new Date().toISOString()
    }

    try {
      if (editingId) {
        const { error } = await supabase.from('categories').update(categoryData).eq('id', editingId)
        if (error) throw error
        success('تم تحديث التصنيف بنجاح')
      } else {
        const { error } = await supabase.from('categories').insert(categoryData)
        if (error) throw error
        success('تم إضافة التصنيف بنجاح')
      }
      resetForm()
      fetchCategories()
    } catch (err: any) {
      toastError(err.message || 'خطأ في الحفظ')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (category: Category) => {
    setEditingId(category.id)
    setName(category.name)
    setSlug(category.slug)
    setDescription(category.description || '')
    setSearchKeywords(category.search_keywords || '')
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا التصنيف؟ سيتم إزالة التصنيف من جميع المقالات المرتبطة.')) return
    
    try {
      const { error: updateError } = await supabase
        .from('articles')
        .update({ category_id: null })
        .eq('category_id', id)
      
      if (updateError) {
        console.error('Update articles error:', updateError)
      }

      const { error } = await supabase.from('categories').delete().eq('id', id)
      if (error) {
        toastError('فشل في حذف التصنيف')
        return
      }
      success('تم حذف التصنيف بنجاح')
      fetchCategories()
    } catch (err: any) {
      toastError('فشل في حذف التصنيف')
    }
  }

  const handleBulkDelete = async () => {
    if (selectedCategories.size === 0) return
    if (!confirm(`هل أنت متأكد من حذف ${selectedCategories.size} تصنيف(s)؟ سيتم إزالة التصنيف من جميع المقالات المرتبطة.`)) return
    
    try {
      const ids = Array.from(selectedCategories)
      
      const { error: updateError } = await supabase
        .from('articles')
        .update({ category_id: null })
        .in('category_id', ids)
      
      if (updateError) {
        console.error('Update articles error:', updateError)
      }

      const { error } = await supabase.from('categories').delete().in('id', ids)
      if (error) {
        toastError('فشل في حذف التصنيفات')
        return
      }
      success(`تم حذف ${selectedCategories.size} تصنيف بنجاح`)
      setSelectedCategories(new Set())
      fetchCategories()
    } catch (err: any) {
      toastError('فشل في حذف التصنيفات')
    }
  }

  const toggleSelectCategory = (id: string) => {
    const newSelected = new Set(selectedCategories)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedCategories(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectedCategories.size === categories.length) {
      setSelectedCategories(new Set())
    } else {
      setSelectedCategories(new Set(categories.map(c => c.id)))
    }
  }

  const resetForm = () => {
    setName('')
    setSlug('')
    setDescription('')
    setSearchKeywords('')
    setEditingId(null)
    setShowForm(false)
    setError('')
  }

  if (loading || !user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-emerald-50/30" dir="rtl">
      {/* Header */}
      <header className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 text-white shadow-lg shadow-emerald-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/admin" className="flex items-center gap-2 text-emerald-100 hover:text-white transition-colors bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                لوحة الإدارة
              </Link>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                  إدارة التصنيفات
                </h1>
                <p className="text-emerald-100 text-sm mt-0.5">تنظيم المقالات حسب التصنيفات</p>
              </div>
            </div>
            <button
              onClick={() => { resetForm(); setShowForm(true) }}
              className="flex items-center gap-2 px-5 py-2.5 bg-white text-emerald-700 rounded-xl hover:bg-emerald-50 font-semibold shadow-sm hover:shadow-md transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              تصنيف جديد
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Bulk Actions */}
        {selectedCategories.size > 0 && (
          <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-4 mb-6 flex items-center justify-between">
            <span className="text-sm text-emerald-700 font-medium">
              تم تحديد {selectedCategories.size} تصنيف(s)
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

        {/* Add/Edit Form */}
        {showForm && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={editingId ? "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" : "M12 4v16m8-8H4"} /></svg>
              </div>
              {editingId ? 'تعديل التصنيف' : 'إضافة تصنيف جديد'}
            </h2>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">اسم التصنيف <span className="text-red-500">*</span></label>
                <input type="text" value={name} onChange={(e) => { setName(e.target.value); if (!editingId) setSlug(generateSlug(e.target.value)) }}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-gray-50 focus:bg-white transition-all"
                  placeholder="مثال: نصائح مهنية" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">الرابط (Slug)</label>
                <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-gray-50 focus:bg-white transition-all font-mono text-sm"
                  placeholder="career-tips" dir="ltr" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">الوصف</label>
                <Suspense fallback={<div className="min-h-[150px] flex items-center justify-center bg-gray-50 rounded-xl border border-gray-200"><p className="text-gray-500 text-sm">جاري تحميل المحرر...</p></div>}>
                  <RichTextEditor
                    content={description}
                    onChange={setDescription}
                    placeholder="وصف قصير للتصنيف"
                  />
                </Suspense>
              </div>
              <div>
                <TagInput
                  value={searchKeywords}
                  onChange={setSearchKeywords}
                  label="🔍 كلمات مفتاحية للبحث"
                  placeholder="اكتب كلمة مفتاحية واضغط Enter"
                  hint="اضغط Enter لإضافة كل كلمة. هذه الكلمات تساعد في العثور على التصنيف من محرك البحث."
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={handleSave} disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 font-medium transition-all shadow-sm hover:shadow-md">
                  {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
                  {saving ? 'جاري الحفظ...' : 'حفظ'}
                </button>
                <button onClick={resetForm} className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium transition-all">
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Categories List */}
        {loadingCategories ? (
          <div className="text-center py-16">
            <div className="inline-block w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 mt-4">جاري التحميل...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
            </div>
            <p className="text-gray-600 text-lg mb-2">لا توجد تصنيفات بعد</p>
            <p className="text-gray-400 text-sm mb-6">ابدأ بإنشاء أول تصنيف لتنظيم مقالاتك</p>
            <button onClick={() => { resetForm(); setShowForm(true) }} className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-medium shadow-sm hover:shadow-md transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              أضف أول تصنيف
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Select All Header */}
            <div className="col-span-full mb-2 flex items-center gap-3">
              <input
                type="checkbox"
                checked={selectedCategories.size === categories.length && categories.length > 0}
                onChange={toggleSelectAll}
                className="w-4 h-4 text-emerald-600 bg-white border-gray-300 rounded focus:ring-emerald-500 cursor-pointer"
              />
              <span className="text-sm text-gray-600 font-medium">تحديد الكل</span>
            </div>
            
            {categories.map((category) => (
              <div key={category.id} className={`bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all group ${selectedCategories.has(category.id) ? 'ring-2 ring-emerald-500 bg-emerald-50/30' : ''}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedCategories.has(category.id)}
                      onChange={() => toggleSelectCategory(category.id)}
                      className="w-4 h-4 text-emerald-600 bg-white border-gray-300 rounded focus:ring-emerald-500 cursor-pointer"
                    />
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm">
                      {category.name.charAt(0)}
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(category)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <button onClick={() => handleDelete(category.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
                <h3 className="font-bold text-gray-900 mb-1 group-hover:text-emerald-700 transition-colors">{category.name}</h3>
                <p className="text-xs text-gray-400 font-mono mb-2">/{category.slug}</p>
                {category.description && (
                  <p className="text-sm text-gray-500 line-clamp-2">{category.description}</p>
                )}
                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                  <span>{new Date(category.created_at).toLocaleDateString('fr-FR')}</span>
                  <span className="px-2 py-0.5 bg-gray-100 rounded-full">الترتيب: {category.sort_order}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
