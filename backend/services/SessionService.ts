import { IUser } from '../models/User.js'
import { UAParser } from 'ua-parser-js'
import ms, { StringValue } from 'ms'
import { v4 as uuidv4 } from 'uuid'
import { Request, Response } from 'express'
import { TokenService } from './TokenService.js'
import User from '../models/User.js'

export class SessionService {
  static async createSessionWithTokens(
    user: IUser,
    req: Request,
    res: Response,
    rememberMe: boolean,
    existingSessionId?: string,
  ) {
    const ip =
      req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress
    const userAgent = req.headers['user-agent'] || ''
    const uaResult = new UAParser(userAgent).getResult()

    const accessTokenDuration = process.env.ACCESS_TOKEN_DURATION as StringValue

    const refreshTokenDuration = rememberMe
      ? (process.env.REFRESH_TOKEN_DURATION_LONG as StringValue)
      : (process.env.REFRESH_TOKEN_DURATION_SHORT as StringValue)

    // Chercher une session existante
    let session = user.loginHistory.find((s) =>
      existingSessionId
        ? s.sessionId === existingSessionId
        : req.cookies?.sessionId
        ? s.sessionId === req.cookies.sessionId
        : s.expiresAt! > new Date() &&
          this.isSimilarDevice(s.userAgent, userAgent) &&
          s.ip === ip,
    )

    // Sinon, créer une nouvelle session
    if (!session) {
      session = {
        sessionId: uuidv4(),
        ip: ip as string,
        userAgent,
        deviceType: uaResult.device.type || 'Desktop',
        browser: uaResult.browser.name || 'inconnu',
        os: uaResult.os.name || 'inconnu',
        lastActive: new Date(),
        expiresAt: new Date(Date.now() + ms(refreshTokenDuration)), // session vit aussi longtemps que refreshToken
      }
      user.loginHistory.push(session)
    } else {
      session.lastActive = new Date()
      session.expiresAt = new Date(Date.now() + ms(refreshTokenDuration))
    }

    // Générer tokens
    const accessToken = TokenService.generateAccessToken(
      user,
      accessTokenDuration,
      session.sessionId,
      session.refreshTokenVersion,
    )

    const refreshTokenVersion = (session.refreshTokenVersion || 0) + 1
    const rawRefreshToken = TokenService.generateRefreshTokenPayload(
      session.sessionId,
      refreshTokenVersion,
    )
    session.refreshToken = await TokenService.hashToken(rawRefreshToken)
    session.refreshTokenVersion = refreshTokenVersion

    if (existingSessionId) {
      session.refreshTokenVersion = (session.refreshTokenVersion || 0) + 1
    }

    await user.save()

    console.log('[REFRESH] Refresh token :', session.refreshToken)
    console.log('[REFRESH] Raw refresh token :', rawRefreshToken)
    console.log('[REFRESH] Session :', session)

    // Cookies
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
      session,
    }
  }

  private static isSimilarDevice(ua1: string, ua2: string): boolean {
    if (!ua1 || !ua2) return false
    const parser = new UAParser()
    const d1 = parser.setUA(ua1).getResult()
    const d2 = parser.setUA(ua2).getResult()
    return (
      d1.browser.name === d2.browser.name &&
      d1.os.name === d2.os.name &&
      d1.device.type === d2.device.type
    )
  }

  static async cleanupExpiredSessions(user: IUser) {
    await User.updateOne(
      { _id: user._id },
      {
        $pull: {
          loginHistory: {
            expiresAt: { $lte: new Date() },
          },
        },
      },
    )
  }

  static async revokeSession(user: IUser, sessionId: string) {
    await User.updateOne(
      { _id: user._id },
      {
        $pull: {
          loginHistory: { sessionId: sessionId },
        },
      },
    )
  }

  static async revokeAllSessions(user: IUser) {
    await User.updateOne({ _id: user._id }, { $set: { loginHistory: [] } })
  }

  static getActiveSessions(user: IUser, currentSessionId?: string) {
    const now = new Date()
    return user.loginHistory
      .filter((s) => s.expiresAt! > now)
      .sort((a, b) => b.lastActive.getTime() - a.lastActive.getTime())
      .map((s) => ({
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
