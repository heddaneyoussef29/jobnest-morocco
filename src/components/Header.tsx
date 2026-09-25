import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

interface NavItem {
  id: string
  title: string
  slug: string
  url: string
  visible: boolean
  order: number
  icon: string
  subItems: NavItem[]
  pageType?: 'static' | 'articles'
}

const defaultNavItems: NavItem[] = [
  { id: 'home', title: 'الرئيسية', slug: '', url: '/', visible: true, order: 0, icon: '🏠', subItems: [], pageType: 'static' },
  { id: 'jobs', title: 'الوظائف', slug: 'jobs', url: '/jobs', visible: true, order: 1, icon: '💼', subItems: [
    { id: 'jobs-all', title: 'جميع الوظائف', slug: 'jobs', url: '/jobs', visible: true, order: 0, icon: '📋', subItems: [], pageType: 'static' },
    { id: 'jobs-tips', title: 'نصائح المقابلات', slug: 'interview-tips', url: '/interview-tips', visible: true, order: 1, icon: '💡', subItems: [], pageType: 'static' }
  ], pageType: 'static'},
  { id: 'articles', title: 'المقالات', slug: 'articles', url: '/articles', visible: true, order: 2, icon: '📰', subItems: [], pageType: 'static' },
  { id: 'about', title: 'حولنا', slug: 'about', url: '/about', visible: true, order: 3, icon: 'ℹ️', subItems: [], pageType: 'static' },
  { id: 'contact', title: 'اتصل بنا', slug: 'contact', url: '/contact', visible: true, order: 4, icon: '📞', subItems: [], pageType: 'static' }
]

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [navItems, setNavItems] = useState<NavItem[]>(defaultNavItems)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [mobileExpanded, setMobileExpanded] = useState<Set<string>>(new Set())
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    fetchNavItems()
    // الاستماع لأحداث تحديث التنقل
    const handleNavUpdate = () => fetchNavItems()
    window.addEventListener('nav-updated', handleNavUpdate)
    return () => window.removeEventListener('nav-updated', handleNavUpdate)
  }, [])

  useEffect(() => {
    setIsMenuOpen(false)
    setMobileExpanded(new Set())
  }, [location])

  const fetchNavItems = async () => {
    const { data } = await supabase.from('settings').select('value').eq('key', 'nav_pages').single()
    if (data?.value) {
      try {
        const parsed = typeof data.value === 'string' ? JSON.parse(data.value) : data.value
        const visibleItems = parsed.filter((item: NavItem) => item.visible)
        if (visibleItems.length > 0) setNavItems(visibleItems)
      } catch {
        // Use default items
      }
    }
  }

  const handleDropdownEnter = (id: string) => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current)
      dropdownTimeoutRef.current = null
    }
    setActiveDropdown(id)
  }

  const handleDropdownLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null)
    }, 150)
  }

  const toggleMobileExpanded = (id: string) => {
    setMobileExpanded(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const isActive = (url: string) => {
    if (url === '/') return location.pathname === '/'
    return location.pathname.startsWith(url)
  }

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
            {navItems.map(item => (
              <div
                key={item.id}
                className="relative"
                onMouseEnter={() => item.subItems.length > 0 && handleDropdownEnter(item.id)}
                onMouseLeave={() => item.subItems.length > 0 && handleDropdownLeave()}
              >
                <Link
                  to={item.url}
                  className={`px-4 py-2 transition-colors font-medium rounded-lg text-sm flex items-center gap-1.5 ${
                    isActive(item.url) 
                      ? 'text-emerald-600 bg-emerald-50' 
                      : 'text-gray-700 hover:text-emerald-600 hover:bg-emerald-50'
                  }`}
                >
                  {item.title}
                  {item.subItems.length > 0 && (
                    <svg 
                      className={`w-3.5 h-3.5 transition-transform ${activeDropdown === item.id ? 'rotate-180' : ''}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </Link>

                {/* Dropdown */}
                {item.subItems.length > 0 && activeDropdown === item.id && (
                  <div className="absolute top-full right-0 mt-1 w-64 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    {item.subItems.filter(sub => sub.visible).map(sub => (
                      <Link
                        key={sub.id}
                        to={sub.url}
                        className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                      >
                        <span className="font-medium text-sm">{sub.title}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-3">
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
              {navItems.map(item => (
                <div key={item.id}>
                  {item.subItems.length > 0 ? (
                    <>
                      <button
                        onClick={() => toggleMobileExpanded(item.id)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors font-medium ${
                          isActive(item.url) ? 'text-emerald-600 bg-emerald-50' : 'text-gray-700 hover:text-emerald-600 hover:bg-emerald-50'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          
                          {item.title}
                        </span>
                        <svg 
                          className={`w-4 h-4 transition-transform ${mobileExpanded.has(item.id) ? 'rotate-180' : ''}`}
                          fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {mobileExpanded.has(item.id) && (
                        <div className="mr-6 border-r-2 border-emerald-200 mr-4">
                          {item.subItems.filter(sub => sub.visible).map(sub => (
                            <Link
                              key={sub.id}
                              to={sub.url}
                              onClick={() => setIsMenuOpen(false)}
                              className={`flex items-center gap-3 px-4 py-2.5 text-sm rounded-xl transition-colors ${
                                isActive(sub.url) ? 'text-emerald-600 bg-emerald-50' : 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50'
                              }`}
                            >
                              
                              {sub.title}
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      to={item.url}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-colors font-medium ${
                        isActive(item.url) ? 'text-emerald-600 bg-emerald-50' : 'text-gray-700 hover:text-emerald-600 hover:bg-emerald-50'
                      }`}
                    >
                      
                      {item.title}
                    </Link>
                  )}
                </div>
              ))}
              <Link to="/admin/login" onClick={() => setIsMenuOpen(false)} className="px-4 py-3 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors font-medium flex items-center gap-2 mt-2 border-t border-gray-100 pt-4">
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
