import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()

// Controllers
import {
  changePassword,
  changeEmailStep1,
  changeEmailStep2Step4,
  changeEmailStep3,
  deleteAccount,
} from '../controllers/UserController.js'

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
router.post(
  '/change-password',
  rateLimiterMiddleware,
  authenticate,
  changePassword,
)
router.post(
  '/change-email/step1',
  rateLimiterMiddleware,
  authenticate,
  changeEmailStep1,
)
router.post(
  '/change-email/step2',
  rateLimiterMiddleware,
  authenticate,
  changeEmailStep2Step4,
)
router.post(
  '/change-email/step3',
  rateLimiterMiddleware,
  authenticate,
  changeEmailStep3,
)
router.post(
  '/change-email/step4',
  rateLimiterMiddleware,
  authenticate,
  changeEmailStep2Step4,
)

router.delete('/delete-account', authenticate, deleteAccount)

export default router
