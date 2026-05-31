import { AppError } from '../utils/errors.js'
import { isProduction } from '../config/env.js'

/** 404 handler for unmatched routes. */
export const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`
  })
}

/**
 * Central error handler. Translates thrown errors into a consistent JSON
 * envelope and avoids leaking internals (stack traces) in production.
 */
// eslint-disable-next-line no-unused-vars -- Express needs the 4-arg signature
export const errorHandler = (err, req, res, next) => {
  const statusCode = err instanceof AppError ? err.statusCode : 500

  // Server-side logging; client gets a clean message. Expected client errors
  // (4xx) log a concise line; unexpected server errors (5xx) log the stack.
  if (statusCode >= 500) {
    console.error(`[error] ${req.method} ${req.originalUrl} ->`, err)
  } else {
    console.warn(`[warn] ${req.method} ${req.originalUrl} -> ${err.message}`)
  }

  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal server error',
    ...(err.details ? { details: err.details } : {}),
    ...(isProduction ? {} : { stack: err.stack })
  })
}
