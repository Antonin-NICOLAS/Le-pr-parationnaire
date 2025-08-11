import jwt, { type SignOptions } from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import CryptoJS from 'crypto-js'
import { UAParser } from 'ua-parser-js'
import ms, { StringValue } from 'ms'
import { v4 as uuidv4 } from 'uuid'
import { Response } from 'express'
import type { IUser } from '../models/User.js'
import { generateSecureCode } from './2FAHelpers.js'
import { TokenService } from '../services/TokenService.js'

export async function handleUnverifiedUser(user: IUser) {
  if (
    !user.emailVerification.token ||
    !user.emailVerification.expiration ||
    user.emailVerification.expiration < new Date()
  ) {
    user.emailVerification.token = generateSecureCode()
    user.emailVerification.expiration = new Date(
      Date.now() + 24 * 60 * 60 * 1000,
    )
    await user.save()
  }
}

export async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10)
  return await bcrypt.hash(password, salt)
}

export async function comparePassword(password: string, hashed: string) {
  return await bcrypt.compare(password, hashed)
}

export function validateEmail(email: string) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validateName(name: string) {
  return name.length >= 3 && name.length <= 30
}

export function validatePassword(password: string) {
  const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[\W_]).{8,}$/
  return passwordRegex.test(password)
}

export function getDeviceInfo(userAgent: string): string {
  const parser = new UAParser(userAgent)
  const device = parser.getDevice()
  const os = parser.getOS()
  const browser = parser.getBrowser()

  return `Appareil: ${device.type || 'inconnu'} (${
    device.vendor || 'inconnu'
  } ${device.model || ''}), OS: ${os.name || 'inconnu'} ${
    os.version || 'inconnu'
  }, navigateur: ${browser.name || 'inconnu'} ${browser.version || 'inconnu'}`
}

export async function findLocation(
  t: any,
  language: string,
  ip: string,
): Promise<string> {
  let location = t('auth:unkown_loc')
  try {
    const res = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,country,regionName,city,zip,lat,lon&lang=${language}`,
    )
    const data = await res.json()
    if (data.status === 'success') {
      location = `${data.city} (${data.zip}), ${data.regionName}, ${data.country}, longitude: ${data.lon}, latitude: ${data.lat}`
    }
  } catch (err) {
    console.warn('IP Geolocation error:', err)
  }
  return location
}

export async function generateTokensAndCookies(
  res: Response,
  user: IUser,
  stayLoggedIn = false,
  sessionId: string,
) {
  const accessTokenDuration = stayLoggedIn
    ? (process.env.ACCESS_TOKEN_DURATION as StringValue)
    : (process.env.ACCESS_TOKEN_DURATION_SHORT as StringValue)

  const refreshTokenDuration = stayLoggedIn
    ? (process.env.REFRESH_TOKEN_DURATION as StringValue)
    : (process.env.REFRESH_TOKEN_DURATION_SHORT as StringValue)

  const accessToken = TokenService.generateAccessToken(
    user,
    accessTokenDuration,
    sessionId,
  )

  // Refresh token
  const refreshToken = await TokenService.generateRefreshToken()
  const hashedRefreshToken = await TokenService.hashToken(refreshToken)

  // Mettre à jour la session
  const session = user.loginHistory.find((s) => s.sessionId === sessionId)
  if (session) {
    session.refreshToken = hashedRefreshToken
    session.expiresAt = new Date(Date.now() + ms(refreshTokenDuration))
  }

  const options = {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict' as const,
    maxAge: ms(accessTokenDuration),
    path: '/',
    ...(process.env.NODE_ENV === 'production' && {
      domain: process.env.DOMAIN || undefined,
    }),
  }

  res.cookie('accessToken', accessToken, options)
  res.cookie('refreshToken', refreshToken, {
    ...options,
    maxAge: ms(refreshTokenDuration),
  })
  res.cookie('sessionId', sessionId, { ...options, httpOnly: false })

  return { accessToken, refreshToken, sessionId }
}

export function generateResetToken(): string {
  return CryptoJS.lib.WordArray.random(32).toString()
}
