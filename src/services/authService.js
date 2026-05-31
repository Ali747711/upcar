import bcrypt from 'bcryptjs'

import { userRepository } from '../repositories/userRepository.js'
import { signToken } from '../utils/jwt.js'
import { config } from '../config/env.js'
import { AppError } from '../utils/errors.js'

/**
 * Register a new user. Fails if the email is already taken. Returns the public
 * user object plus a signed JWT.
 */
export const register = async ({ email, password, name }) => {
  const existing = await userRepository.findByEmail(email)
  if (existing) {
    throw new AppError('Email is already registered', 409)
  }

  const passwordHash = await bcrypt.hash(password, config.bcryptRounds)
  const user = await userRepository.create({ email, passwordHash, name })

  return { user, token: signToken(user.id) }
}

/**
 * Authenticate by email + password. Uses a generic message on failure so it
 * doesn't reveal whether the email exists.
 */
export const login = async ({ email, password }) => {
  const userDoc = await userRepository.findByEmail(email)
  if (!userDoc) {
    throw new AppError('Invalid email or password', 401)
  }

  const passwordMatches = await bcrypt.compare(password, userDoc.passwordHash)
  if (!passwordMatches) {
    throw new AppError('Invalid email or password', 401)
  }

  // toJSON strips the password hash.
  return { user: userDoc.toJSON(), token: signToken(userDoc.id) }
}
