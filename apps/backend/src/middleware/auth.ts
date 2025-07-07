import { Request, Response, NextFunction } from 'express'
import { supabase } from '../config/supabase.js'
import { AppError } from './errorHandler.js'

export interface AuthenticatedRequest extends Request {
  user: {
    id: string
    email: string
  }
}

export async function authenticateUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Authentication required', 401, 'AUTH_REQUIRED')
    }

    const token = authHeader.split(' ')[1]
    
    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    if (error || !user) {
      throw new AppError('Invalid token', 401, 'INVALID_TOKEN')
    }

    ;(req as AuthenticatedRequest).user = {
      id: user.id,
      email: user.email || '',
    }

    next()
  } catch (error) {
    next(error)
  }
}