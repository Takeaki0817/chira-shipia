import { Link } from 'react-router-dom'
import { ChefHat, Package, ShoppingCart, Sparkles } from 'lucide-react'
import { useInventory } from '../hooks/useInventory'

export default function HomePage() {
  const { items = [], isLoading } = useInventory()

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          SmartRecipe へようこそ
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          AIが冷蔵庫の在庫とセール情報を組み合わせて、
          あなたにぴったりのレシピを提案します
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <Package className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">
              {isLoading ? '...' : items.length}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            在庫アイテム
          </h3>
          <p className="text-gray-600 text-sm">
            冷蔵庫の食材を管理
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <ShoppingCart className="h-8 w-8 text-green-600" />
            <span className="text-2xl font-bold text-gray-900">0</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            セール情報
          </h3>
          <p className="text-gray-600 text-sm">
            お得な商品をチェック
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <ChefHat className="h-8 w-8 text-purple-600" />
            <span className="text-2xl font-bold text-gray-900">0</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            生成レシピ
          </h3>
          <p className="text-gray-600 text-sm">
            AIが提案したレシピ
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <Sparkles className="h-8 w-8 text-yellow-600" />
            <span className="text-2xl font-bold text-gray-900">¥0</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            節約額
          </h3>
          <p className="text-gray-600 text-sm">
            今月の食費節約額
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <ChefHat className="h-16 w-16 text-primary-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          レシピ生成を始めましょう
        </h2>
        <p className="text-gray-600 mb-6">
          まずは冷蔵庫の在庫を登録して、セール情報をアップロードしてください
        </p>
        <div className="flex justify-center space-x-4">
          <Link to="/inventory" className="btn btn-primary px-6 py-3">
            在庫を追加
          </Link>
          <Link to="/sales" className="btn btn-outline px-6 py-3">
            セール情報を追加
          </Link>
        </div>
      </div>
    </div>
  )
}