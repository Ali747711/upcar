import jwt from 'jsonwebtoken'

import { config } from '../config/env.js'
import { AppError } from './errors.js'

/** Sign a JWT whose subject is the user id. */
export const signToken = (userId) =>
  jwt.sign({ sub: String(userId) }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn
  })

/** Verify a JWT and return its payload, or throw a 401. */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.jwtSecret)
  } catch {
    throw new AppError('Invalid or expired token', 401)
  }
}
