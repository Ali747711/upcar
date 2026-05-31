import { Router } from 'express'

import { generatePdfController } from '../controllers/pdf.controller.js'
import { asyncHandler } from '../utils/errors.js'

export const pdfRouter = Router()

pdfRouter.post('/generate-pdf', asyncHandler(generatePdfController))
