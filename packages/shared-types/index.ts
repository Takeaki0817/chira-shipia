export interface APIResponse<T> {
  success: true
  data: T
  message?: string
}

export interface APIError {
  success: false
  error: string
  details?: string
  code?: string
  field?: string
}

export interface InventoryItem {
  id: string
  user_id: string
  ingredient_name: string
  quantity: number
  unit: string
  expiry_date?: string
  purchase_date?: string
  category?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface CreateInventoryItem {
  ingredient_name: string
  quantity: number
  unit?: string
  expiry_date?: string
  category?: string
  notes?: string
}

export interface SaleItem {
  name: string
  original_price: number
  sale_price: number
  discount_rate: number
  category: string
}

export interface SaleStructureData {
  store_name: string
  sale_period: {
    start: string
    end: string
  }
  items: SaleItem[]
}

export interface SalesInfo {
  id: string
  user_id: string
  image_url: string
  ocr_text?: string
  structured_data?: SaleStructureData
  processing_status: 'uploaded' | 'ocr_processing' | 'ai_processing' | 'structured' | 'error'
  processing_method?: 'ocr_ai' | 'gemini_vision_fallback'
  store_name?: string
  sale_period_start?: string
  sale_period_end?: string
  items_count: number
  error_message?: string
  created_at: string
  updated_at: string
}

export interface Recipe {
  id: string
  user_id: string
  title: string
  description?: string
  ingredients: RecipeIngredient[]
  instructions: string[]
  difficulty_level: number
  cooking_time?: number
  servings: number
  total_cost?: number
  sale_savings?: number
  categories?: string[]
  tags?: string[]
  nutritional_info?: NutritionalInfo
  ai_generated: boolean
  generation_prompt?: string
  created_at: string
}

export interface RecipeIngredient {
  name: string
  amount: string
  source: '冷蔵庫' | 'セール商品' | '追加購入'
  cost?: number
}

export interface NutritionalInfo {
  calories_per_serving?: string
  protein?: string
  carbs?: string
  fat?: string
}

export interface RecipeGenerationParams {
  inventory: InventoryItem[]
  saleItems: SaleItem[]
  difficulty: number
  cookingTime: number
  servings: number
  budget: number
  allergies: string[]
  dietaryRestrictions: string[]
}

export interface GeneratedRecipe {
  title: string
  description: string
  difficulty: number
  cooking_time: number
  servings: number
  total_cost: number
  sale_savings: number
  ingredients: RecipeIngredient[]
  instructions: string[]
  tips: string[]
  nutritional_info: NutritionalInfo
  categories: string[]
  tags: string[]
}

export interface CookingHistory {
  id: string
  user_id: string
  recipe_id: string
  cooked_at: string
  rating?: number
  notes?: string
  modifications?: string
  actual_cost?: number
  would_cook_again?: boolean
}

export interface UserProfile {
  id: string
  display_name?: string
  allergies: string[]
  taste_preferences: Record<string, any>
  dietary_restrictions: string[]
  cooking_skill_level: number
  created_at: string
  updated_at: string
}