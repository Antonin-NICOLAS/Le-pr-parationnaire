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
                    'Trop de requêtes, veuillez réessayer dans ' +
                    remainingSeconds +
                    ' secondes.',
            })
        })
}

const strictRateLimiterMiddleware = (req, res, next) => {
    StrictrateLimiter.consume(req.ip)
        .then(() => {
            next()
        })
        .catch((rateLimiterRes) => {
            const remainingSeconds = rateLimiterRes.msBeforeNext / 1000
            res.status(429).json({
                success: false,
                error:
                    'Trop de requêtes, veuillez réessayer dans ' +
                    remainingSeconds +
                    ' secondes.',
            })
        })
}

module.exports = { rateLimiterMiddleware, strictRateLimiterMiddleware }
