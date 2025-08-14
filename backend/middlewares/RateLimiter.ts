import type { Request, Response, NextFunction } from 'express'
import { RateLimiterMemory } from 'rate-limiter-flexible'

// Rate limiter configuration (5 requests per IP per minute)
const rateLimiter = new RateLimiterMemory({
  keyPrefix: 'rate_limiter',
  points: 5,
  duration: 60,
  blockDuration: 60 * 15,
})

const strictRateLimiter = new RateLimiterMemory({
  keyPrefix: 'strict_rate_limiter',
  points: 1,
  duration: 60,
})

const refreshTokenRateLimiter = new RateLimiterMemory({
  keyPrefix: 'refresh_token_rate_limiter',
  points: 1,
  duration: 5,
})

// Middleware to apply rate limiting
const rateLimiterMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { t } = req
  rateLimiter
    .consume(req.ip ?? '')
    .then(() => {
      next()
    })
    .catch((rateLimiterRes) => {
      const remainingSeconds = Math.round(rateLimiterRes.msBeforeNext / 1000)
      let message
      if (remainingSeconds > 60) {
        message =
          t('common:request_limit') +
          ' ' +
          Math.round(remainingSeconds / 60) +
          ' ' +
          t('common:min') +
          '.'
      } else {
        message =
          t('common:request_limit') +
          ' ' +
          remainingSeconds +
          ' ' +
          t('common:sec') +
          '.'
      }
      res.status(429).json({
        success: false,
        error: message,
      })
    })
}

const strictRateLimiterMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { t } = req
  strictRateLimiter
    .consume(req.ip ?? '')
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

const refreshTokenRateLimiterMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { t } = req
  refreshTokenRateLimiter
    .consume(req.ip ?? '')
    .then(() => {
      next()
    })
    .catch(() => {
      res.status(429).json({
        success: false,
      })
    })
}

export {
  rateLimiterMiddleware,
  strictRateLimiterMiddleware,
  refreshTokenRateLimiterMiddleware,
}
