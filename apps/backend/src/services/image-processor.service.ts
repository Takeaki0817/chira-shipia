import sharp from 'sharp'

class ImageProcessorService {
  async preprocess(imageBuffer: Buffer): Promise<Buffer> {
    try {
      // Enhanced preprocessing for layout and text recognition
      const processedImage = await sharp(imageBuffer)
        .resize({ width: 1600, height: 2000, fit: 'inside' }) // Optimal size for layout recognition
        .normalize() // Normalize contrast for better text clarity
        .sharpen({ sigma: 1.2, m1: 1.0, m2: 0.3 }) // Enhanced sharpening for text and borders
        .modulate({ 
          brightness: 1.05,  // Slight brightness increase
          saturation: 0.9    // Reduce saturation to focus on text
        })
        .linear(1.1, -(128 * 0.1)) // Gamma correction for better text clarity
        .jpeg({ quality: 98 }) // Very high quality for layout preservation
        .toBuffer()

      return processedImage
    } catch (error) {
      console.error('Image preprocessing failed:', error)
      throw new Error('Image processing failed')
    }
  }

  // レイアウト特化の前処理（将来のOCR統合用）
  async preprocessForLayout(imageBuffer: Buffer): Promise<Buffer> {
    try {
      const layoutImage = await sharp(imageBuffer)
        .resize({ width: 1800, height: 2400, fit: 'inside' })
        .greyscale() // グレースケールでレイアウト境界を強調
        .normalize()
        .sharpen({ sigma: 2.0, m1: 2.0, m2: 1.0 }) // 境界線を強調
        .threshold(128) // 二値化で境界を明確に
        .jpeg({ quality: 100 })
        .toBuffer()

      return layoutImage
    } catch (error) {
      console.error('Layout preprocessing failed:', error)
      throw new Error('Layout processing failed')
    }
  }

  // 境界線強調の前処理
  async preprocessForBoundaries(imageBuffer: Buffer): Promise<Buffer> {
    try {
      const boundaryImage = await sharp(imageBuffer)
        .resize({ width: 1600, height: 2000, fit: 'inside' })
        .convolve({
          width: 3,
          height: 3,
          kernel: [-1, -1, -1, -1, 8, -1, -1, -1, -1] // エッジ検出カーネル
        })
        .normalize()
        .modulate({ 
          brightness: 1.2
        })
        .sharpen({ sigma: 1.5, m1: 2.0, m2: 0.5 })
        .jpeg({ quality: 98 })
        .toBuffer()

      return boundaryImage
    } catch (error) {
      console.error('Boundary preprocessing failed:', error)
      return this.preprocess(imageBuffer) // フォールバック
    }
  }

  async toBase64(imageBuffer: Buffer): Promise<string> {
    try {
      const processedBuffer = await this.preprocess(imageBuffer)
      return processedBuffer.toString('base64')
    } catch (error) {
      console.error('Base64 conversion failed:', error)
      throw new Error('Base64 conversion failed')
    }
  }
}

export const imageProcessor = new ImageProcessorService()