import { supabase } from '../config/supabase.js'
import { geminiService } from './gemini.service.js'
import { imageProcessor } from './image-processor.service.js'

interface SaleProcessingResult {
  success: boolean
  saleId: string
  data: any
  processingMethod: string
}

class SaleProcessorService {
  async processImage(imageBuffer: Buffer, userId: string): Promise<SaleProcessingResult> {
    try {
      // Step 1: Image preprocessing
      const processedImage = await imageProcessor.preprocess(imageBuffer)

      // Step 2: Upload to Supabase Storage
      const imageUrl = await this.uploadImage(processedImage, userId)

      // Step 3: For now, use Gemini Vision API directly since we don't have Google Cloud Vision set up
      // In production, you would first try OCR then fallback to Vision
      let structuredData: any
      let processingMethod: string

      try {
        // Convert to base64 for Gemini Vision API
        const imageBase64 = processedImage.toString('base64')
        structuredData = await geminiService.processImageDirectly(imageBase64)
        processingMethod = 'gemini_vision_direct'
      } catch (error) {
        console.error('Gemini vision processing failed:', error)
        throw new Error(`AI processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }

      // Step 4: Save to database
      const savedData = await this.saveSaleData({
        userId,
        imageUrl,
        ocrText: null, // Would be populated if using OCR first
        structuredData,
        processingMethod,
      })

      return {
        success: true,
        saleId: savedData.id,
        data: structuredData,
        processingMethod,
      }
    } catch (error) {
      console.error('Sale processing pipeline failed:', error)
      throw new Error(`Processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private async uploadImage(buffer: Buffer, userId: string): Promise<string> {
    const fileName = `${userId}/${Date.now()}.jpg`

    // Check if bucket exists, create if not
    const { error: bucketError } = await supabase.storage.getBucket('sale-images')
    if (bucketError && bucketError.message.includes('The resource was not found')) {
      console.log('Creating sale-images bucket...')
      const { error: createError } = await supabase.storage.createBucket('sale-images', {
        public: false,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        fileSizeLimit: 10485760 // 10MB
      })
      
      if (createError) {
        console.error('Failed to create bucket:', createError)
        throw new Error(`Bucket creation failed: ${createError.message}`)
      }
    }

    const { data, error } = await supabase.storage
      .from('sale-images')
      .upload(fileName, buffer, {
        contentType: 'image/jpeg',
        upsert: false,
      })

    if (error) {
      throw new Error(`Image upload failed: ${error.message}`)
    }

    return data.path
  }

  private validateAndFormatDate(dateString: string | undefined): string | null {
    if (!dateString) return null
    
    // YYYY-MM-DD形式のテンプレートをチェック
    if (dateString.includes('YYYY') || dateString.includes('MM') || dateString.includes('DD')) {
      console.warn('Invalid date template detected:', dateString)
      return null
    }
    
    // 日付の妥当性をチェック
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      console.warn('Invalid date format:', dateString)
      return null
    }
    
    // YYYY-MM-DD形式で返す
    return date.toISOString().split('T')[0]
  }

  private async saveSaleData(params: {
    userId: string
    imageUrl: string
    ocrText: string | null
    structuredData: any
    processingMethod: string
  }) {
    // 日付の検証と修正
    const validatedStartDate = this.validateAndFormatDate(params.structuredData.sale_period?.start)
    const validatedEndDate = this.validateAndFormatDate(params.structuredData.sale_period?.end)
    
    // 日付が無効な場合のフォールバック
    const fallbackStartDate = validatedStartDate || new Date().toISOString().split('T')[0]
    const fallbackEndDate = validatedEndDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    
    console.log('Date validation results:', {
      original: params.structuredData.sale_period,
      validated: { start: fallbackStartDate, end: fallbackEndDate }
    })

    const { data, error } = await supabase
      .from('sales_info')
      .insert({
        user_id: params.userId,
        image_url: params.imageUrl,
        ocr_text: params.ocrText,
        structured_data: {
          ...params.structuredData,
          sale_period: {
            start: fallbackStartDate,
            end: fallbackEndDate
          }
        },
        processing_status: 'structured',
        processing_method: params.processingMethod,
        store_name: params.structuredData.store_name,
        sale_period_start: fallbackStartDate,
        sale_period_end: fallbackEndDate,
        items_count: params.structuredData.items?.length || 0,
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Database save failed: ${error.message}`)
    }

    return data
  }
}

export const saleProcessorService = new SaleProcessorService()