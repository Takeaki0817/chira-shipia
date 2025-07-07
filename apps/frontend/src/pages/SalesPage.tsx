import { useState, useRef } from 'react'
import { Upload, Image as ImageIcon, ShoppingCart, Calendar, Trash2, Eye } from 'lucide-react'
import { useSales } from '../hooks/useSales'
import type { SalesInfo } from '../types/sales.types'

export default function SalesPage() {
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedSale, setSelectedSale] = useState<SalesInfo | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  
  const { 
    sales, 
    isLoading, 
    uploadAndProcess, 
    deleteSale,
    isUploading,
    isDeleting,
    uploadError 
  } = useSales()

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('ja-JP', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dateString
    }
  }

  const handleUpload = () => {
    setShowUploadModal(true)
  }

  const handleViewDetail = (sale: SalesInfo) => {
    setSelectedSale(sale)
    setShowDetailModal(true)
  }

  const handleDeleteSale = async (id: string) => {
    if (confirm('このセール情報を削除しますか？')) {
      try {
        await deleteSale(id)
      } catch (error) {
        console.error('Delete failed:', error)
      }
    }
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
        <h1 className="text-3xl font-bold text-gray-900">セール情報</h1>
        <button 
          onClick={handleUpload}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Upload className="h-4 w-4" />
          <span>チラシをアップロード</span>
        </button>
      </div>

      {/* Sales Grid */}
      {sales.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sales.map((sale) => (
            <div key={sale.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {sale.store_name || '店舗名不明'}
                  </h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <ShoppingCart className="h-4 w-4" />
                      <span>{sale.items_count}商品</span>
                    </div>
                    {sale.sale_period_start && (
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(sale.sale_period_start)}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleViewDetail(sale)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                    title="詳細を見る"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteSale(sale.id)}
                    className="p-1 text-gray-400 hover:text-red-600"
                    disabled={isDeleting}
                    title="削除"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="text-xs text-gray-500">
                処理方法: {sale.processing_method || '不明'}
              </div>
              <div className="text-xs text-gray-500">
                アップロード: {formatDate(sale.created_at)}
              </div>
              
              {sale.processing_status !== 'structured' && (
                <div className="mt-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                  処理中...
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <ImageIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">セール情報がありません</p>
          <p className="text-sm text-gray-400 mb-6">
            チラシをアップロードして商品情報を取得しましょう
          </p>
          <button 
            onClick={handleUpload}
            className="btn btn-primary"
          >
            チラシをアップロード
          </button>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadModal
          onClose={() => setShowUploadModal(false)}
          onUpload={uploadAndProcess}
          isUploading={isUploading}
          error={uploadError}
        />
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedSale && (
        <SaleDetailModal
          sale={selectedSale}
          onClose={() => {
            setShowDetailModal(false)
            setSelectedSale(null)
          }}
        />
      )}
    </div>
  )
}

interface UploadModalProps {
  onClose: () => void
  onUpload: (file: File) => Promise<any>
  isUploading: boolean
  error: Error | null
}

function UploadModal({ onClose, onUpload, isUploading, error }: UploadModalProps) {
  const [dragOver, setDragOver] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    const imageFile = files.find(file => file.type.startsWith('image/'))
    
    if (imageFile) {
      setSelectedFile(imageFile)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return
    
    try {
      await onUpload(selectedFile)
      onClose()
    } catch (error) {
      console.error('Upload failed:', error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            セールチラシをアップロード
          </h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
              {error.message}
            </div>
          )}
          
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragOver ? 'border-primary-400 bg-primary-50' : 'border-gray-300'
            }`}
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault()
              setDragOver(true)
            }}
            onDragLeave={() => setDragOver(false)}
          >
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            
            {selectedFile ? (
              <div>
                <p className="text-sm font-medium text-gray-900 mb-2">
                  選択済み: {selectedFile.name}
                </p>
                <p className="text-xs text-gray-500 mb-4">
                  サイズ: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            ) : (
              <div>
                <p className="text-gray-600 mb-2">
                  画像をドラッグ&ドロップまたは
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-primary-600 hover:text-primary-500"
                >
                  ファイルを選択
                </button>
              </div>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
          
          <div className="flex space-x-3 pt-6">
            <button
              onClick={handleUpload}
              className="btn btn-primary flex-1"
              disabled={!selectedFile || isUploading}
            >
              {isUploading ? 'アップロード中...' : 'アップロード'}
            </button>
            <button
              onClick={onClose}
              className="btn btn-outline flex-1"
              disabled={isUploading}
            >
              キャンセル
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

interface SaleDetailModalProps {
  sale: SalesInfo
  onClose: () => void
}

function SaleDetailModal({ sale, onClose }: SaleDetailModalProps) {
  const formatCurrency = (amount: number | null | undefined) => {
    if (amount == null || typeof amount !== 'number') {
      return '¥0'
    }
    return `¥${amount.toLocaleString()}`
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return dateString // If parsing fails, return original string
    }
  }

  const formatSalePeriod = (start: string, end: string) => {
    if (start === end) {
      return `${formatDate(start)}（1日限り）`
    }
    return `${formatDate(start)} 〜 ${formatDate(end)}`
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {sale.store_name || '店舗名不明'} - セール情報
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          
          {sale.structured_data ? (
            <div className="space-y-6">
              {/* Sale Period */}
              <div>
                <h3 className="font-medium text-gray-900 mb-2">セール期間</h3>
                <p className="text-gray-600 text-lg">
                  {formatSalePeriod(
                    sale.structured_data.sale_period.start,
                    sale.structured_data.sale_period.end
                  )}
                </p>
              </div>
              
              {/* Layout Analysis & Hierarchy */}
              <div className="mb-6 space-y-4">
                {sale.structured_data.layout_analysis && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">📊 レイアウト分析</h3>
                    <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
                      {sale.structured_data.layout_analysis}
                    </p>
                  </div>
                )}
                
                {sale.structured_data.hierarchy_structure && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">🏗️ 階層構造</h3>
                    <p className="text-sm text-gray-600 bg-green-50 p-3 rounded-lg border-l-4 border-green-400">
                      {sale.structured_data.hierarchy_structure}
                    </p>
                  </div>
                )}
              </div>

              {/* Items - グルーピング対応 */}
              <div>
                {sale.structured_data.groups && sale.structured_data.groups.length > 0 ? (
                  <div className="space-y-6">
                    <h3 className="font-medium text-gray-900 mb-4">
                      商品一覧（{sale.structured_data.groups.reduce((total, group) => total + group.items.length, 0)}件）
                    </h3>
                    {sale.structured_data.groups.map((group, groupIndex) => {
                      // 階層レベルに応じたスタイリング
                      const hierarchyStyle = group.hierarchy_level === 'メインカテゴリ' 
                        ? 'border-4 border-solid border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100'
                        : group.hierarchy_level === 'サブカテゴリ'
                        ? 'border-2 border-dashed border-green-400 bg-gradient-to-r from-green-50 to-green-100'
                        : 'border-2 border-dotted border-gray-400 bg-gradient-to-r from-gray-50 to-gray-100';

                      // グループタイプに応じたアイコン
                      const getGroupIcon = (type: string) => {
                        if (type?.includes('商品カテゴリ系')) return '📦';
                        if (type?.includes('価格帯系')) return '💰';
                        if (type?.includes('期間限定系')) return '⏰';
                        if (type?.includes('数量系')) return '📊';
                        if (type?.includes('ブランド系')) return '🏷️';
                        if (type?.includes('店舗レイアウト系')) return '🏪';
                        return '📋';
                      };

                      return (
                        <div key={groupIndex} className={`rounded-lg p-4 ${hierarchyStyle} shadow-md`}>
                          <div className="mb-4">
                            {/* グループヘッダー */}
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex items-center space-x-2">
                                <span className="text-2xl">{getGroupIcon(group.group_type || '')}</span>
                                <h4 className="font-bold text-gray-800 text-lg">{group.group_name}</h4>
                              </div>
                              {group.group_price && (
                                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium border border-blue-300 shadow-sm">
                                  この枠内全品 {formatCurrency(group.group_price)}
                                </span>
                              )}
                            </div>

                            {/* 意味的解釈 */}
                            {group.semantic_meaning && (
                              <div className="mb-3">
                                <p className="text-sm text-gray-700 bg-white bg-opacity-70 p-2 rounded-md border border-gray-200">
                                  <strong>💡 グルーピングの意味:</strong> {group.semantic_meaning}
                                </p>
                              </div>
                            )}
                            
                            {/* メタ情報 */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
                              {group.group_type && (
                                <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-md">
                                  🏷️ {group.group_type}
                                </span>
                              )}
                              {group.hierarchy_level && (
                                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-md">
                                  📊 {group.hierarchy_level}
                                </span>
                              )}
                              {group.boundary_type && (
                                <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md">
                                  ➖ {group.boundary_type}
                                </span>
                              )}
                              {group.sale_strategy && (
                                <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-md">
                                  📈 {group.sale_strategy}
                                </span>
                              )}
                              {group.target_customer && (
                                <span className="bg-pink-100 text-pink-700 px-2 py-1 rounded-md">
                                  👥 {group.target_customer}
                                </span>
                              )}
                              {group.contextual_info && (
                                <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-md">
                                  ℹ️ {group.contextual_info}
                                </span>
                              )}
                            </div>
                          </div>
                        <div className="space-y-2">
                          {group.items.map((item, itemIndex) => (
                            <div key={itemIndex} className="bg-white border border-gray-200 rounded-lg p-3">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <h5 className="font-medium text-gray-900 mb-2">{item.name}</h5>
                                  
                                  {/* 基本情報 */}
                                  <div className="flex items-center flex-wrap gap-2 text-sm text-gray-600 mb-2">
                                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                                      📦 {item.category}
                                    </span>
                                    {item.unit && (
                                      <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                                        📏 {item.unit}
                                      </span>
                                    )}
                                    {item.price_proximity && (
                                      <span className={`px-2 py-1 rounded text-xs ${
                                        item.price_proximity.includes('近接') || item.price_proximity.includes('同行') 
                                          ? 'bg-green-100 text-green-700'
                                          : item.price_proximity.includes('同一領域') || item.price_proximity.includes('同セクション')
                                          ? 'bg-yellow-100 text-yellow-700'
                                          : 'bg-red-100 text-red-700'
                                      }`}>
                                        📍 {item.price_proximity}
                                      </span>
                                    )}
                                  </div>

                                  {/* 詳細情報 */}
                                  <div className="space-y-1">
                                    {item.group_relevance && (
                                      <p className="text-xs text-gray-600 bg-gray-50 p-1 rounded">
                                        <strong>🎯 グループ帰属理由:</strong> {item.group_relevance}
                                      </p>
                                    )}
                                    {item.cross_sell_potential && (
                                      <p className="text-xs text-gray-600 bg-purple-50 p-1 rounded">
                                        <strong>🤝 組み合わせ提案:</strong> {item.cross_sell_potential}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="flex items-center space-x-2">
                                    <span className="text-lg font-bold text-green-600">
                                      {formatCurrency(item.sale_price || group.group_price)}
                                    </span>
                                    {item.discount_rate != null && item.discount_rate > 0 && (
                                      <span className="text-sm text-red-500 bg-red-50 px-2 py-1 rounded">
                                        {Math.round(item.discount_rate * 100)}%OFF
                                      </span>
                                    )}
                                  </div>
                                  {item.original_price != null && item.original_price > 0 && (
                                    <div className="text-sm text-gray-500 line-through">
                                      {formatCurrency(item.original_price)}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      );
                    })}
                  </div>
                ) : (
                  // 従来形式の表示
                  <div>
                    <h3 className="font-medium text-gray-900 mb-4">
                      商品一覧 ({sale.structured_data.items?.length || 0}件)
                    </h3>
                    <div className="space-y-3">
                      {sale.structured_data.items?.map((item, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-3">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{item.name}</h4>
                              <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <span>{item.category}</span>
                                {item.unit && (
                                  <>
                                    <span>•</span>
                                    <span className="bg-gray-100 px-2 py-1 rounded text-xs">{item.unit}</span>
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center space-x-2">
                                <span className="text-lg font-bold text-green-600">
                                  {formatCurrency(item.sale_price)}
                                </span>
                                {item.discount_rate != null && item.discount_rate > 0 && (
                                  <span className="text-sm text-red-500 bg-red-50 px-2 py-1 rounded">
                                    {Math.round(item.discount_rate * 100)}%OFF
                                  </span>
                                )}
                              </div>
                              {item.original_price != null && item.original_price > 0 && (
                                <div className="text-sm text-gray-500 line-through">
                                  {formatCurrency(item.original_price)}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )) || []}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">構造化データがありません</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}