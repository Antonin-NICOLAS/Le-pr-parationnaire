import { z } from 'zod'

import type { FormErrors, PasswordStrength } from '../types/auth'

export const validateEmail = (email: string): string | null => {
  if (!email) return 'Email is required'

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) return 'Please enter a valid email address'

  return null
}

export const validatePassword = (password: string): string | null => {
  if (!password) return 'Password is required'
  if (password.length < 8) return 'Password must be at least 8 characters long'

  return null
}

export const validateConfirmPassword = (
  password: string,
  confirmPassword: string,
): string | null => {
  if (!confirmPassword) return 'Please confirm your password'
  if (password !== confirmPassword) return 'Passwords do not match'

  return null
}

export const validateName = (
  name: string,
  fieldName: string,
): string | null => {
  if (!name) return `${fieldName} is required`
  if (name.length < 2) return `${fieldName} must be at least 2 characters long`
  if (name.length > 50) return `${fieldName} must be less than 50 characters`

  const nameRegex = /^[a-zA-Z\s'-]+$/
  if (!nameRegex.test(name)) return `${fieldName} contains invalid characters`

  return null
}

export const calculatePasswordStrength = (
  password: string,
): PasswordStrength => {
  if (!password) {
    return {
      score: 0,
      level: 'very-weak',
      requirements: {
        length: false,
        lowercase: false,
        uppercase: false,
        number: false,
        special: false,
        sequential: true,
      },
    }
  }

  const requirements = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^a-zA-Z0-9]/.test(password),
    sequential:
      !/(012|123|234|345|456|567|678|789|890|abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i.test(
        password,
      ),
  }

  let score = 0
  let bonusPoints = 0

  // Base requirements (15 points each)
  if (requirements.length) score += 15
  if (requirements.lowercase) score += 15
  if (requirements.uppercase) score += 15
  if (requirements.number) score += 15
  if (requirements.special) score += 15

  // Bonus points for additional security
  if (password.length >= 12) bonusPoints += 10
  if (password.length >= 16) bonusPoints += 5
  if (requirements.sequential) bonusPoints += 5
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) bonusPoints += 5

  // Penalty for common patterns
  if (
    /(password|123456|000000|qwerty|azerty|abc123|admin|user)/i.test(password)
  ) {
    score -= 20
  }

  score = Math.min(score + bonusPoints, 100)
  score = Math.max(score, 0)

  let level: PasswordStrength['level'] = 'very-weak'
  if (score >= 85) level = 'very-strong'
  else if (score >= 70) level = 'strong'
  else if (score >= 50) level = 'medium'
  else if (score >= 25) level = 'weak'

  return {
    score,
    level,
    requirements,
  }
}

export const validateRegistrationForm = (data: {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
  acceptTerms: boolean
}): FormErrors => {
  const errors: FormErrors = {}

  if (
    !data.firstName ||
    !data.lastName ||
    !data.email ||
    !data.password ||
    !data.confirmPassword
  ) {
    errors.name = 'Please fill in all fields'
  }

  const firstNameError = validateName(data.firstName, 'First name')
  if (firstNameError) errors.firstName = firstNameError

  const lastNameError = validateName(data.lastName, 'Last name')
  if (lastNameError) errors.lastName = lastNameError

  const emailError = validateEmail(data.email)
  if (emailError) errors.email = emailError

  const passwordError = validatePassword(data.password)
  if (passwordError) errors.password = passwordError

  const confirmPasswordError = validateConfirmPassword(
    data.password,
    data.confirmPassword,
  )
  if (confirmPasswordError) errors.confirmPassword = confirmPasswordError

  if (!data.acceptTerms) {
    errors.acceptTerms = 'Please accept the terms of service'
  }

  return errors
}

// Zod schemas for comprehensive validation
export const emailSchema = z
  .string()
  .toLowerCase()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character')

export const nameSchema = z
  .string()
  .min(3, 'Name must be at least 3 characters long')
  .max(30, 'Name must be less than 30 characters')
  .regex(/^[a-zA-Z\s'-]+$/, 'Name contains invalid characters')

export const registrationSchema = z
  .object({
    firstName: nameSchema,
    lastName: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    acceptTerms: z
      .boolean()
      .refine((val) => val === true, 'Please accept the terms of service'),
    rememberMe: z.boolean().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
})

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

// Validation helper function
export const validateWithSchema = <T>(
  schema: z.ZodSchema<T>,
  data: any,
): {
  success: boolean
  data?: T
  errors?: Record<string, string>
} => {
  try {
    const validatedData = schema.parse(data)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {}
      error.issues.forEach((err) => {
        if (err.path.length > 0) {
          errors[err.path[0] as string] = err.message
        }
      })
      return { success: false, errors }
    }
    return { success: false, errors: { general: 'Validation failed' } }
  }
}

export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .trim()
}

export const validateVerificationCode = (code: string): string | null => {
  if (!code) return 'Verification code is required'
  if (code.length !== 6) return 'Verification code must be 6 digits'
  if (!/^\d{6}$/.test(code))
    return 'Verification code must contain only numbers'

  return null
}

export const validateBackupCode = (code: string): string | null => {
  if (!code) return 'Backup code is required'
  if (code.length !== 8) return 'Backup code must be 8 characters'
  if (!/^[a-zA-Z0-9]{8}$/.test(code)) return 'Invalid backup code format'

  return null
}
