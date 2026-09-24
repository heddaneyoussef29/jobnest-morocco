import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'

const skills = [
  {
    id: 1,
    category: 'مهارات تقنية',
    items: [
      {
        title: 'البرمجة وتطوير الويب',
        description: 'تعلم لغات البرمجة الحديثة مثل Python, JavaScript, React وتطوير مهاراتك في بناء تطبيقات الويب المتطورة.',
        level: 'مبتدئ - متقدم',
        duration: '3-12 شهر'
      },
      {
        title: 'تحليل البيانات',
        description: 'إتقان أدوات تحليل البيانات مثل Excel, SQL, Power BI لاتخاذ قرارات مبنية على بيانات حقيقية.',
        level: 'متوسط',
        duration: '2-6 أشهر'
      },
      {
        title: 'التصميم الجرافيكي',
        description: 'تعلم استخدام Adobe Photoshop, Illustrator, Figma لإنشاء تصاميم احترافية.',
        level: 'مبتدئ - متوسط',
        duration: '2-8 أشهر'
      }
    ]
  },
  {
    id: 2,
    category: 'مهارات شخصية',
    items: [
      {
        title: 'التواصل الفعال',
        description: 'تطوير مهارات التواصل الكتابي والشفهي للتعبير عن أفكارك بوضوح و.confidence في بيئة العمل.',
        level: 'لجميع المستويات',
        duration: '1-3 أشهر'
      },
      {
        title: 'إدارة الوقت',
        description: 'تعلم تقنيات إدارة الوقت وتحديد الأولويات لإنتاجية أعلى وتوازن أفضل بين العمل والحياة.',
        level: 'لجميع المستويات',
        duration: '1 شهر'
      },
      {
        title: 'القيادة وإدارة الفرق',
        description: 'تطوير مهارات القيادة والقيادة الفعّالة لإدارة الفرق وتحقيق الأهداف المشتركة.',
        level: 'متوسط - متقدم',
        duration: '3-6 أشهر'
      }
    ]
  },
  {
    id: 3,
    category: 'مهارات العمل',
    items: [
      {
        title: 'كتابة السيرة الذاتية',
        description: 'تعلم كيفية كتابة سيرة ذاتية احترافية تلفت انتباه أصحاب العمل وتبرز مهاراتك وخبراتك.',
        level: 'لجميع المستويات',
        duration: '1-2 أسبوع'
      },
      {
        title: 'التسويق الرقمي',
        description: 'إتقان أدوات التسويق عبر الإنترنت مثل SEO, وسائل التواصل الاجتماعي, والإعلانات المدفوعة.',
        level: 'مبتدئ - متوسط',
        duration: '3-6 أشهر'
      },
      {
        title: 'إدارة المشاريع',
        description: 'تعلم منهجيات إدارة المشاريع مثل Agile و Scrum لإدارة مشاريعك بكفاءة.',
        level: 'متوسط',
        duration: '2-4 أشهر'
      }
    ]
  }
]

export default function SkillDevelopmentPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">تطوير المهارات</h1>
          <p className="text-emerald-100 text-lg max-w-2xl mx-auto">
            استثمر في نفسك وطور مهاراتك لتحقيق النجاح في مسارك المهني
          </p>
        </div>
      </div>

      {/* Skills Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {skills.map((category) => (
          <div key={category.id} className="mb-16 last:mb-0">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1.5 h-10 bg-emerald-600 rounded-full"></div>
              <h2 className="text-2xl font-bold text-gray-900">{category.category}</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {category.items.map((skill, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium">
                      {skill.level}
                    </span>
                    <span className="text-gray-400 text-sm">{skill.duration}</span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg mb-3 group-hover:text-emerald-600 transition-colors">
                    {skill.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{skill.description}</p>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Tips Section */}
        <div className="mt-16 bg-white rounded-2xl p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">نصائح لتطوير مهاراتك بفعالية</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">ابدأ بالأساسيات</h4>
                <p className="text-gray-600 text-sm">حدد المهارات الأكثر طلباً في مجالك وابدأ بتعلم الأساسيات أولاً</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">الممارسة المستمرة</h4>
                <p className="text-gray-600 text-sm">خصص وقتاً يومياً للممارسة والتطبيق العملي للمهارات الجديدة</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">التعلم من الآخرين</h4>
                <p className="text-gray-600 text-sm">انضم لمجموعات تعلم وشارك في ورش العمل للاستفادة من خبرات الآخرين</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">الشهادات والاعتمادات</h4>
                <p className="text-gray-600 text-sm">احصل على شهادات معترف بها لإثبات مهاراتك ل أصحاب العمل</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Link
            to="/articles"
            className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-lg hover:shadow-xl"
          >
            اقرأ المقالات المهنية
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  )
}
