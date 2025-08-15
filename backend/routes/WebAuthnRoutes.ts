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
import { authenticateFull } from '../middlewares/VerifyAuth.js'
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

// Routes

// WebAuthn Registration
router.post(
  '/verify-registration',
  NormalRL,
  authenticateFull,
  verifyRegistration,
)

router.get(
  '/generate-registration',
  NormalRL,
  authenticateFull,
  generateRegistrationOpt,
)
// WebAuthn Authentication
router.post('/verify-authentication', NormalRL, verifyAuthentication)
router.get('/generate-authentication', NormalRL, generateAuthenticationOpt)
// WebAuthn Credential Management
router.post('/transfer', authenticateFull, transferWebAuthnCredentials)
router.post('/set-name', authenticateFull, nameWebAuthnCredential)
router.post('/disable', NormalRL, authenticateFull, disableWebAuthn)
router.get('/devices', authenticateFull, getWebAuthnDevices)

router.delete('/credential/:id', authenticateFull, removeWebAuthnCredential)

export default router
