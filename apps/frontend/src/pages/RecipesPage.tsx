import { useState } from 'react'
import { ChefHat, Clock, Users, DollarSign, Star, Eye, Trash2, Sparkles } from 'lucide-react'
import { useRecipes } from '../hooks/useRecipes'
import type { Recipe, RecipeGenerationRequest } from '../types/recipe.types'

export default function RecipesPage() {
  const [showGenerateForm, setShowGenerateForm] = useState(false)
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  
  const { 
    recipes, 
    isLoading, 
    generateRecipe, 
    deleteRecipe,
    isGenerating,
    isDeleting,
    generationError 
  } = useRecipes()

  const handleGenerate = () => {
    setShowGenerateForm(true)
  }

  const handleViewDetail = (recipe: Recipe) => {
    setSelectedRecipe(recipe)
    setShowDetailModal(true)
  }

  const handleDeleteRecipe = async (id: string) => {
    if (confirm('このレシピを削除しますか？')) {
      try {
        await deleteRecipe(id)
      } catch (error) {
        console.error('Delete failed:', error)
      }
    }
  }

  const getDifficultyColor = (level: number) => {
    switch (level) {
      case 1: return 'text-green-600 bg-green-50'
      case 2: return 'text-yellow-600 bg-yellow-50'
      case 3: return 'text-orange-600 bg-orange-50'
      case 4: return 'text-red-600 bg-red-50'
      case 5: return 'text-purple-600 bg-purple-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount == null || typeof amount !== 'number') {
      return '¥0'
    }
    return `¥${amount.toLocaleString()}`
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">レシピ</h1>
        <button 
          onClick={handleGenerate}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Sparkles className="h-4 w-4" />
          <span>AIレシピ生成</span>
        </button>
      </div>

      {/* Recipes Grid */}
      {recipes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <div key={recipe.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {recipe.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {recipe.description}
                  </p>
                </div>
                <div className="flex space-x-1 ml-2">
                  <button
                    onClick={() => handleViewDetail(recipe)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                    title="詳細を見る"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteRecipe(recipe.id)}
                    className="p-1 text-gray-400 hover:text-red-600"
                    disabled={isDeleting}
                    title="削除"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{recipe.cooking_time}分</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{recipe.servings}人分</span>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded text-xs ${getDifficultyColor(recipe.difficulty_level)}`}>
                  難易度{recipe.difficulty_level}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-lg font-bold text-green-600">
                  {formatCurrency(recipe.total_cost)}
                </div>
                {recipe.sale_savings > 0 && (
                  <div className="text-sm text-red-500">
                    {formatCurrency(recipe.sale_savings)}節約
                  </div>
                )}
              </div>
              
              <div className="mt-3 flex flex-wrap gap-1">
                {recipe.tags.slice(0, 3).map((tag, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                    {tag}
                  </span>
                ))}
              </div>
              
              {recipe.ai_generated && (
                <div className="mt-2 flex items-center space-x-1 text-xs text-purple-600">
                  <Sparkles className="h-3 w-3" />
                  <span>AI生成</span>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <ChefHat className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">生成されたレシピがありません</p>
          <p className="text-sm text-gray-400 mb-6">
            在庫とセール情報からAIがレシピを生成します
          </p>
          <button 
            onClick={handleGenerate}
            className="btn btn-primary"
          >
            AIレシピ生成
          </button>
        </div>
      )}

      {/* Generate Form Modal */}
      {showGenerateForm && (
        <RecipeGenerateForm
          onClose={() => setShowGenerateForm(false)}
          onGenerate={generateRecipe}
          isGenerating={isGenerating}
          error={generationError}
        />
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedRecipe && (
        <RecipeDetailModal
          recipe={selectedRecipe}
          onClose={() => {
            setShowDetailModal(false)
            setSelectedRecipe(null)
          }}
        />
      )}
    </div>
  )
}

interface RecipeGenerateFormProps {
  onClose: () => void
  onGenerate: (params: RecipeGenerationRequest) => Promise<Recipe>
  isGenerating: boolean
  error: Error | null
}

function RecipeGenerateForm({ onClose, onGenerate, isGenerating, error }: RecipeGenerateFormProps) {
  const [formData, setFormData] = useState<RecipeGenerationRequest>({
    difficulty: 3,
    cookingTime: 30,
    servings: 2,
    budget: 1000,
    allergies: [],
    dietaryRestrictions: [],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await onGenerate(formData)
      onClose()
    } catch (error) {
      console.error('Generation failed:', error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'allergies' || name === 'dietaryRestrictions' 
        ? value.split(',').map(s => s.trim()).filter(Boolean)
        : parseInt(value) || value,
    }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            AIレシピ生成
          </h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
              {error.message}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  調理時間（分）
                </label>
                <input
                  type="number"
                  name="cookingTime"
                  value={formData.cookingTime}
                  onChange={handleInputChange}
                  className="input w-full"
                  min="10"
                  max="180"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  人数
                </label>
                <input
                  type="number"
                  name="servings"
                  value={formData.servings}
                  onChange={handleInputChange}
                  className="input w-full"
                  min="1"
                  max="10"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  難易度（1-5）
                </label>
                <select
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleInputChange}
                  className="input w-full"
                >
                  <option value={1}>1 - とても簡単</option>
                  <option value={2}>2 - 簡単</option>
                  <option value={3}>3 - 普通</option>
                  <option value={4}>4 - 少し難しい</option>
                  <option value={5}>5 - 難しい</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  予算（円）
                </label>
                <input
                  type="number"
                  name="budget"
                  value={formData.budget}
                  onChange={handleInputChange}
                  className="input w-full"
                  min="300"
                  max="5000"
                  step="100"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                アレルギー（カンマ区切り）
              </label>
              <input
                type="text"
                name="allergies"
                value={formData.allergies.join(', ')}
                onChange={handleInputChange}
                className="input w-full"
                placeholder="例: 卵, 乳製品, 小麦"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                食事制限（カンマ区切り）
              </label>
              <input
                type="text"
                name="dietaryRestrictions"
                value={formData.dietaryRestrictions.join(', ')}
                onChange={handleInputChange}
                className="input w-full"
                placeholder="例: ベジタリアン, 低糖質, 低塩分"
              />
            </div>
            
            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                className="btn btn-primary flex-1"
                disabled={isGenerating}
              >
                {isGenerating ? 'レシピ生成中...' : 'レシピ生成'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="btn btn-outline flex-1"
                disabled={isGenerating}
              >
                キャンセル
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

interface RecipeDetailModalProps {
  recipe: Recipe
  onClose: () => void
}

function RecipeDetailModal({ recipe, onClose }: RecipeDetailModalProps) {
  const formatCurrency = (amount: number | null | undefined) => {
    if (amount == null || typeof amount !== 'number') {
      return '¥0'
    }
    return `¥${amount.toLocaleString()}`
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {recipe.title}
              </h2>
              <p className="text-gray-600">{recipe.description}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl"
            >
              ✕
            </button>
          </div>
          
          {/* Recipe Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <Clock className="h-6 w-6 text-gray-600 mx-auto mb-1" />
              <div className="text-sm font-medium">{recipe.cooking_time}分</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <Users className="h-6 w-6 text-gray-600 mx-auto mb-1" />
              <div className="text-sm font-medium">{recipe.servings}人分</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <DollarSign className="h-6 w-6 text-gray-600 mx-auto mb-1" />
              <div className="text-sm font-medium">{formatCurrency(recipe.total_cost)}</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <Star className="h-6 w-6 text-gray-600 mx-auto mb-1" />
              <div className="text-sm font-medium">難易度 {recipe.difficulty_level}</div>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Ingredients */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">材料</h3>
              <div className="space-y-2">
                {recipe.ingredients.map((ingredient, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <div>
                      <span className="font-medium">{ingredient.name}</span>
                      <span className="text-gray-600 ml-2">{ingredient.amount}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">{ingredient.source}</div>
                      <div className="text-sm font-medium">{formatCurrency(ingredient.cost)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Instructions */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">作り方</h3>
              <ol className="space-y-3">
                {recipe.instructions.map((step, index) => (
                  <li key={index} className="flex space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <span className="text-gray-700">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
          
          {/* Tags and Categories */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex flex-wrap gap-2">
              {recipe.categories.map((category, index) => (
                <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                  {category}
                </span>
              ))}
              {recipe.tags.map((tag, index) => (
                <span key={index} className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          
          {recipe.sale_savings > 0 && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-green-800 font-medium">
                セール商品利用で {formatCurrency(recipe.sale_savings)} の節約！
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}