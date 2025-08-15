import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()

// Controllers
import {
  getActiveSessions,
  revokeSession,
  revokeAllSessions,
} from '../controllers/SessionsController.js'

// Middlewares
import { authenticateLean } from '../middlewares/VerifyAuth.js'

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
router.get('/', authenticateLean, getActiveSessions)
router.delete('/revoke/:sessionId', authenticateLean, revokeSession)
router.delete('/revoke-all', authenticateLean, revokeAllSessions)

export default router
