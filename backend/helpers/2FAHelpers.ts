import speakeasy from 'speakeasy'
import QRCode from 'qrcode'
import crypto from 'crypto'
import bcrypt from 'bcrypt'
import { IUser, BackupCode } from '../models/User.js'
import { TFunction } from 'i18next'

// APP
export function generateTwoFactorSecret() {
  return speakeasy.generateSecret({ name: 'Le préparationnaire', length: 20 })
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

// EMAIL
export function generateSecureCode(): string {
  return String(crypto.randomInt(100000, 999999))
}
export async function hashEmailCode(code: string) {
  return await bcrypt.hash(code, 12)
}

export async function compareEmailCode(hashedCode: string, plainCode: string) {
  return await bcrypt.compare(plainCode, hashedCode)
}

export function isCodeExpired(expiration: Date): boolean {
  return expiration < new Date()
}

// BACKUP CODES
export function rotateBackupCodes(user: IUser): BackupCode[] {
  const activeCodes = user.twoFactor.backupCodes
    .filter((c) => !c.used)
    .slice(0, 4)

  const neededCodes = 8 - activeCodes.length
  return [
    ...activeCodes,
    ...(neededCodes > 0 ? generateBackupCodes(neededCodes) : []),
  ]
}

export function generateBackupCodes(count: number): BackupCode[] {
  return Array.from({ length: count }, () => ({
    code: crypto.randomBytes(4).toString('hex').toUpperCase(),
    used: false,
  }))
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

type MethodType = 'password' | 'email' | 'app' | 'webauthn' | 'backup_code'
export function getErrorMessageForMethod(
  method: MethodType,
  t: TFunction,
): string {
  const messages = {
    password: t('auth:errors.password_incorrect'),
    email: t('auth:errors.2fa.invalid_code'),
    app: t('auth:errors.2fa.invalid_code'),
    webauthn: t('auth:errors.webauthn.authentication'),
    backup_code: t('auth:errors.2fa.invalid_backup_code'),
  }
  return messages[method] || t('auth:errors.2fa.invalid_method')
}

export async function verifySecondFactor(
  user: any,
  method: string,
  value: string,
  t: TFunction,
): Promise<{ valid: boolean; errorMessage: string }> {
  switch (method) {
    case 'app':
      if (!user.twoFactor?.app?.isEnabled || !user.twoFactor.app.secret) {
        return {
          valid: false,
          errorMessage: t('auth:errors.2fa.invalid_method'),
        }
      }
      return {
        valid: verifyTwoFactorCode(user.twoFactor.app.secret, value),
        errorMessage: t('auth:errors.2fa.invalid_code'),
      }

    case 'email':
      if (
        !user.twoFactor?.email?.isEnabled ||
        !user.twoFactor.email.token ||
        !user.twoFactor.email.expiration
      ) {
        return {
          valid: false,
          errorMessage: t('auth:errors.2fa.setup_required'),
        }
      }
      if (isCodeExpired(user.twoFactor.email.expiration)) {
        return { valid: false, errorMessage: t('auth:errors.2fa.code_expired') }
      }
      return {
        valid: await compareEmailCode(user.twoFactor.email.token, value),
        errorMessage: t('auth:errors.2fa.invalid_code'),
      }

    case 'backup_code':
      const codeIndex = (user.twoFactor.backupCodes || []).findIndex(
        (c: BackupCode) => c.code === value && !c.used,
      )
      return {
        valid: codeIndex !== -1,
        errorMessage: t('auth:errors.2fa.invalid_backup_code'),
      }

    default:
      return { valid: false, errorMessage: t('auth:errors.2fa.invalid_method') }
  }
}
