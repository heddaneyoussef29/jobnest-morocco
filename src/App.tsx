import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'
import TermsPage from './pages/TermsPage'
import NotFoundPage from './pages/NotFoundPage'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import AdminArticles from './pages/AdminArticles'
import AdminArticleEditor from './pages/AdminArticleEditor'
import AdminCategories from './pages/AdminCategories'
import AdminJobs from './pages/AdminJobs'
import AdminJobEditor from './pages/AdminJobEditor'
import AdminSettings from './pages/AdminSettings'
import ArticlePage from './pages/ArticlePage'
import JobsPage from './pages/JobsPage'
import ArticlesPage from './pages/ArticlesPage'
import InterviewTipsPage from './pages/InterviewTipsPage'
import SkillDevelopmentPage from './pages/SkillDevelopmentPage'
import SearchPage from './pages/SearchPage'

function App() {
  const checkSession = useAuthStore(state => state.checkSession)

  useEffect(() => {
    checkSession()
  }, [checkSession])
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/article/:slug" element={<ArticlePage />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/articles" element={<ArticlesPage />} />
        <Route path="/interview-tips" element={<InterviewTipsPage />} />
        <Route path="/skill-development" element={<SkillDevelopmentPage />} />
        <Route path="/search" element={<SearchPage />} />
        
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/articles" element={<AdminArticles />} />
        <Route path="/admin/articles/new" element={<AdminArticleEditor />} />
        <Route path="/admin/articles/:id/edit" element={<AdminArticleEditor />} />
        <Route path="/admin/categories" element={<AdminCategories />} />
        <Route path="/admin/jobs" element={<AdminJobs />} />
        <Route path="/admin/jobs/new" element={<AdminJobEditor />} />
        <Route path="/admin/jobs/:id/edit" element={<AdminJobEditor />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
        
        {/* 404 Catch-all */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  )
}

export default App