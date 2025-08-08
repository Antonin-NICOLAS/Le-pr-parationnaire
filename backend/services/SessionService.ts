import { IUser, LoginHistory } from '../models/User'
import { UAParser } from 'ua-parser-js'
import ms, { StringValue } from 'ms'
import { v4 as uuidv4 } from 'uuid'
import { Request } from 'express'

export class SessionService {
  static async createOrUpdateSession(
    user: any,
    req: Request,
    rememberMe: boolean,
  ) {
    const ip =
      req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress
    const userAgent = req.headers['user-agent'] || ''
    const sessionDuration = rememberMe
      ? ms(process.env.SESSION_DURATION_LONG as StringValue)
      : ms(process.env.SESSION_DURATION_SHORT as StringValue)

    const parser = new UAParser(userAgent)
    const uaResult = parser.getResult()

    // Check for existing session
    const existingSession = user.loginHistory.find((session: LoginHistory) => {
      if (
        req.cookies?.sessionId &&
        session.sessionId === req.cookies.sessionId
      ) {
        return true
      }
      return (
        session.expiresAt! > new Date() &&
        this.isSimilarDevice(session.userAgent as string, userAgent) &&
        session.ip === ip
      )
    })

    let sessionId: string
    if (existingSession) {
      existingSession.lastActive = new Date()
      existingSession.expiresAt = new Date(Date.now() + sessionDuration)
      sessionId = existingSession.sessionId
    } else {
      sessionId = uuidv4()
      user.loginHistory.push({
        sessionId,
        ip,
        userAgent,
        deviceType: uaResult.device.type || 'desktop',
        browser: uaResult.browser.name || 'unknown',
        os: uaResult.os.name || 'unknown',
        lastActive: new Date(),
        expiresAt: new Date(Date.now() + sessionDuration),
      })
    }

    // Clean expired sessions
    user.loginHistory = user.loginHistory.filter(
      (session: LoginHistory) =>
        session.expiresAt && session.expiresAt > new Date(),
    )

    const session = user.loginHistory.find(
      (s: LoginHistory) => s.sessionId === sessionId,
    )

    return session
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
