import { create } from 'zustand'
import type { User } from '@supabase/supabase-js'
import { authService } from '../services/auth.service'

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  
  // Actions
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  signOut: () => Promise<void>
  initialize: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  setUser: (user) => set({ 
    user, 
    isAuthenticated: !!user,
    isLoading: false 
  }),

  setLoading: (isLoading) => set({ isLoading }),

  signOut: async () => {
    set({ isLoading: true })
    try {
      const { error } = await authService.signOut()
      if (error) {
        console.error('Sign out error:', error)
      }
      set({ user: null, isAuthenticated: false })
    } finally {
      set({ isLoading: false })
    }
  },

  initialize: async () => {
    try {
      const user = await authService.getCurrentUser()
      set({ 
        user, 
        isAuthenticated: !!user,
        isLoading: false 
      })

      // Set up auth state listener
      authService.onAuthStateChange((user) => {
        set({ 
          user, 
          isAuthenticated: !!user,
          isLoading: false 
        })
      })
    } catch (error) {
      console.error('Auth initialization error:', error)
      set({ isLoading: false })
    }
  },
}))