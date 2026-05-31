import express from 'express'
import cors from 'cors'

import { config, isCloudinaryConfigured } from './config/env.js'
import { authRouter } from './routes/auth.routes.js'
import { pdfRouter } from './routes/pdf.routes.js'
import { documentRouter } from './routes/document.routes.js'
import { uploadRouter } from './routes/upload.routes.js'
import { partLibraryRouter } from './routes/partLibrary.routes.js'
import { requireAuth } from './middleware/auth.js'
import { errorHandler, notFound } from './middleware/errorHandler.js'

/** Build and configure the Express application (no network binding here). */
export const createApp = () => {
  const app = express()

  app.use(cors({ origin: config.corsOrigin }))
  // PDFs can carry many rows with image URLs; allow a generous JSON body.
  app.use(express.json({ limit: '5mb' }))

  app.get('/health', (req, res) => {
    res.json({
      success: true,
      data: { status: 'ok', uploadsEnabled: isCloudinaryConfigured }
    })
  })

  // Public auth endpoints.
  app.use(authRouter)

  // Everything below requires a valid token.
  app.use(requireAuth)
  app.use(pdfRouter)
  app.use(documentRouter)
  app.use(uploadRouter)
  app.use(partLibraryRouter)

  app.use(notFound)
  app.use(errorHandler)

  return app
}
