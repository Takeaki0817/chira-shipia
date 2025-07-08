import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from './components/ui/Toaster'
import Layout from './components/layout/Layout'
import HomePage from './pages/HomePage'
import InventoryPage from './pages/InventoryPage'
import SalesPage from './pages/SalesPage'
import RecipesPage from './pages/RecipesPage'
import AuthPage from './pages/AuthPage'
import { useAuthStore } from './stores/auth.store'

function App() {
  const { isAuthenticated, isLoading, initialize } = useAuthStore()

  useEffect(() => {
    initialize()
  }, [initialize])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route 
          path="/auth" 
          element={isAuthenticated ? <Navigate to="/" replace /> : <AuthPage />} 
        />
        <Route 
          path="/" 
          element={isAuthenticated ? <Layout /> : <Navigate to="/auth" replace />}
        >
          <Route index element={<HomePage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="sales" element={<SalesPage />} />
          <Route path="recipes" element={<RecipesPage />} />
        </Route>
      </Routes>
      <Toaster />
    </div>
  )
}

export default App