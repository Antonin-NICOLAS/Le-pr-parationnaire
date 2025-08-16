import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import z from 'zod'
dotenv.config()

// Controllers
import {
  refreshToken,
  checkAuth,
  checkAuthStatus,
  login,
  logout,
  register,
  emailVerification,
  resendVerificationEmail,
} from '../controllers/AuthController.js'

// Middlewares
import { authenticateLean } from '../middlewares/VerifyAuth.js'
import { validate } from '../middlewares/Validate.js'
import {
  registrationSchema,
  loginSchema,
  emailVerificationSchema,
  emailSchema,
} from '../helpers/Validators.js'
import {
  NormalRL,
  StrictRL,
  refreshTokenRL,
} from '../middlewares/RateLimiter.js'

// Router
const router = express.Router()

// Middleware
router.use(
  cors({
    credentials: true,
    origin: process.env.FRONTEND_SERVER,
  }),
)

// Routes
router.get('/profile', authenticateLean, checkAuth)
router.post('/refresh', refreshTokenRL, refreshToken)

// Authentication Flow
router.get('/status', NormalRL, checkAuthStatus)
router.post('/login', NormalRL, validate(loginSchema), login)
router.post('/logout', logout)

// Registration Flow
router.post('/register', NormalRL, validate(registrationSchema), register)
router.post(
  '/verify-email',
  NormalRL,
  validate(emailVerificationSchema),
  emailVerification,
)
router.post(
  '/resend-verification-email',
  StrictRL,
  validate(z.object({ email: emailSchema })),
  resendVerificationEmail,
)

export default router
