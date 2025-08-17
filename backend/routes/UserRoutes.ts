import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import z from 'zod'
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
import { validate } from '../middlewares/Validate.js'
import {
  changePasswordSchema,
  emailSchema,
  sixDigitCodeSchema,
} from '../helpers/Validators.js'

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
router.post(
  '/change-password',
  NormalRL,
  validate(changePasswordSchema),
  authenticateLean,
  changePassword,
)
router.post('/change-email/step1', NormalRL, authenticateLean, changeEmailStep1)
router.post(
  '/change-email/step2',
  NormalRL,
  validate(sixDigitCodeSchema),
  authenticateLean,
  changeEmailStep2Step4,
)
router.post(
  '/change-email/step3',
  NormalRL,
  validate(
    z.object({
      email: emailSchema,
    }),
  ),
  authenticateLean,
  changeEmailStep3,
)
router.post(
  '/change-email/step4',
  NormalRL,
  validate(sixDigitCodeSchema),
  authenticateLean,
  changeEmailStep2Step4,
)

router.delete('/delete-account', authenticateFull, deleteAccount)

export default router
