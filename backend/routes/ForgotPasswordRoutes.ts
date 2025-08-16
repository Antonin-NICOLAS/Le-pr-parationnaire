import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import z from 'zod'
dotenv.config()

// Controllers
import {
  forgotPassword,
  verifyResetToken,
  resetPassword,
} from '../controllers/ForgotPasswordController.js'

// Middlewares
import { StrictRL } from '../middlewares/RateLimiter.js'
import { validate } from '../middlewares/Validate.js'
import { emailSchema, resetPasswordSchema } from '../helpers/Validators.js'

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
router.post(
  '/send',
  StrictRL,
  validate(z.object({ email: emailSchema })),
  forgotPassword,
)
router.post('/verify', verifyResetToken)
router.post('/reset', validate(resetPasswordSchema), resetPassword)

export default router
