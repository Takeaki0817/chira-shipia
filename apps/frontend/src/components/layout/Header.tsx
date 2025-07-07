import { Bell, User, LogOut } from 'lucide-react'
import { useAuthStore } from '../../stores/auth.store'
import { useAuth } from '../../hooks/useAuth'

export default function Header() {
  const { user } = useAuthStore()
  const { signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        <h1 className="text-2xl font-semibold text-gray-900">
          SmartRecipe
        </h1>
        
        <div className="flex items-center space-x-4">
          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <Bell className="h-5 w-5" />
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <div className="text-sm">
                <div className="font-medium text-gray-700">
                  {user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'ユーザー'}
                </div>
                <div className="text-gray-500 text-xs">
                  {user?.email}
                </div>
              </div>
            </div>
            
            <button
              onClick={handleSignOut}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="ログアウト"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}