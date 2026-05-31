import multer from 'multer'

import { config } from '../config/env.js'
import { ValidationError } from '../utils/errors.js'

// Accept any image/* MIME type (jpeg, png, webp, gif, avif, heic, tiff, bmp, svg, etc.)
const isImageMime = (mime) => mime.startsWith('image/')

// Keep the file in memory so it can be streamed straight to Cloudinary without
// ever touching the local disk.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: config.maxUploadBytes, files: 1 },
  fileFilter: (req, file, cb) => {
    if (isImageMime(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new ValidationError(`Unsupported image type: ${file.mimetype}`))
    }
  }
})

/**
 * Middleware that accepts a single `image` field and maps multer's own errors
 * (e.g. file too large) to our ValidationError so the central handler returns
 * a clean 400.
 */
export const uploadSingleImage = (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (!err) return next()

    if (err instanceof multer.MulterError) {
      const message =
        err.code === 'LIMIT_FILE_SIZE'
          ? `Image exceeds the maximum size of ${config.maxUploadBytes} bytes`
          : err.message
      return next(new ValidationError(message))
    }
    return next(err)
  })
}
