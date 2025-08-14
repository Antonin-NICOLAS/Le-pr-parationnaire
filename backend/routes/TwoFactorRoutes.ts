import express, { type Request, Response, NextFunction } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()

// Controllers
import {
  getStatus,
  configTwoFactorApp,
  enableTwoFactorApp,
  disableTwoFactorApp,
  configTwoFactorEmail,
  resendEmailCode,
  enableTwoFactorEmail,
  disableTwoFactorEmail,
  setPreferredMethod,
  twoFactorLogin,
  disableTwoFactor,
} from '../controllers/2FAController.js'

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

const authIfNeeded = (req: Request, res: Response, next: NextFunction) => {
  const { context } = req.params
  if (['config', 'disable'].includes(context)) {
    return authenticate(req, res, next)
  }
  next()
}

// Routes
router.get('/status', authenticate, getStatus)
router.post('/set-preferred-method', authenticate, setPreferredMethod)
router.post('/login', rateLimiterMiddleware, twoFactorLogin)
router.post('/disable', authenticate, disableTwoFactor)

// Email 2FA
router.post(
  '/email/config',
  rateLimiterMiddleware,
  authenticate,
  configTwoFactorEmail,
)
router.post('/email/enable', authenticate, enableTwoFactorEmail)
router.post('/email/disable', authenticate, disableTwoFactorEmail)
router.post(
  '/email/resend/:context',
  rateLimiterMiddleware,
  authIfNeeded,
  resendEmailCode,
)

// App 2FA
router.post(
  '/app/config',
  rateLimiterMiddleware,
  authenticate,
  configTwoFactorApp,
)
router.post('/app/enable', authenticate, enableTwoFactorApp)
router.post('/app/disable', authenticate, disableTwoFactorApp)

export default router
