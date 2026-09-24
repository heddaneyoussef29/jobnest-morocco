import { useEffect, useState, lazy, Suspense } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { supabase } from '../lib/supabase'
import TagInput from '../components/TagInput'

const RichTextEditor = lazy(() => import('../components/RichTextEditor'))

export default function AdminJobEditor() {
  const { user, loading } = useAuthStore()
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditing = Boolean(id)

  const [title, setTitle] = useState('')
  const [company, setCompany] = useState('')
  const [location, setLocation] = useState('')
  const [jobType, setJobType] = useState('full_time')
  const [description, setDescription] = useState('')
  const [requirements, setRequirements] = useState('')
  const [salaryMin, setSalaryMin] = useState('')
  const [salaryMax, setSalaryMax] = useState('')
  const [salaryCurrency, setSalaryCurrency] = useState('EGP')
  const [applicationUrl, setApplicationUrl] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [searchKeywords, setSearchKeywords] = useState('')
  const [status, setStatus] = useState<'active' | 'inactive'>('active')
  const [isFeatured, setIsFeatured] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [activeSection, setActiveSection] = useState<'basic' | 'details'>('basic')

  useEffect(() => {
    if (!loading && !user) navigate('/admin/login')
  }, [user, loading, navigate])

  useEffect(() => {
    if (isEditing && id) fetchJob(id)
  }, [id])

  const fetchJob = async (jobId: string) => {
    const { data } = await supabase.from('jobs').select('*').eq('id', jobId).single()
    if (data) {
      setTitle(data.title)
      setCompany(data.company)
      setLocation(data.location || '')
      setJobType(data.job_type)
      setDescription(data.description || '')
      setRequirements(data.requirements || '')
      setSalaryMin(data.salary_min?.toString() || '')
      setSalaryMax(data.salary_max?.toString() || '')
      setSalaryCurrency(data.salary_currency || 'EGP')
      setApplicationUrl(data.application_url || '')
      setContactEmail(data.contact_email || '')
      setSearchKeywords(data.search_keywords || '')
      setStatus(data.status)
      setIsFeatured(data.is_featured)
    }
  }

  const handleSave = async (statusOverride?: 'active' | 'inactive') => {
    if (!title.trim() || !company.trim()) {
      setError('يرجى ملء عنوان الوظيفة واسم الشركة')
      return
    }

    setSaving(true)
    setError('')

    const jobData = {
      title: title.trim(),
      company: company.trim(),
      location: location.trim() || null,
      job_type: jobType,
      description: description.trim() || null,
      requirements: requirements.trim() || null,
      salary_min: salaryMin ? parseInt(salaryMin) : null,
      salary_max: salaryMax ? parseInt(salaryMax) : null,
      salary_currency: salaryCurrency,
      application_url: applicationUrl.trim() || null,
      contact_email: contactEmail.trim() || null,
      search_keywords: searchKeywords.trim() || null,
      status: statusOverride || status,
      is_featured: isFeatured,
      updated_at: new Date().toISOString()
    }

    try {
      if (isEditing && id) {
        const { error: updateError } = await supabase.from('jobs').update(jobData).eq('id', id)
        if (updateError) throw updateError
      } else {
        const { error: insertError } = await supabase.from('jobs').insert(jobData)
        if (insertError) throw insertError
      }
      navigate('/admin/jobs')
    } catch (err: any) {
      setError(err.message || 'خطأ في الحفظ')
    } finally {
      setSaving(false)
    }
  }

  if (loading || !user) return null

  const getJobTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'full_time': 'دوام كامل', 'part_time': 'دوام جزئي', 'contract': 'عقد', 'freelance': 'عمل حر', 'internship': 'تدريب'
    }
    return types[type] || type
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-emerald-50/30" dir="rtl">
      {/* Header */}
      <header className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 text-white shadow-lg shadow-emerald-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/admin/jobs" className="flex items-center gap-2 text-emerald-100 hover:text-white transition-colors bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                الوظائف
              </Link>
              <div>
                <h1 className="text-xl font-bold flex items-center gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isEditing ? "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" : "M12 4v16m8-8H4"} /></svg>
                  {isEditing ? 'تعديل الوظيفة' : 'إضافة وظيفة جديدة'}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => handleSave()} disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all text-sm font-medium disabled:opacity-50">
                {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>}
                حفظ
              </button>
              <button onClick={async () => { setStatus('active'); await handleSave('active'); }} disabled={saving}
                className="flex items-center gap-2 px-5 py-2 bg-white text-emerald-700 rounded-xl hover:bg-emerald-50 transition-all text-sm font-semibold shadow-sm disabled:opacity-50">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                نشر
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        {/* Section Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6">
          <button onClick={() => setActiveSection('basic')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${activeSection === 'basic' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            المعلومات الأساسية
          </button>
          <button onClick={() => setActiveSection('details')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${activeSection === 'details' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            التفاصيل والمزايا
          </button>
        </div>

        {activeSection === 'basic' ? (
          <div className="space-y-6">
            {/* Title */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <label className="block text-sm font-semibold text-gray-700 mb-2">عنوان الوظيفة <span className="text-red-500">*</span></label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-lg font-medium outline-none transition-all bg-gray-50 focus:bg-white"
                placeholder="مثال: مطور ويب فلترنت" />
            </div>

            {/* Company */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <label className="block text-sm font-semibold text-gray-700 mb-2">اسم الشركة <span className="text-red-500">*</span></label>
              <input type="text" value={company} onChange={(e) => setCompany(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-gray-50 focus:bg-white"
                placeholder="اسم الشركة" />
            </div>

            {/* Location & Job Type */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <label className="block text-sm font-semibold text-gray-700 mb-2">الموقع</label>
                <input type="text" value={location} onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-gray-50 focus:bg-white"
                  placeholder="مثال: القاهرة، مصر" />
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <label className="block text-sm font-semibold text-gray-700 mb-2">نوع الوظيفة</label>
                <select value={jobType} onChange={(e) => setJobType(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-gray-50 focus:bg-white transition-all">
                  <option value="full_time">دوام كامل</option>
                  <option value="part_time">دوام جزئي</option>
                  <option value="contract">عقد</option>
                  <option value="freelance">عمل حر</option>
                  <option value="internship">تدريب</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <label className="block text-sm font-semibold text-gray-700 mb-2">وصف الوظيفة</label>
              <Suspense fallback={<div className="min-h-[200px] flex items-center justify-center bg-gray-50 rounded-xl border border-gray-200"><p className="text-gray-500 text-sm">جاري تحميل المحرر...</p></div>}>
                <RichTextEditor
                  content={description}
                  onChange={setDescription}
                  placeholder="اكتب وصف تفصيلي للوظيفة..."
                />
              </Suspense>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Requirements */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <label className="block text-sm font-semibold text-gray-700 mb-2">المتطلبات والمؤهلات</label>
              <textarea value={requirements} onChange={(e) => setRequirements(e.target.value)} rows={5}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-y outline-none transition-all bg-gray-50 focus:bg-white"
                placeholder="اذكر المتطلبات والمؤهلات المطلوبة..." />
            </div>

            {/* Salary */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <label className="block text-sm font-semibold text-gray-700 mb-3">الرواتب</label>
              <div className="grid grid-cols-3 gap-4">
                <input type="number" value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-gray-50 focus:bg-white"
                  placeholder="الحد الأدنى" />
                <input type="number" value={salaryMax} onChange={(e) => setSalaryMax(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-gray-50 focus:bg-white"
                  placeholder="الحد الأقصى" />
                <select value={salaryCurrency} onChange={(e) => setSalaryCurrency(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-gray-50 focus:bg-white">
                  <option value="EGP">جنيه مصري</option>
                  <option value="SAR">ريال سعودي</option>
                  <option value="AED">درهم إماراتي</option>
                  <option value="USD">دولار أمريكي</option>
                </select>
              </div>
            </div>

            {/* Contact */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <label className="block text-sm font-semibold text-gray-700 mb-2">رابط التقديم</label>
                <input type="url" value={applicationUrl} onChange={(e) => setApplicationUrl(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-gray-50 focus:bg-white font-mono text-sm"
                  placeholder="https://..." dir="ltr" />
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <label className="block text-sm font-semibold text-gray-700 mb-2">بريد التواصل</label>
                <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-gray-50 focus:bg-white"
                  placeholder="hr@company.com" />
              </div>
            </div>

            {/* Search Keywords */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <TagInput
                value={searchKeywords}
                onChange={setSearchKeywords}
                label="🔍 كلمات مفتاحية للبحث"
                placeholder="اكتب كلمة مفتاحية واضغط Enter"
                hint="اضغط Enter لإضافة كل كلمة. هذه الكلمات تساعد في العثور على الوظيفة من محرك البحث."
              />
            </div>

            {/* Status & Featured */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${status === 'active' ? 'bg-emerald-500' : 'bg-gray-300'}`}
                    onClick={() => setStatus(status === 'active' ? 'inactive' : 'active')}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${status === 'active' ? 'right-1' : 'right-7'}`}></div>
                  </div>
                  <span className="font-medium text-gray-700">الوظيفة نشطة</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">مميزة:</span>
                  <button onClick={() => setIsFeatured(!isFeatured)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${isFeatured ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                    {isFeatured ? '⭐ مميزة' : 'إضافة كمميزة'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
