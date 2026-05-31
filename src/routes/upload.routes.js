import { Router } from 'express'

import {
  uploadImageController,
  deleteImageController,
} from '../controllers/upload.controller.js'
import { uploadSingleImage } from '../middleware/upload.js'
import { asyncHandler } from '../utils/errors.js'

export const uploadRouter = Router()

uploadRouter.post('/upload', uploadSingleImage, asyncHandler(uploadImageController))
uploadRouter.delete('/upload', asyncHandler(deleteImageController))
