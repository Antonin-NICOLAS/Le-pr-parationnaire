export interface CheckAuthResponse {
  user?: {
    id: string
    email: string
    lastName: string
    firstName: string
    language: string
    theme: string
    role: 'admin' | 'user'
  }
}

export interface CheckAuthStatusResponse {
  webauthn: boolean
}

export interface LoginData {
  email: string
  password: string
  rememberMe: boolean
}

export interface LoginResponse {
  requiresTwoFactor?: boolean
  twoFactor?: {
    email: boolean
    app: boolean
    webauthn: boolean
    preferredMethod: 'email' | 'app' | 'webauthn' | 'none'
  }
}

export interface RegisterData {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
  acceptTerms: boolean
  rememberMe: boolean
}

export interface RegisterResponse {
  requiresVerification: boolean
  email: string
  rememberMe: boolean
}

export interface EmailVerificationData {
  token: string
  email: string
  rememberMe: boolean
}

export interface ChangePassword {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface ForgotPassword {
  email: string
}

export interface ResetPassword {
  newPassword: string
  confirmPassword: string
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
