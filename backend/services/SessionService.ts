import { LeanUser } from '../models/User.js'
import { UAParser } from 'ua-parser-js'
import ms, { StringValue } from 'ms'
import { v4 as uuidv4 } from 'uuid'
import { Request, Response } from 'express'
import { TokenService } from './TokenService.js'
import { Schema } from 'mongoose'
import Session from '../models/Session.js'
import User from '../models/User.js'
import i18next, { type TFunction } from 'i18next'
import { findLocation } from '../helpers/AuthHelpers.js'

function getClientIp(req: any): string {
  const forwarded = req?.headers?.['x-forwarded-for']
  return (
    req?.ip ||
    (Array.isArray(forwarded) ? forwarded[0] : forwarded) ||
    req?.socket?.remoteAddress ||
    ''
  )
}

export class SessionService {
  static async createSessionWithTokens(
    t: TFunction,
    user: LeanUser,
    req: Request,
    res: Response,
    rememberMe: boolean,
    existingSessionId?: string,
  ) {
    const ip = getClientIp(req)
    const location = await findLocation(t, i18next.language, ip)
    const userAgent = req.headers['user-agent']
    const uaResult = new UAParser(userAgent).getResult()

    const accessTokenDuration = process.env.ACCESS_TOKEN_DURATION as StringValue

    const refreshTokenDuration = rememberMe
      ? (process.env.REFRESH_TOKEN_DURATION_LONG as StringValue)
      : (process.env.REFRESH_TOKEN_DURATION_SHORT as StringValue)

    // Préparer les opérations de mise à jour
    const sessionId = existingSessionId || req.cookies?.sessionId || uuidv4()
    const now = new Date()
    const expiresAt = new Date(Date.now() + ms(refreshTokenDuration))

    // Vérifier si une session existante doit être mise à jour
    const existingSession = await Session.findOne({
      userId: user._id,
      sessionId,
      expiresAt: { $gt: now },
    })

    let refreshTokenVersion = 1
    let session

    if (existingSession) {
      console.log('session existante :', existingSession)
      refreshTokenVersion = (existingSession.refreshTokenVersion || 0) + 1
      session = {
        ...existingSession.toObject(),
        lastActive: now,
        expiresAt,
        refreshTokenVersion,
      }
    } else {
      session = {
        sessionId,
        userId: user._id,
        ip: ip as string,
        userAgent,
        deviceType: uaResult.device.type || 'Desktop',
        browser: uaResult.browser.name || 'inconnu',
        os: uaResult.os.name || 'inconnu',
        location: location || '',
        lastActive: now,
        expiresAt,
        refreshTokenVersion,
      }
    }

    // Générer les tokens
    const rawRefreshToken = TokenService.generateRefreshTokenPayload(
      session.sessionId,
      session.refreshTokenVersion,
    )
    const hashedRefreshToken = await TokenService.hashToken(rawRefreshToken)
    console.log('rawRefreshToken created:', rawRefreshToken)
    console.log('hashedRefreshToken created:', hashedRefreshToken)

    const accessToken = TokenService.generateAccessToken(
      user,
      accessTokenDuration,
      session.sessionId,
      session.refreshTokenVersion,
    )

    // Mettre à jour ou créer la session dans la base de données
    await Session.updateOne(
      { sessionId: session.sessionId },
      {
        $set: {
          ...session,
          refreshToken: hashedRefreshToken,
          lastActive: now,
          expiresAt,
        },
      },
      { upsert: true },
    )

    // Mettre à jour le lastLogin de l'utilisateur
    await User.updateOne({ _id: user._id }, { $set: { lastLogin: now } })

    // Configurer les cookies
    const baseCookieOpts = {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'strict' as const,
      ...(process.env.NODE_ENV === 'production' && {
        domain: process.env.DOMAIN,
      }),
    }

    res.cookie('accessToken', accessToken, {
      ...baseCookieOpts,
      maxAge: ms(accessTokenDuration),
    })
    res.cookie('refreshToken', rawRefreshToken, {
      ...baseCookieOpts,
      maxAge: ms(refreshTokenDuration),
    })
    res.cookie('sessionId', session.sessionId, {
      ...baseCookieOpts,
      httpOnly: false,
      maxAge: ms(refreshTokenDuration),
    })

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      session: {
        ...session,
        refreshToken: hashedRefreshToken,
      },
    }
  }

  static async cleanupExpiredSessions(userId: Schema.Types.ObjectId) {
    await Session.deleteMany({
      userId,
      expiresAt: { $lte: new Date() },
    })
  }

  static async revokeSession(sessionId: string) {
    const result = await Session.deleteOne({
      sessionId,
    })
    return result.deletedCount
  }

  static async revokeAllSessions(
    userId: Schema.Types.ObjectId,
    excludeSessionId?: string,
  ) {
    const query: any = { userId }
    if (excludeSessionId) {
      query.sessionId = { $ne: excludeSessionId }
    }
    await Session.deleteMany(query)
  }

  static async getActiveSessions(
    userId: Schema.Types.ObjectId,
    currentSessionId?: string,
  ) {
    const now = new Date()
    const sessions = await Session.find({
      userId,
      expiresAt: { $gt: now },
    }).sort({ lastActive: -1 })

    console.log(sessions)

    return sessions.map((s) => ({
      sessionId: s.sessionId,
      ip: s.ip,
      location: s.location,
      deviceName:
        s.browser && s.os
          ? `${s.browser} on ${s.os}`
          : s.userAgent || 'Unknown Device',
      deviceType: s.deviceType,
      lastActive: s.lastActive,
      isCurrent: s.sessionId === currentSessionId,
      expiresIn: s.expiresAt ? s.expiresAt.getTime() - now.getTime() : null,
    }))
  }
}
