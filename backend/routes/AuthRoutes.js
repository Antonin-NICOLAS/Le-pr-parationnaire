const express = require('express')
const cors = require('cors')
require('dotenv').config()

// Controllers
const {
    register,
    login,
    logout,
    checkSession,
    forgotPassword,
    resetPassword,
    verifyEmail,
    changePassword,
} = require('../controllers/AuthController')
const { authenticate } = require('../middlewares/VerifyAuth')

// Helpers
const { rateLimiterMiddleware } = require('../middlewares/RateLimiter')

// Router
const router = express.Router()

// Middleware
router.use(
    cors({
        credentials: true,
        origin: process.env.FRONTEND_SERVER,
    })
)

// Apply rate limiting to auth routes
router.use(rateLimiterMiddleware)

// Routes
router.post('/register', register)
router.post('/login', login)
router.post('/logout', logout)

router.post('/forgot-password', forgotPassword)
router.post('/reset-password', resetPassword)

router.post('/verify-email', authenticate, verifyEmail)
router.post('/change-password', authenticate, changePassword)

router.get('/profile', authenticate, checkSession)

module.exports = router
