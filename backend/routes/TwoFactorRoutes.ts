import express from 'express'
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
  useBackupCode,
} from '../controllers/2FAController.js'
import {
  generateRegistrationOpt,
  verifyRegistration,
  generateAuthenticationOpt,
  verifyAuthentication,
  nameWebAuthnCredential,
  removeWebAuthnCredential,
  getWebAuthnDevices,
  disableWebAuthn,
} from '../controllers/WebAuthnController.js'

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
router.get('/status', authenticate, getStatus)
router.post('/set-preferred-method', authenticate, setPreferredMethod)
router.post(
  '/use-backup-code',
  rateLimiterMiddleware,
  authenticate,
  useBackupCode,
)

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
  '/email/resend',
  rateLimiterMiddleware,
  authenticate,
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

// WebAuthn Registration
router.post(
  '/webauthn/verify-registration',
  rateLimiterMiddleware,
  authenticate,
  verifyRegistration,
)

router.get(
  '/webauthn/generate-registration',
  rateLimiterMiddleware,
  authenticate,
  generateRegistrationOpt,
)
router.post(
  '/webauthn/verify-authentication',
  rateLimiterMiddleware,
  verifyAuthentication,
)
router.get(
  '/webauthn/generate-authentication',
  rateLimiterMiddleware,
  generateAuthenticationOpt,
)
router.post(
  '/webauthn/set-name',
  rateLimiterMiddleware,
  authenticate,
  nameWebAuthnCredential,
)
router.post(
  '/webauthn/disable',
  rateLimiterMiddleware,
  authenticate,
  disableWebAuthn,
)
router.get('/webauthn/devices', authenticate, getWebAuthnDevices)

router.delete(
  '/webauthn/credential/:id',
  authenticate,
  removeWebAuthnCredential,
)

export default router
