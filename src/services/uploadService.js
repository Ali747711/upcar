import { v2 as cloudinary } from 'cloudinary'

import { config, isCloudinaryConfigured } from '../config/env.js'
import { AppError } from '../utils/errors.js'

let configured = false

/** Configure the Cloudinary SDK once, on first use. */
const ensureConfigured = () => {
  if (!isCloudinaryConfigured) {
    throw new AppError(
      'Image uploads are not configured (missing Cloudinary credentials)',
      503
    )
  }
  if (!configured) {
    cloudinary.config({
      cloud_name: config.cloudinary.cloudName,
      api_key: config.cloudinary.apiKey,
      api_secret: config.cloudinary.apiSecret,
      secure: true
    })
    configured = true
  }
}

/**
 * Upload an image buffer to Cloudinary. Images are constrained to a sane max
 * size and auto-optimized (format + quality) so PDFs stay light and render
 * fast — satisfying the "optimize/constrain image sizes" rule.
 *
 * @param {Buffer} buffer
 * @returns {Promise<{ url: string, publicId: string, width: number, height: number }>}
 */
export const uploadImage = (buffer) => {
  ensureConfigured()

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: config.cloudinary.folder,
        resource_type: 'image',
        transformation: [
          { width: 800, height: 800, crop: 'limit' },
          { quality: 'auto:good', fetch_format: 'auto' }
        ]
      },
      (error, result) => {
        if (error || !result) {
          reject(new AppError('Failed to upload image', 502, error?.message))
          return
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height
        })
      }
    )
    stream.end(buffer)
  })
}

/** Delete an uploaded image by its Cloudinary public id (best-effort). */
export const deleteImage = async (publicId) => {
  ensureConfigured()
  await cloudinary.uploader.destroy(publicId)
}
