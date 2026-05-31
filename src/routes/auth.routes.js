import { Router } from 'express'

import {
  registerController,
  loginController,
  meController
} from '../controllers/auth.controller.js'
import { requireAuth } from '../middleware/auth.js'
import { asyncHandler } from '../utils/errors.js'

export const authRouter = Router()

authRouter.post('/auth/register', asyncHandler(registerController))
authRouter.post('/auth/login', asyncHandler(loginController))
authRouter.get('/auth/me', requireAuth, asyncHandler(meController))
