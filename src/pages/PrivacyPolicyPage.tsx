import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function PrivacyPolicyPage() {
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
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">سياسة الخصوصية</h1>
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
                مرحبًا بك في موقع JobNest ("نحن"). نحترم خصوصيتك ونلتزم بحماية بياناتك. تشرح هذه السياسة كيف نقوم بجمع واستخدام وحماية المعلومات عند استخدامك لموقعنا.
              </p>
            </section>

            {/* Nature of the Service */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">طبيعة الخدمة</h2>
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 mb-4">
                <p className="text-emerald-800 font-semibold text-lg mb-2">⚡ نقطة مهمة</p>
                <p className="text-emerald-700 leading-relaxed">
                  موقع JobNest هو موقع إعلامي يحتوي على مقالات وفرص عمل. <strong>لا يوجد حسابات مستخدمين</strong>، ولا يمكن للزوار التسجيل أو التعليق على المقالات. الزوار يستطيعون فقط تصفح وقراءة المحتوى المنشور على الموقع.
                </p>
              </div>
            </section>

            {/* Information We Collect */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">المعلومات التي نجمعها</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">معلومات نموذج التواصل</h3>
                  <p className="text-gray-700 leading-relaxed mb-2">
                    عند استخدامك لصفحة "اتصل بنا"، نقوم بجمع المعلومات التي تقدمها طوعًا:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 mr-4">
                    <li>الاسم الكامل</li>
                    <li>البريد الإلكتروني</li>
                    <li>موضوع الرسالة</li>
                    <li>محتوى الرسالة</li>
                  </ul>
                  <p className="text-gray-600 text-sm mt-2 mr-4">
                    تُستخدم هذه المعلومات فقط للرد على استفساراتك ولا تُستخدم لأي غرض آخر.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">معلومات تجمعها تلقائيًا</h3>
                  <p className="text-gray-700 leading-relaxed mb-2">
                    عند زيارتك للموقع، قد يتم جمع بعض المعلومات تلقائيًا عبر أدوات التحليل:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 mr-4">
                    <li>عنوان IP الخاص بك</li>
                    <li>نوع المتصفح ونظام التشغيل</li>
                    <li>الصفحات التي تزورها ومدة الزيارة</li>
                    <li>مصدر الزيارة إلى الموقع</li>
                    <li>الجهاز المستخدم (حاسوب أو هاتف)</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* How We Use Information */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">كيف نستخدم هذه المعلومات</h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mr-4">
                <li>للرد على رسائلك واستفساراتك عبر نموذج التواصل</li>
                <li>لتحليل حركة المرور وتحسين محتوى الموقع</li>
                <li>لعرض إعلانات ذات صلة عبر Google AdSense</li>
                <li>لتحسين تجربة التصفح على الموقع</li>
                <li>لمنع الاحتيال وحماية أمن الموقع</li>
              </ul>
            </section>

            {/* Cookies */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">ملفات تعريف الارتباط (Cookies)</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                نستخدم ملفات تعريف الارتباط لتحسين تجربتك على موقعنا. يمكنك التحكم في ملفات تعريف الارتباط من خلال إعدادات متصفحك.
              </p>
              <div className="space-y-3">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="font-semibold text-gray-800">ملفات ضرورية</p>
                  <p className="text-gray-600 text-sm">ضرورية لعمل الموقع بشكل صحيح</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="font-semibold text-gray-800">ملفات Google Analytics</p>
                  <p className="text-gray-600 text-sm">لتحليل كيفية استخدام الزوار للموقع وتحسين المحتوى</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="font-semibold text-gray-800">ملفات Google AdSense</p>
                  <p className="text-gray-600 text-sm">لعرض إعلانات ذات صلة ومحتوى مخصص</p>
                </div>
              </div>
            </section>

            {/* Third Party Services */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">الخدمات الخارجية</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                نستخدم الخدمات الخارجية التالية لتشغيل وتحسين الموقع:
              </p>
              <div className="space-y-3">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="font-semibold text-gray-800">Google Analytics</p>
                  <p className="text-gray-600 text-sm">لاستقبال إحصائيات حول حركة المرور وسلوك الزوار. يجمع Google Analytics معلومات غير شخصية مثل الصفحات الأكثر زيارة ومدة البقاء في الموقع.</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="font-semibold text-gray-800">Google AdSense</p>
                  <p className="text-gray-600 text-sm">لعرض الإعلانات على الموقع. قد يستخدم AdSense ملفات تعريف الارتباط لتخصيص الإعلانات بناءً على زياراتك السابقة لمواقع أخرى.</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm mt-4">
                يمكنك تعطيل ملفات تعريف الارتباط من خلال إعدادات متصفحك. لمزيد من المعلومات حول كيفية جمع Google للبيانات، يرجى زيارة:
                <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline mr-1">سياسة خصوصية Google</a>
              </p>
            </section>

            {/* Data Security */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">أمن البيانات</h2>
              <p className="text-gray-700 leading-relaxed">
                نتخذ إجراءات أمنية مناسبة لحماية المعلومات من الوصول غير المصرح به. ومع ذلك، لا يمكن ضمان أمن البيانات بشكل مطلق عبر الإنترنت.
              </p>
            </section>

            {/* Children's Privacy */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">خصوصية الأطفال</h2>
              <p className="text-gray-700 leading-relaxed">
                موقعنا ليس مخصصًا للأطفال تحت سن 13 عامًا. لا نجمع عن قصد معلومات شخصية من الأطفال. إذا اكتشفنا أننا جمعنا معلومات من طفل، سنقوم بحذفها فورًا.
              </p>
            </section>

            {/* Your Rights */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">حقوقك</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                نظراً لأننا لا نجمع بيانات شخصية عبر حسابات مستخدمين (لعدم وجود نظام تسجيل)، فإن حقوقك تشمل:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mr-4">
                <li>طلب حذف أي رسالة أرسلتها عبر نموذج التواصل</li>
                <li>طلب عدم استخدام بياناتك لأغراض تسويقية</li>
                <li>تعطيل ملفات تعريف الارتباط من إعدادات المتصفح</li>
                <li>الاطلاع على كيفية استخدام Google لبياناتك عبر روابط سياسة الخصوصية الخاصة بهم</li>
              </ul>
            </section>

            {/* Changes */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">التغييرات على هذه السياسة</h2>
              <p className="text-gray-700 leading-relaxed">
                نحتفظ بحق تحديث هذه السياسة في أي وقت. سنقوم بنشر أي تغييرات على هذه الصفحة. يُنصح بمراجعة هذه السياسة بشكل دوري.
              </p>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">التواصل معنا</h2>
              <p className="text-gray-700 leading-relaxed">
                إذا كان لديك أي أسئلة حول سياسة الخصوصية هذه، يرجى التواصل معنا عبر:
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