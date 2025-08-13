import { IUser, LoginHistory } from '../models/User.js'
import { UAParser } from 'ua-parser-js'
import ms, { StringValue } from 'ms'
import { v4 as uuidv4 } from 'uuid'
import { Request, Response } from 'express'
import { TokenService } from './TokenService.js'

export class SessionService {
  static async createSessionWithTokens(
    user: IUser,
    req: Request,
    res: Response,
    rememberMe: boolean,
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
      req.cookies?.sessionId
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
    )
    const rawRefreshToken = await TokenService.generateRefreshToken()
    session.refreshToken = await TokenService.hashToken(rawRefreshToken)

    // Nettoyer sessions expirées
    user.loginHistory = user.loginHistory.filter(
      (s) => s.expiresAt > new Date(),
    )

    await user.save()

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

  static async revokeSession(user: IUser, sessionId: string) {
    user.loginHistory = user.loginHistory.filter(
      (session: LoginHistory) => session.sessionId !== sessionId,
    )
  }

  static async revokeAllSessions(user: IUser) {
    user.loginHistory = []
  }

  static getActiveSessions(user: IUser, currentSessionId?: string) {
    return user.loginHistory
      .filter((session: LoginHistory) => session.expiresAt! > new Date())
      .map((session: LoginHistory) => ({
        sessionId: session.sessionId,
        ip: session.ip,
        location: session.location,
        device:
          session.browser && session.os
            ? `${session.browser} on ${session.os}`
            : session.userAgent || 'Unknown Device',
        deviceType: session.deviceType,
        browser: session.browser,
        os: session.os,
        lastActive: session.lastActive,
        isCurrent: session.sessionId === currentSessionId,
      }))
  }
}
