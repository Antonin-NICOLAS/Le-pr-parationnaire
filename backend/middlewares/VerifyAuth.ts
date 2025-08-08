import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import dotenv from 'dotenv'
dotenv.config()

const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // 1. Vérifier le token dans les cookies ou le header Authorization
    let token = req.cookies?.jwtauth || req.headers.authorization?.split(' ')[1]

    if (!token) {
      return res.status(401).json({
        success: false,
        error: req.t('auth:errors.unauthorized'),
      })
    }

    // 2. Vérifier et décoder le token JWT
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined in environment variables')
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as {
      id: string
      tokenVersion: number
    }

    // 3. Récupérer l'utilisateur avec les informations de session
    const user = await User.findById(decoded.id)
      .select('-resetPassword.token -emailVerification.token')
      .lean()

    if (!user) {
      return res.status(401).json({
        success: false,
        error: req.t('auth:errors.user_not_found'),
      })
    }

    // 4. Vérifier si le token a été révoqué (pour logout)
    if (user.tokenVersion !== decoded.tokenVersion) {
      return res.status(401).json({
        success: false,
        error: req.t('auth:errors.session_expired'),
      })
    }

    // 5. Attacher l'utilisateur et le token à la requête
    req.user = user
    req.token = token
    next()
  } catch (err: any) {
    console.error('Authentication error:', err)

    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: req.t('auth:errors.session_expired'),
      })
    }

    return res.status(401).json({
      success: false,
      error: req.t('auth:errors.invalid_token'),
    })
  }
}

// Middleware de vérification de rôle
const authorize = (roles: string[] = []) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || (roles.length && !roles.includes(req.user.role))) {
      return res.status(403).json({
        success: false,
        error: req.t('auth:errors.unauthorized'),
      })
    }
    next()
  }
}

export { authenticate, authorize }
