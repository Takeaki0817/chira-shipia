import { Router } from 'express'
import { supabase } from '../config/supabase.js'
import { authenticateUser, AuthenticatedRequest } from '../middleware/auth.js'
import { ValidationError } from '../middleware/errorHandler.js'

const router = Router()

router.use(authenticateUser)

router.get('/', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { data, error } = await supabase
      .from('inventory')
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

router.post('/', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { ingredient_name, quantity, unit, expiry_date, category, notes } = req.body

    if (!ingredient_name || !quantity) {
      throw new ValidationError('Required fields missing: ingredient_name, quantity')
    }

    const { data, error } = await supabase
      .from('inventory')
      .insert({
        user_id: req.user.id,
        ingredient_name,
        quantity: parseFloat(quantity),
        unit: unit || 'pieces',
        expiry_date,
        category,
        notes,
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

router.put('/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params
    const { ingredient_name, quantity, unit, expiry_date, category, notes } = req.body

    const { data, error } = await supabase
      .from('inventory')
      .update({
        ingredient_name,
        quantity: quantity ? parseFloat(quantity) : undefined,
        unit,
        expiry_date,
        category,
        notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single()

    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }

    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Inventory item not found',
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

router.delete('/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params

    const { error } = await supabase
      .from('inventory')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id)

    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }

    res.json({
      success: true,
      message: 'Inventory item deleted',
    })
  } catch (error) {
    next(error)
  }
})

router.get('/expiring', async (req: AuthenticatedRequest, res, next) => {
  try {
    const daysAhead = parseInt(req.query.days as string) || 7
    const expiryThreshold = new Date()
    expiryThreshold.setDate(expiryThreshold.getDate() + daysAhead)

    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .eq('user_id', req.user.id)
      .lte('expiry_date', expiryThreshold.toISOString().split('T')[0])
      .order('expiry_date', { ascending: true })

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

export default router