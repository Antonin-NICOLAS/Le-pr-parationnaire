import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()

// Controllers
import {
  forgotPassword,
  verifyResetToken,
  resetPassword,
} from '../controllers/ForgotPasswordController.js'

// Middlewares
import { StrictRL } from '../middlewares/RateLimiter.js'

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
router.post('/send', StrictRL, forgotPassword)
router.post('/verify', verifyResetToken)
router.post('/reset', resetPassword)

export default router
