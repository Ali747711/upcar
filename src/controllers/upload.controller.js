import { uploadImage, deleteImage } from '../services/uploadService.js'
import { ValidationError } from '../utils/errors.js'

/**
 * POST /upload  (multipart/form-data, field name: "image")
 * Uploads a single image to Cloudinary and returns the hosted URL + publicId.
 * The frontend then saves that URL as a part's `imageUrl`.
 */
export const uploadImageController = async (req, res) => {
  if (!req.file) {
    throw new ValidationError('No image file provided (expected field "image")')
  }

  const result = await uploadImage(req.file.buffer)

  res.status(201).json({ success: true, data: result })
}

/**
 * DELETE /upload/:publicId
 * Deletes an uploaded image from Cloudinary by its public id. Used when a
 * part row is removed so orphaned images don't accumulate on the account.
 */
export const deleteImageController = async (req, res) => {
  const publicId = req.query.publicId
  if (!publicId || typeof publicId !== 'string') {
    throw new ValidationError('publicId query param is required')
  }

  await deleteImage(publicId)

  res.json({ success: true })
}
