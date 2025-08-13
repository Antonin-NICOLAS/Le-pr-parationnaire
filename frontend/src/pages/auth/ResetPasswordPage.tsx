import { CheckCircle, Lock } from 'lucide-react'
import type React from 'react'
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useFormHandler } from '../../hooks/useFormHandler'
import { resetPasswordSchema } from '../../utils/validation'
import CustomInput from '../../components/ui/CustomInput'
import ErrorMessage from '../../components/ui/ErrorMessage'
import PasswordStrengthMeter from '../../components/ui/PasswordStrengthMeter'
import PrimaryButton from '../../components/ui/PrimaryButton'
import useForgotPassword from '../../hooks/Auth/useForgotPassword'
import AuthLayout from '../../layouts/AuthLayout'

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate()
  const [isSuccess, setIsSuccess] = useState(false)
  const [tokenValid, setTokenValid] = useState<boolean | null>(true)
  const { verifyToken, verifyTokenState, resetPassword, resetPasswordState } =
    useForgotPassword()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const email = searchParams.get('email')
  const form = useFormHandler({
    initialValues: {
      newPassword: '',
      confirmPassword: '',
    },
    validationSchema: resetPasswordSchema,
    validateOnChange: true,
    validateOnBlur: false,
  })

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setTokenValid(false)
        return
      }
      const result = await verifyToken(token)
      if (result.success) {
        setTokenValid(true)
      } else {
        setTokenValid(false)
      }
    }

    validateToken()
  }, [])

  const handleSubmit = async (values: { newPassword: string }) => {
    const result = await resetPassword(email, token, values.newPassword)
    if (result.success) {
      setIsSuccess(true)
    }
  }

  if (tokenValid === null || verifyTokenState.loading) {
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
            onClick={() => navigate('/forgot-password')}
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
              onClick={() => navigate('/auth/login')}
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
      showBackButton={true}
      onBack={() => navigate('/auth/login')}
    >
      <div className='space-y-6'>
        <div className='flex justify-center'>
          <div className='bg-primary-100 dark:bg-primary-900/20 flex h-16 w-16 items-center justify-center rounded-full'>
            <Lock className='text-primary-600 dark:text-primary-400 h-8 w-8' />
          </div>
        </div>
        {verifyTokenState.data && verifyTokenState.data.user && (
          <p className='mb-4 text-gray-700 dark:text-gray-400'>
            Hello{' '}
            <strong>
              {verifyTokenState.data.user.firstName}{' '}
              {verifyTokenState.data.user.lastName}
            </strong>
            , choose a new password for your account.
          </p>
        )}

        <form
          onSubmit={(e) => form.handleSubmit(handleSubmit)(e)}
          className='space-y-6'
        >
          <CustomInput
            type='password'
            label='New Password'
            placeholder='Enter your new password'
            value={form.values.newPassword}
            onChange={(e) => form.handleChange('newPassword', e.target.value)}
            error={
              form.touched.newPassword && form.values.newPassword
                ? form.errors.newPassword
                : undefined
            }
            icon={Lock}
            required
            autoComplete='new-password'
            autoFocus
            disabled={resetPasswordState.loading}
            onBlur={() => form.handleBlur('newPassword')}
          />

          {form.values.newPassword && (
            <PasswordStrengthMeter
              password={form.values.newPassword}
              onStrengthChange={() => {}}
            />
          )}

          {form.errors.confirmPassword && form.values.confirmPassword && (
            <div
              className={`text-sm ${
                form.values.newPassword === form.values.confirmPassword
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}
            >
              {form.values.newPassword === form.values.confirmPassword
                ? '✓ Passwords match'
                : '✗ Passwords do not match'}
            </div>
          )}

          <CustomInput
            type='password'
            label='Confirm New Password'
            placeholder='Confirm your new password'
            value={form.values.confirmPassword}
            onChange={(e) =>
              form.handleChange('confirmPassword', e.target.value)
            }
            error={
              form.touched.confirmPassword && form.values.confirmPassword
                ? form.errors.confirmPassword
                : undefined
            }
            icon={Lock}
            required
            autoComplete='new-password'
            autoFocus
            disabled={resetPasswordState.loading}
            onBlur={() => form.handleBlur('confirmPassword')}
          />

          <PrimaryButton
            type='submit'
            loading={resetPasswordState.loading}
            fullWidth
            size='lg'
          >
            Reset Password
          </PrimaryButton>
        </form>
      </div>
    </AuthLayout>
  )
}

export default ResetPasswordPage
