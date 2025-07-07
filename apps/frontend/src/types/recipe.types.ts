export interface RecipeIngredient {
  name: string
  amount: string
  source: string
  cost: number
}

export interface NutritionalInfo {
  calories_per_serving: string
  protein: string
  carbs: string
  fat: string
}

export interface Recipe {
  id: string
  user_id: string
  title: string
  description: string
  ingredients: RecipeIngredient[]
  instructions: string[]
  difficulty_level: number
  cooking_time: number
  servings: number
  total_cost: number
  sale_savings: number
  categories: string[]
  tags: string[]
  nutritional_info: NutritionalInfo
  ai_generated: boolean
  generation_prompt?: string
  created_at: string
}

export interface RecipeGenerationRequest {
  difficulty: number
  cookingTime: number
  servings: number
  budget: number
  allergies: string[]
  dietaryRestrictions: string[]
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