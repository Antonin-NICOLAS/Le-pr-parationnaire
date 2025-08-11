import speakeasy from 'speakeasy'
import QRCode from 'qrcode'
import CryptoJS from 'crypto-js'
import bcrypt from 'bcrypt'
import { IUser, BackupCode } from '../models/User.js'

export function generateTwoFactorSecret() {
  return speakeasy.generateSecret({ name: 'Le préparationnaire', length: 20 })
}

export async function hashEmailCode(code: string) {
  return await bcrypt.hash(code, 12)
}

export async function compareEmailCode(hashedCode: string, plainCode: string) {
  return await bcrypt.compare(plainCode, hashedCode)
}

export async function generateQRCode(secret: speakeasy.GeneratedSecret) {
  try {
    return await QRCode.toDataURL(secret.otpauth_url!)
  } catch (error) {
    console.error('Erreur QR code:', error)
    throw error
  }
}

export function verifyTwoFactorCode(secret: string, token: string) {
  if (!token || token.length !== 6 || !/^\d+$/.test(token)) {
    return false
  }

  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 2,
  })
}

export function generateBackupCodes(count = 8): BackupCode[] {
  const codes: BackupCode[] = []
  for (let i = 0; i < count; i++) {
    const hash = CryptoJS.SHA256(
      Date.now().toString() + Math.random().toString(),
    )
      .toString(CryptoJS.enc.Hex)
      .toUpperCase()
    codes.push({ code: hash.substring(0, 8), used: false })
  }
  return codes
}

export function rotateBackupCodes(user: IUser) {
  const unusedCodes = user.twoFactor.backupCodes.filter((c) => !c.used)
  const newCodes = generateBackupCodes(8 - unusedCodes.length)
  user.twoFactor.backupCodes = [...unusedCodes, ...newCodes]
}

export function verifyBackupCode(user: IUser, code: string) {
  const backupCode = user.twoFactor.backupCodes.find(
    (bc) => bc.code === code && !bc.used,
  )
  if (backupCode) {
    backupCode.used = true
    return true
  }
  return false
}

export function validatePreferredMethod(
  method: string,
): method is 'app' | 'email' | 'webauthn' {
  return ['app', 'email', 'webauthn'].includes(method)
}

export function validateSixDigitCode(code: string): boolean {
  return Boolean(code && code.length === 6 && /^\d+$/.test(code))
}

export function isCodeExpired(expiration: Date): boolean {
  return expiration < new Date()
}

export function generateSecureCode(): string {
  // Utiliser Math.random pour une meilleure compatibilité
  const min = 100000
  const max = 999999
  return String(Math.floor(Math.random() * (max - min + 1)) + min)
}

export default {
  generateTwoFactorSecret,
  hashEmailCode,
  compareEmailCode,
  generateQRCode,
  verifyTwoFactorCode,
  generateBackupCodes,
  rotateBackupCodes,
  verifyBackupCode,
  validatePreferredMethod,
  validateSixDigitCode,
  isCodeExpired,
  generateSecureCode,
}
