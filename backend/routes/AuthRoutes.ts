import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
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
router.post('/login', NormalRL, login)
router.post('/logout', logout)

// Registration Flow
router.post('/register', NormalRL, register)
router.post('/verify-email', NormalRL, emailVerification)
router.post('/resend-verification-email', StrictRL, resendVerificationEmail)

export default router
