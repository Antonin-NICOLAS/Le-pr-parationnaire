import { CheckCircle, Lock } from 'lucide-react'
import type React from 'react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import CustomInput from '../../components/ui/CustomInput'
import ErrorMessage from '../../components/ui/ErrorMessage'
import PasswordStrengthMeter from '../../components/ui/PasswordStrengthMeter'
import PrimaryButton from '../../components/ui/PrimaryButton'
import AuthLayout from '../../layouts/AuthLayout'
import type { PasswordStrength } from '../../types/auth'

const ResetPasswordPage: React.FC = () => {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tokenValid, setTokenValid] = useState<boolean | null>(null)
  const [passwordStrength, setPasswordStrength] =
    useState<PasswordStrength | null>(null)

  // Mock token validation
  useEffect(() => {
    const validateToken = async () => {
      try {
        // Simulate token validation
        await new Promise((resolve) => setTimeout(resolve, 1000))
        setTokenValid(true)
      } catch (error) {
        setTokenValid(false)
        setError('This password reset link is invalid or has expired.')
      }
    }

    validateToken()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!password || !confirmPassword) {
      setError('Please fill in all fields')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (passwordStrength && passwordStrength.score < 70) {
      setError('Please choose a stronger password')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      setIsSuccess(true)
      toast.success('Password reset successfully!')
    } catch (error) {
      setError('Failed to reset password. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  if (tokenValid === null) {
    return (
      <AuthLayout
        title='Validating Reset Link'
        subtitle='Please wait while we validate your reset link...'
      >
        <div className='flex justify-center py-8'>
          <div className='border-primary-600 h-8 w-8 animate-spin rounded-full border-b-2'></div>
        </div>
      </AuthLayout>
    )
  }

  if (tokenValid === false) {
    return (
      <AuthLayout
        title='Invalid Reset Link'
        subtitle='This password reset link is invalid or has expired'
      >
        <div className='space-y-6'>
          <div className='flex justify-center'>
            <div className='flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20'>
              <Lock className='h-8 w-8 text-red-600 dark:text-red-400' />
            </div>
          </div>

          <ErrorMessage
            message='This password reset link is invalid or has expired. Please request a new one.'
            type='error'
          />

          <PrimaryButton
            onClick={() => console.log('Navigate to forgot password')}
            fullWidth
            size='lg'
          >
            Request New Reset Link
          </PrimaryButton>
        </div>
      </AuthLayout>
    )
  }

  if (isSuccess) {
    return (
      <AuthLayout
        title='Password Reset Successful'
        subtitle='Your password has been successfully reset'
      >
        <div className='space-y-6'>
          <div className='flex justify-center'>
            <div className='flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20'>
              <CheckCircle className='h-8 w-8 text-green-600 dark:text-green-400' />
            </div>
          </div>

          <div className='space-y-4 text-center'>
            <p className='text-gray-600 dark:text-gray-400'>
              You can now sign in with your new password.
            </p>

            <PrimaryButton
              onClick={() => console.log('Navigate to login')}
              fullWidth
              size='lg'
            >
              Sign In
            </PrimaryButton>
          </div>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title='Reset Your Password'
      subtitle='Enter your new password below'
    >
      <div className='space-y-6'>
        <div className='flex justify-center'>
          <div className='bg-primary-100 dark:bg-primary-900/20 flex h-16 w-16 items-center justify-center rounded-full'>
            <Lock className='text-primary-600 dark:text-primary-400 h-8 w-8' />
          </div>
        </div>

        {error && (
          <ErrorMessage
            message={error}
            type='error'
            onClose={() => setError(null)}
          />
        )}

        <form onSubmit={handleSubmit} className='space-y-6'>
          <CustomInput
            type='password'
            label='New Password'
            placeholder='Enter your new password'
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setPassword(e.target.value)
            }
            icon={Lock}
            required
            autoComplete='new-password'
            autoFocus
          />

          {password && (
            <PasswordStrengthMeter
              password={password}
              onStrengthChange={setPasswordStrength}
            />
          )}

          <CustomInput
            type='password'
            label='Confirm New Password'
            placeholder='Confirm your new password'
            value={confirmPassword}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setConfirmPassword(e.target.value)
            }
            icon={Lock}
            required
            autoComplete='new-password'
          />

          <PrimaryButton type='submit' loading={isLoading} fullWidth size='lg'>
            Reset Password
          </PrimaryButton>
        </form>
      </div>
    </AuthLayout>
  )
}

export default ResetPasswordPage
