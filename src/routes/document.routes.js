import { Router } from 'express'

import {
  createDocument,
  listDocuments,
  getDocument,
  updateDocument,
  deleteDocument,
  renderDocumentPdf
} from '../controllers/document.controller.js'
import { asyncHandler } from '../utils/errors.js'

export const documentRouter = Router()

documentRouter.post('/documents', asyncHandler(createDocument))
documentRouter.get('/documents', asyncHandler(listDocuments))
documentRouter.get('/documents/:id', asyncHandler(getDocument))
documentRouter.put('/documents/:id', asyncHandler(updateDocument))
documentRouter.delete('/documents/:id', asyncHandler(deleteDocument))
documentRouter.post('/documents/:id/pdf', asyncHandler(renderDocumentPdf))
