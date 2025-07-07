import { Router } from 'express'
import { supabase } from '../config/supabase.js'
import { authenticateUser, AuthenticatedRequest } from '../middleware/auth.js'

const router = Router()

router.use(authenticateUser)

router.get('/', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }

    res.json({
      success: true,
      data,
    })
  } catch (error) {
    next(error)
  }
})

router.post('/generate', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { difficulty, cookingTime, servings, budget, allergies, dietaryRestrictions } = req.body

    // Get user's inventory
    const { data: inventory, error: inventoryError } = await supabase
      .from('inventory')
      .select('ingredient_name, quantity, unit, expiry_date')
      .eq('user_id', req.user.id)

    if (inventoryError) {
      throw new Error(`Failed to fetch inventory: ${inventoryError.message}`)
    }

    // Get active sale items
    const { data: salesData, error: salesError } = await supabase
      .from('sales_info')
      .select('structured_data')
      .eq('user_id', req.user.id)
      .eq('processing_status', 'structured')
      .gte('sale_period_end', new Date().toISOString().split('T')[0])

    if (salesError) {
      throw new Error(`Failed to fetch sales: ${salesError.message}`)
    }

    // Extract sale items from structured data
    const saleItems = salesData
      .flatMap(sale => sale.structured_data?.items || [])
      .slice(0, 20) // Limit to top 20 sale items

    const { geminiService } = await import('../services/gemini.service.js')
    
    const recipe = await geminiService.generateRecipe({
      inventory: inventory || [],
      saleItems: saleItems || [],
      difficulty: parseInt(difficulty) || 3,
      cookingTime: parseInt(cookingTime) || 30,
      servings: parseInt(servings) || 2,
      budget: parseInt(budget) || 1000,
      allergies: allergies || [],
      dietaryRestrictions: dietaryRestrictions || [],
    })

    // Save generated recipe to database
    const { data: savedRecipe, error: saveError } = await supabase
      .from('recipes')
      .insert({
        user_id: req.user.id,
        title: recipe.title,
        description: recipe.description,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        difficulty_level: recipe.difficulty,
        cooking_time: recipe.cooking_time,
        servings: recipe.servings,
        total_cost: recipe.total_cost,
        sale_savings: recipe.sale_savings,
        categories: recipe.categories,
        tags: recipe.tags,
        nutritional_info: recipe.nutritional_info,
        ai_generated: true,
        generation_prompt: `difficulty:${difficulty}, time:${cookingTime}, servings:${servings}, budget:${budget}`,
      })
      .select()
      .single()

    if (saveError) {
      throw new Error(`Failed to save recipe: ${saveError.message}`)
    }

    res.json({
      success: true,
      data: savedRecipe,
    })
  } catch (error) {
    next(error)
  }
})

router.get('/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params

    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single()

    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }

    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Recipe not found',
      })
    }

    res.json({
      success: true,
      data,
    })
  } catch (error) {
    next(error)
  }
})

router.post('/:id/rating', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params
    const { rating, notes, modifications, actual_cost, would_cook_again } = req.body

    const { data, error } = await supabase
      .from('cooking_history')
      .insert({
        user_id: req.user.id,
        recipe_id: id,
        rating: parseInt(rating),
        notes,
        modifications,
        actual_cost: actual_cost ? parseFloat(actual_cost) : null,
        would_cook_again,
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }

    res.status(201).json({
      success: true,
      data,
    })
  } catch (error) {
    next(error)
  }
})

export default router