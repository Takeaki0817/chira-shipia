export interface SaleItem {
  name: string
  original_price: number | null
  sale_price: number | null
  discount_rate: number | null
  category: string
  unit?: string
  price_proximity?: string // 価格との位置関係
  group_relevance?: string // このグループに属する理由
  cross_sell_potential?: string // 関連商品との組み合わせ可能性
}

export interface SaleGroup {
  group_name: string
  group_price: number | null
  boundary_description?: string // 境界線の特徴
  price_source?: string // 価格の根拠
  group_type?: string // グループの種類
  semantic_meaning?: string // グルーピングの意味的解釈
  boundary_type?: string // 境界線の種類
  hierarchy_level?: string // 階層レベル
  sale_strategy?: string // セール戦略
  target_customer?: string // ターゲット客層
  contextual_info?: string // コンテキスト情報
  items: SaleItem[]
}

export interface SaleStructuredData {
  store_name: string
  sale_period: {
    start: string
    end: string
  }
  layout_analysis?: string // レイアウト分析結果
  hierarchy_structure?: string // 階層構造
  items?: SaleItem[] // 後方互換性のため
  groups?: SaleGroup[] // 新しいグルーピング形式
}

export interface SalesInfo {
  id: string
  user_id: string
  image_url: string
  ocr_text?: string
  structured_data?: SaleStructuredData
  processing_status: 'uploaded' | 'ocr_processing' | 'ai_processing' | 'structured' | 'error'
  processing_method?: string
  store_name?: string
  sale_period_start?: string
  sale_period_end?: string
  items_count: number
  error_message?: string
  created_at: string
  updated_at: string
}

export interface ProcessSaleResponse {
  success: boolean
  data: {
    sale_id: string
    store_name: string
    items_count: number
    structured_data: SaleStructuredData
    processing_method: string
  }
}