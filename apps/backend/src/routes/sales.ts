import { Router } from 'express'
import multer from 'multer'
import { supabase } from '../config/supabase.js'
import { authenticateUser, AuthenticatedRequest } from '../middleware/auth.js'

const router = Router()
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
})

router.use(authenticateUser)

router.get('/', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { data, error } = await supabase
      .from('sales_info')
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

router.post('/upload', upload.single('image'), async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image file provided',
      })
    }

    const fileName = `${req.user.id}/${Date.now()}.jpg`
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('sale-images')
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false,
      })

    if (uploadError) {
      throw new Error(`Image upload failed: ${uploadError.message}`)
    }

    const { data, error } = await supabase
      .from('sales_info')
      .insert({
        user_id: req.user.id,
        image_url: uploadData.path,
        processing_status: 'uploaded',
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

router.post('/process', upload.single('image'), async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image file provided',
      })
    }

    const { saleProcessorService } = await import('../services/sale-processor.service.js')
    
    const result = await saleProcessorService.processImage(req.file.buffer, req.user.id)

    res.json({
      success: true,
      data: {
        sale_id: result.saleId,
        store_name: result.data.store_name,
        items_count: result.data.items?.length || 0,
        structured_data: result.data,
        processing_method: result.processingMethod,
      },
    })
  } catch (error) {
    next(error)
  }
})

router.get('/:id/status', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params

    const { data, error } = await supabase
      .from('sales_info')
      .select('id, processing_status, processing_method, store_name, items_count, error_message')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single()

    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }

    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Sales info not found',
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
      .from('sales_info')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id)

    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }

    res.json({
      success: true,
      message: 'Sales info deleted',
    })
  } catch (error) {
    next(error)
  }
})

export default router