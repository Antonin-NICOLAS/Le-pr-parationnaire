import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import dotenv from 'dotenv'
import { ApiResponse } from '../helpers/ApiResponse.js'
dotenv.config()

const authenticateLean = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // 1. Vérifier le token dans les cookies ou le header Authorization
    let token =
      req.cookies?.accessToken || req.headers.authorization?.split(' ')[1]

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
    const user = await User.findById(decoded.id).lean()

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

const authenticateFull = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // 1. Vérifier le token dans les cookies ou le header Authorization
    let token =
      req.cookies?.accessToken || req.headers.authorization?.split(' ')[1]

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

export { authenticateLean, authenticateFull, authorize }
