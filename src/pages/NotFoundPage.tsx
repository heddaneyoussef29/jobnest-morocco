import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="flex items-center justify-center min-h-[60vh]">
        <div className="max-w-lg mx-auto px-4 text-center">
          {/* Animated 404 */}
          <div className="relative mb-8">
            <h1 className="text-[10rem] font-black text-transparent bg-clip-text bg-gradient-to-br from-emerald-400 to-emerald-600 leading-none select-none">
              404
            </h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-24 h-24 text-emerald-500 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          {/* Message */}
          <h2 className="text-3xl font-bold text-gray-900 mb-4">الصفحة غير موجودة</h2>
          <p className="text-gray-600 text-lg mb-8 leading-relaxed">
            عذراً، يبدو أن الصفحة التي تبحث عنها قد تم نقلها أو حذفها أو أنها غير موجودة.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-2xl hover:from-emerald-700 hover:to-emerald-800 transition-all font-bold text-lg shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              العودة للرئيسية
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-700 border-2 border-gray-200 rounded-2xl hover:border-emerald-500 hover:text-emerald-600 transition-all font-bold text-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              تواصل معنا
            </Link>
          </div>

          {/* Helpful Links */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-gray-500 text-sm mb-4">أو جرّب زيارة:</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/" className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-emerald-50 hover:text-emerald-600 transition-colors text-sm font-medium">
                الرئيسية
              </Link>
              <Link to="/about" className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-emerald-50 hover:text-emerald-600 transition-colors text-sm font-medium">
                من نحن
              </Link>
              <Link to="/contact" className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-emerald-50 hover:text-emerald-600 transition-colors text-sm font-medium">
                اتصل بنا
              </Link>
              <Link to="/privacy" className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-emerald-50 hover:text-emerald-600 transition-colors text-sm font-medium">
                سياسة الخصوصية
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
