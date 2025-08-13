import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()

// Controllers
import {
  generateRegistrationOpt,
  verifyRegistration,
  generateAuthenticationOpt,
  verifyAuthentication,
  nameWebAuthnCredential,
  removeWebAuthnCredential,
  getWebAuthnDevices,
  disableWebAuthn,
  transferWebAuthnCredentials,
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

// WebAuthn Registration
router.post(
  '/verify-registration',
  rateLimiterMiddleware,
  authenticate,
  verifyRegistration,
)

router.get(
  '/generate-registration',
  rateLimiterMiddleware,
  authenticate,
  generateRegistrationOpt,
)
// WebAuthn Authentication
router.post(
  '/verify-authentication',
  rateLimiterMiddleware,
  verifyAuthentication,
)
router.get(
  '/generate-authentication',
  rateLimiterMiddleware,
  generateAuthenticationOpt,
)
// WebAuthn Credential Management
router.post('/transfer', authenticate, transferWebAuthnCredentials)
router.post('/set-name', authenticate, nameWebAuthnCredential)
router.post('/disable', rateLimiterMiddleware, authenticate, disableWebAuthn)
router.get('/devices', authenticate, getWebAuthnDevices)

router.delete('/credential/:id', authenticate, removeWebAuthnCredential)

export default router
