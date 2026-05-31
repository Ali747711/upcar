import { verifyToken } from '../utils/jwt.js'
import { AppError } from '../utils/errors.js'

/**
 * Require a valid Bearer token. On success, attaches `req.user = { id }` and
 * continues; otherwise forwards a 401 to the error handler.
 */
export const requireAuth = (req, res, next) => {
  try {
    const header = req.headers.authorization ?? ''
    const [scheme, token] = header.split(' ')

    if (scheme !== 'Bearer' || !token) {
      throw new AppError('Authentication required', 401)
    }

    const payload = verifyToken(token)
    req.user = { id: payload.sub }
    next()
  } catch (error) {
    next(error)
  }
}
