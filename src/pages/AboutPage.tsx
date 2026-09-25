import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 right-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 left-10 w-96 h-96 bg-emerald-300 rounded-full blur-3xl"></div>
          </div>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center relative z-10">
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">من نحن</h1>
            <p className="text-emerald-100 text-lg max-w-2xl mx-auto leading-relaxed">
              منصة عربية متخصصة في تقديم محتوى عالي الجودة حول العمل والمسار المهني
            </p>
          </div>
        </section>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Mission */}
          <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-sm border border-gray-100 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">رسالتنا</h2>
            </div>
            <p className="text-gray-700 leading-relaxed text-lg">
              موقع مقالات العمل هو منصة عربية متخصصة في تقديم محتوى عالي الجودة حول العمل والمسار المهني. نسعى لتزويد القراء بالنصائح العملية والمعلومات الموثوقة التي تساعدهم على النجاح في حياتهم المهنية.
            </p>
          </div>

          {/* Goals */}
          <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-sm border border-gray-100 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">أهدافنا</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                'تقديم نصائح مهنية واقعية ومجربة',
                'مساعدة القراء على تطوير مهاراتهم',
                'توفير معلومات دقيقة عن سوق الشغل',
                'بناء مجتمع مهني عربي نشط',
                'تعزيز ثقافة التعلم المستمر'
              ].map((goal, i) => (
                <div key={i} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <span className="text-gray-700">{goal}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-sm border border-gray-100 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">المحتوى الذي نقدمه</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { icon: '🎯', text: 'نصائح للنجاح في المسار المهني' },
                { icon: '📈', text: 'استراتيجيات تطوير الذات' },
                { icon: '📊', text: 'تحليلات سوق العمل' },
                { icon: '🤝', text: 'إرشادات المقابلات الوظيفية' },
                { icon: '📝', text: 'كتابة السيرة الذاتية الاحترافية' }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-gray-700">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Contact CTA */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl p-8 lg:p-12 border border-emerald-100 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">تواصل معنا</h2>
            <p className="text-gray-600 mb-6 max-w-lg mx-auto">
              نسعد دائماً باستقبال استفساراتكم واقتراحاتكم. يمكنكم التواصل معنا عبر صفحة اتصل بنا.
            </p>
            <Link to="/contact" className="inline-flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-medium shadow-sm hover:shadow-md transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              اتصل بنا
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
