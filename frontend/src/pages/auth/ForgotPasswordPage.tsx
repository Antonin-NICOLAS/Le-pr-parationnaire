import { ArrowLeft, Mail } from 'lucide-react'
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import CountdownTimer from '../../components/ui/CountdownTimer'
import CustomInput from '../../components/ui/CustomInput'
import PrimaryButton from '../../components/ui/PrimaryButton'
import AuthLayout from '../../layouts/AuthLayout'
import { validateEmail } from '../../utils/validation'
import ErrorMessage from '../../components/ui/ErrorMessage'
import useForgotPassword from '../../hooks/Auth/useForgotPassword'

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [canResend, setCanResend] = useState(false)
  const {
    forgotPassword,
    forgotPasswordState,
    resendForgotPassword,
    resendForgotPasswordState,
  } = useForgotPassword()
  const errorMessage =
    forgotPasswordState.error || resendForgotPasswordState.error

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const emailError = validateEmail(email)
    if (emailError) {
      setError(emailError)
      return
    }
    const result = await forgotPassword(email)
    if (result.success) {
      setIsSubmitted(true)
      setCanResend(false)
    }
  }

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!canResend) return
    const result = await resendForgotPassword(email)
    if (result.success) {
      setCanResend(false)
    }
  }

  const handleBack = () => {
    navigate('/auth/login')
  }

  if (isSubmitted) {
    return (
      <AuthLayout
        title='Check Your Email'
        subtitle={`We've sent password reset instructions to ${email}`}
        showBackButton
        onBack={handleBack}
      >
        <div className='space-y-6 text-center'>
          {/* Email sent icon */}
          <div className='bg-primary-100 mx-auto flex h-16 w-16 items-center justify-center rounded-full'>
            <Mail className='text-primary-600 h-8 w-8' />
          </div>

          <div className='space-y-4'>
            <p className='text-deg-gray-600'>
              If an account with that email exists, you'll receive password
              reset instructions shortly.
            </p>

            <div className='bg-deg-gray-50 border-deg-gray-200 rounded-lg border p-4'>
              <h3 className='text-deg-gray-900 mb-2 font-medium'>
                What's next?
              </h3>
              <ul className='text-deg-gray-600 space-y-1 text-left text-sm'>
                <li>• Check your email inbox</li>
                <li>• Look for an email from our team</li>
                <li>• Click the reset link in the email</li>
                <li>• Create your new password</li>
              </ul>
            </div>
          </div>

          {/* Resend section */}
          <div className='space-y-3'>
            <p className='text-deg-gray-600 text-sm'>
              Didn't receive the email?
            </p>

            {!canResend ? (
              <div className='flex items-center justify-center gap-2'>
                <span className='text-deg-gray-500 text-sm'>
                  Resend available in
                </span>
                <CountdownTimer
                  initialSeconds={60}
                  onComplete={() => setCanResend(true)}
                  showIcon={false}
                />
              </div>
            ) : (
              <PrimaryButton
                variant='outline'
                onClick={handleResend}
                loading={resendForgotPasswordState.loading}
                disabled={!canResend || resendForgotPasswordState.loading}
              >
                Resend Email
              </PrimaryButton>
            )}
          </div>

          {/* Back to login */}
          <div className='border-deg-gray-200 border-t pt-4'>
            <Link
              to='/auth/login'
              className='text-primary-600 hover:text-primary-700 inline-flex items-center gap-2 text-sm transition-colors'
            >
              <ArrowLeft size={16} />
              Back to Sign In
            </Link>
          </div>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title='Forgot Password?'
      subtitle="Enter your email address and we'll send you instructions to reset your password"
      showBackButton
      onBack={handleBack}
    >
      {errorMessage !== null && (
        <ErrorMessage
          message={errorMessage}
          type='error'
          onClose={() => {
            forgotPasswordState.resetError()
            resendForgotPasswordState.resetError()
          }}
        />
      )}
      <form onSubmit={handleSubmit} className='space-y-6'>
        <CustomInput
          id='forgot-email'
          type='email'
          label='Email Address'
          placeholder='Enter your email address'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={error ?? undefined}
          icon={Mail}
          autoComplete='email'
          autoFocus
          required
        />

        <PrimaryButton
          type='submit'
          loading={forgotPasswordState.loading}
          disabled={forgotPasswordState.loading}
          fullWidth
          size='lg'
        >
          Send Reset Instructions
        </PrimaryButton>

        {/* Help text */}
        <div className='space-y-4 text-center'>
          <p className='text-deg-gray-600 text-sm'>
            Remember your password?{' '}
            <Link
              to='/auth'
              className='text-primary-600 hover:text-primary-700 font-medium transition-colors'
            >
              Back to Sign In
            </Link>
          </p>

          <div className='text-deg-gray-500 bg-deg-gray-50 border-deg-gray-200 rounded-lg border p-3 text-xs'>
            <p className='mb-1 font-medium'>Security Note:</p>
            <p>
              For security reasons, we'll send reset instructions to your email
              even if the account doesn't exist.
            </p>
          </div>
        </div>
      </form>
    </AuthLayout>
  )
}

export default ForgotPasswordPage
