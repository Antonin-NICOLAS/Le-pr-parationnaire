import { z } from 'zod'
import type { PasswordStrength } from '../types/auth'

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

// Zod schemas for validation
export const emailSchema = z
  .string()
  .toLowerCase()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')

export const passwordSchema = z
  .string()
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character')
  .min(8, 'Password must be at least 8 characters long')

export const nameSchema = z
  .string()
  .regex(/^[a-zA-Z\s'-]+$/, 'Name contains invalid characters')
  .min(3, 'Name must be at least 3 characters long')
  .max(30, 'Name must be less than 30 characters')

export const verificationCodeSchema = z
  .array(z.string().regex(/^\d$/, 'Must be a single digit'))
  .length(6, 'Verification code must be 6 digits')

export const backupCodeSchema = z
  .string()
  .toUpperCase()
  .regex(/^[a-zA-Z0-9]{8}$/, 'Invalid backup code format')
  .length(8, 'Backup code must be 8 characters')

// Form schemas to use with form handler

export const loginStep1Schema = z.object({
  email: emailSchema,
  password: z.string().optional(),
  rememberMe: z.boolean(),
})

export const loginStep2Schema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean(),
})

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
    rememberMe: z.boolean(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const emailVerificationSchema = z.object({
  email: emailSchema,
  token: verificationCodeSchema,
  rememberMe: z.boolean(),
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

export const emailFormSchema = z.object({
  email: emailSchema,
})

export const resetPasswordSchema = z
  .object({
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const changeEmailSchema = z.object({
  currentEmailCode: verificationCodeSchema,
  newEmail: emailSchema,
  newEmailCode: verificationCodeSchema,
})
