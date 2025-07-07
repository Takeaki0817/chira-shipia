import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'

// Load environment variables first
dotenv.config()

import { logger } from './config/logger.js'
import { errorHandler } from './middleware/errorHandler.js'
import authRoutes from './routes/auth.js'
import inventoryRoutes from './routes/inventory.js'
import salesRoutes from './routes/sales.js'
import recipeRoutes from './routes/recipes.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(helmet())
app.use(cors({
  origin: [
    'http://localhost:3000',                    // ローカル開発環境
    'https://smart-recipe-frontend.vercel.app', // Vercel本番環境
    process.env.CORS_ORIGIN || 'http://localhost:3000'
  ].filter(Boolean),
  credentials: true,
}))
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

app.get('/health', (_req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

app.use('/api/auth', authRoutes)
app.use('/api/inventory', inventoryRoutes)
app.use('/api/sales', salesRoutes)
app.use('/api/recipes', recipeRoutes)

app.use(errorHandler)

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`)
  })
}

export default app