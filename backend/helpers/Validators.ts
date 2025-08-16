import { z } from 'zod'

// Email
export const emailSchema = z
  .string()
  .toLowerCase()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')

// Password
export const passwordSchema = z
  .string()
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character')
  .min(8, 'Password must be at least 8 characters long')

// Name
export const nameSchema = z
  .string()
  .regex(/^[a-zA-Z\s'-]+$/, 'Name contains invalid characters')
  .min(3, 'Name must be at least 3 characters long')
  .max(30, 'Name must be less than 30 characters')

// 6-digit verification code
export const verificationCodeSchema = z
  .string()
  .length(6, 'Verification code must be 6 digits')

export const backupCodeSchema = z
  .string()
  .toUpperCase()
  .regex(/^[a-zA-Z0-9]{8}$/, 'Invalid backup code format')
  .length(8, 'Backup code must be 8 characters')

// Login
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean(),
})

// Inscription
export const registrationSchema = z
  .object({
    firstName: nameSchema,
    lastName: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
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

export const resetPasswordSchema = z
  .object({
    email: emailSchema,
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const sixDigitCodeSchema = z.object({
  code: verificationCodeSchema,
})

// Validation des schémas
export function validateName(name: string) {
  return nameSchema.safeParse(name).success
}

export function validateEmail(email: string) {
  return emailSchema.safeParse(email).success
}

export function validatePassword(password: string) {
  return passwordSchema.safeParse(password).success
}

export function validate6DigitCode(code: string) {
  return verificationCodeSchema.safeParse(code).success
}
