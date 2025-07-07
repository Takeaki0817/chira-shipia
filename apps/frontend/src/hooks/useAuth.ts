import { useState } from 'react'
import { useAuthStore } from '../stores/auth.store'
import { authService, type SignInData, type SignUpData } from '../services/auth.service'

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { user, isAuthenticated, signOut: storeSignOut } = useAuthStore()

  const signIn = async (data: SignInData) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const { user, error } = await authService.signIn(data)
      
      if (error) {
        setError(error.message)
        return { success: false, error: error.message }
      }
      
      return { success: true, user }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'ログインに失敗しました'
      setError(message)
      return { success: false, error: message }
    } finally {
      setIsLoading(false)
    }
  }

  const signUp = async (data: SignUpData) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const { user, error } = await authService.signUp(data)
      
      if (error) {
        setError(error.message)
        return { success: false, error: error.message }
      }
      
      return { success: true, user }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'アカウント作成に失敗しました'
      setError(message)
      return { success: false, error: message }
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      await storeSignOut()
      return { success: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'ログアウトに失敗しました'
      setError(message)
      return { success: false, error: message }
    } finally {
      setIsLoading(false)
    }
  }

  const clearError = () => setError(null)

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    signIn,
    signUp,
    signOut,
    clearError,
  }
}