import { Router } from 'express'
import { supabase } from '../config/supabase.js'
import { authenticateUser, AuthenticatedRequest } from '../middleware/auth.js'

const router = Router()

router.post('/signup', async (req, res, next) => {
  try {
    const { email, password, displayName } = req.body

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
        },
      },
    })

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message,
      })
    }

    res.status(201).json({
      success: true,
      data: {
        user: data.user,
        session: data.session,
      },
    })
  } catch (error) {
    next(error)
  }
})

router.post('/signin', async (req, res, next) => {
  try {
    const { email, password } = req.body

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message,
      })
    }

    res.json({
      success: true,
      data: {
        user: data.user,
        session: data.session,
      },
    })
  } catch (error) {
    next(error)
  }
})

router.post('/signout', authenticateUser, async (req, res, next) => {
  try {
    const { error } = await supabase.auth.signOut()

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message,
      })
    }

    res.json({
      success: true,
      message: 'Signed out successfully',
    })
  } catch (error) {
    next(error)
  }
})

router.get('/me', authenticateUser, (req: AuthenticatedRequest, res) => {
  res.json({
    success: true,
    data: {
      user: req.user,
    },
  })
})

export default router