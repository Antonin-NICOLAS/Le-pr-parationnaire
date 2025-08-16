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
import {
  authenticateLean,
  authenticateFull,
} from '../middlewares/VerifyAuth.js'
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
// Modifiez vos routes comme suit :
router.post('/change-password', NormalRL, authenticateLean, changePassword)
router.post('/change-email/step1', NormalRL, authenticateLean, changeEmailStep1)
router.post(
  '/change-email/step2',
  NormalRL,
  authenticateLean,
  changeEmailStep2Step4,
)
router.post('/change-email/step3', NormalRL, authenticateLean, changeEmailStep3)
router.post(
  '/change-email/step4',
  NormalRL,
  authenticateLean,
  changeEmailStep2Step4,
)

router.delete('/delete-account', authenticateFull, deleteAccount)

export default router
