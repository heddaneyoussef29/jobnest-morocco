import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function TermsPage() {
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
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">شروط الاستخدام</h1>
            <p className="text-emerald-100 text-lg max-w-2xl mx-auto leading-relaxed">
              آخر تحديث: {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </section>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-sm border border-gray-100 space-y-8">
            
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">مقدمة</h2>
              <p className="text-gray-700 leading-relaxed">
                مرحبًا بك في موقع JobNest. باستخدامك لهذا الموقع، أنت توافق على الالتزام بهذه الشروط والأحكام. إذا لم توافق على أي من هذه الشروط، يرجى عدم استخدام الموقع.
              </p>
            </section>

            {/* Nature of the Service */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">طبيعة الخدمة</h2>
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 mb-4">
                <p className="text-emerald-800 font-semibold text-lg mb-2">⚡ نقطة مهمة</p>
                <p className="text-emerald-700 leading-relaxed">
                  موقع JobNest هو موقع إعلامي يحتوي على مقالات وفرص عمل. <strong>لا يوجد حسابات مستخدمين أو نظام تسجيل</strong>. الزوار يستطيعون فقط تصفح وقراءة المحتوى المنشور على الموقع. لا يمكن للزوار التعليق على المقالات أو إنشاء ملفات شخصية.
                </p>
              </div>
            </section>

            {/* Use of Content */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">استخدام المحتوى</h2>
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  المحتوى المنشور على موقعنا محمي بحقوق الملكية الفكرية. يُسمح لك بـ:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mr-4">
                  <li>قراءة وطباعة المحتوى للاستخدام الشخصي غير التجاري</li>
                  <li>مشاركة روابط المقالات عبر وسائل التواصل الاجتماعي</li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  يُحظر عليك:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mr-4">
                  <li>نسخ أو إعادة نشر المحتوى بدون إذن كتابي</li>
                  <li>استخدام المحتوى لأغراض تجارية</li>
                  <li>تعديل أو تزييف المحتوى</li>
                  <li>جمع البيانات من الموقع آلياً (scraping)</li>
                </ul>
              </div>
            </section>

            {/* User Conduct */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">سلوك الزوار</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                عند استخدام موقعنا، أنت توافق على عدم:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mr-4">
                <li>محاولة الوصول غير المصرح به لأنظمة الموقع</li>
                <li>تعطيل أو إعاقة عمل الموقع</li>
                <li>استخدام أدوات آلية لجمع محتوى الموقع</li>
                <li>انتهاك حقوق الملكية الفكرية للمحتوى المنشور</li>
              </ul>
            </section>

            {/* Accuracy of Information */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">دقة المعلومات</h2>
              <p className="text-gray-700 leading-relaxed">
                نسعى لتقديم معلومات دقيقة ومحدثة، لكننا لا نضمن دقة أو اكتمال أو حداثة المعلومات المنشورة. المعلومات المقدمة على الموقع هي لأغراض تعليمية وإعلامية فقط ولا يجب اعتبارها نصيحة مهنية أو قانونية أو مالية.
              </p>
            </section>

            {/* Advertising */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">الإعلانات</h2>
              <p className="text-gray-700 leading-relaxed">
                يستخدم الموقع Google AdSense لعرض الإعلانات. الإعلانات المعروضة قد لا تكون مرتبطة دائماً بمحتوى الموقع. نحن غير مسؤولين عن محتوى الإعلانات الخارجية أو المواقع المرتبطة بها.
              </p>
            </section>

            {/* External Links */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">الروابط الخارجية</h2>
              <p className="text-gray-700 leading-relaxed">
                قد يحتوي الموقع على روابط لمواقع خارجية. نحن غير مسؤولين عن محتوى أو ممارسات هذه المواقع. ننصح بمراجعة شروط الاستخدام وسياسات الخصوصية لكل موقع تزوره.
              </p>
            </section>

            {/* Limitation of Liability */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">تحديد المسؤولية</h2>
              <p className="text-gray-700 leading-relaxed">
                لن نكون مسؤولين عن أي أضرار مباشرة أو غير مباشرة ناتجة عن استخدام الموقع أو عدم القدرة على استخدامه. أنت تتحمل المسؤولية الكاملة عن استخدامك للموقع والمحتوى المنشور فيه.
              </p>
            </section>

            {/* Changes */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">التغييرات على الشروط</h2>
              <p className="text-gray-700 leading-relaxed">
                نحتفظ بحق تعديل هذه الشروط في أي وقت. سيتم نشر الشروط المحدثة على هذه الصفحة. استمرارك في استخدام الموقع بعد أي تغييرات يشكل قبولاً للشروط الجديدة.
              </p>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">التواصل معنا</h2>
              <p className="text-gray-700 leading-relaxed">
                إذا كان لديك أي أسئلة حول شروط الاستخدام هذه، يرجى التواصل معنا عبر:
              </p>
              <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                <p className="text-gray-700">
                  <strong>البريد الإلكتروني:</strong> heddaneyoussef29@gmail.com
                </p>
                <p className="text-gray-700 mt-2">
                  <strong>صفحة التواصل:</strong> <Link to="/contact" className="text-emerald-600 hover:underline">اتصل بنا</Link>
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}