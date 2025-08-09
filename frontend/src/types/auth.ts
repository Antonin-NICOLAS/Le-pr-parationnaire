export interface User {
  id: string
  lastName: string
  firstName: string
  avatarUrl?: string
  email: string
  lastLogin?: Date
  loginHistory?: Array<{
    ip: string
    userAgent: string
    location: string
    lastActive: Date
  }>
  twoFactor?: {
    isEnabled: boolean
    email?: {
      isEnabled: boolean
    }
    app?: {
      isEnabled: boolean
    }
    webauthn?: {
      isEnabled: boolean
      credentials?: Array<{
        id: string
        deviceName: string
        deviceType: string
        lastUsed: Date
        createdAt: Date
      }>
    }
    preferredMethod?: 'email' | 'app' | 'webauthn' | 'none'
    backupCodes?: Array<{
      code: string
      used: boolean
    }>
  }
  role: string
  language: string
  theme: string
}

export interface Session {
  sessionId: string
  ip: string
  location: string
  device: string
  deviceType: string
  browser: string
  os: string
  lastActive: Date
  isCurrent: boolean
}

export interface LoginData {
  email: string
  password: string
  rememberMe: boolean
}

export interface RegisterData {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
  acceptTerms: boolean
  rememberMe: boolean
  onSuccess?: () => void
}

export interface PasswordStrength {
  score: number
  level: 'very-weak' | 'weak' | 'medium' | 'strong' | 'very-strong'
  requirements: {
    length: boolean
    lowercase: boolean
    uppercase: boolean
    number: boolean
    special: boolean
    sequential: boolean
  }
}

export interface ChangePassword {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface FormErrors {
  [key: string]: string
}
