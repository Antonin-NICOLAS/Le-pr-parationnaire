const express = require('express')
const cors = require('cors')
require('dotenv').config()

// Controllers
const {
  getStatus,
  verifyLoginTwoFactor,
  configTwoFactorApp,
  enableTwoFactorApp,
  disableTwoFactorApp,
  configTwoFactorEmail,
  resendEmailCode,
  enableTwoFactorEmail,
  disableTwoFactorEmail,
  setPreferredMethod,
  useBackupCode,
} = require('../controllers/2FAController')
const {
  generateRegistrationOpt,
  verifyRegistration,
  generateAuthenticationOpt,
  removeWebAuthnCredential,
  getWebAuthnDevices,
} = require('../controllers/WebAuthnController')

// Middlewares
const { authenticate } = require('../middlewares/VerifyAuth')
const { rateLimiterMiddleware } = require('../middlewares/RateLimiter')

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
router.post('/email/verify', authenticate, verifyLoginTwoFactor)

// Email 2FA
router.post('/email/config', authenticate, configTwoFactorEmail)
router.post('/email/enable', authenticate, enableTwoFactorEmail)
router.post('/email/disable', authenticate, disableTwoFactorEmail)
router.post('/email/resend', authenticate, resendEmailCode)

// App 2FA
router.post('/app/verify', authenticate, verifyLoginTwoFactor)
router.post('/app/config', authenticate, configTwoFactorApp)
router.post('/app/enable', authenticate, enableTwoFactorApp)
router.post('/app/disable', authenticate, disableTwoFactorApp)

// WebAuthn Registration
router.post('/webauthn/verify-registration', authenticate, verifyRegistration)

router.get(
  '/webauthn/generate-registration',
  authenticate,
  generateRegistrationOpt,
)
router.get(
  '/webauthn/generate-authentication',
  authenticate,
  generateAuthenticationOpt,
)
router.get('/webauthn/devices', authenticate, getWebAuthnDevices)

router.delete(
  '/webauthn/remove-credential/:credentialId',
  authenticate,
  removeWebAuthnCredential,
)

module.exports = router
