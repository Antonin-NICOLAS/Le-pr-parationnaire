import { ArrowLeft, Mail, RefreshCw } from 'lucide-react'
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import CustomInput from '../../components/ui/CustomInput'
import PrimaryButton from '../../components/ui/PrimaryButton'
import AuthLayout from '../../layouts/AuthLayout'
import ErrorMessage from '../../components/ui/ErrorMessage'
import useForgotPassword from '../../hooks/Auth/useForgotPassword'
import { useFormHandler } from '../../hooks/useFormHandler'
import { emailFormSchema } from '../../utils/validation'
import ResendSection from '../../components/ui/ResendSection'

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate()
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
  const form = useFormHandler({
    initialValues: {
      email: '',
    },
    validationSchema: emailFormSchema,
    validateOnChange: true,
    validateOnBlur: false,
  })

  const handleSubmit = async (values: { email: string }) => {
    if (!form.validateForm()) return
    forgotPasswordState.resetError()
    resendForgotPasswordState.resetError()
    const result = await forgotPassword(values.email)
    if (result.success) {
      setIsSubmitted(true)
      setCanResend(false)
    }
  }

  const handleResend = async () => {
    if (!form.validateForm()) return
    resendForgotPasswordState.resetError()
    if (!canResend) return
    const result = await resendForgotPassword(form.values.email)
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
        subtitle={`We've sent password reset instructions to ${form.values.email}`}
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

          <ResendSection
            countdownSeconds={60}
            icon={RefreshCw}
            onResend={handleResend}
            loading={resendForgotPasswordState.loading}
            variant='block'
            align='center'
          />

          {/* Back to login */}
          <div className='border-deg-gray-200 border-t pt-4'>
            <Link
              to='/auth/login'
              className='inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium transition-colors'
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
      {errorMessage && (
        <ErrorMessage
          message={errorMessage}
          type='error'
          onClose={() => {
            forgotPasswordState.resetError()
            resendForgotPasswordState.resetError()
          }}
        />
      )}
      <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>
        <CustomInput
          id='forgot-email'
          type='email'
          label='Email Address'
          placeholder='Enter your email address'
          value={form.values.email}
          onChange={(e) => form.handleChange('email', e.target.value)}
          error={
            form.touched.email && form.values.email
              ? form.errors.email
              : undefined
          }
          icon={Mail}
          required
          autoComplete='email'
          autoFocus
          disabled={
            forgotPasswordState.loading || resendForgotPasswordState.loading
          }
          onBlur={() => form.handleBlur('email')}
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
          <ErrorMessage
            type='info'
            title='Security Note:'
            message="For security reasons, we'll send reset instructions to your email
              even if the account doesn't exist."
          />
        </div>
      </form>
    </AuthLayout>
  )
}

export default ForgotPasswordPage
