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
import { authenticateLean } from '../middlewares/VerifyAuth.js'
import { NormalRL } from '../middlewares/RateLimiter.js'

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
    return authenticateLean(req, res, next)
  }
  next()
}

// Routes
router.get('/status', authenticateLean, getStatus)
router.post('/set-preferred-method', authenticateLean, setPreferredMethod)
router.post('/login', NormalRL, twoFactorLogin)
router.post('/disable', authenticateLean, disableTwoFactor)

// Email 2FA
router.post('/email/config', NormalRL, authenticateLean, configTwoFactorEmail)
router.post('/email/enable', authenticateLean, enableTwoFactorEmail)
router.post('/email/disable', authenticateLean, disableTwoFactorEmail)
router.post('/email/resend/:context', NormalRL, authIfNeeded, resendEmailCode)

// App 2FA
router.post('/app/config', NormalRL, authenticateLean, configTwoFactorApp)
router.post('/app/enable', authenticateLean, enableTwoFactorApp)
router.post('/app/disable', authenticateLean, disableTwoFactorApp)

export default router
