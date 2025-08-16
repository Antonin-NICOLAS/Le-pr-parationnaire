export interface SecurityQuestion {
  id: string
  question: string
  answer?: string
}

// Types pour les méthodes 2FA
export interface TwoFactorMethod {
  isEnabled?: boolean
  preferredMethod?: 'email' | 'app' | 'webauthn' | 'none'
}

export interface EmailTwoFactor {
  isEnabled: boolean
}

export interface AppTwoFactor {
  isEnabled: boolean
  secret?: string
}

export interface WebAuthnCredential {
  id: string
  deviceType?: string
  deviceName?: string
  lastUsed?: Date
  createdAt?: Date
}

export interface WebauthnTwoFactor {
  isEnabled: boolean
  credentials?: Array<WebAuthnCredential>
}

export interface TwoFactorStatus {
  isEnabled: boolean
  email: EmailTwoFactor
  app: AppTwoFactor
  webauthn: WebauthnTwoFactor
  preferredMethod: 'email' | 'app' | 'webauthn' | 'none'
  backupCodes?: Array<{
    code: string
    used: boolean
  }>
  securityQuestions?: Array<SecurityQuestion>
}

export interface LoginHistory {
  sessionId: string
  ip?: string
  userAgent?: string
  location?: string
  deviceType?: string
  deviceName?: string
  browser?: string
  os?: string
  lastActive?: Date
  expiresAt?: Date
  isCurrent?: boolean
}

export interface User {
  id: string
  lastName: string
  firstName: string
  avatarUrl?: string
  email: string
  lastLogin?: Date
  loginHistory?: Array<LoginHistory>
  twoFactor?: TwoFactorStatus
  role: string
  language: string
  theme: string
}
