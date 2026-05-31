import { registerSchema, loginSchema } from '../validation/auth.schema.js'
import { register, login } from '../services/authService.js'
import { userRepository } from '../repositories/userRepository.js'
import { serializeUser } from '../utils/serializeUser.js'
import { AppError, ValidationError } from '../utils/errors.js'

const validate = (schema, value) => {
  const parsed = schema.safeParse(value)
  if (!parsed.success) {
    throw new ValidationError(
      'Invalid request payload',
      parsed.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message
      }))
    )
  }
  return parsed.data
}

/** POST /auth/register — create an account and return a token. */
export const registerController = async (req, res) => {
  const data = validate(registerSchema, req.body)
  const { user, token } = await register(data)
  res.status(201).json({ success: true, data: { user, token } })
}

/** POST /auth/login — authenticate and return a token. */
export const loginController = async (req, res) => {
  const data = validate(loginSchema, req.body)
  const { user, token } = await login(data)
  res.json({ success: true, data: { user, token } })
}

/** GET /auth/me — return the currently authenticated user. */
export const meController = async (req, res) => {
  const user = await userRepository.findById(req.user.id)
  if (!user) throw new AppError('User not found', 404)
  res.json({ success: true, data: serializeUser(user) })
}
