import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { supabase } from '../lib/supabase'

interface Job {
  id: string
  title: string
  company: string
  location: string | null
  job_type: string
  status: string
  is_featured: boolean
  views_count: number
  created_at: string
}

export default function AdminJobs() {
  const { user, loading } = useAuthStore()
  const navigate = useNavigate()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loadingJobs, setLoadingJobs] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedJobs, setSelectedJobs] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!loading && !user) navigate('/admin/login')
  }, [user, loading, navigate])

  useEffect(() => { if (user) fetchJobs() }, [user])

  const fetchJobs = async () => {
    setLoadingJobs(true)
    let query = supabase
      .from('jobs')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (filter !== 'all') {
      query = query.eq('status', filter)
    }

    const { data } = await query
    setJobs(data || [])
    setLoadingJobs(false)
  }

  useEffect(() => {
    if (user) fetchJobs()
  }, [filter])

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الوظيفة؟')) return
    await supabase.from('jobs').update({ deleted_at: new Date().toISOString() }).eq('id', id)
    fetchJobs()
  }

  const handleBulkDelete = async () => {
    if (selectedJobs.size === 0) return
    if (!confirm(`هل أنت متأكد من حذف ${selectedJobs.size} وظيفة(s)؟`)) return
    
    const ids = Array.from(selectedJobs)
    await supabase.from('jobs').update({ deleted_at: new Date().toISOString() }).in('id', ids)
    setSelectedJobs(new Set())
    fetchJobs()
  }

  const toggleSelectJob = (id: string) => {
    const newSelected = new Set(selectedJobs)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedJobs(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectedJobs.size === filteredJobs.length) {
      setSelectedJobs(new Set())
    } else {
      setSelectedJobs(new Set(filteredJobs.map(j => j.id)))
    }
  }

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
    await supabase.from('jobs').update({ status: newStatus }).eq('id', id)
    fetchJobs()
  }

  const handleToggleFeatured = async (id: string, currentFeatured: boolean) => {
    await supabase.from('jobs').update({ is_featured: !currentFeatured }).eq('id', id)
    fetchJobs()
  }

  const getJobTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'full_time': 'دوام كامل',
      'part_time': 'دوام جزئي',
      'contract': 'عقد',
      'freelance': 'عمل حر',
      'internship': 'تدريب'
    }
    return types[type] || type
  }

  const filteredJobs = jobs.filter(job => {
    return job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const activeCount = jobs.filter(j => j.status === 'active').length
  const inactiveCount = jobs.filter(j => j.status === 'inactive').length

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
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  إدارة الوظائف
                </h1>
                <p className="text-emerald-100 text-sm mt-0.5">إدارة وتنظيم جميع الوظائف المتاحة</p>
              </div>
            </div>
            <Link to="/admin/jobs/new" className="flex items-center gap-2 px-5 py-2.5 bg-white text-emerald-700 rounded-xl hover:bg-emerald-50 font-semibold shadow-sm hover:shadow-md transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              وظيفة جديدة
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{jobs.length}</p>
                <p className="text-sm text-gray-500">إجمالي الوظائف</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-600">{activeCount}</p>
                <p className="text-sm text-gray-500">نشطة</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-600">{inactiveCount}</p>
                <p className="text-sm text-gray-500">غير نشطة</p>
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
                placeholder="بحث في الوظائف..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-10 pl-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-gray-50 focus:bg-white transition-colors"
              />
            </div>
            <div className="flex gap-2">
              {[
                { value: 'all', label: 'الكل', count: jobs.length },
                { value: 'active', label: 'نشطة', count: activeCount },
                { value: 'inactive', label: 'غير نشطة', count: inactiveCount },
              ].map(f => (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value as any)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    filter === f.value
                      ? f.value === 'active' ? 'bg-emerald-600 text-white shadow-sm'
                        : f.value === 'inactive' ? 'bg-gray-600 text-white shadow-sm'
                        : 'bg-gray-800 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {f.label} ({f.count})
                </button>
              ))}
            </div>
          </div>
          
          {/* Bulk Actions */}
          {selectedJobs.size > 0 && (
            <div className="mt-4 p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
              <span className="text-sm text-emerald-700 font-medium">
                تم تحديد {selectedJobs.size} وظيفة(s)
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

        {loadingJobs ? (
          <div className="text-center py-16">
            <div className="inline-block w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 mt-4 text-lg">جاري تحميل الوظائف...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            </div>
            <p className="text-gray-600 text-lg mb-2">
              {searchQuery || filter !== 'all' ? 'لا توجد نتائج مطابقة' : 'لا توجد وظائف بعد'}
            </p>
            <p className="text-gray-400 text-sm mb-6">
              {searchQuery || filter !== 'all' ? 'جرب تغيير معايير البحث' : 'ابدأ بإضافة أول وظيفة'}
            </p>
            {!searchQuery && filter === 'all' && (
              <Link to="/admin/jobs/new" className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-medium shadow-sm hover:shadow-md transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                أضف أول وظيفة
              </Link>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50/80 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <div className="col-span-1">
                <input
                  type="checkbox"
                  checked={selectedJobs.size === filteredJobs.length && filteredJobs.length > 0}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 text-emerald-600 bg-white border-gray-300 rounded focus:ring-emerald-500 cursor-pointer"
                />
              </div>
              <div className="col-span-2">الوظيفة</div>
              <div className="col-span-2">الشركة</div>
              <div className="col-span-1">الموقع</div>
              <div className="col-span-1">النوع</div>
              <div className="col-span-1">الحالة</div>
              <div className="col-span-1">المميز</div>
              <div className="col-span-1">المشاهدات</div>
              <div className="col-span-2 text-center">إجراءات</div>
            </div>

            <div className="divide-y divide-gray-100">
              {filteredJobs.map((job) => (
                <div key={job.id} className={`grid grid-cols-1 lg:grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50/50 transition-colors items-center group ${selectedJobs.has(job.id) ? 'bg-emerald-50/50' : ''}`}>
                  {/* Checkbox */}
                  <div className="col-span-1 hidden lg:block">
                    <input
                      type="checkbox"
                      checked={selectedJobs.has(job.id)}
                      onChange={() => toggleSelectJob(job.id)}
                      className="w-4 h-4 text-emerald-600 bg-white border-gray-300 rounded focus:ring-emerald-500 cursor-pointer"
                    />
                  </div>
                  <div className="col-span-2">
                    <h3 className="font-semibold text-gray-900 truncate group-hover:text-emerald-700 transition-colors">{job.title}</h3>
                    <p className="text-xs text-gray-400 lg:hidden mt-1">{job.company}</p>
                  </div>
                  <div className="col-span-2 hidden lg:block">
                    <span className="text-sm text-gray-600">{job.company}</span>
                  </div>
                  <div className="col-span-1 hidden lg:block">
                    <span className="text-sm text-gray-500">{job.location || '—'}</span>
                  </div>
                  <div className="col-span-1 hidden lg:block">
                    <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-full">
                      {getJobTypeLabel(job.job_type)}
                    </span>
                  </div>
                  <div className="col-span-1 hidden lg:block">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full ${
                      job.status === 'active' ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' : 'bg-gray-100 text-gray-600 ring-1 ring-gray-200'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${job.status === 'active' ? 'bg-emerald-500' : 'bg-gray-400'}`}></span>
                      {job.status === 'active' ? 'نشطة' : 'غير نشطة'}
                    </span>
                  </div>
                  <div className="col-span-1 hidden lg:block">
                    <button
                      onClick={() => handleToggleFeatured(job.id, job.is_featured)}
                      className={`px-2 py-1 text-xs font-medium rounded-full transition-colors ${job.is_featured ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                    >
                      {job.is_featured ? '⭐ مميز' : 'عادي'}
                    </button>
                  </div>
                  <div className="col-span-1 hidden lg:block">
                    <span className="text-sm text-gray-500">{job.views_count}</span>
                  </div>
                  <div className="col-span-2 flex items-center justify-center gap-2">
                    <Link to={`/admin/jobs/${job.id}/edit`} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      تعديل
                    </Link>
                    <button onClick={() => handleToggleStatus(job.id, job.status)} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${job.status === 'active' ? 'text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100' : 'text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100'}`}>
                      {job.status === 'active' ? 'إيقاف' : 'تفعيل'}
                    </button>
                    <button onClick={() => handleDelete(job.id)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
                      حذف
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="px-6 py-3 bg-gray-50/50 border-t border-gray-100 text-sm text-gray-500">
              عرض {filteredJobs.length} من {jobs.length} وظيفة
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
