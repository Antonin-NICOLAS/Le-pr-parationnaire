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
    date: Date
  }>
  twoFactor?: {
    email?: {
      isEnabled: boolean
    }
    app: {
      isEnabled: boolean
    }
    webauthn: {
      isEnabled: boolean
    }
    preferredMethod?: 'email' | 'app' | 'webauthn' | null
  }
  role: string
  language: string
  theme: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export interface LoginCredentials {
  email: string
  password: string
  rememberMe: boolean
  onSuccess?: () => void
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
