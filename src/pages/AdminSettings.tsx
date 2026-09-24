import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { supabase } from '../lib/supabase'

interface Settings {
  site_name: string
  site_description: string
  site_logo_url: string
  contact_email: string
  contact_phone: string
  social_facebook: string
  social_twitter: string
  social_instagram: string
  social_linkedin: string
  seo_title: string
  seo_description: string
  seo_keywords: string
  maintenance_mode: boolean
  allow_registration: boolean
  require_email_verification: boolean
  articles_per_page: number
  jobs_per_page: number
  enable_comments: boolean
  enable_notifications: boolean
  openrouter_api_key: string
}

export default function AdminSettings() {
  const { user, loading } = useAuthStore()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [settings, setSettings] = useState<Settings>({
    site_name: 'موقع مقالات العمل',
    site_description: 'موقع متخصص في مقالات العمل والوظائف',
    site_logo_url: '',
    contact_email: '',
    contact_phone: '',
    social_facebook: '',
    social_twitter: '',
    social_instagram: '',
    social_linkedin: '',
    seo_title: '',
    seo_description: '',
    seo_keywords: '',
    maintenance_mode: false,
    allow_registration: true,
    require_email_verification: false,
    articles_per_page: 12,
    jobs_per_page: 10,
    enable_comments: true,
    enable_notifications: true,
    openrouter_api_key: ''
  })
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [activeTab, setActiveTab] = useState<'general' | 'seo' | 'social' | 'security' | 'api'>('general')
  const [showApiKey, setShowApiKey] = useState(false)
  const [apiKeyChanged, setApiKeyChanged] = useState(false)

  useEffect(() => {
    if (!loading && !user) navigate('/admin/login')
  }, [user, loading, navigate])

  useEffect(() => {
    if (user) fetchSettings()
  }, [user])

  const fetchSettings = async () => {
    const { data } = await supabase.from('settings').select('key, value')
    if (data) {
      const settingsMap: Record<string, string> = {}
      data.forEach((item: any) => {
        settingsMap[item.key] = item.value
      })
      setSettings(prev => ({
        ...prev,
        ...settingsMap,
        maintenance_mode: settingsMap.maintenance_mode === 'true',
        allow_registration: settingsMap.allow_registration !== 'false',
        require_email_verification: settingsMap.require_email_verification === 'true',
        enable_comments: settingsMap.enable_comments !== 'false',
        enable_notifications: settingsMap.enable_notifications !== 'false',
        articles_per_page: parseInt(settingsMap.articles_per_page || '12'),
        jobs_per_page: parseInt(settingsMap.jobs_per_page || '10'),
        openrouter_api_key: settingsMap.openrouter_api_key || ''
      }))
      setApiKeyChanged(false) // Reset after loading
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setSuccess(false)

    try {
      const settingsData = Object.entries(settings)
        .filter(([key, value]) => {
          // For API keys, only save if user actually changed it
          if (key.includes('api_key')) {
            return apiKeyChanged && value && value !== ''
          }
          return true
        })
        .map(([key, value]) => ({
        key,
        value: typeof value === 'boolean' ? value.toString() : String(value),
        updated_at: new Date().toISOString()
      }))

      for (const item of settingsData) {
        const { error } = await supabase
          .from('settings')
          .upsert({ key: item.key, value: item.value, updated_at: item.updated_at }, { onConflict: 'key' })
        if (error) throw error
      }

      setSuccess(true)
      setApiKeyChanged(false) // Reset after successful save
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      console.error('Error saving settings:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    if (confirm('هل أنت متأكد من إعادة تعيين جميع الإعدادات؟')) {
      fetchSettings()
    }
  }

  if (loading || !user) return null

  const tabs = [
    { id: 'general', label: 'عام', icon: '⚙️' },
    { id: 'seo', label: 'SEO', icon: '🔍' },
    { id: 'social', label: 'التواصل الاجتماعي', icon: '📱' },
    { id: 'security', label: 'الأمان', icon: '🔒' },
    { id: 'api', label: 'مفاتيح API', icon: '🔑' },
  ]

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 right-0 w-64 bg-white border-l border-gray-200 z-50 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
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
                <span className="block text-xs text-gray-500">الإعدادات</span>
              </div>
            </Link>
          </div>

          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <Link to="/admin" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl font-medium transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              الرئيسية
            </Link>
            <Link to="/admin/articles" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl font-medium transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              المقالات
            </Link>
            <Link to="/admin/jobs" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl font-medium transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              الوظائف
            </Link>
            <Link to="/admin/categories" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl font-medium transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              التصنيفات
            </Link>
            <Link to="/admin/settings" className="flex items-center gap-3 px-4 py-3 bg-emerald-50 text-emerald-700 rounded-xl font-medium">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              الإعدادات
            </Link>
          </nav>

          <div className="p-4 border-t border-gray-100">
            <button onClick={async () => { await useAuthStore.getState().signOut(); navigate('/admin/login'); }} className="flex items-center gap-3 px-4 py-3 w-full text-red-600 hover:bg-red-50 rounded-xl font-medium transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              تسجيل الخروج
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 overflow-hidden ${sidebarOpen ? 'mr-64' : 'mr-0'}`}>
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                </svg>
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">الإعدادات العامة</h1>
                <p className="text-gray-500 mt-1 text-sm hidden sm:block">إدارة إعدادات الموقع والصلاحيات</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              {success && (
                <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                  ✓ تم الحفظ بنجاح
                </span>
              )}
              <button onClick={handleReset} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                إعادة تعيين
              </button>
              <button onClick={handleSave} disabled={saving} className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium disabled:opacity-50">
                {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
              </button>
            </div>
          </div>
        </header>

        <div className="p-6">
          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-gray-200 pb-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">معلومات الموقع</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">اسم الموقع</label>
                    <input type="text" value={settings.site_name} onChange={(e) => setSettings({...settings, site_name: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">شعار الموقع (رابط)</label>
                    <input type="url" value={settings.site_logo_url} onChange={(e) => setSettings({...settings, site_logo_url: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" dir="ltr" placeholder="https://..." />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">وصف الموقع</label>
                    <textarea value={settings.site_description} onChange={(e) => setSettings({...settings, site_description: e.target.value})} rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">معلومات التواصل</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">البريد الإلكتروني للتواصل</label>
                    <input type="email" value={settings.contact_email} onChange={(e) => setSettings({...settings, contact_email: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" dir="ltr" placeholder="email@example.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">رقم الهاتف</label>
                    <input type="tel" value={settings.contact_phone} onChange={(e) => setSettings({...settings, contact_phone: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" dir="ltr" placeholder="+20..." />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">إعدادات العرض</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">مقالات في كل صفحة</label>
                    <input type="number" value={settings.articles_per_page} onChange={(e) => setSettings({...settings, articles_per_page: parseInt(e.target.value) || 12})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" min="1" max="50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">وظائف في كل صفحة</label>
                    <input type="number" value={settings.jobs_per_page} onChange={(e) => setSettings({...settings, jobs_per_page: parseInt(e.target.value) || 10})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" min="1" max="50" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SEO Settings */}
          {activeTab === 'seo' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">تحسين محركات البحث (SEO)</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">عنوان SEO الافتراضي</label>
                    <input type="text" value={settings.seo_title} onChange={(e) => setSettings({...settings, seo_title: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="عنوان الصفحة الرئيسي" />
                    <p className="text-xs text-gray-500 mt-1">يُستخدم في عنوان الصفحة عند عدم تحديد عنوان مخصص</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">وصف SEO الافتراضي</label>
                    <textarea value={settings.seo_description} onChange={(e) => setSettings({...settings, seo_description: e.target.value})} rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                      placeholder="وصف الصفحة الرئيسي لمحركات البحث" />
                    <p className="text-xs text-gray-500 mt-1">يُستخدم في وصف الصفحة عند عدم تحديد وصف مخصص (150-160 حرف مثالي)</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">الكلمات المفتاحية</label>
                    <input type="text" value={settings.seo_keywords} onChange={(e) => setSettings({...settings, seo_keywords: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="وظائف, عمل, توظيف, مقالات مهنية" />
                    <p className="text-xs text-gray-500 mt-1">افصل بين الكلمات بفاصلة</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Social Settings */}
          {activeTab === 'social' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">حسابات التواصل الاجتماعي</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">فيسبوك</label>
                    <input type="url" value={settings.social_facebook} onChange={(e) => setSettings({...settings, social_facebook: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" dir="ltr" placeholder="https://facebook.com/..." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">تويتر</label>
                    <input type="url" value={settings.social_twitter} onChange={(e) => setSettings({...settings, social_twitter: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" dir="ltr" placeholder="https://twitter.com/..." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">انستجرام</label>
                    <input type="url" value={settings.social_instagram} onChange={(e) => setSettings({...settings, social_instagram: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" dir="ltr" placeholder="https://instagram.com/..." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">لينكد إن</label>
                    <input type="url" value={settings.social_linkedin} onChange={(e) => setSettings({...settings, social_linkedin: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" dir="ltr" placeholder="https://linkedin.com/..." />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">إعدادات الأمان</h3>
                <div className="space-y-4">
                  <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                    <div>
                      <p className="font-medium text-gray-900">وضع الصيانة</p>
                      <p className="text-sm text-gray-500">عند التفعيل، يظهر صفحة صيانة للمستخدمين العاديين</p>
                    </div>
                    <div className="relative">
                      <input type="checkbox" checked={settings.maintenance_mode} onChange={(e) => setSettings({...settings, maintenance_mode: e.target.checked})}
                        className="sr-only" />
                      <div className={`w-14 h-8 rounded-full transition-colors ${settings.maintenance_mode ? 'bg-emerald-600' : 'bg-gray-300'}`}>
                        <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform mt-1 ${settings.maintenance_mode ? 'translate-x-7' : 'translate-x-1'}`}></div>
                      </div>
                    </div>
                  </label>

                  <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                    <div>
                      <p className="font-medium text-gray-900">السماح بالتسجيل</p>
                      <p className="text-sm text-gray-500">السماح للمستخدمين الجدد بإنشاء حساب</p>
                    </div>
                    <div className="relative">
                      <input type="checkbox" checked={settings.allow_registration} onChange={(e) => setSettings({...settings, allow_registration: e.target.checked})}
                        className="sr-only" />
                      <div className={`w-14 h-8 rounded-full transition-colors ${settings.allow_registration ? 'bg-emerald-600' : 'bg-gray-300'}`}>
                        <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform mt-1 ${settings.allow_registration ? 'translate-x-7' : 'translate-x-1'}`}></div>
                      </div>
                    </div>
                  </label>

                  <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                    <div>
                      <p className="font-medium text-gray-900">تأكيد البريد الإلكتروني</p>
                      <p className="text-sm text-gray-500">المستخدمون يُطلب منهم تأكيد بريدهم الإلكتروني</p>
                    </div>
                    <div className="relative">
                      <input type="checkbox" checked={settings.require_email_verification} onChange={(e) => setSettings({...settings, require_email_verification: e.target.checked})}
                        className="sr-only" />
                      <div className={`w-14 h-8 rounded-full transition-colors ${settings.require_email_verification ? 'bg-emerald-600' : 'bg-gray-300'}`}>
                        <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform mt-1 ${settings.require_email_verification ? 'translate-x-7' : 'translate-x-1'}`}></div>
                      </div>
                    </div>
                  </label>

                  <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                    <div>
                      <p className="font-medium text-gray-900">تفعيل التعليقات</p>
                      <p className="text-sm text-gray-500">السماح للمستخدمين بالتعليق على المقالات</p>
                    </div>
                    <div className="relative">
                      <input type="checkbox" checked={settings.enable_comments} onChange={(e) => setSettings({...settings, enable_comments: e.target.checked})}
                        className="sr-only" />
                      <div className={`w-14 h-8 rounded-full transition-colors ${settings.enable_comments ? 'bg-emerald-600' : 'bg-gray-300'}`}>
                        <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform mt-1 ${settings.enable_comments ? 'translate-x-7' : 'translate-x-1'}`}></div>
                      </div>
                    </div>
                  </label>

                  <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                    <div>
                      <p className="font-medium text-gray-900">تفعيل الإشعارات</p>
                      <p className="text-sm text-gray-500">إرسال إشعارات للمستخدمين عند تحديث المحتوى</p>
                    </div>
                    <div className="relative">
                      <input type="checkbox" checked={settings.enable_notifications} onChange={(e) => setSettings({...settings, enable_notifications: e.target.checked})}
                        className="sr-only" />
                      <div className={`w-14 h-8 rounded-full transition-colors ${settings.enable_notifications ? 'bg-emerald-600' : 'bg-gray-300'}`}>
                        <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform mt-1 ${settings.enable_notifications ? 'translate-x-7' : 'translate-x-1'}`}></div>
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* API Keys Settings */}
          {activeTab === 'api' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                  مفاتيح API
                </h3>
                <p className="text-sm text-gray-500 mb-6">إدارة مفاتيح الـ API للخدمات الخارجية. المفاتيح محفوظة بشكل آمن في قاعدة البيانات ولا تظهر في الكود المصدري.</p>

                {/* Gemini API Key */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">Google Gemini API</h4>
                      <p className="text-xs text-gray-500">يُستخدم لتوليد المقالات بالذكاء الاصطناعي</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">مفتاح OpenRouter API</label>
                      <div className="relative">
                        <input
                          type={showApiKey ? 'text' : 'password'}
                          value={settings.openrouter_api_key}
                          onChange={(e) => {
                            setSettings({...settings, openrouter_api_key: e.target.value})
                            setApiKeyChanged(true)
                          }}
                          className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm bg-white"
                          placeholder="sk-or-v1-..."
                          dir="ltr"
                        />
                        <button
                          type="button"
                          onClick={() => setShowApiKey(!showApiKey)}
                          className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showApiKey ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                      <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <div className="text-xs text-blue-700">
                        <p className="font-medium mb-1">كيف تحصل على المفتاح؟</p>
                        <ol className="list-decimal list-inside space-y-1">
                          <li>اذهب إلى <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener" className="underline hover:text-blue-900">Google AI Studio</a></li>
                          <li>أنشئ حساباً مجانياً على OpenRouter.ai</li>
                          <li>احصل على مفتاح API مجاني (sk-or-v1-...)</li>
                          <li>انسخ المفتاح والصقه هنا</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}