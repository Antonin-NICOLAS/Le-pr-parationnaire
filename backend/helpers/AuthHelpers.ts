import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import CryptoJS from 'crypto-js'
import { UAParser } from 'ua-parser-js'
import ms, { StringValue } from 'ms'
import { v4 as uuidv4 } from 'uuid'
import { Response } from 'express'
import type { SignOptions } from 'jsonwebtoken'
import type { IUser } from '../models/User.js'

export async function handleUnverifiedUser(user: IUser) {
  if (
    !user.emailVerification.token ||
    isTokenExpired(user.emailVerification.expiration)
  ) {
    user.emailVerification.token = generateVerificationCode()
    user.emailVerification.expiration = new Date(
      Date.now() + 24 * 60 * 60 * 1000,
    )
    await user.save()
  }
}

function isTokenExpired(expiration?: Date): boolean {
  return !expiration || expiration < new Date()
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

  return `Appareil: ${device.type || 'inconnu'} (${device.vendor || ''} ${
    device.model || ''
  }), OS: ${os.name} ${os.version}, navigateur: ${browser.name} ${
    browser.version
  }`
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

export function generateToken(
  user: IUser,
  duration: StringValue,
  sessionId: string,
) {
  const payload = {
    jti: sessionId,
    id: user._id,
    email: user.email,
    role: user.role,
    tokenVersion: user.tokenVersion,
  }

  const options: SignOptions = {
    expiresIn: ms(duration),
    algorithm: 'HS256',
  }

  return jwt.sign(payload, process.env.JWT_SECRET as string, options)
}

export function generateCookie(
  res: Response,
  user: IUser,
  stayLoggedIn = false,
  sessionId: string,
) {
  const duration: StringValue = stayLoggedIn
    ? (process.env.SESSION_DURATION_LONG! as StringValue)
    : (process.env.SESSION_DURATION_SHORT! as StringValue)

  const finalSessionId = sessionId || uuidv4()
  const token = generateToken(user, duration, finalSessionId)

  const options = {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict' as const,
    maxAge: ms(duration),
    path: '/',
    ...(process.env.NODE_ENV === 'production' && {
      domain: process.env.FRONTEND_SERVER || undefined,
    }),
  }

  res.cookie('jwtauth', token, options)
  res.cookie('sessionId', finalSessionId, { ...options, httpOnly: false })

  return { token, sessionId: finalSessionId }
}

export function generateVerificationCode(): string {
  return CryptoJS.lib.WordArray.random(6).toString().slice(0, 6).toUpperCase()
}

export function generateResetToken(): string {
  return CryptoJS.lib.WordArray.random(32).toString()
}
