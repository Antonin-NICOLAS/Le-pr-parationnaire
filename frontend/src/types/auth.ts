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
