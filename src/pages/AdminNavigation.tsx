import { useEffect, useState, lazy, Suspense } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { supabase } from '../lib/supabase'
import { useToast, ToastContainer } from '../components/Toast'

const RichTextEditor = lazy(() => import('../components/RichTextEditor'))

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
  pageType?: 'static' | 'articles'  // نوع الصفحة: ثابتة أو عرض مقالات
}

export default function AdminNavigation() {
  const { user, loading } = useAuthStore()
  const navigate = useNavigate()
  const { toasts, removeToast, success, error: toastError } = useToast()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [navItems, setNavItems] = useState<NavItem[]>([])
  const [loadingNav, setLoadingNav] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [parentId, setParentId] = useState<string | null>(null)
  const [formTitle, setFormTitle] = useState('')
  const [formSlug, setFormSlug] = useState('')
  const [formUrl, setFormUrl] = useState('')
  const [formVisible, setFormVisible] = useState(true)
  const [formIcon, setFormIcon] = useState('📄')
  const [formContent, setFormContent] = useState('')
  const [formPageType, setFormPageType] = useState<'static' | 'articles'>('static')
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!loading && !user) navigate('/admin/login')
  }, [user, loading, navigate])

  useEffect(() => {
    if (user) fetchNavItems()
  }, [user])

  const defaultPages: NavItem[] = [
    { id: 'home', title: 'الرئيسية', slug: '', url: '/', visible: true, order: 0, icon: '🏠', subItems: [], pageType: 'static' },
    { id: 'jobs', title: 'الوظائف', slug: 'jobs', url: '/jobs', visible: true, order: 1, icon: '💼', subItems: [
      { id: 'jobs-all', title: 'جميع الوظائف', slug: 'jobs', url: '/jobs', visible: true, order: 0, icon: '📋', subItems: [], pageType: 'static' },
      { id: 'jobs-tips', title: 'نصائح المقابلات', slug: 'interview-tips', url: '/interview-tips', visible: true, order: 1, icon: '💡', subItems: [], pageType: 'static' }
    ], pageType: 'static'},
    { id: 'articles', title: 'المقالات', slug: 'articles', url: '/articles', visible: true, order: 2, icon: '📰', subItems: [], pageType: 'static' },
    { id: 'about', title: 'حولنا', slug: 'about', url: '/about', visible: true, order: 3, icon: 'ℹ️', subItems: [], pageType: 'static' },
    { id: 'contact', title: 'اتصل بنا', slug: 'contact', url: '/contact', visible: true, order: 4, icon: '📞', subItems: [], pageType: 'static' }
  ]

  const fetchNavItems = async () => {
    setLoadingNav(true)
    const { data } = await supabase.from('settings').select('value').eq('key', 'nav_pages').single()
    if (data?.value) {
      try {
        const parsed = typeof data.value === 'string' ? JSON.parse(data.value) : data.value
        if (Array.isArray(parsed) && parsed.length > 0) {
          setNavItems(parsed)
        } else {
          // إذا كانت البيانات فارغة، احفظ الصفحات الافتراضية
          setNavItems(defaultPages)
          await saveNavItems(defaultPages)
        }
      } catch {
        // إذا حدث خطأ في التحليل، احفظ الصفحات الافتراضية
        setNavItems(defaultPages)
        await saveNavItems(defaultPages)
      }
    } else {
      // إذا لم توجد بيانات، احفظ الصفحات الافتراضية
      setNavItems(defaultPages)
      await saveNavItems(defaultPages)
    }
    setLoadingNav(false)
  }

  const saveNavItems = async (items: NavItem[]) => {
    setSaving(true)
    const { error } = await supabase.from('settings').upsert(
      { key: 'nav_pages', value: JSON.stringify(items) },
      { onConflict: 'key' }
    )
    if (error) {
      toastError('خطأ في حفظ التنقل')
    } else {
      success('تم حفظ التنقل بنجاح')
      // إشعار Header بالتحديث
      window.dispatchEvent(new Event('nav-updated'))
    }
    setSaving(false)
  }

  const generateSlug = (text: string) => {
    let slug = text.toLowerCase()
      .replace(/[^\w\s\u0600-\u06FF-]/g, '') // Support Arabic characters
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .trim()
    if (!slug || slug.length < 2) {
      slug = 'page-' + Date.now()
    }
    return slug
  }

  // Generate a unique slug by checking existing nav items
  const generateUniqueSlug = (baseSlug: string, excludeId?: string) => {
    let slug = baseSlug
    let counter = 1
    const existingSlugs = new Set<string>()
    
    const collectSlugs = (items: NavItem[]) => {
      for (const item of items) {
        if (item.id !== excludeId) {
          existingSlugs.add(item.slug)
        }
        if (item.subItems?.length) {
          collectSlugs(item.subItems)
        }
      }
    }
    collectSlugs(navItems)
    
    while (existingSlugs.has(slug)) {
      slug = `${baseSlug}-${counter}`
      counter++
    }
    return slug
  }

  const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2)

  const resetForm = () => {
    setFormTitle('')
    setFormSlug('')
    setFormUrl('')
    setFormVisible(true)
    setFormIcon('📄')
    setFormContent('')
    setFormPageType('static')
    setEditingId(null)
    setParentId(null)
    setShowForm(false)
  }

  const handleAddItem = (pId: string | null = null) => {
    resetForm()
    setParentId(pId)
    setShowForm(true)
  }

  const handleEditItem = (item: NavItem, pId: string | null = null) => {
    setFormTitle(item.title)
    setFormSlug(item.slug)
    setFormUrl(item.url)
    setFormVisible(item.visible)
    setFormIcon(item.icon)
    setFormContent(item.content || '')
    setFormPageType(item.pageType || 'static')
    setEditingId(item.id)
    setParentId(pId)
    setShowForm(true)
  }

  const handleSubmit = async () => {
    if (!formTitle.trim()) {
      toastError('الرجاء إدخال عنوان الصفحة')
      return
    }
    const baseSlug = formSlug.trim() || generateSlug(formTitle)
    const slug = editingId ? baseSlug : generateUniqueSlug(baseSlug, editingId)
    const newItem: NavItem = {
      id: editingId || generateId(),
      title: formTitle.trim(),
      slug,
      url: formUrl.trim() || `/page/${slug}`,
      visible: formVisible,
      order: editingId ? 0 : (parentId ? 
        (navItems.find(i => i.id === parentId)?.subItems.length || 0) + 1 : 
        navItems.length + 1),
      icon: formIcon,
      subItems: editingId ? [] : [],
      content: formContent,
      pageType: formPageType
    }

    let updatedItems: NavItem[]
    if (parentId) {
      updatedItems = navItems.map(item => {
        if (item.id === parentId) {
          if (editingId) {
            return { ...item, subItems: item.subItems.map(si => si.id === editingId ? { ...newItem, subItems: si.subItems } : si) }
          }
          return { ...item, subItems: [...item.subItems, newItem] }
        }
        return item
      })
    } else {
      if (editingId) {
        updatedItems = navItems.map(item => item.id === editingId ? { ...newItem, subItems: item.subItems } : item)
      } else {
        updatedItems = [...navItems, newItem]
      }
    }
    await saveNavItems(updatedItems)
    setNavItems(updatedItems)
    resetForm()
  }

  const handleDeleteItem = async (itemId: string, pId: string | null = null) => {
    if (!confirm('هل أنت متأكد من حذف هذه الصفحة؟')) return
    let updatedItems: NavItem[]
    if (pId) {
      updatedItems = navItems.map(item => item.id === pId ? { ...item, subItems: item.subItems.filter(si => si.id !== itemId) } : item)
    } else {
      updatedItems = navItems.filter(item => item.id !== itemId)
    }
    await saveNavItems(updatedItems)
    setNavItems(updatedItems)
  }

  const handleToggleVisibility = async (itemId: string, pId: string | null = null) => {
    let updatedItems: NavItem[]
    if (pId) {
      updatedItems = navItems.map(item => item.id === pId ? { ...item, subItems: item.subItems.map(si => si.id === itemId ? { ...si, visible: !si.visible } : si) } : item)
    } else {
      updatedItems = navItems.map(item => item.id === itemId ? { ...item, visible: !item.visible } : item)
    }
    await saveNavItems(updatedItems)
    setNavItems(updatedItems)
  }

  const handleMoveItem = async (itemId: string, direction: 'up' | 'down', pId: string | null = null) => {
    let updatedItems: NavItem[]
    if (pId) {
      updatedItems = navItems.map(item => {
        if (item.id === pId) {
          const subItems = [...item.subItems]
          const index = subItems.findIndex(si => si.id === itemId)
          if (direction === 'up' && index > 0) [subItems[index], subItems[index - 1]] = [subItems[index - 1], subItems[index]]
          else if (direction === 'down' && index < subItems.length - 1) [subItems[index], subItems[index + 1]] = [subItems[index + 1], subItems[index]]
          return { ...item, subItems }
        }
        return item
      })
    } else {
      updatedItems = [...navItems]
      const index = updatedItems.findIndex(item => item.id === itemId)
      if (direction === 'up' && index > 0) [updatedItems[index], updatedItems[index - 1]] = [updatedItems[index - 1], updatedItems[index]]
      else if (direction === 'down' && index < updatedItems.length - 1) [updatedItems[index], updatedItems[index + 1]] = [updatedItems[index + 1], updatedItems[index]]
    }
    await saveNavItems(updatedItems)
    setNavItems(updatedItems)
  }

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleResetDefaults = async () => {
    if (!confirm('هل تريد إعادة تعيين التنقل للإعدادات الافتراضية؟')) return
    await saveNavItems(defaultPages)
    setNavItems(defaultPages)
  }

  if (loading || !user) return null

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <div className={`fixed inset-y-0 right-0 w-64 bg-white border-l border-gray-200 z-50 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0 lg:translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-gray-100">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <span className="text-lg font-bold text-gray-900">لوحة التحكم</span>
                <span className="block text-xs text-gray-500">مرحباً {user.full_name || 'المدير'}</span>
              </div>
            </Link>
          </div>
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <Link to="/admin" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl font-medium transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
              الرئيسية
            </Link>
            <Link to="/admin/articles" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl font-medium transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              المقالات
            </Link>
            <Link to="/admin/jobs" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl font-medium transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              الوظائف
            </Link>
            <Link to="/admin/categories" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl font-medium transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
              التصنيفات
            </Link>
            <Link to="/admin/navigation" className="flex items-center gap-3 px-4 py-3 bg-emerald-50 text-emerald-700 rounded-xl font-medium">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
              إدارة التنقل
            </Link>
            <Link to="/admin/settings" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl font-medium transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426 1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              الإعدادات
            </Link>
            <div className="pt-4 mt-4 border-t border-gray-100">
              <Link to="/" className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:bg-gray-50 rounded-xl font-medium transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                عرض الموقع
              </Link>
            </div>
          </nav>
          <div className="p-4 border-t border-gray-100">
            <button className="flex items-center gap-3 px-4 py-3 w-full text-red-600 hover:bg-red-50 rounded-xl font-medium transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              تسجيل الخروج
            </button>
          </div>
        </div>
      </div>

      <div className={`transition-all duration-300 overflow-hidden ${sidebarOpen ? 'lg:mr-64' : 'mr-0'}`}>
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="px-4 md:px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                </svg>
              </button>
              <div>
                <h1 className="text-lg md:text-2xl font-bold text-gray-900">إدارة التنقل</h1>
                <p className="text-gray-500 text-sm">تخصيص صفحات وروابط شريط التنقل العلوي</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleResetDefaults} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                إعادة تعيين
              </button>
              <button onClick={() => handleAddItem(null)} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                إضافة صفحة
              </button>
            </div>
          </div>
        </header>

        <div className="p-4 md:p-6">
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-4 md:p-6 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div>
                <h3 className="font-semibold text-emerald-800">كيف يعمل التنقل؟</h3>
                <p className="text-emerald-700 text-sm mt-1">
                  يمكنك إضافة صفحات جديدة وتحكم في ظهورها في شريط التنقل العلوي. عند التمرير فوق عنصر يحتوي على صفحات فرعية، ستظهر القائمة المنسدلة. يمكنك أيضًا إضافة محتوى لكل صفحة.
                </p>
              </div>
            </div>
          </div>

          {loadingNav ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : navItems.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد عناصر تنقل</h3>
              <p className="text-gray-500 mb-6">ابدأ بإضافة صفحات للتنقل أو أعد التعيين للإعدادات الافتراضية</p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => handleAddItem(null)} className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium">
                  إضافة صفحة جديدة
                </button>
                <button onClick={handleResetDefaults} className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium">
                  إعادة تعيين افتراضي
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {navItems.map((item, index) => (
                <div key={item.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 p-4">
                    <div className="flex flex-col gap-1">
                      <button onClick={() => handleMoveItem(item.id, 'up')} disabled={index === 0} className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                      </button>
                      <button onClick={() => handleMoveItem(item.id, 'down')} disabled={index === navItems.length - 1} className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </button>
                    </div>
                    <span className="text-2xl">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 truncate">{item.title}</h3>
                        {item.pageType === 'articles' && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">مقالات</span>
                        )}
                        {item.subItems.length > 0 && (
                          <button onClick={() => toggleExpanded(item.id)} className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                            <svg className={`w-4 h-4 transition-transform ${expandedItems.has(item.id) ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                          </button>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 truncate">{item.url}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${item.visible ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {item.visible ? 'مرئي' : 'مخفي'}
                    </span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleToggleVisibility(item.id)} className={`p-2 rounded-lg transition-colors ${item.visible ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-50'}`} title={item.visible ? 'إخفاء' : 'إظهار'}>
                        {item.visible ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                        )}
                      </button>
                      <button onClick={() => handleEditItem(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="تعديل">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      <button onClick={() => handleAddItem(item.id)} className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors" title="إضافة صفحة فرعية">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                      </button>
                      <button onClick={() => handleDeleteItem(item.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="حذف">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>

                  {item.subItems.length > 0 && expandedItems.has(item.id) && (
                    <div className="border-t border-gray-100 bg-gray-50">
                      {item.subItems.map((subItem, subIndex) => (
                        <div key={subItem.id} className="flex items-center gap-3 px-4 py-3 mr-8 border-b border-gray-100 last:border-b-0">
                          <div className="flex flex-col gap-0.5">
                            <button onClick={() => handleMoveItem(subItem.id, 'up', item.id)} disabled={subIndex === 0} className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                            </button>
                            <button onClick={() => handleMoveItem(subItem.id, 'down', item.id)} disabled={subIndex === item.subItems.length - 1} className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                            </button>
                          </div>
                          <span className="text-lg">{subItem.icon}</span>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-800 text-sm truncate">{subItem.title}</h4>
                            <p className="text-xs text-gray-500 truncate">{subItem.url}</p>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${subItem.visible ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            {subItem.visible ? 'مرئي' : 'مخفي'}
                          </span>
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleToggleVisibility(subItem.id, item.id)} className={`p-1.5 rounded-lg transition-colors ${subItem.visible ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-50'}`}>
                              {subItem.visible ? (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                              ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                              )}
                            </button>
                            <button onClick={() => handleEditItem(subItem, item.id)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            </button>
                            <button onClick={() => handleDeleteItem(subItem.id, item.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-lg font-bold text-gray-900">
                {editingId ? 'تعديل الصفحة' : parentId ? 'إضافة صفحة فرعية' : 'إضافة صفحة جديدة'}
              </h2>
              <button onClick={resetForm} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">نوع الصفحة</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setFormPageType('static')}
                    className={`flex-1 p-4 rounded-xl border-2 transition-all text-center ${
                      formPageType === 'static'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">📄</div>
                    <div className="text-sm font-medium">صفحة ثابتة</div>
                    <div className="text-xs text-gray-500 mt-1">محتوى ثابت تكتبه أنت</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormPageType('articles')}
                    className={`flex-1 p-4 rounded-xl border-2 transition-all text-center ${
                      formPageType === 'articles'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">📰</div>
                    <div className="text-sm font-medium">صفحة مقالات</div>
                    <div className="text-xs text-gray-500 mt-1">تعرض المقالات المرتبطة بها</div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">عنوان الصفحة *</label>
                <input type="text" value={formTitle} onChange={e => setFormTitle(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors" placeholder="مثال: المدونة" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الرابط المختصر (Slug)</label>
                <input type="text" value={formSlug} onChange={e => setFormSlug(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors" placeholder="سيتم إنشاؤه تلقائياً إذا ترك فارغاً" />
                <p className="text-xs text-gray-500 mt-1">الرابط: /page/{formSlug || generateSlug(formTitle) || '...'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">رابط خارجي (اختياري)</label>
                <input type="text" value={formUrl} onChange={e => setFormUrl(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors" placeholder="https://example.com أو اتركه فارغاً للصفحة الداخلية" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">محتوى الصفحة (اختياري)</label>
                <div className="border border-gray-300 rounded-xl overflow-hidden">
                  <Suspense fallback={<div className="p-4 text-center text-gray-500">جاري تحميل المحرر...</div>}>
                    <RichTextEditor value={formContent} onChange={setFormContent} />
                  </Suspense>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <h4 className="font-medium text-gray-900">مرئي في التنقل</h4>
                  <p className="text-sm text-gray-500">إظهار هذه الصفحة في شريط التنقل</p>
                </div>
                <button type="button" onClick={() => setFormVisible(!formVisible)} className={`relative w-12 h-6 rounded-full transition-colors ${formVisible ? 'bg-emerald-500' : 'bg-gray-300'}`}>
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${formVisible ? 'right-0.5' : 'right-6'}`} />
                </button>
              </div>
            </div>
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center gap-3 rounded-b-2xl">
              <button onClick={resetForm} className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium">
                إلغاء
              </button>
              <button onClick={handleSubmit} disabled={saving || !formTitle.trim()} className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {saving ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>جاري الحفظ...</>
                ) : (editingId ? 'تحديث' : 'إضافة')}
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  )
}
