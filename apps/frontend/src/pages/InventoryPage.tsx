import { useState } from 'react'
import { Plus, Edit, Trash2, AlertTriangle, Calendar } from 'lucide-react'
import { useInventory, useExpiringInventory } from '../hooks/useInventory'
import type { InventoryItem, CreateInventoryItem } from '../types/inventory.types'

export default function InventoryPage() {
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  
  const { 
    items, 
    isLoading, 
    createItem, 
    updateItem, 
    deleteItem,
    isCreating,
    isUpdating,
    isDeleting 
  } = useInventory()
  
  const { data: expiringItems = [] } = useExpiringInventory(7)

  const handleAddItem = () => {
    setEditingItem(null)
    setShowAddForm(true)
  }

  const handleEditItem = (item: InventoryItem) => {
    setEditingItem(item)
    setShowAddForm(true)
  }

  const handleDeleteItem = async (id: string) => {
    if (confirm('この食材を削除しますか？')) {
      try {
        await deleteItem(id)
      } catch (error) {
        console.error('Delete failed:', error)
      }
    }
  }

  const handleFormSubmit = async (formData: CreateInventoryItem) => {
    try {
      if (editingItem) {
        await updateItem({ ...formData, id: editingItem.id })
      } else {
        await createItem(formData)
      }
      setShowAddForm(false)
      setEditingItem(null)
    } catch (error) {
      console.error('Form submit failed:', error)
    }
  }

  const getExpiryStatus = (expiryDate?: string) => {
    if (!expiryDate) return null
    
    const today = new Date()
    const expiry = new Date(expiryDate)
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysUntilExpiry < 0) return { status: 'expired', color: 'text-red-600', bg: 'bg-red-50' }
    if (daysUntilExpiry <= 3) return { status: 'critical', color: 'text-red-500', bg: 'bg-red-50' }
    if (daysUntilExpiry <= 7) return { status: 'warning', color: 'text-yellow-600', bg: 'bg-yellow-50' }
    return { status: 'good', color: 'text-green-600', bg: 'bg-green-50' }
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
        <h1 className="text-3xl font-bold text-gray-900">在庫管理</h1>
        <button 
          onClick={handleAddItem}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>食材を追加</span>
        </button>
      </div>

      {/* Expiring Items Alert */}
      {expiringItems.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <h3 className="font-medium text-yellow-800">
              期限切れ間近の食材 ({expiringItems.length}件)
            </h3>
          </div>
          <div className="text-sm text-yellow-700">
            {expiringItems.slice(0, 3).map(item => (
              <span key={item.id} className="inline-block mr-3">
                {item.ingredient_name} ({item.expiry_date})
              </span>
            ))}
            {expiringItems.length > 3 && <span>他{expiringItems.length - 3}件</span>}
          </div>
        </div>
      )}

      {/* Items Grid */}
      {items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => {
            const expiryStatus = getExpiryStatus(item.expiry_date)
            return (
              <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{item.ingredient_name}</h3>
                    <p className="text-sm text-gray-600">
                      {item.quantity} {item.unit}
                    </p>
                    {item.category && (
                      <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded mt-1">
                        {item.category}
                      </span>
                    )}
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleEditItem(item)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-1 text-gray-400 hover:text-red-600"
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                {item.expiry_date && expiryStatus && (
                  <div className={`flex items-center space-x-1 text-sm ${expiryStatus.color} ${expiryStatus.bg} px-2 py-1 rounded`}>
                    <Calendar className="h-3 w-3" />
                    <span>期限: {item.expiry_date}</span>
                  </div>
                )}
                
                {item.notes && (
                  <p className="text-xs text-gray-500 mt-2">{item.notes}</p>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <p className="text-gray-500">在庫アイテムがありません</p>
          <p className="text-sm text-gray-400 mt-2">
            食材を追加して在庫管理を始めましょう
          </p>
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <InventoryForm
          item={editingItem}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowAddForm(false)
            setEditingItem(null)
          }}
          isLoading={isCreating || isUpdating}
        />
      )}
    </div>
  )
}

interface InventoryFormProps {
  item?: InventoryItem | null
  onSubmit: (data: CreateInventoryItem) => void
  onCancel: () => void
  isLoading: boolean
}

function InventoryForm({ item, onSubmit, onCancel, isLoading }: InventoryFormProps) {
  const [formData, setFormData] = useState<CreateInventoryItem>({
    ingredient_name: item?.ingredient_name || '',
    quantity: item?.quantity || 1,
    unit: item?.unit || 'pieces',
    expiry_date: item?.expiry_date || '',
    category: item?.category || '',
    notes: item?.notes || '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' ? parseFloat(value) || 0 : value,
    }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {item ? '食材を編集' : '食材を追加'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                食材名 *
              </label>
              <input
                type="text"
                name="ingredient_name"
                value={formData.ingredient_name}
                onChange={handleInputChange}
                className="input w-full"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  数量 *
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  className="input w-full"
                  min="0"
                  step="0.1"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  単位
                </label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleInputChange}
                  className="input w-full"
                >
                  <option value="pieces">個</option>
                  <option value="g">g</option>
                  <option value="kg">kg</option>
                  <option value="ml">ml</option>
                  <option value="l">l</option>
                  <option value="pack">パック</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                消費期限
              </label>
              <input
                type="date"
                name="expiry_date"
                value={formData.expiry_date}
                onChange={handleInputChange}
                className="input w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                カテゴリ
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="input w-full"
              >
                <option value="">選択してください</option>
                <option value="生鮮食品">生鮮食品</option>
                <option value="冷凍食品">冷凍食品</option>
                <option value="調味料">調味料</option>
                <option value="穀物">穀物</option>
                <option value="乳製品">乳製品</option>
                <option value="その他">その他</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                メモ
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                className="input w-full"
                rows={2}
              />
            </div>
            
            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                className="btn btn-primary flex-1"
                disabled={isLoading}
              >
                {isLoading ? '保存中...' : (item ? '更新' : '追加')}
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="btn btn-outline flex-1"
                disabled={isLoading}
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