import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import ProtectedRoute from './components/ProtectedRoute'
import ScrollToTop from './components/ScrollToTop'
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
import AdminNavigation from './pages/AdminNavigation'
import ArticlePage from './pages/ArticlePage'
import JobsPage from './pages/JobsPage'
import ArticlesPage from './pages/ArticlesPage'
import InterviewTipsPage from './pages/InterviewTipsPage'
import SearchPage from './pages/SearchPage'
import DynamicPage from './pages/DynamicPage'

function App() {
  const checkSession = useAuthStore(state => state.checkSession)

  useEffect(() => {
    checkSession()
  }, [checkSession])
  return (
    <Router>
      <ScrollToTop />
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
        <Route path="/search" element={<SearchPage />} />
        <Route path="/page/:slug" element={<DynamicPage />} />
        
        {/* Admin Login Route (public) */}
        <Route path="/admin/login" element={<AdminLogin />} />
        
        {/* Protected Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/articles" element={<ProtectedRoute><AdminArticles /></ProtectedRoute>} />
        <Route path="/admin/articles/new" element={<ProtectedRoute><AdminArticleEditor /></ProtectedRoute>} />
        <Route path="/admin/articles/:id/edit" element={<ProtectedRoute><AdminArticleEditor /></ProtectedRoute>} />
        <Route path="/admin/categories" element={<ProtectedRoute><AdminCategories /></ProtectedRoute>} />
        <Route path="/admin/jobs" element={<ProtectedRoute><AdminJobs /></ProtectedRoute>} />
        <Route path="/admin/jobs/new" element={<ProtectedRoute><AdminJobEditor /></ProtectedRoute>} />
        <Route path="/admin/jobs/:id/edit" element={<ProtectedRoute><AdminJobEditor /></ProtectedRoute>} />
        <Route path="/admin/settings" element={<ProtectedRoute><AdminSettings /></ProtectedRoute>} />
        <Route path="/admin/navigation" element={<ProtectedRoute><AdminNavigation /></ProtectedRoute>} />
        
        {/* 404 Catch-all */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  )
}

export default App
