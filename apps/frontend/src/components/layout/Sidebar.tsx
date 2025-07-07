import { NavLink } from 'react-router-dom'
import { Home, Package, ShoppingCart, ChefHat } from 'lucide-react'

const navigation = [
  { name: 'ホーム', href: '/', icon: Home },
  { name: '在庫管理', href: '/inventory', icon: Package },
  { name: 'セール情報', href: '/sales', icon: ShoppingCart },
  { name: 'レシピ', href: '/recipes', icon: ChefHat },
]

export default function Sidebar() {
  return (
    <div className="w-64 bg-white shadow-lg">
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-center h-16 px-4 bg-primary-600">
          <ChefHat className="h-8 w-8 text-white" />
          <span className="ml-2 text-xl font-bold text-white">
            SmartRecipe
          </span>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  )
}