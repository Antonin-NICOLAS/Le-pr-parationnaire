const express = require('express')
const cors = require('cors')
require('dotenv').config()

// Controllers
const {
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
  changePassword,
} = require('../controllers/AuthController')

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
router.get('/profile', authenticate, checkSession)

// with rate limiting
router.use(rateLimiterMiddleware)

// Login Flow
router.post('/login', login)
router.post('/logout', logout)
router.get('/status', checkAuthStatus)

// Register Flow
router.post('/register', register)
router.post('/verify-email', verifyEmail)
router.post('/resend-verification-email', resendVerificationEmail)

// Password Flow
router.post('/forgot-password', forgotPassword)
router.post('/resend-forgot-password', resendForgotPassword)
router.post('/reset-password', resetPassword)

// with authentication needed
router.post('/change-password', authenticate, changePassword)
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
