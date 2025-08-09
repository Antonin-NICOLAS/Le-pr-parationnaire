import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()

// Controllers
import {
  register,
  checkAuthStatus,
  login,
  logout,
  checkSession,
  forgotPassword,
  resendForgotPassword,
  resetPassword,
  verifyEmail,
  resendVerificationEmail,
  getActiveSessions,
  revokeSession,
  revokeAllSessions,
} from '../controllers/AuthController.js'

// Middlewares
import { authenticate } from '../middlewares/VerifyAuth.js'
import { rateLimiterMiddleware } from '../middlewares/RateLimiter.js'

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
router.get('/profile', authenticate, checkSession)

// Authentication Flow
router.get('/status', rateLimiterMiddleware, checkAuthStatus)
router.post('/login', rateLimiterMiddleware, login)
router.post('/logout', authenticate, logout)

// Registration Flow
router.post('/register', rateLimiterMiddleware, register)
router.post('/verify-email', rateLimiterMiddleware, verifyEmail)
router.post(
  '/resend-verification-email',
  rateLimiterMiddleware,
  resendVerificationEmail,
)

// Password Flow
router.post('/forgot-password', rateLimiterMiddleware, forgotPassword)
router.post(
  '/resend-forgot-password',
  rateLimiterMiddleware,
  resendForgotPassword,
)
router.post('/reset-password', resetPassword)

// Session Management
router.get('/active-sessions', authenticate, getActiveSessions)
router.delete('/revoke-session/:sessionId', authenticate, revokeSession)
router.delete('/revoke-all-sessions', authenticate, revokeAllSessions)

export default router
