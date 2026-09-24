import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className={`bg-white sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'shadow-md shadow-gray-200/50' : 'shadow-sm'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <span className="text-xl font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">JobNest</span>
              <span className="block text-[10px] text-gray-500 -mt-1 font-medium">خطوتك القادمة تبدأ هنا</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Link to="/" className="px-4 py-2 text-gray-700 hover:text-emerald-600 transition-colors font-medium rounded-lg hover:bg-emerald-50 text-sm">
              الرئيسية
            </Link>
            <Link to="/jobs" className="px-4 py-2 text-gray-600 hover:text-emerald-600 transition-colors font-medium rounded-lg hover:bg-emerald-50 text-sm">
              الوظائف
            </Link>
            <Link to="/articles" className="px-4 py-2 text-gray-600 hover:text-emerald-600 transition-colors font-medium rounded-lg hover:bg-emerald-50 text-sm">
              المقالات
            </Link>
            <Link to="/about" className="px-4 py-2 text-gray-600 hover:text-emerald-600 transition-colors font-medium rounded-lg hover:bg-emerald-50 text-sm">
              حولنا
            </Link>
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* Admin Login */}
            <Link 
              to="/admin/login" 
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 transition-colors font-medium rounded-lg text-sm shadow-sm hover:shadow-md"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              تسجيل الدخول
            </Link>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-100 mt-2 pt-4">
            <nav className="flex flex-col gap-1">
              <Link to="/" onClick={() => setIsMenuOpen(false)} className="px-4 py-3 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors font-medium">الرئيسية</Link>
              <Link to="/jobs" onClick={() => setIsMenuOpen(false)} className="px-4 py-3 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors font-medium">الوظائف</Link>
              <Link to="/articles" onClick={() => setIsMenuOpen(false)} className="px-4 py-3 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors font-medium">المقالات</Link>
              <Link to="/about" onClick={() => setIsMenuOpen(false)} className="px-4 py-3 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors font-medium">حولنا</Link>
              <Link to="/admin/login" onClick={() => setIsMenuOpen(false)} className="px-4 py-3 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors font-medium flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                تسجيل الدخول
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
