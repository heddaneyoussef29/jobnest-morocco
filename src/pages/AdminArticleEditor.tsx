import { useEffect, useState, useRef, lazy, Suspense } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { supabase } from '../lib/supabase'
import { markdownToHtml } from '../lib/content'
import { convertToWebP, formatFileSize, getCompressionRatio } from '../lib/imageOptimize'
import TagInput from '../components/TagInput'

const RichTextEditor = lazy(() => import('../components/RichTextEditor'))

interface Category { id: string; name: string; slug: string }

function extractTitleFromContent(html: string): string {
  const h1 = html.match(/<h1[^>]*>(.*?)<\/h1>/i)
  if (h1) return h1[1].replace(/<[^>]*>/g, '').trim()
  const h2 = html.match(/<h[23][^>]*>(.*?)<\/h[23]>/i)
  if (h2) return h2[1].replace(/<[^>]*>/g, '').trim()
  const p = html.match(/<p[^>]*>(.*?)<\/p>/i)
  if (p) return p[1].replace(/<[^>]*>/g, '').trim().substring(0, 100)
  return ''
}

function generateExcerptFromContent(html: string): string {
  const ps = html.match(/<p[^>]*>(.*?)<\/p>/gi) || []
  const text = ps.slice(0, 3).map(p => p.replace(/<[^>]*>/g, '').trim()).filter(Boolean).join(' ')
  const ex = text.substring(0, 160)
  return ex + (ex.length >= 160 ? '...' : '')
}

function processArticleContent(html: string): string {
  if (!html) return ''
  let p = html
  p = p.replace(/<p[^>]*>\s*💡\s*(.*?)<\/p>/gs, '<div class="highlight-box"><p>💡 $1</p></div>')
  p = p.replace(/<p[^>]*>\s*⚠️\s*(.*?)<\/p>/gs, '<div class="warning-box"><p>⚠️ $1</p></div>')
  p = p.replace(/<p[^>]*>\s*✅\s*(.*?)<\/p>/gs, '<div class="success-box"><p>✅ $1</p></div>')
  p = p.replace(/<img(?![^>]*loading=)([^>]*)>/g, '<img loading="lazy"$1>')
  return p
}

export default function AdminArticleEditor() {
  const { user, loading } = useAuthStore()
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditing = Boolean(id)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [coverImage, setCoverImage] = useState<string | null>(null)
  const [coverImageAlt, setCoverImageAlt] = useState('')
  const [status, setStatus] = useState<'draft' | 'published'>('draft')
  const [metaTitle, setMetaTitle] = useState('')
  const [metaDescription, setMetaDescription] = useState('')
  const [searchKeywords, setSearchKeywords] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [activeSection, setActiveSection] = useState<'content' | 'seo'>('content')
  const [previewMode, setPreviewMode] = useState(false)
  const [aiTopic, setAiTopic] = useState('')
  const [generating, setGenerating] = useState(false)
  const [aiError, setAiError] = useState('')

  useEffect(() => { fetchCategories(); if (isEditing && id) fetchArticle(id) }, [id])

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('name')
    setCategories(data || [])
  }

  const fetchArticle = async (articleId: string) => {
    const { data } = await supabase.from('articles').select('*').eq('id', articleId).single()
    if (data) {
      setTitle(data.title); setSlug(data.slug); setExcerpt(data.excerpt || '')
      setContent(data.content); setCategoryId(data.category_id || '')
      setCoverImage(data.cover_image_url || null); setCoverImageAlt(data.cover_image_alt || '')
      setStatus(data.status); setMetaTitle(data.meta_title || ''); setMetaDescription(data.meta_description || '')
      setSearchKeywords(data.search_keywords || '')
    }
  }

  const generateSlug = (text: string) => {
    // First try to create a slug from ASCII characters only
    let slug = text.toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
    
    // If slug is empty (all Arabic text), generate from timestamp
    if (!slug || slug.length < 2) {
      slug = `article-${Date.now()}`
    }
    
    return slug
  }

  const handleTitleChange = (value: string) => { setTitle(value); if (!isEditing) setSlug(generateSlug(value)) }

  const handleContentChange = (newContent: string) => {
    setContent(newContent)
    if (!title && newContent.length > 10) {
      const t = extractTitleFromContent(newContent)
      if (t) { setTitle(t); if (!isEditing) setSlug(generateSlug(t)) }
    }
    if (!excerpt && newContent.length > 50) {
      const ex = generateExcerptFromContent(newContent)
      if (ex) { setExcerpt(ex); if (!metaDescription) setMetaDescription(ex.length > 160 ? ex.substring(0, 157) + '...' : ex) }
    }
    if (!metaTitle && title) setMetaTitle(title.length > 60 ? title.substring(0, 57) + '...' : title)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    if (!file.type.startsWith('image/')) { setError('يرجى اختيار ملف صورة فقط'); return }
    if (file.size > 5 * 1024 * 1024) { setError('حجم الصورة يجب أن يكون أقل من 5 ميجابايت'); return }
    setUploading(true); setError('')
    try {
      const webpFile = await convertToWebP(file, 80)
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.webp`
      const filePath = `articles/${fileName}`
      const { error: uploadError } = await supabase.storage.from('articles').upload(filePath, webpFile)
      if (uploadError) throw uploadError
      const { data: urlData } = supabase.storage.from('articles').getPublicUrl(filePath)
      setCoverImage(urlData.publicUrl)
    } catch (err: any) { setError('خطأ في رفع الصورة: ' + err.message) }
    finally { setUploading(false) }
  }

  const removeImage = () => { setCoverImage(null); setCoverImageAlt(''); if (fileInputRef.current) fileInputRef.current.value = '' }

  const calculateReadingTime = (text: string): number => Math.ceil(text.replace(/<[^>]*>/g, '').split(/\s+/).length / 200)

  const handleSave = async (publishStatus: 'draft' | 'published') => {
    if (!title.trim() || !content.trim()) { setError('يرجى ملء العنوان والمحتوى'); return }
    setSaving(true); setError('')

    // Generate unique slug
    let finalSlug = slug || generateSlug(title)
    let slugAttempt = finalSlug
    let slugCounter = 1
    while (true) {
      const { data: existing } = await supabase
        .from('articles')
        .select('id')
        .eq('slug', slugAttempt)
        .maybeSingle()
      if (!existing || (isEditing && existing.id === id)) break
      slugAttempt = `${finalSlug}-${slugCounter}`
      slugCounter++
    }

    const articleData = {
      title: title.trim(), slug: slugAttempt, excerpt: excerpt.trim() || null,
      content: content.trim(), content_html: content.trim(),
      cover_image_url: coverImage, cover_image_alt: coverImageAlt.trim() || null,
      category_id: categoryId || null, status: publishStatus,
      published_at: publishStatus === 'published' ? new Date().toISOString() : null,
      meta_title: metaTitle.trim() || null, meta_description: metaDescription.trim() || null,
      search_keywords: searchKeywords.trim() || null,
      reading_time: calculateReadingTime(content), author_id: user?.id || null, updated_at: new Date().toISOString()
    }
    try {
      if (isEditing && id) { const { error: ue } = await supabase.from('articles').update(articleData).eq('id', id); if (ue) throw ue }
      else { const { error: ie } = await supabase.from('articles').insert(articleData); if (ie) throw ie }
      navigate('/admin/articles')
    } catch (err: any) { setError(err.message || 'خطأ في الحفظ') }
    finally { setSaving(false) }
  }

  const handleGenerateAI = async () => {
    if (!aiTopic.trim()) { setAiError('يرجى إدخال فكرة المقال'); return }
    setGenerating(true); setAiError('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('يجب تسجيل الدخول أولاً')
      const models = ['google/gemma-4-31b-it:free', 'nvidia/nemotron-3-super-120b-a12b:free']
      const aiPrompt = `You are a professional Arabic content writer. Write a professional article about: ${aiTopic.trim()}\n\nReturn ONLY this JSON format:\n{"title": "Article title in Arabic", "excerpt": "Short summary in Arabic (120-160 chars)", "content": "Full article in Markdown with ## headings, **bold**, - lists"}`
      const { data: fnData, error: fnError } = await supabase.functions.invoke('generate-article', { body: { prompt: aiPrompt, models } })
      if (fnError) throw new Error(fnError.message || 'فشل في الاتصال بخدمة الذكاء الاصطناعي')
      const rawText = fnData?.choices?.[0]?.message?.content
      if (!rawText) throw new Error('لم يتم توليد محتوى')
      let text = rawText.trim().replace(/<think>[\s\S]*?<\/think>/g, '').replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim()
      let parsed; try { parsed = JSON.parse(text) } catch { const m = text.match(/\{[\s\S]*\}/); parsed = m ? JSON.parse(m[0]) : null }
      if (!parsed || !parsed.title || !parsed.content) throw new Error('فشل في تحليل المحتوى')
      setTitle(parsed.title); if (!isEditing) setSlug(generateSlug(parsed.title))
      setExcerpt(parsed.excerpt || ''); setContent(parsed.content); setAiTopic('')
    } catch (err: any) { setAiError(err.message || 'خطأ في التوليد') }
    finally { setGenerating(false) }
  }

  if (loading) return <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50/30 flex items-center justify-center" dir="rtl"><div className="text-center"><div className="inline-block w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div><p className="text-gray-600">جاري التحميل...</p></div></div>
  if (!user) return <Navigate to="/admin/login" replace />

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50/30" dir="rtl">
      <header className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Link to="/admin/articles" className="flex items-center gap-1 text-emerald-100 hover:text-white bg-white/10 px-2 py-1.5 rounded-lg text-sm"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>المقالات</Link>
              <div><h1 className="text-lg sm:text-xl font-bold flex items-center gap-2"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isEditing ? "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" : "M12 4v16m8-8H4"} /></svg>{isEditing ? 'تعديل المقال' : 'إضافة مقال جديد'}</h1></div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <button onClick={() => setPreviewMode(!previewMode)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${previewMode ? 'bg-white text-emerald-700' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                {previewMode ? 'العودة للتعديل' : 'معاينة مباشرة'}
              </button>
              <button onClick={() => handleSave('draft')} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-xl hover:bg-white/20 text-sm font-medium disabled:opacity-50">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                حفظ مسودة
              </button>
              <button onClick={() => handleSave('published')} disabled={saving} className="flex items-center gap-2 px-5 py-2 bg-white text-emerald-700 rounded-xl hover:bg-emerald-50 text-sm font-semibold shadow-sm disabled:opacity-50">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {isEditing ? 'تحديث ونشر' : 'نشر المقال'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 flex items-center gap-3"><p className="text-red-700 font-medium">{error}</p><button onClick={() => setError('')} className="mr-auto text-red-400 hover:text-red-600">✕</button></div>}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {previewMode ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-4 flex items-center justify-between">
                  <span className="font-bold flex items-center gap-2"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>معاينة مباشرة</span>
                  <span className="text-emerald-200 text-sm">{content.replace(/<[^>]*>/g,'').split(/\s+/).filter(Boolean).length} كلمة</span>
                </div>
                <div className="p-6 sm:p-10">
                  {title && <h1 className="text-3xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>{title}</h1>}
                  {excerpt && <div className="bg-emerald-50 border-r-4 border-emerald-600 p-4 mb-6 rounded-r-xl"><p className="text-gray-700 leading-relaxed">{excerpt}</p></div>}
                  <div className="article-styled" style={{ overflowWrap: 'break-word' }} dangerouslySetInnerHTML={{ __html: content || '<p style="color: #9ca3af; font-style: italic;">ابدأ كتابة المقال هنا لرؤية النتيجة...</p>' }} />
                </div>
              </div>
            ) : (
              <>
                {!previewMode && <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
                  <button onClick={() => setActiveSection('content')} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${activeSection === 'content' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}>📝 المحتوى</button>
                  <button onClick={() => setActiveSection('seo')} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${activeSection === 'seo' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}>🔍 SEO</button>
                </div>}

                {activeSection === 'content' ? (
                  <div className="space-y-6">
                    {false && !isEditing && <div className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-2xl p-6 border border-violet-200 shadow-sm">
                      <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">⚡ توليد المقال بالذكاء الاصطناعي</h3>
                      <div className="flex gap-3">
                        <input type="text" value={aiTopic} onChange={(e) => { setAiTopic(e.target.value); setAiError('') }} className="flex-1 px-4 py-3 border border-violet-200 rounded-xl bg-white outline-none text-sm" placeholder="مثال: طريقة التقديم على وظائف المكتب الشريف..." disabled={generating} onKeyDown={(e) => e.key === 'Enter' && !generating && handleGenerateAI()} />
                        <button onClick={handleGenerateAI} disabled={generating || !aiTopic.trim()} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl font-medium text-sm disabled:opacity-50 whitespace-nowrap">
                          {generating ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>جاري...</> : '⚡ توليد'}
                        </button>
                      </div>
                      {aiError && <p className="mt-3 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{aiError}</p>}
                    </div>}

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">عنوان المقال <span className="text-red-500">*</span></label>
                      <input type="text" value={title} onChange={(e) => handleTitleChange(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-lg font-medium outline-none bg-gray-50 focus:bg-white" placeholder="أدخل عنوان المقال هنا..." />
                      <p className="text-xs text-gray-400 mt-2">الرابط: /{slug || 'article-slug'}</p>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">الرابط المختصر (Slug)</label>
                      <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none bg-gray-50 focus:bg-white font-mono text-sm" placeholder="article-slug" dir="ltr" />
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">ملخص المقال</label>
                      <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={3} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 resize-none outline-none bg-gray-50 focus:bg-white" placeholder="ملخص قصير للمقال..." />
                      <p className="text-xs text-gray-400 mt-2">مثالي: 120-160 حرف</p>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">محتوى المقال <span className="text-red-500">*</span></label>
                      <Suspense fallback={<div className="min-h-[400px] flex items-center justify-center bg-gray-50 rounded-xl border border-gray-200"><p className="text-gray-500 text-sm">جاري تحميل المحرر...</p></div>}>
                        <RichTextEditor content={content} onChange={handleContentChange} placeholder="ابدأ كتابة المقال هنا..." />
                      </Suspense>
                      <p className="text-xs text-gray-400 mt-2">وقت القراءة: {calculateReadingTime(content)} دقيقة | {content.replace(/<[^>]*>/g,'').split(/\s+/).filter(Boolean).length} كلمة</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">عنوان SEO المخصص</label>
                      <input type="text" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none bg-gray-50 focus:bg-white" placeholder={title || 'عنوان مخصص لمحركات البحث'} />
                      <p className={`text-xs mt-2 ${(metaTitle || title).length > 60 ? 'text-red-500' : 'text-emerald-600'}`}>{(metaTitle || title).length}/60</p>
                      <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <p className="text-xs text-gray-500 mb-1">معاينة في Google:</p>
                        <p className="text-blue-700 text-lg font-medium">{metaTitle || title || 'عنوان المقال'}</p>
                        <p className="text-green-700 text-sm">yoursite.com/{slug || 'article-slug'}</p>
                        <p className="text-gray-600 text-sm mt-1 line-clamp-2">{metaDescription || excerpt || 'وصف المقال...'}</p>
                      </div>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">وصف SEO المخصص</label>
                      <textarea value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} rows={4} className="w-full px-4 py-3 border border-gray-200 rounded-xl resize-none outline-none bg-gray-50 focus:bg-white" placeholder="وصف مخصص لمحركات البحث..." />
                      <p className={`text-xs mt-2 ${metaDescription.length > 160 ? 'text-red-500' : 'text-emerald-600'}`}>{metaDescription.length}/160</p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                      <TagInput
                        value={searchKeywords}
                        onChange={setSearchKeywords}
                        label="🔍 كلمات مفتاحية للبحث"
                        placeholder="اكتب كلمة مفتاحية واضغط Enter"
                        hint="اضغط Enter لإضافة كل كلمة. هذه الكلمات تساعد في العثور على المقال من محرك البحث."
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">🖼️ صورة الغلاف</h3>
              {coverImage ? (
                <div className="space-y-3">
                  <img src={coverImage} alt="صورة الغلاف" className="w-full h-48 object-cover rounded-xl" />
                  <div className="flex gap-2">
                    <button onClick={() => fileInputRef.current?.click()} className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">تغيير</button>
                    <button onClick={removeImage} className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600">حذف</button>
                  </div>
                  <input type="text" value={coverImageAlt} onChange={(e) => setCoverImageAlt(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="وصف الصورة (alt text)" />
                </div>
              ) : (
                <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-emerald-400 hover:bg-emerald-50/50 transition-all cursor-pointer">
                  {uploading ? <p className="text-emerald-600 text-sm">جاري رفع الصورة...</p> : <><p className="text-gray-600 font-medium text-sm">اضغط لاختيار صورة الغلاف</p><p className="text-gray-400 text-xs mt-1">PNG, JPG, WebP — حد أقصى 5MB</p></>}
                </div>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">🏷️ التصنيف</h3>
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none bg-gray-50 focus:bg-white">
                <option value="">اختر التصنيف</option>
                {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">📊 معلومات المقال</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">الحالة:</span><span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{status === 'published' ? 'منشور' : 'مسودة'}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">وقت القراءة:</span><span className="font-medium">{calculateReadingTime(content)} دقيقة</span></div>
                <div className="flex justify-between"><span className="text-gray-500">الكلمات:</span><span className="font-medium">{content.replace(/<[^>]*>/g,'').split(/\s+/).filter(Boolean).length}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
