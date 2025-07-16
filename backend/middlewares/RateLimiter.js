const { RateLimiterMemory } = require('rate-limiter-flexible')

// Rate limiter configuration (5 requests per IP per minute)
const rateLimiter = new RateLimiterMemory({
    points: 5,
    duration: 120,
    blockDuration: 60 * 15,
})

const StrictrateLimiter = new RateLimiterMemory({
    points: 1,
    duration: 60,
})

// Middleware to apply rate limiting
const rateLimiterMiddleware = (req, res, next) => {
    const { t } = req
    rateLimiter
        .consume(req.ip)
        .then(() => {
            next()
        })
        .catch((rateLimiterRes) => {
            const remainingSeconds = rateLimiterRes.msBeforeNext / 1000
            res.status(429).json({
                success: false,
                error:
                    t('common:request_limit') +
                    remainingSeconds +
                    ' ' +
                    t('common:sec') +
                    '.',
            })
        })
}

const strictRateLimiterMiddleware = (req, res, next) => {
    const { t } = req
    StrictrateLimiter.consume(req.ip)
        .then(() => {
            next()
        })
        .catch((rateLimiterRes) => {
            const remainingSeconds = rateLimiterRes.msBeforeNext / 1000
            res.status(429).json({
                success: false,
                error:
                    t('common:request_limit') +
                    remainingSeconds +
                    ' ' +
                    t('common:sec') +
                    '.',
            })
        })
}

module.exports = { rateLimiterMiddleware, strictRateLimiterMiddleware }
