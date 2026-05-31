/**
 * Application-level error carrying an HTTP status code and optional details.
 * Lets controllers/services throw meaningful errors that the central error
 * handler can translate into clean JSON responses.
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, details = undefined) {
    super(message)
    this.name = 'AppError'
    this.statusCode = statusCode
    this.details = details
  }
}

export class ValidationError extends AppError {
  constructor(message, details) {
    super(message, 400, details)
    this.name = 'ValidationError'
  }
}

/**
 * Wraps an async route handler so rejected promises are forwarded to Express'
 * error middleware instead of crashing the process.
 */
export const asyncHandler = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next)
}
