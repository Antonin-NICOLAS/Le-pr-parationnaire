import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'
import ms, { StringValue } from 'ms'
import { ApiResponse } from '../helpers/ApiResponse.js'
dotenv.config()

async function refreshTokenFunction(refreshToken: string, req: Request) {
  try {
    // 1. Trouver l'utilisateur avec ce refresh token
    const user = await User.findOne({
      'loginHistory.refreshToken': { $exists: true },
      'loginHistory.sessionId': req.cookies?.sessionId,
    })

    if (!user) return null

    // 2. Trouver la session spécifique
    const session = user.loginHistory.find(
      (s) => s.sessionId === req.cookies?.sessionId,
    )

    if (!session || !session.refreshToken) return null

    // 3. Vérifier le token
    const isValid = await bcrypt.compare(refreshToken, session.refreshToken)
    if (!isValid) return null

    // 4. Générer un nouveau token d'accès
    const newAccessToken = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
        tokenVersion: user.tokenVersion,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: ms(process.env.ACCESS_TOKEN_DURATION_SHORT as StringValue) },
    )

    // 5. Mettre à jour le cookie
    req.res?.cookie('jwtauth', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: ms(process.env.ACCESS_TOKEN_DURATION_SHORT as StringValue),
    })

    return newAccessToken
  } catch (error) {
    console.error('Refresh token error:', error)
    return null
  }
}

const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // 1. Vérifier le token dans les cookies ou le header Authorization
    let token =
      req.cookies?.accessToken || req.headers.authorization?.split(' ')[1]

    // Essayer de rafraîchir le token s'il est expiré
    if (!token) {
      const refreshToken = req.cookies?.refreshToken
      if (refreshToken) {
        // Appel interne pour rafraîchir le token
        const newToken = await refreshTokenFunction(refreshToken, req)
        if (newToken) token = newToken
      }
    }

    if (!token) {
      return ApiResponse.error(res, req.t('auth:errors.unauthorized'), 401)
    }

    // 2. Vérifier et décoder le token JWT
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined in environment variables')
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as {
      jti: string
      id: string
      tokenVersion: number
    }

    if (decoded.jti !== req.cookies?.sessionId) {
      return ApiResponse.error(res, req.t('auth:errors.session_expired'), 401)
    }

    // 3. Récupérer l'utilisateur avec les informations de session
    const user = await User.findById(decoded.id)
      .select('-resetPassword.token -emailVerification.token')
      .lean()

    if (!user) {
      return ApiResponse.error(res, req.t('auth:errors.user_not_found'), 401)
    }

    // 4. Vérifier si le token a été révoqué (pour logout)
    if (user.tokenVersion !== decoded.tokenVersion) {
      return ApiResponse.error(res, req.t('auth:errors.session_expired'), 401)
    }

    // 5. Attacher l'utilisateur et le token à la requête
    req.user = user
    req.token = token
    next()
  } catch (err: any) {
    console.error('Authentication error:', err)

    if (err.name === 'TokenExpiredError') {
      return ApiResponse.error(res, req.t('auth:errors.session_expired'), 401)
    }

    return ApiResponse.error(res, req.t('auth:errors.unauthorized'), 401)
  }
}

// Middleware de vérification de rôle
const authorize = (roles: string[] = []) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || (roles.length && !roles.includes(req.user.role))) {
      return ApiResponse.error(res, req.t('auth:errors.unauthorized'), 403)
    }
    next()
  }
}

export { authenticate, authorize }
