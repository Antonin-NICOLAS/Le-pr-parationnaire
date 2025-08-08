import speakeasy from 'speakeasy'
import QRCode from 'qrcode'
import CryptoJS from 'crypto-js'
import bcrypt from 'bcryptjs'
import { IUser } from '../models/User'

type BackupCode = { code: string; used: boolean }

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

export default {
  generateTwoFactorSecret,
  hashEmailCode,
  compareEmailCode,
  generateQRCode,
  verifyTwoFactorCode,
  generateBackupCodes,
  rotateBackupCodes,
  verifyBackupCode,
}
