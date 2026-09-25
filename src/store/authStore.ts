import { create } from 'zustand'
import { supabase } from '../lib/supabase'

interface User {
  id: string
  email: string
  full_name: string | null
  role: string
  supabase_auth_id: string
}

interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  checkSession: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  error: null,

  signIn: async (email: string, password: string) => {
    try {
      set({ error: null, loading: true })

      // Validate input
      if (!email || !password) {
        throw new Error('البريد الإلكتروني وكلمة المرور مطلوبان')
      }

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        throw new Error('البريد الإلكتروني غير صحيح')
      }

      // Sanitize email
      const sanitizedEmail = email.trim().toLowerCase()

      // Use Supabase Auth to sign in
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: sanitizedEmail,
        password: password
      })

      if (authError) {
        throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة')
      }

      if (!authData.user) {
        throw new Error('فشل في تسجيل الدخول')
      }

      // Now fetch the user profile from our custom users table
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('id, email, full_name, role, supabase_auth_id, is_active')
        .eq('supabase_auth_id', authData.user.id)
        .single()

      if (profileError || !userProfile) {
        // Sign out if no profile found
        await supabase.auth.signOut()
        throw new Error('لم يتم العثور على حساب管理员. يرجى التواصل مع المسؤول')
      }

      if (!userProfile.is_active) {
        await supabase.auth.signOut()
        throw new Error('الحساب معطّل. يرجى التواصل مع المسؤول')
      }

      // Store session info
      const userSession: User = {
        id: userProfile.id,
        email: userProfile.email,
        full_name: userProfile.full_name,
        role: userProfile.role,
        supabase_auth_id: userProfile.supabase_auth_id
      }

      set({ user: userSession, error: null, loading: false })

    } catch (error: any) {
      set({ error: error.message || 'خطأ غير معروف', loading: false })
      throw error
    }
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, error: null, loading: false })
  },

  checkSession: async () => {
    try {
      set({ loading: true })

      // Check if Supabase Auth has an active session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()

      if (sessionError || !session) {
        set({ user: null, loading: false })
        return
      }

      // Fetch user profile from our custom table
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('id, email, full_name, role, supabase_auth_id, is_active')
        .eq('supabase_auth_id', session.user.id)
        .single()

      if (profileError || !userProfile || !userProfile.is_active) {
        await supabase.auth.signOut()
        set({ user: null, loading: false })
        return
      }

      const userSession: User = {
        id: userProfile.id,
        email: userProfile.email,
        full_name: userProfile.full_name,
        role: userProfile.role,
        supabase_auth_id: userProfile.supabase_auth_id
      }

      set({ user: userSession, loading: false })
    } catch {
      set({ user: null, loading: false })
    }
  }
}))
