import { Router } from 'express'
import { listLibraryParts } from '../controllers/partLibrary.controller.js'
import { asyncHandler } from '../utils/errors.js'

export const partLibraryRouter = Router()

partLibraryRouter.get('/parts-library', asyncHandler(listLibraryParts))
