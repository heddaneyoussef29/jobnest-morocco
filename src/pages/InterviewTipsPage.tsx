import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'

const tips = [
  {
    id: 1,
    title: 'البحث المسبق عن الشركة',
    description: 'قبل أي مقابلة، ابحث عن تاريخ الشركة، قيمها، منتجاتها، وأي أخبار حديثة. هذا يثبت اهتمامك و-professionalism.',
    icon: (
      <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    )
  },
  {
    id: 2,
    title: 'التحضير للأسئلة الشائعة',
    description: 'حضّر إجاباتك للأسئلة الشائعة مثل "أخبرنا عن نفسك"، "ما هي نقاط قوتك وضعفك"، و"لماذا تريد العمل معنا".',
    icon: (
      <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  {
    id: 3,
    title: 'المظهر المهني',
    description: 'اختر ملابس رسمية مناسبة لطبيعة الشركة. تأكد من أن مظهرك نظيف ومرتب يعكس احترامك للمقابلة.',
    icon: (
      <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    )
  },
  {
    id: 4,
    title: 'التواصل غير اللفظي',
    description: 'حافظ على التواصل البصري، ابتسم، ومصافحة يد قوية. لغة الجسد تلعب دوراً مهماً في الانطباع الأول.',
    icon: (
      <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    )
  },
  {
    id: 5,
    title: 'استخدام طريقة STAR',
    description: 'عند الإجابة عن أسئلة السلوك، استخدم طريقة STAR: الموقف (Situation)، المهمة (Task)، الإجراء (Action)، والنتيجة (Result).',
    icon: (
      <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    )
  },
  {
    id: 6,
    title: 'طرح أسئلة ذكية',
    description: 'في نهاية المقابلة، اطرح أسئلة عن văn الشركة، فرص التطور، أو التحديات الحالية. هذا يظهر اهتمامك الحقيقي.',
    icon: (
      <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  {
    id: 7,
    title: 'إرسال رسالة شكر',
    description: 'بعد المقابلة بـ24 ساعة، أرسل رسالة شكر بريد إلكتروني للمقابل. هذا يترك انطباعاً إيجابياً ويذكرهم بك.',
    icon: (
      <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    )
  },
  {
    id: 8,
    title: 'الوصول المبكر',
    description: 'حاول الوصول قبل موعد المقابلة بـ10-15 دقيقة. الوصول المبكر يعكس التزامك واحترامك للوقت.',
    icon: (
      <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  }
]

export default function InterviewTipsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">نصائح المقابلات الوظيفية</h1>
          <p className="text-emerald-100 text-lg max-w-2xl mx-auto">
            دليلك الشامل للنجاح في المقابلات الوظيفية وتحقيق انطباع ممتاز
          </p>
        </div>
      </div>

      {/* Tips Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {tips.map((tip) => (
            <div
              key={tip.id}
              className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 group"
            >
              <div className="w-14 h-14 bg-emerald-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                {tip.icon}
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-3">{tip.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{tip.description}</p>
            </div>
          ))}
        </div>

        {/* Additional Section */}
        <div className="mt-16 bg-white rounded-2xl p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">نصائح إضافية للنجاح</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-emerald-600 font-bold text-sm">✓</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">كن صادقاً</h4>
                <p className="text-gray-600 text-sm">الصدق يبني الثقة المتبادلة ويضمن نجاح العلاقة طويلة الأمد</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-emerald-600 font-bold text-sm">✓</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">استمع بانتباه</h4>
                <p className="text-gray-600 text-sm">لا تقاطع، واستمع جيداً قبل الإجابة لفهم السؤال تماماً</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-emerald-600 font-bold text-sm">✓</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">أظهر الحماس</h4>
                <p className="text-gray-600 text-sm">أظهر اهتمامك الحقيقي بالوظيفة والشركة من خلال أسئلتك وتواصلك</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-emerald-600 font-bold text-sm">✓</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">راجع مهاراتك</h4>
                <p className="text-gray-600 text-sm">حدد مهاراتك الرئيسية واحضر أمثلة واقعية تثبت كفاءتك</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Link
            to="/jobs"
            className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-lg hover:shadow-xl"
          >
            ابحث عن وظائف الآن
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
