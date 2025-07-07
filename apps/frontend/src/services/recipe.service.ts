import { supabase } from './supabase'
import type { Recipe, RecipeGenerationRequest, CookingHistory } from '../types/recipe.types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

class RecipeService {
  async getRecipes(): Promise<Recipe[]> {
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch recipes: ${error.message}`)
    }

    return data || []
  }

  async getRecipe(id: string): Promise<Recipe> {
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      throw new Error(`Failed to fetch recipe: ${error.message}`)
    }

    return data
  }

  async generateRecipe(params: RecipeGenerationRequest): Promise<Recipe> {
    const session = await supabase.auth.getSession()
    const token = session.data.session?.access_token

    if (!token) {
      throw new Error('Authentication required')
    }

    const response = await fetch(`${API_URL}/api/recipes/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(params),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || 'Recipe generation failed')
    }

    const result = await response.json()
    return result.data
  }

  async rateRecipe(recipeId: string, rating: {
    rating: number
    notes?: string
    modifications?: string
    actual_cost?: number
    would_cook_again?: boolean
  }): Promise<CookingHistory> {
    const session = await supabase.auth.getSession()
    const token = session.data.session?.access_token

    if (!token) {
      throw new Error('Authentication required')
    }

    const response = await fetch(`${API_URL}/api/recipes/${recipeId}/rating`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(rating),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || 'Rating failed')
    }

    const result = await response.json()
    return result.data
  }

  async deleteRecipe(id: string): Promise<void> {
    const { error } = await supabase
      .from('recipes')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to delete recipe: ${error.message}`)
    }
  }
}

export const recipeService = new RecipeService()