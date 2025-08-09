// Base response interface
interface ApiResponse<T = any> {
  success: boolean
  message?: string
  error?: string
  code?: number
  data?: T
}

// Two Factor Email responses
interface TwoFactorEmailConfigResponse {
  success: boolean
  message?: string
  error?: string
}

interface TwoFactorEmailEnableResponse {
  success: boolean
  message?: string
  backupCodes?: string[]
  preferredMethod?: 'email' | 'app' | 'webauthn'
  error?: string
}

interface TwoFactorEmailDisableResponse {
  success: boolean
  message?: string
  preferredMethod?: 'email' | 'app' | 'webauthn' | 'none'
  backupCodes?: string[]
  error?: string
}

// Two Factor App responses (existants, conservés pour référence)
interface TwoFactorAppConfigResponse {
  success: boolean
  secret?: string
  qrCode?: string
  error?: string
}

interface TwoFactorAppEnableResponse {
  success: boolean
  message?: string
  backupCodes?: string[]
  preferredMethod?: 'email' | 'app' | 'webauthn'
  error?: string
}

interface TwoFactorAppDisableResponse {
  success: boolean
  message?: string
  preferredMethod?: 'email' | 'app' | 'webauthn' | 'none'
  backupCodes?: string[]
  error?: string
}

// Auth responses
interface LoginResponse {
  success: boolean
  requiresVerification?: {
    email: string
    rememberMe: boolean
  }
  requiresTwoFactor?: {
    email: boolean
    app: boolean
    webauthn: boolean
    preferredMethod: 'email' | 'app' | 'webauthn'
  }
  error?: string
}

export type {
  ApiResponse,
  TwoFactorEmailConfigResponse,
  TwoFactorEmailEnableResponse,
  TwoFactorEmailDisableResponse,
  TwoFactorAppConfigResponse,
  TwoFactorAppEnableResponse,
  TwoFactorAppDisableResponse,
  LoginResponse,
}
