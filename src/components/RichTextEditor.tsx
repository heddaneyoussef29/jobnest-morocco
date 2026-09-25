import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { useEffect, useCallback, useRef, useState } from 'react'
import { convertToWebP, formatFileSize, getCompressionRatio } from '../lib/imageOptimize'

interface RichTextEditorProps {
  content: string
  onChange: (html: string) => void
  placeholder?: string
}

// Sanitize video embed code - only allow trusted sources
function sanitizeVideoEmbed(code: string): string | null {
  if (!code || !code.trim()) return null

  // If the code is already a full iframe/embed, try to extract the src
  const iframeSrcMatch = code.match(/<iframe[^>]+src=["']([^"']+)["']/i)
  if (iframeSrcMatch) {
    const src = iframeSrcMatch[1]
    try {
      const url = new URL(src)
      const trustedDomains = [
        'youtube.com', 'youtu.be', 'www.youtube.com',
        'tiktok.com', 'vm.tiktok.com', 'www.tiktok.com',
        'instagram.com', 'www.instagram.com',
        'facebook.com', 'www.facebook.com', 'web.facebook.com',
        'twitter.com', 'x.com', 'www.twitter.com',
        'vimeo.com', 'player.vimeo.com',
        'dailymotion.com', 'www.dailymotion.com',
      ]
      const isTrusted = trustedDomains.some(d => url.hostname === d || url.hostname.endsWith('.' + d))
      if (isTrusted) {
        return `<div class="video-embed"><iframe src="${url.toString()}" frameborder="0" allowfullscreen allow="encrypted-media; accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" style="width:100%;aspect-ratio:16/9;border-radius:12px;"></iframe></div>`
      }
    } catch {}
  }

  // Try to extract YouTube video ID from various formats
  let src = ''
  
  // YouTube patterns
  const ytMatch = code.match(/(?:youtube\.com\/embed\/|youtu\.be\/|youtube\.com\/watch\?v=)([\w-]{11})/)
  if (ytMatch) {
    src = `https://www.youtube.com/embed/${ytMatch[1]}`
  }
  
  // TikTok pattern
  const ttMatch = code.match(/(?:tiktok\.com\/@[\w.]+\/video\/(\d+)|vm\.tiktok\.com\/[\w]+)/)
  if (ttMatch && ttMatch[1]) {
    return `<div class="video-embed" data-platform="tiktok"><iframe src="https://www.tiktok.com/embed/v2/${ttMatch[1]}" frameborder="0" allowfullscreen allow="encrypted-media" style="width:100%;max-width:500px;aspect-ratio:9/16;border-radius:12px;"></iframe></div>`
  }
  
  // Instagram pattern
  const igMatch = code.match(/instagram\.com\/(?:p|reel)\/([\w-]+)/)
  if (igMatch) {
    return `<div class="video-embed" data-platform="instagram"><iframe src="https://www.instagram.com/p/${igMatch[1]}/embed/" frameborder="0" allowfullscreen allow="encrypted-media" style="width:100%;max-width:500px;aspect-ratio:1/1;border-radius:12px;"></iframe></div>`
  }
  
  if (!src) {
    // Try to extract any URL
    if (code.match(/^https?:\/\//)) {
      src = code.trim()
    }
  }
  
  if (!src) return null
  
  // Validate the URL is from a trusted source
  const trustedDomains = [
    'youtube.com', 'youtu.be', 'www.youtube.com',
    'tiktok.com', 'vm.tiktok.com', 'www.tiktok.com',
    'instagram.com', 'www.instagram.com',
    'facebook.com', 'www.facebook.com', 'web.facebook.com',
    'twitter.com', 'x.com', 'www.twitter.com',
    'vimeo.com', 'player.vimeo.com',
    'dailymotion.com', 'www.dailymotion.com',
  ]
  
  try {
    const url = new URL(src)
    const isTrusted = trustedDomains.some(d => url.hostname === d || url.hostname.endsWith('.' + d))
    if (!isTrusted) return null
    
    // Force HTTPS
    if (url.protocol === 'http:') url.protocol = 'https:'
    
    return `<div class="video-embed"><iframe src="${url.toString()}" frameborder="0" allowfullscreen allow="encrypted-media; accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" style="width:100%;aspect-ratio:16/9;border-radius:12px;"></iframe></div>`
  } catch {
    return null
  }
}

function ToolbarButton({
  onClick,
  active = false,
  disabled = false,
  children,
  title,
}: {
  onClick: () => void
  active?: boolean
  disabled?: boolean
  children: React.ReactNode
  title: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-2 rounded-lg text-sm font-medium transition-all ${
        active
          ? 'bg-emerald-100 text-emerald-700 shadow-sm'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      } ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      {children}
    </button>
  )
}

function ToolbarDivider() {
  return <div className="w-px h-6 bg-gray-200 mx-1" />
}

export default function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [videoUrl, setVideoUrl] = useState('')

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] },
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        directions: ['rtl', 'ltr'],
      }),
      TextStyle,
      Color,
      Image.configure({
        inline: false,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
      }),
      Placeholder.configure({
        placeholder: placeholder || 'ابدأ كتابة المقال هنا...',
      }),
    ],
    content: content || '',
    editorProps: {
      attributes: {
        dir: 'rtl',
        class: 'prose-editor min-h-[400px] focus:outline-none px-6 py-4',
      },
      handleDrop: (view, event) => {
        const files = event.dataTransfer?.files
        if (!files || files.length === 0) return false
        const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'))
        if (imageFiles.length === 0) return false
        event.preventDefault()
        imageFiles.forEach((file) => {
          insertImageFromFile(file)
        })
        return true
      },
      handlePaste: (view, event) => {
        // Check if pasting HTML with video embed
        const html = event.clipboardData?.getData('text/html')
        if (html && html.includes('video-embed')) {
          event.preventDefault()
          editor?.commands.insertHTML(html)
          return true
        }
        
        const items = event.clipboardData?.items
        if (!items) return false
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.startsWith('image/')) {
            event.preventDefault()
            const file = items[i].getAsFile()
            if (file) {
              insertImageFromFile(file)
            }
            return true
          }
        }
        return false
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  // Insert image from file (convert to WebP and base64)
  const insertImageFromFile = useCallback(async (file: File) => {
    if (!editor) return
    if (!file.type.startsWith('image/')) {
      alert('يرجى اختيار ملف صورة فقط')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('حجم الصورة يجب أن يكون أقل من 10 ميجابايت')
      return
    }
    try {
      // Convert to WebP for better compression
      const originalSize = file.size
      const webpFile = await convertToWebP(file, 80)
      const compressedSize = webpFile.size
      console.log(`Image compressed: ${formatFileSize(originalSize)} → ${formatFileSize(compressedSize)} (${getCompressionRatio(originalSize, compressedSize)}% smaller)`)
      const reader = new FileReader()
      reader.onload = () => {
        const base64 = reader.result as string
        editor.chain().focus().setImage({ src: base64, alt: file.name }).run()
      }
      reader.readAsDataURL(webpFile)
    } catch (error) {
      // Fallback to original file if conversion fails
      const reader = new FileReader()
      reader.onload = () => {
        const base64 = reader.result as string
        editor.chain().focus().setImage({ src: base64, alt: file.name }).run()
      }
      reader.readAsDataURL(file)
    }
  }, [editor])

  // Sync external content changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || '')
    }
  }, [content])

  // Add image from URL
  const addImageFromUrl = useCallback(() => {
    const url = window.prompt('رابط الصورة:')
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }, [editor])

  // Trigger file input
  const triggerFileUpload = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  // Handle file input change
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      insertImageFromFile(file)
    }
    e.target.value = ''
  }, [insertImageFromFile])

  const setLink = useCallback(() => {
    if (!editor) return
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('رابط الرابط:', previousUrl)

    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }, [editor])

  if (!editor) return null

  return (
    <div className="border border-gray-300 rounded-xl overflow-hidden bg-white" dir="rtl">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 p-2 bg-gray-50 border-b border-gray-200">
        {/* Text formatting */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          title="عريض"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" />
          </svg>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          title="مائل"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 4h4m-2 0l-4 16m-2 0h4m2-16l4 16" />
          </svg>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive('underline')}
          title="تحته خط"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v7a5 5 0 0010 0V4M5 21h14" />
          </svg>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive('strike')}
          title="يتوسطه خط"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 12H7m10-6H7m6 12H7" />
          </svg>
        </ToolbarButton>

        <ToolbarDivider />

        {/* Headings */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive('heading', { level: 1 })}
          title="عنوان رئيسي"
        >
          H1
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })}
          title="عنوان فرعي"
        >
          H2
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive('heading', { level: 3 })}
          title="عنوان ثانوي"
        >
          H3
        </ToolbarButton>

        <ToolbarDivider />

        {/* Lists */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          title="قائمة نقطية"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          title="قائمة مرقمة"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 6h13M7 12h13M7 18h13M3 6h.01M3 12h.01M3 18h.01" />
          </svg>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')}
          title="اقتباس"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z" />
          </svg>
        </ToolbarButton>

        <ToolbarDivider />

        {/* Alignment */}
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          active={editor.isActive({ textAlign: 'right' })}
          title="محاذاة يمين"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6h18M3 12h12M3 18h16" />
          </svg>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          active={editor.isActive({ textAlign: 'center' })}
          title="توسيط"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6h18M6 12h12M3 18h18" />
          </svg>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          active={editor.isActive({ textAlign: 'left' })}
          title="محاذاة يسار"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6h18M9 12h12M3 18h16" />
          </svg>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          active={editor.isActive({ textAlign: 'justify' })}
          title="justify"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </ToolbarButton>

        <ToolbarDivider />

        {/* Media & Links */}
        <ToolbarButton onClick={setLink} active={editor.isActive('link')} title="رابط">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        </ToolbarButton>
        
        {/* Image from URL */}
        <ToolbarButton onClick={addImageFromUrl} title="إضافة صورة من رابط URL">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        </ToolbarButton>

        {/* Upload image from device */}
        <ToolbarButton onClick={triggerFileUpload} title="رفع صورة من الجهاز">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="فاصل أفقي"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </ToolbarButton>

        <ToolbarDivider />

        {/* Code */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive('code')}
          title="كود"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          active={editor.isActive('codeBlock')}
          title="بلوك كود"
        >
          <span className="text-xs font-mono">{'{ }'}</span>
        </ToolbarButton>

        {/* Video Embed */}
        <ToolbarButton
          onClick={() => setShowVideoModal(true)}
          title="إضافة فيديو (YouTube, TikTok, Instagram)"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </ToolbarButton>

        <ToolbarDivider />

        {/* Undo/Redo */}
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="تراجع"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="إعادة"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10H11a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" />
          </svg>
        </ToolbarButton>

        {/* Clear */}
        <ToolbarButton
          onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
          title="مسح التنسيق"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </ToolbarButton>
      </div>

      {/* Drag & Drop hint */}
      <div className="px-4 py-1.5 bg-emerald-50/50 border-b border-emerald-100 flex items-center gap-2 text-xs text-emerald-600">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span>يمكنك سحب الصور وإفلاتها هنا، أو لصقها من الحافظة (Ctrl+V)</span>
      </div>

      {/* Editor Content */}
      <style>{`
        .ProseMirror {
          min-height: 400px;
          outline: none;
          font-family: 'Cairo', 'IBM Plex Sans Arabic', system-ui, sans-serif;
          font-size: 1.1rem;
          line-height: 1.9;
          direction: rtl;
          text-align: right;
          padding: 1.5rem;
        }
        .ProseMirror p {
          margin-bottom: 1.2rem;
          color: #374151;
        }
        .ProseMirror h1 {
          font-size: 2rem;
          font-weight: 700;
          margin-top: 2rem;
          margin-bottom: 1rem;
          color: #111827;
        }
        .ProseMirror h2 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-top: 1.8rem;
          margin-bottom: 0.8rem;
          color: #1f2937;
        }
        .ProseMirror h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-top: 1.5rem;
          margin-bottom: 0.6rem;
          color: #374151;
        }
        .ProseMirror ul, .ProseMirror ol {
          padding-right: 1.5rem;
          margin-bottom: 1rem;
        }
        .ProseMirror li {
          margin-bottom: 0.4rem;
        }
        .ProseMirror blockquote {
          border-right: 4px solid #10b981;
          padding-right: 1rem;
          margin: 1.5rem 0;
          color: #6b7280;
          font-style: italic;
          background: #f0fdf4;
          padding: 1rem;
          border-radius: 0 8px 8px 0;
        }
        .ProseMirror pre {
          background: #1f2937;
          color: #e5e7eb;
          padding: 1rem;
          border-radius: 8px;
          overflow-x: auto;
          direction: ltr;
          text-align: left;
          font-family: 'Fira Code', monospace;
          margin: 1rem 0;
        }
        .ProseMirror code {
          background: #f3f4f6;
          padding: 0.2rem 0.4rem;
          border-radius: 4px;
          font-size: 0.9em;
          font-family: 'Fira Code', monospace;
          direction: ltr;
        }
        .ProseMirror pre code {
          background: none;
          padding: 0;
        }
        .ProseMirror img {
          max-width: 100%;
          height: auto;
          border-radius: 12px;
          margin: 1.5rem auto;
          display: block;
          cursor: pointer;
        }
        .ProseMirror img:hover {
          box-shadow: 0 4px 20px rgba(16, 185, 129, 0.3);
        }
        .ProseMirror hr {
          border: none;
          border-top: 2px solid #e5e7eb;
          margin: 2rem 0;
        }
        .ProseMirror a {
          color: #059669;
          text-decoration: underline;
        }
        .ProseMirror table {
          border-collapse: collapse;
          width: 100%;
          margin: 1.5rem 0;
          direction: rtl;
        }
        .ProseMirror th, .ProseMirror td {
          border: 1px solid #d1d5db;
          padding: 0.75rem;
          text-align: right;
        }
        .ProseMirror th {
          background: #f9fafb;
          font-weight: 600;
        }
        .ProseMirror p.is-editor-empty:first-child::before {
          color: #9ca3af;
          content: attr(data-placeholder);
          float: right;
          height: 0;
          pointer-events: none;
        }
      `}</style>
      <EditorContent editor={editor} />

      {/* Video Embed Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowVideoModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                إضافة فيديو
              </h3>
              <button onClick={() => setShowVideoModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">كود الإضافة (Embed Code) أو رابط الفيديو</label>
                <textarea
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-sm font-mono"
                  placeholder="الصق كود الإضافة هنا...&#10;&#10;مثال:&#10;• رابط YouTube: https://youtube.com/watch?v=XXXXX&#10;• كود iframe من YouTube&#10;• كود iframe من TikTok&#10;• كود iframe من Instagram"
                  dir="ltr"
                />
              </div>
              
              <div className="bg-blue-50 rounded-xl p-4">
                <h4 className="text-sm font-bold text-blue-800 mb-2">منصات مدعومة:</h4>
                <div className="flex flex-wrap gap-2 text-xs text-blue-700">
                  <span className="bg-blue-100 px-2 py-1 rounded">YouTube</span>
                  <span className="bg-blue-100 px-2 py-1 rounded">TikTok</span>
                  <span className="bg-blue-100 px-2 py-1 rounded">Instagram</span>
                  <span className="bg-blue-100 px-2 py-1 rounded">Facebook</span>
                  <span className="bg-blue-100 px-2 py-1 rounded">Twitter/X</span>
                  <span className="bg-blue-100 px-2 py-1 rounded">Vimeo</span>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    console.log('Video URL:', videoUrl)
                    const sanitized = sanitizeVideoEmbed(videoUrl)
                    console.log('Sanitized:', sanitized)
                    if (sanitized && editor) {
                      console.log('Editor exists, inserting content...')
                      // Use insertContent with proper HTML handling
                      const result = editor.chain().focus().insertContent(sanitized).run()
                      console.log('Insert result:', result)
                      setVideoUrl('')
                      setShowVideoModal(false)
                    } else {
                      console.log('No sanitized content or no editor')
                      alert('الرابط غير صالح أو غير مدعوم. يرجى استخدام رابط من منصة مدعومة.')
                    }
                  }}
                  disabled={!videoUrl.trim()}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  إضافة الفيديو
                </button>
                <button
                  onClick={() => { setVideoUrl(''); setShowVideoModal(false) }}
                  className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium transition-all"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
